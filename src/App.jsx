import { useState } from "react";
import GameSetup from "./components/GameSetup";
import PlayerSetup from "./components/PlayerSetup";
import ScoreEntry from "./components/ScoreEntry";
import Results from "./components/Results";
import "./App.css";

const STEP_LABELS = ["Game Setup", "Players", "Score Entry", "Results"];

export default function App() {
  const [step, setStep] = useState(0);
  const [gameName, setGameName] = useState("");
  const [players, setPlayers] = useState([]);
  const [rounds, setRounds] = useState([]);

  const handleGameSetup = ({ gameName: gn }) => { setGameName(gn); setStep(1); };

  const handlePlayerSetup = (playerNames) => {
    setPlayers(playerNames.map((name) => ({ name, total: 0 })));
    setRounds([]); setStep(2);
  };

  const handleScoreFinish = (finalRounds) => {
    const totals = {};
    players.forEach((p) => { totals[p.name] = 0; });
    finalRounds.forEach((round) =>
      round.scores.forEach(({ name, score }) => { totals[name] = (totals[name] || 0) + score; })
    );
    setPlayers((prev) => prev.map((p) => ({ ...p, total: totals[p.name] || 0 })));
    setRounds(finalRounds); setStep(3);
  };

  const handleRestart = () => { setGameName(""); setPlayers([]); setRounds([]); setStep(0); };

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="header-icon">🏆</div>
        <h1 className="app-title">ScoreBoard Pro</h1>
        <p className="app-subtitle">Track scores · Crown champions</p>
      </header>
      <div className="stepper">
        {STEP_LABELS.map((label, idx) => (
          <div key={idx} className={["stepper-item", idx <= step ? "active" : "", idx === step ? "current" : ""].join(" ").trim()}>
            <div className="stepper-circle">{idx < step ? "✓" : idx + 1}</div>
            <span className="stepper-label">{label}</span>
            {idx < STEP_LABELS.length - 1 && (
              <div className={["stepper-line", idx < step ? "filled" : ""].join(" ").trim()} />
            )}
          </div>
        ))}
      </div>
      <main className="main-card">
        {step === 0 && <GameSetup onNext={handleGameSetup} />}
        {step === 1 && <PlayerSetup gameName={gameName} onNext={handlePlayerSetup} onBack={() => setStep(0)} />}
        {step === 2 && <ScoreEntry gameName={gameName} players={players} onFinish={handleScoreFinish} onBack={() => setStep(1)} />}
        {step === 3 && <Results gameName={gameName} players={players} rounds={rounds} onRestart={handleRestart} />}
      </main>
      <footer className="app-footer">ScoreBoard Pro — Built for champions 🎮</footer>
    </div>
  );
}