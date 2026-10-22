# Birthday for Ma

A birthday garden for Alma Merong, made for her to open on a phone. Her birthday is October 22. The letter contains John's birthday message in his own words.

Live: https://zeref538.github.io/mama-birthday/

## Run locally

Run `python -m http.server 8080` from this folder, then open http://localhost:8080. The site uses plain HTML, CSS and JavaScript with no runtime packages.

Run `node --test tests/*.test.cjs` to check the effects and audio state handling. GitHub runs these checks on each push.

## Edit the letter

Open `index.html` and replace the paragraphs inside `id="personal-message"`. Keep the surrounding element so the letter layout continues to work. Push changes to main to publish through GitHub Pages.

## What's inside

The five candles can be tapped individually or blown out together to launch staggered fireworks. A bouquet grows into view and holds five birthday wishes. The envelope opens and closes smoothly, and the closing section offers a downloadable birthday card and a sharing button.

Music starts only when Play music is tapped. A short local audio file is used if synthesized audio is unavailable. The effects pause when out of view or hidden and respect the device's reduced-motion preference. Pause effects also stops them manually.

The page collects no data and uses no accounts or paid services. Three birthday portraits were made using the five photographs John supplied. The four-card collection offers full-size PNG downloads and smaller WebP page previews. The supplied Facebook profile was locked, so it contributes no personal claims.

## Assets

The display font is DM Serif Display, licensed under the included `assets/OFL.txt`. The SVG birthday card is the editable source for the PNG keepsake. To regenerate the fallback melody, run `python tools/render-melody.py` from this folder.

## Language

English is the default. Tap Filipino to switch the website, or use https://zeref538.github.io/mama-birthday/?lang=fil. Your personal message is never translated or overwritten. The downloadable card stays in English. The native letter and card remain available if scripts cannot load.
