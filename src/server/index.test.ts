import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Server と StdioServerTransport をモック化
vi.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: vi.fn().mockImplementation(() => ({
    setRequestHandler: vi.fn(),
    connect: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    onerror: null,
  })),
}));

vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: vi.fn(),
}));

// 環境変数をモック
vi.mock('dotenv', () => ({
  default: {
    config: vi.fn(),
  },
}));

describe('RakutenHotelServer', () => {
  // 環境変数のモック
  const originalEnv = process.env;

  beforeEach(() => {
    // 環境変数をリセット
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.APPLICATION_ID = 'test-application-id';
    
    // モックをリセット
    vi.clearAllMocks();
    
    // コンソールエラーをモック化して、テスト出力をクリーンに保つ
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // 環境変数を元に戻す
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('サーバーが正常に初期化されること', async () => {
    // index.tsをインポート（環境変数設定後に行う必要がある）
    const indexModule = await import('./index.js');
    
    // Serverコンストラクタが正しいパラメータで呼ばれたことを確認
    expect(Server).toHaveBeenCalledWith(
      {
        name: 'rakuten-hotel-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    // StdioServerTransportが呼ばれたことを確認
    expect(StdioServerTransport).toHaveBeenCalled();
  });

  it('APPLICATION_ID環境変数がない場合、エラーで終了すること', async () => {
    // APPLICATION_IDを削除
    delete process.env.APPLICATION_ID;
    
    // process.exitをモック化
    const mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`Process exit with code: ${code}`);
    });
    
    // index.tsのインポートでエラーが発生することを期待
    await expect(import('./index.js')).rejects.toThrow('Process exit with code: 1');
    
    // コンソールエラーが呼ばれたことを確認
    expect(console.error).toHaveBeenCalledWith('環境変数APPLICATION_IDが設定されていません。');
    
    // process.exitが呼ばれたことを確認
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
