<template>
  <div class="card">
    <div class="card-body message-ctn" v-chat-scroll>
      <div v-for="message in messages" :key="message.id" class="message">
        <em v-if="message.serverMsg" style="color: grey">{{message.serverMsg}}</em>
        <div v-else>
          <strong>{{`${message.playerName} `}}</strong>
          <span class="timestamp">({{message.time}})</span>
          <br />
          {{message.msg}}
        </div>
      </div>
    </div>
    <hr />
    <textarea
      v-if="showMsgInput"
      class="textarea"
      rows="1"
      placeholder="Press Enter to send..."
      v-on:keyup.enter="sendMessage"
    ></textarea>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  data() {
    return {
      messages: [],
      showMsgInput: null
    };
  },
  computed: mapState(["roomCode", "playerName"]),
  methods: {
    sendMessage(e) {
      e.preventDefault();
      this.$socket.emit("updateChat", {
        id: Date.now(),
        playerName: this.playerName,
        msg: e.target.value,
        time: this.timeStamp()
      });
      e.target.value = "";
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
  sockets: {
    initChat({msgs, showMsgInput}) {
      this.messages = msgs;
      this.showMsgInput = showMsgInput;
    },
    updateChat(msg) {
      this.messages.push(msg);
    }
  }
};
</script>

<style scoped>
.card {
  background: rgba(234, 231, 227, 0.5);
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
  font-size: 0.75rem;
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