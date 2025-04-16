import { HotelChain } from '../../types/index.js';

/**
 * デフォルト設定値
 */
export const DEFAULT_LATITUDE = 35.6994856; // 東京本社座標
export const DEFAULT_LONGITUDE = 139.7532791; // 東京本社座標
export const DEFAULT_RADIUS_KM = 2;
export const DEFAULT_MAX_PRICE = 15000; // デフォルトの1泊あたりの上限金額

/**
 * 優先ホテルチェーンの定義（上位5チェーン）
 */
export const PREFERRED_HOTEL_CHAINS: HotelChain[] = [
  {
    name: 'ルートインホテルズ',
    keywords: ['ルートイン', 'ROUTE-INN', 'ルート・イン', 'ROUTEINN'],
    priority: 1,
  },
  {
    name: '東横INN',
    keywords: ['東横イン', '東横INN', 'TOYOKO INN', 'TOYOKO-INN'],
    priority: 2,
  },
  {
    name: 'アパホテルズ&リゾーツ',
    keywords: ['アパホテル', 'APA HOTEL', 'アパ・ホテル', 'アパヴィラ'],
    priority: 3,
  },
  {
    name: 'スーパーホテル',
    keywords: ['スーパーホテル', 'SUPER HOTEL', 'スーパー・ホテル', 'スーパーホテルLohas'],
    priority: 4,
  },
  {
    name: 'リブマックスホテルズ&リゾーツ',
    keywords: ['リブマックス', 'LIBEMAX', 'リブ・マックス', 'リブマックスリゾート'],
    priority: 5,
  },
];

/**
 * 除外するホテルタイプのキーワード
 */
export const EXCLUDED_HOTEL_TYPES = [
  'ドミトリー',
  'カプセル',
  'カプセルホテル',
  '簡易宿泊',
  'ゲストハウス',
  'ホステル',
  'バックパッカー',
];
