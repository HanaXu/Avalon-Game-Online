<template>
  <b-modal id="modal-roles" size="lg" scrollable title="Game Roles">
    <h2 class="heading">
      <b>Loyal Servant of Arthur</b>
    </h2>
    <p>
      You have no special abilities, your primary goal is to figure out who is bad based on, in this order:
      <br>1. Mission success/failure
      <br>2. Voting
      <br>3. Deception indicators
    </p>

    <h2 class="heading">
      <b>Minion of Mordred</b>
    </h2>
    <p>
      Your primary goal is to lose missions. Your secondary goal is to try to discover who
      Merlin is so that you can help the Assassin if you fail your primary goal.
    </p>

    <h2 class="heading">
      <b>Merlin</b>
    </h2>
    <p>
      Merlin must steer the knights correctly without it being obvious they know who all the
      minions are. This means they must make deductions based on actions taken by players in the game.
      <br>How to give yourself away:
      <br>1. Knowing too much about who is evil.
      <br>2. Calling an evil player evil when there is not much/any reason to call them evil.
      <br>3. Being more helpful to the good side than usual.
      <br>4. Never being confused or surprised.
    </p>

    <h2 class="heading">
      <b>Assassin</b>
    </h2>
    <p>
      Merlin votes correctly pretty much always so the assassin’s most important task is
      watching the voting to see who votes correctly most of the time.
    </p>

    <h2 class="heading">
      <b>Percival</b>
    </h2>
    <p>
      Percival knows which two players are either Morgana or Merlin, but not specifically.
      Your primary job is to pretend to be Merlin. Your secondary job is to
      determine who Morgana is so you can vote down quests in which they try to participate.
    </p>

    <h2 class="heading">
      <b>Morgana</b>
    </h2>
    <p>Morgana appears as Merlin to Percival, Percival does not know which is which.</p>

    <h2 class="heading">
      <b>Mordred</b>
    </h2>
    <p>
      Mordred helps the evil side because Merlin does not know his identity, but hurts in their
      ability to detect Merlin because he can’t always vote correctly anymore. Basically, adding
      him helps them win more often by just causing 3 missions to fail, but makes it harder to
      assassinate Merlin in the end. As Mordred, it is imperative that you recognize your unique
      situation because you will be able to watch the votes to see how everyone votes for teams
      to which the other minions belong.
    </p>

    <h2 class="heading">
      <b>Oberon</b>
    </h2>
    <p>
      Oberon is a secret force of evil that is unknown to the other evil players. He is a fun
      addition to a game, but makes it a challenge for the minions, so I recommend only considering
      him during a 7 or 10 player game. Adding him is a great way to spice up a game of veterans.
    </p>


    <!--include footer so OK and Cancel buttons dont show up-->
    <div slot="modal-footer">
    </div>
  </b-modal>
</template>
