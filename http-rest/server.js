import httpServer from './custom-http-server.js'
import fs from 'fs/promises'


// console.log(httpServer())

const options = {
    port: 8080,
    host: 'localhost'
}

const server = new httpServer()

server.get('/website', async (request, response) => {
    try{
        const content = await fs.readFile('website.html')
        response.send(content.toString())
    } catch (err) {
        if (err.code == 'ENOENT') {
            response.send('', '404')
        }
    }
})

server.post('/website', async (request, response) => {
    try {
        await fs.stat('website.html')
        console.log('file or directory already exists')
        response.send('', '409')
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            console.log('file or directory does not exist')
            let html_body = ''
            for (const [key, value] of Object.entries(request.urlParameters)) {
                html_body += `<p>${key}: ${value}</p>\n`
            }
            // Append
            await fs.writeFile('website.html', html_body,  {'flag':'a'})
            response.send('', '201')
        }
    }
})

server.listen(options, () => {
    console.log(`server is listening on ${options.host}:${options.port}`)
})