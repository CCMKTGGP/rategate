"use client";
import { IPlatform } from "@/app/api/location/interface";
import ApiError from "@/app/components/api-error";
import Button from "@/app/components/button";
import Input from "@/app/components/input";
import PlatformCheckbox from "@/app/components/platform-checkbox";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/topbar";
import { SUPPORTED_PLATFORMS } from "@/constants/onboarding_platforms";
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
  const [strategy, setStrategy] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [platforms, setPlatforms] = useState<Array<IPlatform>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({
    nameError: "",
    addressError: "",
    urlError: "",
    apiError: "",
    searchError: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [togglePlatformOptions, setTogglePlatformOptions] = useState(false);

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

  const handleAddPlatform = (name: string) => {
    setError((error) => ({
      ...error,
      searchError: "",
    }));
    const newPlatform: IPlatform = {
      id: name.toUpperCase().replace(/\s+/g, "_"),
      name,
      total_reviews: 0,
      url: "",
    };

    // check if the platform is already added
    if (
      platforms.filter((p) => p.name.toLowerCase() === name.toLowerCase())
        .length > 0
    ) {
      setError((error) => ({
        ...error,
        searchError: "Platform Already Added!",
      }));
      setSearchTerm("");
      return;
    }

    // if not then update the platform state
    setPlatforms([...platforms, newPlatform]);
    setSearchTerm("");
  };

  function availablePlatforms() {
    return SUPPORTED_PLATFORMS.filter((platformName: string) => {
      return platformName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }

  async function handleAddLocation() {
    // check whether all the urls added are in correct format
    const validUrls = platforms.filter((platform: IPlatform) =>
      platform.url.trim()
    );
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
        locationStrategy: strategy,
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
        <div className="flex flex-col">
          <label
            htmlFor="positive-feedback"
            className="block text-sm text-heading mb-2 font-inter font-bold"
          >
            Location Strategy
          </label>
          <textarea
            id="location-strategy"
            placeholder="Enter your location strategy"
            aria-label="Location Strategy"
            aria-describedby="location-strategy"
            name="location-strategy"
            className={`font-inter w-full px-4 py-3 mb-2 outline-none border placeholder:text-md placeholder:text-grey rounded-md border-stroke/50 ${
              strategy.length > 0 ? "bg-white" : "bg-[#F3F4F6]"
            }`}
            rows={4}
            cols={50}
            onChange={(event) => {
              setStrategy(event.target.value);
            }}
            value={strategy}
          />
        </div>
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
            buttonText="Continue"
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
      <div className="flex flex-col gap-2">
        <h3 className="text-2xl leading-[1.2] text-heading font-archivo font-bold">
          Search the Platforms Where You Collect Reviews.
        </h3>
        <p className="text-base leading-6 text-[#6E7787]">{`location - ${name}.`}</p>
      </div>
      <div className="relative w-full">
        <Input
          type="text"
          label="Platform Name"
          value={searchTerm}
          autoComplete="off"
          placeholder="type platforms name..."
          onChange={(event) => setSearchTerm(event.target.value)}
          onFocus={() => setTogglePlatformOptions(true)}
          onBlur={() => setTimeout(() => setTogglePlatformOptions(false), 50)}
          disabled={isLoading}
        />

        {error.searchError && (
          <ApiError
            message={error.searchError}
            setMessage={(value) =>
              setError((prev) => ({ ...prev, searchError: value }))
            }
          />
        )}

        {(togglePlatformOptions || searchTerm !== "") && (
          <div className="p-4 w-full rounded-[12px] border border-stroke/60 bg-white absolute top-[90px] max-h-48 overflow-auto">
            {availablePlatforms().length > 0 ? (
              availablePlatforms().map((platformName, index) => {
                return (
                  <div
                    key={platformName}
                    className="cursor-pointer"
                    onMouseDown={() => handleAddPlatform(platformName)}
                  >
                    <p className="text-base leading-6 text-subHeading p-2 hover:bg-primary hover:text-white hover:font-semibold transition-all rounded-[6px]">
                      {platformName}
                    </p>
                    {index !== availablePlatforms().length - 1 && <hr />}
                  </div>
                );
              })
            ) : (
              <p className="text-base leading-6 text-subHeading">
                Sorry, there are currently no platforms for that search string.
              </p>
            )}
          </div>
        )}
      </div>
      {platforms?.length > 0 ? (
        <div className="flex flex-col max-w-[600px] max-h-96 overflow-auto">
          {[...platforms].reverse().map(({ id, name: platformName, url }) => {
            const placeholder = `https://${platformName}.com/v/${business.name}/reviews`;
            return (
              <div key={id}>
                <PlatformCheckbox
                  showSeparator={false}
                  placeholder={placeholder}
                  url={url}
                  platform={{
                    id,
                    name: platformName,
                  }}
                  onChange={({ id, url }) => {
                    const updatedPlatforms = platforms.map((platform) =>
                      platform.id.toLowerCase() === id.toLowerCase()
                        ? { ...platform, url }
                        : platform
                    );
                    setPlatforms(updatedPlatforms);
                  }}
                  onDelete={(id) => {
                    const updatedPlatforms = platforms.filter(
                      (platform) =>
                        platform.id.toLowerCase() !== id.toLowerCase()
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
        </div>
      ) : (
        <p className="text-base leading-6 text-[#6E7787]">
          Search from platforms on the top!
        </p>
      )}
      <div className="flex gap-8">
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
          buttonText="Add Location"
          onClick={() => handleAddLocation()}
        />
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
              Add Location
            </h3>
            <p className="text-base leading-[24px] font-medium text-subHeading ">
              Create your location. Each location is $10/Month.
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
