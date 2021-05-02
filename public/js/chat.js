const socket = io()

// variables
const $messageForm = document.querySelector('#message-form') 
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
	//New message
	const $newMessage = $messages.lastElementChild

	// height of new message
	const newMessageStyles = getComputedStyle($newMessage)
	const newMessagemargin = parseInt(newMessageStyles.marginBottom)
	const newMessageHeight = $newMessage.offsetHeight + newMessagemargin

	// visible Height
	const visibleHeight = $messages.offsetHeight

	// height of message container
	const containerHeight = $messages.scrollHeight

	// How far have i scrolled
	const scrollOffset = $messages.scrollTop + visibleHeight

	if(containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight
	}
}

socket.on('message', (message) => {
	console.log(message)
	const html = Mustache.render(messageTemplate, {
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format('h:mm A') 
	})
	$messages.insertAdjacentHTML('beforeend', html)
	autoscroll()
})

socket.on('locationMessage', (message) => {
	console.log(message)
	const html = Mustache.render(locationTemplate, {
		username: message.username,
		url: message.url,
		createdAt: moment(message.createdAt).format('h:mm A') 
	})
	$messages.insertAdjacentHTML('beforeend', html)
	autoscroll()
})

socket.on('roomData', ({room, users}) => {
	const html = Mustache.render(sidebarTemplate, {
		room,
		users
	})
	document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
	e.preventDefault()

	$messageFormButton.setAttribute('disabled', 'disabled')

	const message = e.target.elements.message.value

	socket.emit('sendMessage', message, (error) => {

		$messageFormButton.removeAttribute('disabled')
		$messageFormInput.value = ''
		$messageFormInput.focus() 

		if(error) {
			 console.log(error)
		}	
		console.log('message delivered')
	})
})

$locationButton.addEventListener('click', () => {

	$locationButton.setAttribute('disabled', 'disabled')

	if(!navigator.geolocation) {
		return alert('Geolocation is not supported in your browser')
	}

	navigator.geolocation.getCurrentPosition((position) => {
		socket.emit('sendLocation', {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		}, () => {
			$locationButton.removeAttribute('disabled')
			console.log('Your location was shared !')
		})
	})

})

socket.emit('join', {username, room}, (error) => {
	if(error) {
		alert(error)
		location.href = '/'
	}
})