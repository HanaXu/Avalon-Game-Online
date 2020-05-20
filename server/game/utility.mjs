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
        GoodTeam.has(role) ? roleList['good'][role] = teamObj[role]
            : roleList['evil'][role] = teamObj[role];
    }
    return roleList;
}

/**
 * @param {string} yourSocketID 
 * @param {string} yourRole 
 * @param {array} players 
 * @returns {array}
 */
export function sanitizeTeamView(yourSocketID, yourRole, players) {
    const clonedPlayers = JSON.parse(JSON.stringify(players));

    if (yourRole === 'Spectator') {
        return sanitizeForSpectators(clonedPlayers);
    }
    else if (yourRole === 'Percival') {
        return sanitizeForPercival(yourSocketID, clonedPlayers);
    }
    else if (yourRole === 'Merlin') {
        return sanitizeForMerlin(yourSocketID, clonedPlayers);
    }
    //loyal servant of arthur or Oberon
    else if (GoodTeam.has(yourRole) || yourRole === 'Oberon') {
        return sanitizeForGoodTeam(yourSocketID, clonedPlayers);
    }
    //evil team
    else if (!GoodTeam.has(yourRole)) {
        return sanitizeForEvilTeam(yourSocketID, clonedPlayers);
    }
}

/**
 * Hide everyone's info
 * @param {array} players 
 * @returns {array}
 */
function sanitizeForSpectators(players) {
    for (const i in players) {
        players[i].role = 'hidden';
        players[i].team = 'hidden';
    }
    return players;
}

/**
 * Hide everyone else's info
 * @param {string} yourSocketID 
 * @param {array} players 
 * @returns {array}
 */
function sanitizeForGoodTeam(yourSocketID, players) {
    for (const i in players) {
        if (players[i].socketID === yourSocketID) {
            // dont hide your own info
            continue;
        } else {
            // hide everyone else's info
            players[i].role = 'hidden';
            players[i].team = 'hidden';
        }
    }
    return players;
}

/**
 * Merlin & Morgana both appear to be Merlin
 * @param {string} yourSocketID 
 * @param {array} players 
 * @returns {array}
 */
function sanitizeForPercival(yourSocketID, players) {
    for (const i in players) {
        if (players[i].socketID === yourSocketID) {
            // dont hide your own info
            continue;
        } else if (
            players[i].role == 'Merlin' ||
            players[i].role == 'Morgana'
        ) {
            //Merlin & Morgana both appear to be Merlin
            players[i].role = 'Merlin';
            players[i].team = 'Good';
        } else {
            // hide everyone else's info
            players[i].role = 'hidden';
            players[i].team = 'hidden';
        }
    }
    return players;
}

/**
 * Hide identities of good team & Oberon
 * @param {string} yourSocketID 
 * @param {array} players 
 * @returns {array}
 */
function sanitizeForEvilTeam(yourSocketID, players) {
    for (const i in players) {
        if (players[i].socketID === yourSocketID) {
            // dont hide your own info
            continue;
        } else if (
            GoodTeam.has(players[i].role) ||
            players[i].role == 'Oberon'
        ) {
            // hide good team's info (& Oberon)
            players[i].role = 'hidden';
            players[i].team = 'hidden';
        } else {
            //just hide role of your teammates
            players[i].role = 'hidden';
        }
    }
    return players;
}

/**
 * Hide identities of good team & Morgana
 * @param {string} yourSocketID 
 * @param {array} players 
 * @returns {array}
 */
function sanitizeForMerlin(yourSocketID, players) {
    for (const i in players) {
        if (players[i].socketID === yourSocketID) {
            // dont hide your own info
            continue;
        } else if (
            GoodTeam.has(players[i].role) ||
            players[i].role == 'Mordred'
        ) {
            // hide good team's info (& Mordred)
            players[i].role = 'hidden';
            players[i].team = 'hidden';
        } else {
            //just hide role of your teammates
            players[i].role = 'hidden';
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
        randomIndex = Math.floor(Math.random() * currentIndex);
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