<template>
  <div id="app">
    <!-- <div class="row">
    <div class="col-md-8">-->
    <div class="card">
      <div class="card-header">Chatroom</div>
      <div class="card-body">
        <dl id="messageList"></dl>
        <div class="messages" v-chat-scroll>
          <div class="message" v-bind:key="message.id" v-for="message in messages">
            <template v-if="message.type==='join'">
              <font color="red">{{message.text}}</font>
            </template>
            <template v-else>
              <strong>{{message.username + " "}}</strong>
              <font size="2" color="grey">({{message.time}})</font>
              <br>
              {{message.text}}
            </template>
          </div>
        </div>
      </div>
      <hr>
      <div class="input-group">
        <div style="width: inherit">
          <textarea
            type="text"
            rows="1"
            wrap="hard"
            placeholder="Press Enter to send..."
            v-on:keyup.enter="sendMessage"
          ></textarea>
        </div>
      </div>
    </div>
    <!-- </div> -->
    <!-- <hr> -->
    <!-- </div> -->
  </div>
</template>

<script>
import firebase from "firebase";
import { bus } from "@/main.js";
import { setInterval } from "timers";
import Vue from "vue";
import VueChatScroll from "vue-chat-scroll";
Vue.use(VueChatScroll);

export default {
  name: "Chat",
  data() {
    return {
      username: "",
      messages: []
    };
  },
  props: ["your-name", "room-code"],
  methods: {
    sendMessage(e) {
      e.preventDefault();

      // Trim newline from message
      e.target.value = e.target.value.replace(/^\s+|\s+$/g, "");

      let timeStamp = this.timeStamp();

      if (e.target.value) {
        const message = {
          username: this.yourName,
          text: e.target.value,
          time: timeStamp
        };
        // console.log("Your message is: ", message);

        // Push message to firebase reference
        firebase
          .database()
          .ref("chat/room-messages/" + this.roomCode)
          .push(message);
        // console.log("Message sent");

        e.target.value = "";
      } else {
        console.log("Something went wrong...");
        console.log(e);
      }
    },
    joinMessage() {
      let joined = this.yourName + " joined the room.";
      let timeStamp = this.timeStamp();

      const message = {
        username: "",
        text: joined,
        time: timeStamp,
        type: "join"
      };

      firebase
        .database()
        .ref("chat/room-messages/" + this.roomCode)
        .push(message);
      // console.log("Join message sent");
    },
    timeStamp() {
      // Create Date object with current time
      let now = new Date();

      // Create array with hours and minutes
      let time = [now.getHours(), now.getMinutes()];

      // Set the period
      let period = time[0] < 12 ? "AM" : "PM";

      // Convert from military time
      time[0] = time[0] < 12 ? time[0] : time[0] - 12;

      // Change hour from 0 to 12 if applicable
      time[0] = time[0] || 12;

      // Add 0 before minutes less than 10
      if (time[1] < 10) {
        time[1] = "0" + time[1];
      }

      let currentTime = time.join(":") + period;

      return currentTime;
    }
  },
  mounted() {
    let vm = this;
    let username = this.yourName;
    let roomCode = this.roomCode;

    bus.$on("joinChat", this.joinMessage());

    const itemsRef = firebase.database().ref("chat/room-messages/" + roomCode);

    itemsRef.on("value", snapshot => {
      var messages = [];
      let data = snapshot.val() || null;
      if (!data) {
        console.log("Warning: No chat rooms exist!");
      }
      // console.log("Chat Name: ", username);
      // console.log("Chat Room Code: ", roomCode);

      // Display all messages in the current room
      Object.keys(data).forEach(key => {
        messages.push({
          id: key,
          username: data[key].username,
          text: data[key].text,
          time: data[key].time
        });

        // console.log("data: ", data, " | key: ", this.id, " | username: ", this.username, " | text: ", this.text);
      });

      vm.messages = messages;
    });
  }
};
</script>

<style scoped>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0;
}
div.card {
  /* width: auto; */
  /* height: auto; */
}
div.card-body {
  padding: 5px;
}
textarea {
  width: 93%;
  resize: none;
  word-wrap: normal;
  padding: 5px;
  margin: 1px;
  display: inline-block;
}
.messages {
  text-align: left;
  width: inherit;
  max-height: 35vh;
  overflow-x: hidden;
  overflow-y: auto;
}
.message {
  padding: 2px;
  margin: 5px;
  width: inherit;
}
/* 

div.row {
  width: 30vw;
  padding: 0;
}
div.col-md-8 {
  width: inherit;
}

div.card-header {
  width: inherit;
  position: relative;
}


div.message {
  border: none;
}
div.input-group {
  width: inherit;
}

* {
  margin: 0;
  padding: 0;
} */
</style>