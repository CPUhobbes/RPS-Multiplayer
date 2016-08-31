// Initialize Firebase

var config = {
	apiKey: "AIzaSyD1kC59azlbLde4dl0T-8Z2qdm9ifRCjHo",
	authDomain: "rps-multiplayer-616fd.firebaseapp.com",
	databaseURL: "https://rps-multiplayer-616fd.firebaseio.com",
	storageBucket: "rps-multiplayer-616fd.appspot.com",
};
firebase.initializeApp(config);


var playerID=0;
var openPlayerOne=true;
var openPlayerTwo=true;
var playerName="";
var canJoin = true;

var numWins = 0;
var numLosses = 0;



clearChat();
getCurrentPlayers();
readChat();
checkResult();


$(document).on("click", "#joinGame", function(){
	var playerName = $("#nameBox").val();
	addUser(playerName);

});


$(document).on("click", "#sendMessage", function(){
	var message = $("#messageText").val();
	writeChat(message);

});

$(document).on("click", ".selection", function(){

	//alert($(this).data("item"));
	playerChoice($(this).data("item"));
});



function getCurrentPlayers(){
	var ref = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/player/");
	ref.on("value", function(snapshot) {
		var playerOneBool = snapshot.child("1").exists();
		var playerTwoBool = snapshot.child("2").exists();
		//console.log(snapshot.val()["1"]);
		if(playerOneBool){
			$("#playerOneName").html(snapshot.val()["1"].name);
			 openPlayerOne=false;
		}
		else{
			openPlayerOne=true;
			$("#playerOneName").html("Waiting For Player");
		}
		if(playerTwoBool){
			$("#playerTwoName").html(snapshot.val()["2"].name);
			openPlayerTwo=false;
		}
		else{
			openPlayerTwo=true;
			$("#playerTwoName").html("Waiting For Player");
		}

	});
}


function addUser(currentPlayer){
	var ref = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/player");

	if((openPlayerOne  || openPlayerTwo) && canJoin){
		if(openPlayerOne  && openPlayerTwo){
			ref.update({ 1: {
							name: currentPlayer,
							wins: 0,
							losses: 0,
						}});
			playerID=1;
		}

		else if(openPlayerOne  && !openPlayerTwo){
			ref.update({ 1: {
							name: currentPlayer,
							wins: 0,
							losses: 0,
						}});
			playerID=1;
		}
		else if(openPlayerTwo && !openPlayerOne){
			ref.update({ 2: {
							name: currentPlayer,
							wins: 0,
							losses: 0,
						}});
			playerID=2;
		}
		playerName=currentPlayer;
		connectDB(playerName);
		disconnectDB(playerID);
		canJoin = false;
		writePlayerDiv();
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
	var ref = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/chat");
	ref.on("value", function(snapshot) {
		if(snapshot.exists()){
	  		var chatObject = snapshot.val();
	  		Object.keys(chatObject).forEach(function(key) {
				//console.log("Message:"+chatObject[key]);
	  			$("#chatBox").append(chatObject[key]+'\n');
  			});
  		}
	});

}


function disconnectDB(num){

	var ref = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/player/"+num);
	var chat = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/chat");
	chat.onDisconnect().update({line: playerName+" has Left the game"});
	//chat.onDisconnect().remove();
	
	ref.onDisconnect().remove();
	
}

function connectDB(name){

	var connectedRef = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/.info/connected");
	connectedRef.on("value", function(snapshot) {
	  	if (snapshot.val() === true) {
	    	writeChat(name+" has entered the game");
	  	} 
	  	// else {
	   //  	writeChat(name+" has Left the game");
	  	// }
	});
}

function clearChat(){
	var chat = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/chat");
	chat.remove();
}

function writePlayerDiv(){
	var tempDiv = $("#player"+playerID+"Items");
	var rock = "<div class=\"selection\" data-item=\"rock\">ROCK</div>";
	var paper = "<div class=\"selection\"  data-item=\"paper\">PAPER</div>";
	var scissors = "<div class=\"selection\" data-item=\"scissors\">SCISSORS</div>";
	tempDiv.append(rock,paper,scissors);

	var tempDiv = $("#player"+playerID+"Score");
	var score = "<p>Wins:<span id=\"wins"+playerID+"\">"+numWins+"</span>Losses:<span id=\"losses"+playerID+"\">"+numLosses+"</span></p>";
	tempDiv.append(score);

}

function playerChoice(item){

	var ref = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/player");

	var tempRef = ref.child(playerID);
	tempObj =  {choice: item};
	tempRef.update(tempObj);

}
function checkResult(){
	var ref = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/player");

	ref.on("value", function(snapshot) {
		var tempBool1 = snapshot.child("1").child("choice").exists();
		var tempBool2 = snapshot.child("2").child("choice").exists();
		if(tempBool1  && tempBool2){
			var pOneChoice = snapshot.child("1").child("choice").val();
			var pTwoChoice = snapshot.child("2").child("choice").val();

			console.log(pOneChoice, pTwoChoice);

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

	console.log(playerNum, playerID);
	if(playerNum === playerID){
		numWins+=1;
		// alert("win");
		$("#wins"+playerID).html(numWins);
		// updateScore(true);

	}
	else if(playerNum === 0){

		alert("tie");
	}
	else{
		numLosses+=1;
		// alert("lose");
		console.log("loser");
		$("#losses"+playerID).html(numLosses);
		// updateScore(false);

	}
	console.log(numWins, numLosses, "here");
	clearScore();
}
function clearScore(){
	var ref = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/player");
	ref.child("1").child("choice").remove();
	ref.child("2").child("choice").remove();
}

// function updateScore(winner){
// 	var ref = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/player");
// 	var tempRef = ref.child(playerID);
// 	if(winner){
// 		tempObj =  {wins: numWins};
// 		tempRef.update(tempObj);
// 	}
// 	else{
// 		tempObj =  {losses: numLosses};
// 		tempRef.update(tempObj);
// 	}


// }