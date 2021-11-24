import mqtt from 'mqtt'

const client  = mqtt.connect({port: 1883, host: 'localhost', keepalive: 5})

client.on('connect', function (connack) {
    // console.log(`Connected, CONNACK: ${connack}`)
    // console.log(connack)
    // client.subscribe('presence', function (err) {
    //     if (!err) {
    //         client.publish('presence', 'Hello mqtt')
    //     }
    // })
})

client.on('message', function (topic, message) {
    // Message is Buffer
    // console.log(message.toString())
    // client.end()
})

client.on('packetreceive', function (packet) {
    console.log(packet)
})

client.on('packetsend', function (packet) {
    console.log(packet)
})