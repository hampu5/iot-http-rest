const net = require('net')
const fs = require('fs').promises

const options = {
    port: 8080,
    host: 'localhost'
}

const request_methods = ['GET', 'POST', 'PUT', 'DELETE']
const protocol_versions = ['HTTP/1.0', 'HTTP/1.1', 'HTTP/2', 'HTTP/3']

const server = net.createServer(function(connection) {
    console.log(`client ${connection.remoteAddress}:${connection.remotePort} connected`)
    
    connection.on('end', function() {
        console.log('client disconnected')
    })

    connection.on('data', function(data) {
        const header_and_body = data.toString().split('\r\n\r\n')
        const header_lines = header_and_body[0].split('\r\n')
        const body = header_and_body[1]
        const request_line = header_lines[0].split(' ')

        const request_method = request_line[0]
        const request_target = request_line[1]
        const protocol_version = request_line[2]

        if (protocol_version !== 'HTTP/1.1') {
            connection.write('HTTP/1.1 505 HTTP Version Not Supported\r\n')
            
            connection.pipe(connection)
            connection.end()
        }

        switch (request_method) {
            case 'GET':
                fetch_data(request_target).then((file_data) => {
                    connection.write(
                        'HTTP/1.1 200 OK\r\n'
                    )
                    connection.write(
                        `Date: ${new Date().toUTCString()}\r\n` +
                        'Content-Type: text/html\r\n' +
                        '\r\n'
                    )
                    connection.write(
                        file_data + '\r\n'
                    )
                    connection.end()
                })
                break
            default:
                break
        }
        
    })
})

async function fetch_data(request_target) {
    switch (request_target) {
        case '/website':
            return await fs.readFile('website.html', 'utf8')
        default:
            break
    }
}

 server.listen(options, function() {
    console.log(`server is listening on ${options.host}:${options.port}`)
 })