"use client";
import ApiError from "@/app/components/api-error";
import ApiSuccess from "@/app/components/api-success";
import Button from "@/app/components/button";
import OnboardingMarker from "@/app/components/onboarding-marker";
import {
  BUSINESS_EMAIL_NOT_VERIFIED,
  ONBOARDING_STEPS,
} from "@/constants/onboarding-constants";
import { useBusinessContext } from "@/context/businessContext";
import { useUserContext } from "@/context/userContext";
import { postData } from "@/utils/fetch";
import Image from "next/image";
import React, { useState } from "react";

export default function page() {
  const { business } = useBusinessContext();
  const { user } = useUserContext();
  const [currentStep, _] = useState(BUSINESS_EMAIL_NOT_VERIFIED);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState({
    apiError: "",
  });

  async function handleResendVerifyEmail() {
    setLoading(true);
    try {
      const response = await postData(
        `/api/resend-business-verification-email`,
        {
          userId: user?._id,
          businessId: business?._id,
        }
      );
      const { message } = await response;
      setSuccessMessage(message);
      setLoading(false);
    } catch (err: any) {
      setError((error) => ({
        ...error,
        apiError: err.message,
      }));
      setLoading(false);
    }
  }
  return (
    <main className="flex items-center bg-background">
      <div className="bg-white h-[100vh] w-[50%] overflow-auto">
        <div className="px-12">
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
          <div className="py-4 w-full flex flex-col gap-8">
            {/* onboarding steps */}
            <OnboardingMarker
              currentStep={ONBOARDING_STEPS.indexOf(currentStep) + 1}
              totalSteps={ONBOARDING_STEPS.length}
            />
          </div>
          <div className="py-12 w-full flex flex-col items-center">
            <div className="flex flex-col w-[450px] gap-12">
              <div className="flex flex-col items-center gap-4">
                <h1 className="text-4xl leading-8 text-heading font-archivo font-bold">
                  Verify your business email
                </h1>
                <Image
                  src="/mail.png"
                  alt="mail png image"
                  className="h-20 my-4"
                  width={100}
                  height={80}
                  priority
                />
              </div>
              <p className="text-sm text-center leading-6 text-subHeading mx-auto max-w-[90%]">
                An email has been sent to{" "}
                <span className="text-heading font-bold">
                  {business?.email}
                </span>{" "}
                with a link to verify your account. If you do not see the email,
                please check your spam folder.
              </p>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-center leading-6 text-subHeading mx-auto max-w-[90%]">
                  Still not found? Hit "Resend".
                </p>
                <Button
                  isDisabled={loading}
                  isLoading={loading}
                  buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white w-full justify-center mx-auto"
                  buttonText="Resend Email"
                  onClick={() => handleResendVerifyEmail()}
                />
                {successMessage && (
                  <div className="flex justify-center">
                    <ApiSuccess
                      message={successMessage}
                      setMessage={(value) => setSuccessMessage(value)}
                    />
                  </div>
                )}
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
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[50%] h-full flex flex-col items-center gap-8">
        <Image
          src="/email-verification-illustration.png"
          alt="Email Verification Illustration"
          className="h-[350px]"
          width={500}
          height={200}
          priority
        />
      </div>
    </main>
  );
}
