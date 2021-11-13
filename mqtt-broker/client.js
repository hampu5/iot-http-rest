import net from 'net'

const socket = net.connect({port:1883, host:'localhost'}, () => {
    console.log('Connected to Server!')
    socket.write('Hello World!')

    socket.on('data', (data) => {
        console.log(data.toString())
        socket.end()
    })

    socket.on('end', function() {
        socket.end()
    })
})

socket.on('error', (err) => {
    console.error(err)
})