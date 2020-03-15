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
    for (let character in teamObj) {
        if (teamObj[character] <= 0) continue;
        GoodTeam.has(character) ? roleList['good'][character] = teamObj[character]
                                : roleList['evil'][character] = teamObj[character];
    }
    return roleList;
}

/**
 * @param {String} yourSocketID 
 * @param {String} yourCharacter 
 * @param {Array} players 
 * @returns {Array}
 */
export function sanitizeTeamView(yourSocketID, yourCharacter, players) {
    const clonedPlayers = JSON.parse(JSON.stringify(players));

    if (yourCharacter === 'Percival') {
        return sanitizeForPercival(yourSocketID, clonedPlayers);
    }
    else if (yourCharacter === 'Merlin') {
        return sanitizeForMerlin(yourSocketID, clonedPlayers);
    }
    //loyal servant of arthur or Oberon
    else if (GoodTeam.has(yourCharacter) || yourCharacter === 'Oberon') {
        return sanitizeForGoodTeam(yourSocketID, clonedPlayers);
    }
    //evil team
    else if (!GoodTeam.has(yourCharacter)) {
        return sanitizeForEvilTeam(yourSocketID, clonedPlayers);
    }
}

/**
 * Hide everyone else's info
 * @param {String} yourSocketID 
 * @param {Array} players 
 * @returns {Array}
 */
function sanitizeForGoodTeam(yourSocketID, players) {
    for (const i in players) {
        if (players[i].socketID === yourSocketID) {
            // dont hide your own info
            continue;
        } else {
            // hide everyone else's info
            players[i].character = 'hidden';
            players[i].team = 'hidden';
        }
    }
    return players;
}

/**
 * Merlin & Morgana both appear to be Merlin
 * @param {String} yourSocketID 
 * @param {Array} players 
 * @returns {Array}
 */
function sanitizeForPercival(yourSocketID, players) {
    for (const i in players) {
        if (players[i].socketID === yourSocketID) {
            // dont hide your own info
            continue;
        } else if (
            players[i].character == 'Merlin' ||
            players[i].character == 'Morgana'
        ) {
            //Merlin & Morgana both appear to be Merlin
            players[i].character = 'Merlin';
            players[i].team = 'Good';
        } else {
            // hide everyone else's info
            players[i].character = 'hidden';
            players[i].team = 'hidden';
        }
    }
    return players;
}

/**
 * Hide identities of good team & Oberon
 * @param {String} yourSocketID 
 * @param {Array} players 
 * @returns {Array}
 */
function sanitizeForEvilTeam(yourSocketID, players) {
    for (const i in players) {
        if (players[i].socketID === yourSocketID) {
            // dont hide your own info
            continue;
        } else if (
            GoodTeam.has(players[i].character) ||
            players[i].character == 'Oberon'
        ) {
            // hide good team's info (& Oberon)
            players[i].character = 'hidden';
            players[i].team = 'hidden';
        } else {
            //just hide character of your teammates
            players[i].character = 'hidden';
        }
    }
    return players;
}

/**
 * Hide identities of good team & Morgana
 * @param {String} yourSocketID 
 * @param {Array} players 
 * @returns {Array}
 */
function sanitizeForMerlin(yourSocketID, players) {
    for (const i in players) {
        if (players[i].socketID === yourSocketID) {
            // dont hide your own info
            continue;
        } else if (
            GoodTeam.has(players[i].character) ||
            players[i].character == 'Mordred'
        ) {
            // hide good team's info (& Mordred)
            players[i].character = 'hidden';
            players[i].team = 'hidden';
        } else {
            //just hide character of your teammates
            players[i].character = 'hidden';
        }
    }
    return players;
}

/**
 * Fisher-Yates shuffle
 * @param {Array} array 
 * @returns {Array}
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
 * @returns {Array}
 */
export function objectToArray(team) {
    let arr = []
    for (let character in team) {
        for (var i = 0; i < team[character]; i++) {
            arr.push(character)
        }
    }
    return arr;
}