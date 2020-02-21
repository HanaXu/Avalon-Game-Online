<template>
  <div class="card">
    <div class="card-body">
      <div class="message-ctn" v-chat-scroll>
        <div class="message" v-bind:key="message.id" v-for="message in messages">
          <strong>{{message.username + " "}}</strong>
          <span class="timestamp">({{message.time}})</span>
          <br />
          {{message.text}}
        </div>
      </div>
    </div>
    <hr />
    <textarea
      class="textarea"
      rows="1"
      placeholder="Press Enter to send your message..."
      v-on:keyup.enter="sendMessage"
    ></textarea>
  </div>
</template>

<script>
import firebase from "firebase";
import { mapState } from "vuex";

export default {
  name: "Chat",
  data() {
    return {
      messages: []
    };
  },
  computed: mapState(["roomCode", "name"]),
  methods: {
    sendMessage(e) {
      e.preventDefault();
      // Trim newline from message
      e.target.value = e.target.value.replace(/^\s+|\s+$/g, "");
      let timeStamp = this.timeStamp();
      const path = `chat/room-messages/${this.roomCode}`;

      if (e.target.value) {
        const message = {
          username: this.name,
          text: e.target.value,
          time: timeStamp
        };
        // Push message to firebase reference
        firebase
          .database()
          .ref(path)
          .push(message);
        e.target.value = "";
      } else {
        console.log(e);
      }
    },
    timeStamp() {
      let now = new Date();
      let time = [now.getHours(), now.getMinutes()];
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
    const path = `chat/room-messages/${this.roomCode}`;
    const itemsRef = firebase.database().ref(path);

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
.card {
  background: #eae7e3;
}
.card-body {
  padding: 5px;
}
.card > hr {
  margin: 0;
  padding: 0;
}
.message-ctn {
  text-align: left;
  min-height: 50vh;
  max-height: 50vh;
  overflow-x: hidden;
  overflow-y: auto;
}
.message {
  padding: 2px;
  margin: 5px;
}
.timestamp {
  font-size: .75rem;
  color: grey;
}
.textarea {
  background: transparent;
  overflow-y: auto;
  min-width: 100px;
  resize: none;
  padding: 5px;
  margin: 5px;
}
</style>