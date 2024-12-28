import React, { useState } from "react";
import { useEffect } from "react";

function MemoryGame() {
  const [gridSize, setGridsize] = useState(4); // default grid size (4x4)//
  const [cards, setCards] = useState([]); // cards array//
  const [flipped, setFlipped] = useState([]); // flipped cards array//
  const [disabled, setDisabled] = useState(false);
  const [matched, setMatched] = useState([]); // matched cards array//

  const [moves, setMoves] = useState(0); //moves counter//
  const [gameOver, setGameOver] = useState(false);
  const [totalTime, setTotalTime] = useState(null);
  const [startTime, setStartTime] = useState(null); // time counter//
  const [won, setWon] = useState(false); // when all the cards are flipped and user win //

  const maxMoves = gridSize * gridSize + gridSize * 2;
 const gridOption = ["2","4","6","8","10"]

  function handleGridSize(e) {
    const size = parseInt(e.target.value);
    if (size >= 2 && size <= 10) {
      setGridsize(size);
    }
  }

  //initialisation of game //

  function handleStartGame() {
    const totalCards = gridSize * gridSize; //total cards in a grid , ex. 4x4 = 16 //
    const pairsOfnumbers = Math.floor(totalCards / 2); // 8pairs //
    const numbers = [...Array(pairsOfnumbers).keys()].map((i) => i + 1);
    const shuffledCards = [...numbers, ...numbers]
      .sort(() => Math.random() - 0.5)
      .slice(0, totalCards)
      .map((number, index) => ({ id: index, number }));

    setCards(shuffledCards);
    setFlipped([]);
    setMoves([0]);
    setStartTime(Date.now());
    setMatched([]);
    setDisabled(false);
    setWon(false);
    setTotalTime(null);
    setGameOver(false);
  }

  useEffect(() => {
    handleStartGame();
  }, [gridSize]);

  function handleMatched(secondId) {
    const [firstId] = flipped;
    if (cards[firstId].number === cards[secondId].number) {
      setMatched([...matched, firstId, secondId]);
      setFlipped([]);
      setDisabled(false);
    } else {
      setTimeout(() => {
        setFlipped([]);
        setDisabled(false);
      }, 1000);
    }
  }

  // start the timer on the first click on the cards//
  useEffect(() => {
    if (moves === 1 && !startTime) {
      setStartTime(Date.now());
    }
  }, [moves, startTime]);

  // update elapsed time when the game ends//
  useEffect(() => {
    if (gameOver || won) {
      const endtime = Date.now();
      const timetaken = Math.round((endtime - startTime) / 1000);
      setTotalTime(timetaken);
    }
  }, [gameOver, won, startTime]);

  // check if player runs out of moves //

  useEffect(() => {
    if (moves >= maxMoves && matched.length < cards.length) {
      setGameOver(true);
    }
  }, [moves, maxMoves, matched, cards]);

  function handleResetBtn() {
    handleStartGame();
  }

  // when user win the game//
  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setWon(true);
    }
  }, [matched, cards]);

  //handle cards click//

  const handleClickCards = (id) => {
    if (gameOver || disabled || won) return;
    setMoves((prevMoves) => Number(prevMoves + 1));
    if (flipped.length === 0) {
      setFlipped([id]);

      return;
    }

    if (flipped.length === 1) {
      setDisabled(true);

      if (id !== flipped[0]) {
        setFlipped([...flipped, id]);

        //check match logic //
        handleMatched(id);
      }
    } else {
      setFlipped([]);
      setDisabled(false);
    }
  };

  const handleFlipCard = (id) => flipped.includes(id) || matched.includes(id);
  const isMatched = (id) => matched.includes(id);

  return (
    <div className="flex flex-col justify-center items-center w-full p-2 m-4 ">
      <h1 className="text-4xl font-bold mb-6 mt-10 text-blue-900 mr-4">
        MATCH THE NUMBERS
      </h1>

      {/* input */}
      <div className="flex flex-row gap-2">
        <label
          htmlFor="grid-size"
          className="text-2xl font-semibold text-gray-600 font-sans mt-4 "
        >
          Grid Size :
        </label>

        <select
          className=" border-2 border-gray-200 rounded px-2 py-1 bg-slate-200 mr-2"
          type="number"
          id="grid-size"
          min="2"
          max="10"
          value={gridSize}
          onChange={handleGridSize}
        >
          {gridOption.map((option) => (<option key={option} value={option}>
            {option}
          </option>))}
        </select>
      </div>

      {/* display moves */}
      <div>
        <p className="text-lg justify-center align-center p-2 mr-4 font-bold mt-5 ">
          Moves: {moves}/{maxMoves}
        </p>
        <p className="text-red-700 font-sans font-[25px] font-semibold">
          {gameOver ? "out of moves" : ""}
        </p>
      </div>

      {/* game board */}
      <div
        className={`grid gap-2 mt-5 mb-6 mr-5 `}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          width: `min(100%, ${gridSize * 4.5}rem)`,
        }}
      >
        {cards.map((card) => {
          return (
            <div
              onClick={() => handleClickCards(card.id)}
              className={`aspect-square flex items-center justify-center text-xl font-bold rounded-lg
          cursor-pointer transition-all duration-300  ${
            handleFlipCard(card.id)
              ? isMatched(card.id)
                ? "bg-green-500 text-white"
                : "bg-blue-400 text-white"
              : " bg-teal-300 text-gray-500"
          }`}
              key={card.id}
            >
              {handleFlipCard(card.id) ? card.number : "?"}
            </div>
          );
        })}
      </div>

      {/* congratulation msg */}
      <div className="text-3xl font-bold text-green-600 mt-4 animate-bounce">
        {won && <p>Congratulation! you won in {totalTime} seconds</p>}
      </div>

      <div className="text-3xl font-bold text-red-500 animate-pulse">
        {gameOver && <p>game over ! you took {totalTime} seconds</p>}
      </div>
      {/* reset btn */}
      <div>
        <button
          className="text-xl bg-blue-600 text-white p-2 rounded-md mt-6 mr-4 w-[350px]
           hover:bg-blue-700 align-center justify-center"
          onClick={handleResetBtn}
        >
          {won ? "play Again" : "Reset Game"}
        </button>
      </div>
    </div>
  );
}
export default MemoryGame;
