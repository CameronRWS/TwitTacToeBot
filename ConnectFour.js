const readline = require('readline');
const Twit = require('twit');
var config = require('./config')
var Jimp = require("jimp");
var fs = require('fs');
var T = new Twit(config);


var stream = T.stream('user');
stream.on('tweet', tweetEvent);

var from, text, replyto, idOfTweet, playerOne, playerTwo, isGameStarted, whoseTurn, items, tweetText, countOfAts, countOfExPoints, gameID;
clearVariables();

function tweetEvent(eventMsg)
{
	from = eventMsg.user.screen_name;
	text = eventMsg.text;
    replyto = eventMsg.in_reply_to_screen_name;
    idOfTweet = eventMsg.id_str;

    countOfAts = text.split("@").length - 1;
    countOfExPoints = text.split("!").length - 1;
    if(replyto == "penzabot" && from != "penzabot")
    {
        if(text.indexOf("!StartGame") != -1)
        {
            checkStartGameCommand();
            outputBoard(items);
            replyWithTweetTextAndBoard();
        }
        else if(from == playerOne || from == playerTwo && text.indexOf("!1") != -1 || text.indexOf("!2") != -1 || text.indexOf("!3") != -1 || text.indexOf("!4") != -1 || text.indexOf("!5" )  != -1  || text.indexOf("!6") != -1 || text.indexOf("!7") != -1)
        {
            if(from == whoseTurn)
            {
                console.log("command received")
                playLocation();
            }
            else
            {
                tweetText = "@" + from + " It's not your turn. Game ID: " + gameID;
                replyWithTweetText();
            }
        }
        else if (text.indexOf("!Reset") != -1)
        {
            console.log("game reset");
            tweetText = "@" + from +  " Game ID: " + gameID + " has been reset";
            replyWithTweetText();
            clearVariables();
        }
        else
        {
            tweetText = "@" + from + " Unrecognized command! Game ID: " + gameID;
            replyWithTweetText();
        }
    }
}

function setupGame()
{
    var indexOfLastAt = text.lastIndexOf("@");
    var indexOfExPoint = text.indexOf("!");
    gameID = randomIntFromInterval(1,10000000)
    playerOne = from;
    playerTwo = text.substring(indexOfLastAt+1,indexOfExPoint-1);
    isGameStarted = 1;
    whoseTurn = pickARandomPlayer();
    items = [[2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 2]];
    tweetText = "A game has been started with @" + playerOne + " and @" + playerTwo +" ! @" + whoseTurn + " is up to play. Game ID: " + gameID;
}

function pickARandomPlayer()
{
    var oneORtwo = randomIntFromInterval(1,2)
    if(oneORtwo == 1)
    {
        return playerOne
    }
    else if(oneORtwo == 2)
    {
        return playerTwo
    }
    else
    {
        console.log("error in selecting random player")
    }
}

function clearVariables()
{
    from = "N/A";
    text = "N/A";
    replyto = "N/A";
    idOfTweet = "N/A";
    playerOne = "N/A";
    playerTwo = "N/A";
    isGameStarted = 0;
    whoseTurn = -1;
    items = [[2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 2]];
    gameID = 0;
    console.log("variables are cleared");
}

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function checkStartGameCommand()
{
    if(isGameStarted == 0)
    {
        if(countOfAts == 2)
        {
            if(text.indexOf(" !StartGame") != -1)
            {
                if(countOfExPoints == 1)
                {
                    var indexOfLastAt = text.lastIndexOf("@");
                    var indexOfExPoint = text.indexOf("!");
                    if(indexOfExPoint > indexOfLastAt)
                    {
                        setupGame();
                    }
                    else
                    {
                        tweetText = "@" + from + " Your opponents username should come before the !StartGame command. Please make sure you are formatting your tweet correctly. Game ID: " + gameID;
                    }     
                }
                else
                {
                    console.log(countOfExPoints)
                    tweetText = "@" + from + " Too many !'s. Please make sure you are formatting your tweet correctly. Game ID: " + gameID;
                }
            }
            else
            {
                tweetText = "@" + from + " Make sure to leave a space before the !StartGame command. Game ID: " + gameID;
            }
        }
        else
        {
            console.log(countOfAts)
            tweetText = "@" + from + " Not the correct amount of players to start a game. Please make sure you are formatting your tweet correctly. Game ID: " + gameID;
        }
    }
    else
    {
        tweetText = "@" + from + " Game has already been started. Please wait for the current game to finish. Game ID: " + gameID;
    }
}

function replyWithTweetText()
{
    var tweet = { status: tweetText, in_reply_to_status_id: idOfTweet}
	T.post('statuses/update', tweet, tweeted)
}

function tweeted(err, data, response)
{
  	if (err)
  	{
  		console.log(err)
  	}
  	else
  	{
  		console.log("Tweeted: " + tweetText)
  	}
}

function replyWithTweetTextAndBoard()
{
    console.log("you are in the tweetIt function");
    outputBoardPhoto(items);
	setTimeout(replyWithTweetTextAndBoardAfterPhotoCreated, 2000);
}

function replyWithTweetTextAndBoardAfterPhotoCreated()
{
    var filename = 'editedBoard.jpg';
	var params = { encoding: 'base64'}
	var b64content = fs.readFileSync(filename, params);

	T.post('media/upload', { media_data: b64content } , uploaded)
}

function outputBoardPhoto(items)
{
    var images = ['blueCircle.png', 'redCircle.png', 'ConnectBoard2.png', 'vs.png'];
    var jimps = [];
    for(var i =0; i < images.length; i++)
    {
        jimps.push(Jimp.read(images[i]));
    }

    

    Promise.all(jimps).then(function(data)
    {
        return Promise.all(jimps);
    }).then(function(data) 
    {
        data[2].composite(data[3],505,3);
       
         Jimp.loadFont(Jimp.FONT_SANS_32_BLACK).then(function (font)
        {
            data[2].print(font, 250, 40, "@" + playerOne);
            data[2].print(font, 645, 40, "@" + playerTwo);
            data[2].print(font, 400, 115, "Game ID: " + gameID);
            data[2].write("editedBoard.jpg");
         });             

        if(items[0][0] == 1)
        {
            data[2].composite(data[1],19,165);
        }
        if(items[1][0] == 1)
        {
            data[2].composite(data[1],19,318);
        }
        if(items[2][0] == 1)
        {
            data[2].composite(data[1],19,470);
        }
        if(items[3][0] == 1)
        {
            data[2].composite(data[1],19,622);
        }
        if(items[4][0] == 1)
        {
            data[2].composite(data[1],19,774);
        }
        if(items[5][0] == 1)
        {
            data[2].composite(data[1],19,926);
        }
        //far left row red
        if(items[0][1] == 1)
        {
            data[2].composite(data[1],172,165);
        }
        if(items[1][1] == 1)
        {
            data[2].composite(data[1],172,318);
        }
        if(items[2][1] == 1)
        {
            data[2].composite(data[1],172,470);
        }
        if(items[3][1] == 1)
        {
            data[2].composite(data[1],172,622);
        }
        if(items[4][1] == 1)
        {
            data[2].composite(data[1],172,774);
        }
        if(items[5][1] == 1)
        {
            data[2].composite(data[1],172,926);
        }
        //
        if(items[0][2] == 1)
        {
            data[2].composite(data[1],325,165);
        }
        if(items[1][2] == 1)
        {
            data[2].composite(data[1],325,318);
        }
        if(items[2][2] == 1)
        {
            data[2].composite(data[1],325,470);
        }
        if(items[3][2] == 1)
        {
            data[2].composite(data[1],325,622);
        }
        if(items[4][2] == 1)
        {
            data[2].composite(data[1],325,774);
        }
        if(items[5][2] == 1)
        {
            data[2].composite(data[1],325,926);
        }
        //
        if(items[0][3] == 1)
        {
            data[2].composite(data[1],476,165);
        }
        if(items[1][3] == 1)
        {
            data[2].composite(data[1],476,318);
        }
        if(items[2][3] == 1)
        {
            data[2].composite(data[1],476,470);
        }
        if(items[3][3] == 1)
        {
            data[2].composite(data[1],476,622);
        }
        if(items[4][3] == 1)
        {
            data[2].composite(data[1],476,774);
        }
        if(items[5][3] == 1)
        {
            data[2].composite(data[1],476,926);
        }
        //
        if(items[0][4] == 1)
        {
            data[2].composite(data[1],627,165);
        }
        if(items[1][4] == 1)
        {
            data[2].composite(data[1],627,318);
        }
        if(items[2][4] == 1)
        {
            data[2].composite(data[1],627,470);
        }
        if(items[3][4] == 1)
        {
            data[2].composite(data[1],627,622);
        }
        if(items[4][4] == 1)
        {
            data[2].composite(data[1],627,774);
        }
        if(items[5][4] == 1)
        {
            data[2].composite(data[1],627,926);
        }
        //
        if(items[0][5] == 1)
        {
            data[2].composite(data[1],780,165);
        }
        if(items[1][5] == 1)
        {
            data[2].composite(data[1],780,318);
        }
        if(items[2][5] == 1)
        {
            data[2].composite(data[1],780,470);
        }
        if(items[3][5] == 1)
        {
            data[2].composite(data[1],780,622);
        }
        if(items[4][5] == 1)
        {
            data[2].composite(data[1],780,774);
        }
        if(items[5][5] == 1)
        {
            data[2].composite(data[1],780,926);
        }
        //
        if(items[0][6] == 1)
        {
            data[2].composite(data[1],934,165);
        }
        if(items[1][6] == 1)
        {
            data[2].composite(data[1],934,318);
        }
        if(items[2][6] == 1)
        {
            data[2].composite(data[1],934,470);
        }
        if(items[3][6] == 1)
        {
            data[2].composite(data[1],934,622);
        }
        if(items[4][6] == 1)
        {
            data[2].composite(data[1],934,774);
        }
        if(items[5][6] == 1)
        {
            data[2].composite(data[1],934,926);
        }
        //start of blue




            
        if(items[0][0] == 0)
        {
            data[2].composite(data[0],17,162);
        }
        if(items[1][0] == 0)
        {
            data[2].composite(data[0],17,316);
        }
        if(items[2][0] == 0)
        {
            data[2].composite(data[0],17,468);
        }
        if(items[3][0] == 0)
        {
            data[2].composite(data[0],17,619);
        }
        if(items[4][0] == 0)
        {
            data[2].composite(data[0],17,770);
        }
        if(items[5][0] == 0)
        {
            data[2].composite(data[0],17,924);
        }
        //far left row red
        if(items[0][1] == 0)
        {
            data[2].composite(data[0],169,162);
        }
        if(items[1][1] == 0)
        {
            data[2].composite(data[0],169,316);
        }
        if(items[2][1] == 0)
        {
            data[2].composite(data[0],169,468);
        }
        if(items[3][1] == 0)
        {
            data[2].composite(data[0],169,619);
        }
        if(items[4][1] == 0)
        {
            data[2].composite(data[0],169,770);
        }
        if(items[5][1] == 0)
        {
            data[2].composite(data[0],169,924);
        }
        //
        if(items[0][2] == 0)
        {
            data[2].composite(data[0],323,162);
        }
        if(items[1][2] == 0)
        {
            data[2].composite(data[0],323,316);
        }
        if(items[2][2] == 0)
        {
            data[2].composite(data[0],323,468);
        }
        if(items[3][2] == 0)
        {
            data[2].composite(data[0],323,619);
        }
        if(items[4][2] == 0)
        {
            data[2].composite(data[0],323,770);
        }
        if(items[5][2] == 0)
        {
            data[2].composite(data[0],323,924);
        }
        //
        if(items[0][3] == 0)
        {
            data[2].composite(data[0],475,162);
        }
        if(items[1][3] == 0)
        {
            data[2].composite(data[0],475,316);
        }
        if(items[2][3] == 0)
        {
            data[2].composite(data[0],475,468);
        }
        if(items[3][3] == 0)
        {
            data[2].composite(data[0],475,619);
        }
        if(items[4][3] == 0)
        {
            data[2].composite(data[0],475,770);
        }
        if(items[5][3] == 0)
        {
            data[2].composite(data[0],475,924);
        }
        //
        if(items[0][4] == 0)
        {
            data[2].composite(data[0],626,162);
        }
        if(items[1][4] == 0)
        {
            data[2].composite(data[0],626,316);
        }
        if(items[2][4] == 0)
        {
            data[2].composite(data[0],626,468);
        }
        if(items[3][4] == 0)
        {
            data[2].composite(data[0],626,619);
        }
        if(items[4][4] == 0)
        {
            data[2].composite(data[0],626,770);
        }
        if(items[5][4] == 0)
        {
            data[2].composite(data[0],626,924);
        }
        //
        if(items[0][5] == 0)
        {
            data[2].composite(data[0],778,162);
        }
        if(items[1][5] == 0)
        {
            data[2].composite(data[0],778,316);
        }
        if(items[2][5] == 0)
        {
            data[2].composite(data[0],778,468);
        }
        if(items[3][5] == 0)
        {
            data[2].composite(data[0],778,619);
        }
        if(items[4][5] == 0)
        {
            data[2].composite(data[0],778,770);
        }
        if(items[5][5] == 0)
        {
            data[2].composite(data[0],778,924);
        }
        //
        if(items[0][6] == 0)
        {
            data[2].composite(data[0],932,162);
        }
        if(items[1][6] == 0)
        {
            data[2].composite(data[0],932,316);
        }
        if(items[2][6] == 0)
        {
            data[2].composite(data[0],932,468);
        }
        if(items[3][6] == 0)
        {
            data[2].composite(data[0],932,619);
        }
        if(items[4][6] == 0)
        {
            data[2].composite(data[0],932,770);
        }
        if(items[5][6] == 0)
        {
            data[2].composite(data[0],932,924);
        }
        data[2].write('editedBoard.jpg')
    })
    

    

}


function uploaded(err, data, response)
{
	var id = data.media_id_string;
    var tweet = { status: tweetText, in_reply_to_status_id: idOfTweet, media_ids: [id]}
	T.post('statuses/update', tweet, tweeted)
}

function convertToBoard(num)
{
    var returnedValue = "-Undefined-";
    if(num == 2)
    {
        returnedValue = " ";
    }
    else if (num == 1)
    {
        returnedValue = "X";
    }
    else if (num == 0)
    {
        returnedValue = "O";
    }
    return returnedValue;
}

function outputBoard(items)
{
    console.log(" " + convertToBoard(items[0][0]) + " | " + convertToBoard(items[0][1]) + " | " + convertToBoard(items[0][2]) + " | " + convertToBoard(items[0][3]) + " | " + convertToBoard(items[0][4]) + " | " + convertToBoard(items[0][5]) + " | " + convertToBoard(items[0][6]) + "\n___________________________\n\n " +
                      convertToBoard(items[1][0]) + " | " + convertToBoard(items[1][1]) + " | " + convertToBoard(items[1][2]) + " | " + convertToBoard(items[1][3]) + " | " + convertToBoard(items[1][4]) + " | " + convertToBoard(items[1][5]) + " | " + convertToBoard(items[1][6]) + "\n___________________________\n\n " + 
                      convertToBoard(items[2][0]) + " | " + convertToBoard(items[2][1]) + " | " + convertToBoard(items[2][2]) + " | " + convertToBoard(items[2][3]) + " | " + convertToBoard(items[2][4]) + " | " + convertToBoard(items[2][5]) + " | " + convertToBoard(items[2][6]) + "\n___________________________\n\n " +   
                      convertToBoard(items[3][0]) + " | " + convertToBoard(items[3][1]) + " | " + convertToBoard(items[3][2]) + " | " + convertToBoard(items[3][3]) + " | " + convertToBoard(items[3][4]) + " | " + convertToBoard(items[3][5]) + " | " + convertToBoard(items[3][6]) + "\n___________________________\n\n " +
                      convertToBoard(items[4][0]) + " | " + convertToBoard(items[4][1]) + " | " + convertToBoard(items[4][2]) + " | " + convertToBoard(items[4][3]) + " | " + convertToBoard(items[4][4]) + " | " + convertToBoard(items[4][5]) + " | " + convertToBoard(items[4][6]) + "\n___________________________\n\n " + 
                      convertToBoard(items[5][0]) + " | " + convertToBoard(items[5][1]) + " | " + convertToBoard(items[5][2]) + " | " + convertToBoard(items[5][3]) + " | " + convertToBoard(items[5][4]) + " | " + convertToBoard(items[5][5]) + " | " + convertToBoard(items[5][6]));    
}

function playLocation()
{
    console.log("playLocation Reached");
    if(whoseTurn == playerTwo)
    {
        if(text.indexOf("!1") != -1 && items[0][0] == 2)
        {
            if(items[5][0] == 2)
            {
                items[5][0] = 0
            }
            else if(items[4][0] == 2)
            {
                items[4][0] = 0
            }
            else if(items[3][0] == 2)
            {
                items[3][0] = 0
            }
            else if(items[2][0] == 2)
            {
                items[2][0] = 0
            }
            else if(items[1][0] == 2)
            {
                items[1][0] = 0
            }
            else
            {
                items[0][0] = 0
            }   
            aftermath();         
        }
        else if(text.indexOf("!2") != -1 && items[0][1] == 2)
        {
            if(items[5][1] == 2)
            {
                items[5][1] = 0
            }
            else if(items[4][1] == 2)
            {
                items[4][1] = 0
            }
            else if(items[3][1] == 2)
            {
                items[3][1] = 0
            }
            else if(items[2][1] == 2)
            {
                items[2][1] = 0
            }
            else if(items[1][1] == 2)
            {
                items[1][1] = 0
            }
            else
            {
                items[0][1] = 0
            }   
            aftermath();         
        }
        else if(text.indexOf("!3") != -1 && items[0][2] == 2)
        {
            if(items[5][2] == 2)
            {
                items[5][2] = 0
            }
            else if(items[4][2] == 2)
            {
                items[4][2] = 0
            }
            else if(items[3][2] == 2)
            {
                items[3][2] = 0
            }
            else if(items[2][2] == 2)
            {
                items[2][2] = 0
            }
            else if(items[1][2] == 2)
            {
                items[1][2] = 0
            }
            else
            {
                items[0][2] = 0
            }      
            aftermath();                 
        }
        else if(text.indexOf("!4") != -1 && items[0][3] == 2)
        {
            if(items[5][3] == 2)
            {
                items[5][3] = 0
            }
            else if(items[4][3] == 2)
            {
                items[4][3] = 0
            }
            else if(items[3][3] == 2)
            {
                items[3][3] = 0
            }
            else if(items[2][3] == 2)
            {
                items[2][3] = 0
            }
            else if(items[1][3] == 2)
            {
                items[1][3] = 0
            }
            else
            {
                items[0][3] = 0
            }    
            aftermath();                   
        }
        else if(text.indexOf("!5") != -1 && items[0][4] == 2)
        {
            if(items[5][4] == 2)
            {
                items[5][4] = 0
            }
            else if(items[4][4] == 2)
            {
                items[4][4] = 0
            }
            else if(items[3][4] == 2)
            {
                items[3][4] = 0
            }
            else if(items[2][4] == 2)
            {
                items[2][4] = 0
            }
            else if(items[1][4] == 2)
            {
                items[1][4] = 0
            }
            else
            {
                items[0][4] = 0
            }      
            aftermath();                 
        }
        else if(text.indexOf("!6") != -1 && items[0][5] == 2)
        {
            if(items[5][5] == 2)
            {
                items[5][5] = 0
            }
            else if(items[4][5] == 2)
            {
                items[4][5] = 0
            }
            else if(items[3][5] == 2)
            {
                items[3][5] = 0
            }
            else if(items[2][5] == 2)
            {
                items[2][5] = 0
            }
            else if(items[1][5] == 2)
            {
                items[1][5] = 0
            }
            else
            {
                items[0][5] = 0
            }    
            aftermath();                   
        }
        else if(text.indexOf("!7") != -1 && items[0][6] == 2)
        {
            if(items[5][6] == 2)
            {
                items[5][6] = 0
            }
            else if(items[4][6] == 2)
            {
                items[4][6] = 0
            }
            else if(items[3][6] == 2)
            {
                items[3][6] = 0
            }
            else if(items[2][6] == 2)
            {
                items[2][6] = 0
            }
            else if(items[1][6] == 2)
            {
                items[1][6] = 0
            }
            else
            {
                items[0][6] = 0
            }   
            aftermath();                    
        }
        else
        {
            tweetText = "@" + whoseTurn + " That column is full! Please pick another column. Game ID: " + gameID;
            replyWithTweetText();
        }
    }
    else if(whoseTurn == playerOne)
    {
        if(text.indexOf("!1") != -1 && items[0][0] == 2)
        {
            if(items[5][0] == 2)
            {
                items[5][0] = 1
            }
            else if(items[4][0] == 2)
            {
                items[4][0] = 1
            }
            else if(items[3][0] == 2)
            {
                items[3][0] = 1
            }
            else if(items[2][0] == 2)
            {
                items[2][0] = 1
            }
            else if(items[1][0] == 2)
            {
                items[1][0] = 1
            }
            else
            {
                items[0][0] = 1
            }  
            aftermath();          
        }
        else if(text.indexOf("!2") != -1 && items[0][1] == 2)
        {
            if(items[5][1] == 2)
            {
                items[5][1] = 1
            }
            else if(items[4][1] == 2)
            {
                items[4][1] = 1
            }
            else if(items[3][1] == 2)
            {
                items[3][1] = 1
            }
            else if(items[2][1] == 2)
            {
                items[2][1] = 1
            }
            else if(items[1][1] == 2)
            {
                items[1][1] = 1
            }
            else
            {
                items[0][1] = 1
            }      
            aftermath();      
        }
        else if(text.indexOf("!3") != -1 && items[0][2] == 2)
        {
            if(items[5][2] == 2)
            {
                items[5][2] = 1
            }
            else if(items[4][2] == 2)
            {
                items[4][2] = 1
            }
            else if(items[3][2] == 2)
            {
                items[3][2] = 1
            }
            else if(items[2][2] == 2)
            {
                items[2][2] = 1
            }
            else if(items[1][2] == 2)
            {
                items[1][2] = 1
            }
            else
            {
                items[0][2] = 1
            }      
            aftermath();                 
        }
        else if(text.indexOf("!4") != -1 && items[0][3] == 2)
        {
            if(items[5][3] == 2)
            {
                items[5][3] = 1
            }
            else if(items[4][3] == 2)
            {
                items[4][3] = 1
            }
            else if(items[3][3] == 2)
            {
                items[3][3] = 1
            }
            else if(items[2][3] == 2)
            {
                items[2][3] = 1
            }
            else if(items[1][3] == 2)
            {
                items[1][3] = 1
            }
            else
            {
                items[0][3] = 1
            }      
            aftermath();                 
        }
        else if(text.indexOf("!5") != -1 && items[0][4] == 2)
        {
            if(items[5][4] == 2)
            {
                items[5][4] = 1
            }
            else if(items[4][4] == 2)
            {
                items[4][4] = 1
            }
            else if(items[3][4] == 2)
            {
                items[3][4] = 1
            }
            else if(items[2][4] == 2)
            {
                items[2][4] = 1
            }
            else if(items[1][4] == 2)
            {
                items[1][4] = 1
            }
            else
            {
                items[0][4] = 1
            }       
            aftermath();                
        }
        else if(text.indexOf("!6") != -1 && items[0][5] == 2)
        {
            if(items[5][5] == 2)
            {
                items[5][5] = 1
            }
            else if(items[4][5] == 2)
            {
                items[4][5] = 1
            }
            else if(items[3][5] == 2)
            {
                items[3][5] = 1
            }
            else if(items[2][5] == 2)
            {
                items[2][5] = 1
            }
            else if(items[1][5] == 2)
            {
                items[1][5] = 1
            }
            else
            {
                items[0][5] = 1
            }  
            aftermath();                  
        }
        else if(text.indexOf("!7") != -1 && items[0][6] == 2)
        {
            if(items[5][6] == 2)
            {
                items[5][6] = 1
            }
            else if(items[4][6] == 2)
            {
                items[4][6] = 1
            }
            else if(items[3][6] == 2)
            {
                items[3][6] = 1
            }
            else if(items[2][6] == 2)
            {
                items[2][6] = 1
            }
            else if(items[1][6] == 2)
            {
                items[1][6] = 1
            }
            else
            {
                items[0][6] = 1
            }       
            aftermath();               
        }
        else
        {
            tweetText = "@" + whoseTurn + "That column is full! Please pick another column. Game ID: " + gameID;
            replyWithTweetText();
        }
    }
}

function aftermath()
{
    checkWinner();
    checkDraw();
    if(isGameStarted == 1)
    {
        switchPlayer();
        outputBoard(items);
        replyWithTweetTextAndBoard();
    }
    else if(isGameStarted == 0)
    {
        setTimeout(clearVariables, 10000);
    }
}

function switchPlayer()
{
    if(whoseTurn == playerOne)
    {
        whoseTurn = playerTwo;
        console.log("player has been switched to: " + playerTwo)
        tweetText = "@" + playerOne + " - @" + playerTwo + " is now up to play! Game ID: " + gameID;
    }
    else if(whoseTurn == playerTwo)
    {
        whoseTurn = playerOne;
        console.log("player has been switched to: " + playerOne)
        tweetText = "@" + playerTwo + " - @" + playerOne + " is now up to play! Game ID: " + gameID;
    }
}

function checkWinner()
{
    if(
        items[5][0] == 1 && items[5][1] == 1 && items[5][2] == 1 && items[5][3] == 1 ||
        items[5][1] == 1 && items[5][2] == 1 && items[5][3] == 1 && items[5][4] == 1 ||
        items[5][2] == 1 && items[5][3] == 1 && items[5][4] == 1 && items[5][5] == 1 ||
        items[5][3] == 1 && items[5][4] == 1 && items[5][5] == 1 && items[5][6] == 1 ||
        //checks bottom row for flat connect 4's
        items[4][0] == 1 && items[4][1] == 1 && items[4][2] == 1 && items[4][3] == 1 ||
        items[4][1] == 1 && items[4][2] == 1 && items[4][3] == 1 && items[4][4] == 1 ||
        items[4][2] == 1 && items[4][3] == 1 && items[4][4] == 1 && items[4][5] == 1 ||
        items[4][3] == 1 && items[4][4] == 1 && items[4][5] == 1 && items[4][6] == 1 ||
        //
        items[3][0] == 1 && items[3][1] == 1 && items[3][2] == 1 && items[3][3] == 1 ||
        items[3][1] == 1 && items[3][2] == 1 && items[3][3] == 1 && items[3][4] == 1 ||
        items[3][2] == 1 && items[3][3] == 1 && items[3][4] == 1 && items[3][5] == 1 ||
        items[3][3] == 1 && items[3][4] == 1 && items[3][5] == 1 && items[3][6] == 1 ||
        //
        items[2][0] == 1 && items[2][1] == 1 && items[2][2] == 1 && items[2][3] == 1 ||
        items[2][1] == 1 && items[2][2] == 1 && items[2][3] == 1 && items[2][4] == 1 ||
        items[2][2] == 1 && items[2][3] == 1 && items[2][4] == 1 && items[2][5] == 1 ||
        items[2][3] == 1 && items[2][4] == 1 && items[2][5] == 1 && items[2][6] == 1 ||
        //
        items[1][0] == 1 && items[1][1] == 1 && items[1][2] == 1 && items[1][3] == 1 ||
        items[1][1] == 1 && items[1][2] == 1 && items[1][3] == 1 && items[1][4] == 1 ||
        items[1][2] == 1 && items[1][3] == 1 && items[1][4] == 1 && items[1][5] == 1 ||
        items[1][3] == 1 && items[1][4] == 1 && items[1][5] == 1 && items[1][6] == 1 ||
        //
        items[0][0] == 1 && items[0][1] == 1 && items[0][2] == 1 && items[0][3] == 1 ||
        items[0][1] == 1 && items[0][2] == 1 && items[0][3] == 1 && items[0][4] == 1 ||
        items[0][2] == 1 && items[0][3] == 1 && items[0][4] == 1 && items[0][5] == 1 ||
        items[0][3] == 1 && items[0][4] == 1 && items[0][5] == 1 && items[0][6] == 1 ||
        //all flats are checked

        items[5][0] == 1 && items[4][0] == 1 && items[3][0] == 1 && items[2][0] == 1 ||
        items[4][0] == 1 && items[3][0] == 1 && items[2][0] == 1 && items[1][0] == 1 ||
        items[3][0] == 1 && items[2][0] == 1 && items[1][0] == 1 && items[0][0] == 1 ||
        //far left walls have been checked
        items[5][1] == 1 && items[4][1] == 1 && items[3][1] == 1 && items[2][1] == 1 ||
        items[4][1] == 1 && items[3][1] == 1 && items[2][1] == 1 && items[1][1] == 1 ||
        items[3][1] == 1 && items[2][1] == 1 && items[1][1] == 1 && items[0][1] == 1 ||
        //
        items[5][2] == 1 && items[4][2] == 1 && items[3][2] == 1 && items[2][2] == 1 ||
        items[4][2] == 1 && items[3][2] == 1 && items[2][2] == 1 && items[1][2] == 1 ||
        items[3][2] == 1 && items[2][2] == 1 && items[1][2] == 1 && items[0][2] == 1 ||
        //
        items[5][3] == 1 && items[4][3] == 1 && items[3][3] == 1 && items[2][3] == 1 ||
        items[4][3] == 1 && items[3][3] == 1 && items[2][3] == 1 && items[1][3] == 1 ||
        items[3][3] == 1 && items[2][3] == 1 && items[1][3] == 1 && items[0][3] == 1 ||
        //
        items[5][4] == 1 && items[4][4] == 1 && items[3][4] == 1 && items[2][4] == 1 ||
        items[4][4] == 1 && items[3][4] == 1 && items[2][4] == 1 && items[1][4] == 1 ||
        items[3][4] == 1 && items[2][4] == 1 && items[1][4] == 1 && items[0][4] == 1 ||
        //
        items[5][5] == 1 && items[4][5] == 1 && items[3][5] == 1 && items[2][5] == 1 ||
        items[4][5] == 1 && items[3][5] == 1 && items[2][5] == 1 && items[1][5] == 1 ||
        items[3][5] == 1 && items[2][5] == 1 && items[1][5] == 1 && items[0][5] == 1 ||
        //
        items[5][6] == 1 && items[4][6] == 1 && items[3][6] == 1 && items[2][6] == 1 ||
        items[4][6] == 1 && items[3][6] == 1 && items[2][6] == 1 && items[1][6] == 1 ||
        items[3][6] == 1 && items[2][6] == 1 && items[1][6] == 1 && items[0][6] == 1 ||
        //all walls have been checked

        //start of top left to bottom right ramps
        items[2][0] == 1 && items[3][1] == 1 && items[4][2] == 1 && items[5][3] == 1 ||
        items[2][1] == 1 && items[3][2] == 1 && items[4][3] == 1 && items[5][4] == 1 ||
        items[2][2] == 1 && items[3][3] == 1 && items[4][4] == 1 && items[5][5] == 1 ||
        items[2][3] == 1 && items[3][4] == 1 && items[4][5] == 1 && items[5][6] == 1 ||
        //bottom row of top left to bottom rights ramps are checked
        items[1][0] == 1 && items[2][1] == 1 && items[3][2] == 1 && items[4][3] == 1 ||
        items[1][1] == 1 && items[2][2] == 1 && items[3][3] == 1 && items[4][4] == 1 ||
        items[1][2] == 1 && items[2][3] == 1 && items[3][4] == 1 && items[4][5] == 1 ||
        items[1][3] == 1 && items[2][4] == 1 && items[3][5] == 1 && items[4][6] == 1 ||
        //
        items[0][0] == 1 && items[1][1] == 1 && items[2][2] == 1 && items[3][3] == 1 ||
        items[0][1] == 1 && items[1][2] == 1 && items[2][3] == 1 && items[3][4] == 1 ||
        items[0][2] == 1 && items[1][3] == 1 && items[2][4] == 1 && items[3][5] == 1 ||
        items[0][3] == 1 && items[1][4] == 1 && items[2][5] == 1 && items[3][6] == 1 ||
        // all top left to bottom right are checked
        //start of bottom left top right ramp checks
        items[5][0] == 1 && items[4][1] == 1 && items[3][2] == 1 && items[2][3] == 1 ||
        items[5][1] == 1 && items[4][2] == 1 && items[3][3] == 1 && items[2][4] == 1 ||
        items[5][2] == 1 && items[4][3] == 1 && items[3][4] == 1 && items[2][5] == 1 ||
        items[5][3] == 1 && items[4][4] == 1 && items[3][5] == 1 && items[2][6] == 1 ||
        // bottom row of bottom left top top right checked
        items[4][0] == 1 && items[3][1] == 1 && items[2][2] == 1 && items[1][3] == 1 ||
        items[4][1] == 1 && items[3][2] == 1 && items[2][3] == 1 && items[1][4] == 1 ||
        items[4][2] == 1 && items[3][3] == 1 && items[2][4] == 1 && items[1][5] == 1 ||
        items[4][3] == 1 && items[3][4] == 1 && items[2][5] == 1 && items[1][6] == 1 ||
        //
        items[3][0] == 1 && items[2][1] == 1 && items[1][2] == 1 && items[0][3] == 1 ||
        items[3][1] == 1 && items[2][2] == 1 && items[1][3] == 1 && items[0][4] == 1 ||
        items[3][2] == 1 && items[2][3] == 1 && items[1][4] == 1 && items[0][5] == 1 ||
        items[3][3] == 1 && items[2][4] == 1 && items[1][5] == 1 && items[0][6] == 1)
    {
        console.log(playerOne + " wins")
        tweetText = "@" + playerOne + " @" + playerTwo + " " + playerOne + " WINS! thanks for playing! Game ID: " + gameID;
        replyWithTweetTextAndBoard();
        isGameStarted = 0;
    }
    else if(
        items[5][0] == 0 && items[5][1] == 0 && items[5][2] == 0 && items[5][3] == 0 ||
        items[5][1] == 0 && items[5][2] == 0 && items[5][3] == 0 && items[5][4] == 0 ||
        items[5][2] == 0 && items[5][3] == 0 && items[5][4] == 0 && items[5][5] == 0 ||
        items[5][3] == 0 && items[5][4] == 0 && items[5][5] == 0 && items[5][6] == 0 ||
        //checks bottom row for flat connect 4's
        items[4][0] == 0 && items[4][1] == 0 && items[4][2] == 0 && items[4][3] == 0 ||
        items[4][1] == 0 && items[4][2] == 0 && items[4][3] == 0 && items[4][4] == 0 ||
        items[4][2] == 0 && items[4][3] == 0 && items[4][4] == 0 && items[4][5] == 0 ||
        items[4][3] == 0 && items[4][4] == 0 && items[4][5] == 0 && items[4][6] == 0 ||
        //
        items[3][0] == 0 && items[3][1] == 0 && items[3][2] == 0 && items[3][3] == 0 ||
        items[3][1] == 0 && items[3][2] == 0 && items[3][3] == 0 && items[3][4] == 0 ||
        items[3][2] == 0 && items[3][3] == 0 && items[3][4] == 0 && items[3][5] == 0 ||
        items[3][3] == 0 && items[3][4] == 0 && items[3][5] == 0 && items[3][6] == 0 ||
        //
        items[2][0] == 0 && items[2][1] == 0 && items[2][2] == 0 && items[2][3] == 0 ||
        items[2][1] == 0 && items[2][2] == 0 && items[2][3] == 0 && items[2][4] == 0 ||
        items[2][2] == 0 && items[2][3] == 0 && items[2][4] == 0 && items[2][5] == 0 ||
        items[2][3] == 0 && items[2][4] == 0 && items[2][5] == 0 && items[2][6] == 0 ||
        //
        items[1][0] == 0 && items[1][1] == 0 && items[1][2] == 0 && items[1][3] == 0 ||
        items[1][1] == 0 && items[1][2] == 0 && items[1][3] == 0 && items[1][4] == 0 ||
        items[1][2] == 0 && items[1][3] == 0 && items[1][4] == 0 && items[1][5] == 0 ||
        items[1][3] == 0 && items[1][4] == 0 && items[1][5] == 0 && items[1][6] == 0 ||
        //
        items[0][0] == 0 && items[0][1] == 0 && items[0][2] == 0 && items[0][3] == 0 ||
        items[0][1] == 0 && items[0][2] == 0 && items[0][3] == 0 && items[0][4] == 0 ||
        items[0][2] == 0 && items[0][3] == 0 && items[0][4] == 0 && items[0][5] == 0 ||
        items[0][3] == 0 && items[0][4] == 0 && items[0][5] == 0 && items[0][6] == 0 ||
        //all flats are checked

        items[5][0] == 0 && items[4][0] == 0 && items[3][0] == 0 && items[2][0] == 0 ||
        items[4][0] == 0 && items[3][0] == 0 && items[2][0] == 0 && items[1][0] == 0 ||
        items[3][0] == 0 && items[2][0] == 0 && items[1][0] == 0 && items[0][0] == 0 ||
        //far left walls have been checked
        items[5][1] == 0 && items[4][1] == 0 && items[3][1] == 0 && items[2][1] == 0 ||
        items[4][1] == 0 && items[3][1] == 0 && items[2][1] == 0 && items[1][1] == 0 ||
        items[3][1] == 0 && items[2][1] == 0 && items[1][1] == 0 && items[0][1] == 0 ||
        //
        items[5][2] == 0 && items[4][2] == 0 && items[3][2] == 0 && items[2][2] == 0 ||
        items[4][2] == 0 && items[3][2] == 0 && items[2][2] == 0 && items[1][2] == 0 ||
        items[3][2] == 0 && items[2][2] == 0 && items[1][2] == 0 && items[0][2] == 0 ||
        //
        items[5][3] == 0 && items[4][3] == 0 && items[3][3] == 0 && items[2][3] == 0 ||
        items[4][3] == 0 && items[3][3] == 0 && items[2][3] == 0 && items[1][3] == 0 ||
        items[3][3] == 0 && items[2][3] == 0 && items[1][3] == 0 && items[0][3] == 0 ||
        //
        items[5][4] == 0 && items[4][4] == 0 && items[3][4] == 0 && items[2][4] == 0 ||
        items[4][4] == 0 && items[3][4] == 0 && items[2][4] == 0 && items[1][4] == 0 ||
        items[3][4] == 0 && items[2][4] == 0 && items[1][4] == 0 && items[0][4] == 0 ||
        //
        items[5][5] == 0 && items[4][5] == 0 && items[3][5] == 0 && items[2][5] == 0 ||
        items[4][5] == 0 && items[3][5] == 0 && items[2][5] == 0 && items[1][5] == 0 ||
        items[3][5] == 0 && items[2][5] == 0 && items[1][5] == 0 && items[0][5] == 0 ||
        //
        items[5][6] == 0 && items[4][6] == 0 && items[3][6] == 0 && items[2][6] == 0 ||
        items[4][6] == 0 && items[3][6] == 0 && items[2][6] == 0 && items[1][6] == 0 ||
        items[3][6] == 0 && items[2][6] == 0 && items[1][6] == 0 && items[0][6] == 0 ||
        //all walls have been checked

        //start of top left to bottom right ramps
        items[2][0] == 0 && items[3][1] == 0 && items[4][2] == 0 && items[5][3] == 0 ||
        items[2][1] == 0 && items[3][2] == 0 && items[4][3] == 0 && items[5][4] == 0 ||
        items[2][2] == 0 && items[3][3] == 0 && items[4][4] == 0 && items[5][5] == 0 ||
        items[2][3] == 0 && items[3][4] == 0 && items[4][5] == 0 && items[5][6] == 0 ||
        //bottom row of top left to bottom rights ramps are checked
        items[1][0] == 0 && items[2][1] == 0 && items[3][2] == 0 && items[4][3] == 0 ||
        items[1][1] == 0 && items[2][2] == 0 && items[3][3] == 0 && items[4][4] == 0 ||
        items[1][2] == 0 && items[2][3] == 0 && items[3][4] == 0 && items[4][5] == 0 ||
        items[1][3] == 0 && items[2][4] == 0 && items[3][5] == 0 && items[4][6] == 0 ||
        //
        items[0][0] == 0 && items[1][1] == 0 && items[2][2] == 0 && items[3][3] == 0 ||
        items[0][1] == 0 && items[1][2] == 0 && items[2][3] == 0 && items[3][4] == 0 ||
        items[0][2] == 0 && items[1][3] == 0 && items[2][4] == 0 && items[3][5] == 0 ||
        items[0][3] == 0 && items[1][4] == 0 && items[2][5] == 0 && items[3][6] == 0 ||
        // all top left to bottom right are checked
        //start of bottom left top right ramp checks
        items[5][0] == 0 && items[4][1] == 0 && items[3][2] == 0 && items[2][3] == 0 ||
        items[5][1] == 0 && items[4][2] == 0 && items[3][3] == 0 && items[2][4] == 0 ||
        items[5][2] == 0 && items[4][3] == 0 && items[3][4] == 0 && items[2][5] == 0 ||
        items[5][3] == 0 && items[4][4] == 0 && items[3][5] == 0 && items[2][6] == 0 ||
        // bottom row of bottom left top top right checked
        items[4][0] == 0 && items[3][1] == 0 && items[2][2] == 0 && items[1][3] == 0 ||
        items[4][1] == 0 && items[3][2] == 0 && items[2][3] == 0 && items[1][4] == 0 ||
        items[4][2] == 0 && items[3][3] == 0 && items[2][4] == 0 && items[1][5] == 0 ||
        items[4][3] == 0 && items[3][4] == 0 && items[2][5] == 0 && items[1][6] == 0 ||
        //
        items[3][0] == 0 && items[2][1] == 0 && items[1][2] == 0 && items[0][3] == 0 ||
        items[3][1] == 0 && items[2][2] == 0 && items[1][3] == 0 && items[0][4] == 0 ||
        items[3][2] == 0 && items[2][3] == 0 && items[1][4] == 0 && items[0][5] == 0 ||
        items[3][3] == 0 && items[2][4] == 0 && items[1][5] == 0 && items[0][6] == 0)
     {
        console.log(playerTwo + " wins")
        tweetText = "@" + playerOne + " @" + playerTwo + " " + playerTwo + " WINS! thanks for playing! Game ID: " + gameID;
        replyWithTweetTextAndBoard();
        isGameStarted = 0;
     }
}

function checkDraw()
{
    if( items[0][0] != 2 && items[0][1] != 2 && items[0][2] != 2 && items[0][3] != 2 && items[0][4] != 2 && items[0][5] != 2 && items[0][6] != 2 &&
        items[1][0] != 2 && items[1][1] != 2 && items[1][2] != 2 && items[1][3] != 2 && items[1][4] != 2 && items[1][5] != 2 && items[1][6] != 2 &&
        items[2][0] != 2 && items[2][1] != 2 && items[2][2] != 2 && items[2][3] != 2 && items[2][4] != 2 && items[2][5] != 2 && items[2][6] != 2 &&
        items[3][0] != 2 && items[3][1] != 2 && items[3][2] != 2 && items[3][3] != 2 && items[3][4] != 2 && items[3][5] != 2 && items[3][6] != 2 &&
        items[4][0] != 2 && items[4][1] != 2 && items[4][2] != 2 && items[4][3] != 2 && items[4][4] != 2 && items[4][5] != 2 && items[4][6] != 2 &&
        items[5][0] != 2 && items[5][1] != 2 && items[5][2] != 2 && items[5][3] != 2 && items[5][4] != 2 && items[5][5] != 2 && items[5][6] != 2) 
    {
        console.log("game is a draw");
        tweetText = "@" + playerOne + " @" + playerTwo + " the game is a draw, thanks for playing! Game ID: " + gameID;
        replyWithTweetTextAndBoard();
        isGameStarted = 0;
    }
}