"use client";
import ApiError from "@/app/components/api-error";
import Button from "@/app/components/button";
import Input from "@/app/components/input";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/topbar";
import { useBusinessContext } from "@/context/businessContext";
import { useUserContext } from "@/context/userContext";
import { postData } from "@/utils/fetch";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function AddLocation() {
  const router = useRouter();
  const { user } = useUserContext();
  const { business } = useBusinessContext();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({
    nameError: "",
    addressError: "",
    apiError: "",
  });

  function checkLocationName() {
    if (!name) {
      setError((error) => ({
        ...error,
        nameError: "Location Name is required",
      }));
      return false;
    }
    setError((error) => ({
      ...error,
      nameError: "",
    }));
    return true;
  }

  function checkAddress() {
    if (!address) {
      setError((error) => ({
        ...error,
        addressError: "Address is required",
      }));
      return false;
    }
    setError((error) => ({
      ...error,
      addressError: "",
    }));
    return true;
  }

  async function handleAddLocation() {
    const ALL_CHECKS_PASS = [checkLocationName(), checkAddress()].every(
      Boolean
    );
    if (!ALL_CHECKS_PASS) return;
    setIsLoading(true);
    try {
      const response = await postData("/api/location", {
        userId: user?._id,
        businessId: business._id,
        name,
        address,
      });
      const { data } = response;
      window.location.href = data?.sessionUrl;
    } catch (err: any) {
      setError((error) => ({
        ...error,
        apiError: err.message,
      }));
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div className="flex items-start bg-white">
      <Sidebar />
      <div className="flex-1 h-screen overflow-auto">
        <TopBar />
        <div className="px-8 py-4">
          <div className="my-2">
            <Link
              href={`/application/${user?._id}/${business._id}/dashboard`}
              className="text-heading underline font-medium text-md leading-md"
            >
              Dashboard
            </Link>
          </div>
          <div className="flex flex-col pb-8">
            <h3 className="font-archivo text-2xl leading-[48px] text-heading font-semibold">
              Create Location
            </h3>
            <p className="text-base leading-[24px] font-medium text-subHeading ">
              Create your location. Each location is $10/Month
            </p>
          </div>
          <div className="bg-white rounded-[12px] w-[550px] px-6 py-8 shadow-card border border-stroke/30">
            <div className="flex flex-col gap-4">
              <Input
                type="text"
                label="Location Name"
                value={name}
                placeholder="Enter name of the location"
                onChange={(event) => setName(event.target.value)}
                error={error.nameError}
                disabled={isLoading}
              />
              <Input
                type="text"
                label="Location Address"
                value={address}
                placeholder="Enter your full address"
                onChange={(event) => setAddress(event.target.value)}
                error={error.addressError}
                disabled={isLoading}
              />
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
              <div className="flex flex-start items-center gap-6 mt-4">
                <Button
                  isDisabled={isLoading}
                  buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-[#F3F4F6] text-[#565E6C]"
                  buttonText="Cancel"
                  onClick={() => {
                    router.push(
                      `/application/${user?._id}/${business._id}/dashboard`
                    );
                  }}
                />
                <Button
                  isDisabled={isLoading}
                  isLoading={isLoading}
                  buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white"
                  buttonText="Add Location"
                  onClick={() => handleAddLocation()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
