import mqtt from 'mqtt'
import readline from 'readline'

const client  = mqtt.connect({port: 1883, host: 'localhost', keepalive: 5})
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})


client.on('connect', function (connack) {
    handleInput()
})

client.on('message', function (topic, message) {
    // Message is Buffer
    // console.log(message.toString())
    // client.end()
})

client.on('packetreceive', function (packet) {
    switch (packet.cmd) {
        case 'connack':
            console.log('Connected to Broker!')
            break
        case 'publish':
            console.log(`Received Value: ${packet.payload}`)
        case 'puback':
            console.log('Publish success!')
            break
        case 'suback':
            console.log('Subscribe success!')
            break
        case 'unsuback':
            console.log('Unsubscribe success!')
            break
        case 'pingresp':
            // console.log('Ping success!')
            break
        default:
            console.log('Unrecognized packet.')
    }
})

client.on('packetsend', function (packet) {
    
    // console.log(packet)
})

const request = {
    subscribe: function (topic) {
        client.subscribe(topic)
    },
    unsubscribe: function (topic) {
        client.unsubscribe(topic)
    },
    publish: function (topic, message) {
        client.publish(topic, message)
    },
    disconnect: function () {
        client.end()
    }
}

function handleInput() {

    rl.question("\nEnter command: ", (command) => {
        if (command === 'exit') {
            rl.close()
            client.end()
            return
        }

        const parsed = command.split(" ")
        // Method to call (publish, subscribe, ...)
        const requestMethod = request[parsed[0]]
        // Parameters to the request (<topic>, <value>)
        parsed.splice(0, 1)
        
        try {
            if (typeof requestMethod === 'function') {
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