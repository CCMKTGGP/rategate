"use client";
import { useUserContext } from "@/context/userContext";
import React from "react";
import { useBusinessContext } from "@/context/businessContext";

export default function TopBar() {
  const { user } = useUserContext();
  const { business } = useBusinessContext();

  return (
    <div className="h-[15%] px-8 flex items-center">
      <div>
        <h2 className="font-archivo text-[24px] leading-[36px] text-heading font-bold">
          Welcome, {business.name}
        </h2>
        <p className="text-sm leading-[24px] text-heading">
          Logged in as {user?.first_name} {user.last_name}
        </p>
      </div>
    </div>
  );
}
