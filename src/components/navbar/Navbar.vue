<template>
  <b-navbar toggleable="lg" class="navbar-default container">
    <b-navbar-brand>
      <img
        src="../../../public/img/icons/favicon-32x32.png"
        alt="Avalonline icon"
        width="32"
        height="32"
      />
      Avalonline
      <span v-if="roomCode">Room {{ roomCode }}</span>
    </b-navbar-brand>
    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav>
        <b-nav-item to="/" @click="reload">Home</b-nav-item>
        <b-nav-item v-b-modal.modal-game-rules busy="true">Game rules</b-nav-item>
        <b-nav-item v-b-modal.modal-game-roles busy="true">Game roles</b-nav-item>
      </b-navbar-nav>
    </b-collapse>
    <NavModal name="rules" :dataArr="rules" />
    <NavModal name="roles" :dataArr="roles" />
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
      rules: [
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
      roles: [
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
  computed: mapState(["roomCode"]),
  methods: {
    reload() {
      window.location.reload();
    }
  }
};
</script>