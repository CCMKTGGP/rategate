"use client";
import { IPlatform } from "@/app/api/location/interface";
import ApiError from "@/app/components/api-error";
import Button from "@/app/components/button";
import Input from "@/app/components/input";
import OnboardingMarker from "@/app/components/onboarding-marker";
import PlatformCheckbox from "@/app/components/platform-checkbox";
import {
  COLLECT_BUSINESS_INFO,
  ONBOARDING_STEPS,
  SELECT_PLATFORMS,
} from "@/constants/onboarding-constants";
import { PLATFORMS } from "@/constants/onboarding_platforms";
import { useBusinessContext } from "@/context/businessContext";
import { useUserContext } from "@/context/userContext";
import { postData } from "@/utils/fetch";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function Onboarding() {
  const { user } = useUserContext();
  const { setBusiness } = useBusinessContext();
  const router = useRouter();

  // STATES
  const [currentStep, setCurrentStep] = useState(COLLECT_BUSINESS_INFO);
  const [state, setState] = useState<{
    name: string;
    email: string;
    phoneNumber: string;
    platforms: Array<IPlatform>;
  }>({
    name: "",
    email: "",
    phoneNumber: "",
    platforms: [],
  });
  const [error, setError] = useState({
    nameError: "",
    emailError: "",
    phoneNumberError: "",
    urlError: "",
    apiError: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // destructure the state
  const { name, email, phoneNumber, platforms } = state;

  function checkEmail() {
    if (!email) {
      setError((error) => ({
        ...error,
        emailError: "Business Email is required",
      }));
      return false;
    }
    if (!email.includes("@")) {
      setError((error) => ({
        ...error,
        emailError: "Please enter a valid email",
      }));
      return false;
    }
    setError((error) => ({
      ...error,
      emailError: "",
    }));
    return true;
  }

  function checktName() {
    if (!name) {
      setError((error) => ({
        ...error,
        nameError: "Business Name is required",
      }));
      return false;
    }
    setError((error) => ({
      ...error,
      nameError: "",
    }));
    return true;
  }

  function isValidURL(url: string) {
    const urlRegex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/[^\s]*)?$/i;
    return urlRegex.test(url);
  }

  const BUSINESS_INFO_COMPONENT = (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl leading-[1.6] text-heading font-archivo font-bold max-w-[90%]">
          Tell us more about your business
        </h1>
      </div>
      <div className="flex flex-col gap-4">
        <form className="w-full lg:w-[500px]">
          <Input
            type="text"
            label="Business Name"
            value={name}
            placeholder="Enter your business name"
            onChange={(event) =>
              setState((prev) => ({
                ...prev,
                name: event.target.value,
              }))
            }
            error={error.nameError}
            disabled={isLoading}
          />
          <Input
            type="email"
            value={email}
            label="Business Email"
            placeholder="Enter your business email address"
            onChange={(event) =>
              setState((prev) => ({
                ...prev,
                email: event.target.value,
              }))
            }
            error={error.emailError}
            disabled={isLoading}
          />
          <Input
            type="number"
            label="Business Telephone"
            helpertext="Optional"
            maxLength={10}
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChange={(event) => {
              if (event.target.value.length <= 10) {
                setState((prev) => ({
                  ...prev,
                  phoneNumber: event.target.value,
                }));
              }
              return;
            }}
            error={error.phoneNumberError}
            disabled={isLoading}
          />
          <div className="flex justify-end my-6">
            <Button
              isDisabled={isLoading}
              isLoading={isLoading}
              buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white"
              buttonText="Continue"
              onClick={() => {
                const ALL_CHECKS_PASS = [checktName(), checkEmail()].every(
                  Boolean
                );

                if (!ALL_CHECKS_PASS) return;
                setCurrentStep(SELECT_PLATFORMS);
              }}
            />
          </div>
        </form>
      </div>
    </div>
  );

  const SELECT_PLATFORMS_COMPONENT = (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl leading-[1.6] text-heading font-archivo font-bold max-w-[90%]">
          {"Choose the platforms where you'd like to collect reviews."}
        </h1>
        <p className="text-base leading-6 text-[#6E7787] w-[80%]">
          {
            "Don’t worry if you haven’t got the links now, you can add them later."
          }
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <form className="w-full lg:w-[500px]">
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
                    setState((prev) => ({
                      ...prev,
                      platforms: updatedPlatforms,
                    }));
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
                setCurrentStep(COLLECT_BUSINESS_INFO);
              }}
            />
            <Button
              isDisabled={isLoading}
              isLoading={isLoading}
              buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white"
              buttonText="Continue"
              onClick={() => {
                handleCreateBusiness();
              }}
            />
          </div>
        </form>
      </div>
    </div>
  );

  async function handleCreateBusiness() {
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
      const response = await postData("/api/business", {
        userId: user?._id,
        name,
        email,
        phoneNumber,
        platforms,
      });
      const { data } = response;
      if (data) {
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem("businessId", data._id);
          }
        } catch (error) {
          console.error("Error while setting token in localStorage:", error);
        }
        setBusiness(data);
        return router.push(
          `/application/${user?._id}/onboarding/email-not-verified`
        );
      }
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
    <main className="flex items-center bg-background">
      <div className="bg-white h-[100vh] w-full lg:w-[50%] overflow-auto">
        <div className="px-6 lg:px-12">
          <div className="py-12">
            <Image
              src="/logo.png"
              alt="Logo of Rategate"
              className="h-8"
              width={135}
              height={50}
              priority
            />
          </div>
          <div className="py-12 w-full flex flex-col gap-8">
            {/* onboarding steps */}
            <OnboardingMarker
              currentStep={ONBOARDING_STEPS.indexOf(currentStep) + 1}
              totalSteps={ONBOARDING_STEPS.length}
            />
            {currentStep === COLLECT_BUSINESS_INFO && BUSINESS_INFO_COMPONENT}
            {currentStep === SELECT_PLATFORMS && SELECT_PLATFORMS_COMPONENT}
          </div>
        </div>
      </div>
      <div className="hidden lg:block w-[50%] h-full">
        <div className="h-full flex flex-col items-center gap-8">
          {currentStep === COLLECT_BUSINESS_INFO && (
            <Image
              src="/onboarding-step-1.png"
              alt="Onboarding Step 1"
              className="h-[250px]"
              width={450}
              height={250}
              priority
            />
          )}
          {currentStep === SELECT_PLATFORMS && (
            <Image
              src="/onboarding-step-2.png"
              alt="Onboarding Step 2"
              className="h-[250px]"
              width={400}
              height={200}
              priority
            />
          )}
        </div>
      </div>
    </main>
  );
}
