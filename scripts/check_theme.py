#!/usr/bin/env python3
"""Parse the Dark Sun theme and enforce contrast and coverage targets.

Main editor text must clear WCAG AAA (7:1). Comments, token colors, the
readable terminal ANSI colors, and the primary UI text pairs must clear
WCAG AA for normal text (4.5:1). ANSI black is the dark well color used as
a TUI background, so it is checked only for a valid hex.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "package.json"
THEME = ROOT / "themes" / "dark-sun-color-theme.json"
AA = 4.5
AAA = 7.0

REQUIRED_SCOPES = (
    "keyword",
    "string",
    "comment",
    "entity.name.function",
    "entity.name.class",
    "variable.parameter",
    "variable.other.property",
    "constant.numeric",
    "support.function.builtin",
    "keyword.operator",
    "string.regexp",
    "keyword.control.import",
    "entity.name.tag",
    "punctuation.definition.interpolation",
    "punctuation.definition.decorator",
)

REQUIRED_SEMANTIC = (
    "keyword",
    "string",
    "number",
    "regexp",
    "comment",
    "function",
    "method",
    "class",
    "parameter",
    "property",
    "decorator",
    "type",
    "variable",
    "operator",
)

# Readable ANSI slots. ansiBlack is a dark background color, not body text.
ANSI_TEXT = (
    "terminal.ansiRed",
    "terminal.ansiGreen",
    "terminal.ansiYellow",
    "terminal.ansiBlue",
    "terminal.ansiMagenta",
    "terminal.ansiCyan",
    "terminal.ansiWhite",
    "terminal.ansiBrightBlack",
    "terminal.ansiBrightRed",
    "terminal.ansiBrightGreen",
    "terminal.ansiBrightYellow",
    "terminal.ansiBrightBlue",
    "terminal.ansiBrightMagenta",
    "terminal.ansiBrightCyan",
    "terminal.ansiBrightWhite",
)


def rel_lum(rgb: tuple[int, int, int]) -> float:
    def channel(value: int) -> float:
        c = value / 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    r, g, b = rgb
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)


def parse_hex(value: str) -> tuple[tuple[int, int, int], float] | None:
    if not isinstance(value, str) or not value.startswith("#"):
        return None
    hex_digits = value[1:]
    if len(hex_digits) not in (3, 4, 6, 8) or any(c not in "0123456789abcdefABCDEF" for c in hex_digits):
        return None
    if len(hex_digits) <= 4:
        hex_digits = "".join(c * 2 for c in hex_digits)
    rgb = tuple(int(hex_digits[i : i + 2], 16) for i in (0, 2, 4))
    alpha = int(hex_digits[6:8], 16) / 255 if len(hex_digits) == 8 else 1.0
    return rgb, alpha  # type: ignore[return-value]


def contrast(foreground: str, background: str) -> float | None:
    fg = parse_hex(foreground)
    bg = parse_hex(background)
    if fg is None or bg is None:
        return None
    (fr, fg_, fb), fa = fg
    (br, bg_, bb), ba = bg
    if ba < 1:
        return None
    if fa < 1:
        fr, fg_, fb = (round(fa * fr + (1 - fa) * br), round(fa * fg_ + (1 - fa) * bg_), round(fa * fb + (1 - fa) * bb))
    hi = max(rel_lum((fr, fg_, fb)), rel_lum((br, bg_, bb)))
    lo = min(rel_lum((fr, fg_, fb)), rel_lum((br, bg_, bb)))
    return (hi + 0.05) / (lo + 0.05)


def scope_list(scope) -> list[str]:
    if isinstance(scope, str):
        return [part.strip() for part in scope.split(",")]
    if isinstance(scope, list):
        return [str(part) for part in scope]
    return []


def foreground_of(settings) -> str | None:
    if isinstance(settings, str):
        return settings
    if isinstance(settings, dict):
        value = settings.get("foreground")
        return value if isinstance(value, str) else None
    return None


def main() -> int:
    failures: list[str] = []
    package = json.loads(PACKAGE.read_text())
    theme = json.loads(THEME.read_text())
    themes = package.get("contributes", {}).get("themes", [])
    if len(themes) != 1:
        failures.append(f"expected exactly one contributed theme, found {len(themes)}")
    else:
        entry = themes[0]
        if entry.get("uiTheme") != "vs-dark":
            failures.append(f"uiTheme must be vs-dark, found {entry.get('uiTheme')!r}")
        if entry.get("path") != "./themes/dark-sun-color-theme.json":
            failures.append(f"unexpected theme path {entry.get('path')!r}")
    if any(item.get("uiTheme") == "vs" for item in themes):
        failures.append("light theme uiTheme 'vs' is not allowed")

    colors = theme.get("colors")
    if not isinstance(colors, dict):
        failures.append("theme.colors missing")
        colors = {}
    for key, value in colors.items():
        if parse_hex(value) is None:
            failures.append(f"invalid color {key}: {value!r}")

    def pair(fg_key: str, bg_key: str, minimum: float) -> None:
        fg = colors.get(fg_key)
        bg = colors.get(bg_key)
        ratio = contrast(fg, bg) if isinstance(fg, str) and isinstance(bg, str) else None
        if ratio is None:
            failures.append(f"missing contrast pair {fg_key} on {bg_key}")
            return
        if ratio < minimum:
            failures.append(f"{fg_key} on {bg_key} is {ratio:.2f}:1, need {minimum:.1f}:1")

    pair("editor.foreground", "editor.background", AAA)
    pair("sideBar.foreground", "sideBar.background", AA)
    pair("sideBarTitle.foreground", "sideBar.background", AA)
    pair("activityBar.foreground", "activityBar.background", AA)
    pair("activityBar.inactiveForeground", "activityBar.background", AA)
    pair("tab.activeForeground", "tab.activeBackground", AA)
    pair("tab.inactiveForeground", "tab.inactiveBackground", AA)
    pair("statusBar.foreground", "statusBar.background", AA)
    pair("statusBar.debuggingForeground", "statusBar.debuggingBackground", AA)
    pair("list.activeSelectionForeground", "list.activeSelectionBackground", AA)
    pair("list.hoverForeground", "list.hoverBackground", AA)
    pair("input.foreground", "input.background", AA)
    pair("input.placeholderForeground", "input.background", AA)
    pair("button.foreground", "button.background", AA)
    pair("button.secondaryForeground", "button.secondaryBackground", AA)
    pair("badge.foreground", "badge.background", AA)
    pair("activityBarBadge.foreground", "activityBarBadge.background", AA)
    pair("panelTitle.activeForeground", "panel.background", AA)
    pair("panelTitle.inactiveForeground", "panel.background", AA)
    pair("terminal.foreground", "terminal.background", AAA)
    pair("editorLineNumber.foreground", "editor.background", AA)
    pair("editorLineNumber.dimmedForeground", "editor.background", AA)
    pair("editorError.foreground", "editor.background", AA)
    pair("editorWarning.foreground", "editor.background", AA)
    pair("editorInfo.foreground", "editor.background", AA)
    pair("breadcrumb.foreground", "editor.background", AA)
    pair("titleBar.activeForeground", "titleBar.activeBackground", AA)
    pair("titleBar.inactiveForeground", "titleBar.inactiveBackground", AA)
    pair("statusBarItem.remoteForeground", "statusBarItem.remoteBackground", AA)
    pair("statusBarItem.errorForeground", "statusBarItem.errorBackground", AA)
    pair("gitDecoration.addedResourceForeground", "sideBar.background", AA)
    pair("gitDecoration.modifiedResourceForeground", "sideBar.background", AA)
    pair("gitDecoration.deletedResourceForeground", "sideBar.background", AA)
    pair("gitDecoration.untrackedResourceForeground", "sideBar.background", AA)
    pair("gitDecoration.ignoredResourceForeground", "sideBar.background", AA)
    pair("gitDecoration.conflictingResourceForeground", "sideBar.background", AA)
    for key in ANSI_TEXT:
        pair(key, "terminal.background", AA)
    if "terminal.ansiBlack" not in colors:
        failures.append("terminal.ansiBlack missing")

    editor_bg = colors.get("editor.background", "#000000")
    selection_bg = colors.get("editor.selectionBackground")
    seen_scopes: set[str] = set()
    comment_fg = None
    for rule in theme.get("tokenColors", []):
        scopes = scope_list(rule.get("scope"))
        seen_scopes.update(scopes)
        fg = foreground_of(rule.get("settings"))
        if fg is None:
            continue
        if parse_hex(fg) is None:
            failures.append(f"invalid token color {fg!r} for {scopes}")
            continue
        ratio = contrast(fg, editor_bg)
        if ratio is None or ratio < AA:
            failures.append(f"token {scopes} {fg} on editor is {ratio}:1")
        if "comment" in scopes:
            comment_fg = fg

    if comment_fg is None:
        failures.append("no comment token color")
    else:
        ratio = contrast(comment_fg, editor_bg)
        if ratio is None or ratio < AA:
            failures.append(f"comments {comment_fg} on editor are {ratio}:1")
        if isinstance(selection_bg, str) and parse_hex(selection_bg) and parse_hex(selection_bg)[1] == 1:
            selected = contrast(comment_fg, selection_bg)
            if selected is None or selected < AA:
                failures.append(f"comments {comment_fg} on selection {selection_bg} are {selected}:1")
            text_on_selection = contrast(colors.get("editor.foreground", ""), selection_bg)
            if text_on_selection is None or text_on_selection < AA:
                failures.append(f"editor text on selection is {text_on_selection}:1")

    for scope in REQUIRED_SCOPES:
        if not any(item == scope or item.startswith(scope + ".") for item in seen_scopes):
            failures.append(f"missing TextMate scope {scope}")

    semantic = theme.get("semanticTokenColors", {})
    for key in REQUIRED_SEMANTIC:
        if key not in semantic:
            failures.append(f"missing semantic token {key}")
            continue
        fg = foreground_of(semantic[key])
        if fg is None:
            continue
        ratio = contrast(fg, editor_bg)
        if ratio is None or ratio < AA:
            failures.append(f"semantic {key} {fg} on editor is {ratio}:1")

    if failures:
        print(f"{len(failures)} contrast/coverage failure(s):")
        for failure in failures:
            print(f"  - {failure}")
        return 1

    print(f"Dark Sun theme OK ({len(colors)} workbench colors, {len(theme.get('tokenColors', []))} token rules)")
    print(f"editor text {contrast(colors['editor.foreground'], editor_bg):.2f}:1")
    print(f"comments {contrast(comment_fg, editor_bg):.2f}:1 on editor, {contrast(comment_fg, selection_bg):.2f}:1 on selection")
    return 0


if __name__ == "__main__":
    sys.exit(main())
