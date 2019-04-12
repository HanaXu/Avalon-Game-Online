<template>
    <div id="app">
        <div class="row">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">Chatroom</div>
                    <div class="card-body">
                        <dl id="messageList"></dl>
                        <div class="messages">
                                <h3>Messages</h3>
                                <div class="message" v-for="message in messages">
                                    <strong>{{message.name}}</strong>
                                    <p>{{message.message}}</p>
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
                                <b-button class='btn btn-primary' @click="sendMessage">Send</b-button>
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
    //import Game from '../views/Game.vue';

    export default {
        name: "Chat",
        data() {
            return {
                username: '',
                messages: []
            }
        },
        methods: {
            // updateUsername() {
            //     // e.preventDefault();
            //     // if (e.target.value) {
            //     //     this.username = e.target.value;
            //     // }
            //     this.username = Game.data().yourName;
            // },
            sendMessage(e) {
                e.preventDefault();
                if (e.target.value) {
                    const message = {
                        //username: this.username,
                        username: "testUser",
                        text: e.target.value
                    }
                    //Push message to firebase reference
                    firebase.database().ref('chat/room-messages').push(message)
                    e.target.value = ''
                }
            }
        },
        mounted(){
            let vm = this;
            const itemsRef = firebase.database().ref('chat/room-messages');

            itemsRef.on('value', snapshot => {
                let data = snapshot.val() || null;
                let messages = [];

                if(data) {
                    Object.keys(data).forEach(key => {
                        messages.push({
                            id: key,
                            username: data[key].name,
                            text: data[key].message
                        });

                        console.log("data: ", data,
                            " | key: ", key,
                            " | username: ", data[key].name,
                            " | text: ", data[key].message);
                    });
                } else {
                    console.log("data = null");
                }

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
        width: inherit;
        overflow-y: auto;
    }
    div.message {
        width: inherit;
    }
    textarea {
        width: inherit;
        resize: none;
        word-wrap: normal;
    }
</style>