// See
// See https://flaviocopes.com/websockets/

module.exports = function commands(ws) {
    // TODO assert ws

    ws.on('open', () => {
        console.log('open');
        ws.send('ok');
    });

    ws.on('message', data => {
        console.log(`Received message => ${data}`)
    });
};
