"use client";
import { fetchData } from "@/utils/fetch";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

export interface IUser {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_verified: boolean;
  verify_token?: string;
  verify_token_expire?: Date;
  number_of_retries?: number;
  plan: {
    _id: string;
    plan_id: string;
    name: string;
    max_reviews: string;
    max_locations: string;
  };
}

const INITIAL_STATE: IUser = {
  _id: "",
  first_name: "",
  last_name: "",
  email: "",
  is_verified: false,
  plan: {
    _id: "",
    plan_id: "",
    name: "",
    max_reviews: "",
    max_locations: "",
  },
};

const Context = createContext<{
  user: IUser;
  setUser: (user: IUser) => void;
  toggleFetchUserDetails: boolean;
  setToggleFetchUserDetails: (value: boolean) => void;
}>({
  user: INITIAL_STATE,
  setUser: () => {},
  toggleFetchUserDetails: false,
  setToggleFetchUserDetails: () => {},
});

const authPathNames = ["/login", "/register"];

export function UserContext({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const userId =
    (typeof window !== "undefined" && localStorage.getItem("userId")) ?? "";
  const [user, setUser] = useState<IUser>(INITIAL_STATE);
  const [toggleFetchUserDetails, setToggleFetchUserDetails] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>();

  useEffect(() => {
    async function getUserDetails(userId: string) {
      try {
        const response = await fetchData(`/api/users/${userId}`);
        const { data } = response;
        if (!data?.is_verified && !authPathNames.includes(pathname)) {
          router.push("/email-not-verified");
        }
        setUser(data);
      } catch (err: any) {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      setIsLoading(true);
      getUserDetails(userId);
    }

    return () => {
      setIsLoading(false);
    };
  }, [userId, toggleFetchUserDetails]);

  return (
    <Context.Provider
      value={{
        user,
        setUser,
        toggleFetchUserDetails,
        setToggleFetchUserDetails,
      }}
    >
      {isLoading ? (
        <div className="h-[100vh] w-[100vw] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm leading-5 font-medium text-black text-center">
              Fetching user details. Please hang on a sec!
            </p>
          </div>
        </div>
      ) : (
        children
      )}
    </Context.Provider>
  );
}

export function useUserContext() {
  return useContext(Context);
}
