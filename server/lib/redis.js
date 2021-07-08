const Redis = require("ioredis");

let instance

if (process.env.REDIS_URL) {
    instance = new Redis(process.env.REDIS_URL);
} else {
    instance = new Redis();
}

module.exports = instance