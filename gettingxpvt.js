const HDKey = require('hdkey');
const bitcoin = require('bitcoinjs-lib')
// const bip32 = require('bip32')
const ecc = require('tiny-secp256k1')
const { BIP32Factory } = require('bip32')
// You must wrap a tiny-secp256k1 compatible implementation
const bip32 = BIP32Factory(ecc)

const seedHex = 'a0f2a0596b35d682a71978dc1599f153d4595fb961b922b34fc785bbecd5aa6bcbf8478175bc319f7b747564c376605720e1aca53f610ccf579802262fd8bb43';
const seed = Buffer.from(seedHex, 'hex');
const masterNode = HDKey.fromMasterSeed(seed);
const masterPrivateKey = masterNode.privateExtendedKey;
console.log(masterPrivateKey);


// derive the first receiving address
const node =  bip32.fromBase58(masterPrivateKey)
const path = "m/44'/3'/0'/0/0"
const childNode = node.derivePath(path)
console.log(childNode.privateKey.toString('hex'))
console.log(childNode.publicKey.toString('hex'));
// generate the Bitcoin address
const { address } = bitcoin.payments.p2pkh({ pubkey: childNode.publicKey })
console.log('Bitcoin address:', address)
