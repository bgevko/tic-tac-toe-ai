class Game {
  static X = "X";
  static O = "O";
  static EMPTY = undefined;

  static turn = undefined;
  static board = undefined;
  static playing = false;
  static first_move = true;
  static game_over = false;

  static initial_state() {
    this.board = [
      [this.EMPTY, this.EMPTY, this.EMPTY],
      [this.EMPTY, this.EMPTY, this.EMPTY],
      [this.EMPTY, this.EMPTY, this.EMPTY],
    ];
    this.turn = this.X;
    this.playing = false;
    this.first_move = true;
    this.game_over = false;
    return this.board;
  }

  static new_move(x, y) {
    if (this.game_over) return;
    if (this.first_move) this.first_move = false;
    this.board[x][y] = this.turn;
  }
  static is_terminal(board) {
    if (this.winner(board)) return true;
    else if (this.tie(board)) return true;
    return false;
  }
  static utility(board) {
    let winner = this.winner(board);
    if (winner === this.X) return 1;
    else if (winner === this.O) return -1;
    else return 0;
  }
  static player_turn(board) {
    board = board === undefined ? this.board : board;
    let turn = this.x_count(board) === this.o_count(board) ? this.X : this.O;
    return turn;
  }

  static x_count(board) {
    let x_count = 0;
    board.forEach((row) => {
      x_count += row.filter((x) => x === this.X).length;
    });
    return x_count;
  }

  static o_count(board) {
    let o_count = 0;
    board.forEach((row) => {
      o_count += row.filter((o) => o === this.O).length;
    });
    return o_count;
  }
  static winner(board) {
    board = board === undefined ? this.board : board;
    let rows = [[null], [null], [null]];
    let columns = [[null], [null], [null]];
    let corners = [
      [board[0][0], board[1][1], board[2][2]],
      [board[2][0], board[1][1], board[0][2]],
    ];

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        rows[row][col] = board[row][col];
        columns[col][row] = board[row][col];
      }
    }

    let horizontal_win = loop_and_return_winner(rows);
    if (horizontal_win) return horizontal_win;
    let vertical_win = loop_and_return_winner(columns);
    if (vertical_win) return vertical_win;
    let diagonal_win = loop_and_return_winner(corners);
    if (diagonal_win) return diagonal_win;

    // No win criteria
    return false;

    function loop_and_return_winner(array) {
      for (let i = 0; i < array.length; i++) {
        if (array[i].filter((x) => x === "X").length === 3) return "X";
        if (array[i].filter((o) => o === "O").length === 3) return "O";
      }
      return false;
    }
  }

  static tie(board) {
    board = board === undefined ? this.board : board;
    for (let i = 0; i < 3; i++) {
      if (board[i].filter((tile) => tile === this.EMPTY).length > 0) {
        return false;
      }
    }
    return true;
  }

  static get_possible_actions(board) {
    board = board === undefined ? this.board : board;
    let possible_actions = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === this.EMPTY) {
          possible_actions.push([i, j]);
        }
      }
    }
    return possible_actions;
  }

  static result_for(board, move) {
    let board_copy = deep_copy(board);
    board_copy[move[0]][move[1]] = this.player_turn(board_copy);
    return board_copy;

    function deep_copy(array) {
      let copy = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          copy[i][j] = array[i][j];
        }
      }
      return copy;
    }
  }
  static minimax() {
    if (this.is_terminal()) return false;

    if (this.turn === this.X) {
      if (this.first_move) {
        // prettier-ignore
        let corners = [[0, 0], [0, 2], [2, 0], [2, 2]]
        let picker = Math.floor(Math.random() * 4);
        this.new_move(corners[picker][0], corners[picker][1]);
      } else {
        let best_move = this.best_max_move(this.board);
        this.new_move(best_move[1][0], best_move[1][1]);
      }
    } else {
      let best_move = this.best_min_move(this.board);
      this.new_move(best_move[1][0], best_move[1][1]);
    }
  }

  static best_max_move(board) {
    if (this.is_terminal(board)) {
      return [this.utility(board), null];
    }

    let value_action_pair = [-Infinity, null];
    let actions = this.get_possible_actions(board);

    actions.forEach((action) => {
      // prettier-ignore
      let action_value = this.best_min_move(this.result_for(board, action));
      if (action_value[0] > value_action_pair[0]) {
        value_action_pair[0] = action_value[0];
        value_action_pair[1] = action;
      }
    });

    return value_action_pair;
  }

  static best_min_move(board) {
    if (this.is_terminal(board)) {
      return [this.utility(board), null];
    }

    let value_action_pair = [Infinity, null];
    let actions = this.get_possible_actions(board);

    actions.forEach((action) => {
      // prettier-ignore
      let action_value = this.best_max_move(this.result_for(board, action));
      if (action_value[0] < value_action_pair[0]) {
        value_action_pair[0] = action_value[0];
        value_action_pair[1] = action;
      }
    });

    return value_action_pair;
  }
  static quit() {
    this.playing = false;
  }
}
