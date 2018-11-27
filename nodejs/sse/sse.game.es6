/**
 * Copyright (c) 2013-2018 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

// TODO IMPORTANT: Consider teams

class Game {
    constructor(id, db) {
        this._id = id;
        this._db = db;
        this._players = {};
        this._masters = {};

        // Game data: in this prototoype,
        // - each user has a number from 0 to 10 that he/she progresses by clicking a button
        // - each master can see users progresses from 0 to 10 for a single game
        this._data = {};
    }

    addPlayer(user, res) {
        var that = this;
        res.once('close', () => {
            that.removePlayer(user, res);
        });
        res.socket.setTimeout(0); // see http://contourline.wordpress.com/2011/03/30/preventing-server-timeout-in-node-js/
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });
        var player = this._players[user.id];
        if (player) {
            console.log('Oops! Player ' + user.id + ' ended from ' + this._id);
            player.end();
        }
        this._players[user.id] = res;
        this.updateData(user, { value: 0 });
        console.log('Player ' + user.id + ' added to ' + this._id);
        this._db.emit('update', this);
    }

    addMaster(user, res) {
        var that = this;
        res.once('close', () => {
            that.removeMaster(user, res);
        });
        res.socket.setTimeout(0); // see http://contourline.wordpress.com/2011/03/30/preventing-server-timeout-in-node-js/
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });
        var master = this._masters[user.id];
        if (master) {
            console.log('Oops! Master ' + user.id + ' ended from ' + this._id);
            master.end();
        }
        this._masters[user.id] = res;
        console.log('Master ' + user.id + ' added to ' + this._id);
        this._db.emit('update', this);
    }

    removePlayer(user, res) {
        res.end();
        delete this._players[user.id];
        delete this._data[user.id];
        console.log('Player ' + user.id + ' removed from ' + this._id);
        this._db.emit('update', this);
    }

    removeMaster(user, res) {
        res.end();
        delete this._masters[user.id];
        console.log('Master ' + user.id + ' removed from ' + this._id);
        this._db.emit('update', this);
    }

    updateData(user, data) {
        this._data[user.id] = data;
        console.log('Data updated by ' + user.id + ' for ' + this._id);
        this._db.emit('update', this);
    }

    getData() {
        return Object.keys(this._data).map(key => {
            return {
                user: key,
                value: this._data[key].value
            }
        });
    }

    getStats() {
        return {
            players: Object.keys(this._players).length,
            masters: Object.keys(this._masters).length
            // connections:
        }
    }

    broadcast() {
        Object.values(this._players).forEach(res => {
            res.write('id: ' + Date.now() + '\n');
            // TODO retry + event
            res.write('data: ' + JSON.stringify(this.getStats()) + '\n\n');
        });
        Object.values(this._masters).forEach(res => {
            res.write('id: ' + Date.now() + '\n');
            res.write('data: ' + JSON.stringify(this.getData()) + '\n\n');
        });
        console.log('Data broadcasted for ' + this._id);
    }
}

/**
 * Default export
 * @type {Game}
 */
module.exports = Game;
