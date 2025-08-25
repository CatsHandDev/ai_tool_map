// AIツールの型定義
export interface AiTool {
  id: string;
  name: string;
  url: string;
  description: string;
  docId?: string;
}

// カテゴリごとのAIツールリストの型定義
export interface MindMapNode {
  category: string;
  tools: AiTool[];
}

// 初期データ
export const initialData: MindMapNode[] = [
  {
    category: "文章作成",
    tools: [
      { id: "gpt", name: "ChatGPT", url: "https://chat.openai.com/", description: "OpenAIが開発した対話型AI" },
      { id: "gemini", name: "Gemini", url: "https://gemini.google.com/", description: "Googleが開発したマルチモーダルAI" },
      { id: "claude", name: "Claude", url: "https://claude.ai/", description: "Anthropic社が開発したAIアシスタント" },
    ],
  },
  {
    category: "画像作成",
    tools: [
      { id: "midjourney", name: "Midjourney", url: "https://www.midjourney.com/", description: "高品質な画像を生成するAIサービス" },
      { id: "stablediffusion", name: "Stable Diffusion", url: "https://stablediffusionweb.com/", description: "オープンソースの画像生成AIモデル" },
      { id: "dalle3", name: "DALL-E 3", url: "https://openai.com/dall-e-3", description: "ChatGPTに統合された画像生成AI" },
    ],
  },
  {
    category: "動画作成",
    tools: [
        { id: "sora", name: "Sora", url: "https://openai.com/sora", description: "テキストから高品質な動画を生成するAI" },
        { id: "runway", name: "Runway", url: "https://runwayml.com/", description: "多機能なオンライン動画編集・生成プラットフォーム" },
        { id: "pika", name: "Pika", url: "https://pika.art/", description: "アイデアを動画に変換するAIツール" },
    ],
  },
  {
    category: "コーディング",
    tools: [
      { id: "copilot", name: "GitHub Copilot", url: "https://github.com/features/copilot", description: "AIペアプログラマー" },
      { id: "cursor", name: "Cursor", url: "https://cursor.sh/", description: "AIネイティブなコードエディタ" },
      { id: "codewhisperer", name: "CodeWhisperer", url: "https://aws.amazon.com/jp/codewhisperer/", description: "AmazonのAIコーディング支援ツール" },
    ],
  },
];