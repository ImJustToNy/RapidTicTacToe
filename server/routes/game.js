const express = require('express');
const randomstring = require('randomstring');
const redis = require('../lib/redis');
const getAndValidateGame = require('../lib/getAndValidateGame');
const pusher = require('../lib/getPusher');
const createError = require('http-errors');
const checkIfWon = require('../lib/checkIfWon');

const router = express.Router();

// Create game
router.post('/', async (req, res, next) => {
    const gameId = randomstring.generate(8);
    const playerOneToken = randomstring.generate(8);
    const playerTwoToken = randomstring.generate(8);
    const startingPlayer = Math.random() > 0.5 ? 1 : 2;

    await redis.set(gameId, JSON.stringify({
        gameId: gameId,
        playerOneToken: playerOneToken,
        playerTwoToken: playerTwoToken,
        startingPlayer: startingPlayer,
        board: [
            [null, null, null],
            [null, null, null],
            [null, null, null],
        ],
        finished: false,
    }))

    res.json({
        'token': `${gameId}_${playerOneToken}`,
        'secondPlayerToken': `${gameId}_${playerTwoToken}`,
        'startingPlayer': startingPlayer,
    });
})

// Import game state
router.get('/:game_token', async (req, res, next) => {
    const game = await getAndValidateGame(req.params.game_token);

    if (! game) {
        return next(createError(404));
    }

    res.json({
        board: game.board,
        playerNumber: req.params.game_token.split('_')[1] === game.playerOneToken ? 1 : 2,
        startingPlayer: game.startingPlayer,
        finished: game.finished,
    });
});

// Place figure
router.post('/:game_token/figure', async (req, res, next) => {
    const game = await getAndValidateGame(req.params.game_token);

    const [game_id, player_token] = req.params.game_token.split('_');

    if (! game) {
        return next(createError(404));
    }

    const flatBoard = game.board.flat();
    const isSameAmountOfFigures =
        flatBoard.filter(figure => figure === 'X').length
        === flatBoard.filter(figure => figure === 'O').length;

    if (isSameAmountOfFigures ^ (game.startingPlayer === (player_token === game.playerOneToken ? 1 : 2))) {
        return next(createError(403));
    }

    let figure;
    if (game.playerOneToken === player_token) {
        figure = 'X';
    } else {
        figure = 'O';
    }

    game.board[req.body.x][req.body.y] = figure;

    await redis.set(game_id, JSON.stringify(game));

    await pusher.trigger(game_id, 'figurePlaced', {
        x: req.body.x,
        y: req.body.y,
        figure: figure,
    });

    const whoWon = checkIfWon(game.board);

    if (whoWon) {
        await pusher.trigger(game_id, 'won', {
           player: whoWon,
        });
    }

    res.send();
});

module.exports = router;