const net = require('net')
const prompt = require('prompt-sync')({sigint: true})
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

const PORT = 8080

const options = {
    port: PORT
}

const client = net.connect(options, function() {
    console.log('connected to server!')
})

client.on('data', function(data) {
    console.log(data.toString())
    client.end()
})

client.on('end', function() { 
    console.log('disconnected from server')
})

let version = 'HTTP/1.1'
let path = '/images/test.png'

// let input = prompt('HTTP request -> ')


   
readline.question('HTTP request -> ', input => {
    // console.log(`Hey there ${name}!`)
    client.write(input + ' ' + version + '\n')
    readline.close()
})