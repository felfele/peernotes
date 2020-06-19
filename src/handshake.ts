import { hexValue } from "@erebos/hex"
import { hash } from "@erebos/keccak256"
import { decodeId, numbersToByteArray, byteArrayToNumbers, hexToNumbers, toHex, hexToByteArray } from "./conversion"
import { generateIdentity, ADDRESS_BYTES_LENGTH, PRIVATE_KEY_BYTES_LENGTH, PrivateIdentity } from "./crypto"
import { storageWrite, storageRead } from "./storage"
import { Peer } from "./document"

type PeerPositionReceiver = [0, 1]
type PeerPositionSender = [1, 0]
type PeerPosition = PeerPositionReceiver | PeerPositionSender
export interface HandshakeReader {
    read: () => Promise<Peer | undefined>
    shareId: string
}

export interface HandshakeStorage {
    read: (address: hexValue, index: number) => Promise<Uint8Array | undefined>
    write: (privateKey: PrivateIdentity, index: number, data: Uint8Array) => Promise<void>
}

const defaultHandshakeStorage = {
    read: storageRead,
    write: storageWrite,
}

export const receiveHandshake = async (shareId: string, address: hexValue, storage = defaultHandshakeStorage): Promise<HandshakeReader> => {
    const receiverPosition: PeerPositionReceiver = [0, 1]
    return handshakeWithPeer(shareId, address, receiverPosition, storage)
}

export const sendHandshake = async (shareId: string, address: hexValue, storage = defaultHandshakeStorage): Promise<HandshakeReader> => {
    const senderPosition: PeerPositionSender = [1, 0]
    return handshakeWithPeer(shareId, address, senderPosition, storage)
}

const waitMillisec = (ms: number): Promise<number> => {
    return new Promise<number>((resolve, reject) => {
        if (ms > 0) {
            setTimeout(() => resolve(ms), ms);
        }
    });
}

const waitUntil = async (untilTimestamp: number, now: number = Date.now()): Promise<number> => {
    const diff = untilTimestamp - now;
    if (diff > 0) {
        return waitMillisec(diff)
    }
    return 0
}

const handshakeWithPeer = async (shareId: string, address: hexValue, position: PeerPosition, storage: HandshakeStorage): Promise<HandshakeReader> => {
    const shareIdBytes = decodeId(shareId)
    const handshakeFeedPrivateKeyBytes = numbersToByteArray(hash(byteArrayToNumbers(shareIdBytes)), PRIVATE_KEY_BYTES_LENGTH)
    const handshakeFeedIdentity = generateIdentity(handshakeFeedPrivateKeyBytes)
    const addressBytes = hexToByteArray(address, ADDRESS_BYTES_LENGTH)
    console.log('handshakeWithPeer', {handshakeFeedIdentity, position})
    await storage.write(handshakeFeedIdentity, position[1], addressBytes)
    return {
        read: async () => {
            console.log('HandshakeReader', {shareId, address, position})
            const beforeReadTimestamp = Date.now()
            try {
                const peerAddressBytes = await storage.read(handshakeFeedIdentity.address, position[0])
                if (peerAddressBytes != null) {
                    const peer = {
                        address: toHex(peerAddressBytes),
                        addressBytes: peerAddressBytes,
                    }
                    return peer
                }
                return undefined
            } catch (e) {
                await waitUntil(beforeReadTimestamp + 1000)
                return undefined
            }
        },
        shareId,
    }
}

