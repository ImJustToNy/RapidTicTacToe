<template>
  <div id="app">
    <div v-if="loading">
      <h1>Loading...</h1>
    </div>

    <div v-else>
      <h1>Your player number is {{ playerNumber }}</h1>

      <table>
        <tr
            v-for="x in 3"
            :key="x">
          <td
              v-for="y in 3"
              :key="y"
              :class="{ clickable: isMyTurn && board[x-1][y-1] === null }"
              @click="placeFigure(x-1, y-1)">
            <div
                class="figure"
                v-html="board[x-1][y-1]"
            />
          </td>
        </tr>
      </table>

      <h1 v-if="isMyTurn && !gameFinished">
        Your turn!
      </h1>

      <button v-if="gameFinished" @click="createNewGame">
        Create new game.
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data: function () {
    return {
      loading: true,
      gameToken: null,
      playerNumber: null,
      startingPlayer: null,
      gameFinished: false,
      board: [
          [null, null, null],
          [null, null, null],
          [null, null, null],
      ]
    }
  },
  mounted() {
    const gameToken = window.location.hash.substring(1);
    const self = this;

    if (! gameToken) {
      this.createNewGame();
    } else {
      this.$http.get(`/game/${gameToken}`)
        .then(function ({ data }) {
          self.board = data.board

          self.finishLoading(gameToken, data.playerNumber, data.startingPlayer, data.finished)
        })
    }
  },
  methods: {
    createNewGame() {
      const self = this;

      this.$http.post('/game')
          .then(function ({ data }) {
            window.location.hash = data.token

            self.board = [
              [null, null, null],
              [null, null, null],
              [null, null, null],
            ];

            self.finishLoading(data.token, 1, data.startingPlayer, false)

            prompt('Send this link to other player:', `${window.location.origin}#${data.secondPlayerToken}`)
          })
    },
    finishLoading(gameToken, playerNumber, startingPlayer, finished) {
      this.$pusher
          .subscribe(gameToken.split('_')[0])
          .bind('figurePlaced', this.fieldChange)
          .bind('won', this.playerWon);

      this.gameToken = gameToken;
      this.playerNumber = playerNumber;
      this.startingPlayer = startingPlayer;
      this.loading = false;
      this.gameFinished = finished;
    },
    fieldChange(data) {
      let tempRow = this.board[data.x]

      tempRow[data.y] = data.figure

      this.$set(this.board, data.x, tempRow)

      if (this.board.flat().length === 9) {
        alert('Draw!');

        this.gameFinished = true;
      }
    },
    placeFigure(x, y) {
      if (! this.isMyTurn || this.board[x][y] !== null) {
        return
      }

      this.$http.post(`/game/${this.gameToken}/figure`, {
        x: x,
        y: y,
      });
    },
    playerWon(data) {
      alert(`Player ${data.player} won!`);

      this.gameFinished = true;
    }
  },
  computed: {
    isMyTurn: function() {
      const flatBoard = this.board.flat();
      const isSameAmountOfFigures =
          flatBoard.filter(figure => figure === 'X').length
          === flatBoard.filter(figure => figure === 'O').length;

      return isSameAmountOfFigures ^ (this.startingPlayer !== this.playerNumber);
    },
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 60px;
}

.clickable {
  cursor: pointer;
}

table {
  margin: 100px auto;
  border-collapse: collapse;
  table-layout: fixed;
}

table td {
  border: 1px solid black;
  width: 100px;
  height: 100px;
  font-size: 50px;
}

table tr:first-child td {
  border-top: 0;
}

table tr:last-child td {
  border-bottom: 0;
}

table tr td:first-child {
  border-left: 0;
}

table tr td:last-child {
  border-right: 0;
}
</style>
