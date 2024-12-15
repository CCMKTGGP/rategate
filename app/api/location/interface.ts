export interface ILocation {
  _id?: string;
  name?: string;
  address?: string;
  total_reviews?: number;
  total_members?: number;
  platforms?: Array<{
    id: string;
    name: string;
    url: string;
    total_reviews: number;
  }>;
}
