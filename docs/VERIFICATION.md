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

## Language and loading checks

The page offers an optional Filipino translation, with English as the default. `?lang=fil` opens Filipino directly; sharing preserves that selection. The personal letter is excluded from translation and keeps its original text. No language preference is stored.

Both languages passed at 320, 375, 768, 1024 and 1440px in Edge and WebKit, including state preservation across language switches. Axe returned zero violations in both languages in the sampled states. The Node suite now passes 24 tests, including matching translation keys and placeholders.

Blocking copy.js in Edge and WebKit leaves the native letter and card available, shows a readable refresh message and stops effects; no JavaScript exceptions occur. Audio replay browser checks still pass after localization.

Nine matched slow-network samples compared TTF, WOFF2, and WOFF2 preload, three per option at 100kbps download, 300ms latency and fourfold CPU throttling. Median first content/font-ready times were 5.212s/16.613s for TTF, 5.220s/9.170s for WOFF2, and 7.020s/7.143s with preload. Chose WOFF2 without preload to preserve first content timing. These samples preceded the language module and are a font comparison, not a final live load-time promise.

## Final live release

GitHub Pages release 94404ee was built and checked live at https://zeref538.github.io/mama-birthday/. Ten final browser/width combinations passed: Edge and WebKit at 320, 375, 768, 1024 and 1440px, including candle reset, all wishes, letter, language switching and music start/stop. No JavaScript or HTTP resource errors occurred. Six deployed text files matched local content and four binary assets matched SHA-256 hashes.

Both languages also passed 320px with text enlarged to 200%, with the letter open. Invalid language input used English, and all document IDs were unique. The local preview server was stopped. Improvements ended when the usage tool showed 9% remaining. The automatic dependency updater was removed and its two generated PRs closed to preserve the solo-repository workflow.

## Motion, letter and birthday collection expansion

The local motion pass covered eight browser/width combinations: Edge and WebKit at 320, 375, 768 and 1440px. It exercised the three-wave fireworks, all five flowers, opening and closing the envelope, reversing a transition, keyboard activation, pause and reduced motion. All passed without JavaScript errors. Axe returned zero violations in the sampled open-letter states in both engines at 375px.

Both engines downloaded all four cards at 375px; each result had a real PNG file signature. The portrait PNGs measure 941x1672, 940x1673 and 941x1672. The illustrated keepsake measures 1080x1440. Smaller portrait previews total 284,998 bytes, with full PNGs linked only for opening or download. All final portrait lettering was visually inspected after removing the signature words.

The Node suite passes 26 tests, including staggered fireworks, replay bounds, expiry and disabled-motion behavior. A pause check initially found five color/border hover transitions still running; paused controls now disable transitions too. A separate 320px check with text enlarged to 200% found the new closing heading extending to 339px; wrapping now keeps both languages within 320px with the letter open or closed, in both engines. Missing-copy checks preserve the native letter and card without JavaScript errors. Physical phone performance remains unmeasured.

Published runtime release: 264541e. GitHub's Birthday checks and Pages deployment both succeeded. The actual live URL passed four final combinations: Edge and WebKit at 375 and 1440px. These checks repeated fireworks, flowers, letter reversal, keyboard opening, motion pause, reduced motion and message display. Both browsers downloaded all four PNGs at 375px. Axe returned zero violations in English and Filipino in each browser's sampled 375px state. Seven live text files matched local source after normalizing line endings; all four card PNGs and all three WebP previews matched local SHA-256 hashes. A deliberate 91-spark mutation failed the new 90-spark regression test, then the restored effects suite passed.

## Opening invitation and stronger scroll motion

Eight local combinations passed in Edge and WebKit at 320, 375, 768 and 1440px. The opening kept main-page controls inert until its transition ended. The opening tap started music in both engines, and quiet entry remained silent. Scroll changed the first card pair from below 85% scale to full size and reversed to the original gathered pose. All four PNG downloads still worked at 375px in both engines. Pause removed the card transforms; reduced motion entered immediately without effects. Audio failure and disabled JavaScript both left the page accessible.

Axe returned zero violations for the English invitation at 375px and Filipino invitation at 320x568 in both engines. Switching to reduced motion during the curtain released the main page in both engines. Both languages still fit 320px with text enlarged to 200%, with the letter open or closed. Missing-copy fallback checks passed in both engines.

The Node suite now has 29 tests. Three new opening tests cover quiet entry, rapid repeated entry and interrupted animation. A deliberate mutation that stranded the page after interruption failed its regression test. Synthesized note gain increased from 0.14 to 0.28; native playback volume increased from 0.7 to 1 and its WAV was regenerated at higher amplitude. The regenerated WAV has 266,034 samples, lasts 12.06 seconds and peaks at 0.438, below clipping. In one Edge sample at 375px with fourfold CPU slowdown, 38 scroll update callbacks had median 0.5ms and maximum 0.8ms. This measures callback work only, not total frame painting or physical phone performance.
