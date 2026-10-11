// Decorative landing-page artwork only. Never used by application analytics.
export const previewSeries = Array.from({ length: 24 }, (_, i) => ({ time: `${String(i).padStart(2, '0')}:00`, responseTime: Math.round(100 + Math.sin(i * 1.4) * 30 + Math.cos(i * 0.7) * 22) }));
