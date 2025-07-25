"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IPlatform } from "@/app/api/location/interface";
import { useUserContext } from "@/context/userContext";
import { useBusinessContext } from "@/context/businessContext";
import { SUPPORTED_PLATFORMS } from "@/constants/onboarding_platforms";
import { postData, putData } from "@/utils/fetch";
import ApiError from "@/app/components/api-error";
import Button from "@/app/components/button";
import OnboardingMarker from "@/app/components/onboarding-marker";
import PlatformCheckbox from "@/app/components/platform-checkbox";
import {
  COLLECT_SURVEY,
  ONBOARDING_STEPS,
  SELECT_PLATFORMS,
} from "@/constants/onboarding-constants";
import Image from "next/image";
import Input from "@/app/components/input";

export default function Onboarding() {
  const { user } = useUserContext();
  const { business, setBusiness } = useBusinessContext();
  const router = useRouter();

  const [currentStep, _] = useState(SELECT_PLATFORMS);
  const [togglePlatformOptions, setTogglePlatformOptions] = useState(false);
  const [state, setState] = useState<{
    platforms: Array<IPlatform>;
  }>({
    platforms: [],
  });
  const [error, setError] = useState({
    nameError: "",
    emailError: "",
    phoneNumberError: "",
    urlError: "",
    apiError: "",
    searchError: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { platforms } = state;

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
    setState((prev) => ({
      ...prev,
      platforms: [...prev.platforms, newPlatform],
    }));
    setSearchTerm("");
  };

  function availablePlatforms() {
    return SUPPORTED_PLATFORMS.filter((platformName: string) => {
      return platformName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }

  async function handleUpdateBusiness() {
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
    setError((error) => ({ ...error, urlError: "" }));
    setIsLoading(true);
    try {
      const response = await putData(`/api/business/${business._id}`, {
        data: { platforms },
      });
      const { data } = response;
      if (data) {
        setBusiness(data);
        await postData("/api/update-onboarding-step", {
          userId: user._id,
          businessId: business._id,
          onboardingStep: COLLECT_SURVEY,
        });
        router.push(`/application/${user?._id}/collect-survey`);
      }
    } catch (err: any) {
      setError((error) => ({ ...error, apiError: err.message }));
    } finally {
      setIsLoading(false);
    }
  }

  const SELECT_PLATFORMS_COMPONENT = (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl leading-[1.6] text-heading font-archivo font-bold max-w-[90%]">
          Search the Platforms Where You Collect Reviews.
        </h1>
      </div>
      <div className="flex flex-col gap-4">
        <div className="relative w-[80%]">
          <Input
            type="text"
            label="Platform Name"
            value={searchTerm}
            autoComplete="off"
            placeholder="Search for a platform"
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
                  Sorry, there are currently no platforms for that search
                  string.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <main className="flex bg-white">
      <div className="h-[100vh] w-[45%] overflow-auto">
        <div className="px-6 lg:px-12">
          <div className="py-12">
            <Image
              src="/logo.png"
              alt="Logo of Rategate"
              width={135}
              height={50}
              priority
            />
          </div>
          <div className="py-12 w-full flex flex-col gap-8">
            <OnboardingMarker
              currentStep={ONBOARDING_STEPS.indexOf(currentStep) + 1}
              totalSteps={ONBOARDING_STEPS.length}
            />
            {currentStep === SELECT_PLATFORMS && SELECT_PLATFORMS_COMPONENT}
          </div>
        </div>
      </div>

      <div className="h-[100vh] w-[55%] px-6 lg:px-12">
        <div className="h-[20%] flex items-center">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl leading-[1.6] text-heading font-archivo font-bold max-w-[90%]">
              Selected Platforms
            </h2>
            <p className="text-base leading-6 text-[#6E7787]">
              {
                "Don’t worry if you haven’t got the links now, you can add them later."
              }
            </p>
          </div>
        </div>
        <div className="h-[65%] overflow-auto">
          {platforms.length > 0 ? (
            <div className="flex flex-col gap-2 max-w-[600px]">
              {[...platforms]
                .reverse()
                .map(({ id, name: platformName, url }) => {
                  const placeholder = `https://${platformName}.com/v/${business.name}/reviews`;
                  return (
                    <div key={id}>
                      <PlatformCheckbox
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
                          setState((prev) => ({
                            ...prev,
                            platforms: updatedPlatforms,
                          }));
                        }}
                        onDelete={(id) => {
                          const updatedPlatforms = platforms.filter(
                            (platform) =>
                              platform.id.toLowerCase() !== id.toLowerCase()
                          );
                          setState((prev) => ({
                            ...prev,
                            platforms: updatedPlatforms,
                          }));
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
              Search from platforms on the left!
            </p>
          )}
        </div>
        <div className="h-[15%] flex items-center justify-end gap-8">
          <Button
            isDisabled={isLoading || platforms.length <= 0}
            isLoading={isLoading}
            buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white"
            buttonText="Continue"
            onClick={handleUpdateBusiness}
          />
        </div>
      </div>
    </main>
  );
}
