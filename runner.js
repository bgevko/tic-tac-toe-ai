document.addEventListener("DOMContentLoaded", () => {
  let canvas = new Canvas("game", 600, 400);

  // Colors
  let dark_color = "#000000";
  let light_color = "#ffffff";

  let mediumFont = "28px Arial";
  let largeFont = "40px Arial";
  let moveFont = "60px Arial";

  let user = undefined;
  Game.initial_state();
  let ai_turn = false;

  //   Game loop

  window.requestAnimationFrame(gameLoop);
  async function gameLoop() {
    canvas.context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.context.fillStyle = dark_color;
    canvas.context.fillRect(0, 0, canvas.width, canvas.height);

    if (user === undefined) {
      // Draw title
      draw_text(
        largeFont,
        light_color,
        "Play Tic-Tac-Toe",
        canvas.width / 2,
        50
      );

      // Draw Buttons
      // prettier-ignore
      btns = [
          {id: "btn_X", x: canvas.width / 8, y: canvas.height / 2, w: canvas.width / 4, h: 50},
          {id: "btn_O", x: 5 * canvas.width / 8, y: canvas.height / 2, w: canvas.width / 4, h: 50}
        ]

      draw_button("Play as X", btns[0].x, btns[0].y, btns[0].w, btns[0].h);
      draw_button("Play as O", btns[1].x, btns[1].y, btns[1].w, btns[1].h);

      // check for click
      let pick_player = (e) => {
        if (Game.playing) return;
        let clicked_button = collides(btns, e.offsetX, e.offsetY);
        if (clicked_button) {
          user = clicked_button.id === "btn_X" ? Game.X : Game.O;
          Game.playing = true;
          canvas.element.removeEventListener("click", pick_player);
        }
      };
      if (!user) {
        canvas.element.addEventListener("click", pick_player);
      }
    }

    // else user is selected
    else {
      // Draw game board
      let tile_size = 80;
      let tile_origin = [
        canvas.width / 2 - 1.5 * tile_size,
        canvas.height / 2 - 1.5 * tile_size,
      ];
      let tiles = [];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          tiles.push({
            id: [i, j],
            content: Game.board[i][j],
            x: tile_origin[0] + j * tile_size,
            y: tile_origin[1] + i * tile_size,
            w: tile_size,
            h: tile_size,
          });

          draw_rect(
            tiles[i * 3 + j].content,
            tiles[i * 3 + j].x,
            tiles[i * 3 + j].y,
            tiles[i * 3 + j].w,
            tiles[i * 3 + j].h
          );
        }
      }

      let player = Game.player_turn();
      Game.turn = player;
      let game_over = Game.is_terminal();
      let title = get_title_from_game_state(game_over, player);
      draw_text(largeFont, light_color, title, canvas.width / 2, 50);

      // Check for AI move
      if (user !== player && !game_over) {
        if (ai_turn) {
          await sleep(500);
          Game.minimax();
          ai_turn = false;
        } else {
          ai_turn = true;
        }
      }
      // Check for player move
      let handleClickTile = async (e) => {
        await sleep(50);
        if (user !== player) return;
        if (ai_turn) return;
        if (!Game.playing) return;
        let clicked_tile = collides(tiles, e.offsetX, e.offsetY);
        if (user === player && clicked_tile && !game_over) {
          let x = clicked_tile.id[0];
          let y = clicked_tile.id[1];
          // prettier-ignore
          if (Game.board[x][y] !== Game.EMPTY) {
            return
          }
          log("this is still coming through");
          Game.new_move(clicked_tile.id[0], clicked_tile.id[1]);
        }
      };
      canvas.element.addEventListener("click", handleClickTile);

      if (game_over) {
        Game.playing = false;
        Game.game_over = true;
        canvas.element.removeEventListener("click", handleClickTile);
        btn = [
          {
            id: "btn_play_again",
            x: canvas.width / 3,
            y: canvas.height - 65,
            w: canvas.width / 3,
            h: 50,
          },
        ];
        // prettier-ignore
        let again_button = draw_button("Play Again", btn[0].x, btn[0].y, btn[0].w, btn[0].h);
        let handlePlayAgain = async (e) => {
          let clicked_button = collides(btn, e.offsetX, e.offsetY);
          if (clicked_button) {
            await sleep(200);
            Game.initial_state();
            user = undefined;
            ai_turn = false;
            canvas.element.removeEventListener("click", handlePlayAgain);
          }
        };
        canvas.element.addEventListener("click", handlePlayAgain);
      }
    }
    function draw_rect(content, x, y, width, height) {
      canvas.context.beginPath();
      canvas.context.lineWidth = "4";
      canvas.context.strokeStyle = light_color;
      canvas.context.rect(x, y, width, height);
      canvas.context.stroke();
      if (content) {
        canvas.context.font = moveFont;
        canvas.context.fillStyle = light_color;
        canvas.context.textAlign = "center";
        canvas.context.textBaseAlign = "middle";
        canvas.context.fillText(content, x + width / 2, y + 60);
      }
    }
    function get_title_from_game_state(game_over, player_turn) {
      if (game_over) {
        if (Game.tie()) {
          title = "Game over: Tie";
        } else {
          title = `Game over: ${Game.winner()} wins.`;
        }
      } else if (user === player_turn) {
        title = `Play as ${user}`;
      } else {
        title = `Computer thinking..`;
      }
      return title;
    }
    function draw_text(font, color, text, x, y) {
      canvas.context.font = font;
      canvas.context.fillStyle = color;
      canvas.context.textAlign = "center";
      canvas.context.fillText(text, x, y);
    }
    function draw_button(message, X, Y, width, height) {
      canvas.context.beginPath();
      canvas.context.fillStyle = light_color;
      canvas.context.rect(X, Y, width, height);
      canvas.context.fill();
      canvas.context.fillStyle = dark_color;
      canvas.context.font = mediumFont;
      canvas.context.textAlign = "center";
      canvas.context.textBaseAlign = "middle";
      // prettier-ignore
      canvas.context.fillText(message, X + width / 2, Y + 34.5);
    }

    window.requestAnimationFrame(gameLoop);
  }
});

class Canvas {
  constructor(id_name, width, height) {
    this.id_name = id_name;
    this.element = null;
    this.width = width;
    this.height = height;
    this.context = this.update();
  }
  update() {
    let canvas = document.getElementById(this.id_name);
    canvas.width = this.width;
    canvas.height = this.height;
    this.element = canvas;
    return canvas.getContext("2d");
  }
}

function log(message) {
  console.log(message);
}

function collides(rects, x, y) {
  var isCollision = false;
  for (var i = 0, len = rects.length; i < len; i++) {
    var left = rects[i].x,
      right = rects[i].x + rects[i].w;
    var top = rects[i].y,
      bottom = rects[i].y + rects[i].h;
    if (right >= x && left <= x && bottom >= y && top <= y) {
      isCollision = rects[i];
    }
  }
  return isCollision;
}

async function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
