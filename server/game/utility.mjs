import { GoodTeam } from './game.mjs';

/**
 * Example object
 * 10: {
 *  'Merlin': 1,
 *  'Assassin': 1,
 *  'Loyal Servant of Arthur': 5,
 *  'Minion of Mordred': 3
 * }
 * @param {Object} teamObj 
 * @returns {Object}
 */
export function populateRoleList(teamObj) {
    let roleList = {
        'good': {},
        'evil': {}
    };
    for (let role in teamObj) {
        if (teamObj[role] <= 0) continue;
        if (GoodTeam.has(role)) roleList['good'][role] = teamObj[role];
        else roleList['evil'][role] = teamObj[role];
    }
    return roleList;
}

/**
 * @param {string} socketID 
 * @param {string} role 
 * @param {array} players 
 * @returns {array}
 */
export function sanitizeTeamView(socketID, role, players) {
    const clonedPlayers = JSON.parse(JSON.stringify(players));

    if (role === 'Spectator') {
        return sanitizeForSpectators(clonedPlayers);
    }
    else if (role === 'Percival') {
        return sanitizeForPercival(socketID, clonedPlayers);
    }
    else if (role === 'Merlin') {
        return sanitizeForMerlin(socketID, clonedPlayers);
    }
    //loyal servant of arthur or Oberon
    else if (GoodTeam.has(role) || role === 'Oberon') {
        return sanitizeForGoodTeam(socketID, clonedPlayers);
    }
    //evil team
    else if (!GoodTeam.has(role)) {
        return sanitizeForEvilTeam(socketID, clonedPlayers);
    }
}

/**
 * Hide everyone's info
 * @param {array} players 
 * @returns {array}
 */
function sanitizeForSpectators(players) {
    for (const i in players) {
        players[i].role = '???';
        players[i].team = '???';
    }
    return players;
}

/**
 * Hide everyone else's info
 * @param {string} socketID 
 * @param {array} players 
 * @returns {array}
 */
function sanitizeForGoodTeam(socketID, players) {
    for (const i in players) {
        if (players[i].socketID === socketID) continue;
        else {
            players[i].role = '???';
            players[i].team = '???';
        }
    }
    return players;
}

/**
 * Merlin & Morgana both appear to be Merlin
 * @param {string} socketID 
 * @param {array} players 
 * @returns {array}
 */
function sanitizeForPercival(socketID, players) {
    for (const i in players) {
        if (players[i].socketID === socketID) continue;
        else if (players[i].role == 'Merlin' || players[i].role == 'Morgana') {
            //Merlin & Morgana both appear to be Merlin
            players[i].role = 'Merlin';
            players[i].team = 'Good';
        } else {
            players[i].role = '???';
            players[i].team = '???';
        }
    }
    return players;
}

/**
 * Hide identities of good team & Oberon
 * @param {string} socketID 
 * @param {array} players 
 * @returns {array}
 */
function sanitizeForEvilTeam(socketID, players) {
    for (const i in players) {
        if (players[i].socketID === socketID) continue;
        else if (GoodTeam.has(players[i].role) || players[i].role == 'Oberon') {
            // hide good team's info (& Oberon)
            players[i].role = '???';
            players[i].team = '???';
        } else {
            players[i].role = '???';
        }
    }
    return players;
}

/**
 * Hide identities of good team & Morgana
 * @param {string} socketID 
 * @param {array} players 
 * @returns {array}
 */
function sanitizeForMerlin(socketID, players) {
    for (const i in players) {
        if (players[i].socketID === socketID) continue;
        else if (GoodTeam.has(players[i].role) || players[i].role == 'Mordred') {
            // hide good team's info (& Mordred)
            players[i].role = '???';
            players[i].team = '???';
        } else {
            players[i].role = '???';
        }
    }
    return players;
}

/**
 * Fisher-Yates shuffle
 * @param {array} array 
 * @returns {array}
 */
export function shuffle(array) {
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * (currentIndex + 1));
        currentIndex--;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

/**
 * Convert object to array for shuffling
 * @param {Object} team 
 * @returns {array}
 */
export function objectToArray(obj) {
    let arr = []
    for (let property in obj) {
        for (var i = 0; i < obj[property]; i++) {
            arr.push(property)
        }
    }
    return arr;
}