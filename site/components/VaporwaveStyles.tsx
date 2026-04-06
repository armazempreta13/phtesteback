import React from 'react';

export const VaporwaveStyles = () => (
  <style>{`
    /* --- CRT & SCREEN EFFECTS --- */
    @keyframes turn-on {
      0% { transform: scale(1, 0.8) translate3d(0, 0, 0); filter: brightness(30); opacity: 1; }
      3.5% { transform: scale(1, 0.8) translate3d(0, 100%, 0); }
      3.6% { transform: scale(1, 0.8) translate3d(0, -100%, 0); opacity: 1; }
      9% { transform: scale(1.3, 0.6) translate3d(0, 100%, 0); opacity: 0; }
      11% { transform: scale(1, 1) translate3d(0, 0, 0); filter: contrast(0) brightness(0); opacity: 0; }
      100% { transform: scale(1, 1) translate3d(0, 0, 0); filter: contrast(1) brightness(1.1) saturate(1.1); opacity: 1; }
    }

    @keyframes flicker {
      0% { opacity: 0.97; }
      5% { opacity: 0.95; }
      10% { opacity: 0.9; }
      15% { opacity: 0.95; }
      20% { opacity: 0.99; }
      50% { opacity: 0.95; }
      80% { opacity: 0.93; }
      100% { opacity: 0.98; }
    }

    @keyframes text-glitch {
      0% { text-shadow: 2px 0 red, -2px 0 blue; transform: skewX(0deg); }
      2% { text-shadow: 2px 0 red, -2px 0 blue; transform: skewX(10deg); }
      4% { text-shadow: 2px 0 red, -2px 0 blue; transform: skewX(-10deg); }
      5% { text-shadow: none; transform: skewX(0deg); }
      100% { text-shadow: none; transform: skewX(0deg); }
    }

    .crt-container {
      animation: turn-on 3s linear;
      animation-fill-mode: forwards;
      background-color: #000;
    }

    .scanlines {
      background: linear-gradient(
        to bottom,
        rgba(255,255,255,0),
        rgba(255,255,255,0) 50%,
        rgba(0,0,0,0.1) 50%,
        rgba(0,0,0,0.1)
      );
      background-size: 100% 4px;
      animation: flicker 0.15s infinite;
      pointer-events: none;
    }

    .glitch-text {
      animation: text-glitch 3s infinite linear alternate-reverse;
    }

    /* --- BACKGROUND ELEMENTS --- */
    @keyframes grid-move {
      0% { transform: perspective(300px) rotateX(60deg) translateY(0); }
      100% { transform: perspective(300px) rotateX(60deg) translateY(50px); }
    }

    @keyframes sun-pulse {
      0% { box-shadow: 0 0 40px var(--sun-glow), 0 0 80px var(--sun-glow); transform: translateX(-50%) scale(1); }
      50% { box-shadow: 0 0 60px var(--sun-glow), 0 0 100px var(--sun-glow); transform: translateX(-50%) scale(1.05); }
      100% { box-shadow: 0 0 40px var(--sun-glow), 0 0 80px var(--sun-glow); transform: translateX(-50%) scale(1); }
    }

    @keyframes cloud-drift {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100vw); }
    }

    @keyframes particle-rise {
      0% { transform: translateY(100vh) scale(0); opacity: 0; }
      20% { opacity: 0.8; }
      80% { opacity: 0.8; }
      100% { transform: translateY(-10vh) scale(1); opacity: 0; }
    }

    .vapor-grid {
      background-image: 
        linear-gradient(var(--grid-color) 1px, transparent 1px),
        linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
      background-size: 50px 50px;
      animation: grid-move 2s linear infinite;
    }

    .retro-cloud {
      position: absolute;
      background: linear-gradient(to right, transparent, rgba(255, 0, 255, 0.2), transparent);
      height: 2px;
      width: 200px;
      animation: cloud-drift 20s linear infinite;
      filter: blur(4px);
      box-shadow: 0 0 10px rgba(255, 0, 255, 0.4);
    }

    .cyber-particle {
      position: absolute;
      background: white;
      width: 2px;
      height: 2px;
      box-shadow: 0 0 5px cyan;
      animation: particle-rise 10s linear infinite;
    }

    /* --- WINDOW TRANSITIONS --- */
    @keyframes win-open {
      0% { transform: scale(0.95); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    
    .retro-window {
      animation: win-open 0.15s cubic-bezier(0, 0, 0.2, 1);
      box-shadow: 1px 1px 0 #000, 2px 2px 0 #000, 4px 4px 10px rgba(0,0,0,0.5);
    }

    /* --- SCROLLBARS --- */
    .retro-scrollbar::-webkit-scrollbar {
      width: 16px;
      background: #c0c0c0;
    }
    .retro-scrollbar::-webkit-scrollbar-thumb {
      background: #c0c0c0;
      border-top: 1px solid white;
      border-left: 1px solid white;
      border-right: 1px solid black;
      border-bottom: 1px solid black;
      box-shadow: inset 1px 1px 0 #dfdfdf;
    }
    .retro-scrollbar::-webkit-scrollbar-track {
      background: repeating-linear-gradient(
        45deg,
        #c0c0c0,
        #c0c0c0 2px,
        #dfdfdf 2px,
        #dfdfdf 4px
      );
    }

    /* --- UTILS --- */
    .win95-border {
      box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #000;
    }
    .win95-border-inverted {
      box-shadow: inset 1px 1px 0 #000, inset -1px -1px 0 #fff;
    }
    .win95-btn {
      box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #000, 1px 1px 0 #000;
    }
    .win95-btn:active {
      box-shadow: inset 1px 1px 0 #000, inset -1px -1px 0 #fff;
      transform: translate(1px, 1px);
    }
  `}</style>
);