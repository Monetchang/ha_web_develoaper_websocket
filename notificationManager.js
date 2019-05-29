const emitter = require('tiny-emitter/instance')
const notificationType = require("./notificationType")

const notification = {
    post: emitter.emit,
    listen: emitter.on,
    type: notificationType,
}

module.exports = notification