import { useEffect, useMemo, useRef, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Info,
  Lightbulb,
  Pause,
  Play,
  Shuffle,
  Eraser,
  RotateCcw,
  Undo2,
  Redo2,
  X,
} from "lucide-react";



import AppLayout from "../components/layout/AppLayout";



import crossIcon from "../assets/brain games/at-icons_cross.png";

import circleIcon from "../assets/brain games/circle.png";



import sudokuBanner from "../assets/brain games/Frame 2147240213.png";

import slidingBanner from "../assets/brain games/Frame 2147240213 (1).png";

import ticTacBanner from "../assets/brain games/Frame 2147240213 (2).png";

import snakeBanner from "../assets/brain games/Frame 2147240213 (3).png";

import wordBanner from "../assets/brain games/Frame 2147240213 (4).png";



import trophyIcon from "../assets/brain games/Group 1597885785 (1).png";

import lossResultIcon from "../assets/brain games/loss-result-icon.png";



import puzzleImage1 from "../assets/brain games/unsplash_y2h57D9FW8k (1).png";

import puzzleImage2 from "../assets/brain games/unsplash_lRwEprnochk.png";

import puzzleImage3 from "../assets/brain games/image 2 26.png";

import puzzleImage4 from "../assets/brain games/image 225.png";

import puzzleImage5 from "../assets/brain games/image 224.png";

// ======================================================
// MANDALA COLORING
// ======================================================

import mandalaBanner from "../assets/brain games/mandala.png";

import mandalaWheel from "../assets/brain games/👑 main character needs a title 👑 1.png";
import mandalaRound from "../assets/brain games/👑 main character needs a title 👑 (1) 1.png";
import mandalaTurtle from "../assets/brain games/👑 main character needs a title 👑 (2) 1.png";
import mandalaFeather from "../assets/brain games/👑 main character needs a title 👑 (3) 1.png";
import mandalaMoon from "../assets/brain games/👑 main character needs a title 👑 (4) 1.png";
import mandalaFlower from "../assets/brain games/👑 main character needs a title 👑 (5) 1.png";
import mandalaAnchor from "../assets/brain games/👑 main character needs a title 👑 (6) 1.png";
import mandalaStar from "../assets/brain games/👑 main character needs a title 👑 2.png";


import "../styles/brain-games.css";



const ROOT_ROUTE = "/app/brain-games";


const GAME_ROUTES = {
  sudoku: `${ROOT_ROUTE}/sudoku`,
  "tic-tac-toe": `${ROOT_ROUTE}/tic-tac-toe`,
  "sliding-puzzle": `${ROOT_ROUTE}/sliding-puzzle`,
  "classic-snake": `${ROOT_ROUTE}/classic-snake`,
  "word-scramble": `${ROOT_ROUTE}/word-scramble`,

  mandala: `${ROOT_ROUTE}/mandala`,
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
  preview,
  onPlay,
  buttonLabel = "Start",
  size = "small",
}) {
  return (
    <article className={`brain-game-card brain-game-card--${size}`}>
      <div className="brain-game-card__media">
        {preview || <img src={image} alt={imageAlt || ""} />}
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
          {buttonLabel}
        </button>
      </div>
    </article>
  );
}

function BrainGamesHome({ onOpenGame }) {
  return (
    <div className="brain-games-home">
      <header className="brain-page-heading brain-page-heading--games-home">
        <h1>Give your mind a little workout</h1>
        <p>Pick a game and play at your own pace.</p>
      </header>

      <div className="brain-games-home__content">
        <div className="brain-games-home__top-grid">
          <GameCard
            size="large"
            title="Sudoku"
            description="Fill the grid using logic"
            image={sudokuBanner}
            imageAlt="Sudoku game preview"
            onPlay={() => onOpenGame("sudoku")}
          />

          <GameCard
            size="large"
            title="Classic Snake"
            description="Collect treats and avoid the walls and your tail"
            image={snakeBanner}
            imageAlt="Classic Snake game preview"
            onPlay={() => onOpenGame("classic-snake")}
          />

          <GameCard
            size="large"
            title="Mandala coloring"
            description="Choose a design, pick your colours and make it your own."
            image={mandalaBanner}
            imageAlt="Mandala coloring game preview"
            onPlay={() => onOpenGame("mandala")}
          />
        </div>

        <div className="brain-games-home__bottom-grid">
          <GameCard
            title="Sliding Puzzle"
            description="Slide the tiles to reveal the picture"
            image={slidingBanner}
            imageAlt="Sliding puzzle game preview"
            buttonLabel="Play Now"
            onPlay={() => onOpenGame("sliding-puzzle")}
          />

          <GameCard
            title="Word Scramble"
            description="Rearrange the letters and find hidden words"
            image={wordBanner}
            imageAlt="Word Scramble game preview"
            onPlay={() => onOpenGame("word-scramble")}
          />

          <GameCard
            title="Tic Tac Toe"
            description="A familiar game with a strategic twist."
            image={ticTacBanner}
            imageAlt="Tic Tac Toe game preview"
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

                  className={`sudoku-cell${isGiven ? " is-given" : ""}${isSelected ? " is-selected" : ""

                    }${sameRowOrColumn || sameBox ? " is-related" : ""}${sameNumber ? " is-same-number" : ""

                    }${wrong ? " is-wrong" : ""}`}

                  onClick={() => setSelected([rowIndex, columnIndex])}

                  aria-label={`Row ${rowIndex + 1}, column ${columnIndex + 1}${value ? `, ${value}` : ", empty"

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
/* CLASSIC SNAKE                                                              */
/* ========================================================================== */

const SNAKE_COLS = 48;
const SNAKE_ROWS = 18;

const SNAKE_SPEEDS = {
  SLOW: 300,
  MEDIUM: 190,
  FAST: 120,
};

const SNAKE_COLOR = "#6248ea";
const SNAKE_DARK = "#251d48";

function makeInitialSnake() {
  return [
    { x: 14, y: 9 },
    { x: 13, y: 9 },
    { x: 12, y: 9 },
    { x: 11, y: 9 },
    { x: 10, y: 9 },
  ];
}

function makeSnakeApple(snake) {
  const occupied = new Set(snake.map((part) => `${part.x}-${part.y}`));
  const free = [];

  for (let y = 0; y < SNAKE_ROWS; y += 1) {
    for (let x = 0; x < SNAKE_COLS; x += 1) {
      if (!occupied.has(`${x}-${y}`)) free.push({ x, y });
    }
  }

  return free[Math.floor(Math.random() * free.length)] || { x: 6, y: 5 };
}

function snakeDirectionAngle(direction) {
  if (direction.x > 0) return 0;
  if (direction.y > 0) return Math.PI / 2;
  if (direction.x < 0) return Math.PI;
  return -Math.PI / 2;
}

function roundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawSnakeFace(ctx, size, direction, mode) {
  const angle = snakeDirectionAngle(direction);

  ctx.save();
  ctx.rotate(angle);

  const frontX = size * 0.2;
  const eyeX = frontX;
  const eyeY = size * 0.17;
  const eyeRadius = size * 0.13;

  if (mode === "crashed") {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = Math.max(1.5, size * 0.055);
    ctx.lineCap = "round";

    [-eyeY, eyeY].forEach((y) => {
      const r = eyeRadius * 0.65;
      ctx.beginPath();
      ctx.moveTo(eyeX - r, y - r);
      ctx.lineTo(eyeX + r, y + r);
      ctx.moveTo(eyeX + r, y - r);
      ctx.lineTo(eyeX - r, y + r);
      ctx.stroke();
    });

    ctx.strokeStyle = SNAKE_DARK;
    ctx.lineWidth = Math.max(1.5, size * 0.045);
    ctx.beginPath();
    ctx.arc(size * 0.27, 0, size * 0.13, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    ctx.restore();
    return;
  }

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(eyeX, -eyeY, eyeRadius, 0, Math.PI * 2);
  ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
  ctx.fill();

  const pupilRadius = eyeRadius * (mode === "hungry" ? 0.48 : 0.38);
  const pupilShift = size * 0.035;

  ctx.fillStyle = "#16172b";
  ctx.beginPath();
  ctx.arc(eyeX + pupilShift, -eyeY, pupilRadius, 0, Math.PI * 2);
  ctx.arc(eyeX + pupilShift, eyeY, pupilRadius, 0, Math.PI * 2);
  ctx.fill();

  if (mode === "hungry") {
    ctx.fillStyle = SNAKE_DARK;
    ctx.beginPath();
    ctx.arc(size * 0.36, 0, size * 0.095, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ef4d6c";
    roundedRectPath(
      ctx,
      size * 0.41,
      -size * 0.035,
      size * 0.16,
      size * 0.07,
      size * 0.025
    );
    ctx.fill();
  } else {
    ctx.strokeStyle = SNAKE_DARK;
    ctx.lineWidth = Math.max(1, size * 0.04);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(size * 0.31, -size * 0.04);
    ctx.lineTo(size * 0.39, -size * 0.04);
    ctx.stroke();
  }

  ctx.restore();
}

function drawSnakeCanvas({
  canvas,
  snake,
  previousSnake,
  progress,
  direction,
  apple,
  crashed,
}) {
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const targetWidth = Math.round(rect.width * dpr);
  const targetHeight = Math.round(rect.height * dpr);

  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);

  const cellWidth = rect.width / SNAKE_COLS;
  const cellHeight = rect.height / SNAKE_ROWS;
  const cell = Math.min(cellWidth, cellHeight);

  const points = snake.map((part, index) => {
    const previous =
      previousSnake[index] ||
      previousSnake[previousSnake.length - 1] ||
      part;

    const x = previous.x + (part.x - previous.x) * progress;
    const y = previous.y + (part.y - previous.y) * progress;

    return {
      x: (x + 0.5) * cellWidth,
      y: (y + 0.5) * cellHeight,
    };
  });

  if (!points.length) return;

  /*
   * Old-phone style: small pixel blocks, but with a thin continuous backbone
   * behind them. The backbone prevents any visual gaps when the snake turns,
   * while the blocks keep the classic pixel-snake feel.
   */
  const pixelSize = cell * 0.56;
  const connectorWidth = cell * 0.42;

  if (points.length > 1) {
    ctx.save();
    ctx.strokeStyle = SNAKE_COLOR;
    ctx.lineWidth = connectorWidth;
    ctx.lineCap = "square";
    ctx.lineJoin = "round";
    ctx.beginPath();

    const tail = points[points.length - 1];
    ctx.moveTo(tail.x, tail.y);

    for (let index = points.length - 2; index >= 0; index -= 1) {
      ctx.lineTo(points[index].x, points[index].y);
    }

    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = SNAKE_COLOR;

  for (let index = points.length - 1; index >= 1; index -= 1) {
    const point = points[index];
    roundedRectPath(
      ctx,
      point.x - pixelSize / 2,
      point.y - pixelSize / 2,
      pixelSize,
      pixelSize,
      Math.max(2, pixelSize * 0.16)
    );
    ctx.fill();
  }

  const head = points[0];
  const headSize = cell * 0.76;

  ctx.save();
  ctx.translate(head.x, head.y);
  ctx.fillStyle = SNAKE_COLOR;
  roundedRectPath(
    ctx,
    -headSize / 2,
    -headSize / 2,
    headSize,
    headSize,
    headSize * 0.34
  );
  ctx.fill();

  const headGrid = snake[0];
  const distanceToApple =
    Math.abs(headGrid.x - apple.x) + Math.abs(headGrid.y - apple.y);
  const mode = crashed ? "crashed" : distanceToApple <= 2 ? "hungry" : "normal";

  drawSnakeFace(ctx, headSize, direction, mode);
  ctx.restore();
}

function ClassicSnakeGame({ onBack }) {
  const initialSnake = useMemo(() => makeInitialSnake(), []);
  const canvasRef = useRef(null);

  const snakeRef = useRef(initialSnake);
  const previousSnakeRef = useRef(initialSnake);
  const appleRef = useRef(makeSnakeApple(initialSnake));

  const directionRef = useRef({ x: 1, y: 0 });
  const queuedDirectionRef = useRef({ x: 1, y: 0 });

  const speedRef = useRef("SLOW");
  const pausedRef = useRef(false);
  const gameOverRef = useRef(false);
  const lastStepAtRef = useRef(performance.now());

  const [apple, setApple] = useState(appleRef.current);
  const [speed, setSpeed] = useState("SLOW");
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  function restartSnake() {
    const fresh = makeInitialSnake();
    const nextApple = makeSnakeApple(fresh);

    snakeRef.current = fresh;
    previousSnakeRef.current = fresh;
    appleRef.current = nextApple;

    directionRef.current = { x: 1, y: 0 };
    queuedDirectionRef.current = { x: 1, y: 0 };

    pausedRef.current = false;
    gameOverRef.current = false;
    lastStepAtRef.current = performance.now();

    setApple(nextApple);
    setPaused(false);
    setScore(0);
    setGameOver(false);
  }

  function changeDirection(nextDirection) {
    if (gameOverRef.current) return;

    const current = directionRef.current;
    const reversing =
      current.x + nextDirection.x === 0 &&
      current.y + nextDirection.y === 0;

    if (reversing) return;

    queuedDirectionRef.current = nextDirection;
  }

  function togglePause() {
    if (gameOverRef.current) return;

    setPaused((value) => {
      const next = !value;
      pausedRef.current = next;

      previousSnakeRef.current = snakeRef.current.map((part) => ({ ...part }));
      lastStepAtRef.current = performance.now();

      return next;
    });
  }

  function changeSpeed(nextSpeed) {
    speedRef.current = nextSpeed;
    setSpeed(nextSpeed);

    previousSnakeRef.current = snakeRef.current.map((part) => ({ ...part }));
    lastStepAtRef.current = performance.now();
  }

  useEffect(() => {
    function onKeyDown(event) {
      const key = event.key.toLowerCase();

      if (
        [
          "arrowup",
          "arrowdown",
          "arrowleft",
          "arrowright",
          "w",
          "a",
          "s",
          "d",
          " ",
        ].includes(key)
      ) {
        event.preventDefault();
      }

      if (key === " " || key === "spacebar") {
        togglePause();
        return;
      }

      if (key === "arrowup" || key === "w") changeDirection({ x: 0, y: -1 });
      if (key === "arrowdown" || key === "s") changeDirection({ x: 0, y: 1 });
      if (key === "arrowleft" || key === "a") changeDirection({ x: -1, y: 0 });
      if (key === "arrowright" || key === "d") changeDirection({ x: 1, y: 0 });
    }

    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    let animationFrame = 0;

    function animate(now) {
      const stepMs = SNAKE_SPEEDS[speedRef.current];

      if (!pausedRef.current && !gameOverRef.current) {
        /*
         * The game logic and the drawing now run from the same RAF clock.
         * This is the important part: there is no setInterval/CSS-transition
         * mismatch anymore, so every grid step flows directly into the next.
         */
        while (now - lastStepAtRef.current >= stepMs) {
          const currentSnake = snakeRef.current;
          const nextDirection = queuedDirectionRef.current;
          directionRef.current = nextDirection;

          const currentHead = currentSnake[0];
          const nextHead = {
            x: currentHead.x + nextDirection.x,
            y: currentHead.y + nextDirection.y,
          };

          const hitWall =
            nextHead.x < 0 ||
            nextHead.x >= SNAKE_COLS ||
            nextHead.y < 0 ||
            nextHead.y >= SNAKE_ROWS;

          const ateApple =
            nextHead.x === appleRef.current.x &&
            nextHead.y === appleRef.current.y;

          const bodyToCheck = ateApple
            ? currentSnake
            : currentSnake.slice(0, -1);

          const hitSelf = bodyToCheck.some(
            (part) => part.x === nextHead.x && part.y === nextHead.y
          );

          if (hitWall || hitSelf) {
            gameOverRef.current = true;
            setGameOver(true);
            break;
          }

          previousSnakeRef.current = currentSnake.map((part) => ({ ...part }));

          const nextSnake = [nextHead, ...currentSnake.map((part) => ({ ...part }))];

          if (ateApple) {
            const nextApple = makeSnakeApple(nextSnake);
            appleRef.current = nextApple;
            setApple(nextApple);
            setScore((value) => value + 1);
          } else {
            nextSnake.pop();
          }

          snakeRef.current = nextSnake;
          lastStepAtRef.current += stepMs;
        }
      }

      const currentSnake = snakeRef.current;
      const previousSnake = previousSnakeRef.current;

      const progress =
        pausedRef.current || gameOverRef.current
          ? 1
          : Math.max(
            0,
            Math.min(
              (now - lastStepAtRef.current) / SNAKE_SPEEDS[speedRef.current],
              1
            )
          );

      drawSnakeCanvas({
        canvas: canvasRef.current,
        snake: currentSnake,
        previousSnake,
        progress,
        direction: directionRef.current,
        apple: appleRef.current,
        crashed: gameOverRef.current,
      });

      animationFrame = window.requestAnimationFrame(animate);
    }

    animationFrame = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div className="brain-game-page brain-snake-page">
      <div className="snake-heading-row">
        <GamePageHeading
          title="Classic Snake"
          subtitle="Collect treats. Avoid the walls and your tail."
          onBack={onBack}
        />

        <div className="snake-score" aria-label={`${score} treats collected`}>
          <span aria-hidden="true">🍎</span>
          <strong>{score}</strong>
        </div>
      </div>

      <div className="snake-toolbar">
        <span>Speed</span>
        <div className="snake-speed-control" aria-label="Snake speed">
          {["SLOW", "MEDIUM", "FAST"].map((value) => (
            <button
              key={value}
              type="button"
              className={speed === value ? "is-active" : ""}
              onClick={() => changeSpeed(value)}
            >
              {value.charAt(0) + value.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <section className="snake-shell">
        <div className="snake-board" role="application" aria-label="Classic Snake game board">
          <canvas ref={canvasRef} className="snake-canvas" aria-hidden="true" />

          <div
            className="snake-apple"
            style={{
              "--tx": `${apple.x * 100}%`,
              "--ty": `${apple.y * 100}%`,
            }}
            aria-hidden="true"
          >
            🍎
          </div>
        </div>
      </section>

      <div className="snake-footer-controls">
        <button
          type="button"
          className="brain-button brain-button--outline snake-pause-button"
          onClick={togglePause}
          disabled={gameOver}
        >
          {paused ? <Play size={18} /> : <Pause size={18} />}
          {paused ? "Resume" : "Pause"}
        </button>

        <p>Use Arrow keys or WASD to move · Space to pause</p>
      </div>

      <ResultModal
        open={gameOver}
        mode="lose"
        title="Nice run!"
        description={`You collected ${score} ${score === 1 ? "treat" : "treats"}.`}
        onBack={onBack}
        onPlayAgain={restartSnake}
        onClose={restartSnake}
      />
    </div>
  );
}

/* ========================================================================== */
/* WORD SCRAMBLE                                                              */
/* ========================================================================== */

const WORD_GAMES = [
  {
    letters: ["C", "A", "R", "T", "O", "P", "R"],
    words: ["CAR", "ART", "TOP", "CART", "PORT", "TRAP", "CROP"],
  },
  {
    letters: ["S", "E", "A", "R", "C", "H", "T"],
    words: ["SEA", "TEA", "CAT", "RATE", "STAR", "CHAT", "SEARCH"],
  },
  {
    letters: ["M", "A", "R", "I", "N", "E", "S"],
    words: ["SEA", "MINE", "MAIN", "RAIN", "SIRE", "MARINE", "MARINES"],
  },
  {
    letters: ["B", "O", "A", "R", "D", "S", "T"],
    words: ["BOAT", "ROAD", "STAR", "SORT", "BOARD", "BOAST", "ROAST"],
  },
  {
    letters: ["S", "A", "I", "L", "O", "R", "T"],
    words: ["AIR", "OAR", "TAIL", "SALT", "STAR", "SAIL", "SAILOR"],
  },
];

function shuffleLetters(letters) {
  return shuffle(letters.map((letter, index) => ({ id: `${letter}-${index}`, letter })));
}

function getHintTileIds(word, tiles) {
  const used = new Set();
  const ids = [];

  for (const char of word) {
    const tile = tiles.find((item) => item.letter === char && !used.has(item.id));
    if (!tile) return [];
    used.add(tile.id);
    ids.push(tile.id);
  }

  return ids;
}

function WordScrambleGame({ onBack }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const round = WORD_GAMES[roundIndex];
  const [tiles, setTiles] = useState(() => shuffleLetters(WORD_GAMES[0].letters));
  const [selectedIds, setSelectedIds] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [hintIds, setHintIds] = useState([]);
  const [complete, setComplete] = useState(false);
  const hintTimerRef = useRef(null);

  const selectedTiles = selectedIds
    .map((id) => tiles.find((tile) => tile.id === id))
    .filter(Boolean);
  const currentWord = selectedTiles.map((tile) => tile.letter).join("");

  function loadRound(index) {
    const nextRound = WORD_GAMES[index];
    setRoundIndex(index);
    setTiles(shuffleLetters(nextRound.letters));
    setSelectedIds([]);
    setFoundWords([]);
    setFeedback(null);
    setHintsLeft(3);
    setHintIds([]);
    setComplete(false);
  }

  function newWordGame() {
    const next = (roundIndex + 1) % WORD_GAMES.length;
    loadRound(next);
  }

  function chooseTile(id) {
    if (selectedIds.includes(id)) return;
    setSelectedIds((items) => [...items, id]);
    setFeedback(null);
  }

  function removeLastLetter() {
    setSelectedIds((items) => items.slice(0, -1));
    setFeedback(null);
  }

  function clearWord() {
    setSelectedIds([]);
    setFeedback(null);
  }

  function scrambleTiles() {
    setTiles((items) => shuffle(items));
    setSelectedIds([]);
    setHintIds([]);
    setFeedback(null);
  }

  function submitWord() {
    if (!currentWord) return;

    if (!round.words.includes(currentWord)) {
      setFeedback({ type: "error", text: "Wrong word. Try again" });
      window.setTimeout(() => {
        setSelectedIds([]);
        setFeedback(null);
      }, 1800);
      return;
    }

    if (foundWords.includes(currentWord)) {
      setFeedback({ type: "error", text: "You’ve already found this word" });
      window.setTimeout(() => {
        setSelectedIds([]);
        setFeedback(null);
      }, 1800);
      return;
    }

    const nextFound = [...foundWords, currentWord];
    setFoundWords(nextFound);
    setSelectedIds([]);
    setFeedback({ type: "success", text: "Word found!" });

    window.setTimeout(() => setFeedback(null), 1200);

    if (nextFound.length === round.words.length) {
      window.setTimeout(() => setComplete(true), 220);
    }
  }

  function useWordHint() {
    if (hintsLeft <= 0) return;

    const target = round.words.find((word) => !foundWords.includes(word));
    if (!target) return;

    if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current);

    const ids = getHintTileIds(target, tiles);
    setHintIds(ids);
    setHintsLeft((value) => Math.max(0, value - 1));
    setFeedback({
      type: "hint",
      text: "Hint: the highlighted letters can make one of the remaining words.",
    });

    hintTimerRef.current = window.setTimeout(() => {
      setHintIds([]);
      setFeedback(null);
    }, 2600);
  }

  useEffect(() => {
    return () => {
      if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current);
    };
  }, []);

  return (
    <div className="brain-game-page brain-word-page">
      <div className="word-heading-row">
        <GamePageHeading
          title="Word Scramble"
          subtitle="Find the words hidden in the letters"
          onBack={onBack}
        />

        <button
          type="button"
          className="brain-button brain-button--outline word-new-button"
          onClick={newWordGame}
        >
          New Game
        </button>
      </div>

      <section className="word-shell">
        <div className="word-target-board" aria-label="Words to find">
          {round.words.map((word) => {
            const found = foundWords.includes(word);
            return (
              <div key={word} className="word-target-row" aria-label={found ? `${word} found` : `${word.length} letter word`}>
                {word.split("").map((letter, index) => (
                  <span key={`${word}-${index}`} className={found ? "is-found" : ""}>
                    {found ? letter : ""}
                  </span>
                ))}
              </div>
            );
          })}
        </div>

        <div className="word-play-panel">
          <div className="word-feedback-slot" aria-live="polite">
            {feedback ? (
              <div className={`word-feedback word-feedback--${feedback.type}`}>
                {feedback.type === "hint" ? <Lightbulb size={16} /> : null}
                <span>{feedback.text}</span>
              </div>
            ) : null}
          </div>

          <div className="word-input-row">
            <div className="word-input-display" aria-label="Current word">
              {currentWord || <span>Choose letters below</span>}
            </div>
            <button
              type="button"
              className="brain-button brain-button--outline word-enter-button"
              onClick={submitWord}
              disabled={!currentWord}
            >
              Enter
            </button>
          </div>

          <div className="word-letter-bank" aria-label="Available letters">
            {tiles.map((tile) => {
              const selected = selectedIds.includes(tile.id);
              const hinted = hintIds.includes(tile.id);
              return (
                <button
                  key={tile.id}
                  type="button"
                  className={`${selected ? "is-selected" : ""}${hinted ? " is-hinted" : ""}`}
                  onClick={() => chooseTile(tile.id)}
                  disabled={selected}
                >
                  {tile.letter}
                </button>
              );
            })}
          </div>

          <div className="word-action-row">
            <button type="button" className="word-tool-button" onClick={scrambleTiles}>
              <Shuffle size={19} />
              Scramble
            </button>
            <button
              type="button"
              className="word-tool-button"
              onClick={removeLastLetter}
              disabled={!selectedIds.length}
            >
              <Undo2 size={19} />
              Back
            </button>
            <button
              type="button"
              className="word-tool-button"
              onClick={clearWord}
              disabled={!selectedIds.length}
            >
              <Eraser size={19} />
              Remove
            </button>
            <button
              type="button"
              className="word-tool-button word-hint-button"
              onClick={useWordHint}
              disabled={hintsLeft <= 0 || foundWords.length === round.words.length}
            >
              <Lightbulb size={19} />
              Hint ({hintsLeft}/3)
            </button>
          </div>
        </div>
      </section>

      <ResultModal
        open={complete}
        title="You Did It!"
        description="Great job! You found every hidden word."
        onBack={onBack}
        onPlayAgain={() => loadRound(roundIndex)}
        onClose={() => setComplete(false)}
      />
    </div>
  );
}


/* ========================================================================== */

/* SHARED PAGE HEADING                                                        */

/* ========================================================================== */

/* ========================================================================== */
/* MANDALA COLORING                                                           */
/* ========================================================================== */

const MANDALA_DESIGNS = [
  {
    id: "wheel",
    src: mandalaWheel,
    alt: "Ship wheel mandala",
  },
  {
    id: "round",
    src: mandalaRound,
    alt: "Circular floral mandala",
  },
  {
    id: "turtle",
    src: mandalaTurtle,
    alt: "Turtle mandala",
  },
  {
    id: "feather",
    src: mandalaFeather,
    alt: "Feather mandala",
  },
  {
    id: "star",
    src: mandalaStar,
    alt: "Geometric star mandala",
  },
  {
    id: "moon",
    src: mandalaMoon,
    alt: "Moon mandala",
  },
  {
    id: "flower",
    src: mandalaFlower,
    alt: "Flower mandala",
  },
  {
    id: "anchor",
    src: mandalaAnchor,
    alt: "Anchor mandala",
  },
];


const MANDALA_COLORS = [
  "#C7002A",
  "#FF2436",
  "#FF6765",
  "#FF7A00",
  "#FFAA00",
  "#FFCC00",

  "#FFE600",
  "#80E51F",
  "#15A83A",
  "#086A3E",
  "#82E5C1",
  "#0CA7AE",

  "#29BFD0",
  "#12AEE5",
  "#4CA7F5",
  "#0E5CE4",
  "#153D8E",
  "#4B31E1",

  "#8846FF",
  "#8A2ABE",
  "#A77FF1",
  "#F20E8C",
  "#F45B8F",
  "#F49CB9",

  "#FFFFFF",
  "#C8C9CB",
  "#5A5A5A",
  "#A95F2B",
  "#F4E1B8",
];


/* -------------------------------------------------------------------------- */
/* COLOR HELPERS                                                              */
/* -------------------------------------------------------------------------- */

function hexToRgb(hex) {
  const clean = String(hex)
    .replace("#", "")
    .trim();

  if (clean.length !== 6) {
    return [255, 255, 255];
  }

  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}


function hslToHex(h, s, l) {
  const saturation = s / 100;
  const lightness = l / 100;

  const chroma =
    (1 - Math.abs(2 * lightness - 1)) *
    saturation;

  const x =
    chroma *
    (1 -
      Math.abs(
        ((h / 60) % 2) - 1
      ));

  const m =
    lightness - chroma / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = chroma;
    g = x;
  } else if (h < 120) {
    r = x;
    g = chroma;
  } else if (h < 180) {
    g = chroma;
    b = x;
  } else if (h < 240) {
    g = x;
    b = chroma;
  } else if (h < 300) {
    r = x;
    b = chroma;
  } else {
    r = chroma;
    b = x;
  }

  const toHex = (value) =>
    Math.round(
      (value + m) * 255
    )
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}


function createCustomColorGrid() {
  const colors = [];

  const hues = [
    345,
    325,
    300,
    270,
    240,
    215,
    195,
    175,
    150,
    120,
    85,
    55,
    30,
    10,
  ];

  const lightnessRows = [
    95,
    86,
    76,
    66,
    56,
    46,
    36,
    26,
  ];

  lightnessRows.forEach(
    (lightness, rowIndex) => {
      hues.forEach((hue) => {
        colors.push(
          hslToHex(
            hue,
            rowIndex < 2 ? 55 : 78,
            lightness
          )
        );
      });
    }
  );

  return colors;
}

function getMandalaArtworkBounds(image) {
  const tempCanvas = document.createElement("canvas");

  tempCanvas.width = image.naturalWidth;
  tempCanvas.height = image.naturalHeight;

  const context = tempCanvas.getContext("2d", {
    willReadFrequently: true,
  });

  context.fillStyle = "#ffffff";
  context.fillRect(
    0,
    0,
    tempCanvas.width,
    tempCanvas.height
  );

  context.drawImage(image, 0, 0);

  const imageData = context.getImageData(
    0,
    0,
    tempCanvas.width,
    tempCanvas.height
  );

  const { data, width, height } = imageData;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  let found = false;

  /*
    Anything noticeably darker than white
    counts as part of the drawing.
  */
  const whiteThreshold = 244;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;

      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      const a = data[offset + 3];

      if (
        a > 10 &&
        (
          r < whiteThreshold ||
          g < whiteThreshold ||
          b < whiteThreshold
        )
      ) {
        found = true;

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);

        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (!found) {
    return {
      x: 0,
      y: 0,
      width,
      height,
    };
  }

  /*
    Keep some breathing room around the drawing.
  */
  const padding = Math.max(
    12,
    Math.round(
      Math.min(width, height) * 0.025
    )
  );

  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);

  maxX = Math.min(
    width - 1,
    maxX + padding
  );

  maxY = Math.min(
    height - 1,
    maxY + padding
  );

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

function MandalaGame({
  onBack,
}) {
  const canvasRef =
    useRef(null);

  const undoHistoryRef =
    useRef([]);

  const redoHistoryRef =
    useRef([]);

  const [
    selectedDesign,
    setSelectedDesign,
  ] = useState(null);

  const [
    selectedColor,
    setSelectedColor,
  ] = useState(
    MANDALA_COLORS[0]
  );

  const [
    tool,
    setTool,
  ] = useState("paint");

  const [
    customPickerOpen,
    setCustomPickerOpen,
  ] = useState(false);

  const [
    canUndo,
    setCanUndo,
  ] = useState(false);

  const [
    canRedo,
    setCanRedo,
  ] = useState(false);

  const [
    complete,
    setComplete,
  ] = useState(false);


  function updateHistoryState() {
    setCanUndo(
      undoHistoryRef.current
        .length > 0
    );

    setCanRedo(
      redoHistoryRef.current
        .length > 0
    );
  }


  function loadDesign(
  design = selectedDesign
) {
  if (!design) {
    return;
  }

  const canvas =
    canvasRef.current;

  if (!canvas) {
    return;
  }

  const image = new Image();

  image.onload = () => {
    const bounds =
      getMandalaArtworkBounds(
        image
      );

    canvas.width =
      bounds.width;

    canvas.height =
      bounds.height;

    const context =
      canvas.getContext(
        "2d",
        {
          willReadFrequently: true,
        }
      );

    context.fillStyle =
      "#ffffff";

    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    /*
      Draw only the useful artwork area,
      removing unnecessary white margins.
    */
    context.drawImage(
      image,

      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,

      0,
      0,
      canvas.width,
      canvas.height
    );

    undoHistoryRef.current =
      [];

    redoHistoryRef.current =
      [];

    updateHistoryState();

    setTool("paint");
    setComplete(false);
  };

  image.src = design.src;
}


  useEffect(() => {
    if (
      selectedDesign
    ) {
      loadDesign(
        selectedDesign
      );
    }
  }, [selectedDesign]);


  function handleCanvasClick(
    event
  ) {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const rectangle =
      canvas.getBoundingClientRect();

    const scaleX =
      canvas.width /
      rectangle.width;

    const scaleY =
      canvas.height /
      rectangle.height;

    const x =
  Math.max(
    0,
    Math.min(
      canvas.width - 1,
      Math.floor(
        (
          event.clientX -
          rectangle.left
        ) *
        scaleX
      )
    )
  );


const y =
  Math.max(
    0,
    Math.min(
      canvas.height - 1,
      Math.floor(
        (
          event.clientY -
          rectangle.top
        ) *
        scaleY
      )
    )
  );

    const context =
      canvas.getContext(
        "2d",
        {
          willReadFrequently: true,
        }
      );

    /*
      Save BEFORE state for undo.
    */
    const previous =
      context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

    const fillColor =
      tool === "erase"
        ? "#FFFFFF"
        : selectedColor;

    const changed =
      floodFillCanvas(
        canvas,
        x,
        y,
        fillColor
      );

    if (!changed) {
      return;
    }

    /*
      Keep latest 25 operations only.
      This prevents large canvas images
      building unlimited browser memory.
    */
    undoHistoryRef.current =
      [
        ...undoHistoryRef.current,
        previous,
      ].slice(-25);

    redoHistoryRef.current =
      [];

    updateHistoryState();
  }


  function undo() {
    const canvas =
      canvasRef.current;

    if (
      !canvas ||
      !undoHistoryRef.current
        .length
    ) {
      return;
    }

    const context =
      canvas.getContext("2d");

    const current =
      context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

    const previous =
      undoHistoryRef.current.pop();

    redoHistoryRef.current.push(
      current
    );

    context.putImageData(
      previous,
      0,
      0
    );

    updateHistoryState();
  }


  function redo() {
    const canvas =
      canvasRef.current;

    if (
      !canvas ||
      !redoHistoryRef.current
        .length
    ) {
      return;
    }

    const context =
      canvas.getContext("2d");

    const current =
      context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

    const next =
      redoHistoryRef.current.pop();

    undoHistoryRef.current.push(
      current
    );

    context.putImageData(
      next,
      0,
      0
    );

    updateHistoryState();
  }


  function selectColor(
    color
  ) {
    setSelectedColor(
      color
    );

    setTool("paint");

    setCustomPickerOpen(
      false
    );
  }


  function playAgain() {
    setComplete(false);

    loadDesign(
      selectedDesign
    );
  }


  /* ======================================================
     DESIGN SELECTOR
     ====================================================== */

  if (!selectedDesign) {
    return (
      <div className="brain-game-page brain-mandala-page">

        <header className="mandala-page-heading">
          <h1>
            Mandala Coloring
          </h1>

          <p>
            Choose a design and make it your own, one colour at a time.
          </p>
        </header>


        <section className="mandala-gallery-shell">

          <div className="mandala-gallery-grid">

            {MANDALA_DESIGNS.map(
              (design) => (
                <button
                  key={
                    design.id
                  }
                  type="button"
                  className="mandala-design-card"
                  onClick={() =>
                    setSelectedDesign(
                      design
                    )
                  }
                >
                  <img
                    src={
                      design.src
                    }
                    alt={
                      design.alt
                    }
                    draggable="false"
                  />
                </button>
              )
            )}

          </div>

        </section>

      </div>
    );
  }


  /* ======================================================
     COLORING EDITOR
     ====================================================== */

  return (
    <div className="brain-game-page brain-mandala-page">

      <div className="mandala-editor-heading-row">

        <header className="mandala-page-heading">
          <h1>
            Mandala Coloring
          </h1>

          <p>
            Choose a design and make it your own, one colour at a time.
          </p>
        </header>


        <button
          type="button"
          className="brain-button brain-button--primary mandala-finish-button"
          onClick={() =>
            setComplete(true)
          }
        >
          Finish colouring
        </button>

      </div>


      <section className="mandala-editor-shell">

        {/* =========================================
            CANVAS
            ========================================= */}

        <div className="mandala-canvas-card">

          <canvas
            ref={canvasRef}
            className="mandala-canvas"
            onClick={
              handleCanvasClick
            }
            aria-label="Mandala colouring canvas"
          />

        </div>


        {/* =========================================
            CONTROLS
            ========================================= */}

        <aside className="mandala-controls">

          <div className="mandala-history-row">

            <button
              type="button"
              className="mandala-tool-button"
              onClick={undo}
              disabled={!canUndo}
            >
              <Undo2
                size={21}
                strokeWidth={1.5}
              />

              <span>
                Undo
              </span>
            </button>


            <button
              type="button"
              className="mandala-tool-button"
              onClick={redo}
              disabled={!canRedo}
            >
              <Redo2
                size={21}
                strokeWidth={1.5}
              />

              <span>
                Redo
              </span>
            </button>

          </div>


          <button
            type="button"
            className={`mandala-tool-button mandala-remove-button ${tool === "erase"
              ? "is-active"
              : ""
              }`}
            onClick={() =>
              setTool(
                tool === "erase"
                  ? "paint"
                  : "erase"
              )
            }
          >
            <Eraser
              size={19}
              strokeWidth={1.5}
            />

            <span>
              Remove color
            </span>
          </button>


          {/* =======================================
              COLORS
              ======================================= */}

          <div className="mandala-colors-card">

            <div className="mandala-colors-card__heading">
              Colors
            </div>


            <div className="mandala-color-grid">

              {MANDALA_COLORS.map(
                (color) => (
                  <button
                    key={
                      color
                    }
                    type="button"
                    className={`mandala-color-swatch ${tool ===
                      "paint" &&
                      selectedColor ===
                      color
                      ? "is-selected"
                      : ""
                      }`}
                    style={{
                      background:
                        color,
                    }}
                    onClick={() =>
                      selectColor(
                        color
                      )
                    }
                    aria-label={`Use colour ${color}`}
                  />
                )
              )}


              {/* CUSTOM COLOR */}

              <button
                type="button"
                className="mandala-custom-color-trigger"
                onClick={() =>
                  setCustomPickerOpen(
                    (current) =>
                      !current
                  )
                }
                aria-label="Choose custom colour"
              />

            </div>


            {/* =====================================
                CUSTOM COLOR PICKER
                ===================================== */}

            {customPickerOpen && (
              <div className="mandala-custom-color-popover">

                <div className="mandala-custom-color-popover__header">

                  <strong>
                    Choose a colour
                  </strong>

                  <button
                    type="button"
                    onClick={() =>
                      setCustomPickerOpen(
                        false
                      )
                    }
                    aria-label="Close colour picker"
                  >
                    <X
                      size={17}
                    />
                  </button>

                </div>


                <div className="mandala-custom-color-grid">

                  {CUSTOM_MANDALA_COLORS.map(
                    (
                      color,
                      index
                    ) => (
                      <button
                        key={`${color}-${index}`}
                        type="button"
                        style={{
                          background:
                            color,
                        }}
                        onClick={() =>
                          selectColor(
                            color
                          )
                        }
                        aria-label={`Choose ${color}`}
                      />
                    )
                  )}

                </div>

              </div>
            )}

          </div>

        </aside>

      </section>


      {/* EXISTING SHARED GAME RESULT POPUP */}

      <ResultModal
        open={complete}
        title="You Did It!"
        description="Great job! You made this design your own with creativity and focus."
        onBack={onBack}
        onPlayAgain={
          playAgain
        }
        onClose={() =>
          setComplete(false)
        }
      />

    </div>
  );
}


const CUSTOM_MANDALA_COLORS =
  createCustomColorGrid();


/* -------------------------------------------------------------------------- */
/* FLOOD FILL                                                                 */
/* -------------------------------------------------------------------------- */

function floodFillCanvas(
  canvas,
  startX,
  startY,
  fillColor
) {
  const context =
    canvas.getContext(
      "2d",
      {
        willReadFrequently: true,
      }
    );

  const width =
    canvas.width;

  const height =
    canvas.height;

  /*
    Prevent coordinates outside the bitmap.
  */
  if (
    startX < 0 ||
    startX >= width ||
    startY < 0 ||
    startY >= height
  ) {
    return false;
  }

  const imageData =
    context.getImageData(
      0,
      0,
      width,
      height
    );

  const data =
    imageData.data;

  const startPosition =
    startY * width +
    startX;

  const startOffset =
    startPosition * 4;

  const target = [
    data[startOffset],
    data[startOffset + 1],
    data[startOffset + 2],
  ];

  const replacement =
    hexToRgb(fillColor);


  /*
    --------------------------------------------------
    BLACK / GREY LINE DETECTION
    --------------------------------------------------

    The PNG outlines contain anti-aliased grey pixels,
    not just pure black.

    Therefore we must treat darker near-grey pixels
    as boundaries too.
  */

  function isOutlinePixel(
    r,
    g,
    b
  ) {
    const maximum =
      Math.max(r, g, b);

    const minimum =
      Math.min(r, g, b);

    const spread =
      maximum - minimum;

    const luminance =
      (
        r * 0.299 +
        g * 0.587 +
        b * 0.114
      );

    /*
      Low colour spread = grey/black.

      Grey pixels below this brightness
      belong to the anti-aliased outline.
    */
    return (
      spread < 22 &&
      luminance < 238
    );
  }


  /*
    If the click itself lands on a line,
    do nothing.

    This is safer than guessing a nearby region.
  */
  if (
    isOutlinePixel(
      target[0],
      target[1],
      target[2]
    )
  ) {
    return false;
  }


  /*
    Already this colour.
  */
  if (
    Math.abs(
      target[0] -
      replacement[0]
    ) <= 3 &&
    Math.abs(
      target[1] -
      replacement[1]
    ) <= 3 &&
    Math.abs(
      target[2] -
      replacement[2]
    ) <= 3
  ) {
    return false;
  }


  /*
    Much tighter than the previous 28.

    This is deliberately conservative so
    the colour cannot leak through outlines.
  */
  const tolerance = 12;


  function matchesTarget(
    offset
  ) {
    const r =
      data[offset];

    const g =
      data[offset + 1];

    const b =
      data[offset + 2];


    /*
      Never cross line pixels.
    */
    if (
      isOutlinePixel(
        r,
        g,
        b
      )
    ) {
      return false;
    }


    return (
      Math.abs(
        r - target[0]
      ) <= tolerance &&

      Math.abs(
        g - target[1]
      ) <= tolerance &&

      Math.abs(
        b - target[2]
      ) <= tolerance
    );
  }


  const visited =
    new Uint8Array(
      width * height
    );

  const stack = [
    startPosition,
  ];

  const fillPositions = [];

  let touchesCanvasEdge =
    false;


  while (
    stack.length
  ) {
    const position =
      stack.pop();

    if (
      position < 0 ||
      position >=
        width * height ||
      visited[position]
    ) {
      continue;
    }


    visited[position] = 1;


    const offset =
      position * 4;


    if (
      !matchesTarget(
        offset
      )
    ) {
      continue;
    }


    const x =
      position % width;

    const y =
      Math.floor(
        position / width
      );


    /*
      Detect the huge outside/background area.

      We don't want a click outside the actual
      Mandala to colour the entire canvas.
    */
    if (
      x === 0 ||
      y === 0 ||
      x === width - 1 ||
      y === height - 1
    ) {
      touchesCanvasEdge =
        true;
    }


    fillPositions.push(
      position
    );


    if (x > 0) {
      stack.push(
        position - 1
      );
    }

    if (
      x <
      width - 1
    ) {
      stack.push(
        position + 1
      );
    }

    if (y > 0) {
      stack.push(
        position - width
      );
    }

    if (
      y <
      height - 1
    ) {
      stack.push(
        position + width
      );
    }
  }


  if (
    !fillPositions.length
  ) {
    return false;
  }


  /*
    White region connected to the outside edge
    = canvas background, not a Mandala section.

    Don't colour it.
  */
  const targetIsNearWhite =
    target[0] > 242 &&
    target[1] > 242 &&
    target[2] > 242;


  if (
    touchesCanvasEdge &&
    targetIsNearWhite
  ) {
    return false;
  }


  /*
    Apply colour only AFTER we know
    the region is safe.
  */
  fillPositions.forEach(
    (position) => {
      const offset =
        position * 4;

      data[offset] =
        replacement[0];

      data[offset + 1] =
        replacement[1];

      data[offset + 2] =
        replacement[2];

      data[offset + 3] =
        255;
    }
  );


  context.putImageData(
    imageData,
    0,
    0
  );


  return true;
}



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
    if (location.pathname.endsWith("/sudoku")) {
      return "sudoku";
    }

    if (location.pathname.endsWith("/tic-tac-toe")) {
      return "tic-tac-toe";
    }

    if (location.pathname.endsWith("/sliding-puzzle")) {
      return "sliding-puzzle";
    }

    if (location.pathname.endsWith("/classic-snake")) {
      return "classic-snake";
    }

    if (location.pathname.endsWith("/word-scramble")) {
      return "word-scramble";
    }

    if (location.pathname.endsWith("/mandala")) {
      return "mandala";
    }

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
        {currentGame === "classic-snake" ? (

          <ClassicSnakeGame onBack={backToGames} />

        ) : null}

        {currentGame === "word-scramble" ? (

          <WordScrambleGame onBack={backToGames} />

        ) : null}

        {currentGame === "mandala" ? (
          <MandalaGame
            onBack={backToGames}
          />
        ) : null}

      </div>

    </AppLayout>

  );

}



export default BrainGamesPage;
