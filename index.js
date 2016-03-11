function encode(op, payload) {
    if (payload != null) {
        return [op, ";", payload.length, "\r\n", payload, "\r\n"].join('');
    }
    return [op, "\r\n"].join('');
}
exports.encode = encode;
function decode(bin) {
    return decodeRec(bin, []);
}
exports.decode = decode;
function decodeRec(text, messages) {
    var m = extractFlipFlop(text);
    if (m.msg === null) {
        return { messages: messages, remaining: text };
    }
    messages.push(m.msg);
    return decodeRec(m.remaining, messages);
}
function extractFlipFlop(text) {
    var flipIndex = text.indexOf("\r\n");
    if (flipIndex <= 0) {
        return { msg: null, remaining: text };
    }
    var flip = parseFlip(text.substring(0, flipIndex));
    if (flip.payloadLen === null) {
        var remaining = text.substring(flipIndex + 2);
        return { msg: { op: flip.op, payload: null }, remaining: remaining };
    }
    var endOfPayload = flipIndex + 2 + flip.payloadLen + 2;
    if (text.length < endOfPayload) {
        return { msg: null, remaining: text };
    }
    var payload = text.substr(flipIndex + 2, flip.payloadLen);
    return {
        msg: { op: flip.op, payload: payload },
        remaining: text.substring(endOfPayload)
    };
}
function parseFlip(flip) {
    var parts = flip.split(";", 2);
    switch (parts.length) {
        case 1:
            return { op: parts[0], payloadLen: null };
        case 2:
            var payloadLen = parseInt(parts[1]);
            if (isNaN(payloadLen)) {
                throw "parse_error";
            }
            return { op: parts[0], payloadLen: payloadLen };
        default:
            throw "parse_error";
    }
}
