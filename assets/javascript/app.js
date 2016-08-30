// Initialize Firebase

var config = {
	apiKey: "AIzaSyD1kC59azlbLde4dl0T-8Z2qdm9ifRCjHo",
	authDomain: "rps-multiplayer-616fd.firebaseapp.com",
	databaseURL: "https://rps-multiplayer-616fd.firebaseio.com",
	storageBucket: "rps-multiplayer-616fd.appspot.com",
};
firebase.initializeApp(config);



// firebase.auth().signInAnonymously().catch(function(error) {
//   // Handle Errors here.
//   var errorCode = error.code;
//   var errorMessage = error.message;
//   // ...
// });


var PLAYER_ID;


var playerCount=1;
var playerObject;


// writeUserData("eric");
// writeUserData("jim");

getCurrentPlayers();
readChat();



$(document).on("click", "#joinGame", function(){
	var playerName = $("#nameBox").val();
	connectDB(playerName);
	addUser(playerName);

});

function getCurrentPlayers(){
	var ref = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/players");
	// var playerCount = firebase.database().ref('players/');
	// playerCount.on('value', function(snapshot) {
		ref.on("value", function(snapshot) {
			var anyPlayers = snapshot.exists();
			var playerOneBool = snapshot.child("player1").exists();
			var playerTwoBool = snapshot.child("player2").exists();
			console.log(anyPlayers);
			if(anyPlayers){
				var playerCount = firebase.database().ref('players/');
				playerCount.on('value', function(snapshotTwo) {
					playerObject = snapshotTwo.val()
					if(playerOneBool){
						$("#playerOneName").html(playerObject.player1);

					}
					if(playerOneBool){
						$("#playerTwoName").html(playerObject.player2);
					}

				});

			}
		
		//playerObject = snapshot.val()
		// var playerOne = playerObject.player1;
		// var playerTwo = playerObject.player2;
		
		//if(playerOne !== null  && playerTwo !== null){
			//GAME FULL DO SOMETHING
		//}
		// //else{
		// 	if(playerOne !==null){
		// 		$("#playerOneName").html(playerObject.player1);
		// 	}
		// 	if(playerTwo !==null){
		// 		$("#playerTwoName").html(playerObject.player2);
		// 	}
		// //}
		//console.log(playerOne, playerTwo);

		});



}


function writeUserData(name) {
	var sendPlayer = {};
	sendPlayer["player"+playerCount] = name;

	firebase.database().ref('players/').update(sendPlayer);
	
	console.log("test");
	playerCount+=1;
}

function addUser(name){
	console.log(name);
	writeUserData(name);


}


function writeChat(chat){
	firebase.database().ref('chat/').update(chat);

}

function readChat(){
	console.log("readChat");
	var ref = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/chat");
	ref.on("value", function(snapshot) {
		if(snapshot.exists()){
			console.log("readChat");
			var chatCount = firebase.database().ref('chat/');
			chatCount.on('value', function(snapshotTwo) {
				chatObject = snapshotTwo.val();
				console.log(Object.keys(chatObject).length);
				Object.keys(chatObject).forEach(function(key) {
					console.log(chatObject[key]);



				});
			});
		}
	});


}

function connectDB(name){
	var connectedRef = new Firebase("https://rps-multiplayer-616fd.firebaseio.com/.info/connected");
	connectedRef.on("value", function(snap) {
  	if (snap.val() === true) {
    	$("#chatBox").val(name+" has entered the game");
  	} 
  	else {
    	$("#chatBox").val(name+" has left the game");
  	}
});



}
