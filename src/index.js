const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')

var app = express()
// creating a new webserver
const server = http.createServer(app)   
// calling socketio function and configuring a given server
const io = socketio(server)

// setting up of port
const port = process.env.PORT || 3000
// for using and displaying static files
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))


io.on('connection', (socket) => {
	console.log('New websocket connection added')

	socket.on('join', ({username, room}) => {
		socket.join(room)
		
		socket.emit('message', generateMessage('Welcome !'))
		socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined the chat !`))
	})

	socket.on('sendMessage', (message, callback) => {
		const filter = new Filter();

		if(filter.isProfane(message)) {
			io.emit('message', generateMessage(filter.clean(message)))
		}
		else {
			io.emit('message', generateMessage(message))
		}
		
		callback()
	})

	socket.on('sendLocation', (coords,callback) => {
		io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
		callback()
	})

	socket.on('disconnect', () => {
		io.emit('message', generateMessage('A user has left the chat :(' ))
	})
})

server.listen(port, () => {
	console.log(`Server runnig at port ${port} !`)
})