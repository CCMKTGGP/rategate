import React, { useState } from "react";
import { IUpdatePlatformsProps, PLATFORM_TYPES } from "./interface";
import { PLATFORMS } from "@/constants/onboarding_platforms";
import PlatformCheckbox from "../platform-checkbox";
import ApiError from "../api-error";
import Button from "../button";
import { IPlatform } from "@/app/api/location/interface";
import { putData } from "@/utils/fetch";

export default function UpdatePlatforms({
  businessId,
  locationId,
  type,
  platforms,
  onCancel,
  onConfirm,
}: IUpdatePlatformsProps) {
  const [businessPlatforms, setBusinessPlatforms] = useState(platforms);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({
    urlError: "",
    apiError: "",
  });

  function isValidURL(url: string) {
    const urlRegex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/[^\s]*)?$/i;
    return urlRegex.test(url);
  }

  console.log(businessPlatforms);

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
          <div className="flex flex-col gap-4">
            <form className="w-full">
              {PLATFORMS.map(({ id, name, helperText, label }) => {
                const selectedPlatform = businessPlatforms.filter(
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
                        let updatedPlatforms = businessPlatforms;
                        if (selectedPlatform.length > 0) {
                          updatedPlatforms = businessPlatforms.filter(
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
                        setBusinessPlatforms(updatedPlatforms);
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
              <div className="flex items-center justify-center mt-12 mb-6 gap-8">
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
