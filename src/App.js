import { useState } from 'react';

function Square({value, onSquareClick, highlight}){
  return(
    <button 
      className={`square ${highlight ? "highlight" : ""}`}
      onClick={onSquareClick}>
      {value}
    </button>
    );
}

function OrderButton({currentOrder, onToggleClick}){
  return(
    <button onClick={onToggleClick}>
      Current Order: {currentOrder}
    </button>
  );
}

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
    order === "asc" ? setOrder("desc") : setOrder("asc");
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
      <ul key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </ul>
    );
  });

  const displayedMoves = order === "desc" ? moves.slice().reverse() : moves;

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />  
      </div>
      <div className="game-info">
        <OrderButton currentOrder={order} onToggleClick={toggleOrder}/>
        <ol>{displayedMoves}</ol>
      </div>
    </div>
  );
}

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

