import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Info,
  Lightbulb,
  RotateCcw,
  Undo2,
  X,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";

import crossIcon from "../assets/brain games/at-icons_cross.png";
import circleIcon from "../assets/brain games/circle.png";

import sudokuBanner from "../assets/brain games/Frame 2147240213.png";
import slidingBanner from "../assets/brain games/Frame 2147240213 (1).png";
import ticTacBanner from "../assets/brain games/Frame 2147240213 (2).png";

import trophyIcon from "../assets/brain games/Group 1597885785 (1).png";
import lossResultIcon from "../assets/brain games/loss-result-icon.png";

import puzzleImage1 from "../assets/brain games/unsplash_y2h57D9FW8k (1).png";
import puzzleImage2 from "../assets/brain games/unsplash_lRwEprnochk.png";
import puzzleImage3 from "../assets/brain games/image 2 26.png";
import puzzleImage4 from "../assets/brain games/image 225.png";
import puzzleImage5 from "../assets/brain games/image 224.png";

import "../styles/brain-games.css";

const ROOT_ROUTE = "/app/brain-games";

const GAME_ROUTES = {
  sudoku: `${ROOT_ROUTE}/sudoku`,
  "tic-tac-toe": `${ROOT_ROUTE}/tic-tac-toe`,
  "sliding-puzzle": `${ROOT_ROUTE}/sliding-puzzle`,
};

/* ========================================================================== */
/* SHARED RESULT MODAL                                                        */
/* ========================================================================== */

const CONFETTI_COLORS = [
  "#FFC33D",
  "#FF6B5E",
  "#5ED6C3",
  "#5BC0EB",
  "#B88A32",
  "#8B7CF6",
];

function ConfettiLayer({ compact = false }) {
  const total = compact ? 18 : 42;

  return (
    <div
      className={compact ? "brain-confetti brain-confetti--popup" : "brain-confetti brain-confetti--screen"}
      aria-hidden="true"
    >
      {Array.from({ length: total }, (_, index) => {
        const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
        const left = (index * 23 + 7) % 100;
        const delay = -((index * 0.17) % 2.6);
        const duration = 2.7 + ((index * 0.13) % 1.8);
        const drift = ((index % 7) - 3) * 18;
        const rotation = (index * 47) % 360;

        return (
          <span
            key={index}
            className={`brain-confetti__piece brain-confetti__piece--${index % 3}`}
            style={{
              "--confetti-left": `${left}%`,
              "--confetti-delay": `${delay}s`,
              "--confetti-duration": `${duration}s`,
              "--confetti-drift": `${drift}px`,
              "--confetti-rotation": `${rotation}deg`,
              "--confetti-color": color,
            }}
          />
        );
      })}
    </div>
  );
}

function LossResultIllustration() {
  return (
    <img
      className="brain-result-illustration brain-result-illustration--loss"
      src={lossResultIcon}
      alt=""
      aria-hidden="true"
    />
  );
}

function ResultModal({
  open,
  mode = "complete",
  title,
  description,
  onBack,
  onPlayAgain,
  onClose,
}) {
  if (!open) return null;

  const celebrate = mode !== "lose";

  return (
    <div className="brain-result-backdrop" role="presentation">
      {celebrate ? <ConfettiLayer /> : null}

      <section
        className="brain-result-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="brain-result-title"
      >
        <button
          type="button"
          className="brain-result-close"
          onClick={onClose}
          aria-label="Close result"
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        {celebrate ? <ConfettiLayer compact /> : null}

        {mode === "lose" ? (
          <LossResultIllustration />
        ) : (
          <img
            className="brain-result-illustration"
            src={trophyIcon}
            alt=""
            aria-hidden="true"
          />
        )}

        <h2 id="brain-result-title">{title}</h2>
        <p>{description}</p>

        <div className="brain-result-actions">
          <button
            type="button"
            className="brain-button brain-button--outline"
            onClick={onBack}
          >
            Back to Brain Games
          </button>

          <button
            type="button"
            className="brain-button brain-button--primary"
            onClick={onPlayAgain}
          >
            Play Again
          </button>
        </div>
      </section>
    </div>
  );
}

/* ========================================================================== */
/* LANDING                                                                    */
/* ========================================================================== */

function GameCard({
  title,
  description,
  image,
  imageAlt,
  onPlay,
  featured = false,
}) {
  return (
    <article
      className={`brain-game-card${featured ? " brain-game-card--featured" : ""}`}
    >
      <div className="brain-game-card__media">
        <img src={image} alt={imageAlt || ""} />
      </div>

      <div className="brain-game-card__footer">
        <div className="brain-game-card__copy">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <button
          type="button"
          className="brain-button brain-button--primary brain-game-card__play"
          onClick={onPlay}
        >
          Play
        </button>
      </div>
    </article>
  );
}

function BrainGamesHome({ onOpenGame }) {
  return (
    <div className="brain-games-home">
      <header className="brain-page-heading">
        <h1>Give your mind a little workout</h1>
        <p>Pick a game and play at your own pace.</p>
      </header>

      <div className="brain-games-home__content">
        <GameCard
          featured
          title="Sudoku"
          description="Fill the grid using logic and sharpen your focus."
          image={sudokuBanner}
          imageAlt="Sudoku game preview"
          onPlay={() => onOpenGame("sudoku")}
        />

        <div className="brain-games-home__secondary-grid">
          <GameCard
            title="Sliding Puzzle"
            description="Slide the tiles to reveal the complete picture."
            image={slidingBanner}
            imageAlt="Sliding puzzle game preview"
            onPlay={() => onOpenGame("sliding-puzzle")}
          />

          <GameCard
            title="Tic-Tac-Toe"
            description="A familiar game with a strategic twist."
            image={ticTacBanner}
            imageAlt="Tic-Tac-Toe game preview"
            onPlay={() => onOpenGame("tic-tac-toe")}
          />
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* SUDOKU                                                                     */
/* ========================================================================== */

const SUDOKU_SOLUTION = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

const SUDOKU_ADVANCED = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

const MEDIUM_EXTRA_GIVENS = [
  [0, 2],
  [0, 5],
  [1, 1],
  [2, 4],
  [3, 3],
  [4, 4],
  [5, 5],
  [6, 3],
];

const BEGINNER_EXTRA_GIVENS = [
  ...MEDIUM_EXTRA_GIVENS,
  [0, 7],
  [1, 6],
  [2, 0],
  [2, 8],
  [3, 1],
  [3, 7],
  [4, 2],
  [4, 6],
  [5, 1],
  [5, 7],
  [6, 0],
  [6, 5],
  [7, 1],
  [7, 6],
  [8, 3],
  [8, 5],
];

function cloneGrid(grid) {
  return grid.map((row) => [...row]);
}

function shuffle(input) {
  const copy = [...input];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function getSudokuBasePuzzle(difficulty) {
  const puzzle = cloneGrid(SUDOKU_ADVANCED);
  const additions =
    difficulty === "BEGINNER"
      ? BEGINNER_EXTRA_GIVENS
      : difficulty === "MEDIUM"
        ? MEDIUM_EXTRA_GIVENS
        : [];

  additions.forEach(([row, column]) => {
    puzzle[row][column] = SUDOKU_SOLUTION[row][column];
  });

  return puzzle;
}

function createSudoku(difficulty) {
  const basePuzzle = getSudokuBasePuzzle(difficulty);
  const digitMap = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  const bandOrder = shuffle([0, 1, 2]);
  const rowOrder = bandOrder.flatMap((band) =>
    shuffle([0, 1, 2]).map((row) => band * 3 + row)
  );

  const stackOrder = shuffle([0, 1, 2]);
  const columnOrder = stackOrder.flatMap((stack) =>
    shuffle([0, 1, 2]).map((column) => stack * 3 + column)
  );

  function transform(grid) {
    return rowOrder.map((row) =>
      columnOrder.map((column) => {
        const value = grid[row][column];
        return value === 0 ? 0 : digitMap[value - 1];
      })
    );
  }

  return {
    puzzle: transform(basePuzzle),
    solution: transform(SUDOKU_SOLUTION),
  };
}

function isSudokuComplete(board, solution) {
  return board.every((row, rowIndex) =>
    row.every((value, columnIndex) => value === solution[rowIndex][columnIndex])
  );
}

function SudokuGame({ onBack }) {
  const [difficulty, setDifficulty] = useState("BEGINNER");
  const [game, setGame] = useState(() => createSudoku("BEGINNER"));
  const [board, setBoard] = useState(() => cloneGrid(game.puzzle));
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [complete, setComplete] = useState(false);

  function resetWithDifficulty(nextDifficulty = difficulty) {
    const nextGame = createSudoku(nextDifficulty);
    setGame(nextGame);
    setBoard(cloneGrid(nextGame.puzzle));
    setSelected(null);
    setHistory([]);
    setComplete(false);
  }

  function commitBoard(nextBoard) {
    setHistory((previous) => [...previous, cloneGrid(board)]);
    setBoard(nextBoard);

    if (isSudokuComplete(nextBoard, game.solution)) {
      window.setTimeout(() => setComplete(true), 180);
    }
  }

  function enterNumber(number) {
    if (!selected) return;

    const [row, column] = selected;
    if (game.puzzle[row][column] !== 0) return;

    const next = cloneGrid(board);
    next[row][column] = number;
    commitBoard(next);
  }

  function eraseSelected() {
    if (!selected) return;

    const [row, column] = selected;
    if (game.puzzle[row][column] !== 0 || board[row][column] === 0) return;

    const next = cloneGrid(board);
    next[row][column] = 0;
    commitBoard(next);
  }

  function handleUndo() {
    if (!history.length) return;

    const previous = history[history.length - 1];
    setBoard(cloneGrid(previous));
    setHistory((items) => items.slice(0, -1));
    setComplete(false);
  }

  function handleHint() {
    let target = selected;

    if (
      !target ||
      game.puzzle[target[0]][target[1]] !== 0 ||
      board[target[0]][target[1]] === game.solution[target[0]][target[1]]
    ) {
      target = null;

      for (let row = 0; row < 9 && !target; row += 1) {
        for (let column = 0; column < 9; column += 1) {
          if (board[row][column] !== game.solution[row][column]) {
            target = [row, column];
            break;
          }
        }
      }
    }

    if (!target) return;

    const [row, column] = target;
    const next = cloneGrid(board);
    next[row][column] = game.solution[row][column];
    setSelected(target);
    commitBoard(next);
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (!selected) return;

      if (/^[1-9]$/.test(event.key)) {
        enterNumber(Number(event.key));
      }

      if (event.key === "Backspace" || event.key === "Delete") {
        eraseSelected();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const selectedValue = selected ? board[selected[0]][selected[1]] : null;

  return (
    <div className="brain-game-page brain-sudoku-page">
      <GamePageHeading
        title="Sudoku"
        subtitle="Fill the grid using logic"
        onBack={onBack}
      />

      <section className="sudoku-shell">
        <div className="sudoku-board" role="grid" aria-label="Sudoku board">
          {board.map((row, rowIndex) =>
            row.map((value, columnIndex) => {
              const isGiven = game.puzzle[rowIndex][columnIndex] !== 0;
              const isSelected =
                selected?.[0] === rowIndex && selected?.[1] === columnIndex;
              const sameRowOrColumn =
                selected &&
                (selected[0] === rowIndex || selected[1] === columnIndex);
              const sameBox =
                selected &&
                Math.floor(selected[0] / 3) === Math.floor(rowIndex / 3) &&
                Math.floor(selected[1] / 3) === Math.floor(columnIndex / 3);
              const sameNumber =
                selectedValue && value !== 0 && selectedValue === value;
              const wrong =
                !isGiven && value !== 0 && value !== game.solution[rowIndex][columnIndex];

              return (
                <button
                  key={`${rowIndex}-${columnIndex}`}
                  type="button"
                  role="gridcell"
                  className={`sudoku-cell${isGiven ? " is-given" : ""}${
                    isSelected ? " is-selected" : ""
                  }${sameRowOrColumn || sameBox ? " is-related" : ""}${
                    sameNumber ? " is-same-number" : ""
                  }${wrong ? " is-wrong" : ""}`}
                  onClick={() => setSelected([rowIndex, columnIndex])}
                  aria-label={`Row ${rowIndex + 1}, column ${columnIndex + 1}${
                    value ? `, ${value}` : ", empty"
                  }`}
                >
                  {value || ""}
                </button>
              );
            })
          )}
        </div>

        <aside className="sudoku-controls">
          <div className="sudoku-controls__top">
            <div className="sudoku-difficulty" aria-label="Sudoku difficulty">
              {[
                ["BEGINNER", "Beginner"],
                ["MEDIUM", "Medium"],
                ["ADVANCED", "Advanced"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={difficulty === value ? "is-active" : ""}
                  onClick={() => {
                    setDifficulty(value);
                    resetWithDifficulty(value);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="brain-button brain-button--outline sudoku-new-button"
              onClick={() => resetWithDifficulty()}
            >
              New puzzle
            </button>
          </div>

          <div className="sudoku-utility-grid">
            <UtilityButton
              icon={<Undo2 size={22} strokeWidth={1.4} />}
              label="Undo"
              onClick={handleUndo}
              disabled={!history.length}
            />

            <UtilityButton
              icon={<Lightbulb size={22} strokeWidth={1.4} />}
              label="Hint"
              onClick={handleHint}
            />

            <UtilityButton
              icon={<RotateCcw size={23} strokeWidth={1.4} />}
              label="Restart"
              onClick={() => {
                setBoard(cloneGrid(game.puzzle));
                setSelected(null);
                setHistory([]);
                setComplete(false);
              }}
            />
          </div>

          <div className="sudoku-number-pad" aria-label="Number pad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
              <button
                key={number}
                type="button"
                onClick={() => enterNumber(number)}
              >
                {number}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="sudoku-clear-button"
            onClick={eraseSelected}
            disabled={!selected}
          >
            Clear selected cell
          </button>
        </aside>
      </section>

      <ResultModal
        open={complete}
        title="You Did It!"
        description="Great job! You solved the challenge with focus and careful thinking."
        onBack={onBack}
        onPlayAgain={() => resetWithDifficulty()}
        onClose={() => setComplete(false)}
      />
    </div>
  );
}

function UtilityButton({ icon, label, onClick, disabled = false }) {
  return (
    <button
      type="button"
      className="brain-utility-button"
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

/* ========================================================================== */
/* TIC TAC TOE                                                                */
/* ========================================================================== */

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function hasWinner(board, mark) {
  return WINNING_LINES.some((line) => line.every((index) => board[index] === mark));
}

function findTacticalMove(board, mark, excludedIndex = null) {
  const empty = board
    .map((value, index) =>
      !value && index !== excludedIndex ? index : null
    )
    .filter((value) => value !== null);

  for (const index of empty) {
    const test = [...board];
    test[index] = mark;
    if (hasWinner(test, mark)) return index;
  }

  return null;
}

function pickComputerMove(board, excludedIndex = null) {
  // Fairness rule:
  // when the computer's oldest move disappears, it cannot immediately
  // place the new O back into that exact same square on the same turn.
  // This matches the player, who also cannot use their disappearing
  // occupied square as the new move before it is removed.
  const winningMove = findTacticalMove(board, "O", excludedIndex);
  if (winningMove !== null) return winningMove;

  const blockingMove = findTacticalMove(board, "X", excludedIndex);
  if (blockingMove !== null) return blockingMove;

  if (!board[4] && 4 !== excludedIndex) return 4;

  const corners = shuffle([0, 2, 6, 8]).filter(
    (index) => !board[index] && index !== excludedIndex
  );
  if (corners.length) return corners[0];

  const remaining = shuffle(
    board
      .map((value, index) =>
        !value && index !== excludedIndex ? index : null
      )
      .filter((value) => value !== null)
  );

  return remaining[0] ?? null;
}

function TicTacToeGame({ onBack }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [playerMoves, setPlayerMoves] = useState([]);
  const [computerMoves, setComputerMoves] = useState([]);
  const [turn, setTurn] = useState("player");
  const [result, setResult] = useState(null);

  function restart() {
    setBoard(Array(9).fill(null));
    setPlayerMoves([]);
    setComputerMoves([]);
    setTurn("player");
    setResult(null);
  }

  function handlePlayerMove(index) {
    if (turn !== "player" || result || board[index]) return;

    const nextBoard = [...board];
    let nextMoves = [...playerMoves];

    if (nextMoves.length >= 3) {
      const disappearingMove = nextMoves[0];
      nextBoard[disappearingMove] = null;
      nextMoves = nextMoves.slice(1);
    }

    nextBoard[index] = "X";
    nextMoves.push(index);

    setBoard(nextBoard);
    setPlayerMoves(nextMoves);

    if (hasWinner(nextBoard, "X")) {
      setResult("win");
      return;
    }

    setTurn("computer");
  }

  useEffect(() => {
    if (turn !== "computer" || result) return undefined;

    const timer = window.setTimeout(() => {
      const nextBoard = [...board];
      let nextMoves = [...computerMoves];

      let disappearingMove = null;

      if (nextMoves.length >= 3) {
        disappearingMove = nextMoves[0];
        nextBoard[disappearingMove] = null;
        nextMoves = nextMoves.slice(1);
      }

      // Do not let the computer "skip" its turn by instantly
      // replaying the square that just disappeared.
      const move = pickComputerMove(nextBoard, disappearingMove);

      if (move === null) {
        setTurn("player");
        return;
      }

      nextBoard[move] = "O";
      nextMoves.push(move);

      setBoard(nextBoard);
      setComputerMoves(nextMoves);

      if (hasWinner(nextBoard, "O")) {
        setResult("lose");
        return;
      }

      setTurn("player");
    }, 480);

    return () => window.clearTimeout(timer);
  }, [turn, result, board, computerMoves]);

  return (
    <div className="brain-game-page brain-tictactoe-page">
      <GamePageHeading
        title="Tic-Tac-Toe"
        subtitle="A familiar game with a strategic twist."
        onBack={onBack}
      />

      <section className="tictactoe-shell">
        <div className="tictactoe-notice">
          <Info size={19} strokeWidth={1.5} />
          <span>
            This game comes with a special twist — after your first 3 moves,
            your very first move will disappear, so plan your strategy carefully.
          </span>
        </div>

        <div className="tictactoe-game-area">
          <div className="tictactoe-turn">
            <span>{turn === "player" ? "YOUR TURN" : "ANANDAM'S TURN"}</span>
            <img
              src={turn === "player" ? crossIcon : circleIcon}
              alt=""
              aria-hidden="true"
            />
          </div>

          <div className="tictactoe-board" role="grid" aria-label="Tic-Tac-Toe board">
            {board.map((value, index) => (
              <button
                key={index}
                type="button"
                role="gridcell"
                className="tictactoe-cell"
                onClick={() => handlePlayerMove(index)}
                disabled={Boolean(value) || turn !== "player" || Boolean(result)}
                aria-label={`Cell ${index + 1}${value ? `, ${value}` : ", empty"}`}
              >
                {value ? (
                  <img
                    src={value === "X" ? crossIcon : circleIcon}
                    alt={value}
                    className={value === "X" ? "is-cross" : "is-circle"}
                  />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </section>

      <ResultModal
        open={Boolean(result)}
        mode={result === "lose" ? "lose" : "win"}
        title={result === "lose" ? "You lost this round" : "You Won!"}
        description={
          result === "lose"
            ? "That was a close one. Try a new strategy and give it another go."
            : "Great job! You planned your moves perfectly and played a winning game."
        }
        onBack={onBack}
        onPlayAgain={restart}
        onClose={() => setResult(null)}
      />
    </div>
  );
}

/* ========================================================================== */
/* SLIDING PUZZLE                                                             */
/* ========================================================================== */

const PUZZLE_SIZE = 4;
const BLANK_TILE = PUZZLE_SIZE * PUZZLE_SIZE - 1;

const PUZZLE_IMAGES = [
  { id: "lighthouse", src: puzzleImage1, label: "Lighthouse" },
  { id: "boat", src: puzzleImage2, label: "Boat" },
  { id: "ship", src: puzzleImage3, label: "Ship" },
  { id: "coast", src: puzzleImage4, label: "Coast" },
  { id: "rope", src: puzzleImage5, label: "Rope" },
];

function getPuzzleNeighbours(blankIndex) {
  const row = Math.floor(blankIndex / PUZZLE_SIZE);
  const column = blankIndex % PUZZLE_SIZE;
  const neighbours = [];

  if (row > 0) neighbours.push(blankIndex - PUZZLE_SIZE);
  if (row < PUZZLE_SIZE - 1) neighbours.push(blankIndex + PUZZLE_SIZE);
  if (column > 0) neighbours.push(blankIndex - 1);
  if (column < PUZZLE_SIZE - 1) neighbours.push(blankIndex + 1);

  return neighbours;
}

function isPuzzleSolved(tiles) {
  return tiles.every((tile, index) => tile === index);
}

function shufflePuzzle() {
  const tiles = Array.from({ length: PUZZLE_SIZE * PUZZLE_SIZE }, (_, index) => index);
  let blankIndex = BLANK_TILE;
  let previousBlankIndex = -1;

  for (let move = 0; move < 160; move += 1) {
    let candidates = getPuzzleNeighbours(blankIndex).filter(
      (index) => index !== previousBlankIndex
    );

    if (!candidates.length) {
      candidates = getPuzzleNeighbours(blankIndex);
    }

    const tileIndex = candidates[Math.floor(Math.random() * candidates.length)];
    previousBlankIndex = blankIndex;

    [tiles[blankIndex], tiles[tileIndex]] = [tiles[tileIndex], tiles[blankIndex]];
    blankIndex = tileIndex;
  }

  if (isPuzzleSolved(tiles)) {
    const neighbour = getPuzzleNeighbours(blankIndex)[0];
    [tiles[blankIndex], tiles[neighbour]] = [tiles[neighbour], tiles[blankIndex]];
  }

  return tiles;
}

function SlidingPuzzleGame({ onBack }) {
  const [imageIndex, setImageIndex] = useState(0);
  const [tiles, setTiles] = useState(() => shufflePuzzle());
  const [startingTiles, setStartingTiles] = useState(() => [...tiles]);
  const [history, setHistory] = useState([]);
  const [complete, setComplete] = useState(false);

  const selectedImage = PUZZLE_IMAGES[imageIndex];

  function startNewPuzzle(nextImageIndex = imageIndex) {
    const shuffled = shufflePuzzle();
    setImageIndex(nextImageIndex);
    setTiles(shuffled);
    setStartingTiles([...shuffled]);
    setHistory([]);
    setComplete(false);
  }

  function moveTile(tilePosition) {
    if (complete) return;

    const blankPosition = tiles.indexOf(BLANK_TILE);
    if (!getPuzzleNeighbours(blankPosition).includes(tilePosition)) return;

    const next = [...tiles];
    [next[blankPosition], next[tilePosition]] = [next[tilePosition], next[blankPosition]];

    setHistory((items) => [...items, [...tiles]]);
    setTiles(next);

    if (isPuzzleSolved(next)) {
      window.setTimeout(() => setComplete(true), 280);
    }
  }

  function undo() {
    if (!history.length) return;

    const previous = history[history.length - 1];
    setTiles([...previous]);
    setHistory((items) => items.slice(0, -1));
    setComplete(false);
  }

  return (
    <div className="brain-game-page brain-sliding-page">
      <GamePageHeading
        title="Sliding Puzzle"
        subtitle="Slide the tiles to complete the image."
        onBack={onBack}
      />

      <section className="sliding-shell">
        <div className="sliding-board-card">
          <div className="sliding-board" aria-label="Sliding image puzzle">
            {tiles.map((tile, position) => {
              if (tile === BLANK_TILE) return null;

              const currentRow = Math.floor(position / PUZZLE_SIZE);
              const currentColumn = position % PUZZLE_SIZE;
              const sourceRow = Math.floor(tile / PUZZLE_SIZE);
              const sourceColumn = tile % PUZZLE_SIZE;

              return (
                <button
                  key={tile}
                  type="button"
                  className="sliding-tile"
                  onClick={() => moveTile(position)}
                  aria-label={`Move puzzle tile ${tile + 1}`}
                  style={{
                    transform: `translate(${currentColumn * 100}%, ${currentRow * 100}%)`,
                    backgroundImage: `url("${selectedImage.src}")`,
                    backgroundSize: `${PUZZLE_SIZE * 100}% ${PUZZLE_SIZE * 100}%`,
                    backgroundPosition: `${(sourceColumn / (PUZZLE_SIZE - 1)) * 100}% ${(sourceRow / (PUZZLE_SIZE - 1)) * 100}%`,
                  }}
                />
              );
            })}
          </div>
        </div>

        <aside className="sliding-controls">
          <button
            type="button"
            className="brain-button brain-button--outline sliding-new-button"
            onClick={() => startNewPuzzle()}
          >
            New puzzle
          </button>

          <div className="sliding-preview-card">
            <img src={selectedImage.src} alt={`${selectedImage.label} puzzle preview`} />
          </div>

          <div className="sliding-action-grid">
            <UtilityButton
              icon={<Undo2 size={22} strokeWidth={1.4} />}
              label="Undo"
              onClick={undo}
              disabled={!history.length}
            />

            <UtilityButton
              icon={<RotateCcw size={24} strokeWidth={1.4} />}
              label="Restart"
              onClick={() => {
                setTiles([...startingTiles]);
                setHistory([]);
                setComplete(false);
              }}
            />
          </div>

          <div className="sliding-image-picker">
            <span>Choose image</span>

            <div>
              {PUZZLE_IMAGES.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  className={imageIndex === index ? "is-active" : ""}
                  onClick={() => startNewPuzzle(index)}
                  aria-label={`Use ${image.label} image`}
                >
                  <img src={image.src} alt="" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <ResultModal
        open={complete}
        title="You Did It!"
        description="Great job! You solved the challenge with focus and careful thinking."
        onBack={onBack}
        onPlayAgain={() => startNewPuzzle()}
        onClose={() => setComplete(false)}
      />
    </div>
  );
}

/* ========================================================================== */
/* SHARED PAGE HEADING                                                        */
/* ========================================================================== */

function GamePageHeading({ title, subtitle, onBack }) {
  return (
    <header className="brain-game-heading">
      <button
        type="button"
        className="brain-back-button"
        onClick={onBack}
        aria-label="Back to Brain Games"
      >
        <ArrowLeft size={17} strokeWidth={1.6} />
        <span>Brain Games</span>
      </button>

      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  );
}

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

function BrainGamesPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentGame = useMemo(() => {
    if (location.pathname.endsWith("/sudoku")) return "sudoku";
    if (location.pathname.endsWith("/tic-tac-toe")) return "tic-tac-toe";
    if (location.pathname.endsWith("/sliding-puzzle")) return "sliding-puzzle";
    return null;
  }, [location.pathname]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  function openGame(gameId) {
    navigate(GAME_ROUTES[gameId]);
  }

  function backToGames() {
    navigate(ROOT_ROUTE);
  }

  return (
    <AppLayout>
      <div className="brain-games-page">
        {!currentGame ? <BrainGamesHome onOpenGame={openGame} /> : null}
        {currentGame === "sudoku" ? <SudokuGame onBack={backToGames} /> : null}
        {currentGame === "tic-tac-toe" ? (
          <TicTacToeGame onBack={backToGames} />
        ) : null}
        {currentGame === "sliding-puzzle" ? (
          <SlidingPuzzleGame onBack={backToGames} />
        ) : null}
      </div>
    </AppLayout>
  );
}

export default BrainGamesPage;
