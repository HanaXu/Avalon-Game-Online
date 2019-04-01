
class Player {

    /**
     * Player objects have identity and info for each individual player:
     * @property {number} roomCode - the 4-digit room code, same for all players in a game; identifies which game this player is in - this might not be necessary actually, uncertain
     * @property {boolean} isHuman - true if human player, false if bot player - also irrelevant at this point & may not ever be needed, since we should receive same info from all players
     * @property {string} name - the nickname entered by the player when they join the room
     * @property {string} character - the character identity
     * @property {boolean} onTeamGood - true if on good team, false if on evil team
     * @property {string[]} knownIdentities - a list of the player names whose team or identity is known to this player
     * @property {string} socketID
     * @property {string} hostOrGuest
     */
        

    /**
     * constructor for player object
     */
    constructor(socketID, name, roomCode, hostOrGuest, playerPosition) {
        this.socketID = socketID;
        this.name = name;
        this.roomCode = roomCode;
        this.hostOrGuest = hostOrGuest;
        this.playerPosition = playerPosition;
        this.turn = false;
        this.team = 'undecided';
        this.character = 'undecided';
        this.action = 'undecided';
    }

}