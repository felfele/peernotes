import base32Encode from 'base32-encode'
import base32Decode from 'base32-decode'
import { hexValue } from '@erebos/hex'

const base32Variant = 'Crockford'
export const encodeId = (buffer: ArrayBuffer) => base32Encode(buffer, base32Variant)
export const decodeId = (id: string) => {
    // console.log('decodeId', {id})
    return new Uint8Array(base32Decode(id, base32Variant))
}

export const numbersToByteArray = (numbers: number[], size?: number): Uint8Array => {
    if (size == null) {
        return new Uint8Array(numbers)
    }
    if (numbers.length >= size) {
        return numbersToByteArray(numbers.slice(0, size))
    }
    const bytes = new Uint8Array(size)
    bytes.set(numbers, size - numbers.length)
    return bytes
}

export const byteArrayToNumbers = (bytes: Uint8Array) => bytes.reduce<number[]>((prev, curr) => [...prev, curr], [])
export const hexPrefix = '0x' as hexValue
export const toHex = (byteArray: number[] | Uint8Array, withPrefix = true) =>
    (withPrefix ? hexPrefix : '') + Array.from(byteArray, byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('') as hexValue

export const hexToNumbers = (hex: hexValue): number[] => {
    const hexWithoutPrefix = hex.startsWith('0x') ? hex.slice(2) : hex
    const subStrings: string[] = []
    for (let i = 0; i < hexWithoutPrefix.length; i += 2) {
        subStrings.push(hexWithoutPrefix.substr(i, 2))
    }
    return subStrings.map(s => parseInt(s, 16))
}
export const hexToByteArray = (hex: hexValue, size?: number) => numbersToByteArray(hexToNumbers(hex), size)
export const stripHexPrefix = (hex: hexValue) => hex.startsWith(hexPrefix) ? hex.slice(hexPrefix.length) : hex
