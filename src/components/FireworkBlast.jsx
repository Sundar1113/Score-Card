import { useEffect, useRef, useState } from "react";
import { soundFx } from "../utils/soundEffects";

const COLOR_PALETTES = [
  ["#FF1361", "#FFF800", "#FF0364", "#00F0FF", "#7000FF"],
  ["#FFD700", "#FFA500", "#FF4500", "#FF69B4", "#00FFFF"],
  ["#00FF87", "#60EFFF", "#9B51E0", "#FF5E3A", "#FFDC00"],
  ["#FF007F", "#7928CA", "#00DFD8", "#FF4B4B", "#F9CB28"],
];

export default function FireworkBlast({ enableSound = true }) {
  const canvasRef = useRef(null);
  const [blastsFired, setBlastsFired] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const rockets = [];
    const particles = [];
    const confettis = [];

    // Initialize initial ambient floating confetti
    for (let i = 0; i < 70; i++) {
      confettis.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        w: Math.random() * 10 + 6,
        h: Math.random() * 6 + 4,
        color: COLOR_PALETTES[0][Math.floor(Math.random() * 5)],
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2.5 + 1.8,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.1,
        opacity: Math.random() * 0.5 + 0.5,
      });
    }

    const spawnBlast = (x, y, palette, count = 75) => {
      if (enableSound && Math.random() > 0.3) {
        soundFx.playBlast();
      }
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7 + 2;
        const color = palette[Math.floor(Math.random() * palette.length)];
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          decay: Math.random() * 0.015 + 0.012,
          color,
          size: Math.random() * 3.5 + 1.5,
          gravity: 0.12,
          drag: 0.96,
          sparkle: Math.random() > 0.4,
        });
      }
      setBlastsFired((prev) => prev + 1);
    };

    const spawnRocket = () => {
      const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
      const startX = Math.random() * (width * 0.8) + width * 0.1;
      const targetY = Math.random() * (height * 0.45) + height * 0.1;
      const speed = Math.random() * 4 + 10;
      rockets.push({
        x: startX,
        y: height + 10,
        targetY,
        vx: (Math.random() - 0.5) * 2.5,
        vy: -speed,
        palette,
        trail: [],
      });
    };

    let lastRocketTime = 0;
    const rocketInterval = 450; // Continuously blast every 450ms!

    const loop = (timestamp) => {
      // Clear with slight trailing opacity for motion blur
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      // Spawn new rockets continuously
      if (timestamp - lastRocketTime > rocketInterval) {
        spawnRocket();
        if (Math.random() > 0.4) spawnRocket(); // double blast occasionally
        lastRocketTime = timestamp;
      }

      // Update & Draw Rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.trail.push({ x: r.x, y: r.y, alpha: 0.8 });
        if (r.trail.length > 7) r.trail.shift();

        r.x += r.vx;
        r.y += r.vy;
        r.vy *= 0.985;

        // Draw trail
        r.trail.forEach((p, idx) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, idx * 0.5 + 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 220, 150, ${(idx / r.trail.length) * 0.8})`;
          ctx.fill();
        });

        // Explode condition
        if (r.y <= r.targetY || r.vy >= -1.5) {
          spawnBlast(r.x, r.y, r.palette);
          rockets.splice(i, 1);
        }
      }

      // Update & Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        const currentSize = p.sparkle && Math.random() > 0.5 ? p.size * 1.5 : p.size;
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Update & Draw Ambient Floating Confetti
      ctx.globalCompositeOperation = "source-over";
      for (let i = 0; i < confettis.length; i++) {
        const c = confettis[i];
        c.y += c.vy;
        c.x += c.vx + Math.sin(c.y * 0.02) * 0.8;
        c.rot += c.vRot;

        if (c.y > height + 20) {
          c.y = -20;
          c.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.globalAlpha = c.opacity;
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    // Initial burst immediately
    spawnBlast(width * 0.3, height * 0.3, COLOR_PALETTES[0], 80);
    spawnBlast(width * 0.7, height * 0.28, COLOR_PALETTES[1], 80);
    spawnBlast(width * 0.5, height * 0.22, COLOR_PALETTES[2], 100);

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [enableSound]);

  return (
    <div className="fireworks-container" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          background: "rgba(15, 14, 23, 0.7)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 215, 0, 0.3)",
          borderRadius: "20px",
          padding: "4px 12px",
          fontSize: "0.75rem",
          color: "var(--gold)",
          fontWeight: "700",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          pointerEvents: "auto",
        }}
      >
        <span>💥 Continuous Victory Blast</span>
      </div>
    </div>
  );
}
