"use client";
import Image from "next/image";
import React from "react";
import Input from "../components/input";
import Button from "../components/button";
import { postData } from "@/utils/fetch";
import ApiSuccess from "../components/api-success";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = React.useState<string>("");
  const [successMessage, setSuccessMessage] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);

  async function handleSendForgotPasswordEmail() {
    if (!email) {
      return setError("Please enter your email address.");
    }
    setLoading(true);
    try {
      const response = await postData("/api/forgot-password", {
        email,
      });
      const { message } = response;
      setSuccessMessage(message);
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
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
              width={135}
              height={50}
              priority
            />
          </div>
          <div className="py-12 w-full flex flex-col gap-8">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-2xl lg:text-3xl leading-[1.6] text-heading font-archivo font-bold max-w-[90%]">
                Reset Your Password
              </h1>
              <p className="text-sm lg:text-base leading-6 text-heading w-[80%] text-center">
                Please set a new password to secure your account.
              </p>
            </div>

            <form className="w-full max-w-md mx-auto">
              <div className="mb-4">
                <Input
                  type="email"
                  id="email"
                  required
                  label="Email"
                  value={email}
                  autoComplete="off"
                  placeholder="Enter your email address"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  error={error}
                  disabled={loading}
                />
              </div>
              <Button
                buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white w-full justify-center mx-auto my-6"
                buttonText="Send Email"
                onClick={handleSendForgotPasswordEmail}
                isDisabled={loading}
                isLoading={loading}
              />
              <p className="text-center text-subHeading">
                Back to{" "}
                <span className="text-accent">
                  <Link
                    href={"/login"}
                    className="font-bold text-primary hover:text-primaryHover underline px-1"
                  >
                    Login
                  </Link>
                </span>
              </p>
              {successMessage && (
                <div className="flex justify-center">
                  <ApiSuccess
                    message={successMessage}
                    setMessage={(value) => setSuccessMessage(value)}
                  />
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
      <div className="hidden lg:block w-[50%] h-full">
        <div className="h-full flex flex-col items-center gap-8">
          <Image
            src="/forgot-password.png"
            alt="Forgot Password"
            className="h-[350px]"
            width={350}
            height={350}
            priority
          />
        </div>
      </div>
    </main>
  );
}
