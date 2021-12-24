import mqtt from 'mqtt'
import coapClient from './coapClient.js'

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
    client.request('GET', 'sensor')
    fetchValue()
})

client.onMessage((payload, statusMessage) => {
    console.log(statusMessage + `: ${payload}`)
})

client.connect(remotePort, remoteAddress)