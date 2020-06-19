import { Bzz } from '@erebos/bzz'
import { BzzFeed, getFeedMetadata, FeedID } from '@erebos/bzz-feed'
import { sign, createKeyPair } from '@erebos/secp256k1'
import { toHex } from './conversion'
import { hexValue } from '@erebos/hex'
import { PrivateIdentity } from './crypto'

const bzz = new Bzz({ url: 'http://localhost:8500' })

export const storageWrite = async (privateIdentity: PrivateIdentity, index: number, dataBytes: Uint8Array) => {
    const privateKey = createKeyPair(privateIdentity.privateKey.slice(2))
    const signBytes = async (bytes: number[]) => sign(bytes, privateKey)
    const bzzFeed = new BzzFeed({ bzz, signBytes })
    const address = privateIdentity.address
    const data = toHex(dataBytes)
    const meta = getFeedMetadata({user: address, time: index})
    const metaHash = FeedID.from(meta).toHash()
    console.log('storageWrite', {address, index, data, meta, metaHash})
    await bzzFeed.postChunk(meta, data)
}

export const storageRead = async (address: hexValue, index: number): Promise<Uint8Array | undefined> => {
    const bzzFeed = new BzzFeed({ bzz })
    const meta = getFeedMetadata({user: address, time: index})
    const metaHash = FeedID.from(meta).toHash()
    const dataBytes = await bzzFeed.getRawChunkData(meta)
    console.log('storageRead', {address, index, meta, metaHash, dataBytes})
    return new Uint8Array(dataBytes)
}
