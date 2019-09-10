<template>
  <b-modal id="modal-rules" size="lg" scrollable title="Game Rules">
    <h2 class="heading">
      <b>Objective</b>
    </h2>
    <p>
      Avalon is the game of hidden loyalty. Players are either Loyal
      Servants of Arther fighting for Good and honor or aligned with the Evil ways of Mordred.
      <br>Good wins the game by successfully completing three Quests. Evil wins if three
      Quests end in failure. Evil can also win by assassinating Merlin at game's end
      or if a Quest cannot be undertaken.
      <br>Players may make any claims during the game.
      Deception, accusation, and logical deducation are all equally important in order
      for Good to prevail or Evil to rule the day.
    </p>

    <h2 class="heading">
      <b>Game Play</b>
    </h2>
    <p>
      The game consists of several rounds; each round has a team building phase and a Quest phase.
      <br>In the team building phase, the quest leader proposes a team to complete a Quest.
      All the players will either approve the proposed team and move to the quest phase,
      or reject the proposed team, passing leadership to the next player and repeating the
      process until a team is approved. If five teams are rejected in a single round, Evil wins.
      In the Quest phase, players selected to be on the team will annonymously vote to succeed or fail the quest.
    </p>

    <h2 class="heading">
      <b>Assassinate Merlin</b>
    </h2>
    <p>
      If 3 quests are completed successfully, the evil players will have a final
      opportunity to win the game by correctly guessing which of the good players is Merlin.
      Without revealing any character cards, the evil players openly discuss and the assassin
      will pick one good player as Merlin. If the named player is Merlin, then Evil players win.
      If the evil players do not name Merlin, then the Good players win.
    </p>

    <!--include footer so OK and Cancel buttons dont show up-->
    <div slot="modal-footer">
    </div>
  </b-modal>
</template>