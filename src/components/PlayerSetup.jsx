import { useState } from "react";
import { soundFx } from "../utils/soundEffects";

const AVATAR_OPTIONS = ["🦁", "🐯", "🐺", "🦊", "🐉", "🦄", "🐼", "🥷", "🤖", "🧙", "👑", "⚡", "🔥", "🚀", "🎯", "🌟", "👾", "💎"];
const COLOR_OPTIONS = [
  "#6c63ff", "#ff6584", "#43d9ad", "#ffc75f", "#00c9ff",
  "#ff9f43", "#ee5a24", "#0652dd", "#9980FA", "#833471",
  "#1289A7", "#A3CB38", "#ED4C67", "#1BCA9B", "#F79F1F", "#B53471"
];

export default function PlayerSetup({ gameName, winRule, targetScore, onNext, onBack, initialPlayers = [] }) {
  const [players, setPlayers] = useState(() => {
    if (initialPlayers.length >= 2) {
      return initialPlayers.map((p, i) => ({
        name: p.name || `Player ${i + 1}`,
        avatar: p.avatar || AVATAR_OPTIONS[i % AVATAR_OPTIONS.length],
        color: p.color || COLOR_OPTIONS[i % COLOR_OPTIONS.length],
      }));
    }
    return [
      { name: "Player 1", avatar: "🦁", color: COLOR_OPTIONS[0] },
      { name: "Player 2", avatar: "🐯", color: COLOR_OPTIONS[1] },
    ];
  });

  const [activeAvatarIndex, setActiveAvatarIndex] = useState(null);

  const changeCount = (targetCount) => {
    targetCount = Math.max(2, Math.min(16, targetCount));
    soundFx.playClick();
    setPlayers((prev) => {
      const arr = [...prev];
      while (arr.length < targetCount) {
        const nextIdx = arr.length;
        arr.push({
          name: `Player ${nextIdx + 1}`,
          avatar: AVATAR_OPTIONS[nextIdx % AVATAR_OPTIONS.length],
          color: COLOR_OPTIONS[nextIdx % COLOR_OPTIONS.length],
        });
      }
      return arr.slice(0, targetCount);
    });
  };

  const updatePlayer = (index, field, value) => {
    setPlayers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = players.map((p, i) => ({
      ...p,
      name: p.name.trim() || `Player ${i + 1}`,
    }));

    // Validate unique names
    const namesSet = new Set(trimmed.map((p) => p.name.toLowerCase()));
    if (namesSet.size < trimmed.length) {
      alert("Each player must have a unique name!");
      return;
    }

    soundFx.playSuccess();
    onNext(trimmed);
  };

  return (
    <div className="ps-root">
      {/* Header Info */}
      <div className="ps-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <h2 className="section-title" style={{ margin: 0 }}>👥 Players Setup</h2>
          <span className="badge badge-game">{gameName}</span>
          <span className="badge badge-primary">
            {winRule === "highest" ? "📈 High Score" : "📉 Low Score"}
          </span>
          {targetScore && <span className="badge badge-primary">Target: {targetScore} pts</span>}
        </div>
        <p className="section-subtitle" style={{ marginBottom: "20px", marginTop: "4px" }}>
          Configure group players, customized avatars, and team colors.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Player Count Controls */}
        <div className="ps-count-bar">
          <label className="form-label" style={{ margin: 0 }}>Total Players</label>
          <div className="ps-stepper">
            <button
              type="button"
              className="ps-step-btn"
              onClick={() => changeCount(players.length - 1)}
              disabled={players.length <= 2}
            >
              −
            </button>
            <span className="ps-count-display">{players.length}</span>
            <button
              type="button"
              className="ps-step-btn"
              onClick={() => changeCount(players.length + 1)}
              disabled={players.length >= 16}
            >
              +
            </button>
            <span className="ps-limit-hint">(2 to 16 players)</span>
          </div>
        </div>

        {/* Players Grid */}
        <div className="ps-grid">
          {players.map((p, idx) => (
            <div key={idx} className="ps-player-card" style={{ borderColor: p.color }}>
              {/* Avatar Selector Button */}
              <div className="ps-avatar-wrap">
                <button
                  type="button"
                  className="ps-avatar-btn"
                  style={{ background: p.color }}
                  onClick={() => {
                    soundFx.playClick();
                    setActiveAvatarIndex(activeAvatarIndex === idx ? null : idx);
                  }}
                  title="Click to change avatar icon"
                >
                  <span className="ps-avatar-emoji">{p.avatar}</span>
                </button>

                {/* Avatar Picker Dropdown */}
                {activeAvatarIndex === idx && (
                  <div className="ps-avatar-popover">
                    <div className="ps-avatar-pop-title">Pick Avatar Emoji:</div>
                    <div className="ps-emoji-grid">
                      {AVATAR_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          className={`ps-emoji-choice ${p.avatar === emoji ? "ps-emoji-selected" : ""}`}
                          onClick={() => {
                            updatePlayer(idx, "avatar", emoji);
                            setActiveAvatarIndex(null);
                            soundFx.playClick();
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Player Name Input */}
              <div className="ps-input-area">
                <span className="ps-player-tag">Player #{idx + 1}</span>
                <input
                  className="form-input ps-name-input"
                  type="text"
                  placeholder={`Player ${idx + 1}`}
                  value={p.name}
                  onChange={(e) => updatePlayer(idx, "name", e.target.value)}
                  maxLength={24}
                  autoComplete="off"
                />
              </div>

              {/* Color Swatch Picker */}
              <div className="ps-color-swatches">
                {COLOR_OPTIONS.slice(0, 5).map((col) => (
                  <button
                    key={col}
                    type="button"
                    className={`ps-swatch ${p.color === col ? "ps-swatch-active" : ""}`}
                    style={{ background: col }}
                    onClick={() => {
                      updatePlayer(idx, "color", col);
                      soundFx.playClick();
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="btn-row" style={{ marginTop: "28px" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => { soundFx.playClick(); onBack(); }}
          >
            ← Change Game
          </button>
          <button type="submit" className="btn btn-primary" style={{ minWidth: "180px" }}>
            Start Scoring 🚀 →
          </button>
        </div>
      </form>

      <style>{`
        .ps-root { position: relative; }
        .ps-count-bar {
          display: flex; align-items: center; justify-content: space-between;
          background: var(--bg2); border: 1px solid var(--border); border-radius: 12px;
          padding: 12px 18px; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
        }
        .ps-stepper { display: flex; align-items: center; gap: 12px; }
        .ps-step-btn {
          width: 36px; height: 36px; border-radius: 8px; background: var(--surface2);
          border: 1px solid var(--border); color: var(--text); font-size: 1.2rem;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-weight: 700; transition: all 0.2s;
        }
        .ps-step-btn:hover:not(:disabled) { background: var(--primary); color: white; border-color: var(--primary); }
        .ps-step-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .ps-count-display { font-size: 1.6rem; font-weight: 900; color: var(--primary); min-width: 36px; text-align: center; }
        .ps-limit-hint { font-size: 0.8rem; color: var(--text-muted); }
        .ps-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 14px;
        }
        .ps-player-card {
          background: var(--bg2); border: 1px solid var(--border); border-left-width: 4px;
          border-radius: 14px; padding: 14px; display: flex; align-items: center; gap: 12px;
          position: relative; transition: transform 0.2s;
        }
        .ps-player-card:hover { transform: translateY(-2px); }
        .ps-avatar-wrap { position: relative; }
        .ps-avatar-btn {
          width: 46px; height: 46px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3);
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3); transition: transform 0.2s;
        }
        .ps-avatar-btn:hover { transform: scale(1.1); }
        .ps-avatar-emoji { font-size: 1.4rem; }
        .ps-avatar-popover {
          position: absolute; top: calc(100% + 8px); left: 0;
          background: var(--surface2); border: 1px solid var(--border);
          border-radius: 12px; padding: 10px; z-index: 100;
          box-shadow: 0 10px 25px rgba(0,0,0,0.6); width: 220px;
        }
        .ps-avatar-pop-title { font-size: 0.72rem; color: var(--text-muted); margin-bottom: 8px; font-weight: 700; text-transform: uppercase; }
        .ps-emoji-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; }
        .ps-emoji-choice {
          background: transparent; border: 1px solid transparent; border-radius: 6px;
          font-size: 1.2rem; padding: 4px; cursor: pointer; transition: all 0.15s;
        }
        .ps-emoji-choice:hover { background: rgba(108,99,255,0.2); }
        .ps-emoji-selected { background: var(--primary); border-color: var(--primary); }
        .ps-input-area { flex: 1; }
        .ps-player-tag { font-size: 0.68rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; display: block; margin-bottom: 3px; }
        .ps-name-input { padding: 8px 12px; font-size: 0.95rem; }
        .ps-color-swatches { display: flex; flex-direction: column; gap: 4px; }
        .ps-swatch {
          width: 14px; height: 14px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2);
          cursor: pointer; transition: transform 0.15s;
        }
        .ps-swatch:hover { transform: scale(1.3); }
        .ps-swatch-active { outline: 2px solid white; outline-offset: 1px; }
      `}</style>
    </div>
  );
}