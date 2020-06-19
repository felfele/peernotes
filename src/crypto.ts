import { createKeyPair } from '@erebos/secp256k1'
import { pubKeyToAddress } from '@erebos/keccak256'
import { toHex, hexToByteArray } from './conversion';
import { hexValue } from '@erebos/hex';

export const PRIVATE_KEY_BYTES_LENGTH = 32
export const PUBLIC_KEY_BYTES_LENGTH = 33
export const ADDRESS_BYTES_LENGTH = 20

export interface PrivateIdentity {
    privateKey: hexValue
    publicKey: hexValue
    address: hexValue
}

export const generateIdentity = (privateKeySeed: Uint8Array): PrivateIdentity => {
    const privateKeyHex = toHex(privateKeySeed, false)
    const keyPair = createKeyPair(privateKeyHex)
    const privateKey = toHex(hexToByteArray(keyPair.getPrivate('hex'), PRIVATE_KEY_BYTES_LENGTH))
    const publicKey = toHex(hexToByteArray(keyPair.getPublic(true, 'hex'), PUBLIC_KEY_BYTES_LENGTH))
    const address = pubKeyToAddress(keyPair.getPublic('array'))
    // console.log('generateIdentity', {privateKeyHex, privateKey, address, publicKey})
    return {
        privateKey,
        publicKey,
        address,
    }
}
