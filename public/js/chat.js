// Gets access to the socket in the server-side to be able to send/receive events
const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('#message-form-input');
const $messageFormButton = document.querySelector('#message-form-button');
const $locationButton = document.querySelector('#send_location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
// QS.parse takes the query string, then ignoreQueryPrefix removes the "?"
// location.search is from JS, which takes the ?username="Ken"&room="Lucena"
// query string from the URL upon form submission
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

// Sets up a listener for join when that event fires
socket.emit('join', { username, room }, error => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});

const autoScroll = () => {
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible Height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

// EVENT LISTENER: Receive the event function that the server is sending to the client
socket.on('deliverMessage', message => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('hh:mm:ssa')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

// EVENT LISTENER: Receive the location
socket.on('deliverLocation', message => {
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format('hh:mm:ssa')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });
  document.querySelector('#sidebar').innerHTML = html;
});

// When the form is submitted
$messageForm.addEventListener('submit', e => {
  e.preventDefault();

  socket.emit('sendMessage', $messageFormInput.value, acknowledgement => {
    $messageFormInput.value = '';
    $messageFormInput.focus();
  });
});

// When the send location button is clicked
$locationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser.');
  }

  $locationButton.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition(position => {
    $locationButton.removeAttribute('disabled');
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      acknowledgement => {
        console.log(acknowledgement);
      }
    );
  });
});
