import { useEffect, useRef } from "react";

const COLORS = ["#6c63ff","#ff6584","#43d9ad","#ffc75f","#00c9ff","#ff9f43","#ee5a24","#0652dd","#9980FA","#833471","#1289A7","#C4E538"];
const MEDALS = ["🥇","🥈","🥉"];
const MEDAL_LABELS = ["Winner!","Runner-up","3rd Place"];
const MEDAL_COLORS = ["var(--gold)","var(--silver)","var(--bronze)"];
const MEDAL_BG = ["rgba(255,215,0,0.12)","rgba(192,192,192,0.1)","rgba(205,127,50,0.1)"];

function Confetti() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const pts = Array.from({length:100}, () => ({
      x: Math.random()*canvas.width, y: Math.random()*-canvas.height,
      w: Math.random()*10+4, h: Math.random()*6+3,
      color: ["#6c63ff","#ff6584","#ffc75f","#43d9ad","#00c9ff"][Math.floor(Math.random()*5)],
      vx: Math.random()*4-2, vy: Math.random()*4+1.5,
      a: Math.random()*Math.PI*2, va: Math.random()*0.15-0.07
    }));
    let go = true;
    const draw = () => {
      if (!go) return;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      pts.forEach(p => {
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.a);
        ctx.fillStyle=p.color; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
        p.x+=p.vx; p.y+=p.vy; p.a+=p.va;
        if (p.y>canvas.height) { p.y=-p.h; p.x=Math.random()*canvas.width; }
      });
      requestAnimationFrame(draw);
    };
    draw();
    const t = setTimeout(() => { go=false; }, 5000);
    return () => { go=false; clearTimeout(t); };
  }, []);
  return <canvas ref={ref} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:50 }} />;
}

export default function Results({ gameName, players, rounds, onRestart }) {
  const sorted = [...players].sort((a, b) => b.total - a.total);
  const ci = (name) => players.findIndex((p) => p.name === name);
  const max = sorted[0]?.total || 1;

  return (
    <div>
      <Confetti />
      <div style={{ textAlign:"center", marginBottom:"28px" }}>
        <div style={{ fontSize:"3.5rem", marginBottom:"8px" }}>🏆</div>
        <h2 style={{ fontSize:"1.8rem", fontWeight:"800", marginBottom:"8px" }}>Game Over!</h2>
        <div style={{ display:"flex", justifyContent:"center", gap:"8px", flexWrap:"wrap" }}>
          <span className="badge badge-game">{gameName}</span>
          <span className="badge badge-primary">{rounds.length} Rounds</span>
          <span className="badge badge-primary">{players.length} Players</span>
        </div>
      </div>

      {/* Podium */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"center", gap:"8px", marginBottom:"32px" }}>
        {[sorted[1], sorted[0], sorted[2]].map((p, podIdx) => {
          if (!p) return <div key={podIdx} style={{ flex:1, maxWidth:"180px" }} />;
          const rank = sorted.indexOf(p);
          const blockH = [50, 80, 30][podIdx];
          return (
            <div key={p.name} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", flex:1, maxWidth:"180px" }}>
              {rank === 0 && <div style={{ fontSize:"1.5rem", animation:"float 2s ease-in-out infinite" }}>👑</div>}
              <div style={{ fontSize:"1.8rem" }}>{MEDALS[rank]}</div>
              <div style={{ width: rank===0?"64px":"52px", height:rank===0?"64px":"52px", borderRadius:"50%", background:COLORS[ci(p.name)%COLORS.length], display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"800", fontSize:rank===0?"1.4rem":"1.1rem", color:"white", border:"3px solid rgba(255,255,255,0.2)" }}>
                {p.name[0].toUpperCase()}
              </div>
              <div style={{ fontWeight:700, fontSize:rank===0?"1.1rem":"0.9rem", textAlign:"center" }}>{p.name}</div>
              <div style={{ fontSize:rank===0?"2rem":"1.5rem", fontWeight:900, color:MEDAL_COLORS[rank] }}>{p.total}</div>
              <div style={{ fontSize:"0.7rem", fontWeight:700, textTransform:"uppercase", color:MEDAL_COLORS[rank] }}>{MEDAL_LABELS[rank]}</div>
              <div style={{ width:"100%", height:`${blockH}px`, borderRadius:"8px 8px 0 0", background:MEDAL_COLORS[rank], opacity:0.6 }}></div>
            </div>
          );
        })}
      </div>

      {/* Leaderboard */}
      <div style={{ marginBottom:"24px" }}>
        <div style={{ fontWeight:700, color:"var(--text-muted)", fontSize:"0.9rem", marginBottom:"12px" }}>Full Leaderboard</div>
        {sorted.map((p, idx) => (
          <div key={p.name} style={{
            display:"flex", alignItems:"center", gap:"12px", padding:"12px 16px",
            background: idx < 3 ? MEDAL_BG[idx] : "var(--bg2)",
            borderRadius:"12px", border:`1px solid ${idx < 3 ? MEDAL_COLORS[idx] : "var(--border)"}`,
            marginBottom:"8px", transition:"transform 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform="translateX(4px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform="translateX(0)"}>
            <div style={{ fontSize:"1.3rem", minWidth:"32px", textAlign:"center", fontWeight:800, color: idx < 3 ? MEDAL_COLORS[idx] : "var(--text-muted)" }}>
              {idx < 3 ? MEDALS[idx] : idx+1}
            </div>
            <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:COLORS[ci(p.name)%COLORS.length], display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"800", fontSize:"0.85rem", color:"white", flexShrink:0 }}>
              {p.name[0].toUpperCase()}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:"0.9rem", marginBottom:"4px" }}>{p.name}</div>
              <div style={{ height:"4px", background:"var(--border)", borderRadius:"2px", overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${(p.total/max)*100}%`, background: idx<3?MEDAL_COLORS[idx]:COLORS[ci(p.name)%COLORS.length], borderRadius:"2px", transition:"width 1s ease" }}></div>
              </div>
            </div>
            <div style={{ fontSize:"1.2rem", fontWeight:900, minWidth:"50px", textAlign:"right" }}>{p.total}</div>
            {rounds.length > 0 && <div style={{ color:"var(--text-muted)", fontSize:"0.78rem", minWidth:"55px", textAlign:"right" }}>{(p.total/rounds.length).toFixed(1)} avg</div>}
          </div>
        ))}
      </div>

      {/* Round breakdown */}
      {rounds.length > 0 && (
        <div>
          <div style={{ fontWeight:700, color:"var(--text-muted)", fontSize:"0.9rem", marginBottom:"12px" }}>Round Breakdown</div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.9rem" }}>
              <thead>
                <tr>
                  <th style={{ textAlign:"left", padding:"10px 12px", background:"var(--bg2)", color:"var(--text-muted)", fontSize:"0.78rem", textTransform:"uppercase", borderBottom:"1px solid var(--border)" }}>Round</th>
                  {players.map((p) => <th key={p.name} style={{ textAlign:"center", padding:"10px 12px", background:"var(--bg2)", color:"var(--text-muted)", fontSize:"0.78rem", textTransform:"uppercase", borderBottom:"1px solid var(--border)" }}>{p.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {rounds.map((r, i) => (
                  <tr key={i}>
                    <td style={{ padding:"10px 12px", fontWeight:700, color:"var(--text-muted)", borderBottom:"1px solid var(--border)" }}>R{r.round}</td>
                    {players.map((p) => {
                      const s = r.scores.find((s) => s.name === p.name);
                      return <td key={p.name} style={{ textAlign:"center", padding:"10px 12px", borderBottom:"1px solid var(--border)" }}>{s?s.score:0}</td>;
                    })}
                  </tr>
                ))}
                <tr style={{ background:"rgba(108,99,255,0.08)" }}>
                  <td style={{ padding:"10px 12px", fontWeight:700 }}>Total</td>
                  {players.map((p) => <td key={p.name} style={{ textAlign:"center", padding:"10px 12px", fontWeight:900, color:"var(--primary)" }}>{p.total}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="btn-row" style={{ marginTop:"32px" }}>
        <button className="btn btn-primary" onClick={onRestart}>🔄 New Game</button>
      </div>
    </div>
  );
}