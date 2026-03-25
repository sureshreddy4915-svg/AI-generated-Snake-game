import React, { useEffect, useRef, useState, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const INITIAL_SPEED = 150;

type Point = { x: number; y: number };

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Game state refs to avoid closure stale state in requestAnimationFrame
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const dirRef = useRef<Point>({ x: 0, y: -1 });
  const nextDirRef = useRef<Point>({ x: 0, y: -1 });
  const foodRef = useRef<Point>({ x: 5, y: 5 });
  const speedRef = useRef(INITIAL_SPEED);
  const lastTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(0);

  const generateFood = useCallback((): Point => {
    let newFood: Point;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      isOccupied = snakeRef.current.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
    }
    return newFood!;
  }, []);

  const resetGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }];
    dirRef.current = { x: 0, y: -1 };
    nextDirRef.current = { x: 0, y: -1 };
    foodRef.current = generateFood();
    speedRef.current = INITIAL_SPEED;
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setHasStarted(true);
    lastTimeRef.current = performance.now();
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.save();
    // Random canvas glitch translation
    if (Math.random() > 0.95) {
      ctx.translate((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 5);
    }

    // Draw static noise (simulated)
    for (let i = 0; i < 150; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#00ffff' : '#ff00ff';
      ctx.globalAlpha = Math.random() * 0.3;
      ctx.fillRect(Math.random() * CANVAS_SIZE, Math.random() * CANVAS_SIZE, Math.random() * 4, Math.random() * 4);
    }
    ctx.globalAlpha = 1.0;

    // Draw grid lines (jarring)
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw Food (Cyan)
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(
      foodRef.current.x * CELL_SIZE,
      foodRef.current.y * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE
    );

    // Draw Snake (Magenta)
    snakeRef.current.forEach((segment, index) => {
      if (index === 0) {
        ctx.fillStyle = '#ffffff'; // White head
      } else {
        ctx.fillStyle = '#ff00ff';
      }
      
      ctx.fillRect(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    });
    
    ctx.restore();
  }, []);

  const update = useCallback((time: number) => {
    if (gameOver || isPaused || !hasStarted) {
      requestRef.current = requestAnimationFrame(update);
      return;
    }

    const deltaTime = time - lastTimeRef.current;

    if (deltaTime > speedRef.current) {
      lastTimeRef.current = time;

      // Update direction
      dirRef.current = nextDirRef.current;

      const head = snakeRef.current[0];
      const newHead = {
        x: head.x + dirRef.current.x,
        y: head.y + dirRef.current.y,
      };

      // Wrap around walls
      if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
      else if (newHead.x >= GRID_SIZE) newHead.x = 0;
      
      if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
      else if (newHead.y >= GRID_SIZE) newHead.y = 0;

      // Check self collision
      if (
        snakeRef.current.some(
          (segment) => segment.x === newHead.x && segment.y === newHead.y
        )
      ) {
        setGameOver(true);
        return;
      }

      const newSnake = [newHead, ...snakeRef.current];

      // Check food collision
      if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
        setScore((s) => {
          const newScore = s + 10;
          if (newScore > highScore) setHighScore(newScore);
          return newScore;
        });
        foodRef.current = generateFood();
        // Increase speed slightly
        speedRef.current = Math.max(50, speedRef.current - 2);
      } else {
        newSnake.pop();
      }

      snakeRef.current = newSnake;
    }

    draw();
    requestRef.current = requestAnimationFrame(update);
  }, [gameOver, isPaused, hasStarted, draw, generateFood, highScore]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [update]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && hasStarted && !gameOver) {
        setIsPaused((p) => !p);
        return;
      }

      const { x, y } = dirRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (y !== 1) nextDirRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (y !== -1) nextDirRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (x !== 1) nextDirRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (x !== -1) nextDirRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted, gameOver]);

  // Initial draw
  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {/* Score Board */}
      <div className="w-full p-1 bg-neon-cyan">
        <div className="flex justify-between w-full px-8 py-4 bg-black border-2 border-neon-magenta">
          <div className="flex flex-col items-center">
            <span className="text-neon-cyan text-sm uppercase font-pixel tracking-widest">SCORE</span>
            <span className="text-4xl font-terminal text-white mt-2">
              {score}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-neon-magenta text-sm uppercase font-pixel tracking-widest">HI_SCORE</span>
            <span className="text-4xl font-terminal text-white mt-2">
              {highScore}
            </span>
          </div>
        </div>
      </div>

      {/* Game Canvas Container */}
      <div className="relative screen-tear border-[8px] border-solid border-neon-magenta">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="bg-black block"
        />
        
        {/* Overlays */}
        {(!hasStarted || gameOver || isPaused) && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-10">
            {!hasStarted && !gameOver && (
              <>
                <h2 className="glitch text-2xl font-pixel text-white mb-8 uppercase" data-text="BOOT_SEQUENCE">
                  BOOT_SEQUENCE
                </h2>
                <button
                  onClick={resetGame}
                  className="px-6 py-4 bg-black border-2 border-neon-cyan text-neon-cyan font-pixel text-sm hover:bg-neon-cyan hover:text-black transition-colors cursor-pointer screen-tear"
                >
                  [ INJECT_PAYLOAD ]
                </button>
                <p className="text-neon-magenta mt-8 text-xl font-terminal">INPUT: WASD / ARROWS</p>
              </>
            )}
            {gameOver && (
              <>
                <h2 className="glitch text-3xl font-pixel text-neon-magenta mb-4 uppercase" data-text="CRITICAL_FAILURE">
                  CRITICAL_FAILURE
                </h2>
                <p className="text-2xl text-white mb-8 font-terminal">SECTORS_CORRUPTED: <span className="text-neon-cyan">{score}</span></p>
                <button
                  onClick={resetGame}
                  className="px-6 py-4 bg-black border-2 border-neon-magenta text-neon-magenta font-pixel text-sm hover:bg-neon-magenta hover:text-black transition-colors cursor-pointer screen-tear"
                >
                  [ RESTART_NODE ]
                </button>
              </>
            )}
            {isPaused && !gameOver && hasStarted && (
              <>
                <h2 className="glitch text-3xl font-pixel text-white mb-8 uppercase" data-text="THREAD_SUSPENDED">
                  THREAD_SUSPENDED
                </h2>
                <button
                  onClick={() => setIsPaused(false)}
                  className="px-6 py-4 bg-black border-2 border-white text-white font-pixel text-sm hover:bg-white hover:text-black transition-colors cursor-pointer screen-tear"
                >
                  [ RESUME_EXECUTION ]
                </button>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="text-neon-cyan text-xl font-terminal flex gap-4 uppercase">
        <span><kbd className="bg-black px-2 py-1 border border-neon-cyan">WASD</kbd> / <kbd className="bg-black px-2 py-1 border border-neon-cyan">ARROWS</kbd> : MOVE</span>
        <span><kbd className="bg-black px-2 py-1 border border-neon-magenta text-neon-magenta">SPACE</kbd> : HALT</span>
      </div>
    </div>
  );
}
