import mqtt from 'mqtt'

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