import { useState } from "react";
import { soundFx } from "../utils/soundEffects";

const FLOATING_ICONS = ["🎲", "🃏", "🏆", "🎯", "🎮", "♟️", "🎳", "🀄", "🎰", "🎪"];

export default function GameSetup({ onNext, initialGameName = "", initialWinRule = "highest" }) {
  const [gameName, setGameName] = useState(initialGameName);
  const [winRule, setWinRule] = useState(initialWinRule); // 'highest' | 'lowest'
  const [targetScore, setTargetScore] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (gameName.trim()) {
      soundFx.playSuccess();
      onNext({
        gameName: gameName.trim(),
        winRule,
        targetScore: targetScore ? Number(targetScore) : null,
      });
    }
  };

  return (
    <div className="gs-root">
      {/* Floating ambient background elements */}
      <div className="gs-floaters" aria-hidden="true">
        {FLOATING_ICONS.map((icon, i) => (
          <span
            key={i}
            className="gs-float-icon"
            style={{ "--delay": `${i * 0.6}s`, "--x": `${6 + i * 9.5}%` }}
          >
            {icon}
          </span>
        ))}
      </div>

      <div className="gs-content">
        <div className="gs-hero">
          <div className="gs-trophy-ring">
            <span className="gs-trophy">🏆</span>
          </div>
          <h2 className="gs-title">Name Your Game</h2>
          <p className="gs-subtitle">Enter the custom game name your group is playing</p>
        </div>

        <form onSubmit={handleSubmit} className="gs-form">
          {/* Custom Game Name Input - strictly typed by user, no autocomplete suggestions */}
          <div className="form-group">
            <label className="form-label">Custom Game Title</label>
            <div className={`gs-input-wrap ${focused ? "gs-input-focused" : ""}`}>
              <span className="gs-input-icon">🎮</span>
              <input
                className="gs-input"
                type="text"
                placeholder="Type your game name (e.g. Ludo, Catan, Uno, Rummy...)"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                onFocus={() => { setFocused(true); soundFx.playClick(); }}
                onBlur={() => setFocused(false)}
                autoFocus
                maxLength={40}
                autoComplete="off"
              />
              {gameName && (
                <button
                  type="button"
                  className="gs-clear"
                  onClick={() => { setGameName(""); soundFx.playClick(); }}
                  title="Clear input"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Win Rule Selection */}
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label className="form-label">Win Condition</label>
            <div className="gs-rule-toggle-grid">
              <button
                type="button"
                className={`gs-rule-card ${winRule === "highest" ? "gs-rule-active" : ""}`}
                onClick={() => { setWinRule("highest"); soundFx.playClick(); }}
              >
                <span className="gs-rule-icon">📈</span>
                <div>
                  <div className="gs-rule-name">Highest Score Wins</div>
                  <div className="gs-rule-desc">Standard (Points, Board Games, Trivia)</div>
                </div>
              </button>

              <button
                type="button"
                className={`gs-rule-card ${winRule === "lowest" ? "gs-rule-active" : ""}`}
                onClick={() => { setWinRule("lowest"); soundFx.playClick(); }}
              >
                <span className="gs-rule-icon">📉</span>
                <div>
                  <div className="gs-rule-name">Lowest Score Wins</div>
                  <div className="gs-rule-desc">Golf, Uno, Penalty point games</div>
                </div>
              </button>
            </div>
          </div>

          {/* Optional Target / Cap Points */}
          <div className="form-group" style={{ marginBottom: "24px" }}>
            <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Target Winning Score <small style={{ textTransform: "none", color: "var(--text-muted)" }}>(Optional)</small></span>
            </label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g. 100 points (leave blank for unlimited)"
              value={targetScore}
              onChange={(e) => setTargetScore(e.target.value)}
              style={{ maxWidth: "320px" }}
            />
          </div>

          {gameName.trim() && (
            <div className="gs-preview">
              Ready to track: <strong>{gameName.trim()}</strong> ·{" "}
              <span style={{ color: "var(--gold)" }}>
                {winRule === "highest" ? "High Score Wins" : "Low Score Wins"}
              </span>
            </div>
          )}

          <button
            type="submit"
            className={`gs-btn ${gameName.trim() ? "gs-btn-ready" : ""}`}
            disabled={!gameName.trim()}
          >
            {gameName.trim() ? "Next: Setup Players 👥 →" : "Type Game Name to Continue"}
          </button>
        </form>

        <div className="gs-tip">
          <span>✨</span>
          <span>
            ScoreBoard Pro lets you record multi-round scores with manual typing, live standing updates, and automated championship podiums!
          </span>
        </div>
      </div>

      <style>{`
        .gs-root { position: relative; overflow: hidden; min-height: 380px; }
        .gs-floaters { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
        .gs-float-icon {
          position: absolute; bottom: -40px; left: var(--x);
          font-size: 1.6rem; opacity: 0.08;
          animation: gsFloat 6s ease-in-out var(--delay, 0s) infinite;
        }
        @keyframes gsFloat {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.08; }
          90% { opacity: 0.08; }
          100% { transform: translateY(-460px) rotate(360deg); opacity: 0; }
        }
        .gs-content { position: relative; z-index: 1; }
        .gs-hero { text-align: center; margin-bottom: 28px; }
        .gs-trophy-ring {
          display: inline-flex; align-items: center; justify-content: center;
          width: 80px; height: 80px; border-radius: 50%;
          background: linear-gradient(135deg, rgba(108,99,255,0.25), rgba(255,101,132,0.25));
          border: 2px solid rgba(108,99,255,0.4);
          margin-bottom: 14px;
          animation: ringPulse 3s ease-in-out infinite;
        }
        @keyframes ringPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(108,99,255,0.4); }
          50% { box-shadow: 0 0 0 16px rgba(108,99,255,0); }
        }
        .gs-trophy { font-size: 2.5rem; animation: float 3s ease-in-out infinite; }
        .gs-title {
          font-size: 1.9rem; font-weight: 800; margin-bottom: 6px;
          background: linear-gradient(135deg, #fff, #a7a9be);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .gs-subtitle { color: var(--text-muted); font-size: 0.95rem; }
        .gs-form { display: flex; flex-direction: column; gap: 14px; }
        .gs-input-wrap {
          display: flex; align-items: center; gap: 12px;
          background: var(--bg2); border: 2px solid var(--border);
          border-radius: 14px; padding: 4px 16px 4px 12px;
          transition: all 0.3s;
        }
        .gs-input-focused {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(108,99,255,0.2);
        }
        .gs-input-icon { font-size: 1.3rem; flex-shrink: 0; }
        .gs-input {
          flex: 1; background: transparent; border: none; outline: none;
          color: var(--text); font-size: 1.1rem; padding: 14px 0;
          font-family: inherit; font-weight: 600;
        }
        .gs-input::placeholder { color: var(--text-muted); opacity: 0.5; font-weight: 400; }
        .gs-clear {
          background: none; border: none; color: var(--text-muted);
          cursor: pointer; font-size: 1rem; padding: 6px; border-radius: 50%;
          transition: all 0.2s; display: flex; align-items: center; justify-content: center;
        }
        .gs-clear:hover { background: rgba(255,101,132,0.2); color: var(--secondary); }
        .gs-rule-toggle-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
        }
        .gs-rule-card {
          display: flex; align-items: center; gap: 10px; padding: 12px 14px;
          background: var(--bg2); border: 1px solid var(--border); border-radius: 12px;
          cursor: pointer; text-align: left; transition: all 0.2s;
        }
        .gs-rule-card:hover { border-color: rgba(108,99,255,0.4); }
        .gs-rule-active {
          border-color: var(--primary); background: rgba(108,99,255,0.12);
          box-shadow: 0 0 12px rgba(108,99,255,0.2);
        }
        .gs-rule-icon { font-size: 1.4rem; }
        .gs-rule-name { font-size: 0.85rem; font-weight: 700; color: var(--text); }
        .gs-rule-desc { font-size: 0.72rem; color: var(--text-muted); }
        .gs-preview {
          text-align: center; padding: 10px 16px;
          background: rgba(108,99,255,0.12); border-radius: 10px;
          border: 1px solid rgba(108,99,255,0.25); font-size: 0.9rem;
          color: var(--text-muted); animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .gs-btn {
          width: 100%; padding: 16px; border-radius: 14px; border: none;
          font-size: 1.05rem; font-weight: 700; cursor: pointer; transition: all 0.3s;
          background: var(--surface2); color: var(--text-muted); margin-top: 4px;
        }
        .gs-btn-ready {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white; box-shadow: 0 6px 24px rgba(108,99,255,0.4);
        }
        .gs-btn-ready:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(108,99,255,0.5); }
        .gs-btn:disabled { cursor: not-allowed; }
        .gs-tip {
          display: flex; gap: 8px; align-items: flex-start; margin-top: 22px;
          padding: 12px 16px; background: rgba(255,199,95,0.08);
          border-radius: 10px; border: 1px solid rgba(255,199,95,0.2);
          font-size: 0.82rem; color: var(--text-muted); line-height: 1.4;
        }
        @media (max-width: 540px) {
          .gs-rule-toggle-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}