import { receiveHandshake, sendHandshake } from './handshake'
import { hexValue } from '@erebos/hex'
import { generateIdentity, PrivateIdentity, PRIVATE_KEY_BYTES_LENGTH } from './crypto'
import { hexToByteArray } from './conversion'
import { createKeyPair } from '@erebos/secp256k1'
import { pubKeyToAddress } from '@erebos/keccak256'
import { storageWrite, storageRead } from './storage'

describe('handshake integration test', () => {
    const alicePrivateKey = '0x00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff' as hexValue
    const bobPrivateKey = '0xffeeddccbbaa99887766554433221100ffeeddccbbaa99887766554433221100' as hexValue

    test('identity generation', () => {
        const aliceIdentity = generateIdentity(hexToByteArray(alicePrivateKey))
        expect(aliceIdentity.privateKey).toEqual(alicePrivateKey)
    })

    test('generated identity gives the same values as erebos crypto', () => {
        const aliceIdentity = generateIdentity(hexToByteArray(alicePrivateKey))
        const keyPair = createKeyPair(alicePrivateKey.slice(2))
        const address = pubKeyToAddress(keyPair.getPublic('array'))

        expect(address).toEqual(aliceIdentity.address)
    })

    test('test handshake', async () => {
        const mockStorage: {[key: string]: Uint8Array} = {}
        const mockHandshakeStorage = {
            read: async (address: hexValue, index: number) => mockStorage['' + address + '/' + index],
            write: async (identity: PrivateIdentity, index: number, data: Uint8Array) => {
                mockStorage['' + identity.address + '/' + index] = data
            },
        }
        const shareId = 'AAAAAAAAAA'
        const aliceIdentity = generateIdentity(hexToByteArray(alicePrivateKey))
        const bobIdentity = generateIdentity(hexToByteArray(bobPrivateKey))

        const aliceHandshakeReader = await sendHandshake(shareId, aliceIdentity.address, mockHandshakeStorage)
        const bobHandshakeReader = await receiveHandshake(shareId, bobIdentity.address, mockHandshakeStorage)
        const alicePeer = await aliceHandshakeReader.read()
        const bobPeer = await bobHandshakeReader.read()

        expect(alicePeer?.address).toEqual(bobIdentity.address)
        expect(bobPeer?.address).toEqual(aliceIdentity.address)
    })
})
