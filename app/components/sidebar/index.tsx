"use client";
import Link from "next/link";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { INITIAL_USER_STATE, useUserContext } from "@/context/userContext";
import DashboardSvg from "../svg/Dashboard";
import AccountSvg from "../svg/Account";
import BillingSvg from "../svg/Billing";
import {
  INITIAL_BUSINESS_STATE,
  useBusinessContext,
} from "@/context/businessContext";
import Image from "next/image";
import { fetchData } from "@/utils/fetch";
import ApiError from "../api-error";
import Button from "../button";
import ArrowDownSvg from "../svg/ArrowDown";
import ReviewSvg from "../svg/Review";

export default function Sidebar() {
  const router = useRouter();
  const { user, setUser } = useUserContext();
  const { business, setBusiness } = useBusinessContext();
  const pathname = usePathname().split("/");

  // STATES
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({
    apiError: "",
  });

  // CONSTANTS
  const SIDEBAR_ITEMS = ["Dashboard", "Reviews", "Billing", "Account"];

  const fetchIcon = (itemName: string, isActive: boolean) => {
    switch (itemName.toLowerCase()) {
      case "dashboard":
        return <DashboardSvg fill={isActive ? "#636AE8" : "#9095A0"} />;
      case "account":
        return <AccountSvg fill={isActive ? "#636AE8" : "#9095A0"} />;
      case "reviews":
        return <ReviewSvg fill={isActive ? "#636AE8" : "#9095A0"} />;
      case "billing":
        return <BillingSvg fill={isActive ? "#636AE8" : "#9095A0"} />;
      default:
        return null;
    }
  };

  async function handleLogout() {
    setIsLoading(true);
    try {
      const response = await fetchData("/api/logout");
      const { message } = response;
      console.log(message);
      return router.replace("/login");
    } catch (err: any) {
      setError((error) => ({
        ...error,
        apiError: err.message,
      }));
    } finally {
      setIsLoading(false);
      setUser(INITIAL_USER_STATE);
      setBusiness(INITIAL_BUSINESS_STATE);
      if (typeof window !== "undefined") {
        localStorage.removeItem("userId");
        localStorage.removeItem("token");
        localStorage.removeItem("businessId");
      }
    }
  }

  return (
    <div className="w-[250px] h-[100vh] border-r border-stroke/20 bg-white">
      <div className="h-[15%] flex items-center pl-8 border-b border-stroke/20">
        <Link href={"/"}>
          <Image
            src="/logo.png"
            alt="Logo of Rategate"
            width={135}
            height={50}
            priority
          />
        </Link>
      </div>
      <div className="flex flex-col gap-9 py-8 px-8 h-[65%]">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname.includes(item.toLowerCase());
          return (
            <Link
              href={`/application/${user._id}/${
                business._id
              }/${item.toLowerCase()}`}
              key={item}
              className="flex items-center gap-1"
            >
              <div className="pr-2">{fetchIcon(item, isActive)}</div>
              <p
                className={`flex-grow text-lg leading-[24px] ${
                  isActive ? "text-primary font-bold" : "text-subHeading"
                }`}
              >
                {item}
              </p>
              {isActive && (
                <div className="pl-4">
                  <div className="rotate-[270deg]">
                    <ArrowDownSvg fill="#636AE8" />
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </div>
      <div className="h-[20%] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-center px-4">
            {error.apiError && (
              <ApiError
                message={error.apiError}
                setMessage={(value) =>
                  setError((error) => ({
                    ...error,
                    apiError: value,
                  }))
                }
              />
            )}
          </div>
          {isLoading ? (
            <div className="py-2">
              <p>Loging you out!</p>
            </div>
          ) : (
            <Button
              isDisabled={isLoading}
              isLoading={isLoading}
              buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-[#FDE4E4] text-[#913838] px-4 py-2"
              buttonText="Logout"
              onClick={() => handleLogout()}
            />
          )}
        </div>
      </div>
    </div>
  );
}
