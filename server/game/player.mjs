export default class Player {
  /**
   * @property {number} room - digit room code, same for all players in a game; identifies which game this player is in - this might not be necessary actually, uncertain
   * @property {string} name - the nickname entered by the player when they join the room
   * @property {string} identity - the character identity
   * @property {boolean} onTeamGood - true if on good team, false if on evil team
   * @property {string[]} knownIdentities - a list of the player names whose team or identity is known to this player
   */

  /**
   * constructor for player object
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
