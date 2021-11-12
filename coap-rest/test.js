import dgram from 'dgram'

const socket = dgram.createSocket('udp4')

socket.on('message', (data) => {
    console.log(data.toString())
    socket.close()
})

socket.bind('5683', 'localhost')

const message = 'Hello World!'
socket.send(message, '5683', 'coap.me')