import axios from 'axios';
import dotenv from 'dotenv';
import { HotelQueryParams, HotelsResponse, Hotel, RakutenApiResponse } from '../../types/index';

interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    required: string[];
    properties: Record<
      string,
      {
        type: string;
        description: string;
      }
    >;
  };
  handler: (request: { parameters: Record<string, unknown> }) => Promise<Record<string, unknown>>;
}

dotenv.config();

const DEFAULT_LATITUDE = 35.6994856;
const DEFAULT_LONGITUDE = 139.7532791;
const DEFAULT_RADIUS_KM = 2;

const RAKUTEN_API_ENDPOINT =
  'https://app.rakuten.co.jp/services/api/Travel/VacantHotelSearch/20170426';

/**
 * getHotelsTool - 楽天トラベル空室検索APIを使用してホテル情報を取得するツール
 */
export const getHotelsTool: Tool = {
  name: 'getHotels',
  description: '指定された条件で周辺ホテルの空室情報を取得します。',
  parameters: {
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
        description: '緯度（省略可能、デフォルトは東京）',
      },
      longitude: {
        type: 'number',
        description: '経度（省略可能、デフォルトは東京）',
      },
      radiusKm: {
        type: 'number',
        description: '検索半径 km（省略可能、デフォルト2km）',
      },
    },
  },
  handler: async (request: { parameters: Record<string, unknown> }) => {
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

      const formattedResponse = formatResponse(response.data);

      return {
        result: formattedResponse,
      };
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: '不明なエラーが発生しました。' };
    }
  },
};

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
 */
function formatResponse(data: RakutenApiResponse): HotelsResponse {
  const hotels: Hotel[] = [];

  if (data.hotels && Array.isArray(data.hotels)) {
    data.hotels.forEach((hotelData) => {
      if (hotelData.hotel && Array.isArray(hotelData.hotel) && hotelData.hotel.length > 0) {
        const basicInfo = hotelData.hotel[0].hotelBasicInfo;
        if (basicInfo) {
          hotels.push({
            hotelNo: basicInfo.hotelNo,
            hotelName: basicInfo.hotelName,
            hotelInformationUrl: basicInfo.hotelInformationUrl,
            hotelMinCharge: basicInfo.hotelMinCharge,
            address1: basicInfo.address1,
            address2: basicInfo.address2,
            telephoneNo: basicInfo.telephoneNo,
            access: basicInfo.access,
            hotelImageUrl: basicInfo.hotelImageUrl,
            reviewCount: basicInfo.reviewCount,
            reviewAverage: basicInfo.reviewAverage,
            hotelSpecial: basicInfo.hotelSpecial,
          });
        }
      }
    });
  }

  return { hotels };
}

export default getHotelsTool;
