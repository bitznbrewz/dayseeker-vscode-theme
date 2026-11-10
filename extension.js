const vscode = require("vscode");
const path = require("path");
const { pathToFileURL } = require("url");

const IMPORT_KEY = "vscode_custom_css.imports";
const LOADER_ID = "be5invis.vscode-custom-css";

function glowUrl() {
  return pathToFileURL(path.join(__dirname, "styles", "neon-glow.js")).href;
}

function isGlowImport(entry) {
  if (typeof entry !== "string") return false;
  let pathname = entry.split("?")[0];
  try {
    pathname = decodeURIComponent(pathname);
  } catch (err) {
    // Keep the raw entry if it is not valid percent-encoding.
  }
  return pathname.endsWith("/neon-glow.js") || pathname.endsWith("\\neon-glow.js");
}

async function readImports() {
  const config = vscode.workspace.getConfiguration();
  const current = config.get(IMPORT_KEY);
  return Array.isArray(current) ? current.slice() : [];
}

async function writeImports(imports) {
  await vscode.workspace
    .getConfiguration()
    .update(IMPORT_KEY, imports, vscode.ConfigurationTarget.Global);
}

async function hasCommand(id) {
  const commands = await vscode.commands.getCommands(true);
  return commands.includes(id);
}

async function enable() {
  const url = glowUrl();
  const imports = (await readImports()).filter((entry) => !isGlowImport(entry));
  imports.push(url);
  await writeImports(imports);

  if (!(await hasCommand("extension.installCustomCSS"))) {
    const install = await vscode.window.showInformationMessage(
      "Neon Glow was added to vscode_custom_css.imports. Install Custom CSS and JS Loader, run Enable Custom CSS and JS, then reload. VS Code will warn that the installation appears to be corrupt. That warning is expected.",
      "Install Custom CSS and JS Loader"
    );
    if (install) {
      await vscode.commands.executeCommand("workbench.extensions.installExtension", LOADER_ID);
    }
    return;
  }

  const enableLoader = await vscode.window.showInformationMessage(
    "Neon Glow is ready. Enable Custom CSS and JS, then reload VS Code. The editor will warn that the installation appears to be corrupt. That warning is expected, and the theme stays unchanged until you do this.",
    "Enable Custom CSS and JS"
  );
  if (enableLoader) {
    await vscode.commands.executeCommand("extension.installCustomCSS");
  }
}

async function disable() {
  const imports = (await readImports()).filter((entry) => !isGlowImport(entry));
  await writeImports(imports);

  if (imports.length === 0) {
    const message =
      "Neon Glow was the only custom import, so it has been removed. Disable Custom CSS and JS, then reload, to restore VS Code's original files and clear the installation warning.";
    if (!(await hasCommand("extension.uninstallCustomCSS"))) {
      vscode.window.showInformationMessage(message);
      return;
    }
    const choice = await vscode.window.showInformationMessage(message, "Disable Custom CSS and JS");
    if (choice) await vscode.commands.executeCommand("extension.uninstallCustomCSS");
    return;
  }

  const message =
    "Neon Glow was removed from the import list. Reload Custom CSS and JS to drop the glow and keep your other custom files.";
  if (!(await hasCommand("extension.updateCustomCSS"))) {
    vscode.window.showInformationMessage(message);
    return;
  }
  const choice = await vscode.window.showInformationMessage(message, "Reload Custom CSS and JS");
  if (choice) await vscode.commands.executeCommand("extension.updateCustomCSS");
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("darkSun.enableNeonGlow", enable),
    vscode.commands.registerCommand("darkSun.disableNeonGlow", disable)
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
