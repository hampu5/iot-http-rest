import net from 'net'

const options = {
    port: 8080,
    host: 'localhost'
}

// const request_methods = ['GET', 'POST', 'PUT', 'DELETE']
// const protocol_versions = ['HTTP/1.0', 'HTTP/1.1', 'HTTP/2', 'HTTP/3']

export default function httpServer() {
    const paths = {}
    const codePhrases = {
        '200': 'OK',
        '201': 'Created',
        '404': 'Not Found',
        '409': 'Conflict'
    }

    const tcpServer = net.createServer(function(connection) {
        console.log(`client ${connection.remoteAddress}:${connection.remotePort} connected`)
        
        connection.on('end', function() {
            console.log('client disconnected')
        })
    
        connection.on('data', function(data) {
            const httpLines = http_request_lines(data)
            const path = httpLines.request_line.request_target
            const method = httpLines.request_line.request_method.toLowerCase()
            const version = httpLines.request_line.protocol_version
    
            if (version !== 'HTTP/1.1') {
                connection.write('HTTP/1.1 505 HTTP Version Not Supported\r\n')
                connection.pipe(connection)
                connection.end()
            }

            // Calls the http-method-callback for the requested path
            paths[path][method](connection, httpLines.body)
        })
    })

    function createRequest(requestBody) {
        const params = getUrlParameters(requestBody)
        return {
            urlParameters: params
        }
    }

    function createResponse(connection) {
        return {
            send: function(data = '', code = '200') {
                // Status line
                connection.write(
                    `HTTP/1.1 ${code} ${codePhrases[code]}\r\n`
                )
                // Header fields
                connection.write(
                    `Date: ${new Date().toUTCString()}\r\n`
                    // 'Content-Type: text/html\r\n' // save this earlier in the get() function
                )
                connection.write('\r\n')
                // Body
                if (data !== '') {
                    connection.write(
                        data
                    )
                }
                // await new Promise(resolve => setTimeout(resolve, 5000));
                connection.end()
            }
        }
    }

    function method(path, callback, verb) {
        const newCallback = function(connection, requestBody) {
            const request = createRequest(requestBody)
            const response = createResponse(connection)
            callback(request, response) // add request object as well
        }
        
        paths[path] = {
            ...paths[path],
            [verb]: newCallback
        }
    }

    const verb = ['get', 'post', 'put', 'delete']
    verb.forEach((verb) => {
        this[verb] = function(path, callback) {
            method(path, callback, verb)
        }
    })

    this.listen = function(options, callback) {
        tcpServer.listen(options, callback())
    }
}

// Returns the:
// Request line
// Headers
// Body
function http_request_lines(data) {
    const header_and_body = data.toString().split('\r\n\r\n')
    const header_lines = header_and_body[0].split('\r\n')
    const request_line = header_lines[0].split(' ')

    const return_obj = {
        request_line: {
            request_method: request_line[0],
            request_target: request_line[1],
            protocol_version: request_line[2],
        },
        body: header_and_body[1]
    }
    for (let i = 1; i != header_lines.length; i++) {
        const header = header_lines[i].split(': ') // Two indices as key: value
        return_obj[header[0]] = header[1]
    }

    return return_obj
}

function getUrlParameters(body) {
    const result = {}
    if (!body) return result
    const url_pairs = body.split('&')
    url_pairs.forEach((pair) => {
        const kv_pair = pair.split('=')
        result[kv_pair[0]] = kv_pair[1]
    })
    return result
}