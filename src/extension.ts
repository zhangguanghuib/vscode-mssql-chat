// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { getDatabaseContext, runQuery } from './utils';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	//console.log('Congratulations, your extension "vscode-mssql-chat" is now active!');
	vscode.chat.createChatParticipant("vscode-mssql-chat", async (request : vscode.ChatRequest, 
		context : vscode.ChatContext, 
		response: vscode.ChatResponseStream, 
		token: vscode.CancellationToken) => {

		const userQuery = request.prompt;
		response.progress("Reading database context...");

		const chatModels =  await vscode.lm.selectChatModels({family: 'gpt-4'});
		const messages = [
			vscode.LanguageModelChatMessage.User("You should suggest a SQL query for my task that begins with ```sql and ends with ```."),
			vscode.LanguageModelChatMessage.User(await getDatabaseContext(context) + '\n' + userQuery),
		];
		const chatRequest = await chatModels[0].sendRequest(messages, undefined, token);
		let data = '';
		for await (const token of chatRequest.text) {
			response.markdown(token);
			data += token;
		}
		const sqlRegex = /```[^\n]*\n([\s\S]*)\n```/g;
		const match = sqlRegex.exec(data);
		if (match && match[1]) {
			response.button({ title: 'Run Query', command: 'vscode-mssql-chat.runQuery', arguments: [match[1]] });
		}
		
		vscode.commands.registerCommand('vscode-mssql-chat.runQuery', async (sqlQuery: string) => {
			runQuery(sqlQuery);
		});

		vscode.commands.registerCommand("vscode-mssql-chat.summarizeDatabase", async () => {
			vscode.commands.executeCommand("workbench.action.chat.open", '@mssql generate a summary of my database');
		});
	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('vscode-mssql-chat.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from VSCODE-MSSQL-CHAT!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
