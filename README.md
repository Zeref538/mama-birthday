# Birthday for Ma

A birthday garden for Alma Merong, made for her to open on a phone. Her birthday is October 22. The personal letter is a clearly marked placeholder until John writes it.

Live: https://zeref538.github.io/mama-birthday/

## Run locally

Run `python -m http.server 8080` from this folder, then open http://localhost:8080. The site uses plain HTML, CSS and JavaScript with no runtime packages.

Run `node --test tests/*.test.cjs` to check the effects and audio state handling. GitHub runs these checks on each push.

## Edit the letter

Open `index.html` and replace the paragraphs inside `id="personal-message"`. Keep the surrounding element so the letter layout continues to work. Push changes to main to publish through GitHub Pages.

## What's inside

The five candles can be tapped individually or blown out together. A bouquet holds five birthday wishes. The letter opens inline, and the closing section offers a downloadable birthday card and a sharing button.

Music starts only when Play music is tapped. A short local audio file is used if synthesized audio is unavailable. The effects pause when out of view or hidden and respect the device's reduced-motion preference. Pause effects also stops them manually.

The page collects no data and uses no accounts or paid services. Facebook's supplied profile was locked, so it contributes no photographs or personal claims.

## Assets

The display font is DM Serif Display, licensed under the included `assets/OFL.txt`. The SVG birthday card is the editable source for the PNG keepsake. To regenerate the fallback melody, run `python tools/render-melody.py` from this folder.
