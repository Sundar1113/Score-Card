import { soundFx } from "../utils/soundEffects";

export default function GameHistoryModal({ isOpen, onClose, onReplayGame }) {
  if (!isOpen) return null;

  const historyKey = "scoreboard_pro_history";
  let history = [];
  try {
    const raw = localStorage.getItem(historyKey);
    if (raw) history = JSON.parse(raw);
  } catch (e) {
    history = [];
  }

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear all past game records?")) {
      localStorage.removeItem(historyKey);
      soundFx.playClick();
      onClose();
    }
  };

  return (
    <div className="gh-overlay" onClick={onClose}>
      <div className="gh-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gh-header">
          <div className="gh-title-box">
            <span className="gh-badge-icon">📜</span>
            <div>
              <h3 className="gh-title">Match History &amp; Archives</h3>
              <p className="gh-subtitle">Saved game scores and past champions</p>
            </div>
          </div>
          <button className="gh-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="gh-body">
          {history.length === 0 ? (
            <div className="gh-empty">
              <span className="gh-empty-icon">📂</span>
              <h4>No matches recorded yet</h4>
              <p>Finish a game to save its final scorecard and trophy winners to your history!</p>
            </div>
          ) : (
            <div className="gh-list">
              {history.map((item, idx) => (
                <div key={idx} className="gh-card">
                  <div className="gh-card-header">
                    <div>
                      <span className="badge badge-game">{item.gameName}</span>
                      <span className="gh-date">{new Date(item.date).toLocaleDateString()} · {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span className="gh-rounds-tag">{item.roundsCount} Rounds</span>
                  </div>

                  <div className="gh-winner-row">
                    <span className="gh-crown">👑</span>
                    <div>
                      <div className="gh-winner-label">Champion</div>
                      <div className="gh-winner-name">{item.winner?.name} <span className="gh-score">({item.winner?.total} pts)</span></div>
                    </div>
                  </div>

                  <div className="gh-player-chips">
                    {item.standings?.map((p, pIdx) => (
                      <span key={p.name} className="gh-player-chip">
                        #{pIdx + 1} {p.name}: <strong>{p.total}</strong>
                      </span>
                    ))}
                  </div>

                  {onReplayGame && (
                    <button
                      className="gh-rematch-btn"
                      onClick={() => {
                        soundFx.playSuccess();
                        onReplayGame(item);
                        onClose();
                      }}
                    >
                      🔄 Rematch with these Players
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="gh-footer">
            <button className="btn btn-danger" style={{ padding: "8px 16px", fontSize: "0.85rem" }} onClick={clearHistory}>
              🗑️ Clear All History
            </button>
            <button className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }} onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>

      <style>{`
        .gh-overlay {
          position: fixed; inset: 0; background: rgba(5, 4, 15, 0.78);
          backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center;
          z-index: 999; padding: 16px;
        }
        .gh-modal {
          background: var(--surface); border: 1px solid rgba(108,99,255,0.3);
          border-radius: 20px; width: 100%; max-width: 540px; max-height: 85vh;
          display: flex; flex-direction: column; box-shadow: 0 16px 40px rgba(0,0,0,0.6);
          overflow: hidden; animation: popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .gh-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; border-bottom: 1px solid var(--border);
          background: rgba(26, 25, 51, 0.6);
        }
        .gh-title-box { display: flex; align-items: center; gap: 12px; }
        .gh-badge-icon {
          width: 38px; height: 38px; border-radius: 10px; background: rgba(108,99,255,0.2);
          display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
        }
        .gh-title { font-size: 1.1rem; font-weight: 800; color: var(--text); }
        .gh-subtitle { font-size: 0.78rem; color: var(--text-muted); }
        .gh-close-btn {
          background: transparent; border: none; color: var(--text-muted);
          font-size: 1.2rem; cursor: pointer; padding: 6px; border-radius: 8px;
        }
        .gh-close-btn:hover { color: var(--text); background: rgba(255,255,255,0.1); }
        .gh-body { padding: 20px; overflow-y: auto; flex: 1; }
        .gh-empty { text-align: center; padding: 36px 16px; color: var(--text-muted); }
        .gh-empty-icon { font-size: 3rem; display: block; margin-bottom: 12px; opacity: 0.6; }
        .gh-empty h4 { color: var(--text); margin-bottom: 6px; font-size: 1.1rem; }
        .gh-empty p { font-size: 0.85rem; max-width: 320px; margin: 0 auto; }
        .gh-list { display: flex; flex-direction: column; gap: 14px; }
        .gh-card {
          background: var(--bg2); border: 1px solid var(--border); border-radius: 14px;
          padding: 16px; transition: transform 0.2s, border-color 0.2s;
        }
        .gh-card:hover { border-color: var(--primary); transform: translateY(-2px); }
        .gh-card-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 12px;
        }
        .gh-date { font-size: 0.75rem; color: var(--text-muted); margin-left: 8px; }
        .gh-rounds-tag { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }
        .gh-winner-row {
          display: flex; align-items: center; gap: 10px; background: rgba(255,215,0,0.08);
          border: 1px solid rgba(255,215,0,0.25); border-radius: 10px; padding: 8px 12px; margin-bottom: 12px;
        }
        .gh-crown { font-size: 1.5rem; }
        .gh-winner-label { font-size: 0.7rem; text-transform: uppercase; color: var(--gold); font-weight: 700; }
        .gh-winner-name { font-size: 1rem; font-weight: 800; color: var(--text); }
        .gh-score { color: var(--gold); font-weight: 900; }
        .gh-player-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
        .gh-player-chip {
          background: var(--surface2); padding: 4px 8px; border-radius: 6px;
          font-size: 0.75rem; color: var(--text-muted);
        }
        .gh-player-chip strong { color: var(--text); }
        .gh-rematch-btn {
          width: 100%; padding: 8px; border-radius: 8px; border: 1px dashed var(--primary);
          background: rgba(108,99,255,0.08); color: var(--primary); font-size: 0.8rem;
          font-weight: 700; cursor: pointer; transition: all 0.2s;
        }
        .gh-rematch-btn:hover { background: var(--primary); color: white; }
        .gh-footer {
          padding: 12px 20px; border-top: 1px solid var(--border);
          display: flex; justify-content: space-between; background: rgba(26, 25, 51, 0.6);
        }
      `}</style>
    </div>
  );
}
