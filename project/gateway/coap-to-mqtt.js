import mqtt from 'mqtt'
import coapClient from './coapClient.js'


const remotePort = '5683'
const remoteAddress = '192.168.1.33'
const brokerPort = '1883'
const brokerAddress = 'localhost'

let topic = 'blocked'

const client = new coapClient()
const mqttClient  = mqtt.connect({ host: brokerAddress, port: brokerPort })

function fetchValue() {
    setTimeout(() => {
        client.request('GET', topic)
        fetchValue()
    }, 3000)
}

client.onConnect(() => {
    console.log('Connected to CoAP Server')
    client.request('GET', topic)
    fetchValue()
})

client.onMessage((payload, statusMessage) => {
    console.log(statusMessage + `: ${payload}`)
    mqttClient.publish(topic, payload)
})

client.connect(remotePort, remoteAddress)

// MQTT Client

// mqttClient.on('message', function (topic, message) {
//   // message is Buffer
//   console.log(message.toString())
//   client.end() // Maybe remove this
// })