const redis = require('./redis');

module.exports = async (game_token) => {
    const [game_id, player_token] = game_token.split('_');

    const result = JSON.parse(await redis.get(game_id));

    if (result.playerOneToken !== player_token && result.playerTwoToken !== player_token) {
        return false;
    }

    return result;
}