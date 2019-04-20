<template>
  <div>
 <!--   <div class="row">
      <div class="col-md-12">
      -->
        <div class="card">
          <div class="card-header">Chat Room: {{roomCode}}</div>
          <div class="card-body">
            <dl id="messageList"></dl>
            <div class="messages" v-chat-scroll>
              <div class="message" v-bind:key="message.id" v-for="message in messages">
                <strong>{{message.username + " "}}</strong>
                <font size="2" color="grey">({{message.time}})</font>
                <strong>:</strong>
                <br>
                {{message.text}}
              </div>
            </div>
          </div>
          <hr>
          <div class="input-group">
            <div style="width: auto">
              <textarea
                type="text"
                name
                id
                cols="30"
                row="4"
                wrap="hard"
                placeholder="Press Enter to send your message..."
                v-on:keyup.enter="sendMessage"
              ></textarea>
            </div>
          </div>
        </div>


 <!--     </div>
    </div> -->

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

      // console.log("in sendMessage");

      // Trim newline from message
      e.target.value = e.target.value.replace(/^\s+|\s+$/g, "");

      let timeStamp = this.timeStamp();

      if (e.target.value) {
        const message = {
          username: this.yourName,
          text: e.target.value,
          time: timeStamp
        };
        console.log("Your message is: ", message);
        // Push message to firebase reference
        firebase
          .database()
          .ref("chat/room-messages/" + this.roomCode)
          .push(message);
        console.log("Message sent");
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
        time: timeStamp
      };

      firebase
        .database()
        .ref("chat/room-messages/" + this.roomCode)
        .push(message);
      console.log("Join message sent");
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

      return time.join(":") + period;
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
.messages {
  text-align: left;
  /* width: auto; */
  width: inherit;
}
.message {
  border: #000 solid 2px;
  padding: 2px;
  margin: 5px;
  /* width: 200px; */
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
  /* width: inherit; */
  padding: 5px;
}
div.messages {
  /* height: 300px; */
  min-height: 50vh;
  max-height: 50vh;
  /* width: 380px; */
  overflow-x: hidden;
  overflow-y: auto;
}
div.message {
  /* width: 320px; */
  border: none;
}
textarea {
  /* width: inherit; */
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