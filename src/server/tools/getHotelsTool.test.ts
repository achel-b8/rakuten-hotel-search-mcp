import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { getHotelsTool } from './getHotelsTool';

vi.mock('axios');
const mockedAxios = axios as any;

vi.stubEnv('APPLICATION_ID', 'test-application-id');
vi.stubEnv('AFFILIATE_ID', 'test-affiliate-id');

describe('getHotelsTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正常に動作する場合、適切なパラメータでAPIを呼び出し結果を返すこと', async () => {
    const mockApiResponse = {
      data: {
        pagingInfo: {
          recordCount: 1,
          pageCount: 1,
          page: 1,
          first: 1,
          last: 1,
        },
        hotels: [
          {
            hotel: [
              {
                hotelBasicInfo: {
                  hotelNo: 123456,
                  hotelName: 'テストホテル',
                  hotelInformationUrl: 'https://example.com/hotel',
                  hotelMinCharge: 10000,
                  address1: '東京都',
                  address2: '新宿区',
                  telephoneNo: '03-1234-5678',
                  access: '新宿駅から徒歩5分',
                  hotelImageUrl: 'https://example.com/image.jpg',
                  reviewCount: 100,
                  reviewAverage: 4.5,
                  hotelSpecial: 'テスト特徴',
                }
              }
            ]
          },
        ],
      },
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

    expect(result).toEqual({
      result: {
        hotels: [
          {
            hotelNo: 123456,
            hotelName: 'テストホテル',
            hotelInformationUrl: 'https://example.com/hotel',
            hotelMinCharge: 10000,
            address1: '東京都',
            address2: '新宿区',
            telephoneNo: '03-1234-5678',
            access: '新宿駅から徒歩5分',
            hotelImageUrl: 'https://example.com/image.jpg',
            reviewCount: 100,
            reviewAverage: 4.5,
            hotelSpecial: 'テスト特徴',
          },
        ],
      },
    });
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
    expect(result).toEqual({ error: 'チェックアウト日はチェックイン日より後である必要があります。' });
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
