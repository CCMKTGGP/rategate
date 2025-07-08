import { IReview } from "@/context/reviewContext";

export interface ChartProps {
  reviews: IReview[];
  businessId: string;
}
