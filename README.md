# demo chat app

an extremely simple chat app just to learn about websockets and maybe i will use it somewhere. will expand on this..?

## usage

- fire up server.js using node.js
- then, open the client (index.html) from the client folder
- wait for connection. dont worry about setting the ip in the client as by default it's your local machine.
- the chat should be working, get another client open to test it out

## features

- COMPLETELY unsafe username system (anyone is anyone)
- Messages between all clients
- Client connection messages
- Bad anti-XSS measures
- Server messages
- JSON Encoded Websocket messages
- Custom server support (of course)
- Connection status message
- Auto-reconnection if server disconnects
