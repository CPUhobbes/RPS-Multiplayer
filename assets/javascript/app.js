// Initialize Firebase

var config = {
    apiKey: "AIzaSyD1kC59azlbLde4dl0T-8Z2qdm9ifRCjHo",
    authDomain: "rps-multiplayer-616fd.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-616fd.firebaseio.com",
    storageBucket: "rps-multiplayer-616fd.appspot.com",
};
firebase.initializeApp(config);
var database = firebase.database();

//NEW
var playerWarrior="";
var playerName="Noob Saibot";
var hasSelectedFighter = false;

//NEW

var ANI_DIR = "assets/images/characters/animation/";


var playerID=0;
var openPlayerOne=true;
var openPlayerTwo=true;
//var playerName="";
var canJoin = true;

var numWins = 0;
var numLosses = 0;

var choiceOne;
var choiceTwo;

var timer;


$(document).ready(function(){
	
	$("#playerNameTextbox").val("Enter Your Name");
	clearChat();
	getCurrentPlayers();
	readChat();
	checkResult();
	getScore();
	$("#myModal").modal('show');

});


$(document).on("click", "#playerNameTextbox", function(){
	$(this).val("");
});

$(document).on("click", ".fightersPortrait", function(){
	$(".fightersPortrait").css({"background-color": "transparent"});
	$(this).css({"background-color": "#00cc00"});
	playerWarrior = $(this).data("name");

	if(playerWarrior!==""){
		$("#modalButton").attr("data-dismiss","modal");
	}
	hasSelectedFighter = true;
});

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
			alert("Nope"); // ----------- ADD CANNOT JOIN MESSAGE AT THIS TIME
		}
	}
});

$(document).on("click", "#sendMessage", function(){
	var message = $("#messageText").val();
	writeChat(message);

});

$(document).on("click", ".weaponImage", function(){
	var itemChoice = $(this).data("item");
	$("#weaponHolderPlayer"+playerID).empty();
	$("#weaponHolderPlayer"+playerID).append(
		"<div class=\"text-center\"><img class=\"weaponImage\" data-item=\""+itemChoice+"\" width=\"80\" src=\"./assets/images/weapons/"+itemChoice+".png\"></div>");
	playerChoice(itemChoice);

});



function getCurrentPlayers(){


	database.ref().child("player").on("child_added", function(snapshot) {

		 if(snapshot.val().seat === 1){
			$("#playerName1").html(snapshot.val().name);
			$("#playerFighter1").attr("src", ANI_DIR+snapshot.val().fighter+".gif");
			$("#imgBlock1").empty();
		 	 openPlayerOne=false;
		 }

		 else if(snapshot.val().seat === 2){
		 	$("#playerFighter2").attr("src", ANI_DIR+snapshot.val().fighter+".gif");
			$("#playerName2").html(snapshot.val().name);
		 	 openPlayerTwo=false;
		 }
	});

	database.ref().child("player").on("child_removed", function(snapshot) {

		var seatNum = snapshot.val().seat;

		 if(seatNum === 1){
		 	$("#playerName1").html("Waiting for Player");
		 	$("#playerFighter1").attr("src", ANI_DIR+"empty.png");
		 	leaveChair(seatNum);
		 }

		 else if(seatNum === 2){
		 	$("#playerName2").html("Waiting for Player");
		 	$("#playerFighter2").attr("src", ANI_DIR+"empty.png");
		 	leaveChair(seatNum);
		 }
	});
}

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
		console.log(numWins, numLosses);
		showWeapons();
		playerName=currentPlayer;
		connectDB(playerName);
		disconnectDB(playerID);
		canJoin = false;

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

	firebase.database().ref('chat/').update(lineObj);

}

function readChat(){
	var message="";
	database.ref().child("chat").on("child_changed", function(snapshot) {

	if(snapshot.exists()){
	  		var chatObject = snapshot.val();

	  		if(chatObject !==""){
	  			$("#chatBox").append('\n'+chatObject);
	  			$("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);
	  		}
  		}
	});

}


function disconnectDB(num){
	database.ref().child("chat").onDisconnect().update({line: playerName+" has left the game!"});
	database.ref().child("player").child(playerID).onDisconnect().remove();
}

function connectDB(name){
	database.ref().child(".info").on("child_added", function(snapshot) {
	  	if (snapshot.val() === true) {
	    	writeChat(name+" has entered the game!");
	  	} 
	});
}

function clearChat(){
	database.ref().child("chat").set({line:""});
}

function writePlayerDiv(){

	for(var i=1;i<3;++i){
		var tempDiv = $("#player"+i+"Score");
		var score = "<p>Wins:<span id=\"wins"+i+"\">"+numWins+"</span>Losses:<span id=\"losses"+i+"\">"+numLosses+"</span></p>";
		tempDiv.append(score);
	}
}

function playerChoice(item){
	var tempObj =  {choice: item};
	database.ref().child("player").child(playerID).update(tempObj);

}

function checkResult(){

	database.ref().on("child_changed", function(snapshot) {

		var tempBool1 = snapshot.child("1").child("choice").exists();
		var tempBool2 = snapshot.child("2").child("choice").exists();

		if(tempBool1  && tempBool2){
			var pOneChoice = snapshot.child("1").child("choice").val();
			var pTwoChoice = snapshot.child("2").child("choice").val();
			clearResults();
			$("#fightBox").css({"visibility":"visible"});
			if ((pOneChoice === "rock") && (pTwoChoice === "scissors")){
				
				$("#playerRPS1").attr("alt", "rock").attr("width", "100").attr("src", "assets/images/left_R.gif");
				$("#playerRPS2").attr("alt", "scissors").attr("width", "100").attr("src", "assets/images/right_S.gif");

				$("#textResult").append("<h3>Player 1 Wins!</h3>");
				console.log(pOneChoice, pTwoChoice);
				results(1);
			}
			else if ((pOneChoice === "rock") && (pTwoChoice === "paper")){
				$("#playerRPS1").attr("alt", "rock").attr("width", "100").attr("src", "assets/images/left_R.gif");
				$("#playerRPS2").attr("alt", "paper").attr("width", "100").attr("src", "assets/images/right_P.gif");
				$("#textResult").append("<h3>Player 2 Wins!</h3>");
				console.log(pOneChoice, pTwoChoice);
				results(2);
			}
			else if ((pOneChoice === "scissors") && (pTwoChoice === "rock")){
				$("#playerRPS1").attr("alt", "scissors").attr("width", "100").attr("src", "assets/images/left_S.gif");
				$("#playerRPS2").attr("alt", "rock").attr("width", "100").attr("src", "assets/images/right_R.gif");
				$("#textResult").append("<h3>Player 2 Wins!</h3>");
				console.log(pOneChoice, pTwoChoice);
				results(2);
			}
			else if ((pOneChoice === "scissors") && (pTwoChoice === "paper")){
				$("#playerRPS1").attr("alt", "scissors").attr("width", "100").attr("src", "assets/images/left_S.gif");
				$("#playerRPS2").attr("alt", "paper").attr("width", "100").attr("src", "assets/images/right_P.gif");
				$("#textResult").append("<h3>Player 1 Wins!</h3>");
				console.log(pOneChoice, pTwoChoice);
				results(1);
			}
			else if ((pOneChoice === "paper") && (pTwoChoice === "rock")){
				$("#playerRPS1").attr("alt", "paper").attr("width", "100").attr("src", "assets/images/left_P.gif");
				$("#playerRPS2").attr("alt", "rock").attr("width", "100").attr("src", "assets/images/right_R.gif");
				$("#textResult").append("<h3>Player 1 Wins!</h3>");
				console.log(pOneChoice, pTwoChoice);
				results(1);
			}
			else if ((pOneChoice === "paper") && (pTwoChoice === "scissors")){
				$("#playerRPS1").attr("alt", "paper").attr("width", "100").attr("src", "assets/images/left_P.gif");
				$("#playerRPS2").attr("alt", "scissors").attr("width", "100").attr("src", "assets/images/right_S.gif");
				$("#textResult").append("<h3>Player 2 Wins!</h3>");
				console.log(pOneChoice, pTwoChoice);
				results(2);
			}
			else if ((pOneChoice === pTwoChoice) && (pTwoChoice === "paper")){
				$("#playerRPS1").attr("alt", "paper").attr("width", "100").attr("src", "assets/images/left_P.gif");
				$("#playerRPS2").attr("alt", "paper").attr("width", "100").attr("src", "assets/images/right_P.gif");
				$("#textResult").append("<h3>Its a Tie!</h3>");
				console.log(pOneChoice, pTwoChoice);
				results(0);
			}
			else if ((pOneChoice === pTwoChoice) && (pTwoChoice === "scissors")){
				$("#playerRPS1").attr("alt", "scissors").attr("width", "100").attr("src", "assets/images/left_S.gif");
				$("#playerRPS2").attr("alt", "scissors").attr("width", "100").attr("src", "assets/images/right_S.gif");
				$("#textResult").append("<h3>Its a Tie!</h3>");
				console.log(pOneChoice, pTwoChoice);
				results(0);
			}
			else if ((pOneChoice === pTwoChoice) && (pTwoChoice === "rock")){
				$("#playerRPS1").attr("alt", "rock").attr("width", "100").attr("src", "assets/images/left_R.gif");
				$("#playerRPS2").attr("alt", "rock").attr("width", "100").attr("src", "assets/images/right_R.gif");
				$("#textResult").append("<h3>Its a Tie!</h3>");
				console.log(pOneChoice, pTwoChoice);
				results(0);
			}
		}
	});
		
}

function results(playerNum){
	console.log(numWins, numLosses);
	if(playerNum === playerID){
		numWins+=1;
	}
	else if((playerNum !== 0) && (playerNum !== playerID )){

		numLosses+=1;
	}
	// else{ //TIE
		
	// }
	console.log(numWins, numLosses);
	updateScoreDB();
	newGameTimer();

}
function clearResults(){
	database.ref().child("player").child("1").child("choice").remove();
	database.ref().child("player").child("2").child("choice").remove();
}


function updateScoreDB(){
	if(playerID!==0){
		var tempObj =  {wins: numWins};
		var tempObj2 =  {losses: numLosses};
		database.ref().child("player").child(playerID).update(tempObj);
		database.ref().child("player").child(playerID).update(tempObj2);
	}

	
}

function getScore(){

	database.ref().child("player").on("child_changed", function(snapshot) {
		if(snapshot.val().seat === 1){
			$("#scorePlayer1").html("Wins: "+ snapshot.val().wins+" Losses: "+snapshot.val().losses);
			// $("#winsPlayer1").html(snapshot.val().wins);
		}
		else if (snapshot.val().seat === 2){
			$("#scorePlayer2").html("Wins: "+ snapshot.val().wins+" Losses: "+snapshot.val().losses);
		}
	});
}

function newGameTimer(){
	timer = setTimeout(function() {
		$("#fightBox").css({"visibility":"hidden"});
		$("#playerRPS1").attr("src", "assets/images/characters/animation/empty.png");
		$("#playerRPS1").attr("alt", "dummyIMG");
		$("#playerRPS1").attr("width", "1");

		$("#playerRPS2").attr("src", "assets/images/characters/animation/empty.png");
		$("#playerRPS2").attr("alt", "dummyIMG");
		$("#playerRPS2").attr("width", "1");

		$("#textResult").empty();
		showWeapons();
	}
	, 4000);
}

function sitInChair(){
	showWeapons();

}

function leaveChair(seatNum){
	// if(playerID===0){
	// 	$("#joinBlock"+seatNum).append("<input type=\"text\" class=\"nameTextBox\" id=\"playerName"+seatNum+"\" value=\"Enter Name\" size=\"15\" />"+ 
	// 									"<button class=\"joinButton\" data-player=\""+seatNum+"\">Join</button>");
	// }
	// $("#playerScore"+seatNum).empty();
	// $("#playerNameBox"+seatNum).empty();
	// $("#playerNameBox"+seatNum).append("<h2>Waiting for Player</h2>");
	if(seatNum===1){
		openPlayerOne=true;
	}
	else{
		openPlayerTwo=true;
	}
}

function showWeapons(){
	  	$("#weaponHolderPlayer"+playerID).empty()
		var imgDiv = $("#weaponHolderPlayer"+playerID);
		$("#weaponHolderPlayer"+playerID).css({"display":"inline-block"});
		var rock = "<div class=\"text-center\"><img class=\"weaponImage\" data-item=\"rock\" width=\"80\" src=\"./assets/images/weapons/rock.png\"></div>";
		var paper = "<div class=\"text-center\"><img class=\"weaponImage\" data-item=\"paper\" width=\"80\" src=\"./assets/images/weapons/paper.png\"></div>";
		var scissors = "<div class=\"text-center\"><img class=\"weaponImage\" data-item=\"scissors\" width=\"80\" src=\"./assets/images/weapons/scissors.png\"></div>";
		imgDiv.append(rock,paper,scissors);
	//}

}