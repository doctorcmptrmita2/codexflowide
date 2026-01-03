import * as vscode from 'vscode';
import { ChatViewProvider } from './chatView';
import { AIService } from './aiService';

let aiService: AIService;

export function activate(context: vscode.ExtensionContext) {
    console.log('CodexFlow AI aktif!');

    // AI Service başlat
    aiService = new AIService();

    // Chat Panel Provider
    const chatProvider = new ChatViewProvider(context.extensionUri, aiService);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('codexflow.chatView', chatProvider)
    );

    // Komutları kaydet
    context.subscriptions.push(
        vscode.commands.registerCommand('codexflow.chat', () => {
            vscode.commands.executeCommand('codexflow.chatView.focus');
        }),

        vscode.commands.registerCommand('codexflow.explain', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            const selection = editor.document.getText(editor.selection);
            if (!selection) {
                vscode.window.showWarningMessage('Lütfen açıklanacak kodu seçin');
                return;
            }

            await executeWithProgress('Kod açıklanıyor...', async () => {
                const response = await aiService.explain(selection, editor.document.languageId);
                chatProvider.addMessage('assistant', response);
            });
        }),

        vscode.commands.registerCommand('codexflow.refactor', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            const selection = editor.document.getText(editor.selection);
            if (!selection) {
                vscode.window.showWarningMessage('Lütfen refactor edilecek kodu seçin');
                return;
            }

            await executeWithProgress('Kod refactor ediliyor...', async () => {
                const response = await aiService.refactor(selection, editor.document.languageId);
                
                const action = await vscode.window.showInformationMessage(
                    'Refactor önerisi hazır',
                    'Uygula', 'Chat\'te Göster'
                );

                if (action === 'Uygula') {
                    await editor.edit(editBuilder => {
                        editBuilder.replace(editor.selection, extractCode(response));
                    });
                } else {
                    chatProvider.addMessage('assistant', response);
                }
            });
        }),

        vscode.commands.registerCommand('codexflow.generateTests', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            const selection = editor.document.getText(editor.selection) || editor.document.getText();

            await executeWithProgress('Testler oluşturuluyor...', async () => {
                const response = await aiService.generateTests(selection, editor.document.languageId);
                
                const doc = await vscode.workspace.openTextDocument({
                    content: extractCode(response),
                    language: editor.document.languageId
                });
                await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside });
            });
        }),

        vscode.commands.registerCommand('codexflow.fixError', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);
            if (diagnostics.length === 0) {
                vscode.window.showInformationMessage('Bu dosyada hata bulunamadı');
                return;
            }

            const code = editor.document.getText();
            const errors = diagnostics.map(d => `Satır ${d.range.start.line + 1}: ${d.message}`).join('\n');

            await executeWithProgress('Hatalar düzeltiliyor...', async () => {
                const response = await aiService.fixErrors(code, errors, editor.document.languageId);
                chatProvider.addMessage('assistant', response);
            });
        })
    );
}

async function executeWithProgress(title: string, task: () => Promise<void>) {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title,
        cancellable: false
    }, task);
}

function extractCode(response: string): string {
    const codeMatch = response.match(/```[\w]*\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1].trim() : response;
}

export function deactivate() {}
