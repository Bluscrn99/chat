import { WebSocketServer } from 'ws';

const serverport = process.env.PORT || 80;
const server = new WebSocketServer({ port: serverport });

server.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    let messagedata;
    let output;
    console.log('[Client Message]', data);
    try {
      messagedata = JSON.parse(data);
    } catch(e) {ws.send(JSON.stringify({ 
      type: 'error', 
      error: 'invalidJSON'
    }));
    return;
  }
    if (messagedata.type === 'user_message') {
        if (messagedata.message.includes('<') || messagedata.username.includes('<')) {
          output = {
            type: 'error',
            error: 'invalidCharacters',
            username: messagedata.username,
          }
          ws.send(JSON.stringify(output));
        } else if (messagedata.message == '' || messagedata.username == '') {
            output = {
              type: 'error',
              error: 'emptyMessage',
              username: messagedata.username,
            }
            ws.send(JSON.stringify(output));
          }
    } else if (messagedata.type === 'connect') {
        output = {
            type: 'client_connect',
        }
        server.clients.forEach(function(client) {
          client.send(JSON.stringify(output));
        });
    } else {
        output = {
          type: 'user_message',
          username: messagedata.username,
          message: messagedata.message.trim(),
          data: messagedata.username + ': ' + messagedata.message,
        }
        server.clients.forEach(function(client) {
          client.send(JSON.stringify(output));                                 
        });
    }
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