import mqtt from 'mqtt'
import readline from 'readline'

const client  = mqtt.connect({port: 1883, host: 'localhost', keepalive: 5})
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})


client.on('connect', function (connack) {
    handleInput()
    // client.subscribe('sensor', 5, 6, 7)
    

    // console.log(`Connected, CONNACK: ${connack}`)
    // console.log(connack)
    // client.subscribe('sensor', function (err) {
    //     if (!err) {
    //         client.publish('sensor', '7')
    //     } else {
    //         console.log('THERE WAS ERROR')
    //     }
    // })
})

client.on('message', function (topic, message) {
    // Message is Buffer
    // console.log(message.toString())
    // client.end()
})

client.on('packetreceive', function (packet) {
    // console.log(packet)
})

client.on('packetsend', function (packet) {
    console.log(packet)
})

const request = {
    sub: function (topic) {
        client.subscribe(topic)
    },
    pub: function (topic, message) {
        client.publish(topic, message)
    }
}

function handleInput() {

    rl.question("Enter command: ", (command) => {
        if (command === 'exit') {
            rl.close()
            client.end()
            return
        }
        const parsed = command.split(" ")
        console.log(parsed)
        const requestMethod = request[parsed[0]]
        parsed.splice(0, 1)
        console.log(requestMethod)
        console.log(parsed)

        
        try {
            if (typeof requestMethod === 'function') {
                // client.subscribe.apply(null, ['sensor'])
                if (parsed.length === 0) {
                    requestMethod.apply(client)
                    return rl.close()
                }
                requestMethod.apply(client, parsed)
            }
        } catch (error) {
            console.error(error)
        }
        handleInput()
    })
}