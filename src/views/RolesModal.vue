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
              <p class="text">
                <b>Loyal Servant of Arthur</b>
                <br>This is the most boring character in the game because you have no special abilities, but it is also a challenge because you are trying to tell who is good and who is evil with so little information. Your primary goal is to figure out who is bad based on, in this order:
                <br>1. Mission success/failure
                <br>2. Voting
                <br>3. Deception indicators
                <br>Your secondary goal is to look like Merlin so that Merlin is not discovered by the evil guys.
                <br>Even though a common strategy is for evil players to succeed the first mission or two, loyal players still have to assume those who succeeded past missions are good and to put them future missions.
                <br>If a loyal player is not on a mission, they usually want to reject it, because the chances that there is an evil player are increased.
              </p>
              <p class="text">
                <b>Minion of Mordred</b>
                <br>Your primary goal is to lose missions. Your secondary goal is to try to discover who is Merlin so that you can help the Assassin if you fail your primary goal.
              </p>
              <p class="text">
                <b>Merlin</b>
                <br>Merlin must steer the knights correctly without it being obvious they know who all the minions are, which means they must make deductions based on actions taken by players in the game.
                <br>How to give yourself away:
                <br>1. Knowing too much about who is evil.
                <br>2. Calling an evil player evil when there is not much/any reason to call them evil.
                <br>3. Being more helpful to the good side than usual.
                <br>4. Never being confused or surprised.
              </p>
              <p class="text">
                <b>Assassin</b>
                <br>Merlin votes correctly pretty much always so the assassin’s most important task is watching the voting to see who is able to do that. When you know the players in the game, you can often tell who knows too much, but when you do not, you often have to look to the voting results to deduce who is Merlin.
                <br>The Assassin must be extremely watchful of who knows too much information about which players are evil. They must be particularly observant of who votes correctly most of the time.
              </p>
              <p class="text">
                <b>Percival</b>
                <br>Percival knows who Morgana and Merlin are, which is some information, but not nearly as much as Merlin. Your primary job is to pretend to be Merlin. Your secondary job is to determine who is Morgana so you can vote down quests in which they try to participate.
              </p>
              <p class="text">
                <b>Morgana</b>
                <br>Morgana should be added when Percival is also added to replace some of the generic good and evil characters and make it a little more interesting for the non-Merlin and non-Assassin characters. Percival knows who Morgana and Merlin are, but not which is which.
              </p>
              <p class="text">
                <b>Mordred</b>
                <br>Mordred helps the evil side because Merlin does not know his identity, but hurts in their ability to detect Merlin because he can’t always vote correctly anymore. Basically, adding him helps them win more often by just causing 3 missions to fail, but makes it harder to assassinate Merlin in the end. As Mordred, it is imperative that you recognize your unique situation because you will be able to watch the votes to see how everyone votes for teams to which the other minions belong.
              </p>
              <p class="text">
                <b>Oberon</b>
                <br>Oberon is a secret force of evil that is unknown to the other evil players. He is a fun addition to a game, but makes it a challenge for the minions, so I recommend only considering him during a 7 or 10 player game. Adding him is a great way to spice up a game of veterans.
              </p>
              <p class="text">
                <b>Lady of the Lake</b>
                <br>The Lady of the Lake is optional, but it is another great way to spice up a game among Avalon veterans. After the second, third, and fourth quests are completed, the person with Lady of the Lake gets to exchange its ownership for that player’s true allegiance. It doesn’t give either side much of an advantage because either can use its power to their advantage.
              </p>
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