import mqtt from 'mqtt'
import coapClient from './client.js'

const client = new coapClient()

const remotePort = '5683'
const remoteAddress = 'localhost'

client.connect(remotePort, remoteAddress)

function fetchValue() {
    setTimeout(() => {
        client.request()
    }, 3000)
}

client.onConnect(() => {
    
})