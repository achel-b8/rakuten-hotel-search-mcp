import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { getHotelsTool } from './getHotelsTool';
import { RakutenApiResponse } from '../../types/index.js';

vi.mock('axios');
interface MockedAxios {
  get: ReturnType<typeof vi.fn>;
}
const mockedAxios = axios as unknown as MockedAxios;

vi.stubEnv('APPLICATION_ID', 'test-application-id');
vi.stubEnv('AFFILIATE_ID', 'test-affiliate-id');

// 実際のAPIレスポンスに基づいたモックデータ
const mockApiResponseData: RakutenApiResponse = {
  pagingInfo: {
    recordCount: 3,
    pageCount: 1,
    page: 1,
    first: 1,
    last: 3,
  },
  hotels: [
    [
      {
        hotelBasicInfo: {
          hotelNo: 100001,
          hotelName: 'テストホテル東京',
          hotelInformationUrl: 'https://example.com/hotel/100001',
          planListUrl: 'https://example.com/hotel/100001/plans',
          dpPlanListUrl: 'https://example.com/hotel/100001/dp_plans',
          reviewUrl: 'https://example.com/hotel/100001/reviews',
          hotelKanaName: 'てすとほてるとうきょう',
          hotelSpecial: '東京駅から徒歩5分。快適な客室と充実した設備が魅力です。',
          hotelMinCharge: 8000,
          latitude: 35.67922715,
          longitude: 139.7698432,
          postalCode: '100-0001',
          address1: '東京都',
          address2: '千代田区1-1-1',
          telephoneNo: '03-1234-5678',
          faxNo: '03-1234-5679',
          access: '東京駅より徒歩5分',
          parkingInformation: '有料駐車場あり',
          nearestStation: '東京',
          hotelImageUrl: 'https://example.com/images/hotel/100001.jpg',
          hotelThumbnailUrl: 'https://example.com/images/hotel/thumb/100001.jpg',
          roomImageUrl: 'https://example.com/images/room/100001.jpg',
          roomThumbnailUrl: 'https://example.com/images/room/thumb/100001.jpg',
          hotelMapImageUrl: 'https://example.com/images/map/100001.gif',
          reviewCount: 1000,
          reviewAverage: 4.5,
          userReview: 'とても快適に過ごせました。スタッフの対応も良く、また利用したいです。',
        },
      },
      {
        roomInfo: [
          {
            roomBasicInfo: {
              roomClass: 'sgl',
              roomName: 'シングルルーム',
              planId: 5000001,
              planName: '【素泊まり】シンプルステイプラン',
              pointRate: 1,
              withDinnerFlag: 0,
              dinnerSelectFlag: 0,
              withBreakfastFlag: 0,
              breakfastSelectFlag: 0,
              payment: '1',
              reserveUrl: 'https://example.com/reserve/100001/sgl/5000001',
              salesformFlag: 0,
            },
          },
          {
            dailyCharge: {
              stayDate: '2023-12-01',
              rakutenCharge: 10000,
              total: 10000,
              chargeFlag: 0,
            },
          },
        ],
      },
      {
        roomInfo: [
          {
            roomBasicInfo: {
              roomClass: 'dbl',
              roomName: 'ダブルルーム',
              planId: 5000002,
              planName: '【素泊まり】カップルプラン',
              pointRate: 1,
              withDinnerFlag: 0,
              dinnerSelectFlag: 0,
              withBreakfastFlag: 0,
              breakfastSelectFlag: 0,
              payment: '1',
              reserveUrl: 'https://example.com/reserve/100001/dbl/5000002',
              salesformFlag: 0,
            },
          },
          {
            dailyCharge: {
              stayDate: '2023-12-01',
              rakutenCharge: 15000,
              total: 15000,
              chargeFlag: 0,
            },
          },
        ],
      },
    ],
    [
      {
        hotelBasicInfo: {
          hotelNo: 100002,
          hotelName: 'テストホテル大阪',
          hotelInformationUrl: 'https://example.com/hotel/100002',
          planListUrl: 'https://example.com/hotel/100002/plans',
          dpPlanListUrl: 'https://example.com/hotel/100002/dp_plans',
          reviewUrl: 'https://example.com/hotel/100002/reviews',
          hotelKanaName: 'てすとほてるおおさか',
          hotelSpecial: '大阪駅から徒歩3分。ビジネスにも観光にも便利な立地です。',
          hotelMinCharge: 7000,
          latitude: 34.70283,
          longitude: 135.49609,
          postalCode: '530-0001',
          address1: '大阪府',
          address2: '大阪市北区1-1-1',
          telephoneNo: '06-1234-5678',
          faxNo: '06-1234-5679',
          access: '大阪駅より徒歩3分',
          parkingInformation: '提携駐車場あり（有料）',
          nearestStation: '大阪',
          hotelImageUrl: 'https://example.com/images/hotel/100002.jpg',
          hotelThumbnailUrl: 'https://example.com/images/hotel/thumb/100002.jpg',
          roomImageUrl: 'https://example.com/images/room/100002.jpg',
          roomThumbnailUrl: 'https://example.com/images/room/thumb/100002.jpg',
          hotelMapImageUrl: 'https://example.com/images/map/100002.gif',
          reviewCount: 800,
          reviewAverage: 4.2,
          userReview: '立地が良く、観光に便利でした。部屋も清潔で快適に過ごせました。',
        },
      },
      {
        roomInfo: [
          {
            roomBasicInfo: {
              roomClass: 'sgl',
              roomName: 'シングルルーム',
              planId: 5000003,
              planName: '【素泊まり】ビジネスプラン',
              pointRate: 1,
              withDinnerFlag: 0,
              dinnerSelectFlag: 0,
              withBreakfastFlag: 0,
              breakfastSelectFlag: 0,
              payment: '1',
              reserveUrl: 'https://example.com/reserve/100002/sgl/5000003',
              salesformFlag: 0,
            },
          },
          {
            dailyCharge: {
              stayDate: '2023-12-01',
              rakutenCharge: 9000,
              total: 9000,
              chargeFlag: 0,
            },
          },
        ],
      },
    ],
  ],
};

describe('getHotelsTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正常に動作する場合、適切なパラメータでAPIを呼び出し結果を返すこと', async () => {
    const mockApiResponse = {
      data: mockApiResponseData,
    };

    mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

    const request = {
      parameters: {
        checkIn: '2023-12-01',
        checkOut: '2023-12-02',
      },
    };

    const result = await getHotelsTool.handler(request);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://app.rakuten.co.jp/services/api/Travel/VacantHotelSearch/20170426',
      expect.objectContaining({
        params: expect.objectContaining({
          applicationId: 'test-application-id',
          affiliateId: 'test-affiliate-id',
          checkinDate: '2023-12-01',
          checkoutDate: '2023-12-02',
          latitude: 35.6994856,
          longitude: 139.7532791,
          searchRadius: 2,
        }),
      })
    );

    // 期待される結果の構造を確認
    expect(result).toHaveProperty('result');
    expect(result.result).toHaveProperty('hotels');
    expect(result.result).toHaveProperty('pagingInfo');

    // ホテル数の確認
    expect(result.result?.hotels.length).toBe(2);

    // 最初のホテルの基本情報を確認
    const firstHotel = result.result?.hotels[0];
    expect(firstHotel).toHaveProperty('hotelBasicInfo');
    expect(firstHotel).toHaveProperty('roomInfoList');
    expect(firstHotel?.hotelBasicInfo.hotelName).toBe('テストホテル東京');

    // 部屋情報の確認
    expect(firstHotel?.roomInfoList.length).toBeGreaterThan(0);
    expect(firstHotel?.roomInfoList[0]).toHaveProperty('roomBasicInfo');
  });

  it('入力パラメータにlatitude、longitude、radiusKmが指定されている場合、それらを使用すること', async () => {
    const mockApiResponse = {
      data: {
        pagingInfo: {
          recordCount: 0,
          pageCount: 0,
          page: 1,
          first: 0,
          last: 0,
        },
        hotels: [],
      },
    };

    mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

    const request = {
      parameters: {
        checkIn: '2023-12-01',
        checkOut: '2023-12-02',
        latitude: 34.6937,
        longitude: 135.5023,
        radiusKm: 1.5,
      },
    };

    await getHotelsTool.handler(request);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://app.rakuten.co.jp/services/api/Travel/VacantHotelSearch/20170426',
      expect.objectContaining({
        params: expect.objectContaining({
          latitude: 34.6937,
          longitude: 135.5023,
          searchRadius: 1.5,
        }),
      })
    );
  });

  it('チェックイン日とチェックアウト日が無効な場合、エラーを返すこと', async () => {
    const request = {
      parameters: {
        checkIn: 'invalid-date',
        checkOut: '2023-12-02',
      },
    };

    const result = await getHotelsTool.handler(request);
    expect(result).toEqual({ error: '日付はYYYY-MM-DD形式で指定してください。' });
  });

  it('チェックアウト日がチェックイン日以前の場合、エラーを返すこと', async () => {
    const request = {
      parameters: {
        checkIn: '2023-12-02',
        checkOut: '2023-12-01',
      },
    };

    const result = await getHotelsTool.handler(request);
    expect(result).toEqual({
      error: 'チェックアウト日はチェックイン日より後である必要があります。',
    });
  });

  it('APIリクエストが失敗した場合、エラーを返すこと', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('APIリクエストに失敗しました'));

    const request = {
      parameters: {
        checkIn: '2023-12-01',
        checkOut: '2023-12-02',
      },
    };

    const result = await getHotelsTool.handler(request);
    expect(result).toEqual({ error: 'APIリクエストに失敗しました' });
  });
});
