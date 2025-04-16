import axios from 'axios';
import {
  HotelQueryParams,
  HotelsResponse,
  Hotel,
  RakutenApiResponse,
  RoomInfo,
  HotelBasicInfo,
} from '../../types/index.js';
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_RADIUS_KM,
  DEFAULT_MAX_PRICE,
  PREFERRED_HOTEL_CHAINS,
  EXCLUDED_HOTEL_TYPES,
} from '../config/hotelConstants.js';

// 戻り値の型を明示的に定義
type ToolResponse = {
  result?: HotelsResponse;
  error?: string;
};

const RAKUTEN_API_ENDPOINT =
  'https://app.rakuten.co.jp/services/api/Travel/VacantHotelSearch/20170426';

/**
 * getHotelsTool - 楽天トラベル空室検索APIを使用してホテル情報を取得するツール
 */
export const getHotelsTool = {
  name: 'getHotels',
  description: '指定された条件で周辺ホテルの空室情報を取得します。',
  inputSchema: {
    type: 'object',
    required: ['checkIn', 'checkOut'],
    properties: {
      checkIn: {
        type: 'string',
        description: 'チェックイン日（YYYY-MM-DD形式）',
      },
      checkOut: {
        type: 'string',
        description: 'チェックアウト日（YYYY-MM-DD形式）',
      },
      latitude: {
        type: 'number',
        description: '緯度（省略可能、デフォルトは東京本社座標）',
      },
      longitude: {
        type: 'number',
        description: '経度（省略可能、デフォルトは東京本社座標）',
      },
      radiusKm: {
        type: 'number',
        description: '検索半径 km（省略可能、デフォルト2km）',
      },
      maxPrice: {
        type: 'number',
        description: '1泊あたりの上限金額（省略可能、デフォルト15000円）',
      },
    },
  },
  handler: async (request: { parameters: Record<string, unknown> }): Promise<ToolResponse> => {
    try {
      const params = request.parameters as unknown as HotelQueryParams;

      validateParams(params);

      const applicationId = process.env.APPLICATION_ID;
      const affiliateId = process.env.AFFILIATE_ID;

      if (!applicationId) {
        throw new Error('環境変数APPLICATION_IDが設定されていません。');
      }

      const requestParams = buildRequestParams(params, applicationId, affiliateId);

      const response = await axios.get<RakutenApiResponse>(RAKUTEN_API_ENDPOINT, {
        params: requestParams,
        timeout: 10000, // 10秒タイムアウト
      });

      const formattedResponse = formatResponse(response.data, params);

      return {
        result: formattedResponse,
      };
    } catch (error) {
      // エラーハンドリングの強化
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // APIからのエラーレスポンス
          const statusCode = error.response.status;
          const errorMessage = error.response.data?.error || error.message;
          return {
            error: `APIエラー (${statusCode}): ${errorMessage}`,
          };
        } else if (error.request) {
          // リクエストは送信されたがレスポンスがない
          return {
            error: 'APIサーバーからの応答がありません。ネットワーク接続を確認してください。',
          };
        } else {
          // リクエスト設定中のエラー
          return {
            error: `リクエスト設定エラー: ${error.message}`,
          };
        }
      } else if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: '不明なエラーが発生しました。' };
    }
  },
};

/**
 * ホテルが優先チェーンに属しているか判定し、優先度を返す
 * @param hotelName ホテル名
 * @returns 優先度（数値が小さいほど優先、-1は優先チェーンではない）
 */
function getHotelChainPriority(hotelName: string): number {
  const normalizedName = hotelName.toUpperCase();

  for (const chain of PREFERRED_HOTEL_CHAINS) {
    for (const keyword of chain.keywords) {
      if (normalizedName.includes(keyword.toUpperCase())) {
        return chain.priority;
      }
    }
  }

  return -1; // 優先チェーンではない
}

/**
 * ホテルが除外タイプに該当するか判定
 * @param hotelName ホテル名
 * @param hotelSpecial ホテル特色
 * @returns 除外すべきかどうか
 */
function shouldExcludeHotel(hotelName: string, hotelSpecial: string): boolean {
  const normalizedName = hotelName.toUpperCase();
  const normalizedSpecial = hotelSpecial ? hotelSpecial.toUpperCase() : '';

  for (const keyword of EXCLUDED_HOTEL_TYPES) {
    if (
      normalizedName.includes(keyword.toUpperCase()) ||
      normalizedSpecial.includes(keyword.toUpperCase())
    ) {
      return true;
    }
  }

  return false;
}

/**
 * 2点間の距離を計算する（ハーバーサイン公式）
 * @param lat1 地点1の緯度
 * @param lon1 地点1の経度
 * @param lat2 地点2の緯度
 * @param lon2 地点2の経度
 * @returns 距離（km）
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // 地球の半径（km）
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * パラメータのバリデーション
 */
function validateParams(params: HotelQueryParams): void {
  if (!params.checkIn) {
    throw new Error('チェックイン日は必須です。');
  }

  if (!params.checkOut) {
    throw new Error('チェックアウト日は必須です。');
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(params.checkIn) || !dateRegex.test(params.checkOut)) {
    throw new Error('日付はYYYY-MM-DD形式で指定してください。');
  }

  if (new Date(params.checkOut) <= new Date(params.checkIn)) {
    throw new Error('チェックアウト日はチェックイン日より後である必要があります。');
  }

  if (
    params.latitude !== undefined &&
    (isNaN(params.latitude) || params.latitude < -90 || params.latitude > 90)
  ) {
    throw new Error('緯度は-90から90の間で指定してください。');
  }

  if (
    params.longitude !== undefined &&
    (isNaN(params.longitude) || params.longitude < -180 || params.longitude > 180)
  ) {
    throw new Error('経度は-180から180の間で指定してください。');
  }

  if (
    params.radiusKm !== undefined &&
    (isNaN(params.radiusKm) || params.radiusKm <= 0 || params.radiusKm > 3)
  ) {
    throw new Error('検索半径は0.1から3.0kmの間で指定してください。');
  }

  if (params.maxPrice !== undefined && (isNaN(params.maxPrice) || params.maxPrice <= 0)) {
    throw new Error('上限金額は0より大きい値で指定してください。');
  }
}

/**
 * APIリクエストパラメータの構築
 */
function buildRequestParams(
  params: HotelQueryParams,
  applicationId: string,
  affiliateId?: string
): Record<string, string | number> {
  const requestParams: Record<string, string | number> = {
    applicationId: applicationId,
    formatVersion: 2,
    datumType: 1, // 世界測地系、単位は度
    checkinDate: params.checkIn,
    checkoutDate: params.checkOut,
    latitude: params.latitude ?? DEFAULT_LATITUDE,
    longitude: params.longitude ?? DEFAULT_LONGITUDE,
    searchRadius: params.radiusKm ?? DEFAULT_RADIUS_KM,
  };

  if (affiliateId) {
    requestParams.affiliateId = affiliateId;
  }

  return requestParams;
}

/**
 * APIレスポンスの整形
 * @param data APIレスポンス
 * @param params クエリパラメータ
 * @returns 整形されたレスポンス
 */
function formatResponse(
  data: RakutenApiResponse,
  params: Partial<HotelQueryParams> = {}
): HotelsResponse {
  const hotels: Hotel[] = [];
  const maxPrice = params.maxPrice ?? DEFAULT_MAX_PRICE;
  const searchLatitude = params.latitude ?? DEFAULT_LATITUDE;
  const searchLongitude = params.longitude ?? DEFAULT_LONGITUDE;

  if (data.hotels && Array.isArray(data.hotels)) {
    data.hotels.forEach((hotelGroup) => {
      // hotelGroupは配列
      if (Array.isArray(hotelGroup) && hotelGroup.length > 0) {
        let hotelBasicInfo: HotelBasicInfo | undefined;
        const roomInfoList: RoomInfo[] = [];

        // ホテルグループの各要素を処理
        hotelGroup.forEach((item) => {
          // ホテル基本情報の処理
          if (item.hotelBasicInfo) {
            hotelBasicInfo = item.hotelBasicInfo;
          }

          // 部屋情報の処理
          if (item.roomInfo && Array.isArray(item.roomInfo)) {
            roomInfoList.push(...item.roomInfo);
          }
        });

        // ホテル基本情報が存在する場合のみホテルを追加
        if (hotelBasicInfo) {
          // 除外ホテルタイプのフィルタリング
          if (shouldExcludeHotel(hotelBasicInfo.hotelName, hotelBasicInfo.hotelSpecial)) {
            return; // このホテルをスキップ
          }

          // 金額上限でのフィルタリング
          if (hotelBasicInfo.hotelMinCharge > maxPrice) {
            return; // このホテルをスキップ
          }

          hotels.push({
            hotelBasicInfo,
            roomInfoList,
          });
        }
      }
    });
  }

  // ホテルの情報を拡張して、ソートに必要な情報を追加
  const enhancedHotels = hotels.map((hotel) => {
    // 距離を計算
    const distance = calculateDistance(
      searchLatitude,
      searchLongitude,
      hotel.hotelBasicInfo.latitude,
      hotel.hotelBasicInfo.longitude
    );

    // ホテルチェーンの優先度を取得
    const chainPriority = getHotelChainPriority(hotel.hotelBasicInfo.hotelName);

    return {
      ...hotel,
      _distance: distance,
      _chainPriority: chainPriority,
    };
  });

  // ソート処理
  enhancedHotels.sort((a, b) => {
    // 1. 優先チェーンを上位に
    if (a._chainPriority !== -1 && b._chainPriority === -1) return -1;
    if (a._chainPriority === -1 && b._chainPriority !== -1) return 1;
    if (a._chainPriority !== -1 && b._chainPriority !== -1) {
      if (a._chainPriority !== b._chainPriority) {
        return a._chainPriority - b._chainPriority;
      }
    }

    // 2. 距離順
    return a._distance - b._distance;
  });

  // 拡張情報を削除して元の形式に戻す
  const sortedHotels = enhancedHotels.map(({ _distance, _chainPriority, ...hotel }) => hotel);

  return {
    hotels: sortedHotels,
    pagingInfo: data.pagingInfo,
  };
}

export default getHotelsTool;
