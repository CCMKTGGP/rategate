"use client";
import { fetchData } from "@/utils/fetch";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

export interface IBusiness {
  _id: string;
  name: string;
  email: string;
  phone_number: string;
  platforms: Array<{
    id: string;
    name: string;
    url: string;
    total_reviews: number;
  }>;
  plan: {
    _id: string;
    plan_id: string;
    name: string;
    max_reviews: string;
    max_locations: string;
  };
  is_verified: boolean;
  verify_token?: string;
  verify_token_expire?: Date;
  number_of_retries?: number;
}

export const INITIAL_BUSINESS_STATE: IBusiness = {
  _id: "",
  name: "",
  email: "",
  phone_number: "",
  platforms: [],
  plan: {
    _id: "",
    plan_id: "",
    name: "",
    max_reviews: "",
    max_locations: "",
  },
  is_verified: false,
};

const Context = createContext<{
  business: IBusiness;
  setBusiness: (business: IBusiness) => void;
  toggleFetchBusinessDetails: boolean;
  setToggleFetchBusinessDetails: (value: boolean) => void;
}>({
  business: INITIAL_BUSINESS_STATE,
  setBusiness: () => {},
  toggleFetchBusinessDetails: false,
  setToggleFetchBusinessDetails: () => {},
});

export function BusinessContext({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const businessId =
    (typeof window !== "undefined" && localStorage.getItem("businessId")) ?? "";
  const [business, setBusiness] = useState<IBusiness>(INITIAL_BUSINESS_STATE);
  const [toggleFetchBusinessDetails, setToggleFetchBusinessDetails] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>();

  useEffect(() => {
    async function getBusinessDetails(businessId: string) {
      try {
        const response = await fetchData(`/api/business/${businessId}`);
        const { data } = response;
        setBusiness(data.business);
      } catch (err: any) {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    }

    if (businessId) {
      setIsLoading(true);
      getBusinessDetails(businessId);
    }

    return () => {
      setIsLoading(false);
    };
  }, [businessId, toggleFetchBusinessDetails]);

  return (
    <Context.Provider
      value={{
        business,
        setBusiness,
        toggleFetchBusinessDetails,
        setToggleFetchBusinessDetails,
      }}
    >
      {isLoading ? (
        <div className="h-[100vh] w-[100vw] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm leading-5 font-medium text-black text-center">
              Fetching business details. Please hang on a sec!
            </p>
          </div>
        </div>
      ) : (
        children
      )}
    </Context.Provider>
  );
}

export function useBusinessContext() {
  return useContext(Context);
}
