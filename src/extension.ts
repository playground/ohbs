// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { createWriteStream, unlinkSync, chmodSync } from 'fs';
import * as https from 'https';
import * as os from 'os';
import * as path from 'path';
import { execFile } from 'child_process';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "ohbs" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('ohbs.runHznScript', async () => {
    console.log('Preparing to run install script.');
    const scriptUrl = 'https://raw.githubusercontent.com/playground/hzn-cli/main/install.sh';
    const tempDir = os.tmpdir();
    const scriptPath = path.join(tempDir, 'install.sh');

    downloadScript(scriptUrl, scriptPath)
    .then(() => executeShellScript(scriptPath))
    .catch((err) => vscode.window.showErrorMessage(`Error: ${err.message}`));

	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

function downloadScript(url: string, destination: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destination);
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download file: HTTP ${response.statusCode}`));
          return;
        }
        console.log('script downloaded');
        response.pipe(file);
        file.on('finish', () => file.close(() => resolve()));
      })
      .on('error', (error) => {
        unlinkSync(destination);
        reject(error);
      });
  });
}

function executeShellScript(scriptPath: string): void {
  const terminal = vscode.window.createTerminal('Interactive Script');
  terminal.sendText(`bash ${scriptPath}`);
  terminal.show();
}