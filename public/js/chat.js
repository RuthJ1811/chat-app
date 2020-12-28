// CLIENT SIDE SCRIPT
// io() // to connect to server
const socket = io()


// Mustache and moment is accessible through the scripts that are loaded in
// Elements from the DOM selected
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix : true })

const autoScroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;

    // Height of the new message
    // margin bottom spacing value
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin 

    // console.log(newMessageStyles, "newMessageStyles");
    console.log(newMessageHeight, "newMessageHeight");

    // visible height
    const visibleHeight = $messages.offsetHeight; // which stays constant

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight; // scrollTop gives a number the amount of distance we have scrolled from the top

    if(containerHeight - newMessageHeight <= scrollOffset){
        // scroll to the bottom
        // scrollHeight total available content we can scroll
        $messages.scrollTop = $messages.scrollHeight // all the way down
    }
}

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    console.log(message);
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll()
})

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text, // the options for attributes in index.html where we use mustache operator {{message}}
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll()
})

socket.on('roomData', ({ room, users}) => {
    console.log(room, "room from room data");
    console.log(users, "users from room data");
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
})

$messageForm.addEventListener('submit', (e) => {
    // disable
    e.preventDefault();

    $messageFormButton.setAttribute('disabled', 'disabled');
    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, function (error) {
        // enable
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            return console.log(error);
        }
        console.log('Message delivered!')
    })
})


const $shareLocationButton = document.querySelector('#send-location');
$shareLocationButton.addEventListener('click', () => {
    console.log("USE GEOLOCATION API")

    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser!')
    }

    $shareLocationButton.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $shareLocationButton.removeAttribute('disabled')
            console.log("Location shared!");
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if(error){
        alert(error);
        location.href = '/'
    }
});


// server (emit) -> client (receive) --send acknowledgement to--> server
// client (emit) -> server (receive) --send acknowledgement to--> client

// socket.on('countUpdated', (count) => {
//     console.log("The count has been updated!", count);
// })

// document.querySelector("#increment").addEventListener('click', () => {
//     console.log("BUTTON CLICKED")
//     socket.emit('increment');
// })

// const formEvent = document.querySelector('#message-form');
// const input = document.querySelector('input');

// formEvent.addEventListener('submit', (e) => {
//     e.preventDefault();
//     socket.emit('sendMessage', input.value);
// })

// document.querySelector('#message-form').addEventListener('submit', (e) => {
//     // disable

//     e.preventDefault();
//     const message = e.target.elements.message.value
//     // socket.emit('sendMessage', message);
//     // 3rd parameter runs when the event is acknowledged
//     socket.emit('sendMessage', message, function (error) {
//         // enable
//         if(error){
//             return console.log(error);
//         }
//         console.log('Message delivered!')
//     })
// })