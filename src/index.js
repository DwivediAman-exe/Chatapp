const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const { Socket } = require('dgram')


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

	socket.emit('message', 'welcome')

	socket.broadcast.emit('message', 'A new user has joined the chat :)')

	socket.on('sendMessage', (message) => {
		io.emit('message', message)
	})

	socket.on('sendLocation', (location) => {
		io.emit('message', `https://google.com/maps?q=${location.latitude},${location.longitude}`)
	})

	socket.on('disconnect', () => {
		io.emit('message', 'A user has left the chat :(')
	})
})

server.listen(port, () => {
	console.log(`Server runnig at port ${port} !`)
})