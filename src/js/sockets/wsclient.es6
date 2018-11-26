// Important! use app.uris and secure wss://

const url = 'ws://localhost:8080/sockets';
const connection = new WebSocket(url);

connection.onopen = () => {
    connection.send('hey');
};

connection.onerror = error => {
    console.log(`WebSocket error: ${error}`);
};
