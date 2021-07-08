function checkWhoWon(symbol) {
    return symbol === 'X' ? 1 : 2;
}

function checkIfSame(...list) {
    if (list.filter(x => x).length !== list.length) {
        return false;
    }

    return new Set(list).size === 1;
}

module.exports = (board) => {
    for (let i = 0; i <= 2; i++) {
        if (checkIfSame(board[i][0], board[i][1], board[i][2])) {
            return checkWhoWon(board[i][0]);
        }

        if (checkIfSame(board[0][i], board[1][i], board[2][i])) {
            return checkWhoWon(board[0][i]);
        }
    }

    if (checkIfSame(board[0][0], board[1][1], board[2][2])) {
        return checkWhoWon(board[0][0]);
    }

    if (checkIfSame(board[0][2], board[1][1], board[2][0])) {
        return checkWhoWon(board[0][2]);
    }

    return null;
}