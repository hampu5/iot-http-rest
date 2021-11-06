import httpServer from './custom-http-server.js'
import fs from 'fs/promises'


// console.log(httpServer())

const options = {
    port: 8080,
    host: 'localhost'
}

const server = new httpServer()

server.get('/json', async (request, response) => {
    try {
        const dataObject = await fs.readFile('data.json')
        response.send(dataObject.toString())
    } catch (err) {
        if (err.code == 'ENOENT') {
            response.send('', '404')
        }
    }
})

server.post('/json', async (request, response) => {
    try {
        await fs.stat('data.json')
        response.send('', '409')
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            await fs.writeFile('data.json', JSON.stringify({}))
            response.send('', '201')
        }
    }
})

server.put('/json', async (request, response) => {
    try {
        await fs.stat('data.json')
        const dataObject = {}
        for (const [key, value] of Object.entries(request.urlParameters)) {
            dataObject[key] = value
        }
        await fs.writeFile('data.json', JSON.stringify(dataObject))
        response.send()
    } catch (err) {
        if (err.code == 'ENOENT') {
            response.send('', '404')
        }
    }
})

server.delete('/json', async (request, response) => {
    try {
        await fs.unlink('data.json')
        response.send()
    } catch (err) {
        if (err.code == 'ENOENT') {
            response.send('', '404')
        }
    }
})

server.listen(options, () => {
    console.log(`server is listening on ${options.host}:${options.port}`)
})