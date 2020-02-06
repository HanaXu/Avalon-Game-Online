export default class Player {
  /**
   * @property {string} name - The nickname entered by the player when they join the room
   * @property {number} room - Digit room code identifying which game this player is in.
   * @property {string} role - 'Guest' if joining a room, 'Host' if creating a room
   * @property {string} character - Player's character (Merlin, Loyal servant of arthur, etc)
   * @property {string} team - 'Good' or 'Evil'
   * @property {string[]} knownIdentities - A list of the player names whose team or identity is known to this player
   */

  constructor(socketID, name, roomCode, role) {
    this.socketID = socketID;
    this.name = name;
    this.roomCode = roomCode;
    this.role = role;
    this.team = 'undecided';
    this.character = 'undecided';
    this.leader = false;
    this.onQuest = false;
    this.votedOnTeam = false;
    this.votedOnQuest = false;
    this.disconnected = false;
  }
};
