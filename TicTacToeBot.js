const readline = require('readline');
const Twit = require('twit');
var config = require('./config')
var T = new Twit(config);

var stream = T.stream('user');
stream.on('tweet', tweetEvent);

var prompts = readline.createInterface(process.stdin,process.stdout);

var items;
var playerLetter = 1;

setupGame();



function outputBoard(items)
{
    console.log(" " + convertToBoard(items[0][0]) + " | " + convertToBoard(items[0][1]) + " | " + convertToBoard(items[0][2]) + "\n___________\n\n " +
                convertToBoard(items[1][0]) + " | " + convertToBoard(items[1][1]) + " | " + convertToBoard(items[1][2]) + "\n___________\n\n " +  
                convertToBoard(items[2][0]) + " | " + convertToBoard(items[2][1]) + " | " + convertToBoard(items[2][2]));     
        

}

function convertToBoard(num)
{
    var returnedValue = "-Undefined-";
    if(num == 2)
    {
        returnedValue = "-";
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

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function tweetEvent(eventMsg)
{
	var from = eventMsg.user.screen_name;
	var text = eventMsg.text;
	var replyto = eventMsg.in_reply_to_screen_name;
	if (replyto == "penzabot" && from == "SoaRPenZa")
	{
        console.log("tweet recieved")
        playLocation(text);
    }
    outputBoard(items);
	
}

function switchPlayer()
{
    if(playerLetter == 1)
    {
        playerLetter = 0;
        console.log("player has been switched to: " + playerLetter)
    }
    else if(playerLetter == 0)
    {
        playerLetter = 1;
        console.log("player has been switched to: " + playerLetter)
    }
}

function playLocation(text)
{
    if(text.indexOf("top left") != -1 && playerLetter == 1 && items[0][0] == 2)
        {
            items[0][0] = 1;
            console.log("top left has been played by: " + playerLetter)
        }
        else if(text.indexOf("top left") != -1 && playerLetter == 0 && items[0][0] == 2)
        {
            items[0][0] = 0;
            console.log("top left has been played by: " + playerLetter)
        }
        else if(text.indexOf("top middle") != -1 && playerLetter == 1 && items[0][1] == 2)
        {
            items[0][1] = 1;
            console.log("top middle has been played by: " + playerLetter)
        }
        else if(text.indexOf("top middle") != -1 && playerLetter == 0 && items[0][1] == 2)
        {
            items[0][1] = 0;
            console.log("top middle has been played by: " + playerLetter)
        }
        else if(text.indexOf("top right") != -1 && playerLetter == 1 && items[0][2] == 2)
        {
            items[0][2] = 1;
            console.log("top right has been played by: " + playerLetter)
        }
        else if(text.indexOf("top right") != -1 && playerLetter == 0 && items[0][2] == 2)
        {
            items[0][2] = 0;
            console.log("top right has been played by: " + playerLetter)
        }
        else if(text.indexOf("middle left") != -1 && playerLetter == 1 && items[1][0] == 2)
        {
            items[1][0] = 1;
            console.log("middle left has been played by: " + playerLetter)
        }
        else if(text.indexOf("middle left") != -1 && playerLetter == 0 && items[1][0] == 2)
        {
            items[1][0] = 0;
            console.log("middle left has been played by: " + playerLetter)
        }
        else if(text.indexOf("center") != -1 && playerLetter == 1 && items[1][1] == 2)
        {
            items[1][1] = 1;
            console.log("center has been played by: " + playerLetter)
        }
        else if(text.indexOf("center") != -1 && playerLetter == 0 && items[1][1] == 2)
        {
            items[1][1] = 0;
            console.log("center has been played by: " + playerLetter)

        }
        else if(text.indexOf("middle right") != -1 && playerLetter == 1 && items[1][2] == 2)
        {
            items[1][2] = 1;
            console.log("middle right has been played by: " + playerLetter)
        }
        else if(text.indexOf("middle right") != -1 && playerLetter == 0 && items[1][2] == 2)
        {
            items[1][2] = 0;
            console.log("middle right has been played by: " + playerLetter)
        }
        else if(text.indexOf("bottom left") != -1 && playerLetter == 1 && items[2][0] == 2)
        {
            items[2][0] = 1;
            console.log("bottom left has been played by: " + playerLetter)
        }
        else if(text.indexOf("bottom left") != -1 && playerLetter == 0 && items[2][0] == 2)
        {
            items[2][0] = 0;
            console.log("bottom left has been played by: " + playerLetter)
        }
        else if(text.indexOf("bottom middle") != -1 && playerLetter == 1 && items[2][1] == 2)
        {
            items[2][1] = 1;
            console.log("bottom middle has been played by: " + playerLetter)
        }
        else if(text.indexOf("bottom middle") != -1 && playerLetter == 0 && items[2][1] == 2)
        {
            items[2][1] = 0;
            console.log("bottom middle has been played by: " + playerLetter)
        }
        else if(text.indexOf("bottom right") != -1 && playerLetter == 1 && items[2][2] == 2)
        {
            items[2][2] = 1;
            console.log("bottom right has been played by: " + playerLetter)
        }
        else if(text.indexOf("bottom right") != -1 && playerLetter == 0 && items[2][2] == 2)
        {
            items[2][2] = 0;
            console.log("bottom right has been played by: " + playerLetter)
        }
        else
        {
            console.log("unrecognized command or already played location.")
        }
        checkWinner();
        checkDraw();
        switchPlayer();

}

function checkWinner()
{
    if(items[0][0] == 1 && items[0][1] == 1 && items[0][2] == 1 ||
       items[1][0] == 1 && items[1][1] == 1 && items[1][2] == 1 ||
       items[2][0] == 1 && items[2][1] == 1 && items[2][2] == 1 ||
    // 
       items[0][0] == 1 && items[1][0] == 1 && items[2][0] == 1 ||
       items[0][1] == 1 && items[1][1] == 1 && items[2][1] == 1 ||
       items[0][2] == 1 && items[1][2] == 1 && items[2][2] == 1 ||
    //
       items[0][0] == 1 && items[1][1] == 1 && items[2][2] == 1 ||
       items[2][0] == 1 && items[1][1] == 1 && items[0][2] == 1 )
    {
        console.log(convertToBoard(playerLetter) + " wins")
        clearBoard();
    }
    else if(items[0][0] == 0 && items[0][1] == 0 && items[0][2] == 0 ||
            items[1][0] == 0 && items[1][1] == 0 && items[1][2] == 0 ||
            items[2][0] == 0 && items[2][1] == 0 && items[2][2] == 0 ||
     // 
            items[0][0] == 0 && items[1][0] == 0 && items[2][0] == 0 ||
            items[0][1] == 0 && items[1][1] == 0 && items[2][1] == 0 ||
            items[0][2] == 0 && items[1][2] == 0 && items[2][2] == 0 ||
     //
            items[0][0] == 0 && items[1][1] == 0 && items[2][2] == 0 ||
            items[2][0] == 0 && items[1][1] == 0 && items[0][2] == 0 )
     {
        console.log(convertToBoard(playerLetter) + " wins")
        clearBoard();

     }
}

function checkDraw()
{
    if(items[0][0] != 2 && items[0][1] != 2  && items[0][2] != 2 && items[1][0] != 2 && items[1][1] != 2 && items[1][2] != 2 && items[2][0] != 2 && items[2][1] != 2 && items[2][2] != 2) 
    {
        console.log("game is a draw");
        clearBoard();
    }
}

function clearBoard()
{
    items = [
        [2, 2, 2],
        [2, 2, 2],
        [2, 2, 2]
      ];
}

function setupGame()
{
    clearBoard();
    outputBoard(items);
}