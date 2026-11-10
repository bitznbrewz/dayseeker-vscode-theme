# Dark Sun

A dark-only VS Code theme sampled from the official covers of Dayseeker's *Dark Sun* (Spinefarm, November 4, 2022) and *Creature in the Black Night* (Spinefarm, October 24, 2025; art direction and design by Ryan Sanders). The editor is the eclipse: purple and pink neon, a little red, and blue on near-black.

![Python preview](images/preview-python.png)

![JavaScript and JSX preview](images/preview-javascript.png)

The previews above are rendered from `themes/dark-sun-color-theme.json` with TextMate grammars (Shiki) and this theme's workbench colors. `sample.py` and `sample.js` are the sources.

## Install

From a packaged extension:

```bash
npx @vscode/vsce package
code --install-extension dayseeker-theme-1.0.0.vsix
```

Then choose **Dark Sun** in the Color Theme picker. There is no light variant.

## Palette

Every swatch is a pixel from the 2000×2000 Apple Music master of one of the two covers. A few surfaces are the nearest real pixel to a regional median, at most one RGB level away, and the table says so. Nothing here is an invented neon.

![Palette](images/palette.png)

| Hex | Album | Where it comes from | Used for |
| --- | --- | --- | --- |
| `#1E111B` | Dark Sun | Eclipse core | Editor, terminal, activity bar, and title bar background |
| `#2E212B` | Dark Sun | Eclipse disk, nearest pixel to the disk median `#2E202B` | Sidebar, panel, and inactive tabs |
| `#281B25` | Dark Sun | Inner disk shadow, nearest pixel to the dark-fifth median `#281A25` | Inputs, line highlight, suggest and hover wells |
| `#374D5B` | Dark Sun | Outer starfield, nearest pixel to the corner median `#374C5B` | List hover, indent guides, chart lines |
| `#54879C` | Dark Sun | Muted blue in the outer ring | Dimmed line numbers |
| `#79A1BA` | Dark Sun | Dusty starfield blue, nearest pixel to `#79A0BA` | Comments, line numbers, inactive activity-bar icons, git ignored |
| `#83B4D2` | Dark Sun | Blue ring | Terminal blue |
| `#7EBBD0` | Dark Sun | Cyan-blue ring | Builtins (`print`, `len`, `self`), terminal cyan |
| `#9ECCE4` | Dark Sun | Bright blue ring | Functions, methods, links, info |
| `#AEE3E9` | Dark Sun | Brightest cyan edge of the ring | Terminal bright cyan, active links |
| `#FFEFF2` | Dark Sun | Corona / star white | Primary editor and UI text |
| `#F7B1BB` | Dark Sun | Pale pink ring | Parameters, operators, punctuation |
| `#F398A9` | Dark Sun | Rose ring | Properties, JSX attributes, JSON keys |
| `#FF8F9F` | Dark Sun | Hot pink ring | Strings, including quotes |
| `#FFA5DB` | Dark Sun | Magenta ring | Keywords, imports, JSX tags, focus, buttons, tab accent |
| `#F49BD5` | Dark Sun | Orchid ring | Interfaces and type aliases |
| `#E389BD` | Dark Sun | Mid magenta ring | Classes, types, terminal magenta |
| `#FFB07F` | Dark Sun | Amber ring | Numbers, constants, warnings, git modified |
| `#FFB680` | Dark Sun | Brighter amber on the same ring | Terminal bright yellow |
| `#75C07F` | Dark Sun | Green ring along the bottom of the eclipse | Git added, diff insertions, terminal green |
| `#A3E3A6` | Dark Sun | Bright green on that ring | Terminal bright green |
| `#412D46` | Creature in the Black Night | Violet foreground, nearest pixel to `#412C46` | Selection, status bar, active lists |
| `#4B365D` | Creature in the Black Night | Violet field, nearest pixel to `#4B355D` | Borders, scrollbars, widget outlines |
| `#8A3876` | Creature in the Black Night | Magenta flower field, nearest pixel to the field median `#8B3876` | Debugging status bar, incoming merge header |
| `#241212` | Creature in the Black Night | The figure's cloak | Error input background |
| `#FF877C` | Creature in the Black Night | Coral peak in the sky | Decorators and regex, the one warm token class; terminal bright red |
| `#FB968E` | Creature in the Black Night | Coral sky | String escapes |
| `#F95355` | Creature in the Black Night | Red along the lower sky | Errors, invalid tokens, git deletions, diff removals |

Red stays on errors and deletions. The coral `#FF877C` is the only other warm token color, and it is limited to decorators and regular expressions. Green exists on the *Dark Sun* cover, so additions and terminal green do not have to be faked out of the pinks.

## Contrast

Checked by `scripts/check_theme.py` against WCAG:

- Editor text `#FFEFF2` on `#1E111B` is **16.4:1** (AAA).
- Comments `#79A1BA` are **6.6:1** on the editor and **4.5:1** on the violet selection (AA). They are dimmer than the code without dropping under AA.
- Token colors, the readable terminal ANSI colors, git decorations, and the main chrome pairs (sidebar, tabs, status bar, inputs, buttons, badges) are required to clear **4.5:1** on their own backgrounds.

ANSI black is `#281B25`, the same dark well as the inputs. It is a TUI background color, not body text, so the check only requires it to be a valid hex.

```bash
python3 scripts/check_theme.py
```

GitHub Actions runs that script on push and pull request.

## What's covered

Workbench colors include the editor, sidebar, activity bar, tabs, status bar, panels, terminal ANSI colors, git decorations, diffs, errors and warnings, and bracket-pair colors. TextMate rules plus `semanticTokenColors` cover keywords, strings, f-strings and template literals, numbers, comments, functions and methods, classes, decorators, parameters, properties, builtins, operators, regex, imports, and JSX. The generic scopes also color TypeScript, JSON, Markdown, and CSS.

Semantic highlighting and bracket-pair guides are on by default via `configurationDefaults`.

## License

[MIT](LICENSE) © 2026 AyAyRon
