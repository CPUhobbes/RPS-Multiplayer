// Initialize Firebase
var config = {
    apiKey: "AIzaSyD1kC59azlbLde4dl0T-8Z2qdm9ifRCjHo",
    authDomain: "rps-multiplayer-616fd.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-616fd.firebaseio.com",
    storageBucket: "rps-multiplayer-616fd.appspot.com",
};
firebase.initializeApp(config);
var database = firebase.database();

/*
 *Global Variables
 */

//Static variables
var ANI_DIR = "assets/images/characters/animation/";
var MUSIC_DIR = "assets/audio/music/";
var MUSIC_LIST = ["courtyard.mp3", "palace_gates.mp3", "pit.mp3", "throne_room.mp3", "warrior_shrine.mp3"];

//Player variables
var playerWarrior="";
var fighterName1 ="";
var fighterName2 ="";
var playerName="Noob Saibot"; //Default Name
var playerID=0;
var hasSelectedFighter = false;

//Database variables
var openPlayerOne=true;
var openPlayerTwo=true;
var canJoin = true;

//Scoring variables
var numWins = 0;
var numLosses = 0;
var winsP1=0;
var winsP2=0;
var lossesP1=0;
var lossesP2=0;

//Choice Evariables
var choiceOne;
var choiceTwo;

//nding condition variables
var winnerText="";
var winnerNumber = 0;

//Timers
var gameTimer;
var resultsTimer;

//Audio 
var playAudio = true;

/*
 * JQuery ready, click functions
 */

 //Document ready
$(document).ready(function(){
	
	$("#playerNameTextbox").val("Enter Your Name");
	clearChat();
	getCurrentPlayers();
	readChat();
	checkResult();
	getScore();
	$("#myModal").modal('show');
});

//Audio button image change and audio mute
$(document).on("click", ".buttonPlayer", function(){
	if(playAudio){
		$(".audioButton").removeClass("fa-pause");
		$(".audioButton").addClass("fa-play");
		playAudio = false;
		mute(false);
	}
	else{
		$(".audioButton").removeClass("fa-play");
		$(".audioButton").addClass("fa-pause");
		playAudio = true;
		mute(true);

	}
	
});

//Clear chat textbox on click
$(document).on("click", "#playerNameTextbox", function(){
	$(this).val("");
});

//Select portrait for player
$(document).on("click", ".fightersPortrait", function(){

	$(".fightersPortrait").removeClass("portraitBackground");
	$(this).addClass("portraitBackground");
	playerWarrior = $(this).data("name");

	if(playerWarrior!==""){
		$("#modalButton").attr("data-dismiss","modal");
	}
	hasSelectedFighter = true;

	//audio for character selection
	if(playAudio){
		$("#characterSounds").attr("src","./assets/audio/sfx/"+playerWarrior+".mp3");
		document.getElementById("characterSounds").play();
	}
});

//Start game after player meets conditions
$(document).on("click", "#modalButton", function(){
	if(hasSelectedFighter){
		if("Enter Your Name"!== $("#playerNameTextbox").val() && $("#playerNameTextbox").val() !== ""){
			playerName = $("#playerNameTextbox").val();
		}

		if(openPlayerOne){
			$("#playerName1").html(playerName);
			addUser(playerName, 1, playerWarrior);

		}

		else if(openPlayerTwo){
			$("#playerName2").html(playerName);
			addUser(playerName, 2, playerWarrior);
		}

		else{
			alert("Game Full"); // ----------- ADD "CANNOT JOIN AT THIS TIME" MESSAGE
		}
	}
});

//Send Messages by click
$(document).on("click", "#sendMessage", function(){
	var message = $("#messageText").val();
	writeChat(message);
	$("#messageText").val("");

});

//Send Messages by "enter" keypress
$("input").keypress(function(event) {
    if (event.which == 13) {
    	event.preventDefault();
    	var message = $("#messageText").val();
       	writeChat(message);
       	$("#messageText").val("");
    }
});

//Click weapon and sets player choice
$(document).on("click", ".weaponImage", function(){
	var itemChoice = $(this).data("item");
	$("#textResult").empty();
	$("#textResult").append("<p class=\"weaponText\">Waiting For Player</p>");
	$("#weaponHolderPlayer"+playerID).empty();
	$("#weaponHolderPlayer"+playerID).append(
		"<div class=\"text-center\"><img class=\"weaponImage\" data-item=\""+itemChoice+"\" width=\"80\" src=\"./assets/images/weapons/"+itemChoice+".png\"></div>");
	playerChoice(itemChoice);

});

/*
 * Database functions
 */

 //Connect and Disconnect from database
 function connectDB(name){
	database.ref().child(".info").on("child_added", function(snapshot) {
	  	if (snapshot.val() === true) {
	    	writeChat(name+" has entered the game!");
	  	} 
	});
}
function disconnectDB(num){
	database.ref().child("chat").onDisconnect().update({line: playerName+" has left the game!"});
	database.ref().child("player").child(playerID).onDisconnect().remove();
}

//Get current players from database
function getCurrentPlayers(){

	//See what player positions are open when just joining game or a child is added 
	database.ref().child("player").on("child_added", function(snapshot) {

		 if(snapshot.val().seat === 1){
			$("#playerName1").html(snapshot.val().name);
			$("#playerFighter1").attr("src", ANI_DIR+snapshot.val().fighter+".gif");
			$("#playerHealth1").css({"width":"0%"});
		 	openPlayerOne=false;
			fighterName1 = snapshot.val().fighter;
		 	 
		 }

		 else if(snapshot.val().seat === 2){
		 	$("#playerFighter2").attr("src", ANI_DIR+snapshot.val().fighter+".gif");
			$("#playerName2").html(snapshot.val().name);
			$("#playerHealth2").css({"width":"0%"});
		 	openPlayerTwo=false;
		 	fighterName2 = snapshot.val().fighter;
		 }

		 //Show message/fighting screen if both players are present
		 if(!openPlayerOne && !openPlayerTwo){
			$("#fightBox").css({"visibility":"visible"});
		}
	});

	//When a player leaves remove character info from game
	database.ref().child("player").on("child_removed", function(snapshot) {

		var seatNum = snapshot.val().seat;

		 if(seatNum === 1){
		 	$("#playerName1").html("Waiting for Player");
		 	$("#playerFighter1").attr("src", ANI_DIR+"empty.png");
		 	$("#playerHealth1").css({"width":"100%"});
			$("#scorePlayer1").html("Wins: 0 Losses: 0");
			leaveChair(seatNum);
		 }

		 else if(seatNum === 2){
		 	$("#playerName2").html("Waiting for Player");
		 	$("#playerFighter2").attr("src", ANI_DIR+"empty.png");
		 	$("#playerHealth2").css({"width":"100%"});
			$("#scorePlayer2").html("Wins: 0 Losses: 0");
		 	leaveChair(seatNum);
		 }
	});
}


//See what player positions are open and add the player if possible
function addUser(currentPlayer, seatNum, warrior){

	if((openPlayerOne  || openPlayerTwo) && canJoin){
		if(openPlayerOne  && openPlayerTwo && seatNum ===1){
			database.ref().child("player").update({ 1: {
							name: currentPlayer,
							wins: 0,
							losses: 0,
							seat:1,
							fighter:warrior
						}});
			playerID=1;
		}

		else if(openPlayerOne  && openPlayerTwo && seatNum ===2){
			database.ref().child("player").update({ 2: {
							name: currentPlayer,
							wins: 0,
							losses: 0,
							seat:2,
							fighter:warrior
						}});
			playerID=2;
		}

		else if(openPlayerOne  && !openPlayerTwo){
			database.ref().child("player").update({ 1: {
							name: currentPlayer,
							wins: 0,
							losses: 0,
							seat:1,
							fighter:warrior
						}});
			playerID=1;
		}

		else if(openPlayerTwo && !openPlayerOne){
			database.ref().child("player").update({ 2: {
							name: currentPlayer,
							wins: 0,
							losses: 0,
							seat:2,
							fighter:warrior
						}});
			playerID=2;
		}

		//Change intro music to game music
		$("#music_player").removeAttr("autoplay");
		$("#music_player").removeAttr("loop");
		changeAudio();
		$("#music_player").on('ended', changeAudio);

		//Setup player conditions
		playerName=currentPlayer;
		connectDB(playerName);
		disconnectDB(playerID);
		canJoin = false;
		showWeapons();
		showAudioControls();
	}

	else if(!canJoin && playerID>0){
		alert("You are already playing");
	}

	else{
		alert("Game Full!");
	}
}

function writeChat(chat){
	var lineObj = {line: chat};
	database.ref('chat/').update(lineObj);
}

function readChat(){
	var message="";
	database.ref().child("chat").on("child_changed", function(snapshot) {

	if(snapshot.exists()){
	  		var chatObject = snapshot.val();

	  		if(chatObject !==""){
	  			$("#chatBox").append(chatObject+'\n');
	  			$("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);
	  		}
  		}
	});
}

//Clear chat when joining a game in database
function clearChat(){
	database.ref().child("chat").set({line:""});
}

//Sends the player choice to the database
function playerChoice(item){
	var tempObj =  {choice: item};
	database.ref().child("player").child(playerID).update(tempObj);
}

//Get results from database and checks for winning condition
function checkResult(){

	database.ref().on("child_changed", function(snapshot) {

		//Check to see if both players have made a choice
		var tempBool1 = snapshot.child("1").child("choice").exists();
		var tempBool2 = snapshot.child("2").child("choice").exists();

		//If both choices have been made
		if(tempBool1  && tempBool2){ 
			var pOneChoice = snapshot.child("1").child("choice").val();
			var pTwoChoice = snapshot.child("2").child("choice").val();
			clearResults(); // remove choice from database
			//P1 - Rock
			//P2 - Scissors
			if ((pOneChoice === "rock") && (pTwoChoice === "scissors")){
				$("#playerRPS1").attr("alt", "rock").attr("width", "100").attr("src", "assets/images/left_R.gif");
				$("#playerRPS2").attr("alt", "scissors").attr("width", "100").attr("src", "assets/images/right_S.gif");
				winnerText=$("#playerName1").html()+" Wins!";
				winnerNumber =1;
				results(1);
			}
			//P1 - Rock
			//P2 - Paper
			else if ((pOneChoice === "rock") && (pTwoChoice === "paper")){
				$("#playerRPS1").attr("alt", "rock").attr("width", "100").attr("src", "assets/images/left_R.gif");
				$("#playerRPS2").attr("alt", "paper").attr("width", "100").attr("src", "assets/images/right_P.gif");
				winnerText=$("#playerName2").html()+" Wins!";
				winnerNumber =2;
				results(2);
			}
			//P1 - Scissors
			//P2 - Rock
			else if ((pOneChoice === "scissors") && (pTwoChoice === "rock")){
				$("#playerRPS1").attr("alt", "scissors").attr("width", "100").attr("src", "assets/images/left_S.gif");
				$("#playerRPS2").attr("alt", "rock").attr("width", "100").attr("src", "assets/images/right_R.gif");
				winnerText=$("#playerName2").html()+" Wins!";
				winnerNumber =2;
				results(2);
			}
			//P1 - Scissors
			//P2 - Paper
			else if ((pOneChoice === "scissors") && (pTwoChoice === "paper")){
				$("#playerRPS1").attr("alt", "scissors").attr("width", "100").attr("src", "assets/images/left_S.gif");
				$("#playerRPS2").attr("alt", "paper").attr("width", "100").attr("src", "assets/images/right_P.gif");
				winnerText=$("#playerName1").html()+" Wins!";
				winnerNumber =1;
				results(1);
			}
			//P1 - Paper
			//P2 - Rock
			else if ((pOneChoice === "paper") && (pTwoChoice === "rock")){
				$("#playerRPS1").attr("alt", "paper").attr("width", "100").attr("src", "assets/images/left_P.gif");
				$("#playerRPS2").attr("alt", "rock").attr("width", "100").attr("src", "assets/images/right_R.gif");
				winnerText=$("#playerName1").html()+" Wins!";
				winnerNumber =1;
				results(1);
			}
			//P1 - Paper
			//P2 - Scissors
			else if ((pOneChoice === "paper") && (pTwoChoice === "scissors")){
				$("#playerRPS1").attr("alt", "paper").attr("width", "100").attr("src", "assets/images/left_P.gif");
				$("#playerRPS2").attr("alt", "scissors").attr("width", "100").attr("src", "assets/images/right_S.gif");
				winnerText=$("#playerName2").html()+" Wins!";
				winnerNumber =2;
				results(2);
			}
			//Tie - Paper
			else if ((pOneChoice === pTwoChoice) && (pTwoChoice === "paper")){
				$("#playerRPS1").attr("alt", "paper").attr("width", "100").attr("src", "assets/images/left_P.gif");
				$("#playerRPS2").attr("alt", "paper").attr("width", "100").attr("src", "assets/images/right_P.gif");
				winnerText="It's a Tie!";
				winnerNumber =0;
				results(0);
			}
			//Tie - Scissors
			else if ((pOneChoice === pTwoChoice) && (pTwoChoice === "scissors")){
				$("#playerRPS1").attr("alt", "scissors").attr("width", "100").attr("src", "assets/images/left_S.gif");
				$("#playerRPS2").attr("alt", "scissors").attr("width", "100").attr("src", "assets/images/right_S.gif");
				winnerText="It's a Tie!";
				winnerNumber =0;
				results(0);
			}
			//Tie - Rock
			else if ((pOneChoice === pTwoChoice) && (pTwoChoice === "rock")){
				$("#playerRPS1").attr("alt", "rock").attr("width", "100").attr("src", "assets/images/left_R.gif");
				$("#playerRPS2").attr("alt", "rock").attr("width", "100").attr("src", "assets/images/right_R.gif");
				winnerText="It's a Tie!";
				winnerNumber =0;
				results(0);
			}
		}
	});	
}

/*
 * Local game functions
 */

//Update local win/losses based on game results
function results(playerNum){
	console.log(numWins, numLosses);
	if(playerNum === playerID){
		numWins+=1;
	}
	else if((playerNum !== 0) && (playerNum !== playerID )){

		numLosses+=1;
	}
	updateScoreDB();  //Update score in database
	newGameTimer();  //Timer to show results
}

//Remove choices from database
function clearResults(){
	database.ref().child("player").child("1").child("choice").remove();
	database.ref().child("player").child("2").child("choice").remove();
}

//Update score in database
function updateScoreDB(){
	if(playerID!==0){
		var tempObj =  {wins: numWins};
		var tempObj2 =  {losses: numLosses};
		database.ref().child("player").child(playerID).update(tempObj);
		database.ref().child("player").child(playerID).update(tempObj2);
	}
}

//Get both player scores from database
function getScore(){

	database.ref().child("player").on("child_changed", function(snapshot) {
		if(snapshot.val().seat === 1){
			winsP1 = snapshot.val().wins;
			lossesP1 = snapshot.val().losses;
		}
		else if (snapshot.val().seat === 2){
			winsP2 = snapshot.val().wins;
			lossesP2 = snapshot.val().losses;
		}

	});
}

//Timers to show results for a limited time
function newGameTimer(){

	$("#textResult").empty();
	resultsTimer = setTimeout(function(){

		resultsDelay();
		audioWinner();
	}
	,2000);

	//resets results screen after timer expires
	gameTimer = setTimeout(function() {
		//Replacing SRC. If not, gifs will not reload animation.
		$("#playerRPS1").attr("src", "assets/images/characters/animation/empty.png");
		$("#playerRPS1").attr("alt", "dummyIMG");
		$("#playerRPS1").attr("width", "1");
		$("#playerRPS2").attr("src", "assets/images/characters/animation/empty.png");
		$("#playerRPS2").attr("alt", "dummyIMG");
		$("#playerRPS2").attr("width", "1");

		// $("#fightBox").css({"visibility":"hidden"});
		$("#textResult").empty();
		showWeapons();
		
	}
	, 5000);
}

//Change player locations boolean if a player leaves
function leaveChair(seatNum){
	if(seatNum===1){
		openPlayerOne=true;
	}
	else{
		openPlayerTwo=true;
	}
}

//Show weapons when entering game and new round
function showWeapons(){
		$("#textResult").append("<p class=\"weaponText\">Choose Your Weapon</p>");
	  	$("#weaponHolderPlayer"+playerID).empty();
		var imgDiv = $("#weaponHolderPlayer"+playerID);
		var rock = "<div class=\"text-center\"><img class=\"weaponImage\" data-item=\"rock\" width=\"80\" src=\"./assets/images/weapons/rock.png\"></div>";
		var paper = "<div class=\"text-center\"><img class=\"weaponImage\" data-item=\"paper\" width=\"80\" src=\"./assets/images/weapons/paper.png\"></div>";
		var scissors = "<div class=\"text-center\"><img class=\"weaponImage\" data-item=\"scissors\" width=\"80\" src=\"./assets/images/weapons/scissors.png\"></div>";
		imgDiv.append(rock,paper,scissors);
		$("#weaponHolderPlayer"+playerID).css({"visibility":"visible"});
}

//Shows results after newGameTimer() expires
function resultsDelay(){
	$("#textResult").append("<p class=\"endText\">"+winnerText+"</p>");
	var ratioP1 = (lossesP1/(lossesP1+winsP1))*100;
	$("#playerHealth1").css({"width":ratioP1+"%"});
	$("#scorePlayer1").html("Wins: "+winsP1+" Losses: "+lossesP1);

	var ratioP2 = (lossesP2/(lossesP2+winsP2))*100;
	$("#playerHealth2").css({"width":ratioP2+"%"});
	$("#scorePlayer2").html("Wins: "+winsP2+" Losses: "+lossesP2);
}

/*
 * Audio functions
 */

//Change music (randomly) and play if not muted
function changeAudio() {  
	$("#music_player").attr("src", MUSIC_DIR+MUSIC_LIST[Math.ceil(Math.random()*MUSIC_LIST.length)-1]);
	if(playAudio){
		document.getElementById("music_player").play();
	}
}

//Mute sound
function mute(sound){
	if(sound){
		document.getElementById("music_player").play();
	}
	else{
		document.getElementById("music_player").pause();
	}
}

//Show audio control after player enters (for better presentation)
function showAudioControls(){
 	$("#audioBox").css({"visibility":"visible"});
}

//Play the winner audio phrase if not muted
function audioWinner() {  
	var winner;
	if(winnerNumber === 1){
		winner = fighterName1;
	}
	else if (winnerNumber === 2){
		winner = fighterName2;
	}
	else{
		winner = "fatality";
	}
	if(playAudio){
		$("#characterSounds").attr("src", "assets/audio/sfx/"+winner+"_wins.mp3");
		document.getElementById("characterSounds").play();
	}
}