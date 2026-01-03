import * as vscode from 'vscode';
import { AIService } from './aiService';

export class ChatViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private _messages: Array<{role: string, content: string}> = [];

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _aiService: AIService
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtml();

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'sendMessage':
                    await this._handleUserMessage(data.message);
                    break;
                case 'clear':
                    this._messages = [];
                    this._updateChat();
                    break;
            }
        });
    }

    private async _handleUserMessage(message: string) {
        this._messages.push({ role: 'user', content: message });
        this._updateChat();

        try {
            const response = await this._aiService.chat([
                { role: 'system', content: 'Sen CodexFlow AI asistanısın. Yazılım geliştirme konusunda yardımcı olursun. Türkçe yanıt ver.' },
                ...this._messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
            ]);

            this._messages.push({ role: 'assistant', content: response });
            this._updateChat();
        } catch (error: any) {
            vscode.window.showErrorMessage(`AI Hatası: ${error.message}`);
        }
    }

    public addMessage(role: string, content: string) {
        this._messages.push({ role, content });
        this._updateChat();
        this._view?.show?.(true);
    }

    private _updateChat() {
        this._view?.webview.postMessage({
            type: 'updateMessages',
            messages: this._messages
        });
    }

    private _getHtml(): string {
        return `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodexFlow AI</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background: var(--vscode-sideBar-background);
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        #chat-container {
            flex: 1;
            overflow-y: auto;
            padding: 12px;
        }
        .message {
            margin-bottom: 12px;
            padding: 10px 12px;
            border-radius: 8px;
            max-width: 90%;
            word-wrap: break-word;
        }
        .user {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            margin-left: auto;
        }
        .assistant {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-widget-border);
        }
        .assistant pre {
            background: var(--vscode-textCodeBlock-background);
            padding: 8px;
            border-radius: 4px;
            overflow-x: auto;
            margin: 8px 0;
        }
        .assistant code {
            font-family: var(--vscode-editor-font-family);
            font-size: 12px;
        }
        #input-container {
            padding: 12px;
            border-top: 1px solid var(--vscode-widget-border);
            display: flex;
            gap: 8px;
        }
        #message-input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid var(--vscode-input-border);
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            font-size: 13px;
        }
        #message-input:focus {
            outline: 1px solid var(--vscode-focusBorder);
        }
        button {
            padding: 8px 16px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        #clear-btn {
            background: transparent;
            color: var(--vscode-foreground);
            padding: 4px 8px;
            font-size: 11px;
        }
        .header {
            padding: 8px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--vscode-widget-border);
        }
        .typing {
            opacity: 0.7;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="header">
        <span>💬 CodexFlow AI</span>
        <button id="clear-btn">Temizle</button>
    </div>
    <div id="chat-container"></div>
    <div id="input-container">
        <input type="text" id="message-input" placeholder="Mesajınızı yazın..." />
        <button id="send-btn">Gönder</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const chatContainer = document.getElementById('chat-container');
        const messageInput = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-btn');
        const clearBtn = document.getElementById('clear-btn');

        function sendMessage() {
            const message = messageInput.value.trim();
            if (!message) return;
            
            vscode.postMessage({ type: 'sendMessage', message });
            messageInput.value = '';
        }

        sendBtn.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
        clearBtn.addEventListener('click', () => {
            vscode.postMessage({ type: 'clear' });
        });

        window.addEventListener('message', (event) => {
            const { type, messages } = event.data;
            if (type === 'updateMessages') {
                renderMessages(messages);
            }
        });

        function renderMessages(messages) {
            chatContainer.innerHTML = messages.map(m => {
                const content = formatMessage(m.content);
                return '<div class="message ' + m.role + '">' + content + '</div>';
            }).join('');
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function formatMessage(text) {
            // Code blocks
            text = text.replace(/\`\`\`(\\w*)\\n([\\s\\S]*?)\`\`\`/g, '<pre><code>$2</code></pre>');
            // Inline code
            text = text.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
            // Line breaks
            text = text.replace(/\\n/g, '<br>');
            return text;
        }
    </script>
</body>
</html>`;
    }
}
