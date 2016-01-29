var stream = require('stream'),
    util = require('util');

var MockReadableStream = function () {
    stream.Readable.call(this)

    this.push(null);
};

util.inherits(MockReadableStream, stream.Readable)

MockReadableStream.prototype._read = function () {

}

var MockWritableStream = function() {
    stream.Writable.call(this)
}

util.inherits(MockWritableStream, stream.Writable)

MockWritableStream.prototype._write = function() {

}

exports.MockReadableStream = MockReadableStream
exports.MockWritableStream = MockWritableStream