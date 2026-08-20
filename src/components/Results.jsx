import { useState, useEffect, useMemo } from "react";
import FireworkBlast from "./FireworkBlast";
import { soundFx } from "../utils/soundEffects";

const MEDAL_BADGES = ["🥇", "🥈", "🥉"];
const PODIUM_RANKS = [
  { label: "Runner-up", medal: "🥈", color: "var(--silver)", blockHeight: 90, order: 0 },
  { label: "Winner & Champion", medal: "🥇", color: "var(--gold)", blockHeight: 130, order: 1 },
  { label: "3rd Place", medal: "🥉", color: "var(--bronze)", blockHeight: 60, order: 2 },
];

export default function Results({
  gameName,
  winRule = "highest",
  players,
  rounds,
  onRestart,
  onRematch,
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("podium"); // 'podium' | 'chart' | 'table' | 'awards'
  const [blastSound, setBlastSound] = useState(false);

  // Compute Final Rankings
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      return winRule === "highest" ? b.total - a.total : a.total - b.total;
    });
  }, [players, winRule]);

  const winner = sortedPlayers[0];
  const runnerUp = sortedPlayers[1];
  const thirdPlace = sortedPlayers[2];

  // Save to LocalStorage Match Archive on mount
  useEffect(() => {
    soundFx.playFanfare();
    try {
      const historyKey = "scoreboard_pro_history";
      const raw = localStorage.getItem(historyKey);
      const history = raw ? JSON.parse(raw) : [];
      const newEntry = {
        id: Date.now(),
        date: new Date().toISOString(),
        gameName,
        winRule,
        roundsCount: rounds.length,
        winner: { name: winner?.name, total: winner?.total, avatar: winner?.avatar },
        standings: sortedPlayers.map((p) => ({ name: p.name, total: p.total })),
      };
      // Keep last 30 games
      const updated = [newEntry, ...history].slice(0, 30);
      localStorage.setItem(historyKey, JSON.stringify(updated));
    } catch (e) {
      // Storage fallback
    }
  }, [gameName, winRule, rounds.length, winner, sortedPlayers]);

  // Compute Innovative Awards
  const awards = useMemo(() => {
    if (!rounds || rounds.length === 0) return [];
    const list = [];

    // 1. MVP / Champion
    if (winner) {
      list.push({
        title: "Championship MVP",
        icon: "👑",
        player: winner.name,
        avatar: winner.avatar,
        color: winner.color,
        desc: `${winner.total} Total Points (${((winner.total || 0) / rounds.length).toFixed(1)} avg/rd)`,
      });
    }

    // 2. High Roller (Highest Single Round Score)
    let maxSingleScore = -Infinity;
    let highRollerPlayer = "";
    let highRollerRound = 1;

    rounds.forEach((r) => {
      r.scores.forEach((s) => {
        if (s.score > maxSingleScore) {
          maxSingleScore = s.score;
          highRollerPlayer = s.name;
          highRollerRound = r.round;
        }
      });
    });

    if (highRollerPlayer) {
      const pObj = players.find((p) => p.name === highRollerPlayer);
      list.push({
        title: "High Roller",
        icon: "💥",
        player: highRollerPlayer,
        avatar: pObj?.avatar || "💥",
        color: pObj?.color || "var(--primary)",
        desc: `Scored massive ${maxSingleScore} pts in Round ${highRollerRound}!`,
      });
    }

    // 3. Comeback King (Largest jump between consecutive rounds)
    if (rounds.length >= 2) {
      let maxJump = -Infinity;
      let comebackPlayer = "";
      let comebackRound = 2;

      players.forEach((p) => {
        for (let i = 1; i < rounds.length; i++) {
          const scorePrev = rounds[i - 1].scores.find((s) => s.name === p.name)?.score || 0;
          const scoreCur = rounds[i].scores.find((s) => s.name === p.name)?.score || 0;
          const diff = scoreCur - scorePrev;
          if (diff > maxJump) {
            maxJump = diff;
            comebackPlayer = p.name;
            comebackRound = i + 1;
          }
        }
      });

      if (comebackPlayer && maxJump > 0) {
        const pObj = players.find((p) => p.name === comebackPlayer);
        list.push({
          title: "Comeback King",
          icon: "🚀",
          player: comebackPlayer,
          avatar: pObj?.avatar || "🚀",
          color: pObj?.color || "var(--secondary)",
          desc: `+${maxJump} point surge in Round ${comebackRound}`,
        });
      }
    }

    // 4. Most Consistent
    let minStdDev = Infinity;
    let mostConsistentPlayer = "";

    players.forEach((p) => {
      const pScores = rounds.map((r) => r.scores.find((s) => s.name === p.name)?.score || 0);
      const mean = pScores.reduce((a, b) => a + b, 0) / pScores.length;
      const variance =
        pScores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / pScores.length;
      const stdDev = Math.sqrt(variance);

      if (stdDev < minStdDev) {
        minStdDev = stdDev;
        mostConsistentPlayer = p.name;
      }
    });

    if (mostConsistentPlayer) {
      const pObj = players.find((p) => p.name === mostConsistentPlayer);
      list.push({
        title: "Precision Master",
        icon: "🎯",
        player: mostConsistentPlayer,
        avatar: pObj?.avatar || "🎯",
        color: pObj?.color || "var(--success)",
        desc: `Super steady performance across all rounds (±${minStdDev.toFixed(1)} dev)`,
      });
    }

    return list;
  }, [players, rounds, winner]);

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    const medals = ["🥇", "🥈", "🥉"];
    let text = `🎮 *${gameName} - Match Results* 🏆\n\n`;
    text += `👑 *Winner:* ${winner?.name} (${winner?.total} pts)\n`;
    if (runnerUp) text += `🥈 *Runner-up:* ${runnerUp?.name} (${runnerUp?.total} pts)\n`;
    if (thirdPlace) text += `🥉 *3rd Place:* ${thirdPlace?.name} (${thirdPlace?.total} pts)\n\n`;

    text += `📊 *Final Standings:*\n`;
    sortedPlayers.forEach((p, i) => {
      const badge = medals[i] || `#${i + 1}`;
      text += `${badge} ${p.name} - ${p.total} pts (${((p.total || 0) / rounds.length).toFixed(1)} avg/rd)\n`;
    });

    text += `\n🎯 Total Rounds: ${rounds.length}\n`;
    text += `⚡ Powered by ScoreBoard Pro\n`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      soundFx.playSuccess();
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Cumulative Round Progression Data for SVG Graph
  const graphData = useMemo(() => {
    if (!rounds || rounds.length === 0) return null;

    const roundSteps = [{ round: 0, totals: Object.fromEntries(players.map((p) => [p.name, 0])) }];
    const running = Object.fromEntries(players.map((p) => [p.name, 0]));

    rounds.forEach((r) => {
      r.scores.forEach((s) => {
        running[s.name] = (running[s.name] || 0) + s.score;
      });
      roundSteps.push({ round: r.round, totals: { ...running } });
    });

    let minScore = 0;
    let maxScore = 1;
    roundSteps.forEach((step) => {
      Object.values(step.totals).forEach((val) => {
        if (val < minScore) minScore = val;
        if (val > maxScore) maxScore = val;
      });
    });

    const padding = (maxScore - minScore) * 0.1 || 10;
    const yMin = minScore - padding;
    const yMax = maxScore + padding;

    return { roundSteps, yMin, yMax };
  }, [players, rounds]);

  return (
    <div className="res-root">
      {/* Continuous Multi-Layered Victory Blast & Firework Engine */}
      <FireworkBlast enableSound={blastSound} />

      {/* Hero Victory Header */}
      <div className="res-hero">
        <div className="res-trophy-banner">
          <span className="res-big-trophy">🏆</span>
          <h2 className="res-victory-title">Championship Crowned!</h2>
          <p className="res-victory-sub">
            {winner?.name} has triumphed in <strong>{gameName}</strong>!
          </p>
        </div>

        <div className="res-meta-badges">
          <span className="badge badge-game">{gameName}</span>
          <span className="badge badge-primary">{rounds.length} Rounds Played</span>
          <span className="badge badge-primary">{players.length} Competitors</span>
          <button
            type="button"
            className={`res-sound-chip ${blastSound ? "res-sound-active" : ""}`}
            onClick={() => setBlastSound(!blastSound)}
          >
            {blastSound ? "🔊 Blast Audio On" : "🔈 Blast Audio Off"}
          </button>
        </div>
      </div>

      {/* 3D Championship Podium */}
      <div className="res-podium-section">
        <div className="res-podium-container">
          {/* Order: 2nd (Left), 1st (Center), 3rd (Right) */}
          {[runnerUp, winner, thirdPlace].map((p, idx) => {
            const config = PODIUM_RANKS[idx];
            if (!p) {
              return (
                <div key={idx} className="res-podium-col res-podium-empty" style={{ order: config.order }}>
                  <div className="res-podium-pedestal" style={{ height: `${config.blockHeight * 0.4}px` }} />
                </div>
              );
            }

            const isChamp = idx === 1; // Center is winner
            const rankLabel = idx === 1 ? "1st (Winner)" : idx === 0 ? "2nd (Runner-up)" : "3rd Place";

            return (
              <div
                key={p.name}
                className={`res-podium-col ${isChamp ? "res-podium-champion" : ""}`}
                style={{ order: config.order }}
              >
                {/* Crown / Floating Embellishment */}
                <div className="res-podium-avatar-wrap">
                  {isChamp && <span className="res-crown-icon">👑</span>}
                  <div
                    className="res-podium-avatar"
                    style={{
                      background: p.color || "var(--primary)",
                      borderColor: config.color,
                      width: isChamp ? "72px" : "56px",
                      height: isChamp ? "72px" : "56px",
                    }}
                  >
                    <span>{p.avatar || p.name[0].toUpperCase()}</span>
                  </div>
                  <span className="res-podium-medal-tag">{config.medal}</span>
                </div>

                {/* Player Name & Score */}
                <div className="res-podium-player-name">{p.name}</div>
                <div className="res-podium-score" style={{ color: config.color }}>
                  {p.total} <small>pts</small>
                </div>
                <div className="res-podium-rank-tag" style={{ color: config.color }}>
                  {rankLabel}
                </div>

                {/* 3D Pedestal Block */}
                <div
                  className="res-podium-pedestal"
                  style={{
                    height: `${config.blockHeight}px`,
                    background: `linear-gradient(180deg, ${config.color}33, ${config.color}11)`,
                    borderColor: `${config.color}66`,
                  }}
                >
                  <span className="res-pedestal-num" style={{ color: config.color }}>
                    {idx === 1 ? "1" : idx === 0 ? "2" : "3"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="res-nav-tabs">
        <button
          className={`res-tab-btn ${activeTab === "podium" ? "res-tab-active" : ""}`}
          onClick={() => { setActiveTab("podium"); soundFx.playClick(); }}
        >
          🏆 Standings
        </button>
        <button
          className={`res-tab-btn ${activeTab === "awards" ? "res-tab-active" : ""}`}
          onClick={() => { setActiveTab("awards"); soundFx.playClick(); }}
        >
          🎖️ Highlights &amp; Badges
        </button>
        <button
          className={`res-tab-btn ${activeTab === "chart" ? "res-tab-active" : ""}`}
          onClick={() => { setActiveTab("chart"); soundFx.playClick(); }}
        >
          📈 Score Trajectory Graph
        </button>
        <button
          className={`res-tab-btn ${activeTab === "table" ? "res-tab-active" : ""}`}
          onClick={() => { setActiveTab("table"); soundFx.playClick(); }}
        >
          📊 Round Breakdown Table
        </button>
      </div>

      {/* TAB 1: FULL LEADERBOARD */}
      {activeTab === "podium" && (
        <div className="res-leaderboard-list">
          <div className="res-list-header">
            <span>Rank &amp; Competitor</span>
            <span>Total &amp; Round Avg</span>
          </div>

          {sortedPlayers.map((p, idx) => {
            const maxPts = Math.max(1, sortedPlayers[0]?.total || 1);
            const pct = Math.max(8, ((p.total || 0) / maxPts) * 100);
            const medal = MEDAL_BADGES[idx] || `#${idx + 1}`;

            return (
              <div
                key={p.name}
                className={`res-rank-card ${idx < 3 ? `res-rank-top-${idx + 1}` : ""}`}
                style={{ borderLeftColor: p.color }}
              >
                <div className="res-rank-left">
                  <span className="res-rank-medal">{medal}</span>
                  <div className="res-rank-avatar" style={{ background: p.color }}>
                    {p.avatar || p.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="res-rank-name">
                      {p.name} {idx === 0 && <span style={{ color: "var(--gold)" }}>👑 (Winner)</span>}
                      {idx === 1 && <span style={{ color: "var(--silver)" }}>🥈 (Runner-up)</span>}
                      {idx === 2 && <span style={{ color: "var(--bronze)" }}>🥉 (3rd Place)</span>}
                    </div>
                    {/* Visual Score Bar */}
                    <div className="res-progress-track">
                      <div
                        className="res-progress-fill"
                        style={{
                          width: `${pct}%`,
                          background: p.color || "var(--primary)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="res-rank-right">
                  <div className="res-rank-pts">{p.total} <small>pts</small></div>
                  <div className="res-rank-avg">
                    {rounds.length > 0 ? `${((p.total || 0) / rounds.length).toFixed(1)} avg/rd` : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: AWARDS & BADGES */}
      {activeTab === "awards" && (
        <div className="res-awards-grid">
          {awards.map((award, aIdx) => (
            <div key={aIdx} className="res-award-card" style={{ borderTopColor: award.color }}>
              <div className="res-award-icon-box">{award.icon}</div>
              <div className="res-award-title">{award.title}</div>
              <div className="res-award-winner">
                <span className="res-award-avatar" style={{ background: award.color }}>
                  {award.avatar}
                </span>
                <span className="res-award-name">{award.player}</span>
              </div>
              <div className="res-award-desc">{award.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: SVG PROGRESSION GRAPH */}
      {activeTab === "chart" && graphData && (
        <div className="res-chart-container">
          <div className="res-chart-title">
            <span>📈 Round-by-Round Score Trajectory</span>
            <small>Progression of totals across all rounds</small>
          </div>

          <div className="res-svg-wrap">
            <svg
              viewBox="0 0 540 260"
              className="res-svg-graph"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, gIdx) => {
                const y = 30 + ratio * 190;
                return (
                  <line
                    key={gIdx}
                    x1="45"
                    y1={y}
                    x2="520"
                    y2={y}
                    stroke="rgba(255,255,255,0.08)"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Player Lines */}
              {players.map((p) => {
                const totalRounds = graphData.roundSteps.length - 1;
                const points = graphData.roundSteps.map((step, idx) => {
                  const x = 50 + (idx / Math.max(1, totalRounds)) * 450;
                  const val = step.totals[p.name] || 0;
                  const range = graphData.yMax - graphData.yMin || 1;
                  const y = 220 - ((val - graphData.yMin) / range) * 180;
                  return `${x},${y}`;
                });

                return (
                  <g key={p.name}>
                    <polyline
                      fill="none"
                      stroke={p.color || "var(--primary)"}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={points.join(" ")}
                    />
                    {graphData.roundSteps.map((step, idx) => {
                      const x = 50 + (idx / Math.max(1, totalRounds)) * 450;
                      const val = step.totals[p.name] || 0;
                      const range = graphData.yMax - graphData.yMin || 1;
                      const y = 220 - ((val - graphData.yMin) / range) * 180;
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r="4.5"
                          fill={p.color || "var(--primary)"}
                          stroke="#1e1d35"
                          strokeWidth="2"
                        />
                      );
                    })}
                  </g>
                );
              })}

              {/* X Axis Labels */}
              {graphData.roundSteps.map((step, idx) => {
                const totalRounds = graphData.roundSteps.length - 1;
                const x = 50 + (idx / Math.max(1, totalRounds)) * 450;
                return (
                  <text
                    key={idx}
                    x={x}
                    y="245"
                    fill="var(--text-muted)"
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    {idx === 0 ? "Start" : `R${idx}`}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Graph Legend */}
          <div className="res-graph-legend">
            {players.map((p) => (
              <div key={p.name} className="res-legend-item">
                <span className="res-legend-dot" style={{ background: p.color }} />
                <span className="res-legend-name">{p.name}</span>
                <span className="res-legend-score">({p.total} pts)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ROUND BREAKDOWN TABLE */}
      {activeTab === "table" && (
        <div className="res-table-wrap">
          <table className="se-table">
            <thead>
              <tr>
                <th className="se-th-round">Round</th>
                {players.map((p) => (
                  <th key={p.name} className="se-th-player">
                    <span className="se-th-avatar">{p.avatar}</span>
                    <span>{p.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rounds.map((r, i) => (
                <tr key={i} className="se-table-row">
                  <td className="se-td-round">
                    <span className="se-round-tag">R{r.round}</span>
                    {r.note && <div className="se-row-note">{r.note}</div>}
                  </td>
                  {players.map((p) => {
                    const s = r.scores.find((score) => score.name === p.name);
                    return (
                      <td key={p.name} className="se-td-score">
                        {s ? s.score : 0}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="se-total-row">
                <td className="se-td-round"><strong>TOTAL</strong></td>
                {players.map((p) => (
                  <td key={p.name} className="se-td-score">
                    <span className="se-total-num" style={{ color: p.color }}>
                      {p.total}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Bottom Share & Action Buttons */}
      <div className="res-action-bar">
        <button
          type="button"
          className="btn btn-secondary res-share-btn"
          onClick={handleCopySummary}
        >
          {copied ? "✓ Copied to Clipboard!" : "📋 Share / Copy Scorecard"}
        </button>

        {onRematch && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              soundFx.playSuccess();
              onRematch();
            }}
          >
            🔄 Rematch (Same Players)
          </button>
        )}

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            soundFx.playClick();
            onRestart();
          }}
        >
          🎮 Start Brand New Game
        </button>
      </div>

      <style>{`
        .res-root { position: relative; }
        .res-hero { text-align: center; margin-bottom: 24px; }
        .res-trophy-banner { margin-bottom: 12px; }
        .res-big-trophy { font-size: 3.5rem; display: block; margin-bottom: 6px; animation: float 3s infinite ease-in-out; }
        .res-victory-title {
          font-size: 2rem; font-weight: 900;
          background: linear-gradient(135deg, var(--gold), #ff6584);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin-bottom: 6px;
        }
        .res-victory-sub { font-size: 1.05rem; color: var(--text-muted); }
        .res-meta-badges {
          display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; align-items: center;
        }
        .res-sound-chip {
          background: var(--surface2); border: 1px solid var(--border);
          border-radius: 20px; padding: 3px 10px; font-size: 0.75rem;
          color: var(--text-muted); cursor: pointer; transition: all 0.2s; font-weight: 700;
        }
        .res-sound-chip:hover { color: var(--text); border-color: var(--primary); }
        .res-sound-active { background: rgba(255,215,0,0.15); color: var(--gold); border-color: var(--gold); }

        /* 3D Podium */
        .res-podium-section { margin-bottom: 32px; }
        .res-podium-container {
          display: flex; align-items: flex-end; justify-content: center;
          gap: 12px; max-width: 600px; margin: 0 auto;
        }
        .res-podium-col {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          text-align: center; max-width: 170px;
        }
        .res-podium-empty { opacity: 0.2; }
        .res-podium-avatar-wrap { position: relative; margin-bottom: 6px; }
        .res-crown-icon {
          position: absolute; top: -20px; left: 50%; transform: translateX(-50%);
          font-size: 1.8rem; animation: float 2s infinite ease-in-out;
        }
        .res-podium-avatar {
          border-radius: 50%; border: 3px solid; display: flex;
          align-items: center; justify-content: center; font-size: 1.6rem;
          color: white; font-weight: 900; box-shadow: 0 8px 20px rgba(0,0,0,0.4);
        }
        .res-podium-medal-tag {
          position: absolute; bottom: -4px; right: -4px; font-size: 1.2rem;
        }
        .res-podium-player-name {
          font-weight: 800; font-size: 0.95rem; margin-bottom: 2px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;
        }
        .res-podium-champion .res-podium-player-name { font-size: 1.15rem; color: var(--gold); }
        .res-podium-score { font-size: 1.6rem; font-weight: 900; line-height: 1; margin-bottom: 2px; }
        .res-podium-score small { font-size: 0.75rem; font-weight: 600; }
        .res-podium-rank-tag {
          font-size: 0.7rem; font-weight: 800; text-transform: uppercase;
          letter-spacing: 0.5px; margin-bottom: 8px;
        }
        .res-podium-pedestal {
          width: 100%; border-radius: 12px 12px 0 0; border: 2px solid;
          border-bottom: none; display: flex; align-items: flex-start; justify-content: center;
          padding-top: 8px; box-shadow: inset 0 4px 12px rgba(255,255,255,0.1);
        }
        .res-pedestal-num { font-size: 1.8rem; font-weight: 900; opacity: 0.8; }

        /* Navigation Tabs */
        .res-nav-tabs {
          display: flex; overflow-x: auto; background: var(--bg2);
          border: 1px solid var(--border); border-radius: 12px;
          padding: 4px; gap: 4px; margin-bottom: 20px;
        }
        .res-tab-btn {
          flex: 1; min-width: 110px; padding: 10px 12px; border: none; background: transparent;
          color: var(--text-muted); font-size: 0.85rem; font-weight: 700; border-radius: 8px;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .res-tab-active { background: var(--surface); color: var(--primary); box-shadow: 0 2px 8px rgba(0,0,0,0.3); }

        /* Leaderboard List */
        .res-leaderboard-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
        .res-list-header {
          display: flex; justify-content: space-between; font-size: 0.75rem;
          color: var(--text-muted); font-weight: 700; text-transform: uppercase;
          padding: 0 12px; letter-spacing: 0.5px;
        }
        .res-rank-card {
          background: var(--bg2); border: 1px solid var(--border); border-left-width: 4px;
          border-radius: 12px; padding: 12px 16px; display: flex;
          justify-content: space-between; align-items: center; gap: 12px;
          transition: transform 0.2s;
        }
        .res-rank-card:hover { transform: translateX(4px); }
        .res-rank-top-1 { background: rgba(255,215,0,0.06); border-color: rgba(255,215,0,0.3); }
        .res-rank-top-2 { background: rgba(192,192,192,0.06); border-color: rgba(192,192,192,0.3); }
        .res-rank-top-3 { background: rgba(205,127,50,0.06); border-color: rgba(205,127,50,0.3); }
        .res-rank-left { display: flex; align-items: center; gap: 12px; flex: 1; }
        .res-rank-medal { font-size: 1.3rem; min-width: 32px; text-align: center; font-weight: 900; }
        .res-rank-avatar {
          width: 36px; height: 36px; border-radius: 50%; display: flex;
          align-items: center; justify-content: center; font-size: 1rem; color: white;
          font-weight: 800; flex-shrink: 0;
        }
        .res-rank-name { font-size: 0.95rem; font-weight: 700; margin-bottom: 4px; }
        .res-progress-track {
          width: 140px; height: 6px; background: rgba(255,255,255,0.08);
          border-radius: 3px; overflow: hidden;
        }
        .res-progress-fill { height: 100%; border-radius: 3px; transition: width 0.8s ease; }
        .res-rank-right { text-align: right; }
        .res-rank-pts { font-size: 1.3rem; font-weight: 900; color: var(--text); }
        .res-rank-avg { font-size: 0.75rem; color: var(--text-muted); }

        /* Awards Grid */
        .res-awards-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 14px; margin-bottom: 24px;
        }
        .res-award-card {
          background: var(--bg2); border: 1px solid var(--border); border-top-width: 4px;
          border-radius: 14px; padding: 18px; text-align: center;
        }
        .res-award-icon-box { font-size: 2.2rem; margin-bottom: 6px; }
        .res-award-title { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; margin-bottom: 8px; }
        .res-award-winner {
          display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;
        }
        .res-award-avatar {
          width: 28px; height: 28px; border-radius: 50%; display: flex;
          align-items: center; justify-content: center; font-size: 0.85rem;
        }
        .res-award-name { font-size: 1.1rem; font-weight: 800; color: var(--text); }
        .res-award-desc { font-size: 0.8rem; color: var(--text-muted); line-height: 1.3; }

        /* Chart */
        .res-chart-container {
          background: var(--bg2); border: 1px solid var(--border); border-radius: 14px;
          padding: 20px; margin-bottom: 24px;
        }
        .res-chart-title { margin-bottom: 16px; }
        .res-chart-title span { font-size: 1rem; font-weight: 800; display: block; }
        .res-chart-title small { font-size: 0.78rem; color: var(--text-muted); }
        .res-svg-wrap { width: 100%; overflow-x: auto; }
        .res-svg-graph { width: 100%; max-width: 600px; display: block; margin: 0 auto; }
        .res-graph-legend {
          display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 14px;
        }
        .res-legend-item { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; }
        .res-legend-dot { width: 10px; height: 10px; border-radius: 50%; }
        .res-legend-name { font-weight: 700; }
        .res-legend-score { color: var(--text-muted); font-size: 0.75rem; }

        /* Table */
        .res-table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 12px; margin-bottom: 24px; }

        /* Action Bar */
        .res-action-bar {
          display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 28px;
        }
        .res-share-btn { border-color: var(--primary); color: var(--primary); }
        .res-share-btn:hover { background: var(--primary); color: white; }
      `}</style>
    </div>
  );
}