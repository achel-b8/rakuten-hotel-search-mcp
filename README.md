# rakuten-hotel-mcp

楽天トラベル空室検索APIを利用したMCPサーバー

## 概要

このプロジェクトは、楽天トラベルの空室検索APIを利用して周辺ホテルの空室情報を取得するMCPサーバーです。

## 技術スタック

- 言語: TypeScript
- Webフレームワーク: Express
- MCP SDK: @modelcontextprotocol/sdk
- テスト: Vitest
- 静的解析: ESLint
- フォーマッター: Prettier
- HTTPクライアント: axios
- 環境変数管理: dotenv

## 開発方法

### 環境構築

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# テスト実行
npm test

# リント実行
npm run lint

# フォーマット実行
npm run format
```

### 環境変数

`.env.example`をコピーして`.env`ファイルを作成し、必要な環境変数を設定してください。

```
RAKUTEN_API_KEY=your_api_key_here
```

## ライセンス

MIT
