import { useState } from 'react';

/**
 * Square: Represents a button in the Board
 *  - Recieve the value (X, O or null)
 *  - highlight: highlights the square if it belongs to the winner line
 */
function Square({value, onSquareClick, highlight}){
  return(
    <button 
      className={`square ${highlight ? "highlight" : ""}`}
      onClick={onSquareClick}>
      {value}
    </button>
    );
}

/**
 * ToggleOrderButton: Represents a Button that changes the order of move history buttons
 */
function ToggleOrderButton({currentOrder, onToggleClick}){
  return(
    <button onClick={onToggleClick}>
      Current Order: {currentOrder}
    </button>
  );
}
/**
 * Game
 * 
 * Root component of the application
 * 
 * Responsabilities:
 * -  Manages the full game state (hsitory of moves, current move, turn order, and sorting)
 * - Renders the <Board> component and passes down props for interactivity
 * - Handles user interactions:
 *    - handlePlay(): updats history and active move after each turn
 *    - jumpTo(): allows time travel to a previous move
 *    - toggleOrder(): toggles the order of the move history (ascending/descending)
 * - Displays the move history list with coordinates and move navigation
 * 
 * State structure:
 *  history: [
 *    {
 *      squares: Array(9)           //current board configuration
 *      moveLocation: { row, col }  //last move position
 *    },
 *    ...
 *  ]
 *  currentMove: number             //index of the active move in history
 *  order: "asc" | "desc"           //determines list sorting order
 * 
 * Children:
 * - <Board />: renders the 3x3 and triggers onPlay() when a move occurs
 * - <OrderButton />: toggles the move list order
 */
export default function Game(){
  const [history, setHistory] = useState([{ squares: Array(9).fill(null), moveLocation: null }]);
  const [currentMove, setCurrentMove] = useState(0);
  const [order, setOrder] = useState("asc");
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;


  function handlePlay(nextSquares, row, col){
    const nextHistory = 
      [...history.slice(0, currentMove +1), 
      { squares: nextSquares, moveLocation: { row, col } }
    ];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1)
  }

  function jumpTo(nextMove){
    setCurrentMove(nextMove);
  }

  function toggleOrder(){
    setOrder(prev => (prev === "asc" ? "desc" : "asc"));
  }

  const moves = history.map((step, move) => {
    const { moveLocation } = step;
    let description;
    if (move === currentMove){
      return(
      <div>You are at move #{move}</div>
      );
    }
    if (move > 0){
      description = 'Go to move #' + move + " (" + moveLocation.row + "," + moveLocation.col + ")";
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  const displayedMoves = order === "desc" ? moves.slice().reverse() : moves;

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />  
      </div>
      <div className="game-info">
        <ToggleOrderButton currentOrder={order} onToggleClick={toggleOrder}/>
        <ol>{displayedMoves}</ol>
      </div>
    </div>
  );
}

/**
 * Board
 * 
 * Represents the 3x3 game board
 * 
 * Responsabilities:
 * - Renders nine <Square /> components in a 3x3 grid
 * - Handles user interactions via handleClick():
 *    - Prevents moves on occupied squares or after a win
 *    - Calculates the next player and updates the board
 *    - Reports the new board state and move coordinates back to <Game />
 * - Displays the current game status
 * - Highlights the winning line when a player wins
 * 
 * Props:
 *  squares: Array(9)             //Current board configuration
 *  onPlay(nextSquares, row, col) //callback to update game state in <Game />
 * 
 * Internal behaviour:
 * - Uses calculateWinner(squares) to determine if there's a winner
 * - COmputes isDraw when all squares are filled and no winner exists
 * - Builds boardRows dynamically with nested loops for flexibility
 * 
 * Children:
 * - <Square />: individual clickable cells that display 'X', 'O' or remain empty
 * 
 * This component focuses purely on rendering logic and user interaction within the board
 * 
 * 
 */

function Board({xIsNext, squares, onPlay}) {

  function handleClick(i){

    const row = Math.floor(i / 3);
    const col = i % 3;

    if(calculateWinner(squares) || squares[i]){
      return;
    }

    const nextSquares = squares.slice();

    xIsNext ? nextSquares[i] = 'X' : nextSquares[i] = 'O'

    onPlay(nextSquares, row, col);
  }

  const result = calculateWinner(squares);
  const winner = result ? result.winner : null;
  const winningSquares = result ? result.line : [];
  const isDraw = !winner && squares.every(square => square !== null);
  let status;
  
  if (winner){
    status = "Winner: " + winner;
  } else if (isDraw){
    status = "It's a draw!!";
  } else {
    status = "Next Player: " + (xIsNext ? "X" : "O");
  }
  
  const boardRows = [];

  for (let row = 0; row < 3; row++){
    const cols = [];
    for (let col = 0; col < 3; col ++){
      const index = row * 3 + col;
      const isWinningSquare = winningSquares.includes(index);
      cols.push(
        <Square key={index}
        value={squares[index]}
        highlight={isWinningSquare}
        onSquareClick={() => handleClick(index)}
        />
      );
    }
    boardRows.push(
      <div key={row} className="board-row">
        {cols}
      </div>
      );
      
  }
  return(
    <>
      <div className="status">{status}</div>
      {boardRows}
    </>
  );

}

function calculateWinner(squares){
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++){
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]){
      return { winner: squares[a], line: lines[i] };
    }
  }
  return null;
}

