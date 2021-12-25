import coap from 'coap'
import Telnet from 'telnet-client'

const server = coap.createServer()
const telnetConnection = new Telnet()

const telnetParams = {
  host: '127.0.0.1',
  port: 4711,
  //negotiationMandatory: false
}

const cmd = '>recentBlocked'

let domain = ''

function blockedDNS() {
  setTimeout(() => {
    telnetConnection.exec(cmd, function(err, response) {
      domain = response
      console.log(domain)
      blockedDNS()
    })
  }, 5000)
}

telnetConnection.on('ready', function(prompt) {
  blockedDNS()
})

telnetConnection.connect(telnetParams)

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
  // RNG()
})