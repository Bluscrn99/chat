import { WebSocketServer } from 'ws';

const serverport = process.env.PORT || 80;
const server = new WebSocketServer({ port: serverport });

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
        server.clients.forEach(function(client) {
          ws.send(JSON.stringify(output));
        });
        if (jsondata.message.includes('<') || jsondata.username.includes('<')) {
          output = {
            type: 'error',
            error: 'invalidCharacters',
            username: jsondata.username,
          }
          ws.send(JSON.stringify(output));
        }
        if (jsondata.message == '' || jsondata.username == '') {
          output = {
            type: 'error',
            error: 'emptyMessage',
            username: jsondata.username,
          }
          client.send(JSON.stringify(output));
        }
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