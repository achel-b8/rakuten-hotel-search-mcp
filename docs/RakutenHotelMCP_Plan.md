# 楽天ホテルMCPサーバーに関する検討まとめ

## 1. 概要
楽天トラベルの空室検索APIを利用して周辺ホテルの空室情報を取得するMCPサーバーを構築するプラン。  
本MCPサーバーはTypeScript + MCP SDKで作成し、ViteやESLint, Prettier等を使用する。

## 2. 軸となる技術スタック
- 言語: TypeScript  
- MCP SDK: @modelcontextprotocol/sdk  
- テスト: Vitest  
- 静的解析: ESLint  
- フォーマッター: Prettier  
- HTTPクライアント: axios  
- 環境変数管理 (APIキーなど): .env などを介して行う（Gitで除外）

## 3. メイン機能
1. ホテル空室情報取得ツール (仮称 “getHotelsTool”)  
   - 楽天トラベル空室検索APIを用いる  
   - リクエストパラメータ例:  
     - チェックイン日: checkIn (YYYY-MM-DD 形式)  
     - チェックアウト日: checkOut (YYYY-MM-DD 形式)  
     - 緯度: latitude (省略可), 経度: longitude (省略可), 半径: radiusKm (省略可)  
   - 取得内容: ホテル名、概要、料金、住所など  
   - 検索範囲は 35.6994856,139.7532791 を中心にする案 (半径2km) もしくは東京水道橋・御茶ノ水付近コード指定  

2. MCPサーバーの設定
   - 環境変数 RAKUTEN_API_KEY を使用  
   - @modelcontextprotocol/sdk の Server インスタンス + StdioServerTransport でサーバー起動

3. テスト
   - Vitest を使用  
   - ホテル検索ツール単体テスト (正常系/異常系)  
   - 環境変数が設定されていない場合のハンドリング検証など  

## 4. ディレクトリ構成(例: “rakuten-hotel-mcp”プロジェクト)
```
rakuten-hotel-mcp
 ┣ package.json
 ┣ tsconfig.json
 ┣ .eslintrc.js
 ┣ .prettierrc
 ┣ .gitignore
 ┣ src/
 ┃   ┣ server/
 ┃   ┃   ┣ index.ts   // MCPサーバーのエントリーポイント
 ┃   ┃   ┗ tools/
 ┃   ┃       ┣ getHotelsTool.ts        // ホテル検索ツール
 ┃   ┃       ┗ getHotelsTool.test.ts   // 隣接テスト
 ┃   ┣ types/
 ┃   ┃   ┗ index.ts  // 型定義やAPIレスポンス型など
 ┃   ┗ index.test.ts // 必要に応じてサーバー本体のテスト
 ┗ build/
     ┗ index.js
```

### 各主要ファイル
1. `server/index.ts`  
   - MCP Server + StdioServerTransport を初期化し、ツール/リソースを登録  
   - 環境変数 (RAKUTEN_API_KEY) の有無などをチェック  

2. `server/tools/getHotelsTool.ts`  
   - 楽天APIにアクセスするための axios インスタンスを作成  
   - callToolRequest で受け取る引数をバリデートし、APIを呼び出してレスポンスを整形・返却  

3. `server/tools/getHotelsTool.test.ts`  
   - Vitestで単体テストを記述  
   - パラメータ入力値ごとの結果、エラーケースのテストなど  

4. `types/index.ts`  
   - APIリクエスト/レスポンス用のインタフェース、型定義 (楽天トラベルAPIのJSON仕様に合わせる)  
   - MCPツール引数用の型 (HotelQueryParamsなど)  

5. `index.test.ts` (または `server/index.test.ts`)  
   - MCPサーバー起動の初期化テストを追加可能  

## 5. 実装フロー
1. リポジトリ作成 (package.json, tsconfig.json, etc.)  
2. コード・テスト(単体)の実装・ESLint/Prettier設定  
3. ビルド (`npm run build`) → MCP設定 (cline_mcp_settings.json など) に追加  
4. 実行テスト (正常系・エラー系含む)  
5. 必要に応じてフロント連携や機能拡張を行う  

## 6. 今後の拡張可能性
- 部屋写真・ホテル詳細など追加取得  
- 日付や人数をより柔軟に指定できるようにする  
- エリア検索の細分化 (例: JRお茶の水駅周辺、東京ドーム付近など)

## 7. まとめ

## 8. 追記 - テストと実装を近づける方針、および実装計画のドキュメント化
1. テストファイルを実装ファイルと同じディレクトリに配置することで、修正時にテストと実装を同タイミングで更新しやすくする。  
2. 実装計画や進捗なども docs ディレクトリにまとめ、計画書と実装が乖離しないようにする。  

- 以上のプランにより、TypeScript + MCP SDKの構成でシンプルなホテル空室検索サーバーを実装しやすくなる  
- コードとテストを隣接して管理し、変更点を素早く発見できる  
- 拡張性を高めつつ必要最低限の情報を取得する形から始め、後から追加機能を積み上げる方針
