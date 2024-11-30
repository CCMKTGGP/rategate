"use client";
import Button from "@/app/components/button";
import OnboardingMarker from "@/app/components/onboarding-marker";
import {
  ALL_SET,
  COLLECT_SURVEY,
  ONBOARDING_STEPS,
} from "@/constants/onboarding-constants";
import { useBusinessContext } from "@/context/businessContext";
import { useUserContext } from "@/context/userContext";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function CollectSurvey() {
  const { user } = useUserContext();
  const { business } = useBusinessContext();
  const router = useRouter();

  // STATES
  const [currentStep, setCurrentStep] = useState(COLLECT_SURVEY);

  const COLLECT_SURVEY_COMPONENT = (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl leading-8 text-heading font-archivo font-bold">
          Just some survey information that would help us to serve better
        </h1>
      </div>
    </div>
  );

  const ALL_SET_COMPONENT = (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl leading-8 text-heading font-archivo font-bold">
          You're all set!
        </h1>
        <p className="text-base leading-6 text-subHeading w-[80%]">
          {
            "We’ve got your Shareable Link and QR Code ready for you. You can edit/add your review platforms, locations, and team members from your dashboard."
          }
        </p>
      </div>
      <Button
        buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white w-full justify-center mx-auto my-6"
        buttonText="Log In"
        onClick={() =>
          router.push(`/application/${user?._id}/${business?._id}/dashboard`)
        }
      />
    </div>
  );
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
            {currentStep === COLLECT_SURVEY && COLLECT_SURVEY_COMPONENT}
            {currentStep === ALL_SET && ALL_SET_COMPONENT}
          </div>
        </div>
      </div>
      <div className="w-[50%] h-full flex flex-col items-center gap-8">
        {currentStep === COLLECT_SURVEY && (
          <img
            src="../../onboarding-step-3.png"
            alt="Onboarding Step 3"
            className="h-[250px]"
          />
        )}
        {currentStep === ALL_SET && (
          <img
            src="../../onboarding-step-4.png"
            alt="Onboarding Step 4"
            className="h-[250px]"
          />
        )}
      </div>
    </main>
  );
}
