
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

