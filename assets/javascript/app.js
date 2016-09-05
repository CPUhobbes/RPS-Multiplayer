// Initialize Firebase

var config = {
    apiKey: "AIzaSyD1kC59azlbLde4dl0T-8Z2qdm9ifRCjHo",
    authDomain: "rps-multiplayer-616fd.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-616fd.firebaseio.com",
    storageBucket: "rps-multiplayer-616fd.appspot.com",
};
firebase.initializeApp(config);
var database = firebase.database();


var playerID=0;
var openPlayerOne=true;
var openPlayerTwo=true;
var playerName="";
var canJoin = true;

var numWins = 0;
var numLosses = 0;

var choiceOne;
var choiceTwo;

var timer;


$(document).ready(function(){

	clearChat();
	getCurrentPlayers();
	readChat();
	checkResult();
	getScore();

});



$(document).on("click", ".nameTextBox", function(){
	$(this).val("");
});




$(document).on("click", ".joinButton", function(){
	var pOneName = $("#playerName1").val();
	var pTwoName = $("#playerName2").val();
	var playerDataNum = $(this).data("player");

	if((playerDataNum === 1)  && (pOneName!=="") && (pOneName!==null) && (pOneName!="Enter Name")){
		addUser(pOneName, playerDataNum);
	}
	else if((playerDataNum === 2)  && (pTwoName!=="") && (pTwoName!==null) && (pTwoName!="Enter Name")){
		addUser(pTwoName, playerDataNum);
	}

});


$(document).on("click", "#sendMessage", function(){
	var message = $("#messageText").val();
	writeChat(message);

});

$(document).on("click", ".selection", function(){
	var itemChoice = $(this).data("item");
	$("#imgBlock"+playerID).empty();
	$("#imgBlock"+playerID).append("<img class=\"selection\" data-item=\""+itemChoice+"\" width=\"100\" src=\"./assets/images/"+itemChoice+".png\">");
	playerChoice(itemChoice);

});



function getCurrentPlayers(){


	database.ref().child("player").on("child_added", function(snapshot) {

		 if(snapshot.val().seat === 1){
		 	$("#playerNameBox1").empty();
			$("#playerNameBox1").append("<h2>"+snapshot.val().name+"</h2>");
			$("#imgBlock1").empty();
		 	$("#imgBlock1").append("<img src=\"assets/images/arnold.png\" alt=\"A chair\" height=\"200\" id=\"leftChair\"/>");
			$("#playerScore1").append("<p>Wins:<span id=\"wins1\">"+numWins+"</span>Losses:<span id=\"losses1\">"+numLosses+"</span></p>");
			$("#joinBlock1").empty();
		 	 openPlayerOne=false;
		 }

		 else if(snapshot.val().seat === 2){
		 	$("#playerNameBox2").empty();
			$("#playerNameBox2").append("<h2>"+snapshot.val().name+"</h2>");
			$("#imgBlock2").empty();
		 	$("#imgBlock2").append("<img src=\"assets/images/theRock.png\" alt=\"A chair\" height=\"200\" id=\"rightChair\"/>");
			$("#playerScore2").append("<p>Wins:<span id=\"wins2\">"+numWins+"</span>Losses:<span id=\"losses2\">"+numLosses+"</span></p>");
			$("#joinBlock2").empty();
		 	 openPlayerTwo=false;
		 }
	});

	database.ref().child("player").on("child_removed", function(snapshot) {

		var seatNum = snapshot.val().seat;

		 if(seatNum === 1){
			$("#leftChair").attr("src", "assets/images/chair.png");
		 	$("#imgBlock1").empty();
		 	$("#imgBlock1").append("<img src=\"assets/images/chair.png\" alt=\"A chair\" height=\"200\" id=\"leftChair\"/>");
		 	leaveChair(seatNum);
		 }

		 else if(seatNum === 2){
			$("#rightChair").attr("src", "assets/images/chair.png");
		 	$("#imgBlock2").empty();
		 	$("#imgBlock2").append("<img src=\"assets/images/chair.png\" alt=\"A chair\" height=\"200\" id=\"rightChair\"/>");
		 	leaveChair(seatNum);
		 }
	});
}

function addUser(currentPlayer, seatNum){

	if((openPlayerOne  || openPlayerTwo) && canJoin){
		if(openPlayerOne  && openPlayerTwo && seatNum ===1){
			database.ref().child("player").update({ 1: {
							name: currentPlayer,
							wins: 0,
							losses: 0,
							seat:1
						}});
			playerID=1;
		}

		else if(openPlayerOne  && openPlayerTwo && seatNum ===2){
			database.ref().child("player").update({ 2: {
							name: currentPlayer,
							wins: 0,
							losses: 0,
							seat:2
						}});
			playerID=2;
		}

		else if(openPlayerOne  && !openPlayerTwo){
			database.ref().child("player").update({ 1: {
							name: currentPlayer,
							wins: 0,
							losses: 0,
							seat:1
						}});
			playerID=1;
		}

		else if(openPlayerTwo && !openPlayerOne){
			database.ref().child("player").update({ 2: {
							name: currentPlayer,
							wins: 0,
							losses: 0,
							seat:2
						}});
			playerID=2;
		}

		sitInChair();
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
	  			$("#chatBox").append(chatObject+'\n');
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

		// console.log(snapshot.val());
		var tempBool1 = snapshot.child("1").child("choice").exists();
		var tempBool2 = snapshot.child("2").child("choice").exists();

		if(tempBool1  && tempBool2){
			var pOneChoice = snapshot.child("1").child("choice").val();
			var pTwoChoice = snapshot.child("2").child("choice").val();
			clearResults();

			if ((pOneChoice === "rock") && (pTwoChoice === "scissors")){
				$("#player1Choice").append("<img src=\"assets/images/left_R.gif\" alt=\"rock\" width=\"100\"/>");
				$("#player2Choice").append("<img src=\"assets/images/right_S.gif\" alt=\"scissors\" width=\"100\"/>");
				$("#result").append("<h3>Player 1 Wins!</h3>");
				results(1);
			}
			else if ((pOneChoice === "rock") && (pTwoChoice === "paper")){
				$("#player1Choice").append("<img src=\"assets/images/left_R.gif\" alt=\"rock\" width=\"100\"/>");
				$("#player2Choice").append("<img src=\"assets/images/right_P.gif\" alt=\"paper\" width=\"100\"/>");
				$("#result").append("<h3>Player 2 Wins!</h3>");
				results(2);
			}
			else if ((pOneChoice === "scissors") && (pTwoChoice === "rock")){
				$("#player1Choice").append("<img src=\"assets/images/left_S.gif\" alt=\"scissors\" width=\"100\"/>");
				$("#player2Choice").append("<img src=\"assets/images/right_R.gif\" alt=\"rock\" width=\"100\"/>");
				$("#result").append("<h3>Player 2 Wins!</h3>");
				results(2);
			}
			else if ((pOneChoice === "scissors") && (pTwoChoice === "paper")){
				$("#player1Choice").append("<img src=\"assets/images/left_S.gif\" alt=\"scissors\" width=\"100\"/>");
				$("#player2Choice").append("<img src=\"assets/images/right_P.gif\" alt=\"paper\" width=\"100\"/>");
				$("#result").append("<h3>Player 1 Wins!</h3>");
				results(1);
			}
			else if ((pOneChoice === "paper") && (pTwoChoice === "rock")){
				$("#player1Choice").append("<img src=\"assets/images/left_P.gif\" alt=\"paper\" width=\"100\"/>");
				$("#player2Choice").append("<img src=\"assets/images/right_R.gif\" alt=\"rock\" width=\"100\"/>");
				$("#result").append("<h3>Player 1 Wins!</h3>");
				results(1);
			}
			else if ((pOneChoice === "paper") && (pTwoChoice === "scissors")){
				$("#player1Choice").append("<img src=\"assets/images/left_P.gif\" alt=\"paper\" width=\"100\"/>");
				$("#player2Choice").append("<img src=\"assets/images/right_S.gif\" alt=\"scissors\" width=\"100\"/>");
				$("#result").append("<h3>Player 2 Wins!</h3>");
				results(2);
			}
			else if ((pOneChoice === pTwoChoice) && (pTwoChoice === "paper")){
				$("#player1Choice").append("<img src=\"assets/images/left_P.gif\" alt=\"paper\" width=\"100\"/>");
				$("#player2Choice").append("<img src=\"assets/images/right_P.gif\" alt=\"paper\" width=\"100\"/>");
				$("#result").append("<h3>Its a Tie!</h3>");
				results(0);
			}
			else if ((pOneChoice === pTwoChoice) && (pTwoChoice === "scissors")){
				$("#player1Choice").append("<img src=\"assets/images/left_S.gif\" alt=\"scissors\" width=\"100\"/>");
				$("#player2Choice").append("<img src=\"assets/images/right_S.gif\" alt=\"scissors\" width=\"100\"/>");
				$("#result").append("<h3>Its a Tie!</h3>");
				results(0);
			}
			else if ((pOneChoice === pTwoChoice) && (pTwoChoice === "rock")){
				$("#player1Choice").append("<img src=\"assets/images/left_R.gif\" alt=\"rock\" width=\"100\"/>");
				$("#player2Choice").append("<img src=\"assets/images/right_R.gif\" alt=\"rock\" width=\"100\"/>");
				$("#result").append("<h3>Its a Tie!</h3>");
				results(0);
			}
		}
	});
		
}

function results(playerNum){

	if(playerNum === playerID){
		numWins+=1;
	}
	else if((playerNum !== 0) && (playerNum !== playerID )){

		numLosses+=1;
	}
	// else{ //TIE
		
	// }
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
			$("#losses1").html(snapshot.val().losses);
			$("#wins1").html(snapshot.val().wins);
		}
		else if (snapshot.val().seat === 2){
			$("#losses2").html(snapshot.val().losses);
			$("#wins2").html(snapshot.val().wins);
		}
	});
}

function newGameTimer(){
	timer = setTimeout(function() {
		$("#player2Choice").empty();
		$("#player1Choice").empty();
		$("#result").empty();
		showWeapons();
	}
	, 4000);
}

function sitInChair(){

	$("#imgBlock"+playerID).empty();
	$("#joinBlock1").empty();
	$("#joinBlock2").empty();
	showWeapons();

}

function leaveChair(seatNum){
	if(playerID===0){
		$("#joinBlock"+seatNum).append("<input type=\"text\" class=\"nameTextBox\" id=\"playerName"+seatNum+"\" value=\"Enter Name\" size=\"15\" />"+ 
										"<button class=\"joinButton\" data-player=\""+seatNum+"\">Join</button>");
	}
	$("#playerScore"+seatNum).empty();
	$("#playerNameBox"+seatNum).empty();
	$("#playerNameBox"+seatNum).append("<h2>Waiting for Player</h2>");
	if(seatNum===1){
		openPlayerOne=true;
	}
	else{
		openPlayerTwo=true;
	}
}

function showWeapons(){

	$("#imgBlock"+playerID).empty();
	var imgDiv = $("#imgBlock"+playerID);
	var rock = "<img class=\"selection\" data-item=\"rock\" width=\"100\" src=\"./assets/images/rock.png\">";
	var paper = "<img class=\"selection\" data-item=\"paper\" width=\"100\" src=\"./assets/images/paper.png\">";
	var scissors = "<img class=\"selection\" data-item=\"scissors\" width=\"100\" src=\"./assets/images/scissors.png\">";
	imgDiv.append(rock,paper,scissors);

}