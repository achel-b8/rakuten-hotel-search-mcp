#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { getHotelsTool } from './tools/getHotelsTool.js';

// 環境変数の読み込み
dotenv.config();

// 必須環境変数のチェック
const APPLICATION_ID = process.env.APPLICATION_ID;
if (!APPLICATION_ID) {
  console.error('環境変数APPLICATION_IDが設定されていません。');
  process.exit(1);
}

class RakutenHotelServer {
  private server: Server;

  constructor() {
    // MCPサーバーの初期化
    this.server = new Server(
      {
        name: 'rakuten-hotel',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // ツールハンドラーの設定
    this.setupToolHandlers();

    // エラーハンドリング
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    
    // デバッグログを追加
    process.env.DEBUG = 'mcp:*';
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    // ツール一覧を返すハンドラー
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [getHotelsTool],
    }));

    // ツール実行ハンドラー
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === getHotelsTool.name) {
        // MCPのリクエスト形式をgetHotelsTool.handlerの期待する形式に変換
        const toolRequest = {
          parameters: request.params.arguments || {},
        };

        const result = await getHotelsTool.handler(toolRequest);

        if (result.error) {
          return {
            content: [{ type: 'text', text: result.error }],
            isError: true,
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(result.result, null, 2) }],
        };
      }

      return {
        content: [{ type: 'text', text: `Unknown tool: ${request.params.name}` }],
        isError: true,
      };
    });
  }

  async run() {
    const transport = new StdioServerTransport(process.stdin, process.stdout);
    await this.server.connect(transport);
    console.error('楽天ホテルMCPサーバーが起動しました');
  }
}

// サーバーの起動
const server = new RakutenHotelServer();
server.run().catch(console.error);
