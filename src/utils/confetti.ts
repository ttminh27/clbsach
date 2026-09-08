import confetti from 'canvas-confetti';

/**
 * Fires a subtle, lightweight burst of confetti when reacting.
 */
export function fireReactionConfetti(type: string, clientX?: number, clientY?: number) {
  try {
    let colors = ['#10b981', '#06b6d4', '#3b82f6'];
    if (type === 'love' || type === 'heart') colors = ['#f43f5e', '#fb7185', '#fda4af', '#e11d48'];
    if (type === 'haha') colors = ['#f59e0b', '#fbbf24', '#fde68a'];
    if (type === 'surprise') colors = ['#8b5cf6', '#a855f7', '#c084fc'];
    if (type === 'like') colors = ['#3b82f6', '#60a5fa', '#93c5fd'];

    const origin =
      clientX !== undefined && clientY !== undefined
        ? { x: Math.max(0, Math.min(1, clientX / window.innerWidth)), y: Math.max(0, Math.min(1, clientY / window.innerHeight)) }
        : { x: 0.5, y: 0.7 };

    confetti({
      particleCount: 22,
      spread: 55,
      startVelocity: 24,
      ticks: 75,
      gravity: 1.3,
      origin,
      colors,
      disableForReducedMotion: true,
    });
  } catch {
    // Ignore in unsupported environments
  }
}
