let chatServer = "ws://127.0.0.1:6435";
const usr = document.getElementById('usr');
const msg = document.getElementById('msg');
const sendbtn = document.getElementById('send');
const chatoutput = document.getElementById('chatoutput');
const erroroutput = document.getElementById('erroroutput');
const serverstatus = document.getElementById('connectionstatus');
const ipInput = document.getElementById('ip');
let websocket;
let temp;
let reconnectInterval;

if (ipInput.value != '') {
  chatServer = ipInput.value;
}

function connect() {
  websocket = new WebSocket(chatServer);
  websocket.addEventListener("error", (e) => {
    console.log(`ERROR`, e);
  });

  if (reconnectInterval) {
      clearInterval(reconnectInterval);
      reconnectInterval = null;
  }

  reconnectInterval = setInterval(function() {
    if (websocket.readyState === WebSocket.OPEN) {
      serverstatus.innerText = 'Connected';
    } else if (websocket.readyState === WebSocket.CLOSED) {
      serverstatus.innerText = 'Disconnected';
      console.log('Attempting reconnect..')
      connect();
      return;
    } else if (websocket.readyState === WebSocket.CONNECTING) {
      serverstatus.innerText = 'Connecting...';
    };
  }, 2500);

  websocket.addEventListener("open", (e) => {
    let message = {
      type: "connect",
    }
    console.log('Connected!')
    websocket.send(JSON.stringify(message))
    serverstatus.innerText = 'Connected';
  });

  websocket.addEventListener("close", function(e) {
    serverstatus.innerText = 'Disconnected';
  });


  websocket.addEventListener("message", function(rawmessage) {
    let message = JSON.parse(rawmessage.data);
    console.log('[Server Message]');
    if (message.type == "user_message") {
      chatoutput.innerHTML = message.data + '<br>' + chatoutput.innerHTML;
    };
    if (message.type == "error") {
      if (message.username == usr.value || message.error == 'invalidCharacters') {
        erroroutput.innerText = '[ERROR] Message or username contains disallowed characters'
        setTimeout(function() {erroroutput.innerText = ''}, 5000);
      }
    };
    if (message.type == "server_message") {
      chatoutput.innerHTML = '<strong>' + '[SERVER] ' + message.message + '<br>' + '</strong>' + chatoutput.innerHTML;
    };
    if (message.type == "client_connect") {
      chatoutput.innerHTML = '[CONNECTION] Someone entered the chat!' + '<br>' + chatoutput.innerHTML
    }
  });
};

function sendMsg() {
  let message = {
    type: 'user_message',
    username: usr.value,
    message: msg.value,
  }
  msg.value = '';
  websocket.send(JSON.stringify(message));
};

sendbtn.addEventListener('click', function() {
  sendMsg();
});

msg.addEventListener('keydown', function(e) {
  if (e.key == 'Enter') {
    e.preventDefault();
    sendMsg();
  }
});

connect();