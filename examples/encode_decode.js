
var yes_msg = require('../index.js');

var text = "path-symbols;53\r\n/tmp/foo\r\n{\"functions\":[{\"line\":15,\"name\":\"getfun\"}]}\r\nwatch!;50\r\n/home/yuce/Projects/whatels/apps/whatels/src/*.erl\r\nwatch";
var r = yes_msg.decode(text);
console.log(r);