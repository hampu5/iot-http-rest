import mqtt from 'mqtt'
import fs, { write } from 'fs'

const clientArray = []

const times = 20
const clients = 10000
const filename = 'times10000.txt'

for (let i = 0; i < clients; i += 1) {
    const client  = mqtt.connect({port: 1883, host: 'localhost', keepalive: 5})
    let topic = 'blocked'
    client.on('connect', (connack) => { client.subscribe(topic) })
    client.on('message', (topic, message) => {})

    clientArray.push(client)
}

const writeStream = fs.createWriteStream(filename)

let counter = 0

const client  = mqtt.connect({port: 1883, host: 'localhost', keepalive: 5})
let topic = 'blocked'
client.on('connect', (connack) => { client.subscribe(topic) })
client.on('message', (topic, message) => {
    writeStream.write((Date.now() - Number(message)).toString() + '\n')
    counter += 1
    if (counter >= times) {
        writeStream.close()
        process.exit()
    }
})



