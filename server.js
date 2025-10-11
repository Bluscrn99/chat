const version = 2;



import { WebSocketServer } from 'ws';
import { Filter } from 'bad-words';

const filter = new Filter();
const serverport = process.env.PORT || 80;
const server = new WebSocketServer({ port: serverport });
let connectedUsernames = [];
import sanitizeHtml from 'sanitize-html';

server.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    let messagedata;
    let output;
    console.log('[Client Message]', data);
    try {
      messagedata = JSON.parse(data);
    } catch(e) {ws.send(JSON.stringify({ 
      type: 'error', 
      error: 'invalidJSON',
      version: version,
    }));
    return;
  }
    if (messagedata.type == 'user_message') {
        if (!connectedUsernames.includes(messagedata.username)) {
          output = {
            type: 'error',
            error: 'invalidUsername',
            version: version,
          };
          ws.send(JSON.stringify(output));
          return;
        }
        if (messagedata.message.includes('<') || messagedata.username.includes('<')) {
          output = {
            type: 'error',
            error: 'invalidCharacters',
            version: version,
          };
          ws.send(JSON.stringify(output));
          return;
        } else if (messagedata.message == '' || messagedata.username == '') {
            output = {
              type: 'error',
              error: 'emptyMessage',
              version: version,
            };
            ws.send(JSON.stringify(output));
            return;
          } else if (messagedata.message.length > 1000) {
            output = {
              type: 'error',
              error: 'messageTooLong',
              username: messagedata.username,
              version: version,
            };
            ws.send(JSON.stringify(output));
            return;
          } else {
              let timestamp = new Date().toUTCString();
              output = {
                type: 'user_message',
                username: messagedata.username,
                message: filter.clean(messagedata.message.trim()),
                data: sanitizeHtml(messagedata.username + ': ' + filter.clean(messagedata.message.trim()), {allowedTags:['b', 'i'],allowedAttributes:{}}),
                timestamp: timestamp,
                version: version,
              }
              server.clients.forEach(function(client) {
                client.send(JSON.stringify(output));                                 
              });
              return;
          };
    } else if (messagedata.type == 'connect') {
        if (connectedUsernames.includes(messagedata.username)) {
          output = {
            type: 'error',
            error: 'usernameTaken',
            version: version,
          }
          ws.send(JSON.stringify(output));
        }
        else if (messagedata.username.length > 30) {
          output = {
            type: 'error',
            error: 'usernameTooLong',
            version: version,
          }
          ws.send(JSON.stringify(output));
        }
        else if (messagedata.username.length < 3) {
          output = {
            type: 'error',
            error: 'usernameTooShort',
            version: version,
          }
          ws.send(JSON.stringify(output));
        }
        else if (messagedata.username != filter.clean(messagedata.username)) {
          output = {
            type: 'error',
            error: 'usernameHitFilter',
            version: version,
          }
          ws.send(JSON.stringify(output));
        }
        else {
          messagedata.username = sanitizeHtml(messagedata.username), {allowedTags:[],allowedAttributes:{}};
          output = {
              type: 'client_connect',
              username: messagedata.username,
              version: version,
          }
          ws.username = messagedata.username;
          connectedUsernames.push(ws.username);
          server.clients.forEach(function(client) {
            client.send(JSON.stringify(output));                              
          });
        }
    };
  });
  ws.on('close', function message(data) {
    let output = {
      type: 'client_disconnect',
      username: ws.username,
      version: version,
    }
    connectedUsernames = connectedUsernames.filter(username => username !== ws.username);
    server.clients.forEach(function(client) {
        client.send(JSON.stringify(output));
    });
  });
});

process.on('SIGINT', (code) => {
  let output = {
    type: 'server_message',
    message: 'Server closing D:',
    version: version,
  }
  server.clients.forEach(client => {
    client.send(JSON.stringify(output));
  });
  process.exit();
});