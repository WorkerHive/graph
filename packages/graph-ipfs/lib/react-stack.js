const transportKey = WebRTCStar.prototype[Symbol.toStringTag]
const WebRTCStar = require('libp2p-webrtc-star')
const { P2PStack } = require('./p2p-stack')

const wrtcTransport = {
    enabled: true
}

const peerDiscovery = {
    autoDial: true,
    [WebRTCStar.tag]: {
        enabled: true
    }
}

module.exports = P2PStack([WebRTCStar], {
    transport: {
        [transportKey]: wrtcTransport
    },
    peerDiscovery: peerDiscovery
})