"use client";
import { useUserContext } from "@/context/userContext";
import React from "react";
import { useBusinessContext } from "@/context/businessContext";

export default function TopBar() {
  const { user } = useUserContext();
  const { business } = useBusinessContext();

  return (
    <div className="h-[15%] px-8 flex items-center">
      <div className="flex items-center w-full">
        <h2 className="font-archivo text-[24px] leading-[36px] text-heading font-bold">
          Welcome, {business.name}
        </h2>
        <div className="ml-auto">
          <div className="p-4 rounded-full border border-stroke/50 flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <p className="text-lg text-white">{user.first_name[0]}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-bold text-heading">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-sm font-normal text-subHeading">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
