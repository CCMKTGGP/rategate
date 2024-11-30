"use client";
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
    platforms: Array<{
      id: string;
      name: string;
      url: string;
    }>;
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

  // const [platformURLError, setPlatformURLError] = useState("");

  // function isValidURL(url: string) {
  //   const urlRegex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/[^\s]*)?$/i;
  //   return urlRegex.test(url);
  // }

  // function checkURL(url: string) {
  //   if (!isValidURL(url)) {
  //     setPlatformURLError("Invalid URL");
  //     return false;
  //   }
  //   setPlatformURLError("");
  //   return true;
  // }

  const BUSINESS_INFO_COMPONENT = (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl leading-8 text-heading font-archivo font-bold">
          Tell us more about your business
        </h1>
        <p className="text-base leading-6 text-subHeading w-[80%]">
          one liner here
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <form className="w-[400px]">
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
        <h1 className="text-4xl leading-10 text-heading font-archivo font-bold max-w-[90%]">
          {"Choose the platforms where you'd like to collect reviews."}
        </h1>
        <p className="text-base leading-6 text-subHeading w-[80%]">
          {
            "Don’t worry if you haven’t got the links now, you can add them later."
          }
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
                  label={label}
                  id={id}
                  name={name}
                  checked={checked}
                  helpertext={helperText}
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
          <div className="flex justify-between my-6">
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
        return router.push(`/application/${data?._id}/collect-survey`);
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
      <div className="bg-white h-[100vh] w-[50%] overflow-auto">
        <div className="px-12">
          <div className="py-12">
            <img src="../../logo.png" alt="Rategate Logo" className="h-8" />
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
      <div className="w-[50%] h-full flex flex-col items-center gap-8">
        {currentStep === COLLECT_BUSINESS_INFO && (
          <img
            src="../../onboarding-step-1.png"
            alt="Onboarding Step 1"
            className="h-[250px]"
          />
        )}
        {currentStep === SELECT_PLATFORMS && (
          <img
            src="../../onboarding-step-2.png"
            alt="Onboarding Step 2"
            className="h-[250px]"
          />
        )}
      </div>
    </main>
  );
}