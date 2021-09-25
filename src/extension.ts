import {ExtensionContext, TextDocument, workspace, window, commands} from 'vscode';
import setText from 'vscode-set-text';
import CleanCSS from 'clean-css';

function isCSS({languageId}: TextDocument): boolean {
  return languageId === 'css';
}

function getConfig(): CleanCSS.OptionsPromise {
  const config = workspace.getConfiguration('clean-css');
  const compatibility = config.get<CleanCSS.CompatibilityOptions>('compatibility');
  const level = config.get<CleanCSS.OptimizationsOptions>('level');
  const format = config.get<CleanCSS.FormatOptions>('format');
  const inline = config.get<string>('inline');
  const cleanCssConfig: CleanCSS.OptionsPromise = {
    compatibility,
    level,
    format,
    inline: [inline],
    returnPromise: true,
  };

  return cleanCssConfig;
}

async function formatTextDocument(textDocument: TextDocument) {
  if (!isCSS(textDocument)) {
    return;
  }

  const config = getConfig();
  const cleanCSS = new CleanCSS(config);
  const {styles} = await cleanCSS.minify(textDocument.getText());
  const textEditor = await window.showTextDocument(textDocument);
  await setText(styles, textEditor);
}

async function minifyTextDocument(textDocument: TextDocument) {
  if (!isCSS(textDocument)) {
    return;
  }

  const config = getConfig();
  delete config.format;
  const cleanCSS = new CleanCSS(config);
  const {styles} = await cleanCSS.minify(textDocument.getText());
  const textEditor = await window.showTextDocument(textDocument);
  await setText(styles, textEditor);
}

async function format() {
  if (!window.activeTextEditor) {
    return;
  }

  await formatTextDocument(window.activeTextEditor.document);
  await window.showInformationMessage('Formatted current CSS file');
}

async function minify() {
  if (!window.activeTextEditor) {
    return;
  }

  await minifyTextDocument(window.activeTextEditor.document);
  await window.showInformationMessage('Minified current CSS file');
}

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('clean-css.format', format),
    commands.registerCommand('clean-css.minify', minify),
  );
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() {}
