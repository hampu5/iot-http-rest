import { connect } from 'net'

const request_methods = ['GET', 'POST', 'PUT', 'DELETE']
const protocol_versions = ['HTTP/1.0', 'HTTP/1.1', 'HTTP/2', 'HTTP/3']

try{
    if (!request_methods.includes(process.argv[2])) {
        throw 'Incorrect request method!'
    }
    if (!protocol_versions.includes(process.argv[4])) {
        throw 'Incorrect protocol version!'
    }
} catch (e) {
    console.error(e)
    process.exit(1)
}


const request_method = process.argv[2]
const request_target = process.argv[3]
const protocol_version = process.argv[4]

const body = process.argv[5]

const PORT = 8080

const options = {
    port: PORT,
    host: 'localhost'
}

const client = connect(options, function() {
    // console.log('connected to server!')
})

client.write(
    request_method + ' ' + request_target + ' ' + protocol_version +
    '\r\n\r\n' +
    body
)

client.on('data', function(data) {
    console.log(data.toString())
})

client.on('end', function() {
    client.end()
    // console.log('disconnected from server')
})