// const net = require('net')
import net from 'net'
// const fs = require('fs').promises
import fs from 'fs/promises'

const options = {
    port: 8080,
    host: 'localhost'
}

const request_methods = ['GET', 'POST', 'PUT', 'DELETE']
const protocol_versions = ['HTTP/1.0', 'HTTP/1.1', 'HTTP/2', 'HTTP/3']

export default function httpServer() {
    const paths = {}

    const tcpServer = net.createServer(function(connection) {
        console.log(`client ${connection.remoteAddress}:${connection.remotePort} connected`)
        
        connection.on('end', function() {
            console.log('client disconnected')
        })
    
        connection.on('data', function(data) {
            const http_lines = http_request_lines(data)
            const path = http_lines.request_line.request_target
            const method = http_lines.request_line.request_method
            const version = http_lines.request_line.protocol_version
    
            if (version !== 'HTTP/1.1') {
                connection.write('HTTP/1.1 505 HTTP Version Not Supported\r\n')
                connection.pipe(connection)
                connection.end()
            }

            


            paths[path][method](connection)
    
            // switch (http_lines.request_line.request_method) {
            //     case 'GET':
            //         get_data(http_lines.request_line.request_target).then((file_data) => {
            //             connection.write(
            //                 'HTTP/1.1 200 OK\r\n'
            //             )
            //             connection.write(
            //                 file_data
            //             )
            //             connection.end()
            //         }).catch((e) => {
            //             console.error(e)
            //             if (e.errno === -2) {
            //                 connection.write(
            //                     'HTTP/1.1 404 Not Found\r\n\r\n'
            //                 )
            //             }
            //             connection.end()
            //         })
            //         break
            //     case 'POST':
            //         post_data(http_lines.request_line.request_target, http_lines.body)
            //         connection.write(
            //             'HTTP/1.1 200 OK\r\n'
            //         )
            //         connection.end()
            //         break
            //     case 'PUT':
            //         put_data(http_lines.request_line.request_target, http_lines.body)
            //         connection.write(
            //             'HTTP/1.1 200 OK\r\n'
            //         )
            //         connection.end()
            //         break
            //     case 'DELETE':
            //         delete_data(http_lines.request_line.request_target)
            //         connection.write(
            //             'HTTP/1.1 200 OK\r\n'
            //         )
            //         connection.end()
            //         break
            //     default:
            //         break
            // }
            
        })
    })

    // const response = {
    //     send: function(data) {
    //         connection.write(
    //             'HTTP/1.1 200 OK\r\n' +
    //             `Date: ${new Date().toUTCString()}\r\n`
    //         )
    //         // connection.write(
    //         //     'Content-Type: text/html\r\n' // save this earlier in the get() function
    //         // )
    //         connection.write(
    //             '\r\n' +
    //             data +
    //             '\r\n'
    //             )
    //     }
    // }

    this.get = function(path, callback) {
        const get_callback = function(connection) {
            const response = {
                send: function(data = '') {
                    connection.write(
                        'HTTP/1.1 200 OK\r\n' +
                        `Date: ${new Date().toUTCString()}\r\n`
                    )
                    // connection.write(
                    //     'Content-Type: text/html\r\n' // save this earlier in the get() function
                    // )
                    connection.write(
                        '\r\n' +
                        data +
                        '\r\n'
                    )
                    connection.end()
                }
            }
            try {
                callback({}, response) // add request object as well
            } catch (error) {
                console.error(error)
                if (e.errno === -2) {
                    connection.write(
                        'HTTP/1.1 404 Not Found\r\n\r\n'
                    )
                }
                connection.end()
            }
            
        }
        paths[path] = {
            ...paths[path],
            GET: get_callback
        }
    }

    this.post = function(path, callback) {
        const new_callback = function(connection) {
            const response = {
                send: function(data = '') {
                    connection.write(
                        'HTTP/1.1 200 OK\r\n' +
                        `Date: ${new Date().toUTCString()}\r\n`
                    )
                    // connection.write(
                    //     'Content-Type: text/html\r\n' // save this earlier in the get() function
                    // )
                    connection.write(
                        '\r\n' +
                        data +
                        '\r\n'
                    )
                    connection.end()
                }
            }
            try {
                callback({}, response) // add request object as well
            } catch (error) {
                console.error(error)
                if (e.errno === -2) {
                    connection.write(
                        'HTTP/1.1 404 Not Found\r\n\r\n'
                    )
                }
                connection.end()
            }
            
        }
        paths[path] = {
            ...paths[path],
            POST: new_callback
        }
    }

    this.listen = function(options, callback) {
        tcpServer.listen(options, callback())
    }
}

// Get data from file
async function get_data(request_target) {
    let content = ''
    let return_string = `Date: ${new Date().toUTCString()}\r\n`

    switch (request_target) {
        case '/website':
            content = await fs.readFile('website.html')
            return_string += 'Content-Type: text/html\r\n'
            break
        case '/json':
            content = await fs.readFile('data.json')
            return_string += 'Content-Type: application/json\r\n'
            break
        default:
            break
    }

    return_string +=
        '\r\n' +
        content +
        '\r\n'

    return return_string
}

// Update file
async function post_data(request_target, body) {
    const params = get_url_parameters(body)
    let path = ''

    switch (request_target) {
        case '/website':
            path = 'website.html'
            let html_body = ''
            for (const [key, value] of Object.entries(params)) {
                html_body += `<p>${key}: ${value}</p>\n`
            }
            // Append
            fs.writeFile(path, html_body,  {'flag':'a'},  function(err) {
                if (err) {
                    return console.error(err)
                }
            })
            break
        case '/json':
            path = 'data.json'
            let file = {}
            try {
                // Append to this file
                file = JSON.parse(await fs.readFile('data.json'))
            } catch (e) {
                console.log(e)
                file = {}
            }
            for (const [key, value] of Object.entries(params)) {
                file[key] = value
            }
            fs.writeFile(path, JSON.stringify(file))
            break
        default:
            break
    }
}

// Create or replace file
async function put_data(request_target, body) {
    const params = get_url_parameters(body)
    let path = ''

    switch (request_target) {
        case '/website':
            path = 'website.html'
            let html_body = ''
            for (const [key, value] of Object.entries(params)) {
                html_body += `<p>${key}: ${value}</p>\n`
            }
            // Write this file
            fs.writeFile(path, html_body, function(err) {
                if (err) {
                    return console.error(err)
                }
            })
            break
        case '/json':
            path = 'data.json'
            let file = {}
            for (const [key, value] of Object.entries(params)) {
                file[key] = value
            }
            // Write this file
            fs.writeFile(path, JSON.stringify(file))
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