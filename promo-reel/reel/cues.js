// reel/cues.js: 120.0s (2m 00s) Timeline for Vyoma POS Kinetic Promo Reel @ 120 BPM
// 60 bars total (1 bar = 2.0s, 1 beat = 0.5s). Pure visual motion, zero voiceover.
var KCUE = (() => {
  const B = n => +(n * 0.5).toFixed(4);
  const S = {
    open: 0,           // 0.0s - 8.0s: The Dining Disruption & Hook
    native: 8.0,       // 8.0s - 22.0s: Native Dual Binaries (.exe & .apk)
    speed: 22.0,       // 22.0s - 34.0s: Sub-50ms KOT Dispatch & 0.4ms Local Relay
    security: 34.0,    // 34.0s - 48.0s: Static IP Network Whitelist & SQLite Failover
    modules: 48.0,     // 48.0s - 64.0s: 8 Unified Subsystems (Captain, KDS, Rail, Counter)
    aggregator: 64.0,  // 64.0s - 76.0s: Swiggy & Zomato Direct Omnichannel Sync
    aiUpsell: 76.0,    // 76.0s - 90.0s: Flagship AI Engine (+24.6% Avg Check Lift)
    pricing: 90.0,     // 90.0s - 104.0s: Transparent Investment (₹3,999 / ₹25k / ₹40k)
    vipSuite: 104.0,   // 104.0s - 114.0s: VIP Flagship Package & Free Web Suite
    end: 114.0         // 114.0s - 120.0s: Full System Trace & Live Demo CTA
  };

  return {
    bpm: 120,
    fps: 30,
    dur: 120.0,
    B,
    S,
    CH: [
      ['01 INTRO', 0, 8.0],
      ['02 NATIVE ENGINE', 8.0, 34.0],
      ['03 IP SECURITY', 34.0, 48.0],
      ['04 8 MODULES & OMNICHANNEL', 48.0, 76.0],
      ['05 AI REVENUE ENGINE', 76.0, 90.0],
      ['06 PRICING & VIP SUITE', 90.0, 114.0],
      ['07 LAUNCH DEMO', 114.0, 120.0]
    ],
    hits: {
      introDot: 1.0,
      introCrest: 2.5,
      nativeBadges: [10.0, 13.0, 16.0, 19.0],
      speedOdo: 24.0,
      secShield: 36.0,
      secGates: [38.5, 42.0, 45.0],
      modGrid: [50.0, 54.0, 58.0, 61.5],
      aggTokens: [66.0, 68.5, 71.0, 73.5],
      aiRoll: 78.5,
      pricePills: [92.0, 95.5, 99.0],
      vipHighlights: [106.0, 108.5, 111.0],
      finaleLogo: 115.0,
      glitch: 118.5,
      endDot: 119.5
    }
  };
})();

if (typeof module !== 'undefined') module.exports = KCUE;
