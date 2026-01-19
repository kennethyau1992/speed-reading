# RSVP Speed Reader

A React + Vite single-page app that replicates the RSVP (rapid serial visual presentation) speed-reading experience from ReadMultiplex. The interface is optimized for dark mode, supports English and CJK (Chinese/Japanese/Korean) text, and runs entirely in the browser.

## What This App Does

- Displays words or characters in a fixed focus box for speed reading.
- Highlights the optimal recognition point (ORP) in red for each token.
- Allows live adjustment of WPM, chunk size, and punctuation pause.
- Supports drag-and-drop `.txt` files or manual text input.
- Provides Play, Pause/Resume, and Stop controls.

## Project Structure

- `src/RSVPPage.jsx`: Main React component with RSVP logic and UI.
- `src/rsvpPage.css`: UI styles that match the original RSVP look.
- `src/App.jsx`: Renders the RSVP page as the single app view.
- `vite.config.js`: Sets the base path for GitHub Pages.
- `.github/workflows/deploy.yml`: GitHub Pages deployment workflow.

## How It Works (Step-by-Step)

1. **User input** is captured via textarea or dropped `.txt` file.
2. **Tokenization** converts input into display tokens:
   - Space-delimited text becomes words.
   - CJK characters become individual tokens.
   - Punctuation is attached to the preceding token.
3. **Playback** begins when Play is pressed:
   - A timer advances through tokens based on WPM.
   - Chunk size controls how many tokens appear per flash.
4. **Pause handling** applies extra delay when a token ends in punctuation.
5. **ORP highlighting** splits each token into left/ORP/right spans and colors the ORP red.
6. **Center alignment** uses measured widths to align the ORP at center.
7. **State controls** manage Play, Pause/Resume, and Stop transitions.

## Key Logic Tour

- Tokenization + ORP helpers live in `src/RSVPPage.jsx`.
- The RSVP timer uses `setTimeout` with dynamic delays.
- Sliders update the WPM/chunk/pause values in real time.
- `useLayoutEffect` centers the ORP after each display update.

## Development

```bash
cd rsvp
npm install
npm run dev
```

## Build + Static Export

```bash
npm run build
```

This outputs static files to `dist/` which can be hosted on GitHub Pages.

## Deployment (GitHub Pages)

1. Enable Pages: `https://github.com/kennethyau1992/speed-reading/settings/pages`
2. Set **Source** to **GitHub Actions**.
3. Push to `main` to trigger deployment.

## Spec Kit Format

- `spec.md` contains the feature spec formatted to the Spec Kit style.
