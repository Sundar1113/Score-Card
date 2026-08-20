import { useState } from "react";

const COLORS = ["#6c63ff","#ff6584","#43d9ad","#ffc75f","#00c9ff","#ff9f43","#ee5a24","#0652dd","#9980FA","#833471","#1289A7","#C4E538"];

export default function ScoreEntry({ gameName, players, onFinish, onBack }) {
  const names = players.map((p) => p.name);
  const [rounds, setRounds] = useState([]);
  const [cur, setCur] = useState(Object.fromEntries(names.map((n) => [n, ""])));
  const [errors, setErrors] = useState({});
  const [confirm, setConfirm] = useState(false);

  const totals = () => {
    const t = Object.fromEntries(names.map((n) => [n, 0]));
    rounds.forEach((r) => r.scores.forEach(({ name, score }) => { t[name] += score; }));
    return t;
  };

  const validate = () => {
    const errs = {};
    names.forEach((n) => {
      if (cur[n] === "" || cur[n] === undefined) errs[n] = "Required";
      else if (isNaN(Number(cur[n]))) errs[n] = "Must be a number";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const addRound = () => {
    if (!validate()) return;
    const scores = names.map((n) => ({ name: n, score: Number(cur[n]) }));
    setRounds((prev) => [...prev, { round: prev.length + 1, scores }]);
    setCur(Object.fromEntries(names.map((n) => [n, ""])));
    setErrors({});
  };

  const t = totals();

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"6px" }}>
        <h2 className="section-title" style={{ margin:0 }}>📊 Score Entry</h2>
        <span className="badge badge-game">{gameName}</span>
        <span className="badge badge-primary">{rounds.length} Round{rounds.length!==1?"s":""}</span>
      </div>
      <p className="section-subtitle">Enter scores for each round. Press Add Round after each.</p>

      {/* Running totals */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:"10px", marginBottom:"24px", padding:"16px", background:"var(--bg2)", borderRadius:"12px", border:"1px solid var(--border)" }}>
        {names.map((n, i) => (
          <div key={n} style={{ display:"flex", alignItems:"center", gap:"8px", flex:1, minWidth:"100px" }}>
            <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:COLORS[i%COLORS.length], display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"800", fontSize:"0.8rem", color:"white", flexShrink:0 }}>
              {n[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>{n}</div>
              <div style={{ fontSize:"1.2rem", fontWeight:"800", color:"var(--primary)" }}>{t[n]}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Round */}
      <div style={{ background:"var(--bg2)", border:"1px solid rgba(108,99,255,0.3)", borderRadius:"12px", padding:"20px", marginBottom:"20px" }}>
        <div style={{ fontWeight:"700", color:"var(--primary)", marginBottom:"16px" }}>+ Round {rounds.length + 1}</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:"12px" }}>
          {names.map((n, i) => (
            <div key={n} style={{ display:"flex", alignItems:"flex-start", gap:"10px" }}>
              <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:COLORS[i%COLORS.length], display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"800", fontSize:"0.8rem", color:"white", flexShrink:0, marginTop:"24px" }}>
                {n[0].toUpperCase()}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"0.75rem", color:"var(--text-muted)", marginBottom:"4px", fontWeight:600 }}>{n}</div>
                <input className={"form-input" + (errors[n] ? " input-error" : "")}
                  type="number"
                  placeholder="Score"
                  value={cur[n]}
                  onChange={(e) => setCur((p) => ({ ...p, [n]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter") addRound(); }}
                  style={{ padding:"10px 12px" }} />
                {errors[n] && <div style={{ color:"var(--secondary)", fontSize:"0.75rem", marginTop:"4px" }}>{errors[n]}</div>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:"16px", display:"flex", justifyContent:"flex-end" }}>
          <button className="btn btn-primary" onClick={addRound}>Add Round ✓</button>
        </div>
      </div>

      {/* History table */}
      {rounds.length > 0 && (
        <div style={{ marginBottom:"20px", overflowX:"auto" }}>
          <div style={{ fontWeight:"700", color:"var(--text-muted)", fontSize:"0.9rem", marginBottom:"12px" }}>Round History</div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.9rem" }}>
            <thead>
              <tr>
                <th style={{ textAlign:"left", padding:"10px 12px", background:"var(--bg2)", color:"var(--text-muted)", fontSize:"0.78rem", textTransform:"uppercase", borderBottom:"1px solid var(--border)" }}>Round</th>
                {names.map((n) => <th key={n} style={{ textAlign:"center", padding:"10px 12px", background:"var(--bg2)", color:"var(--text-muted)", fontSize:"0.78rem", textTransform:"uppercase", borderBottom:"1px solid var(--border)" }}>{n}</th>)}
                <th style={{ background:"var(--bg2)", borderBottom:"1px solid var(--border)", width:"40px" }}></th>
              </tr>
            </thead>
            <tbody>
              {rounds.map((r, idx) => (
                <tr key={idx}>
                  <td style={{ padding:"10px 12px", borderBottom:"1px solid var(--border)", fontWeight:700, color:"var(--text-muted)" }}>R{r.round}</td>
                  {r.scores.map(({ name, score }) => (
                    <td key={name} style={{ textAlign:"center", padding:"10px 12px", borderBottom:"1px solid var(--border)", fontWeight:600 }}>{score}</td>
                  ))}
                  <td style={{ padding:"10px 12px", borderBottom:"1px solid var(--border)" }}>
                    <button className="btn btn-danger" style={{ padding:"4px 10px", fontSize:"0.75rem" }}
                      onClick={() => setRounds((prev) => prev.filter((_, i) => i !== idx))}>✕</button>
                  </td>
                </tr>
              ))}
              <tr style={{ background:"rgba(108,99,255,0.08)" }}>
                <td style={{ padding:"10px 12px", fontWeight:700 }}>Total</td>
                {names.map((n) => <td key={n} style={{ textAlign:"center", padding:"10px 12px", fontWeight:900, color:"var(--primary)", fontSize:"1rem" }}>{t[n]}</td>)}
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="btn-row">
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn btn-success" onClick={() => rounds.length ? setConfirm(true) : alert("Add at least one round!")} disabled={rounds.length===0}>
          Finish &amp; See Results 🏁
        </button>
      </div>

      {confirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }}
          onClick={() => setConfirm(false)}>
          <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"16px", padding:"32px", maxWidth:"360px", width:"90%", boxShadow:"var(--shadow)", textAlign:"center" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize:"3rem", marginBottom:"12px" }}>🏁</div>
            <h3 style={{ marginBottom:"8px" }}>End Game?</h3>
            <p style={{ color:"var(--text-muted)", marginBottom:"24px" }}>{rounds.length} round{rounds.length!==1?"s":""} played. Ready to see the results?</p>
            <div style={{ display:"flex", gap:"12px", justifyContent:"center" }}>
              <button className="btn btn-secondary" onClick={() => setConfirm(false)}>Keep Playing</button>
              <button className="btn btn-success" onClick={() => onFinish(rounds)}>See Results 🏆</button>
            </div>
          </div>
        </div>
      )}

      <style>{".input-error{border-color:var(--secondary)!important}"}</style>
    </div>
  );
}