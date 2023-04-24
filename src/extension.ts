import {workspace, window, commands} from 'vscode';
import type {ExtensionContext, TextDocument, TextEditor} from 'vscode';
import setText from 'vscode-set-text';
import CleanCss from 'clean-css';

function isCss({languageId}: TextDocument): boolean {
  return languageId === 'css';
}

function getConfig(): CleanCss.OptionsPromise {
  const config = workspace.getConfiguration('clean-css');
  const compatibility = config.get<CleanCss.CompatibilityOptions>('compatibility');
  const level = config.get<CleanCss.OptimizationsOptions>('level');
  const format = config.get<CleanCss.FormatOptions>('format');
  const inline = config.get<string>('inline');
  const cleanCssConfig: CleanCss.OptionsPromise = {
    compatibility,
    level,
    format,
    inline: inline ? [inline] : [],
    returnPromise: true,
  };

  return cleanCssConfig;
}

async function formatTextDocument(textEditor: TextEditor) {
  if (!isCss(textEditor.document)) {
    return;
  }

  const config = getConfig();
  const cleanCss = new CleanCss(config);
  const text = textEditor.document.getText();
  const {styles} = await cleanCss.minify(text);
  await setText(styles, textEditor);
}

async function minifyTextDocument(textEditor: TextEditor) {
  if (!isCss(textEditor.document)) {
    return;
  }

  const config = getConfig();
  delete config.format;
  const cleanCss = new CleanCss(config);
  const text = textEditor.document.getText();
  const {styles} = await cleanCss.minify(text);
  await setText(styles, textEditor);
}

async function format() {
  if (!window.activeTextEditor) {
    return;
  }

  try {
    await formatTextDocument(window.activeTextEditor);
    await window.showInformationMessage('Formatted current CSS file');
  } catch (error: unknown) {
    console.error(error);

    if (error instanceof Error) {
      await window.showErrorMessage(error.message);
    }
  }
}

async function minify() {
  if (!window.activeTextEditor) {
    return;
  }

  try {
    await minifyTextDocument(window.activeTextEditor);
    await window.showInformationMessage('Minified current CSS file');
  } catch (error: unknown) {
    console.error(error);

    if (error instanceof Error) {
      await window.showErrorMessage(error.message);
    }
  }
}

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('clean-css.format', format),
    commands.registerCommand('clean-css.minify', minify),
  );
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() {}
