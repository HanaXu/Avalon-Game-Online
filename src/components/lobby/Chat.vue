<template>
  <div id="app">
    <div class="card">
      <div class="card-header p-2">Chat</div>
      <div class="card-body">
        <dl id="messageList"></dl>
        <div class="messages" v-chat-scroll>
          <div class="message" v-bind:key="message.id" v-for="message in messages">
            <strong>{{message.username + " "}}</strong>
            <font size="2" color="grey">({{message.time}})</font>
            <br>
            {{message.text}}
          </div>
        </div>
      </div>
      <hr>
      <textarea
        type="text"
        placeholder="Press Enter to send your message..."
        v-on:keyup.enter="sendMessage"
      ></textarea>
    </div>
  </div>
</template>

<script>
import firebase from "firebase";
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
        // Push message to firebase reference
        firebase
          .database()
          .ref("chat/room-messages/" + this.roomCode)
          .push(message);
        e.target.value = "";
      } else {
        console.log("Something went wrong...");
        console.log(e);
      }
    },
    // joinMessage() {
    //   let joined = this.yourName + " joined the room.";
    //   let timeStamp = this.timeStamp();

    //   const message = {
    //     username: "",
    //     text: joined,
    //     time: timeStamp,
    //     type: "join"
    //   };

    //   firebase
    //     .database()
    //     .ref("chat/room-messages/" + this.roomCode)
    //     .push(message);
    //   // console.log("Join message sent");
    // },
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
    const itemsRef = firebase.database().ref("chat/room-messages/" + roomCode);

    itemsRef.on("value", snapshot => {
      var messages = [];
      let data = snapshot.val() || null;
      // Display all messages in the current room
      if (data) {
        Object.keys(data).forEach(key => {
          messages.push({
            id: key,
            username: data[key].username,
            text: data[key].text,
            time: data[key].time
          });
        });
      }
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
.messages {
  text-align: left;
  width: inherit;
  /* max-height: 35vh;
  overflow-x: hidden;
  overflow-y: auto; */
}
.message {
  border: #000 solid 2px;
  padding: 2px;
  margin: 5px;
  width: inherit;
}
div.row {
  width: 30vw;
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
  padding: 5px;
}
div.messages {
  min-height: 50vh;
  max-height: 50vh;
  overflow-x: hidden;
  overflow-y: auto;
}
div.message {
  border: none;
}
textarea {
  overflow: hidden;
  min-width: 100px;
  resize: none;
  word-wrap: normal;
  padding: 5px;
  margin: 5px;
}
* {
  margin: 0;
  padding: 0;
}
</style>