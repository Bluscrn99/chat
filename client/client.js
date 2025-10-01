let chatServer = "ws://127.0.0.1:80";
const usr = document.getElementById('usr');
const msg = document.getElementById('msg');
const sendbtn = document.getElementById('send');
const chatoutput = document.getElementById('chatoutput');
const erroroutput = document.getElementById('erroroutput');
const serverstatus = document.getElementById('connectionstatus');
const ipInput = document.getElementById('ip');
const messageInSFX = document.getElementById('messageIn');
const messageOutSFX = document.getElementById('messageOut');
const connectSFX = document.getElementById('connect');
const disconnectSFX = document.getElementById('disconnect');
const connectbtn = document.getElementById('connectbtn');
const soundtoggle = document.getElementById('soundtoggle');
let idontknowwhattonamethis = false;
let websocket;
let username;
let temp;
let reconnectInterval;

usr.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
  }
});


soundtoggle.checked = true;

if (ipInput.value != '') {
  chatServer = ipInput.value;
}

msg.style.display = 'none'
chatoutput.style.display = 'none'
sendbtn.style.display = 'none'
serverstatus.style.display = 'none'

connectbtn.addEventListener('click', function() {
  if (usr.value != '' && usr.value != ' ') {
    if (ipInput.value != '') {
      chatServer = ipInput.value;
    }
    username = usr.value;
    connect();
    connectbtn.style.display = 'none'
    ipInput.style.display = 'none'
    usr.style.display = 'none'
    msg.style.display = 'block'
    chatoutput.style.display = 'block'
    sendbtn.style.display = 'block'
    serverstatus.style.display = 'block'
  }
});

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
      serverstatus.innerText = 'Trying Connection...';
    };
  }, 2500);

  websocket.addEventListener("open", (e) => {
    let message = {
      type: "connect",
      username: "username",
    }
    idontknowwhattonamethis = false;
    if (soundtoggle.checked) {
      connectSFX.play();
    }
    console.log('Connected!')
    websocket.send(JSON.stringify(message))
    serverstatus.innerText = 'Connected';
  });

  websocket.addEventListener("close", function(e) {
    serverstatus.innerText = 'Disconnected';
    if (idontknowwhattonamethis == false && soundtoggle.checked) {
      disconnectSFX.play();
    }
    idontknowwhattonamethis = true;
  });


  websocket.addEventListener("message", function(rawmessage) {
    let message = JSON.parse(rawmessage.data);
    console.log('[Server Message]');
    if (message.type == "user_message") {
      chatoutput.innerHTML = message.data + '<br>' + chatoutput.innerHTML;
      if (message.username != username) {
        if (soundtoggle.checked) {
          messageInSFX.currentTime = 0;
          messageInSFX.play();
        }
        console.log('msg in play')
      } else {
        if (soundtoggle.checked) {
          messageOutSFX.currentTime = 0;
          messageOutSFX.play();
        }
        console.log('msg out play')
      }
    };
    if (message.type == "error") {
      if (message.username == username && message.error == 'invalidCharacters') {
        erroroutput.innerText = '[ERROR] Message or username contains disallowed characters'
        console.log('[ERROR] Message or username contains disallowed characters')
        setTimeout(function() {erroroutput.innerText = ''}, 5000);
      } else if (message.error == 'invalidJSON') {;
        erroroutput.innertext = '[ERROR] Client sent malformed JSON'
        console.log('[ERROR] Client sent malformed JSON')
        setTimeout(function() {erroroutput.innerText = ''}, 5000);
      } else if (message.error == 'messageTooLong') {
        erroroutput.innertext = '[ERROR] Client sent message too long'
        console.log('[ERROR] Client sent message too long')
        setTimeout(function() {erroroutput.innerText = ''}, 5000);
      } 
      else {
        erroroutput.innertext = '[ERROR] Unknown Error'
        console.log('[ERROR] Unknown Error')
      }
    };
    if (message.type == "server_message") {
      chatoutput.innerHTML = '<strong>' + '[SERVER] ' + message.message + '<br>' + '</strong>' + chatoutput.innerHTML;
    };
    if (message.type == "client_connect") {
      chatoutput.innerHTML = '[CONNECTION] ' + message.username + ' entered the chat!' + '<br>' + chatoutput.innerHTML
    }
  });
};

function sendMsg() {
  let message = {
    type: 'user_message',
    username: username,
    message: msg.value,
  }
  console.log('play sound')
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