import dgram from 'dgram'

const requestMethods = ['GET', 'POST', 'PUT', 'DELETE']

try{
    if (!requestMethods.includes(process.argv[2])) {
        throw 'Incorrect request method!'
    }
} catch (e) {
    console.error(e)
    process.exit(1)
}

const version = 1 // version number 1
const type = 1 // Non-confirmable
const tokenLength = 0 // No tokens implemented

const reqCode = (() => {
    const requestMethod = process.argv[2]
    switch (requestMethod) {
        case 'GET':
            return 1
        case 'POST':
            return 2
        case 'PUT':
            return 3
        case 'DELETE':
            return 4
        default:
            break
    }
})()

const requestTarget = process.argv[3]
const payload = process.argv[4] || ''

const remotePort = '5683'
const remoteAddress = 'coap.me'

const udpsocket = dgram.createSocket('udp4')
udpsocket.connect(remotePort, remoteAddress)

udpsocket.on('connect', () => {
    const message = getMessage()
    udpsocket.send(message)
})

udpsocket.on('message', (data) => {
    console.log(`Got something: ${data}`)
    udpsocket.close()
})

function getMessage() {
    let byteArray = new Array()
	let tempByte = 0x00
	
    // First byte: version, type, and token length
	tempByte  = (0x03 & version) << 6
	tempByte |= (0x03 & type) << 4
	tempByte |= (0x0F & tokenLength)
	
	byteArray.push(tempByte)
	
	// Second byte: method or response code
    byteArray.push(0xFF & reqCode)
    
    // Third and forth byte: message ID (MID)
    const mid = Math.floor(Math.random() * 65536)
    byteArray.push(0xFF & (mid >>> 8))
    byteArray.push(0xFF & mid)

    const options = [
        {num: 3, length: remoteAddress.length, val: remoteAddress},
        {num: 7, length: 2, val: remotePort}, // this is a numerical (int) value
        {num: 11, length: requestTarget.length, val: requestTarget}
    ]

    // Options
    let previousOptionNumber = 0
    for (let option of options) {
        let optionDelta = option.num - previousOptionNumber
        byteArray.push(0xFF &  ((optionDelta << 4) | option.length))
        if (option.num === 7) { // Numerical (integer) values, e.g., uri-port
            const tempArr = intToBytes(option.val)
            for (let byte of tempArr)
                byteArray.push(byte)
        } else { // String values
            for (let char of option.val)
                byteArray.push(0xFF & char.charCodeAt(0))
        }
        previousOptionNumber = option.num
    }
    
    // If no payload
    if (payload !== '') {
        // Options Delimiter
        byteArray.push(0xFF);
    }
   
    // Header to Buffer
    let bufHeader = new Buffer.from(byteArray)
    
    // Payload to Buffer
    let bufPayload = new Buffer.from(payload)

    const packet = new Buffer.concat([bufHeader, bufPayload])
    console.log(packet)
    
    // Return CoAP packet
    return packet;
}



function intToBytes(i) {
	var b = new Array(0)
	while (i > 0) {
		b.unshift(0xFF & i)
		i >>>= 8
	}
	return b
}

// function coapHeaderOptions(data) {
//     return data[4]<<
// }

function COAP_HEADER_VERSION(data) {
    return (0xC0 & data[0])>>6
}
function COAP_HEADER_TYPE(data){
    return (0x30 & data[0])>>4
}
function COAP_HEADER_TKL(data) {
    return (0x0F & data[0])>>0
}
function COAP_HEADER_CLASS(data) {
    return ((data[1]>>5)&0x07)
}
function COAP_HEADER_CODE(data) {
    return ((data[1]>>0)&0x1F)
}
function COAP_HEADER_MID(data) {
    return (data[2]<<8)|(data[3])
}