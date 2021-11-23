import net from 'net'
import mqtt from 'mqtt'

// const socket = net.connect({port:1883, host:'localhost'}, () => {
//     console.log('Connected to Server!')
//     socket.write('Hello World!')

//     socket.on('data', (data) => {
//         console.log(data.toString())
//         socket.end()
//     })

//     socket.on('end', function() {
//         socket.end()
//     })
// })

// socket.on('error', (err) => {
//     console.error(err)
// })

const client  = mqtt.connect({port:1883, host:'localhost'})

client.on('connect', function () {
    // client.subscribe('presence', function (err) {
    //     if (!err) {
    //         client.publish('presence', 'Hello mqtt')
    //     }
    // })
})

client.on('message', function (topic, message) {
    // message is Buffer
    // console.log(message.toString())
    // client.end()
})