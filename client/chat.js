// Get a Firebase Database ref
var chatRef = firebase.database().ref("chat")
var chatUI;
var chat;

//boilerplate to be able to make requests
var HttpClient = function () {
    this.get = function (aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function () {
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }
        anHttpRequest.open("GET", aUrl, true);
        anHttpRequest.send(null);
    }
}

function createNewChat(username, roomCode) {
    //instantiate chat UI
    chatUI = new FirechatUI(chatRef, document.getElementById("firechat-wrapper"))
    chat = chatUI._chat;

    //create the room in firebase
    chat.createRoom(roomCode, "public", function (roomId) {
        console.log("room ID: " + roomId);
    });

    //create user in firebase
    firebase.auth().signInAnonymously().catch(function (error) {
        console.log('sign in')
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
    });

    firebase.auth().onAuthStateChanged(function (user) {
        console.log('on auth change')
        if (user) {
            console.log('1')
            // User is signed in.
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            chat.setUser(user.uid, username);
            // ...
        } else {
            console.log('2')
            // User is signed out.
            // ...
        }
        console.log('3')
        // ...
    });
}

//authenticate user with phone number
function phoneAuthenticate() {
    // Initialize the FirebaseUI Widget using Firebase.
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    var uiConfig = {
        signInSuccessUrl: 'index.html',
        signInOptions: [
            firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        ],
        // tosUrl and privacyPolicyUrl accept either url string or a callback
        // function.
        // Terms of service url/callback.
        tosUrl: 'index.html',
        // Privacy policy url/callback.
        privacyPolicyUrl: function () {
            window.location.assign('index.html');
        }
    }
    // The start method will wait until the DOM is loaded.
    ui.start('#firebaseui-auth-container', uiConfig);
    firebase.auth().useDeviceLanguage();
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
    var phoneNumber = getPhoneNumberFromUserInput();
    var appVerifier = window.recaptchaVerifier;
    firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
        .then(function (confirmationResult) {
            // SMS sent. Prompt user to type the code from the message, then sign the
            // user in with confirmationResult.confirm(code).
            window.confirmationResult = confirmationResult;
        }).catch(function (error) {
            // Error; SMS not sent
            // ...
        });
}

function join() {
    //get entered username & roomcode
    username = document.getElementById("username2").value;
    //console.log(username);
    roomCode = document.getElementById("roomcode").value;
    //instantiate firechat ui
    chatUI = new FirechatUI(chatRef, document.getElementById("firechat-wrapper"));
    chat = chatUI._chat;
    //create user
    firebase.auth().signInAnonymously().catch(function (error) {
        console.log('sign in')
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
    });

    firebase.auth().onAuthStateChanged(function (user) {
        console.log('on auth change')
        if (user) {
            console.log('1')
            // User is signed in.
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            chat.setUser(user.uid, username);
            //get all room names and compare with what the user inputted
            //enter the user into the given room
            chat.getRoomList(function (roomList) {
                Object.keys(roomList).forEach(function (key) {
                    if (roomCode === roomList[key].name) {
                        chat.enterRoom(key)
                    }
                });
            });
            // ...
        } else {
            console.log('2')
            // User is signed out.
            // ...
        }
        console.log('3')
        // ...
    });
}