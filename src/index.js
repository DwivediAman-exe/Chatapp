const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')


var app = express()
// creating a new webserver
const server = http.createServer(app)   
// calling socketio function and configuring a given server
const io = socketio(server)

// for using and displaying static files
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))





// setting up of port
const port = process.env.PORT || 3000

io.on('connection', () => {
	console.log('New websocket connection added')
})

server.listen(port, () => {
	console.log(`Server runnig at port ${port} !`)
})