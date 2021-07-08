const Pusher = require("pusher")

module.exports = Pusher.forURL(process.env.PUSHER_URL);