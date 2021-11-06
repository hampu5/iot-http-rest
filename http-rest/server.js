import httpServer from './custom-http-server.js'
import fs from 'fs/promises'


// console.log(httpServer())

const options = {
    port: 8080,
    host: 'localhost'
}

const server = new httpServer()

server.get('/website', async (request, response) => {
    const content = await fs.readFile('website.html')
    //console.log("WOrks!")
    response.send(content.toString())
})

server.post('/website', async (request, response) => {
    let html_body = ''
    for (const [key, value] of Object.entries(params)) {
        html_body += `<p>${key}: ${value}</p>\n`
    }
    // Append
    fs.writeFile('website.html', html_body,  {'flag':'a'})
    
    // response.send(content.toString())
})

server.listen(options, () => {
    console.log(`server is listening on ${options.host}:${options.port}`)
})