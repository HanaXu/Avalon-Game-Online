<template>
  <div class="col-md-8">
    <div class="main-board">
      <PlayerCards />
      <QuestCards />
      <VoteTrack />
    </div>
    <GameStatus />
    <VoteResults />
    <Actions />
  </div>
</template>

<script>
import PlayerCards from "@/components/game/PlayerCards.vue";
import QuestCards from "@/components/game/QuestCards.vue";
import VoteTrack from "@/components/game/VoteTrack.vue";
import Actions from "@/components/game/Actions.vue";
import GameStatus from "@/components/game/GameStatus.vue";
import VoteResults from "@/components/game/VoteResults.vue";

export default {
  components: {
    PlayerCards,
    QuestCards,
    VoteTrack,
    Actions,
    GameStatus,
    VoteResults
  }
};
</script>