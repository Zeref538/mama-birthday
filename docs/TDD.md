# Technical design

Static HTML, CSS and JavaScript are served directly by GitHub Pages. A framework would add a build and package maintenance without helping this greeting.

`script.js` handles the candles, flower wishes, native letter disclosure and sharing. `effects.js` owns one canvas, 20 ambient fireflies and at most 50 burst particles. `music.js` schedules a finite birthday melody after an explicit tap and uses a local WAV fallback when Web Audio is unavailable.

Motion pauses when the scene leaves view, the tab is hidden, the user presses Pause effects, or reduced motion is enabled. Cache the preference from the change event instead of reading it every drawing frame; the live Edge test found that repeated reads interfered with change notification. No text fades to unreadable colors during opening transitions.

Native share falls back to clipboard and then a selectable URL. Audio failures show a message. Native details works without JavaScript. The PNG keepsake is directly downloadable. No data is stored or sent by the site.

Run the dependency-free Node tests for replay, cancellation and cleanup. Browser QA covers phone and desktop widths, keyboard, long letters, reduced motion, native audio fallback and blocked sharing. Publication is a fast-forward merge to main followed by a live build and browser check. Roll back with git revert.

copy.js contains plain-text English and Filipino dictionaries. data-copy marks static interface text; dynamic state is rendered through the same dictionary. The personal message has no translation markers. The only URL option is the whitelisted language value fil; other values use English. No data is saved.
