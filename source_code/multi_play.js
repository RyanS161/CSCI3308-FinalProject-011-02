

class Game {
    constructor(gameCode, questions) {
        this.gameCode = gameCode;
        this.questions = questions;
        this.players = [];
    }
}


const multiPlayerManager = class {
    constructor() {
        this.games = [];
    }

    addNewGame(questions) {
        let flag = true;
        let newCode;
        while (flag == true) {
            flag = false;
            newCode = Math.random().toString(36).slice(7).toUpperCase();
            if (newCode.length != 6) {
                flag = true;
                continue;
            }
            for (let i = 0; i < this.games.length; i++) {
                if (this.games[i].gameCode == newCode) {
                flag = true;
                }
            }
        }
        this.games.push(new Game(newCode, questions));
        return this.findGame(newCode);
    }

    findGame(gameCode) {
        for (let i = 0; i < this.games.length; i++) {
            if (this.games[i].gameCode == gameCode) {
                return this.games[i];
            }
        }
        return null;
    }
}

// Export a multiplayer manager object
module.exports = new multiPlayerManager();
