const socket = io()

// variables
const $messageForm = document.querySelector('#message-form') 
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')

socket.on('message', (message) => {
	console.log(message)
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