import { useState } from "react";
import { soundFx } from "../utils/soundEffects";

export default function ScoreEntry({
  gameName,
  winRule = "highest",
  targetScore = null,
  players,
  onFinish,
  onBack,
  onOpenTools,
}) {
  const [rounds, setRounds] = useState([]);
  const [roundNote, setRoundNote] = useState("");
  // Score inputs mapped strictly by player name
  const [curScores, setCurScores] = useState(() =>
    Object.fromEntries(players.map((p) => [p.name, ""]))
  );
  const [errors, setErrors] = useState({});
  const [editingRoundIndex, setEditingRoundIndex] = useState(null);
  const [editScores, setEditScores] = useState({});
  const [confirmModal, setConfirmModal] = useState(false);

  // Compute Running Totals
  const calculateTotals = () => {
    const totals = Object.fromEntries(players.map((p) => [p.name, 0]));
    rounds.forEach((r) => {
      r.scores.forEach(({ name, score }) => {
        totals[name] = (totals[name] || 0) + score;
      });
    });
    return totals;
  };

  const totals = calculateTotals();

  // Sort players dynamically for live rankings
  const rankedPlayers = [...players].sort((a, b) => {
    const scoreA = totals[a.name] || 0;
    const scoreB = totals[b.name] || 0;
    return winRule === "highest" ? scoreB - scoreA : scoreA - scoreB;
  });

  const getRankBadge = (playerName) => {
    const rank = rankedPlayers.findIndex((p) => p.name === playerName);
    if (rank === 0) return "👑 1st";
    if (rank === 1) return "🥈 2nd";
    if (rank === 2) return "🥉 3rd";
    return `#${rank + 1}`;
  };

  // Validate manual typed inputs
  const validateInputs = () => {
    const newErrors = {};
    players.forEach((p) => {
      const val = curScores[p.name];
      if (val === "" || val === undefined || val === null) {
        newErrors[p.name] = "Enter score";
      } else if (isNaN(Number(val))) {
        newErrors[p.name] = "Numbers only";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add Round
  const handleAddRound = (e) => {
    if (e) e.preventDefault();
    if (!validateInputs()) {
      soundFx.playClick();
      return;
    }

    const scores = players.map((p) => ({
      name: p.name,
      score: Number(curScores[p.name]),
    }));

    const newRoundNumber = rounds.length + 1;
    const newRound = {
      round: newRoundNumber,
      note: roundNote.trim(),
      scores,
    };

    setRounds((prev) => [...prev, newRound]);
    setCurScores(Object.fromEntries(players.map((p) => [p.name, ""])));
    setRoundNote("");
    setErrors({});
    soundFx.playSuccess();

    // Check target score achievement
    if (targetScore) {
      const updatedTotals = { ...totals };
      scores.forEach(({ name, score }) => {
        updatedTotals[name] = (updatedTotals[name] || 0) + score;
      });
      const leader = rankedPlayers[0];
      if (leader && updatedTotals[leader.name] >= targetScore) {
        setTimeout(() => {
          alert(`🎯 Target score of ${targetScore} reached by ${leader.name}! You can now conclude the match.`);
        }, 300);
      }
    }
  };

  // Start editing a past round
  const startEditRound = (idx) => {
    setEditingRoundIndex(idx);
    const r = rounds[idx];
    const map = {};
    r.scores.forEach((s) => {
      map[s.name] = String(s.score);
    });
    setEditScores(map);
    soundFx.playClick();
  };

  // Save edited round
  const saveEditRound = (idx) => {
    const updatedScores = players.map((p) => ({
      name: p.name,
      score: isNaN(Number(editScores[p.name])) ? 0 : Number(editScores[p.name]),
    }));
    setRounds((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], scores: updatedScores };
      return copy;
    });
    setEditingRoundIndex(null);
    soundFx.playSuccess();
  };

  // Delete round
  const deleteRound = (idx) => {
    if (window.confirm(`Delete Round ${rounds[idx].round}?`)) {
      setRounds((prev) =>
        prev
          .filter((_, i) => i !== idx)
          .map((r, i) => ({ ...r, round: i + 1 }))
      );
      soundFx.playClick();
    }
  };

  return (
    <div className="se-root">
      {/* Top Header */}
      <div className="se-header">
        <div className="se-header-info">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h2 className="section-title" style={{ margin: 0 }}>📊 Live Scoreboard</h2>
            <span className="badge badge-game">{gameName}</span>
            <span className="badge badge-primary">
              {rounds.length} {rounds.length === 1 ? "Round" : "Rounds"} Done
            </span>
            <span className="badge" style={{ background: "rgba(255,215,0,0.15)", color: "var(--gold)" }}>
              {winRule === "highest" ? "📈 High Score Wins" : "📉 Low Score Wins"}
            </span>
          </div>
          <p className="section-subtitle" style={{ margin: "4px 0 0 0" }}>
            Type manual numeric scores for each player per round.
          </p>
        </div>

        {/* Companion Tools Trigger Button */}
        <button
          type="button"
          className="btn btn-secondary se-tools-btn"
          onClick={() => {
            soundFx.playClick();
            onOpenTools();
          }}
        >
          <span>🎲 Mini Tools</span>
        </button>
      </div>

      {/* Live Standings Bar */}
      <div className="se-standings-box">
        <div className="se-standings-title">
          <span>🏆 Live Leaderboard Standings</span>
          <small>{players.length} Players</small>
        </div>
        <div className="se-standings-grid">
          {rankedPlayers.map((p, idx) => (
            <div
              key={p.name}
              className={`se-standing-card ${idx === 0 ? "se-standing-leader" : ""}`}
              style={{ borderLeftColor: p.color }}
            >
              <div className="se-standing-avatar" style={{ background: p.color }}>
                <span>{p.avatar || p.name[0].toUpperCase()}</span>
              </div>
              <div className="se-standing-details">
                <div className="se-standing-name-row">
                  <span className="se-standing-name">{p.name}</span>
                  <span className="se-standing-rank">{getRankBadge(p.name)}</span>
                </div>
                <div className="se-standing-score-row">
                  <span className="se-standing-score">{totals[p.name] || 0}</span>
                  <span className="se-standing-pts">pts</span>
                  {rounds.length > 0 && (
                    <span className="se-standing-avg">
                      ({((totals[p.name] || 0) / rounds.length).toFixed(1)}/rd)
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Score Entry Form for Current Round */}
      <div className="se-entry-card">
        <div className="se-round-header">
          <div className="se-round-badge">
            <span>⚔️ Enter Scores for Round {rounds.length + 1}</span>
          </div>
          <input
            type="text"
            className="form-input se-note-input"
            placeholder="Optional round remark (e.g. Double points, Bonus...)"
            value={roundNote}
            onChange={(e) => setRoundNote(e.target.value)}
            maxLength={40}
          />
        </div>

        <form onSubmit={handleAddRound}>
          <div className="se-inputs-grid">
            {players.map((p) => (
              <div key={p.name} className="se-player-input-card">
                <div className="se-input-header">
                  <div className="se-player-avatar-small" style={{ background: p.color }}>
                    {p.avatar || p.name[0].toUpperCase()}
                  </div>
                  <div className="se-player-name-wrap">
                    <span className="se-input-player-name">{p.name}</span>
                    <span className="se-input-current-total">Total: {totals[p.name] || 0}</span>
                  </div>
                </div>

                <div className="se-input-box">
                  {/* Strictly typed numerical input - no steppers/increment buttons */}
                  <input
                    type="number"
                    step="any"
                    className={`form-input se-score-input ${errors[p.name] ? "se-input-error" : ""}`}
                    placeholder="Type score..."
                    value={curScores[p.name]}
                    onChange={(e) =>
                      setCurScores((prev) => ({ ...prev, [p.name]: e.target.value }))
                    }
                    autoComplete="off"
                  />
                  {errors[p.name] && (
                    <span className="se-error-tag">{errors[p.name]}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="se-submit-bar">
            <div className="se-keyboard-hint">
              <span>⌨️</span> <span>Score must be manually typed. Press Enter to submit round.</span>
            </div>
            <button type="submit" className="btn btn-primary se-add-round-btn">
              Add Round {rounds.length + 1} ✓
            </button>
          </div>
        </form>
      </div>

      {/* Round History Log Table */}
      {rounds.length > 0 && (
        <div className="se-history-section">
          <div className="se-history-header">
            <h3 className="se-history-title">📜 Round-by-Round History</h3>
            <span className="se-history-count">{rounds.length} Total</span>
          </div>

          <div className="se-table-container">
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
                  <th className="se-th-action">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rounds.map((r, idx) => (
                  <tr key={idx} className="se-table-row">
                    <td className="se-td-round">
                      <span className="se-round-tag">R{r.round}</span>
                      {r.note && <div className="se-row-note">{r.note}</div>}
                    </td>

                    {/* Check if editing this round */}
                    {editingRoundIndex === idx ? (
                      <>
                        {players.map((p) => (
                          <td key={p.name} className="se-td-score">
                            <input
                              type="number"
                              className="form-input se-edit-cell-input"
                              value={editScores[p.name] ?? ""}
                              onChange={(e) =>
                                setEditScores((prev) => ({
                                  ...prev,
                                  [p.name]: e.target.value,
                                }))
                              }
                            />
                          </td>
                        ))}
                        <td className="se-td-action">
                          <button
                            type="button"
                            className="btn btn-success se-table-btn"
                            onClick={() => saveEditRound(idx)}
                            title="Save edits"
                          >
                            ✓
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        {players.map((p) => {
                          const s = r.scores.find((score) => score.name === p.name);
                          return (
                            <td key={p.name} className="se-td-score">
                              <span className="se-score-num">{s ? s.score : 0}</span>
                            </td>
                          );
                        })}
                        <td className="se-td-action">
                          <button
                            type="button"
                            className="se-table-icon-btn"
                            onClick={() => startEditRound(idx)}
                            title="Edit this round's scores"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="se-table-icon-btn se-delete-btn"
                            onClick={() => deleteRound(idx)}
                            title="Delete round"
                          >
                            🗑️
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}

                {/* Running Totals Summary Row */}
                <tr className="se-total-row">
                  <td className="se-td-round">
                    <strong>TOTAL</strong>
                  </td>
                  {players.map((p) => (
                    <td key={p.name} className="se-td-score">
                      <span className="se-total-num" style={{ color: p.color }}>
                        {totals[p.name] || 0}
                      </span>
                    </td>
                  ))}
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bottom Actions Bar */}
      <div className="btn-row" style={{ marginTop: "24px" }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            soundFx.playClick();
            onBack();
          }}
        >
          ← Edit Players
        </button>

        <button
          type="button"
          className="btn btn-success"
          onClick={() => {
            if (rounds.length === 0) {
              alert("Please enter and add at least one round of scores!");
              return;
            }
            soundFx.playSuccess();
            setConfirmModal(true);
          }}
          disabled={rounds.length === 0}
        >
          Finish Game &amp; Crown Champions 🏆
        </button>
      </div>

      {/* Final Game Confirmation Modal */}
      {confirmModal && (
        <div className="se-modal-overlay" onClick={() => setConfirmModal(false)}>
          <div className="se-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="se-modal-trophy">🏁</div>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "8px" }}>
              Conclude {gameName}?
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "20px" }}>
              {rounds.length} round{rounds.length !== 1 ? "s" : ""} recorded with {players.length} players.
              Ready to reveal the Champion podium and celebration blast?
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  soundFx.playClick();
                  setConfirmModal(false);
                }}
              >
                Keep Playing
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={() => {
                  soundFx.playFanfare();
                  onFinish(rounds);
                }}
              >
                See Results &amp; Blasts 🏆
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .se-root { position: relative; }
        .se-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 20px; gap: 12px; flex-wrap: wrap;
        }
        .se-tools-btn {
          padding: 8px 16px; font-size: 0.85rem; border-color: var(--primary);
          background: rgba(108,99,255,0.12); color: var(--primary); font-weight: 700;
        }
        .se-tools-btn:hover { background: var(--primary); color: white; }
        
        /* Standings Bar */
        .se-standings-box {
          background: var(--bg2); border: 1px solid var(--border); border-radius: 14px;
          padding: 16px; margin-bottom: 24px;
        }
        .se-standings-title {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 0.82rem; font-weight: 700; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;
        }
        .se-standings-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 10px;
        }
        .se-standing-card {
          background: var(--surface); border: 1px solid var(--border); border-left-width: 4px;
          border-radius: 10px; padding: 10px 12px; display: flex; align-items: center; gap: 10px;
          transition: transform 0.2s;
        }
        .se-standing-leader {
          background: rgba(255,215,0,0.06); border-color: rgba(255,215,0,0.3);
        }
        .se-standing-avatar {
          width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; font-size: 1rem; color: white; font-weight: 800; flex-shrink: 0;
        }
        .se-standing-details { flex: 1; min-width: 0; }
        .se-standing-name-row {
          display: flex; justify-content: space-between; align-items: center;
          gap: 4px; margin-bottom: 2px;
        }
        .se-standing-name {
          font-size: 0.85rem; font-weight: 700; white-space: nowrap; overflow: hidden;
          text-overflow: ellipsis; max-width: 90px;
        }
        .se-standing-rank { font-size: 0.72rem; font-weight: 800; color: var(--gold); }
        .se-standing-score-row { display: flex; align-items: baseline; gap: 4px; }
        .se-standing-score { font-size: 1.2rem; font-weight: 900; color: var(--text); }
        .se-standing-pts { font-size: 0.7rem; color: var(--text-muted); }
        .se-standing-avg { font-size: 0.7rem; color: var(--text-muted); margin-left: auto; }

        /* Entry Card */
        .se-entry-card {
          background: var(--surface2); border: 1px solid rgba(108,99,255,0.3);
          border-radius: 16px; padding: 20px; margin-bottom: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .se-round-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 18px; gap: 12px; flex-wrap: wrap;
        }
        .se-round-badge {
          font-size: 1.05rem; font-weight: 800; color: var(--primary);
        }
        .se-note-input { max-width: 320px; padding: 8px 12px; font-size: 0.85rem; }
        .se-inputs-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 14px; margin-bottom: 18px;
        }
        .se-player-input-card {
          background: var(--bg2); border: 1px solid var(--border); border-radius: 12px;
          padding: 12px 14px;
        }
        .se-input-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .se-player-avatar-small {
          width: 28px; height: 28px; border-radius: 50%; display: flex;
          align-items: center; justify-content: center; font-size: 0.85rem; flex-shrink: 0;
        }
        .se-player-name-wrap { display: flex; justify-content: space-between; flex: 1; align-items: baseline; }
        .se-input-player-name { font-size: 0.88rem; font-weight: 700; color: var(--text); }
        .se-input-current-total { font-size: 0.72rem; color: var(--text-muted); }
        .se-input-box { position: relative; }
        .se-score-input {
          padding: 10px 12px; font-size: 1.1rem; font-weight: 700; text-align: center;
          letter-spacing: 0.5px;
        }
        .se-input-error { border-color: var(--secondary) !important; }
        .se-error-tag { font-size: 0.72rem; color: var(--secondary); margin-top: 4px; display: block; }
        .se-submit-bar {
          display: flex; justify-content: space-between; align-items: center;
          gap: 12px; flex-wrap: wrap; padding-top: 6px;
        }
        .se-keyboard-hint { font-size: 0.8rem; color: var(--text-muted); display: flex; gap: 6px; align-items: center; }
        .se-add-round-btn { padding: 12px 28px; font-size: 1rem; }

        /* History Table */
        .se-history-section { margin-bottom: 24px; }
        .se-history-header {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
        }
        .se-history-title { font-size: 1rem; font-weight: 700; color: var(--text); }
        .se-history-count { font-size: 0.8rem; color: var(--text-muted); }
        .se-table-container { overflow-x: auto; border: 1px solid var(--border); border-radius: 12px; }
        .se-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left; }
        .se-table th {
          background: var(--bg2); padding: 12px 14px; font-size: 0.78rem;
          color: var(--text-muted); text-transform: uppercase; font-weight: 700;
          border-bottom: 1px solid var(--border);
        }
        .se-th-round { width: 90px; }
        .se-th-player { text-align: center; }
        .se-th-avatar { margin-right: 4px; font-size: 0.9rem; }
        .se-th-action { width: 80px; text-align: center; }
        .se-table-row td {
          padding: 10px 14px; border-bottom: 1px solid var(--border); background: var(--surface);
        }
        .se-td-round { font-weight: 700; color: var(--text-muted); }
        .se-round-tag {
          background: var(--surface2); padding: 3px 8px; border-radius: 6px;
          font-size: 0.78rem; color: var(--text);
        }
        .se-row-note { font-size: 0.7rem; color: var(--gold); margin-top: 3px; font-weight: 400; }
        .se-td-score { text-align: center; font-weight: 700; font-size: 1rem; }
        .se-td-action { text-align: center; }
        .se-edit-cell-input { padding: 4px 6px; font-size: 0.9rem; width: 70px; text-align: center; margin: 0 auto; }
        .se-table-btn { padding: 4px 8px; font-size: 0.75rem; }
        .se-table-icon-btn {
          background: transparent; border: none; cursor: pointer; padding: 4px 6px;
          border-radius: 6px; font-size: 0.85rem; transition: background 0.15s;
        }
        .se-table-icon-btn:hover { background: var(--surface2); }
        .se-delete-btn:hover { background: rgba(255,101,132,0.2); }
        .se-total-row td {
          background: rgba(108,99,255,0.1); font-weight: 900; border-bottom: none;
          padding: 12px 14px;
        }
        .se-total-num { font-size: 1.15rem; font-weight: 900; }

        /* Modal Overlay */
        .se-modal-overlay {
          position: fixed; inset: 0; background: rgba(5,4,15,0.8);
          backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center;
          z-index: 999; padding: 16px;
        }
        .se-modal-box {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 20px; padding: 32px; max-width: 400px; width: 100%;
          text-align: center; box-shadow: var(--shadow);
          animation: popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .se-modal-trophy { font-size: 3.2rem; margin-bottom: 12px; }
      `}</style>
    </div>
  );
}