const MDNS = require('libp2p-mdns')
const TCP = require('libp2p-tcp')
const wrtc = require('wrtc')
const WebRTCStar = require('libp2p-webrtc-star')

const transportKey = WebRTCStar.prototype[Symbol.toStringTag]

const wrtcTransport = {
    enabled: true,
    wrtc: wrtc
}
const peerDiscovery = {
    autoDial: true,
    [WebRTCStar.tag]: {
        enabled: true
    },
    [MDNS.tag]: {
        enabled: true
    }
}

module.exports = P2PStack([TCP, WebRTCStar], {
    transport: {
        [transportKey]: wrtcTransport
    },
    peerDiscovery: peerDiscovery
})