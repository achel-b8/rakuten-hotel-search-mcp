export interface HotelQueryParams {
  checkIn: string;
  checkOut: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}

export interface Hotel {
  hotelNo: number; // 施設番号
  hotelName: string; // 施設名称
  hotelInformationUrl: string; // 施設情報ページURL
  hotelMinCharge: number; // 最安料金
  address1: string; // 住所1
  address2: string; // 住所2
  telephoneNo: string; // 施設電話番号
  access: string; // 施設へのアクセス
  hotelImageUrl?: string; // 施設画像URL
  reviewCount?: number; // 投稿件数
  reviewAverage?: number; // 総合評価
  hotelSpecial?: string; // 施設特色
}

export interface RakutenApiResponse {
  pagingInfo: {
    recordCount: number;
    pageCount: number;
    page: number;
    first: number;
    last: number;
  };
  hotels?: {
    hotel: {
      hotelBasicInfo: {
        hotelNo: number;
        hotelName: string;
        hotelInformationUrl: string;
        hotelMinCharge: number;
        address1: string;
        address2: string;
        telephoneNo: string;
        access: string;
        hotelImageUrl?: string;
        reviewCount?: number;
        reviewAverage?: number;
        hotelSpecial?: string;
      };
    }[];
  }[];
}

export interface HotelsResponse {
  hotels: Hotel[];
}
