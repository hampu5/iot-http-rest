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
                get_data(request_target).then((file_data) => {
                    connection.write(
                        'HTTP/1.1 200 OK\r\n'
                    )
                    connection.write(
                        file_data
                    )
                    connection.end()
                }).catch((e) => {
                    console.error(e)
                    if (e.errno === -2) {
                        connection.write(
                            'HTTP/1.1 404 Not Found\r\n\r\n'
                        )
                    }
                    connection.end()
                })
                break
            case 'POST':
                post_data(request_target, body)
                connection.write(
                    'HTTP/1.1 200 OK\r\n'
                )
                connection.end()
                break
            case 'DELETE':
                delete_data(request_target)
                connection.write(
                    'HTTP/1.1 200 OK\r\n'
                )
                connection.end()
                break
            default:
                break
        }
        
    })
})

// Get data from file
async function get_data(request_target) {
    let content = ''
    switch (request_target) {
        case '/website':
            content = await fs.readFile('website.html')
            break
        case '/json':
            content = await fs.readFile('data.json')
            break
        default:
            break
    }

    let return_string = `Date: ${new Date().toUTCString()}\r\n` +
        'Content-Type: text/html\r\n' +
        '\r\n' +
        content +
        '\r\n'

    return return_string
}

// Update file
async function post_data(request_target, body) {
    switch (request_target) {
        case '/website':
            const path = 'website.html'
            try {
                await fs.access(path, fs.F_OK);
                console.log('can access');
            } catch {
                console.error('cannot access');
            }
            let html_body = ''
            const params = get_url_parameters(body)
            for (const [key, value] of Object.entries(params)) {
                html_body += `<p>${key}: ${value}</p>\n`
            }
            fs.appendFile(path, html_body)
            break
        case '/json':
            fs.open('data.json', )
            const file = JSON.parse(await fs.open('data.json'))
            const params2 = get_url_parameters(body)
            for (const [key, value] of Object.entries(params2)) {
                file[key] = value
            }
            fs.appendFile('data.json', JSON.stringify(file))
            break
        default:
            break
    }
}

// Delete a file
function delete_data(request_target) {
    switch (request_target) {
        case '/website':
            fs.unlink('website.html', (err) => {
                if (err) throw err
                console.log('website.html was deleted')
              })
            break
        case '/json':
            fs.unlink('data.json', (err) => {
                if (err) throw err
                console.log('data.json was deleted')
              })
            break
        default:
            break
    }
}

function get_url_parameters(body) {
    const result = {}
    if (!body) return result
    const url_pairs = body.split('&')
    url_pairs.forEach((pair) => {
        const kv_pair = pair.split('=')
        result[kv_pair[0]] = kv_pair[1]
    })
    return result
}

 server.listen(options, function() {
    console.log(`server is listening on ${options.host}:${options.port}`)
 })