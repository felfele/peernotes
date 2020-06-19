import { hexValue } from "@erebos/hex"
import { generateIdentity } from "./crypto"
import { hexToByteArray, toHex } from "./conversion"
import { sendHandshake, receiveHandshake } from "./handshake"
import { storageWrite, storageRead } from "./storage"

const alicePrivateKey = '0x00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff' as hexValue
const bobPrivateKey = '0xffeeddccbbaa99887766554433221100ffeeddccbbaa99887766554433221100' as hexValue

export const testStorageHandshake = async () => {
    const shareId = 'AAAAAAAAAA'
    const aliceIdentity = generateIdentity(hexToByteArray(alicePrivateKey))
    const bobIdentity = generateIdentity(hexToByteArray(bobPrivateKey))

    console.log({aliceIdentity, bobIdentity})

    const aliceHandshakeReader = await sendHandshake(shareId, aliceIdentity.address)
    const bobHandshakeReader = await receiveHandshake(shareId, bobIdentity.address)
    const alicePeer = await aliceHandshakeReader.read()
    const bobPeer = await bobHandshakeReader.read()

    console.log('test', {alicePeer, bobPeer})

    console.assert(alicePeer?.address === bobIdentity.address)
    console.assert(bobPeer?.address === aliceIdentity.address)
}

const areUint8ArraysEqual = (a: Uint8Array, b: Uint8Array): boolean =>
    a.length === b.length && a.every((value, index) => value === b[index])

export const testStorageReadWrite = async () => {
    const aliceIdentity = generateIdentity(hexToByteArray(alicePrivateKey))
    const index = 0
    const data = '0xc58c15a787595f8fa9ae4da90e044a6dab2d89ed' as hexValue
    const dataBytes = hexToByteArray(data)
    await storageWrite(aliceIdentity, index, dataBytes)
    const result = await storageRead(aliceIdentity.address, index)
    if (result == null) {
        console.error('result is undefined')
        return
    }
    console.assert(areUint8ArraysEqual(dataBytes, result))
    const resultHex = toHex(result)
    console.log({resultHex})
    console.assert(data === resultHex)
}
