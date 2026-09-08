  // Canvas setup
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreElement = document.getElementById('score');

  // Game constants
  const COLS = 10;
  const ROWS = 20;
  const BLOCK_SIZE = 30;
  const SCALE = 20;

  // Tetromino shapes (each rotation state)
  const SHAPES = [
    [[1, 1, 1, 1]],                          // I
    [[1, 1], [1, 1]],                        // O
    [[0, 1, 0], [1, 1, 1]],                  // T
    [[1, 0, 0], [1, 1, 1]],                  // L
    [[0, 0, 1], [1, 1, 1]],                  // J
    [[0, 1, 1], [1, 1, 0]],                  // S
    [[1, 1, 0], [0, 1, 1]]                   // Z
  ];

  const COLORS = [
    '#00f0f0', '#f0f000', '#a000f0',
    '#f0a000', '#0000f0', '#00f000', '#f00000'
  ];

  // Game state
  let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  let score = 0;
  let gameOver = false;

  // Current piece
  let piece = {
    x: 0,
    y: 0,
    shape: [],
    color: ''
  };

  // Spawn new piece
  function spawn() {
    const idx = Math.floor(Math.random() * SHAPES.length);
    piece.shape = SHAPES[idx];
    piece.color = COLORS[idx];
    piece.x = Math.floor(COLS / 2) - Math.floor(piece.shape[0].length / 2);
    piece.y = 0;

    if (collide()) {
      gameOver = true;
    }
  }

  // Collision detection
  function collide(offsetX = 0, offsetY = 0) {
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const newX = piece.x + col + offsetX;
          const newY = piece.y + row + offsetY;

          if (newX < 0 || newX >= COLS || newY >= ROWS ||
              (newY >= 0 && board[newY][newX])) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Lock piece to board
  function lock() {
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          if (piece.y + row >= 0) {
            board[piece.y + row][piece.x + col] = piece.color;
          }
        }
      }
    }
  }

  // Clear completed lines
  function clearLines() {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row].every(cell => cell)) {
        board.splice(row, 1);
        board.unshift(Array(COLS).fill(0));
        score += 100;
        row++;
      }
    }
    scoreElement.textContent = `Score: ${score}`;
  }

  // Rotate piece
  function rotate() {
    const rotated = piece.shape[0].map((_, i) =>
      piece.shape.map(row => row[i]).reverse()
    );
    const prev = piece.shape;
    piece.shape = rotated;

    if (collide()) {
      piece.shape = prev;
    }
  }

  // Move piece
  function move(dir) {
    if (!collide(dir, 0)) {
      piece.x += dir;
    }
  }

  // Drop piece
  function drop() {
    if (!collide(0, 1)) {
      piece.y++;
    } else {
      lock();
      clearLines();
      spawn();
    }
  }

  // Hard drop
  function hardDrop() {
    while (!collide(0, 1)) {
      piece.y++;
    }
    lock();
    clearLines();
    spawn();
  }

  // Draw everything
  function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw board
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (board[row][col]) {
          ctx.fillStyle = board[row][col];
          ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
        }
      }
    }

    // Draw current piece
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col] && piece.y + row >= 0) {
          ctx.fillStyle = piece.color;
          ctx.fillRect(
            (piece.x + col) * BLOCK_SIZE,
            (piece.y + row) * BLOCK_SIZE,
            BLOCK_SIZE - 1,
            BLOCK_SIZE - 1
          );
        }
      }
    }
  }

  // Game loop
  let lastTime = 0;
  let dropCounter = 0;
  let dropInterval = 1000;

  function update(time = 0) {
    if (gameOver) {
      ctx.fillStyle = 'white';
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
      return;
    }

    const delta = time - lastTime;
    lastTime = time;
    dropCounter += delta;

    if (dropCounter > dropInterval) {
      drop();
      dropCounter = 0;
    }

    draw();
    requestAnimationFrame(update);
  }

  // Controls
  document.addEventListener('keydown', (e) => {
    if (gameOver) return;

    switch (e.key) {
      case 'ArrowLeft':  move(-1); break;
      case 'ArrowRight': move(1); break;
      case 'ArrowDown':  drop(); break;
      case 'ArrowUp':    rotate(); break;
      case ' ':          hardDrop(); break;
    }
    draw();
  });

  // Start game
  spawn();
  update();