import React, { useState, useEffect } from "react";
import Image from "next/image";

function Game(props) {
  let birdLeft = 80;
  let birdBottom = 440;
  let gravity = 4;
  let passCake = 0;
  let eatCake = 0;

  let isGameOver = false;
  const [isBegin, setIsBegin] = useState(false);
  const [isOver, setIsOver] = useState(false);
  const [isInit, setInit] = useState(true);

  function startGame() {
    const bird = document.querySelector(".bird");
    setInterval(() => {
      birdBottom -= gravity;
      bird.style.bottom = birdBottom + "px";
      bird.style.left = birdLeft + "px";
      if (birdBottom < 100) birdBottom = 100;
    }, 20);
    if (isGameOver) clearInterval(gameTimerId);
  }

  function jump() {
    if (!isGameOver) {
      const bird = document.querySelector(".bird");
      if (birdBottom < 580) birdBottom += 80;
      bird.style.bottom = birdBottom + "px";
    }
  }

  function Cake() {
    let cakeLeft = 400;
    let cakeHeight = 140 + Math.random() * 410;
    let cakeBottom = cakeHeight;
    let isEat = false;

    const gameDisplay = document.querySelector(".sky");
    const cake = document.createElement("div");
    if (!isGameOver) {
      cake.classList.add("cake");
    }
    gameDisplay.appendChild(cake);

    cake.style.left = cakeLeft + "px";
    cake.style.bottom = cakeBottom + "px";

    function moveCake() {
      cakeLeft -= 3;
      cake.style.left = cakeLeft + "px";

      if (
        110 <= cakeLeft &&
        cakeLeft <= 120 &&
        (birdBottom >= cakeBottom + 70 || cakeBottom >= birdBottom + 70)
      ) {
        gameOver();
      }
      if (
        80 <= cakeLeft &&
        cakeLeft <= 150 &&
        birdBottom <= cakeBottom &&
        cakeBottom <= birdBottom + 45
      ) {
        clearInterval(timerId);
        isEat = true;
        gameDisplay.removeChild(cake);
      }
      if (cakeLeft <= -60) {
        clearInterval(timerId);
        gameDisplay.removeChild(cake);
      }
    }
    let timerId = setInterval(moveCake, 20);
    if (isEat) eatCake += 1;
    if (!isGameOver) setTimeout(Cake, 1100);
  }

  function gameOver() {
    console.log("game over");
    isGameOver = true;
    setIsOver(true);
  }

  useEffect(() => {
    if (isInit) {
      setInit(false);
    } else {
      startGame();
      Cake();
    }
  }, [isBegin]);

  return (
    <div
      onClick={() => {
        if (!isGameOver) jump();
        setIsBegin(true);
      }}
    >
      <div className="sky">
        <div className="bird"></div>

        {!isBegin && !isOver && (
          <h1
            style={{
              top: "36%",
              left: "17%",
              position: "absolute",
            }}
          >
            点击屏幕开始游戏
          </h1>
        )}

        {isOver && (
          <h1
            style={{
              top: "36%",
              left: "34%",
              position: "absolute",
            }}
          >
            游戏结束
          </h1>
        )}
      </div>

      <div className="ground"></div>
    </div>
  );
}

export default Game;
