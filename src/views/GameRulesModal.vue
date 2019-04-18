<template>
  <transition name="modal">
    <div class="modal modal-mask" style="display: block">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <slot name="header">Test</slot>
          </div>

          <div class="modal-body">
            <slot name="body">
              <!-- Modal Body Content Goes Here: -->
              <h1 class="text">
                <b>Objective</b>
              </h1>
              <p class="text">
                The Resistance: Avalon is the game of hidden loyalty. Players are either Loyal Servants of Arther fighting for Goodness and honor or aligned with the Evil ways of Mordred.
                <br>Good wins the game by successfully completing three Quests. Evil wins if three Quests end in failure. Evil can also win by assassinating Merlin at game's end or if a Quest cannot be undertaken.
                <br>Players may make any claims during the game, at any point in the game discussion, deception, accusation, and logical deducation are all equally important in order for Good to prevail or Evil to rule the day.
              </p>
              <h1 class="text">
                <b>Game Play</b>
              </h1>
              <p class="text">
                The game consists of several rounds; each round has a team building phase and a Quest phase.
                <br>In the team building phase the leader proposes a team to complete a Quest - all the players will either approve the proposed team and move to the quest phase, or reject the proposed team passing leadership to the next player and repeating the process until a team is approved. In the Quest phase those players selected to be on the team will determine if the Quest is successful.
              </p>
              <h1 class="text">
                <b>Team Vote</b>
              </h1>
              <p class="text">
                After appropriate discussion, the leader calls for a vote on the team assignments.
                <br>The leader is proposing the team - but all the players have a vote in whether they accept or reject the proposal. The leader can be evil, or one of the players chosen could be a mistake.
                <br>Don't feel that you need to accept all the proposed teams. If you reject the team then a new leader can propose a different team, maybe one without any evil players on it.
                <br>Each player, including the leader, secretly selects one vote card. When all players have their selected vote card ready, the leader asks for the votes to be revealed. All vote tokens are flipped over so everyone can see how you voted. The team is approved if the majority accepts. If the team is approved, play continues in the quest phase.
                <br>If the team is rejected (a tied vote is also rejection), the leader passes clockwise and the team building phase is repeated.
                <br>Evil wins the game if five teams are rejected in a single round.
              </p>
              <h1 class="text">
                <b>End of The Game</b>
              </h1>
              <p class="text">
                Arthur and Goodness prevail if the team of Good is able to successfully complete three quests without revealing Merlin's true identity.
                <br>Mordred's dark forces of Evil win when three quests end in failure or are devious enough to force Merlin into the open.
                <br>The game ends immediately after either 3 successful or three failed quests. The evil players win if 3 quests fail and when 5 teams are rejected in a single round.
              </p>
              <h1 class="text">
                <b>Assassinate Merlin</b>
              </h1>
              <p
                class="text"
              >If 3 quests are completed successfully, the evil players will have a final opportunity to win the game by correctly naming which of the good players is Merlin. Without revealing any character cards, the evil players discuss and the player with the assassin character card will name one good player as Merlin. If the named player is Merlin, then Evil players win. If the evil players do not name Merlin, then the Good players win.</p>
            </slot>
          </div>

          <div class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}
.text {
  text-align: left;
  color: #685035;
}
.modal-body {
  height: 600px;
  overflow-y: auto;
}
</style>
