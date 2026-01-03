import * as vscode from 'vscode';
import OpenAI from 'openai';

export class AIService {
    private client: OpenAI | null = null;

    private getClient(): OpenAI {
        const config = vscode.workspace.getConfiguration('codexflow');
        const endpoint = config.get<string>('apiEndpoint') || 'http://localhost:4000';
        const apiKey = config.get<string>('apiKey') || 'sk-codexflow';

        if (!this.client) {
            this.client = new OpenAI({
                baseURL: `${endpoint}/v1`,
                apiKey: apiKey,
            });
        }
        return this.client;
    }

    private getModel(): string {
        const config = vscode.workspace.getConfiguration('codexflow');
        return config.get<string>('model') || 'gpt-4';
    }

    private getMaxTokens(): number {
        const config = vscode.workspace.getConfiguration('codexflow');
        return config.get<number>('maxTokens') || 4096;
    }

    async chat(messages: Array<{role: 'user' | 'assistant' | 'system', content: string}>): Promise<string> {
        try {
            const response = await this.getClient().chat.completions.create({
                model: this.getModel(),
                messages: messages,
                max_tokens: this.getMaxTokens(),
                temperature: 0.7,
            });

            return response.choices[0]?.message?.content || 'Yanıt alınamadı';
        } catch (error: any) {
            console.error('AI Service Error:', error);
            throw new Error(`AI bağlantı hatası: ${error.message}`);
        }
    }

    async explain(code: string, language: string): Promise<string> {
        const prompt = `Bu ${language} kodunu detaylı açıkla. Ne yaptığını, nasıl çalıştığını ve önemli noktaları belirt:

\`\`\`${language}
${code}
\`\`\``;

        return this.chat([
            { role: 'system', content: 'Sen deneyimli bir yazılım geliştiricisin. Kodları açık ve anlaşılır şekilde açıklarsın.' },
            { role: 'user', content: prompt }
        ]);
    }

    async refactor(code: string, language: string): Promise<string> {
        const prompt = `Bu ${language} kodunu refactor et. Daha temiz, okunabilir ve performanslı hale getir:

\`\`\`${language}
${code}
\`\`\`

Refactor edilmiş kodu ve yaptığın değişikliklerin açıklamasını ver.`;

        return this.chat([
            { role: 'system', content: 'Sen kod kalitesi konusunda uzman bir yazılım mühendisisin. Clean code prensiplerini uygularsın.' },
            { role: 'user', content: prompt }
        ]);
    }

    async generateTests(code: string, language: string): Promise<string> {
        const prompt = `Bu ${language} kodu için kapsamlı unit testler yaz:

\`\`\`${language}
${code}
\`\`\`

Edge case'leri de kapsayan testler oluştur.`;

        return this.chat([
            { role: 'system', content: 'Sen test driven development konusunda uzman bir yazılım mühendisisin.' },
            { role: 'user', content: prompt }
        ]);
    }

    async fixErrors(code: string, errors: string, language: string): Promise<string> {
        const prompt = `Bu ${language} kodunda şu hatalar var:

${errors}

Kod:
\`\`\`${language}
${code}
\`\`\`

Hataları düzelt ve açıkla.`;

        return this.chat([
            { role: 'system', content: 'Sen hata ayıklama konusunda uzman bir yazılım geliştiricisin.' },
            { role: 'user', content: prompt }
        ]);
    }
}
