import { GoodTeam } from './game.mjs';

/*
example teamObj
10: {
    'Merlin': 1,
    'Assassin': 1,
    'Loyal Servant of Arthur': 5,
    'Minion of Mordred': 3
  }
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

// hide all player team and character info but yourself
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

// hide all player team and character info but yourself
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

// hide identities of good team & Oberon
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

// hide identities of good team & Morgana
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

// Fisher-Yates shuffle
export function shuffle(array) {
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

//convert the object to array for shuffling
export function objectToArray(team) {
    let arr = []
    for (let character in team) {
        for (var i = 0; i < team[character]; i++) {
            arr.push(character)
        }
    }
    return arr;
}