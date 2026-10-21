# Verification

## Local browser evidence, October 22, 2026

Edge passed at 320, 375, 768 and 1440 CSS pixels: no horizontal overflow, letter disclosure, individual candles, full-cake wish and reset. These are browser emulations, not physical device tests.

The deeper Edge and WebKit paths cover keyboard selection, 44px candle targets, twelve rapid resets, all five flower wishes, duplicate picks, a 150-sentence letter, live reduced-motion changes, pause, offscreen idle, audio start/stop and sharing failure paths. The native WAV fallback plays in Windows WebKit, which does not expose AudioContext. No JavaScript errors or failed HTTP resources appeared in the completed runs.

Axe 4.14.0 returned zero violations in the closed and open letter states for WCAG A, AA, 2.1 AA and best-practice rules. The first run found unreadable text while the letter faded in; removing text opacity animation resolved it. Automated checks do not certify complete accessibility.

`node --test tests/*.test.cjs` passes 21 tests for effect limits, replay, cancellation, visibility, reduced motion and synthesized/native audio. Reintroducing the old preference polling failed a test; removing audio request cancellation failed two. The native replay test caught an older play promise pausing newer playback, which is now fixed.

A 4-second local Edge sample with CPU throttled fourfold recorded a maximum effects callback of 1.9ms across 583 callbacks, including skipped drawing frames. One 69ms long task appeared during startup; physical phone smoothness is unverified. Canvas density is capped at 1.5 device pixels per CSS pixel.

The letter's original 3D tilt briefly widened WebKit with long content. A small vertical reveal now keeps the 375px viewport at 375px throughout opening.

## Deployment

The initial site was verified live at c5443b8. Updated experience deployment pending. Facebook profile lookup was locked; only the user-supplied name and birthday are used.

A separate matrix covered 24 combinations across Edge, Chrome and WebKit at 320, 375, 390 (DPR 3), 430, 768, 1024, 1440 and landscape 812x375. Initial tablet targets were 43.03px; the 1100px responsive breakpoint now keeps them at least 44px. Text-only 200% enlargement initially widened 375px to 508px; min-width and headline wrapping now retain 375px. The font download is now 24,744-byte WOFF2 instead of 70,348-byte TTF. Matched loading comparison is running.

The music UI replay race was reproduced in a browser: a previous rejected request stopped a newer playing request. UI request ownership now ignores stale failures. A screen-reader status that still claimed music was playing after Stop now says Music stopped. The before/after reproduction confirms both.
