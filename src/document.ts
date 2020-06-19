import { hexValue } from '@erebos/hex'
import { hash } from '@erebos/keccak256'
import { toHex, encodeId } from './conversion'
import { generateIdentity } from './crypto'

interface KeyPair {
    privateKey: hexValue
    publicKey: hexValue
    address: hexValue
}

export interface Peer {
    address: hexValue
}

export interface LocalDocument {
    randomSeed: hexValue
    feedKeyPair: KeyPair
    shareId: string
    documentId: string
    todos: string[]
    peers: Peer[]
}

export const createRandomDocument = (): LocalDocument => {
    const byteArray = new Uint8Array(32)
    const randomSeed = crypto.getRandomValues(byteArray)
    const documentId = createRandomShareId(randomSeed)
    const shareId = createRandomShareId()
    const feedKeyPair = generateIdentity(randomSeed)
    return {
        randomSeed: toHex(randomSeed),
        feedKeyPair,
        shareId,
        documentId,
        todos: [],
        peers: [],
    }
}

export const createRandomShareId = (randomSeed?: Uint8Array, length = 8): string => {
    if (randomSeed == null) {
        randomSeed = crypto.getRandomValues(new Uint8Array(length))
    }
    const randomSeedHash = new Uint8Array(hash(Buffer.from(randomSeed)))
    return encodeId(randomSeedHash.slice(0, length).buffer)
}

// document feed: document updates
// share feed: pass the private key of handshake feed
// urlHash: random
