import mqtt from 'mqtt'
import coapClient from './coapClient.js'


const remotePort = '5683'
const remoteAddress = 'localhost'
const brokerPort = '1883'
const brokerAddress = 'localhost'

const client = new coapClient()
const mqttClient  = mqtt.connect({ host: brokerAddress, port: brokerPort })

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
    mqttClient.publish('sensor', payload)
})

client.connect(remotePort, remoteAddress)

// MQTT Client

// mqttClient.on('message', function (topic, message) {
//   // message is Buffer
//   console.log(message.toString())
//   client.end() // Maybe remove this
// })