
//get a reference to the database service
var database = firebase.database();

/**
 * @function updateUserInfo(var userId, var username)
 * takes the id of a specific user and their desired username and updates database with username
 */
function updateUserInfo(var userId, var username) {
    firebase.database().ref('users/' + userId).set({
        name: username
    });
}

function createGameRoom(var roomId) {
    var gameRoomRef = ref.child("gamerooms");

    //create a game room with the given room id and various other relevant data
    gameRoomRef.set({
        roomId: {
            //data1 : "data",
            //data2 : "data"
        }
    });
    firebase.database().ref('gamerooms/')
}

function findGameRoom(var roomId) {
    var ref = firebase.database().ref("room-metadata");
    ref.equalTo(roomId)
}