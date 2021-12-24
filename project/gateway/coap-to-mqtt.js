import mqtt from 'mqtt'
import coapClient from './coapClient.js'

// CoAP Client

const client = new coapClient()

const remotePort = '5683'
const remoteAddress = 'localhost'

function fetchValue() {
    setTimeout(() => {
        client.request('GET', 'sensor')
        fetchValue()
    }, 3000)
}

client.onConnect(() => {
    console.log('Connected to CoAP Server')
    client.request('GET', 'sensor')
    fetchValue()
})

client.onMessage((payload, statusMessage) => {
    console.log(statusMessage + `: ${payload}`)
    client.publish('sensor', payload)
})

client.connect(remotePort, remoteAddress)

// MQTT Client

const client  = mqtt.connect(remoteAddress)

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
  client.end() // Maybe remove this
})