"use client";

import confetti from "canvas-confetti";

export function fireCelebrationConfetti() {
  try {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ["#06b6d4", "#3b82f6", "#10b981", "#ec4899", "#8b5cf6"],
    });
    fire(0.2, {
      spread: 60,
      colors: ["#ffd700", "#ff6b6b", "#4ecdc4", "#45b7d1"],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  } catch (err) {
    console.warn("Confetti effect skipped:", err);
  }
}

export function fireSuccessBurst(origin?: { x: number; y: number }) {
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: origin || { y: 0.6 },
      colors: ["#10b981", "#06b6d4", "#6366f1"],
      zIndex: 9999,
    });
  } catch (err) {
    console.warn("Success burst skipped:", err);
  }
}

export function fireFireworksConfetti() {
  try {
    const end = Date.now() + 1200;
    const colors = ["#ec4899", "#06b6d4", "#ffd700", "#a855f7", "#10b981"];
    (function frame() {
      confetti({
        particleCount: 8,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors,
        zIndex: 9999,
      });
      confetti({
        particleCount: 8,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors,
        zIndex: 9999,
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch (err) {
    console.warn("Fireworks skipped:", err);
  }
}
