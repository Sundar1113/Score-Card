import { useState, useEffect } from "react";
import { soundFx } from "../utils/soundEffects";

const DICE_DOT_LAYOUTS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export default function GameTools({ players = [], isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("dice"); // 'dice' | 'coin' | 'timer' | 'picker'

  // Dice State
  const [diceCount, setDiceCount] = useState(1);
  const [diceValues, setDiceValues] = useState([1]);
  const [isRolling, setIsRolling] = useState(false);

  // Coin State
  const [coinResult, setCoinResult] = useState("HEADS");
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinStats, setCoinStats] = useState({ heads: 0, tails: 0 });

  // Timer State
  const [timerDuration, setTimerDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Random Picker State
  const [pickedPlayer, setPickedPlayer] = useState(null);
  const [isPicking, setIsPicking] = useState(false);

  // Dice Roll Handler
  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    soundFx.playDiceRoll();

    let rolls = 0;
    const interval = setInterval(() => {
      setDiceValues(Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1));
      rolls++;
      if (rolls > 8) {
        clearInterval(interval);
        setIsRolling(false);
        soundFx.playSuccess();
      }
    }, 60);
  };

  const handleDiceCountChange = (count) => {
    setDiceCount(count);
    setDiceValues(Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1));
  };

  // Coin Flip Handler
  const flipCoin = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    soundFx.playCoinFlip();

    setTimeout(() => {
      const result = Math.random() > 0.5 ? "HEADS" : "TAILS";
      setCoinResult(result);
      setCoinStats((prev) => ({
        heads: result === "HEADS" ? prev.heads + 1 : prev.heads,
        tails: result === "TAILS" ? prev.tails + 1 : prev.tails,
      }));
      setIsFlipping(false);
      soundFx.playSuccess();
    }, 700);
  };

  // Timer Effect
  useEffect(() => {
    let timer = null;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 4 && prev > 1) {
            soundFx.playClick();
          }
          if (prev <= 1) {
            soundFx.playTimerBuzzer();
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  const resetTimer = (sec = timerDuration) => {
    setIsTimerRunning(false);
    setTimeLeft(sec);
    setTimerDuration(sec);
  };

  // Random Player Picker
  const pickRandomPlayer = () => {
    if (isPicking || players.length === 0) return;
    setIsPicking(true);
    soundFx.playDiceRoll();

    let count = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * players.length);
      setPickedPlayer(players[randomIdx].name);
      count++;
      if (count > 12) {
        clearInterval(interval);
        setIsPicking(false);
        soundFx.playSuccess();
      }
    }, 70);
  };

  if (!isOpen) return null;

  return (
    <div className="gt-overlay" onClick={onClose}>
      <div className="gt-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="gt-header">
          <div className="gt-title-box">
            <span className="gt-badge-icon">⚡</span>
            <div>
              <h3 className="gt-title">Game Tools Companion</h3>
              <p className="gt-subtitle">Handy interactive tools for live gameplay</p>
            </div>
          </div>
          <button className="gt-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Navigation Tabs */}
        <div className="gt-tabs">
          <button
            className={`gt-tab ${activeTab === "dice" ? "gt-tab-active" : ""}`}
            onClick={() => { setActiveTab("dice"); soundFx.playClick(); }}
          >
            🎲 Dice Roller
          </button>
          <button
            className={`gt-tab ${activeTab === "coin" ? "gt-tab-active" : ""}`}
            onClick={() => { setActiveTab("coin"); soundFx.playClick(); }}
          >
            🪙 Coin Flip
          </button>
          <button
            className={`gt-tab ${activeTab === "timer" ? "gt-tab-active" : ""}`}
            onClick={() => { setActiveTab("timer"); soundFx.playClick(); }}
          >
            ⏱️ Turn Timer
          </button>
          <button
            className={`gt-tab ${activeTab === "picker" ? "gt-tab-active" : ""}`}
            onClick={() => { setActiveTab("picker"); soundFx.playClick(); }}
          >
            🎡 Turn Picker
          </button>
        </div>

        {/* Tab Content */}
        <div className="gt-body">
          {/* TAB 1: DICE ROLLER */}
          {activeTab === "dice" && (
            <div className="gt-content-center">
              <div className="gt-subnav">
                <span className="gt-label">Number of Dice:</span>
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    className={`gt-chip ${diceCount === num ? "gt-chip-active" : ""}`}
                    onClick={() => handleDiceCountChange(num)}
                  >
                    {num} {num === 1 ? "Die" : "Dice"}
                  </button>
                ))}
              </div>

              <div className="gt-dice-arena">
                {diceValues.map((val, idx) => (
                  <div key={idx} className={`gt-die ${isRolling ? "gt-die-rolling" : ""}`}>
                    <div className="gt-die-face">
                      {Array.from({ length: 9 }).map((_, dotIdx) => (
                        <div
                          key={dotIdx}
                          className={`gt-die-dot ${
                            DICE_DOT_LAYOUTS[val]?.includes(dotIdx) ? "gt-dot-visible" : ""
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="gt-total-badge">
                Total: <span>{diceValues.reduce((a, b) => a + b, 0)}</span>
              </div>

              <button
                className="btn btn-primary gt-action-btn"
                onClick={rollDice}
                disabled={isRolling}
              >
                {isRolling ? "Rolling..." : "Roll Dice 🎲"}
              </button>
            </div>
          )}

          {/* TAB 2: COIN FLIP */}
          {activeTab === "coin" && (
            <div className="gt-content-center">
              <div className="gt-coin-arena">
                <div className={`gt-coin ${isFlipping ? "gt-coin-flipping" : ""} ${coinResult === "TAILS" ? "gt-coin-tails" : ""}`}>
                  <div className="gt-coin-front">
                    <span>👑</span>
                    <small>HEADS</small>
                  </div>
                  <div className="gt-coin-back">
                    <span>🪙</span>
                    <small>TAILS</small>
                  </div>
                </div>
              </div>

              <div className="gt-coin-result-banner">
                Result: <strong>{coinResult}</strong>
              </div>

              <div className="gt-coin-stats">
                <span>Heads: <strong>{coinStats.heads}</strong></span>
                <span>•</span>
                <span>Tails: <strong>{coinStats.tails}</strong></span>
              </div>

              <button
                className="btn btn-primary gt-action-btn"
                onClick={flipCoin}
                disabled={isFlipping}
              >
                {isFlipping ? "Flipping..." : "Flip Coin 🪙"}
              </button>
            </div>
          )}

          {/* TAB 3: TURN TIMER */}
          {activeTab === "timer" && (
            <div className="gt-content-center">
              <div className="gt-subnav">
                {[15, 30, 45, 60, 90, 120].map((sec) => (
                  <button
                    key={sec}
                    className={`gt-chip ${timerDuration === sec ? "gt-chip-active" : ""}`}
                    onClick={() => resetTimer(sec)}
                  >
                    {sec}s
                  </button>
                ))}
              </div>

              <div className={`gt-timer-display ${timeLeft <= 5 && timeLeft > 0 ? "gt-timer-alert" : ""}`}>
                <div className="gt-timer-circle">
                  <span className="gt-timer-number">{timeLeft}</span>
                  <span className="gt-timer-unit">SECONDS</span>
                </div>
              </div>

              <div className="gt-timer-controls">
                <button
                  className={`btn ${isTimerRunning ? "btn-danger" : "btn-success"}`}
                  style={{ minWidth: "120px" }}
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                >
                  {isTimerRunning ? "Pause ⏸" : "Start ▶"}
                </button>
                <button className="btn btn-secondary" onClick={() => resetTimer()}>
                  Reset 🔄
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: RANDOM TURN PICKER */}
          {activeTab === "picker" && (
            <div className="gt-content-center">
              <p className="gt-hint">
                {players.length > 0
                  ? "Randomly choose who goes first or takes the next turn!"
                  : "Add players to the game first to use the turn picker."}
              </p>

              <div className="gt-picker-card">
                {pickedPlayer ? (
                  <div className="gt-picker-chosen">
                    <span className="gt-picker-crown">👑</span>
                    <h4 className="gt-picker-name">{pickedPlayer}</h4>
                    <span className="gt-picker-tag">Selected to Play!</span>
                  </div>
                ) : (
                  <div className="gt-picker-placeholder">
                    <span>❓</span>
                    <p>Press Draw to choose a player</p>
                  </div>
                )}
              </div>

              <button
                className="btn btn-primary gt-action-btn"
                onClick={pickRandomPlayer}
                disabled={isPicking || players.length === 0}
              >
                {isPicking ? "Selecting..." : "Draw Player 🎡"}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .gt-overlay {
          position: fixed; inset: 0; background: rgba(5, 4, 15, 0.78);
          backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center;
          z-index: 999; padding: 16px;
        }
        .gt-modal {
          background: var(--surface); border: 1px solid rgba(108,99,255,0.3);
          border-radius: 20px; width: 100%; max-width: 480px; box-shadow: 0 16px 40px rgba(0,0,0,0.6);
          overflow: hidden; animation: popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .gt-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; border-bottom: 1px solid var(--border);
          background: rgba(26, 25, 51, 0.6);
        }
        .gt-title-box { display: flex; align-items: center; gap: 12px; }
        .gt-badge-icon {
          width: 38px; height: 38px; border-radius: 10px; background: rgba(108,99,255,0.2);
          display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
        }
        .gt-title { font-size: 1.1rem; font-weight: 800; color: var(--text); }
        .gt-subtitle { font-size: 0.78rem; color: var(--text-muted); }
        .gt-close-btn {
          background: transparent; border: none; color: var(--text-muted);
          font-size: 1.2rem; cursor: pointer; padding: 6px; border-radius: 8px;
        }
        .gt-close-btn:hover { color: var(--text); background: rgba(255,255,255,0.1); }
        .gt-tabs {
          display: flex; overflow-x: auto; background: var(--bg2);
          border-bottom: 1px solid var(--border); padding: 4px; gap: 4px;
        }
        .gt-tab {
          flex: 1; min-width: 90px; padding: 10px 8px; border: none; background: transparent;
          color: var(--text-muted); font-size: 0.8rem; font-weight: 700; border-radius: 8px;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .gt-tab-active {
          background: var(--surface2); color: var(--primary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .gt-body { padding: 24px 20px; }
        .gt-content-center { display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .gt-subnav { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: center; }
        .gt-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }
        .gt-chip {
          padding: 6px 12px; border-radius: 20px; background: var(--bg2); border: 1px solid var(--border);
          color: var(--text-muted); font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
        }
        .gt-chip-active { background: var(--primary); color: white; border-color: var(--primary); }
        .gt-dice-arena { display: flex; gap: 16px; margin: 16px 0; perspective: 600px; }
        .gt-die {
          width: 72px; height: 72px; background: #fffffe; border-radius: 14px;
          box-shadow: 0 8px 18px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.8);
          display: flex; align-items: center; justify-content: center; padding: 8px;
          transition: transform 0.1s;
        }
        .gt-die-rolling { animation: dieSpin 0.3s infinite linear; }
        @keyframes dieSpin {
          0% { transform: rotate(0deg) scale(0.9); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(0.9); }
        }
        .gt-die-face {
          display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr);
          width: 100%; height: 100%; gap: 4px;
        }
        .gt-die-dot { width: 10px; height: 10px; border-radius: 50%; background: transparent; margin: auto; }
        .gt-dot-visible { background: #1a1933; box-shadow: inset 0 1px 2px rgba(0,0,0,0.6); }
        .gt-total-badge {
          font-size: 1rem; color: var(--text-muted); font-weight: 600;
        }
        .gt-total-badge span { font-size: 1.4rem; font-weight: 900; color: var(--primary); margin-left: 6px; }
        .gt-action-btn { width: 100%; max-width: 280px; padding: 14px; font-size: 1rem; }
        
        /* Coin */
        .gt-coin-arena { margin: 16px 0; perspective: 1000px; }
        .gt-coin {
          width: 110px; height: 110px; position: relative; transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.4, 2, 0.4, 1);
        }
        .gt-coin-flipping { animation: coinSpin 0.7s cubic-bezier(0.1, 0.8, 0.3, 1) infinite; }
        @keyframes coinSpin {
          0% { transform: rotateX(0deg); }
          100% { transform: rotateX(1080deg); }
        }
        .gt-coin-tails { transform: rotateY(180deg); }
        .gt-coin-front, .gt-coin-back {
          position: absolute; inset: 0; border-radius: 50%;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          backface-visibility: hidden; font-weight: 800;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5), inset 0 0 0 6px #d4af37, inset 0 0 12px rgba(0,0,0,0.3);
        }
        .gt-coin-front {
          background: linear-gradient(135deg, #FFE066, #FFB800); color: #734e00;
        }
        .gt-coin-back {
          background: linear-gradient(135deg, #E0E0E0, #9E9E9E); color: #333;
          transform: rotateY(180deg); box-shadow: 0 8px 24px rgba(0,0,0,0.5), inset 0 0 0 6px #BDBDBD, inset 0 0 12px rgba(0,0,0,0.3);
        }
        .gt-coin-front span, .gt-coin-back span { font-size: 2.2rem; }
        .gt-coin-front small, .gt-coin-back small { font-size: 0.75rem; letter-spacing: 1px; font-weight: 900; }
        .gt-coin-result-banner { font-size: 1.1rem; color: var(--text-muted); }
        .gt-coin-result-banner strong { color: var(--gold); font-size: 1.3rem; }
        .gt-coin-stats { display: flex; gap: 10px; font-size: 0.82rem; color: var(--text-muted); }

        /* Timer */
        .gt-timer-display {
          margin: 12px 0;
        }
        .gt-timer-circle {
          width: 140px; height: 140px; border-radius: 50%;
          background: radial-gradient(circle, var(--bg2) 0%, var(--surface2) 100%);
          border: 4px solid var(--primary); display: flex; flex-direction: column;
          align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(108,99,255,0.3);
        }
        .gt-timer-alert .gt-timer-circle {
          border-color: var(--secondary); animation: pulse 0.5s infinite;
        }
        .gt-timer-number { font-size: 3rem; font-weight: 900; color: var(--text); line-height: 1; }
        .gt-timer-unit { font-size: 0.65rem; color: var(--text-muted); font-weight: 700; letter-spacing: 1.5px; margin-top: 4px; }
        .gt-timer-controls { display: flex; gap: 12px; }

        /* Picker */
        .gt-hint { font-size: 0.85rem; color: var(--text-muted); text-align: center; }
        .gt-picker-card {
          width: 100%; padding: 28px 16px; background: var(--bg2);
          border: 2px dashed rgba(108,99,255,0.3); border-radius: 16px; text-align: center;
        }
        .gt-picker-crown { font-size: 2.4rem; display: block; margin-bottom: 6px; animation: float 2s infinite ease-in-out; }
        .gt-picker-name { font-size: 1.6rem; font-weight: 800; color: var(--gold); }
        .gt-picker-tag { font-size: 0.75rem; color: var(--success); text-transform: uppercase; font-weight: 700; letter-spacing: 1px; }
        .gt-picker-placeholder { color: var(--text-muted); }
        .gt-picker-placeholder span { font-size: 2rem; display: block; margin-bottom: 4px; opacity: 0.5; }
      `}</style>
    </div>
  );
}
