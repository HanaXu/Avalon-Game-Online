<template>
    <div id="app">
        <div class="row">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">Chatroom</div>
                    <div class="card-body">
                        <dl id="messageList"></dl>
                        <div class="messages">
                                <div class="message" v-bind:key="message.id" v-for="message in messages">
                                    <strong>{{message.username}}</strong>
                                    {{message.text}}
                                </div>
                            </div>
                        </div>
                        <hr>
                        <!--<form id="sendMessage" method="post">-->
                            <!--<div class='input-group'>-->
                                <!--<input type='text' name='message' class="form-control" placeholder="Type your message...">-->

                                <!--<div class='input-group-append'>-->
                                    <!--<button class='btn btn-primary'>Send</button>-->
                                <!--</div>-->
                            <!--</div>-->
                        <!--</form>-->
                        <div class="input-group">
                            <input type="text" name="" id="" cols="30" row="2" placeholder="Enter your message..." v-on:keyup.enter="sendMessage">
                            <div class='input-group-append'>
                                <button class='btn btn-primary' v-on:click="sendMessage">Send</button>
                            </div>
                        </div>

                        <!--<textarea name="" id="" cols="30" rows="2" placeholder="New Message" v-on:keyup.enter="sendMessage"></textarea>-->

                        <!--<div v-if="!username">-->
                            <!--You can't chat without a name. What's your name? <br />-->
                            <!--<input type="text" placeholder="Name"-->
                                   <!--v-on:keyup.enter="updateUsername">-->
                        <!--</div>-->
                        <!--<div v-else>-->
                            <!--From : {{username}}-->
                            <!--Message:<br />-->
                            <!--<textarea name="" id="" cols="30" rows="10" placeholder="New Message" v-on:keyup.enter="sendMessage"></textarea>-->
                        <!--</div>-->


                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import firebase from 'firebase';

    export default {
        name: "Chat",
        data() {
            return {
                username: '',
                messages: []
            }
        },
        props: ["your-name", "room-code"],
        methods: {
            sendMessage(e) {
                e.preventDefault();

                console.log("in sendMessage");

                if (e.target.value) {
                    const message = {
                        username: this.yourName,
                        //username: "testUser",
                        text: e.target.value
                    }
                    console.log("Your message is: ", message);
                    //Push message to firebase reference
                    firebase.database().ref('chat/room-messages/' + this.roomCode).push(message);
                    console.log("Sent message");
                    e.target.value = ''
                } else {
                    console.log("Something went wrong...");
                    console.log(e);
                }
            }
        },
        mounted(){
            let vm = this;
            let username = this.yourName;
            let roomCode = this.roomCode;

            const itemsRef = firebase.database().ref('chat/room-messages/' + roomCode);

            itemsRef.on('value', snapshot => {
                var messages = []
                let data = snapshot.val() || null;
                if (!data) {
                    console.log('Warning: No chat rooms exist!')
                }
                console.log("Chat Name: ", username);
                console.log("Chat Room Code: ", roomCode);

                // display all messages in the current room
                Object.keys(data).forEach(key => {
                    messages.push({
                        id: key,
                        username: data[key].username,
                        text: data[key].text
                    });

                    // console.log("data: ", data,
                    //     " | key: ", this.id,
                    //     " | username: ", this.username,
                    //     " | text: ", this.text);
                });

                vm.messages = messages;
            });
        },
    }
</script>

<style scoped>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
    .messages {
        text-align: left;
    }
    .message {
        border: #000 solid 2px;
        padding: 5px;
        margin: 5px;
        width: 200px;
    }
    div.row {
        width: 50vw;
    }
    div.col-md-8 {
        width: inherit;
    }
    div.card {
        width: inherit;
    }
    div.card-header {
        width: inherit;
    }
    div.card-body {
        width: inherit;
    }
    div.messages {
        height: 300px;
        width: 380px;
        overflow-y: auto;
    }
    div.message {
        width: inherit;
        border: none;
    }
    textarea {
        width: inherit;
        resize: none;
        word-wrap: normal;
    }
</style>