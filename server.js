import { WebSocketServer } from 'ws';

const server = new WebSocketServer({ port: 6435 });

server.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    let jsondata;
    let output;
    console.log('[Client Message]', data);
    jsondata = JSON.parse(data);
    if (jsondata.type === 'user_message') {
        output = {
            type: 'user_message',
            username: jsondata.username,
            message: jsondata.message.trim(),
            data: jsondata.username + ': ' + jsondata.message,
        }
        if (jsondata.message.includes('<') || jsondata.username.includes('<')) {
          output = {
            type: 'error',
            error: 'invalidCharacters',
            username: jsondata.username,
          }
        }
        if (jsondata.message == '') {
          output = {
            type: 'error',
            error: 'emptyMessage',
            username: jsondata.username,
          }
        }
        server.clients.forEach(function(client) {
          client.send(JSON.stringify(output));
        });
    };
    if (jsondata.type === 'connect') {
        output = {
            type: 'client_connect',
        }
        server.clients.forEach(function(client) {
          client.send(JSON.stringify(output));
        });
    };
  });
});

process.on('SIGINT', (code) => {
  let output = {
    type: 'server_message',
    message: 'Server closing D:'
  }
  server.clients.forEach(client => {
    client.send(JSON.stringify(output));
  });
  process.exit();
});