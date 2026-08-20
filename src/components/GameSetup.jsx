import { useState } from "react";

const PRESETS = [
  { icon: "🃏", name: "Card Game" }, { icon: "🎲", name: "Board Game" },
  { icon: "♟️", name: "Chess" }, { icon: "🎳", name: "Bowling" },
  { icon: "🏓", name: "Table Tennis" }, { icon: "🎮", name: "Video Game" },
  { icon: "🎯", name: "Darts" }, { icon: "🀄", name: "Mahjong" },
];

export default function GameSetup({ onNext }) {
  const [gameName, setGameName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (gameName.trim()) onNext({ gameName: gameName.trim() });
  };

  return (
    <div>
      <h2 className="section-title">🎮 Game Setup</h2>
      <p className="section-subtitle">Enter or choose the game you are playing</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Game Name</label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. Uno, Ludo, Carrom..."
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            autoFocus
          />
        </div>
        <div style={{ marginBottom: "24px" }}>
          <div className="form-label" style={{ marginBottom: "12px" }}>Quick Pick</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(130px, 1fr))", gap:"10px" }}>
            {PRESETS.map((g) => (
              <button key={g.name} type="button"
                onClick={() => setGameName(g.name)}
                style={{
                  display:"flex", alignItems:"center", gap:"8px", padding:"10px 14px",
                  background: gameName === g.name ? "rgba(108,99,255,0.15)" : "var(--surface2)",
                  border: `1px solid ${gameName === g.name ? "var(--primary)" : "var(--border)"}`,
                  borderRadius:"10px",
                  color: gameName === g.name ? "var(--primary)" : "var(--text-muted)",
                  fontWeight: gameName === g.name ? 600 : 500,
                  fontSize:"0.85rem", cursor:"pointer", transition:"all 0.2s"
                }}>
                <span>{g.icon}</span><span>{g.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="btn-row">
          <button type="submit" className="btn btn-primary" disabled={!gameName.trim()}>
            Continue →
          </button>
        </div>
      </form>
    </div>
  );
}