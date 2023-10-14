export interface Profile{
  id?: string,
  name?: string,
  email?: string,
  address?: ProfileAddress;
  acumulatedPoints?: number
}

export interface ProfileAddress{
  state?: string;
  city?: string;
  quatrain: string;
  block: string;
}



export interface ICard{
  id?: string;
  promotionId: string;
  profileId: string;
  myPoints: number;
  createDate: Date | string;
}

export interface IPromotion{
  id?: string;
  title: string;
  promotionDescription: string;
  points: number;
  thumbnail: string;
  slideImages: Array<string>;
  expireDate: Date | string;
  createDate: Date | string;
}

export interface ITicket{
  id?: string;
  promotionId: string;
  profileId: string;
  code: string;
  createDate: Date | string;
}