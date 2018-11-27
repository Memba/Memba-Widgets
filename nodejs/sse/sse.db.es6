const EventEmitter = require('events');
const Game = require('./sse.game.es6');

// This actually mocks https://docs.mongodb.com/manual/changeStreams/

class DB extends EventEmitter {
    constructor() {
        super();
        this._games = {};
        this.addListener('update', this._onUpdate.bind(this))
    }

    getGame(id) {
        return new Promise((resolve, reject) => {
            let game = this._games[id];
            if (typeof game === 'undefined') {
                game = new Game(id, this);
                this._games[id] = game;
            }
            resolve(game);
        });
    }

    _onUpdate(game) {
        game.broadcast();
    }

    destroy() {
        this._games = {};
        this.removeAllListeners('update');
    }
}

module.exports = new DB();
