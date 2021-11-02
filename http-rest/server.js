const net = require('net')

const PORT = 8080

const server = net.createServer(function(connection) {
    console.log('client connected')
    console.log(connection)
    
    connection.on('end', function() {
        console.log('client disconnected')
    })

    connection.on('data', function(data) {
        connection.write(data.toString())
        connection.pipe(connection)
    })
    
    // connection.write('Hello World!\r\n')
    // connection.pipe(connection)
 })
 
 server.listen(PORT, function() {
    console.log(`server is listening on ${PORT}`)
 })