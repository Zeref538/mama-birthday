# Design

Experience mode: a midnight birthday garden, with a large pink serif greeting and an illustrated cake. Letter opens inline; candles have one celebratory confetti moment. Dark plum #241525, pink #f3b7cf, muted rose #d3b8cd, pale lavender #f6edf7.

Seven considered worlds: flower-shop wrapping, family letter, birthday bakery, night sky, midnight garden, cut-paper party, photo album. Fifth direction selected by concept seed. Garden balances a grown-up greeting and a playful cake. Travel-board, manifesto and film-rail challengers sacrifice personal warmth; keep their readable state changes and firm hierarchy. Quilt and Riso add unnecessary texture. No invented family memories or photographs.

Phone: single column, heading before cake, minimum 44px controls. Desktop: spacious split composition. Georgia is the fallback to a locally hosted display serif. Respect reduced motion. Search-generated MASTER.md is exploratory; this document owns the implemented palette and typography.

## Experience expansion

Feature tier. Alma Merong is the confirmed name. Keep Ma as the greeting. Birthday remains October 22; the letter contains John's supplied message, split into three paragraphs without rewriting his wording. Retain the midnight garden visual world and deepen it with a circular botanical cake stage, a blooming bouquet, and a birthday wish finale.

Motion thesis: extinguishing the candles turns their light into a burst of gold and rose particles, then reveals the closing birthday wish. Candle flames flicker softly while visible. Bouquet blooms respond to touch and keyboard; letter opens with a paper reveal. Ambient particles are capped and paused offscreen, while the page is hidden, when motion is paused or when reduced motion is requested. No effects block reading. Optional sound starts only from an explicit control.

Performance budget: no runtime dependencies, one canvas with at most 110 particles (20 ambient plus 90 firework sparks), capped device-pixel ratio, no continuous full-page blur or shadows. Static artwork and text are always available.

Motion expansion: the greeting settles into place as the cake turns into view. Bouquet stems draw from the ribbon toward each flower, followed by staggered blooms. Visible flowers sway; stars turn around the cake. Blowing out the candles launches three delayed radial fireworks and an expanding halo. The envelope opens and closes through a measured height transition, with paper sliding into place. Entrance sequences run once per visit. Ambient CSS motion runs only while its section is visible. Pause, reduced motion and hidden pages finish active entrances and clear canvas effects. No message text fades through low contrast.

The closing section speaks as a son: "Love you always, Ma." Four tilted birthday keepsakes sit together in a two-column collection. Three photographic birthday portraits use the user's supplied photographs as likeness references; the fourth is the illustrated floral card. Each has a real PNG download. Smaller WebP previews keep the full-size portraits out of the page's initial downloads. Scroll gently offsets the garden, bouquet stems and keepsakes, using one scheduled update per scroll event batch. The letter is a folded envelope with a date postmark, wax seal and lined paper, with separate opening and closing flap motion.

The display font is served as a 24.7KB local WOFF2, with TTF retained as a fallback and SVG card source. Headline wrapping and grid minimum widths support enlarged text. The cake touch target layout switches at 1100px. A matching PNG keepsake is available in the closing section; the social preview uses the same artwork.

The optional Filipino greeting uses a smaller display scale so its longer words fit phone screens. Language changes keep control states and selected flowers. A clipped skip link becomes visible only on focus. Preload was rejected after three matched loading samples per font option showed it delaying first content on slow connections.

The visit begins with a sealed pink invitation on the midnight background. The opening tap starts the birthday melody and lifts the invitation screen away over 1.1 seconds. A quiet entry is equally available. Main-page controls stay inert until the curtain finishes; reduced motion skips the curtain. Audio failure never blocks entry. The opening remains hidden when scripts or translations fail.

Scroll now opens the pink dedication as a horizontal paper reveal, lifts section introductions and grows the connected bouquet. Each pair of keepsakes gathers toward the center at 72% scale and spreads to its full two-column pose as it enters view. These poses follow scrolling in both directions, without waiting for a timed animation. One requestAnimationFrame batches each set of scroll measurements and CSS variable updates. Pause and reduced motion return the content to its readable static pose.
