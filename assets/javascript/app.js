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

console.log(playerID);

clearChat();
getCurrentPlayers();
readChat();
checkResult();
getChoice();
//getScore();




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
	//var ref = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/player/");
	database.ref().on("value", function(snapshot) {
		var playerOneBool = snapshot.child("player").child("1").exists();
		var playerTwoBool = snapshot.child("player").child("2").exists();
		//console.log(snapshot.val()["1"]);
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
	//var ref = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/player");

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
	//var ref = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/chat");
	database.ref().child("chat").on("value", function(snapshot) {
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

	//var ref = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/player/"+num);
	//var chat = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/chat");
	database.ref().child("chat").onDisconnect().update({line: playerName+" has Left the game"});
	//chat.onDisconnect().remove();
	
	database.ref().child("player/"+num).onDisconnect().remove();
	
}

function connectDB(name){

	//var connectedRef = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/.info/connected");
	database.ref().child(".info/connected").on("value", function(snapshot) {
	  	if (snapshot.val() === true) {
	    	writeChat(name+" has entered the game");
	  	} 
	  	// else {
	   //  	writeChat(name+" has Left the game");
	  	// }
	});
}

function clearChat(){
	//var chat = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/chat");
	//chat.remove();
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
	//var ref = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/player");
	database.ref().child("player").child(playerID).update(tempObj);
	//var tempRef = ref.child(playerID);
	//tempObj =  {choice: item};
	//tempRef.update(tempObj);

}
function checkResult(){
	//var ref = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/player");


	database.ref().child("player").on("value", function(snapshot) {
		var tempBool1 = snapshot.child("1").child("choice").exists();
		var tempBool2 = snapshot.child("2").child("choice").exists();
		if(tempBool1  && tempBool2){
		
			var pOneChoice = snapshot.child("1").child("choice").val();
			var pTwoChoice = snapshot.child("2").child("choice").val();
			//getScore();
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
			updateScore();
		}
		
		getScore();
	});
	

	
	
}

function results(playerNum){

	console.log(playerNum, playerID);
	if(playerNum === playerID){
		numWins+=1;
	}
	else if(playerNum === 0){

		alert("tie");
	}
	else{
		numLosses+=1;
	}

	if(confirm("Play AGAIN?")){
		
		clearResults();
	}
	

}
function clearResults(){
	$("#player1Choice").html(choiceOne);
	$("#player2Choice").html(choiceTwo);

	// var ref = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/player");
	database.ref().child("player").child("1").child("choice").remove();
	database.ref().child("player").child("2").child("choice").remove();
	// ref.child("1").child("choice").remove();
	// ref.child("2").child("choice").remove();
}

function updateScore(){
	if(playerID!==0){
		// var ref = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/player");

		//var tempRef = ref.child(playerID);
		var tempObj =  {wins: numWins};
		//tempRef.update(tempObj);
		var tempObj2 =  {losses: numLosses};
		//tempRef.update(tempObj);
		database.ref().child("player").child(playerID).update(tempObj);
		database.ref().child("player").child(playerID).update(tempObj2);
	}
}

function getScore(){
	//var ref = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/player");
	var ref = database.ref().child("player");
	ref.on("value", function(snapshot){
		$("#losses1").html(snapshot.child("1").child("losses").val());
		$("#wins1").html(snapshot.child("1").child("wins").val());
		$("#losses2").html(snapshot.child("2").child("losses").val());
		$("#wins2").html(snapshot.child("2").child("wins").val());
	});
}


function getChoice(){
	var ref = database.ref().child("player");
	ref.on("value", function(snapshot){
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