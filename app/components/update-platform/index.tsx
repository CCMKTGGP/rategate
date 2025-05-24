import React, { useState } from "react";
import { IUpdatePlatformsProps, PLATFORM_TYPES } from "./interface";
import { SUPPORTED_PLATFORMS } from "@/constants/onboarding_platforms";
import PlatformCheckbox from "../platform-checkbox";
import ApiError from "../api-error";
import Button from "../button";
import { IPlatform } from "@/app/api/location/interface";
import { putData } from "@/utils/fetch";
import { useBusinessContext } from "@/context/businessContext";
import Input from "../input";

export default function UpdatePlatforms({
  businessId,
  locationId,
  type,
  platforms,
  onCancel,
  onConfirm,
}: IUpdatePlatformsProps) {
  const { business } = useBusinessContext();
  const [businessPlatforms, setBusinessPlatforms] = useState(platforms);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({
    urlError: "",
    apiError: "",
    searchError: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [togglePlatformOptions, setTogglePlatformOptions] = useState(false);

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
      businessPlatforms.filter(
        (p) => p.name.toLowerCase() === name.toLowerCase()
      ).length > 0
    ) {
      setError((error) => ({
        ...error,
        searchError: "Platform Already Added!",
      }));
      setSearchTerm("");
      return;
    }

    // if not then update the platform state
    setBusinessPlatforms([...businessPlatforms, newPlatform]);
    setSearchTerm("");
  };

  function availablePlatforms() {
    return SUPPORTED_PLATFORMS.filter((platformName: string) => {
      return platformName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }

  async function handleUpdatePlatforms() {
    // check whether all the urls added are in correct format
    const validUrls = businessPlatforms.filter((platform: IPlatform) =>
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
    const apiUrl =
      type.toLowerCase() === PLATFORM_TYPES.BUSINESS.toLowerCase()
        ? `/api/business/${businessId}`
        : `/api/location/${locationId}`;
    try {
      const response = await putData(apiUrl, {
        data: {
          platforms: businessPlatforms,
        },
      });
      const { message } = response;
      console.log(message);
      onConfirm();
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
    <div className="w-screen h-screen flex items-center justify-center fixed top-0 lef-0 bottom-0 right-0 bg-heading/25">
      <div className="w-[600px] max-h-[80vh] overflow-auto p-8 bg-white shadow-card rounded-[24px]">
        <div className="flex flex-col gap-8">
          <h3 className="font-archivo text-2xl leading-[48px] text-heading font-semibold">
            Update platforms
          </h3>
          <div className="relative w-full">
            <Input
              type="text"
              label="Platform Name"
              value={searchTerm}
              autoComplete="off"
              placeholder="type platforms name..."
              onChange={(event) => setSearchTerm(event.target.value)}
              onFocus={() => setTogglePlatformOptions(true)}
              onBlur={() =>
                setTimeout(() => setTogglePlatformOptions(false), 50)
              }
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
                    Sorry, there are currently no platforms for that search
                    string.
                  </p>
                )}
              </div>
            )}
          </div>
          {businessPlatforms?.length > 0 ? (
            <div className="flex flex-col w-full max-h-96 overflow-auto">
              {[...businessPlatforms]
                .reverse()
                .map(({ id, name: platformName, url }) => {
                  const placeholder = `https://${platformName}.com/v/${business.name}/reviews`;
                  return (
                    <PlatformCheckbox
                      key={id}
                      showSeparator={false}
                      placeholder={placeholder}
                      url={url}
                      platform={{
                        id,
                        name: platformName,
                      }}
                      onChange={({ id, url }) => {
                        const updatedPlatforms = businessPlatforms.map(
                          (platform) =>
                            platform.id.toLowerCase() === id.toLowerCase()
                              ? { ...platform, url }
                              : platform
                        );
                        setBusinessPlatforms(updatedPlatforms);
                      }}
                      onDelete={(id) => {
                        const updatedPlatforms = businessPlatforms.filter(
                          (platform) =>
                            platform.id.toLowerCase() !== id.toLowerCase()
                        );
                        setBusinessPlatforms(updatedPlatforms);
                      }}
                    />
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
          <div className="flex items-center justify-center gap-8">
            <Button
              isDisabled={isLoading}
              buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-[#F3F4F6] text-[#565E6C]"
              buttonText="Cancel"
              onClick={() => onCancel()}
            />
            <Button
              isDisabled={isLoading}
              isLoading={isLoading}
              buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white"
              buttonText="Update"
              onClick={() => {
                handleUpdatePlatforms();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
