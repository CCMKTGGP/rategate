"use client";
import ApiError from "@/app/components/api-error";
import Button from "@/app/components/button";
import Dropdown from "@/app/components/dropdown";
import Input from "@/app/components/input";
import OnboardingMarker from "@/app/components/onboarding-marker";
import {
  ALL_SET,
  COLLECT_SURVEY,
  ONBOARDING_STEPS,
} from "@/constants/onboarding-constants";
import { useBusinessContext } from "@/context/businessContext";
import { useUserContext } from "@/context/userContext";
import { postData } from "@/utils/fetch";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function CollectSurvey() {
  const { user } = useUserContext();
  const { business } = useBusinessContext();
  const router = useRouter();

  const HEAR_FROM_OPTIONS = ["Email", "Social Media", "Word of Mouth", "Other"];
  const CURRENT_FEEDBACK_COLLECTION_OPTIONS = [
    "Email surveys",
    "In-person feedback",
    "Social Media",
    "None of the above",
  ];
  const FEEDBACK_FREQUENCY_OPTIONS = [
    "After every transaction",
    "Monthly",
    "Quarterly",
    "Annually",
    "None of the above",
  ];
  // STATES
  const [currentStep, setCurrentStep] = useState(COLLECT_SURVEY);
  const [isLoading, setIsLoading] = useState(false);
  const [hearFrom, setHearFrom] = useState(HEAR_FROM_OPTIONS[0]);
  const [currentFeedbackCollection, setCurrentFeedalCollection] = useState(
    CURRENT_FEEDBACK_COLLECTION_OPTIONS[0]
  );
  const [feedbackFrequency, setFeedbackFrequency] = useState(
    FEEDBACK_FREQUENCY_OPTIONS[0]
  );
  const [error, setError] = useState({
    hearFromError: "",
    currentFeedbackCollectionError: "",
    feedbackFrequencyError: "",
    apiError: "",
  });

  async function handleSubmitSurvey() {
    setIsLoading(true);
    try {
      const response = await postData("/api/survey", {
        userId: user?._id,
        businessId: business?._id,
        hearFrom,
        currentFeedbackCollection,
        feedbackFrequency,
      });
      const { data } = response;
      if (data) {
        setCurrentStep(ALL_SET);
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

  const COLLECT_SURVEY_COMPONENT = (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl leading-[1.6] text-heading font-archivo font-bold max-w-[90%]">
          Just some survey information that would help us to serve better
        </h1>
        <div className="flex flex-col gap-4">
          <form className="w-[500px]">
            <Dropdown
              id="selectedHearFrom"
              label="How did you hear about Rategate?"
              isDisabled={isLoading}
              onClick={(value) => setHearFrom(value?.id)}
              options={HEAR_FROM_OPTIONS.map((option) => ({
                id: option,
                name: option,
              }))}
              selectedOption={{
                id: hearFrom,
                name: hearFrom,
              }}
              error={error.hearFromError}
            />
            <Dropdown
              id="selectedFeedbackFrom"
              label="How do you currently collect customer feedback? "
              isDisabled={isLoading}
              onClick={(value) => setCurrentFeedalCollection(value?.id)}
              options={CURRENT_FEEDBACK_COLLECTION_OPTIONS.map((option) => ({
                id: option,
                name: option,
              }))}
              selectedOption={{
                id: currentFeedbackCollection,
                name: currentFeedbackCollection,
              }}
              error={error.currentFeedbackCollectionError}
            />
            <Dropdown
              id="selectedFeedbackFrequency"
              label="How often do you collect feedback? "
              isDisabled={isLoading}
              onClick={(value) => setFeedbackFrequency(value?.id)}
              options={FEEDBACK_FREQUENCY_OPTIONS.map((option) => ({
                id: option,
                name: option,
              }))}
              selectedOption={{
                id: feedbackFrequency,
                name: feedbackFrequency,
              }}
              error={error.feedbackFrequencyError}
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
            <div className="flex justify-end my-6">
              <Button
                isDisabled={isLoading}
                isLoading={isLoading}
                buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white"
                buttonText="Continue"
                onClick={() => {
                  const ALL_CHECKS_PASS = [
                    hearFrom !== "",
                    currentFeedbackCollection !== "",
                    feedbackFrequency !== "",
                  ].every(Boolean);

                  if (!ALL_CHECKS_PASS) return;
                  handleSubmitSurvey();
                }}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const ALL_SET_COMPONENT = (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl leading-[1.6] text-heading font-archivo font-bold max-w-[90%]">
          You're all set!
        </h1>
        <p className="text-base leading-6 text-subHeading w-[80%]">
          {
            "We’ve got your Shareable Link and QR Code ready for you. You can edit/add your review platforms, locations, and team members from your dashboard."
          }
        </p>
      </div>
      <div className="flex justify-start">
        <Button
          buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white"
          buttonText="Go To Dashboard"
          onClick={() =>
            router.push(`/application/${user?._id}/${business?._id}/dashboard`)
          }
        />
      </div>
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
