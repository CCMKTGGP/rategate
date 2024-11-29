"use client";
import React, { useState } from "react";
import Button from "../components/button";
import { useUserContext } from "@/context/userContext";
import ApiSuccess from "../components/api-success";
import ApiError from "../components/api-error";
import { postData } from "@/utils/fetch";

export default function EmailNotVerified() {
  const { user } = useUserContext();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState({
    apiError: "",
  });

  async function handleResendVerifyEmail() {
    setLoading(true);
    try {
      const response = await postData(`/api/resend-verification-email`, {
        userId: user?._id,
      });
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
      <div className="bg-white h-[100vh] w-[50%]">
        <div className="py-8 px-6">
          <img src="./logo.png" alt="Rategate Logo" className="h-8" />
        </div>
        <div className="py-12 w-full flex flex-col items-center">
          <div className="flex flex-col w-[400px] gap-12">
            <div className="flex flex-col items-center gap-4">
              <h1 className="text-4xl leading-8 text-heading font-archivo font-bold">
                Verify your email
              </h1>
              <img
                src="./mail.png"
                alt="mail png image"
                className="h-20 my-4"
              />
            </div>
            <p className="text-sm text-center leading-6 text-subHeading mx-auto max-w-[90%]">
              An email has been sent to{" "}
              <span className="text-heading font-bold">{user?.email}</span> with
              a link to verify your account. If you do not see the email, please
              check your spam folder.
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
      <div className="w-[50%] h-full flex flex-col items-center gap-8">
        <img
          src="./email-verification-illustration.png"
          alt="Email Verification Illustration"
          className="h-[400px]"
        />
      </div>
    </main>
  );
}
