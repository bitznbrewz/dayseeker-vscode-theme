# Changelog

## 1.2.0

- Colored the Agents window from the current VS Code token list: shell, panels, gradient tint, chat input, session views, badges, the new-session button, feedback widgets, the welcome graphic, and the mobile diff markers. The aquarium easter egg has no theme colors and is left alone.
- The gradient tint is the flower-field magenta `#8A2672`. VS Code mixes that into the eclipse background from the bottom-right corner.

## 1.1.0

- Boosted the purple, pink, magenta, blue, and red accents slightly past the sampled pixels. Backgrounds, the corona white, amber, and green stay on the sampled values. The README table lists each boost.
- Added an opt-in neon glow for keywords, strings, the active tab, and the cursor line. It stays off until you enable it through Custom CSS and JS Loader. `Dark Sun: Enable Neon Glow` and `Dark Sun: Disable Neon Glow` add and remove the import.

## 1.0.0

- Initial dark-only theme sampled from the official *Dark Sun* (2022) and *Creature in the Black Night* (2025) covers.
- Workbench colors, TextMate token colors, and semantic token colors.
- Contrast check (`scripts/check_theme.py`) for editor text, comments, token colors, terminal ANSI colors, and the main UI chrome.
