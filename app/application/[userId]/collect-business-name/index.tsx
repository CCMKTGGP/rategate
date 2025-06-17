"use client";
import Button from "@/app/components/button";
import Input from "@/app/components/input";
import { useBusinessContext } from "@/context/businessContext";
import { useUserContext } from "@/context/userContext";
import { postData } from "@/utils/fetch";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function CollectBusinessInfo() {
  const searchParams = useSearchParams();
  const { user } = useUserContext();
  const { setBusiness } = useBusinessContext();
  const router = useRouter();

  const email = searchParams.get("email");

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState({
    nameError: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      setMessage("Email is required to collect business information.");
      return;
    }
  }, [email]);

  async function handleUpdatePassword() {
    if (!name) {
      return setError((prev) => ({
        ...prev,
        nameError: "Business name is required.",
      }));
    }

    setLoading(true);
    try {
      const response = await postData("/api/business", {
        userId: user._id,
        name,
        email,
        phoneNumber,
      });
      const { message, data } = response;
      if (typeof window !== "undefined") {
        localStorage.setItem("businessId", data._id);
      }
      setSuccess(true);
      setMessage(message);
      setTimeout(() => {
        router.push(`/application/${user._id}/onboarding`);
        setBusiness(data);
      }, 3000);
    } catch (err: any) {
      setMessage(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-white h-[100vh] w-full overflow-auto">
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
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl lg:text-3xl leading-[1.6] text-heading font-archivo font-bold max-w-[90%]">
              Enter your business information
            </h1>
            <p className="text-sm lg:text-base leading-6 text-heading w-[80%] text-center">
              Please provide the following details to help us set up your
              account.
            </p>
          </div>
          {message && (
            <p
              className={`text-sm text-center ${
                success ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          {!success && (
            <form className="w-full max-w-md mx-auto">
              <div className="mb-4">
                <Input
                  type="text"
                  id="businessName"
                  required
                  label="Business Name"
                  value={name}
                  error={error.nameError}
                  autoComplete="off"
                  placeholder="Enter your business name"
                  onChange={(event) => {
                    setError((prev) => ({
                      ...prev,
                      nameError: "",
                    }));
                    setName(event.target.value);
                  }}
                  disabled={loading}
                />
              </div>
              <div className="mb-4">
                <Input
                  type="email"
                  id="businessEmail"
                  required
                  label="Business Email"
                  value={email || ""}
                  autoComplete="off"
                  disabled
                />
              </div>
              <div className="mb-4">
                <Input
                  type="number"
                  label="Business Telephone"
                  helpertext="Optional"
                  maxLength={10}
                  placeholder="Enter your business phone number"
                  value={phoneNumber}
                  onChange={(event) => {
                    if (event.target.value.length <= 10) {
                      setPhoneNumber(event.target.value);
                    }
                    return;
                  }}
                  disabled={loading}
                />
              </div>
              <Button
                buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white w-full justify-center mx-auto my-6"
                buttonText="Confirm Business Info"
                onClick={handleUpdatePassword}
                isDisabled={loading}
                isLoading={loading}
              />
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
