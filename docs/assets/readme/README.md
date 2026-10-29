# README artwork

The repository README matches the navy, teal, neutral surfaces and DIN Alternate display typography of [Jermaine Ragsdale’s profile](https://github.com/jmragsdale) and the [ThinkScript library](https://github.com/jmragsdale/trading-thinkscript). The header has a mobile variant; the six cards have light and dark variants and wrap on smaller screens. Ordinary links and alt text expose the same destinations.

PNG exports preserve typography across devices. Editable SVG sources are included. The current exports use the macOS DIN Alternate system font; no font files are redistributed. Arial Narrow or Arial are used when that font is unavailable. Viewing the README requires no external image or font service.

To regenerate, install Sharp in a temporary build environment (`npm install --no-save sharp`) and run `node tools/build-readme-art.cjs` from the repository root. The Pine-file count is read from the root directory; review the other labels, README text and alt text when the repository content changes. The artwork build does not compile Pine or execute the Python research model.

Historical results are deliberately not displayed as indicator performance. The root README links to the single retained research record rather than duplicating its datasets, results or parameter selection.
