const secureRandom = require('secure-random');
const { sha256 } = require('@noble/hashes/sha256');
const bip39 = require('bip39');
const pbkdf2 = require('pbkdf2');
const hdKey = require('hdkey');
const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');
// You must wrap a tiny-secp256k1 compatible implementation
const bip32 = BIP32Factory(ecc);
const ethutil = require('ethereumjs-utils');
const solanaWeb3 = require('@solana/web3.js');
const nacl = require('@solana/web3.js').nacl;
const Base58 = require('base-58')
const bs58 = require('bs58')

const wordlist = bip39.wordlists.english;
function lpad(str, padString, length) {
  while (str.length < length) {
    str = padString + str;
  }
  return str;
}
function bytesToBinary(bytes) {
  return bytes.map(x => lpad(x.toString(2), '0', 8)).join('');
}

const bytes = secureRandom(16);
let entropy = '';
bytes.forEach(byte => {
  entropy = entropy.concat(byte.toString(2).padStart(8, '0'));
});
console.log(entropy);

let hexEntropy = BigInt('0b' + entropy).toString(16);
const encryptEntropy = sha256(new Uint8Array(Buffer.from(hexEntropy, 'hex')));
const encryptEntropyBits = bytesToBinary(Array.from(encryptEntropy));
const size = entropy.length / 32;
const checksum = encryptEntropyBits.slice(0, size);

const full = entropy.concat(checksum);

const wordBinaryArray = full.match(/.{1,11}/g);

const wordListDecimal = wordBinaryArray.map(item => parseInt(item, 2));

const mnemonic = wordListDecimal.map(decimal => wordlist[decimal]).join(' ');

console.log('mnemonic: '+mnemonic);

const seed = pbkdf2.pbkdf2Sync(mnemonic, 'mnemonic', 2048, 64, 'sha512');
const seedHex = seed.toString('hex');
console.log('Seed: ' + seedHex +" \n ");
const masterNode = hdKey.fromMasterSeed(seed);

const childkeyEth = masterNode.derive("m/44'/60'/0'/0/0");
console.log('Ethereum PrivateKey: ' + childkeyEth.privateKey.toString('hex'));
const addressEth = ethutil.publicToAddress(childkeyEth.publicKey, true);
console.log('Ethereum Address: ' +"0x"+ addressEth.toString('hex') +" \n ");

const childkeyPloygon = masterNode.derive("m/44'/60'/0'/0/0");
console.log('Polygon PrivateKey: ' + childkeyPloygon.privateKey.toString('hex'));
const addressPolygon = ethutil.publicToAddress(childkeyPloygon.publicKey, true);
console.log('Polygon Address: ' +"0x"+ addressPolygon.toString('hex') +" \n ");

// const childkeyDoge = masterNode.derive("m/0'/3'/0'/0/0");
// console.log('Dogecoin PrivateKey: ' + childkeyDoge.privateKey.toString('hex') +" \n ");
// const addressDoge = bitcoin.payments.p2pkh({ pubkey: childkeyDoge.publicKey });
// console.log('Dogecoin Address: ' +"0x"+ addressDoge.address +" \n ");

const childkeyBitcoin = masterNode.derive("m/44'/0'/0'/0/0");
// console.log(childkeyBitcoin.privateExtendedKey.toString('hex'));
const bitcoinAddress = bitcoin.payments.p2pkh({ pubkey: childkeyBitcoin.publicKey });
console.log('Bitcoin address:', bitcoinAddress.address +" \n ");



// Derive the Solana key pair from the seed
const keyPair = solanaWeb3.Keypair.generate({
  seed: Buffer.from(seedHex)
});

// Derive the Solana private key in raw bytes
// const privateKey = Buffer.from((keyPair.secretKey).slice(0, 32));
// const chainCode = Buffer.from((keyPair.secretKey).slice(32))
const publicKey = (keyPair.publicKey.toBase58())
console.log("Solana Address: " +publicKey);

const pvtkey= bs58.encode(keyPair.secretKey)
console.log("Solana PrivateKey: " + pvtkey);
