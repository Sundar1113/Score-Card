import { useState } from "react";
import GameSetup from "./components/GameSetup";
import PlayerSetup from "./components/PlayerSetup";
import ScoreEntry from "./components/ScoreEntry";
import Results from "./components/Results";
import GameTools from "./components/GameTools";
import GameHistoryModal from "./components/GameHistoryModal";
import { soundFx } from "./utils/soundEffects";
import "./App.css";

const STEP_LABELS = [
  { label: "Game Title", icon: "🎮" },
  { label: "Players", icon: "👥" },
  { label: "Score Entry", icon: "📊" },
  { label: "Championship", icon: "🏆" },
];

export default function App() {
  const [step, setStep] = useState(0);
  const [gameName, setGameName] = useState("");
  const [winRule, setWinRule] = useState("highest"); // 'highest' | 'lowest'
  const [targetScore, setTargetScore] = useState(null);
  const [players, setPlayers] = useState([]);
  const [rounds, setRounds] = useState([]);

  // Modals & Sound
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const toggleSound = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    if (!muted) soundFx.playClick();
  };

  // Step Handlers
  const handleGameSetup = ({ gameName: gn, winRule: wr, targetScore: ts }) => {
    setGameName(gn);
    setWinRule(wr);
    setTargetScore(ts);
    setStep(1);
  };

  const handlePlayerSetup = (configuredPlayers) => {
    setPlayers(configuredPlayers.map((p) => ({ ...p, total: 0 })));
    setRounds([]);
    setStep(2);
  };

  const handleScoreFinish = (finalRounds) => {
    const totals = {};
    players.forEach((p) => {
      totals[p.name] = 0;
    });
    finalRounds.forEach((round) => {
      round.scores.forEach(({ name, score }) => {
        totals[name] = (totals[name] || 0) + score;
      });
    });
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        total: totals[p.name] || 0,
      }))
    );
    setRounds(finalRounds);
    setStep(3);
  };

  // Brand New Game
  const handleRestart = () => {
    setGameName("");
    setWinRule("highest");
    setTargetScore(null);
    setPlayers([]);
    setRounds([]);
    setStep(0);
  };

  // Rematch with identical players
  const handleRematch = () => {
    setPlayers((prev) => prev.map((p) => ({ ...p, total: 0 })));
    setRounds([]);
    setStep(2);
    soundFx.playSuccess();
  };

  // Load from history modal
  const handleReplayFromHistory = (item) => {
    setGameName(item.gameName || "Game");
    setWinRule(item.winRule || "highest");
    setTargetScore(null);
    setPlayers(
      (item.standings || []).map((p, i) => ({
        name: p.name,
        avatar: ["🦁", "🐯", "🐺", "🦊", "🐉", "🦄"][i % 6],
        color: ["#6c63ff", "#ff6584", "#43d9ad", "#ffc75f"][i % 4],
        total: 0,
      }))
    );
    setRounds([]);
    setStep(2);
  };

  return (
    <div className="app-wrapper">
      {/* Top Utility Bar */}
      <div className="app-topbar">
        <div className="app-brand">
          <span className="app-logo-badge">⚡</span>
          <span className="app-brand-name">ScoreBoard Pro</span>
        </div>

        <div className="app-topbar-actions">
          {/* Sound Toggle */}
          <button
            type="button"
            className="topbar-icon-btn"
            onClick={toggleSound}
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>

          {/* Match Archives */}
          <button
            type="button"
            className="topbar-btn"
            onClick={() => {
              soundFx.playClick();
              setIsHistoryOpen(true);
            }}
          >
            📜 Match Archives
          </button>

          {/* Companion Mini Tools */}
          <button
            type="button"
            className="topbar-btn topbar-btn-highlight"
            onClick={() => {
              soundFx.playClick();
              setIsToolsOpen(true);
            }}
          >
            🎲 Game Tools
          </button>
        </div>
      </div>

      {/* Main Header */}
      <header className="app-header">
        <div className="header-icon">🏆</div>
        <h1 className="app-title">ScoreBoard Pro</h1>
        <p className="app-subtitle">
          Real-time Score Calculation &amp; Championship Hub
        </p>
      </header>

      {/* Modern Stepper Indicator */}
      <div className="stepper">
        {STEP_LABELS.map((item, idx) => (
          <div
            key={idx}
            className={[
              "stepper-item",
              idx <= step ? "active" : "",
              idx === step ? "current" : "",
            ]
              .join(" ")
              .trim()}
          >
            <div className="stepper-circle">
              {idx < step ? "✓" : item.icon}
            </div>
            <span className="stepper-label">{item.label}</span>
            {idx < STEP_LABELS.length - 1 && (
              <div
                className={[
                  "stepper-line",
                  idx < step ? "filled" : "",
                ]
                  .join(" ")
                  .trim()}
              />
            )}
          </div>
        ))}
      </div>

      {/* Active Screen Container */}
      <main className="main-card">
        {step === 0 && (
          <GameSetup
            onNext={handleGameSetup}
            initialGameName={gameName}
            initialWinRule={winRule}
          />
        )}
        {step === 1 && (
          <PlayerSetup
            gameName={gameName}
            winRule={winRule}
            targetScore={targetScore}
            initialPlayers={players}
            onNext={handlePlayerSetup}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <ScoreEntry
            gameName={gameName}
            winRule={winRule}
            targetScore={targetScore}
            players={players}
            onFinish={handleScoreFinish}
            onBack={() => setStep(1)}
            onOpenTools={() => setIsToolsOpen(true)}
          />
        )}
        {step === 3 && (
          <Results
            gameName={gameName}
            winRule={winRule}
            players={players}
            rounds={rounds}
            onRestart={handleRestart}
            onRematch={handleRematch}
          />
        )}
      </main>

      {/* Footer requirement */}
      <footer className="app-footer">
        <div className="footer-content">
          <p className="footer-main-text">
            developed and powered by Sundar made for the innovative games
          </p>
          <p className="footer-sub-text">
            🎮 Modern score tracking, continuous celebration blasts &amp; live analytics
          </p>
        </div>
      </footer>

      {/* Global Modals */}
      <GameTools
        players={players}
        isOpen={isToolsOpen}
        onClose={() => setIsToolsOpen(false)}
      />

      <GameHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onReplayGame={handleReplayFromHistory}
      />
    </div>
  );
}