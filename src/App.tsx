/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <div className="scanlines min-h-screen bg-dark-bg text-white font-terminal selection:bg-neon-magenta selection:text-black overflow-x-hidden">
      <div className="static-noise"></div>
      {/* Background decorative elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-50">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-magenta/20 blur-[150px] screen-tear"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-cyan/20 blur-[150px] screen-tear" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        <header className="text-center mb-12 mt-4">
          <h1 className="glitch text-5xl md:text-7xl font-pixel uppercase tracking-tighter" data-text="SNAKE.EXE">
            SNAKE.EXE
          </h1>
          <p className="text-neon-cyan mt-6 tracking-widest text-xl uppercase font-terminal screen-tear">
            [ NEURAL_LINK_ESTABLISHED // AWAITING_DIRECTIVE ]
          </p>
        </header>

        <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 max-w-6xl mx-auto w-full">
          {/* Game Section */}
          <div className="flex-1 w-full flex justify-center order-2 lg:order-1">
            <SnakeGame />
          </div>

          {/* Music Player Section */}
          <div className="w-full lg:w-96 flex-shrink-0 order-1 lg:order-2">
            <MusicPlayer />
          </div>
        </main>
        
        <footer className="mt-12 text-center text-neon-magenta text-lg font-terminal uppercase tracking-widest opacity-80">
          <p>VOID_PROTOCOL_ACTIVE // NO_ESCAPE</p>
        </footer>
      </div>
    </div>
  );
}
