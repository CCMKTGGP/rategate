"use client";
import { IPlatform } from "@/app/api/location/interface";
import { fetchData } from "@/utils/fetch";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

export interface IReview {
  _id: string;
  rating: number;
  feedback: string;
  provider: string;
  type: string;
  business_id: {
    _id: string;
    name: string;
  };
  location_id: {
    _id: string;
    name: string;
  };
  employee_id: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

const Context = createContext<{
  reviews: IReview[];
  setReviews: (reviews: IReview[]) => void;
  toggleFetchReviews: boolean;
  setToggleFetchReviews: (value: boolean) => void;
}>({
  reviews: [],
  setReviews: () => {},
  toggleFetchReviews: false,
  setToggleFetchReviews: () => {},
});

export function ReviewsContext({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const businessId =
    (typeof window !== "undefined" && localStorage.getItem("businessId")) ?? "";
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [toggleFetchReviews, setToggleFetchReviews] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>();

  useEffect(() => {
    async function getAllReviewsForBusiness(businessId: string) {
      try {
        const response = await fetchData(
          `/api/get-all-reviews-business?businessId=${businessId}`
        );
        const { data } = response;
        const sortedReviews = data.sort(
          (a: IReview, b: IReview) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setReviews(sortedReviews);
      } catch (err: any) {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    }

    if (businessId) {
      setIsLoading(true);
      getAllReviewsForBusiness(businessId);
    }

    return () => {
      setIsLoading(false);
    };
  }, [businessId, toggleFetchReviews]);

  return (
    <Context.Provider
      value={{
        reviews,
        setReviews,
        toggleFetchReviews,
        setToggleFetchReviews,
      }}
    >
      {isLoading ? (
        <div className="h-[100vh] w-[100vw] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm leading-5 font-medium text-black text-center">
              Fetching reviews for business. Please hang on a sec!
            </p>
          </div>
        </div>
      ) : (
        children
      )}
    </Context.Provider>
  );
}

export function useReviewsContext() {
  return useContext(Context);
}
