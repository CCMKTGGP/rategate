export interface IPlatform {
  id: string;
  name: string;
  url: string;
  total_reviews: number;
}
export interface ILocation {
  _id?: string;
  name?: string;
  address?: string;
  total_reviews?: number;
  total_members?: number;
  platforms?: Array<IPlatform>;
  slug?: string;
}
