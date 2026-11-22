# omori-browser

Play **OMORI** in a browser tab, offline, as a set of local HTML "discs":
open `00.html` and play; when the story moves past a chunk's content the
game tells you to open the next file (`01.html`, ...). Progress moves
between files with a long copy-paste save code, old-game password style,
so it works even where browser storage is locked down.

This repo holds the **engine and tooling only**. No game files. You supply
your own legally owned copy of OMORI (the RPG Maker MV `www/` folder); the
packer turns it into the browser build on your machine.

## Why it needs tooling

RPG Maker MV's web build loads `data/*.json` and audio with XHR/fetch,
which browsers block on `file://`. The packer rewrites the game so:

- every `data/*.json` becomes an inline JS global (no XHR),
- audio is forced down the HTMLAudio path (`<audio>` works on file://),
- fonts are injected as CSS `@font-face`,
- a save-transfer plugin adds export/import codes.

## Usage

```
python3 tools/pack.py /path/to/OMORI/www  dist/        # build
# then open dist/00.html in Chrome/Edge
```

Optional chunking ("discs"):

```
python3 tools/pack.py /path/to/OMORI/www dist/ --chunk-mb 400
```

Splitting is by asset size; the story flag that needs the next chunk shows
the transfer code automatically (see src/save-transfer.js).

## Layout

```
tools/pack.py         build tool: www/ -> dist/*.html + assets
src/loader-shim.js    file:// fixes (DataManager, audio, fonts)
src/save-transfer.js  export/import save codes (LZString, RPG* keys)
templates/chunk.html  the page template every chunk is built from
```

## Save codes

Export copies every `RPG*` localStorage key (RPG Maker MV's save slots,
already LZString-compressed by the engine) into one long base64 code.
Import pastes it back. No storage needed, works anywhere.

## Legal

OMORI is (c) OMOCAT, LLC. This repository contains no OMORI assets, code
or data; it is a personal-use launcher for a copy of the game you already
own, in the same spirit as the owner's other personal ports. Do not put
game files in this repo or its forks. Not affiliated with OMOCAT or
Playism.
