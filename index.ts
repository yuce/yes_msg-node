// Copyright (c) 2016, Yuce Tekol <yucetekol@gmail.com>.
// All rights reserved.

// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:

// * Redistributions of source code must retain the above copyright
//   notice, this list of conditions and the following disclaimer.

// * Redistributions in binary form must reproduce the above copyright
//   notice, this list of conditions and the following disclaimer in the
//   documentation and/or other materials provided with the distribution.

// * The names of its contributors may not be used to endorse or promote
//   products derived from this software without specific prior written
//   permission.

// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

export interface Message {
    op: string;
    payload?: string;
}

export interface DecodeResult {
    messages: Message[];
    remaining: string;
}

export function encode(op: string, payload?: string): string {
    if (payload != null) {
        return [op, ";", payload.length, "\r\n", payload, "\r\n"].join('');
    }
    return [op, "\r\n"].join('');
}

export function decode(bin: string): DecodeResult {
    return decodeRec(bin, []);
}

function decodeRec(text: string, messages: Message[]): DecodeResult {
    let m = extractFlipFlop(text);
    if (m.msg === null) {
        return {messages: messages, remaining: text};
    }
    messages.push(m.msg); 
    return decodeRec(m.remaining, messages);
}

function extractFlipFlop(text: string) {
    const flipIndex = text.indexOf("\r\n");
    if (flipIndex <= 0) {
        return {msg: null, remaining: text};
    }
    const flip = parseFlip(text.substring(0, flipIndex));
    if (flip.payloadLen === null) {
        let remaining = text.substring(flipIndex + 2);
        return {msg: {op: flip.op, payload: null}, remaining: remaining};
    }
    const endOfPayload = flipIndex + 2 + flip.payloadLen + 2;
    if (text.length < endOfPayload) {
        return {msg: null, remaining: text};
    }
    const payload = text.substr(flipIndex + 2, flip.payloadLen);
    return {
        msg: {op: flip.op, payload: payload},
        remaining: text.substring(endOfPayload)
    }
}

function parseFlip(flip: string) {
    const parts = flip.split(";", 2);
    switch (parts.length) {
        case 1:
            return {op: parts[0], payloadLen: null};
        case 2:
            const payloadLen = parseInt(parts[1]);
            if (isNaN(payloadLen)) {
                throw "parse_error";
            }
            return {op: parts[0], payloadLen: payloadLen};
        default:
            throw "parse_error";
    }
}

