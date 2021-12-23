const coap = require('coap')
const server = coap.createServer()

// Generate vals from pihole-FTL through telnet 127.0.0.1 4711
// with the command >recentBlocked instead of:
let val = Math.floor(Math.random() * 10).toString()
console.log(val)

server.on('request', (req, res) => {
  const path = req.url.split('/')[1]
  if (path === 'sensor') { res.end(val) }
})

function RNG() {
  setTimeout(() => {
    val = Math.floor(Math.random() * 10).toString()
    console.log(val)
    RNG()
  }, 5000)
}

// the default CoAP port is 5683
server.listen(() => {
  console.log('Listening')
  RNG()
})