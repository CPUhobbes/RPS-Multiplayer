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

});



$(document).on("click", ".nameTextBox", function(){
	$(this).val("");
});




$(document).on("click", ".joinButton", function(){
	var pOneName = $("#playerOneName").val();
	var pTwoName = $("#playerTwoName").val();
	var playerDataNum = $(this).data("player");

	if((playerDataNum === 1)  && (pOneName!=="") && (pOneName!==null) && (pOneName!="Enter Name")){
		addUser(pOneName);
		console.log($("#playerOneName").val());
	}
	else if((playerDataNum === 2)  && (pTwoName!=="") && (pTwoName!==null) && (pTwoName!="Enter Name")){
		addUser(pTwoName);
		console.log($("#playerTwoName").val());
	}

});


$(document).on("click", "#sendMessage", function(){
	var message = $("#messageText").val();
	writeChat(message);

});

$(document).on("click", ".selection", function(){
	playerChoice($(this).data("item"));

});



function getCurrentPlayers(){
	database.ref().on("value", function(snapshot) {
		var playerOneBool = snapshot.child("player").child("1").exists();
		var playerTwoBool = snapshot.child("player").child("2").exists();
		if(playerOneBool){
			$("#playerOneName").html(snapshot.child("player").val()["1"].name);
			 openPlayerOne=false;
		}
		else{
			openPlayerOne=true;
			$("#playerOneName").html("Waiting For Player");
		}
		if(playerTwoBool){
			$("#playerTwoName").html(snapshot.child("player").val()["2"].name);
			openPlayerTwo=false;
		}
		else{
			openPlayerTwo=true;
			$("#playerTwoName").html("Waiting For Player");
		}

	});
}


function addUser(currentPlayer){
	if((openPlayerOne  || openPlayerTwo) && canJoin){
		if(openPlayerOne  && openPlayerTwo){
			database.ref().child("player").update({ 1: {
							name: currentPlayer,
							wins: 0,
							losses: 0,
						}});
			playerID=1;
		}

		else if(openPlayerOne  && !openPlayerTwo){
			database.ref().child("player").update({ 1: {
							name: currentPlayer,
							wins: 0,
							losses: 0,
						}});
			playerID=1;
		}
		else if(openPlayerTwo && !openPlayerOne){
			database.ref().child("player").update({ 2: {
							name: currentPlayer,
							wins: 0,
							losses: 0,
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
	database.ref().child("chat").on("value", function(snapshot) {
		if(snapshot.exists()){
	  		var chatObject = snapshot.val();
	  		Object.keys(chatObject).forEach(function(key) {
	  			$("#chatBox").append(chatObject[key]+'\n');
  			});
  		}
	});

}


function disconnectDB(num){
	database.ref().child("chat").onDisconnect().update({line: playerName+" has Left the game"});
	database.ref().child("player/"+num).onDisconnect().remove();
	
}

function connectDB(name){
	database.ref().child(".info/connected").on("value", function(snapshot) {
	  	if (snapshot.val() === true) {
	    	writeChat(name+" has entered the game");
	  	} 
	});
}

function clearChat(){
	database.ref().child("chat").remove();
}

function writePlayerDiv(){
	var tempDiv = $("#player"+playerID+"Items");
	var rock = "<div class=\"selection\" data-item=\"rock\">ROCK</div>";
	var paper = "<div class=\"selection\"  data-item=\"paper\">PAPER</div>";
	var scissors = "<div class=\"selection\" data-item=\"scissors\">SCISSORS</div>";
	tempDiv.append(rock,paper,scissors);

	for(var i=1;i<3;++i){

		var tempDiv = $("#player"+i+"Score");
		var score = "<p>Wins:<span id=\"wins"+i+"\">"+numWins+"</span>Losses:<span id=\"losses"+i+"\">"+numLosses+"</span></p>";
		tempDiv.append(score);
	}
	getScore();
}

function playerChoice(item){
	var tempObj =  {choice: item};
	database.ref().child("player").child(playerID).update(tempObj);

}

function checkResult(){

	database.ref().on("child_changed", function(snapshot) {

		//console.log(snapshot.val());

		var tempBool1 = snapshot.child("1").child("choice").exists();
		var tempBool2 = snapshot.child("2").child("choice").exists();
		if(tempBool1  && tempBool2){
			var pOneChoice = snapshot.child("1").child("choice").val();
			var pTwoChoice = snapshot.child("2").child("choice").val();
			getChoice();
			clearResults();

			if ((pOneChoice === "rock") && (pTwoChoice === "scissors")){
				results(1);
			}
			else if ((pOneChoice === "rock") && (pTwoChoice === "paper")){
				results(2);
			}
			else if ((pOneChoice === "scissors") && (pTwoChoice === "rock")){

				results(2);
			}
			else if ((pOneChoice === "scissors") && (pTwoChoice === "paper")){

				results(1);
			}
			else if ((pOneChoice === "paper") && (pTwoChoice === "rock")){

				results(1);
			}
			else if ((pOneChoice === "paper") && (pTwoChoice === "scissors")){

				results(2);
			}
			else if (pOneChoice === pTwoChoice){
				results(0);
			}
		}
	});
		
}

function results(playerNum){

	if(playerNum === playerID){
		numWins+=1;
	}
	else if(playerNum === 0){

		alert("tie");
	}
	else{
		numLosses+=1;
	}
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
	getScore();
}

function getScore(){
	var ref = database.ref().child("player");
	ref.on("value", function(snapshot){
		$("#losses1").html(snapshot.child("1").child("losses").val());
		$("#wins1").html(snapshot.child("1").child("wins").val());
		$("#losses2").html(snapshot.child("2").child("losses").val());
		$("#wins2").html(snapshot.child("2").child("wins").val());
		console.log($("#losses1").html(snapshot.child("1").child("losses").val()));
		console.log($("#wins1").html(snapshot.child("1").child("wins").val()));
	});
}


function getChoice(){
	var ref = database.ref().child("player");
	ref.once("value", function(snapshot){
		choiceOne = snapshot.child("1").child("choice").val();
		choiceTwo = snapshot.child("2").child("choice").val()
		if(choiceTwo!=null){
			$("#player2Choice").html("Player 2: "+choiceTwo);
		}
		else{
			$("#player2Choice").html("");
		}
		if(choiceOne!=null){
			$("#player1Choice").html("Player 1: "+choiceOne);
		}
		else{
			$("#player1Choice").html("");

		}
		
	});
}

function newGameTimer(){
	timer = setTimeout(function() {
		$("#player2Choice").html("");
		$("#player1Choice").html("");

	}

	, 3000);
}


function sitInChair(){

	$("#imgBlock"+playerID).empty();
	$("#joinBlock1"+playerID).empty();
	
	$("#playerNameBox"+playerID).append("<h2 id=\"playerName"+playerID+"\">"+playerName+"</h2>");
	var imgDiv = $("#imgBlock"+playerID);
	var rock = "<img class=\"selection\" data-item=\"rock\" width=\"100\" src=\"./assets/images/rock.png\">";
	var paper = "<img class=\"selection\" data-item=\"paper\" width=\"100\" src=\"./assets/images/paper.png\">";
	var scissors = "<img class=\"selection\" data-item=\"scissors\" width=\"100\" src=\"./assets/images/scissors.png\">";
	imgDiv.append(rock,paper,scissors);


	$("#playerScore"+playerID).append("<p>Wins:<span id=\"wins"+playerID+"\">"+numWins+"</span>Losses:<span id=\"losses"+playerID+"\">"+numLosses+"</span></p>");


	//getScore();


}