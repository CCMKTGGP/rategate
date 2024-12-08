"use client";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/topbar";
import React from "react";

export default function Billing() {
  return (
    <div className="flex items-start bg-white">
      <Sidebar />
      <div className="flex-1 h-screen overflow-auto">
        <TopBar />
        <div className="p-8">
          <p>Hello from Billing</p>
        </div>
      </div>
    </div>
  );
}
