const emitter = require('tiny-emitter/instance')

const notification = {
    post: emitter.emit,
    listen: emitter.on,
}

module.exports = notification