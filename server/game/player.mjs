export default class Player {
  /**
   * @param {string} socketID
   * @param {string} name - The nickname entered by the player when they join the room
   * @param {number} roomCode - Digits identifying which room this player is in.
   * @param {string} type - 'Guest' if joining a room, 'Host' if creating a room
   * @property {string} team - 'Good' or 'Evil'
   * @property {string} role - Player's role (Merlin, Loyal servant of arthur, etc)
   * @property {boolean} leader - Indicates if the player is the leader of the quest
   * @property {boolean} onQuest - Indicates if the player is on the quest 
   * @property {boolean} voted - Indicates if the player has voted on team/quest
   * @property {boolean} disconnected - Indicates if the player is disconnected from a started game
   * @property {boolean} assassinated - Indicates if the player was assassinated
   * @property {string[]} knownIdentities - A list of the player names whose team or identity is known to this player
   */
  constructor(socketID, name, roomCode, type) {
    this.socketID = socketID;
    this.name = name;
    this.roomCode = roomCode;
    this.type = type;
    this.team = '';
    this.role = '';
    this.leader = false;
    this.onQuest = false;
    this.voted = false;
    this.disconnected = false;
    this.assassinated = false;
  }

  reconnect(socketID) {
    this.socketID = socketID;
    this.disconnected = false;
  }
}
