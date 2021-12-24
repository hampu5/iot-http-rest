import mqtt from 'mqtt'
import coapClient from './client.js'

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

client.onMessage((message) => {
    console.log(message)
})

client.connect(remotePort, remoteAddress)