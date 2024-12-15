"use client";
import ApiError from "@/app/components/api-error";
import Button from "@/app/components/button";
import Input from "@/app/components/input";
import PlatformCheckbox from "@/app/components/platform-checkbox";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/topbar";
import { PLATFORMS } from "@/constants/onboarding_platforms";
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

  const COLLECT_LOCATION_INFO = "COLLECT_LOCATION_INFO";
  const COLLECT_LOCATION_PLATFORMS = "COLLECT_LOCATION_PLATFORMS";

  const [currentStep, setCurrentStep] = useState(COLLECT_LOCATION_INFO);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [platforms, setPlatforms] = useState<
    Array<{
      id: string;
      name: string;
      url: string;
      total_reviews: number;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({
    nameError: "",
    addressError: "",
    urlError: "",
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

  function isValidURL(url: string) {
    const urlRegex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/[^\s]*)?$/i;
    return urlRegex.test(url);
  }

  async function handleAddLocation() {
    // check whether all the urls added are in correct format
    const validUrls = platforms.filter((platform) => platform.url.trim());
    const invalidUrls = validUrls.filter(
      (platform) => !isValidURL(platform.url)
    );
    if (invalidUrls.length > 0) {
      setError((error) => ({
        ...error,
        urlError:
          "Invalid URLs found. Please make sure to add valid URLs for each platform.",
      }));
      return;
    }
    setError((error) => ({
      ...error,
      urlError: "",
    }));
    setIsLoading(true);
    try {
      const response = await postData("/api/location", {
        userId: user?._id,
        businessId: business._id,
        name,
        address,
        platforms,
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

  const LOCATION_INFO_COMPONENT = (
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
            onClick={() => {
              const ALL_CHECKS_PASS = [
                checkLocationName(),
                checkAddress(),
              ].every(Boolean);
              if (!ALL_CHECKS_PASS) return;
              setCurrentStep(COLLECT_LOCATION_PLATFORMS);
            }}
          />
        </div>
      </div>
    </div>
  );

  const SELECT_PLATFORMS_COMPONENT = (
    <div className="bg-white rounded-[12px] w-[550px] px-6 py-8 shadow-card border border-stroke/30 flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        {/* <h1 className="text-3xl leading-[1.6] text-heading font-archivo font-bold max-w-[90%]">
          {"Choose the platforms where you'd like to collect reviews."}
        </h1> */}
        <p className="text-base leading-6 text-heading w-[80%]">
          {"Choose the platforms where you'd like to collect reviews."}
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <form className="w-[500px]">
          {PLATFORMS.map(({ id, name, helperText, label }) => {
            const selectedPlatform = platforms.filter(
              (platform) => platform.id.toLowerCase() === id.toLowerCase()
            );
            const checked = selectedPlatform.length > 0;
            return (
              <div key={id}>
                <PlatformCheckbox
                  url={selectedPlatform[0]?.url}
                  platform={{ id, name, helpertext: helperText, label }}
                  checked={checked}
                  onSelect={({ id, name }) => {
                    let updatedPlatforms = platforms;
                    if (selectedPlatform.length > 0) {
                      updatedPlatforms = platforms.filter(
                        (platform) =>
                          platform.id.toLowerCase() !== id.toLowerCase()
                      );
                    } else {
                      updatedPlatforms = [
                        ...updatedPlatforms,
                        {
                          id,
                          name,
                          url: "",
                          total_reviews: 0,
                        },
                      ];
                    }
                    setPlatforms(updatedPlatforms);
                  }}
                  onChange={({ id, url }) => {
                    const updatedPlatforms = platforms.map((platform) =>
                      platform.id.toLowerCase() === id.toLowerCase()
                        ? { ...platform, url }
                        : platform
                    );
                    setPlatforms(updatedPlatforms);
                  }}
                />
              </div>
            );
          })}
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
          {error.urlError && (
            <ApiError
              message={error.urlError}
              setMessage={(value) =>
                setError((error) => ({
                  ...error,
                  urlError: value,
                }))
              }
            />
          )}
          <div className="flex justify-between mt-12 mb-6">
            <Button
              isDisabled={isLoading}
              isLoading={isLoading}
              buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-[#F3F4F6] text-[#565E6C]"
              buttonText="Back"
              onClick={() => {
                setCurrentStep(COLLECT_LOCATION_INFO);
              }}
            />
            <Button
              isDisabled={isLoading}
              isLoading={isLoading}
              buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white"
              buttonText="Continue"
              onClick={() => handleAddLocation()}
            />
          </div>
        </form>
      </div>
    </div>
  );

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
          {currentStep.toLowerCase() === COLLECT_LOCATION_INFO.toLowerCase() &&
            LOCATION_INFO_COMPONENT}
          {currentStep.toLowerCase() ===
            COLLECT_LOCATION_PLATFORMS.toLowerCase() &&
            SELECT_PLATFORMS_COMPONENT}
        </div>
      </div>
    </div>
  );
}
