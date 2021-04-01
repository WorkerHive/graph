const ENVIRONMENT = (typeof process !== 'undefined') && (process.release && process.release.name === 'node') ? 'NODE' : 'BROWSER'


const Bootstrap = require('libp2p-bootstrap')

const Libp2p = require('libp2p')
const MPLEX = require('libp2p-mplex');
const NOISE = require('libp2p-noise').NOISE;
const Protector = require('libp2p/src/pnet');


const P2PStack = (transport, config) => {

    return (swarmKey) => {
        return {
            modules: {
                transport: transport, //ENVIRONMENT == "NODE" ? [TCP, WebRTCStar] : [WebRTCStar],
                streamMuxer: [MPLEX],
                connEncryption: [NOISE],
                connProtector: new Protector(swarmKey),
            },
            config: config
        }
    }
}

    module.exports = {
        P2PStack
    }