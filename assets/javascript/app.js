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



clearChat();
getCurrentPlayers();
readChat();


$(document).on("click", "#joinGame", function(){
	var playerName = $("#nameBox").val();
	addUser(playerName);

});


$(document).on("click", "#sendMessage", function(){
	var message = $("#messageText").val();
	writeChat(message);

});

function getCurrentPlayers(){
	var ref = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/players/");
	ref.on("value", function(snapshot) {
		var playerOneBool = snapshot.child("player1").exists();
		var playerTwoBool = snapshot.child("player2").exists();
		if(playerOneBool){
			$("#playerOneName").html(snapshot.val().player1);
			 openPlayerOne=false;
		}
		else{
			openPlayerOne=true;
			$("#playerOneName").html("Waiting For Player");
		}
		if(playerTwoBool){
			$("#playerTwoName").html(snapshot.val().player2);
			openPlayerTwo=false;
		}
		else{
			openPlayerTwo=true;
			$("#playerTwoName").html("Waiting For Player");
		}

	});
}


function addUser(name){
	var ref = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/players");

	if((openPlayerOne  || openPlayerTwo) && canJoin){
		if(openPlayerOne  && openPlayerTwo){
			ref.update({ player1: name});
			playerID=1;
		}

		else if(openPlayerOne  && !openPlayerTwo){
			ref.update({ player1: name});
			playerID=1;
		}
		else if(openPlayerTwo && !openPlayerOne){
			ref.update({ player2: name});
			playerID=2;
		}
		playerName=name;
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
	var ref = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/chat");
	ref.on("value", function(snapshot) {
		if(snapshot.exists()){
			console.log("temp");
	  		console.log(snapshot.val());
	  		var chatObject = snapshot.val();

	  		Object.keys(chatObject).forEach(function(key) {
				console.log("Message:"+chatObject[key]);
	  			$("#chatBox").append(chatObject[key]+'\n');
  			});
  		}
	});

}


function disconnectDB(num){

	var ref = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/players/player"+num);
	var chat = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/chat");
	chat.onDisconnect().update({line:playerName+" has Left the game"});
	chat.onDisconnect().remove();
	ref.onDisconnect().remove();
	console.log("remove");
}

function connectDB(name){

	var connectedRef = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/.info/connected");
	connectedRef.on("value", function(snap) {
	  	if (snap.val() === true) {
	    	//$("#chatBox").val(name+" has entered the game");
	    	writeChat(name+" has entered the game");
	  	} 
	  	else {
	    	writeChat(name+" has Left the game");
	  	}
	});

}

function clearChat(){
	var chat = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/chat");
	chat.remove();
}
