


class Player {
    constructor(socketID, name) {
        this.socketID = socketID;
        this.name = name;
        this.totalScore = 0;
    }
    updateScore(score) {
        this.totalScore = score;
    }
}

class Game {
    constructor(gameCode, questions) {
        this.gameCode = gameCode;
        this.questions = questions;
        this.players = [];
        this.currentQuestion = null;
        this.currentQuestionIdx = -1;
        this.owner = null;
    }
    addPlayer(socketID, name) {
        if (this.currentQuestion != null) {
            return false;
        }
        let player = new Player(socketID, name);
        if (this.owner == null) {
            this.owner = player;
        }
        // Check if player already exists
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].name == name) {
                return false;
            }
        }
        this.players.push(player);
        return true;
    }
    startGame() {
        this.nextQuestion();
    }
    getCurrentQuestion() {
        return this.currentQuestion;
    }
    leaderboard() {
        let leaderboard = [];
        for (let i = 0; i < this.players.length; i++) {
            leaderboard.push({name : this.players[i].name, score : this.players[i].totalScore});
        }
        return leaderboard;
    }
    nextQuestion() {
        this.currentQuestionIdx++;
        this.numPlayersDone = 0;
        if (this.currentQuestionIdx >= this.questions.length) {
            return false;
        }
        this.currentQuestion = this.questions[this.currentQuestionIdx];
        return true;
    }
    updatePlayerScore(username, score) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].name == username) {
                this.players[i].updateScore(score);
                this.numPlayersDone++;
                break;
            }
        }
    }
    readyToAdvance() {
        return this.numPlayersDone == this.players.length;
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
