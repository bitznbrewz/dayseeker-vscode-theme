/*
 * Optional Dark Sun neon glow.
 *
 * This file does nothing until Custom CSS and JS Loader injects it.
 * It only paints while the active workbench background is the Dark Sun
 * editor color, and it removes its own rules when another theme is active.
 */
(function () {
  var MARK = "dark-sun-glow";
  var STYLE_ID = "dark-sun-neon-glow";
  var EDITOR_BG = "#1e111b";
  var KEYWORD = "#ff8cd1";
  var STRING = "#ff7b8e";
  var SHADOWS = {};
  SHADOWS[KEYWORD] = "0 0 1px #FF8CD1, 0 0 6px rgba(255, 140, 209, 0.45)";
  SHADOWS[STRING] = "0 0 1px #FF7B8E, 0 0 6px rgba(255, 123, 142, 0.4)";

  var CHROME = [
    "body." + MARK + " .tab.active {",
    "  box-shadow: inset 0 2px 0 #FF8CD1, 0 0 10px rgba(255, 140, 209, 0.35);",
    "}",
    "body." + MARK + " .monaco-editor .view-overlays .current-line,",
    "body." + MARK + " .monaco-editor .margin-view-overlays .current-line {",
    "  box-shadow: inset 0 0 18px rgba(255, 140, 209, 0.22);",
    "}",
  ].join("\n");

  function normalize(color) {
    if (!color) return "";
    var value = String(color).trim().toLowerCase();
    var hex = value.match(/^#([0-9a-f]{6})$/);
    if (hex) return "#" + hex[1];
    var short = value.match(/^#([0-9a-f]{3})$/);
    if (short) {
      return "#" + short[1].split("").map(function (c) { return c + c; }).join("");
    }
    var rgb = value.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (!rgb) return value;
    return "#" + [rgb[1], rgb[2], rgb[3]].map(function (n) {
      var channel = Number(n).toString(16);
      return channel.length === 1 ? "0" + channel : channel;
    }).join("");
  }

  function editorBackground() {
    var root = getComputedStyle(document.documentElement).getPropertyValue("--vscode-editor-background");
    var body = getComputedStyle(document.body).getPropertyValue("--vscode-editor-background");
    return normalize(root || body);
  }

  function ensureStyle() {
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement("style");
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    if (el.textContent !== CHROME) el.textContent = CHROME;
  }

  function dropStyle() {
    var el = document.getElementById(STYLE_ID);
    if (el && el.parentNode) el.parentNode.removeChild(el);
    document.body.classList.remove(MARK);
  }

  function visitRules(fn) {
    for (var i = 0; i < document.styleSheets.length; i++) {
      var rules;
      try {
        rules = document.styleSheets[i].cssRules;
      } catch (err) {
        continue;
      }
      if (!rules) continue;
      for (var j = 0; j < rules.length; j++) {
        var rule = rules[j];
        if (!rule.selectorText || !rule.style || !/\.mtk\d+/.test(rule.selectorText)) continue;
        fn(rule);
      }
    }
  }

  var touched = [];

  function clearShadows() {
    for (var i = 0; i < touched.length; i++) {
      try {
        touched[i].style.textShadow = "";
      } catch (err) {
        // The stylesheet was replaced; the old rule is already gone.
      }
    }
    touched = [];
  }

  function paint() {
    if (!document.body || editorBackground() !== EDITOR_BG) {
      clearShadows();
      if (document.body) dropStyle();
      return;
    }
    document.body.classList.add(MARK);
    ensureStyle();
    visitRules(function (rule) {
      var shadow = SHADOWS[normalize(rule.style.color)];
      if (!shadow || rule.style.textShadow === shadow) return;
      rule.style.textShadow = shadow;
      if (touched.indexOf(rule) === -1) touched.push(rule);
    });
  }

  var timer = 0;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () {
      timer = 0;
      paint();
    }, 150);
  }

  function start() {
    paint();
    setTimeout(paint, 400);
    setTimeout(paint, 1200);
    var observer = new MutationObserver(schedule);
    observer.observe(document.head, { childList: true, subtree: true });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    if (document.body) {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["style", "class"],
      });
    }
  }

  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start);
})();
