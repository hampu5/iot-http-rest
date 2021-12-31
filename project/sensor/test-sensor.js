import coap from 'coap'

const server = coap.createServer()

server.on('request', (req, res) => {
  const path = req.url.split('/')[1]
  if (path === 'blocked') { res.end(Date.now().toString()) }
})

// the default CoAP port is 5683
server.listen(() => {
  console.log('Listening')
})