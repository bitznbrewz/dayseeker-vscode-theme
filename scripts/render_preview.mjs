import { createHighlighter } from "shiki";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const theme = JSON.parse(readFileSync(resolve(root, "themes/dark-sun-color-theme.json"), "utf8"));
const python = readFileSync(resolve(root, "sample.py"), "utf8").replace(/\n$/, "");
const javascript = readFileSync(resolve(root, "sample.js"), "utf8").replace(/\n$/, "");

const highlighter = await createHighlighter({
  themes: [theme],
  langs: ["python", "jsx"],
});

function highlighted(code, lang) {
  const html = highlighter.codeToHtml(code, { lang, theme: theme.name });
  const lines = code.split("\n");
  const numbers = lines
    .map((_, index) => `<span>${String(index + 1).padStart(2, " ")}</span>`)
    .join("");
  return `<div class="code"><div class="gutter">${numbers}</div>${html}</div>`;
}

const c = theme.colors;
const css = `
  :root {
    color-scheme: dark;
    --bg: ${c["editor.background"]};
    --fg: ${c["editor.foreground"]};
    --side: ${c["sideBar.background"]};
    --well: ${c["input.background"]};
    --violet: ${c["statusBar.background"]};
    --border: ${c["sideBar.border"]};
    --magenta: ${c["activityBar.foreground"]};
    --dim: ${c["editorLineNumber.foreground"]};
    --text: ${c["editor.foreground"]};
    --pink: ${c["tab.activeBorderTop"]};
    --green: ${c["gitDecoration.addedResourceForeground"]};
    --amber: ${c["gitDecoration.modifiedResourceForeground"]};
    --red: ${c["gitDecoration.deletedResourceForeground"]};
    --coral: ${c["gitDecoration.conflictingResourceForeground"]};
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; background: var(--bg); }
  body {
    font-family: Inter, "Segoe UI", sans-serif;
    color: var(--text);
    width: 1440px;
    height: HEIGHT_PXpx;
    overflow: hidden;
  }
  .window { display: grid; grid-template-rows: 36px 1fr 28px; height: HEIGHT_PXpx; }
  .title {
    display: flex; align-items: center; gap: 8px;
    background: ${c["titleBar.activeBackground"]};
    color: ${c["titleBar.activeForeground"]};
    border-bottom: 1px solid ${c["titleBar.border"]};
    padding: 0 14px; font-size: 12px;
  }
  .title .dot { width: 10px; height: 10px; border-radius: 50%; background: var(--magenta); }
  .title span { color: var(--dim); margin-left: 8px; }
  .body { display: grid; grid-template-columns: 52px 248px 1fr; min-height: 0; }
  .activity {
    background: ${c["activityBar.background"]};
    border-right: 1px solid ${c["activityBar.border"]};
    display: flex; flex-direction: column; align-items: center; padding-top: 10px; gap: 16px;
  }
  .activity i {
    width: 22px; height: 22px; border-radius: 4px; display: block;
    border: 2px solid ${c["activityBar.inactiveForeground"]};
  }
  .activity i.on { border-color: var(--magenta); box-shadow: inset 3px 0 0 var(--magenta); }
  .sidebar {
    background: var(--side);
    border-right: 1px solid var(--border);
    padding: 12px 0;
  }
  .sidebar h2 {
    margin: 0 16px 10px; font-size: 11px; letter-spacing: 0.08em;
    color: ${c["sideBarTitle.foreground"]}; font-weight: 600;
  }
  .file { padding: 4px 16px; font-size: 13px; font-family: "JetBrains Mono", monospace; }
  .file.mod { color: var(--amber); }
  .file.add { color: var(--green); }
  .file.del { color: var(--red); text-decoration: line-through; }
  .file.untracked { color: var(--magenta); }
  .file.ignored { color: var(--dim); }
  .file.active { background: var(--violet); color: var(--text); text-decoration: none; }
  .editor { display: grid; grid-template-rows: 36px 1fr 78px; min-width: 0; min-height: 0; }
  .tabs { display: flex; background: ${c["editorGroupHeader.tabsBackground"]}; }
  .tab {
    padding: 8px 16px; font-size: 13px; color: ${c["tab.inactiveForeground"]};
    background: ${c["tab.inactiveBackground"]};
  }
  .tab.on {
    color: ${c["tab.activeForeground"]};
    background: ${c["tab.activeBackground"]};
    box-shadow: inset 0 2px 0 var(--pink);
  }
  .code {
    display: grid; grid-template-columns: 48px 1fr; min-height: 0; overflow: hidden;
    background: var(--bg);
  }
  .gutter {
    color: var(--dim); text-align: right; padding: 12px 8px 0 0;
    font-family: "JetBrains Mono", monospace; font-size: 13px; line-height: 1.55;
    background: ${c["editorGutter.background"]};
  }
  .gutter span { display: block; }
  .shiki, .shiki code {
    background: var(--bg) !important;
    font-family: "JetBrains Mono", monospace !important;
    font-size: 13px !important;
    line-height: 1.55 !important;
    margin: 0; padding: 12px 16px 0 8px;
  }
  .panel {
    background: ${c["panel.background"]};
    border-top: 1px solid ${c["panel.border"]};
    padding: 8px 12px;
  }
  .panel .label {
    font-size: 11px; letter-spacing: 0.06em; color: var(--text);
    border-bottom: 1px solid var(--magenta); display: inline-block; padding-bottom: 4px; margin-bottom: 8px;
  }
  .ansi { font-family: "JetBrains Mono", monospace; font-size: 12px; line-height: 1.5; }
  .status {
    background: var(--violet); color: var(--text);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 12px; font-size: 12px;
  }
  .status .remote { background: var(--magenta); color: ${c["statusBarItem.remoteForeground"]}; padding: 0 10px; height: 28px; display: flex; align-items: center; }
  .status .err { color: var(--red); margin-left: 12px; }
  .status .warn { color: var(--amber); margin-left: 12px; }
`;

function page(filename, lang, code, glow) {
  const lineCount = code.split("\n").length;
  const height = 36 + 36 + lineCount * 21 + 24 + 78 + 28;
  const chip = (key, name) => {
    const color = c[`terminal.${key}`];
    return `<span class="chip" style="color:${color};border-color:${color}">${name}</span>`;
  };
  const term = ["ansiBlack", "ansiRed", "ansiGreen", "ansiYellow", "ansiBlue", "ansiMagenta", "ansiCyan", "ansiWhite"]
    .map((key) => chip(key, key.replace("ansi", "").toLowerCase()))
    .join("");
  const bright = ["ansiBrightBlack", "ansiBrightRed", "ansiBrightGreen", "ansiBrightYellow", "ansiBrightBlue", "ansiBrightMagenta", "ansiBrightCyan", "ansiBrightWhite"]
    .map((key) => chip(key, key.replace("ansiBright", "").toLowerCase()))
    .join("");
  const cssSized = css.replaceAll("HEIGHT_PX", String(height));
  const glowCss = glow
    ? `
    body.glow .tab.on { box-shadow: inset 0 2px 0 ${c["editorBracketHighlight.foreground1"]}, 0 0 10px ${c["editorBracketHighlight.foreground1"]}66; }
    .glow .shiki span[style*="color:${c["editorBracketHighlight.foreground1"]}"] {
      text-shadow: 0 0 1px ${c["editorBracketHighlight.foreground1"]}, 0 0 6px ${c["editorBracketHighlight.foreground1"]}73;
    }
    .glow .shiki span[style*="color:#FF7B8E"] {
      text-shadow: 0 0 1px #FF7B8E, 0 0 6px rgba(255, 123, 142, 0.4);
    }
    .glow .shiki .line { display: block; }
    .glow .shiki .line:nth-child(17) { box-shadow: inset 0 0 18px rgba(255, 140, 209, 0.22); }
  `
    : "";
  return { height, html: `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><style>${cssSized}${glowCss}
  .chip { display: inline-block; margin: 0 6px 4px 0; padding: 1px 6px; border: 1px solid; border-radius: 4px; }
  </style></head>
<body class="${glow ? "glow" : ""}"><div class="window">
  <div class="title"><b class="dot"></b> Dark Sun <span>— ${filename}</span></div>
  <div class="body">
    <aside class="activity"><i class="on"></i><i></i><i></i><i></i></aside>
    <aside class="sidebar">
      <h2>EXPLORER</h2>
      <div class="file ${filename === "sample.py" ? "active" : "add"}">sample.py</div>
      <div class="file ${filename === "sample.js" ? "active" : "mod"}">sample.js</div>
      <div class="file untracked">icon.png</div>
      <div class="file del">old-theme.json</div>
      <div class="file ignored">.vscodeignore</div>
    </aside>
    <main class="editor">
      <div class="tabs"><div class="tab on">${filename}</div><div class="tab">${filename === "sample.py" ? "sample.js" : "sample.py"}</div></div>
      ${highlighted(code, lang)}
      <div class="panel"><div class="label">TERMINAL</div><div class="ansi">${term}<br>${bright}</div></div>
    </main>
  </div>
  <footer class="status"><div><span class="remote">Dark Sun</span><span class="err"> 0 errors</span><span class="warn"> 0 warnings</span></div><div>UTF-8 · LF</div></footer>
</div></body></html>` };
}

mkdirSync(resolve(root, "images"), { recursive: true });
const pages = [
  ["python", page("sample.py", "python", python, false)],
  ["javascript", page("sample.js", "jsx", javascript, false)],
  ["python-glow", page("sample.py", "python", python, true)],
  ["javascript-glow", page("sample.js", "jsx", javascript, true)],
];
for (const [name, result] of pages) {
  writeFileSync(`/tmp/preview-${name}.html`, result.html);
  console.log(name, result.height);
}
writeFileSync("/tmp/preview-sizes.txt", pages.map(([name, result]) => `${name} ${result.height}`).join("\n") + "\n");
