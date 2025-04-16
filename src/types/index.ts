export interface HotelQueryParams {
  checkIn: string;
  checkOut: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}

// ホテルの基本情報
export interface HotelBasicInfo {
  hotelNo: number; // 施設番号
  hotelName: string; // 施設名称
  hotelInformationUrl: string; // 施設情報ページURL
  planListUrl: string; // プラン一覧ページURL
  dpPlanListUrl: string; // 宿泊プラン一覧ページURL
  reviewUrl: string; // レビューページURL
  hotelKanaName: string; // 施設名称（カナ）
  hotelSpecial: string; // 施設特色
  hotelMinCharge: number; // 最安料金
  latitude: number; // 緯度
  longitude: number; // 経度
  postalCode: string; // 郵便番号
  address1: string; // 住所1
  address2: string; // 住所2
  telephoneNo: string; // 施設電話番号
  faxNo: string; // 施設FAX番号
  access: string; // 施設へのアクセス
  parkingInformation: string; // 駐車場情報
  nearestStation: string; // 最寄駅
  hotelImageUrl: string; // 施設画像URL
  hotelThumbnailUrl: string; // 施設サムネイルURL
  roomImageUrl: string | null; // 部屋画像URL
  roomThumbnailUrl: string | null; // 部屋サムネイルURL
  hotelMapImageUrl: string; // 施設マップ画像URL
  reviewCount: number; // 投稿件数
  reviewAverage: number; // 総合評価
  userReview: string; // ユーザーレビュー
}

// 部屋の基本情報
export interface RoomBasicInfo {
  roomClass: string; // 部屋クラス
  roomName: string; // 部屋名称
  planId: number; // プランID
  planName: string; // プラン名称
  pointRate: number; // ポイント率
  withDinnerFlag: number; // 夕食フラグ
  dinnerSelectFlag: number; // 夕食選択フラグ
  withBreakfastFlag: number; // 朝食フラグ
  breakfastSelectFlag: number; // 朝食選択フラグ
  payment: string; // 支払い方法
  reserveUrl: string; // 予約URL
  salesformFlag: number; // 販売形態フラグ
}

// 日別料金情報
export interface DailyCharge {
  stayDate: string; // 宿泊日
  rakutenCharge: number; // 楽天料金
  total: number; // 合計
  chargeFlag: number; // 料金フラグ
}

// 部屋情報
export interface RoomInfo {
  roomBasicInfo?: RoomBasicInfo; // 部屋基本情報
  dailyCharge?: DailyCharge; // 日別料金情報
}

// ホテル情報（基本情報と部屋情報を含む）
export interface Hotel {
  hotelBasicInfo: HotelBasicInfo; // ホテル基本情報
  roomInfoList: RoomInfo[]; // 部屋情報リスト
}

// 楽天APIレスポンス
export interface RakutenApiResponse {
  pagingInfo: {
    recordCount: number; // レコード数
    pageCount: number; // ページ数
    page: number; // ページ
    first: number; // 最初
    last: number; // 最後
  };
  hotels: Array<
    Array<{
      hotelBasicInfo?: HotelBasicInfo; // ホテル基本情報
      roomInfo?: RoomInfo[]; // 部屋情報
    }>
  >;
}

// ホテル検索結果レスポンス
export interface HotelsResponse {
  hotels: Hotel[];
  pagingInfo: {
    recordCount: number;
    pageCount: number;
    page: number;
    first: number;
    last: number;
  };
}
