import { useState } from "react";

const COLORS = ["#6c63ff","#ff6584","#43d9ad","#ffc75f","#00c9ff","#ff9f43","#ee5a24","#0652dd","#9980FA","#833471","#1289A7","#C4E538"];

export default function PlayerSetup({ gameName, onNext, onBack }) {
  const [count, setCount] = useState(2);
  const [names, setNames] = useState(["Player 1", "Player 2"]);

  const changeCount = (n) => {
    n = Math.max(2, Math.min(12, n));
    setCount(n);
    setNames((prev) => {
      const arr = [...prev];
      while (arr.length < n) arr.push("Player " + (arr.length + 1));
      return arr.slice(0, n);
    });
  };

  const setName = (i, v) => setNames((prev) => { const a = [...prev]; a[i] = v; return a; });

  const submit = (e) => {
    e.preventDefault();
    const trimmed = names.map((n, i) => n.trim() || "Player " + (i + 1));
    if (new Set(trimmed).size < trimmed.length) { alert("Player names must be unique!"); return; }
    onNext(trimmed);
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"6px" }}>
        <h2 className="section-title" style={{ margin:0 }}>👥 Players</h2>
        <span className="badge badge-game">{gameName}</span>
      </div>
      <p className="section-subtitle">Set the number of players and their names</p>
      <form onSubmit={submit}>
        <div className="form-group">
          <label className="form-label">Number of Players</label>
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <button type="button" className="btn btn-secondary"
              style={{ padding:"8px 16px", fontSize:"1.2rem" }}
              onClick={() => changeCount(count - 1)} disabled={count <= 2}>−</button>
            <span style={{ fontSize:"1.8rem", fontWeight:"800", minWidth:"40px", textAlign:"center" }}>{count}</span>
            <button type="button" className="btn btn-secondary"
              style={{ padding:"8px 16px", fontSize:"1.2rem" }}
              onClick={() => changeCount(count + 1)} disabled={count >= 12}>+</button>
            <span style={{ color:"var(--text-muted)", fontSize:"0.85rem" }}>2 – 12 players</span>
          </div>
        </div>

        <label className="form-label" style={{ marginBottom:"12px" }}>Player Names</label>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:"12px", marginBottom:"8px" }}>
          {names.map((name, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:COLORS[i%COLORS.length], display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"800", fontSize:"0.9rem", color:"white", flexShrink:0 }}>
                {name.trim() ? name.trim()[0].toUpperCase() : i+1}
              </div>
              <input className="form-input" style={{ flex:1 }} value={name}
                onChange={(e) => setName(i, e.target.value)}
                placeholder={"Player " + (i+1)} maxLength={20} />
            </div>
          ))}
        </div>

        <div className="btn-row">
          <button type="button" className="btn btn-secondary" onClick={onBack}>← Back</button>
          <button type="submit" className="btn btn-primary">Start Game →</button>
        </div>
      </form>
    </div>
  );
}