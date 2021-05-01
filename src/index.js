const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')
 
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

	socket.on('join', ({username, room}, callback) => {
		const {error, user} = addUser({id: socket.id, username, room})

		if(error) {
			return callback(error)
		}

		socket.join(user.room)
		
		socket.emit('message', generateMessage('Welcome !'))
		socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined the chat !`))

		callback()
	})

	socket.on('sendMessage', (message, callback) => {
		const user = getUser(socket.id)

		const filter = new Filter();

		if(filter.isProfane(message) || !filter.isProfane(message)) {
			io.to(user.room).emit('message', generateMessage(filter.clean(message)))
		} 
		callback()
	})

	socket.on('sendLocation', (coords,callback) => {
		const user = getUser(socket.id)
		io.to(user.room).emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
		callback()
	})

	socket.on('disconnect', () => {
		const user = removeUser(socket.id)

		if(user) {
			io.to(user.room).emit('message', generateMessage(`${user.username} has left the chat !`))
		}

	})
})

server.listen(port, () => {
	console.log(`Server runnig at port ${port} !`)
})