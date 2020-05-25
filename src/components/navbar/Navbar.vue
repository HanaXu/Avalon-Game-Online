<template>
  <b-navbar toggleable="lg" class="navbar-default container">
    <b-navbar-brand>
      <img
        src="../../../public/img/icons/favicon-32x32.png"
        alt="AvalonGame icon"
        width="32"
        height="32"
      />
      AvalonGame
      <span v-if="roomCode">: Room {{ roomCode }}</span>
    </b-navbar-brand>
    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav>
        <b-nav-item to="/" @click="reload">Home</b-nav-item>
        <b-nav-item
          v-for="(value, key) in this.$data"
          :key="key"
          v-b-modal="'modal-' + key"
          busy="true"
        >
          {{key}}
          <NavModal :name="key" :arr="value" />
        </b-nav-item>
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto">
        <b-nav-text>
          Server Status:
          <span
            :class="{
              'text-success': serverStatus === 'Connected',
              'text-danger': serverStatus === 'Disconnected'}"
          >{{serverStatus}}</span>
        </b-nav-text>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
import Home from "@/views/Home.vue";
import NavModal from "@/components/navbar/NavModal.vue";
import { mapState } from "vuex";

export default {
  components: {
    Home,
    NavModal
  },
  data() {
    return {
      About: [
        {
          heading: "",
          html: `<p>AvalonGame is a free online adaptation of the board game The Resistance: Avalon.<br/>
                No registration or login is required, simply start playing by creating a room!</p>
                <p><i>This is a passion project and not affiliated with the original game.</i></p>
                <p>Development: <a href="https://github.com/HanaXu/Avalon-Online" target="__blank">
                https://github.com/HanaXu/Avalon-Online <svg xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 12 16" width="12" height="16"><path fill-rule="evenodd" 
                d="M11 10h1v3c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V3c0-.55.45-1 1-1h3v1H1v10h10v-3zM6 2l2.25 
                2.25L5 7.5 6.5 9l3.25-3.25L12 8V2H6z"></path></svg></a></p>`
        }
      ],
      Rules: [
        {
          heading: "Objective",
          html: `Avalon is the game of hidden loyalty. Players are either Loyal
                Servants of Arthur fighting for Good and honor or aligned with the Evil ways of Mordred.
                <br/><br/>Good wins the game by: <ul><li>Successfully completing three Quests 
                and ensuring Merlin is not assassinated at the end.</li></ul>
                Evil wins if one of the following is true: <ul><li>Three Quests end in failure</li>
                <li>By assassinating Merlin at the end</li> <li>If the votetrack hits 5.</li></ul>
                Players may make any claims during the game.
                Deception, accusation, and logical deducation are all equally important in order
                for good to prevail or evil to rule the day.`
        },
        {
          heading: "Game Play",
          html: `The game consists of several rounds; each round has a team building phase and a quest phase.<br/>
                <ul><li>In the team building phase, the quest leader proposes a team to go on the quest.
                <ul><li>All the players will either approve the proposed team and move to the quest phase</li>
                <li>Or, reject the proposed team, pass leadership to the next player, and repeat the process until a team is approved.</li>
                <li>If five teams are rejected in a single round, evil wins.</li></ul><li>In the
                Quest phase, players selected to be on the team will annonymously vote to succeed or fail the quest.</li>
                <ul><li>The quest will fail if there is at least 1 failed vote 
                (unless indicated otherwise; some quests will require at least 2 fails)</li></ul></ul>`
        },
        {
          heading: "Assassinate Merlin",
          html: `If 3 quests are completed successfully, evil players will have a final
                opportunity to win the game by correctly guessing who Merlin is. <br/><br/>
                Evil players may now openly discuss who they think Merlin is and the assassin
                will choose one good player to assassinate. <ul><li>If the chosen player is Merlin, evil wins.</li>
                <li>If the chosen player is not Merlin, good wins.</li></ul>`
        }
      ],
      Roles: [
        {
          heading: "Loyal Servant of Arthur (good)",
          html: `You have no special abilities.<br/>
                Your primary goal is to figure out who is bad based on this order:
                <ol><li>Mission success/failure</li>
                <li>Voting</li>
                <li>Deception indicators</li>`
        },
        {
          heading: "Minion of Mordred (evil)",
          html: `You have no special abilities.
                <ol><li>Your primary goal is to lose missions.</li><li>Your secondary goal is to try
                to discover who Merlin is so that you can help the Assassin eliminate them at the end.</li></ol>`
        },
        {
          heading: "Merlin (good)",
          html: `Your primary goal is to steer the knights correctly without being obvious you know who all the
                minions are. This means you must make deductions based on actions taken by players in the game.
                <br/><br/>How to give yourself away:
                <ol><li>Knowing too much about who is evil.</li>
                <li>Calling an evil player evil when there is not much/any reason to call them evil.</li>
                <li>Being more helpful to the good side than usual.</li>
                <li>Never being confused or surprised.</li></ol>`
        },
        {
          heading: "Assassin (evil)",
          html: `At the end of the game, if 3 quests succeed, you can assassinate a good player you believe to be Merlin, winning the game for evil.
                <ol><li>Your primary goal is to figure out who Merlin is. (who is voting correctly all the time, etc)</li></ol>`
        },
        {
          heading: "Percival (good)",
          html: `You know which two players are either Morgana or Merlin, but not specifically.
                <br/>Adding Percival balances the game in favor of the good team.
                <ol><li>Your primary goal is to pretend to be Merlin.</li><li>Your secondary goal is to
                determine who Morgana is so you can vote down quests in which they try to participate.</li></ol>`
        },
        {
          heading: "Morgana (evil)",
          html: `You appear as Merlin to Percival, Percival does not know which is which.<ol><li>
                Your primary goal is to pretend to be Merlin/good in order to be put on quests which you can then fail.</li></ol>`
        },
        {
          heading: "Mordred (evil)",
          html: `You appear as good to Merlin.<ol><li>Your primary goal is to pretend to be good and fail quests.</li></ol>`
        },
        {
          heading: "Oberon (evil)",
          html: `You do not know who the evil players are and vice versa. Merlin knows you are evil.<br/>
                Recommended for veterans; Adding Oberon balances the game in favor of the good team.`
        }
      ]
    };
  },
  computed: mapState(["roomCode", "serverStatus"]),
  methods: {
    reload() {
      window.location.reload();
    }
  }
};
</script>