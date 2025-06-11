"use client";
import Button from "@/app/components/button";
import Input from "@/app/components/input";
import { postData } from "@/utils/fetch";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function SetPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const id = searchParams.get("id");

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token || !id) {
      setMessage("Invalid or missing token.");
    }
  }, [token, id]);

  async function handleUpdatePassword() {
    if (!password || !confirmPassword) {
      return setMessage("Please enter and confirm your password.");
    }

    if (password !== confirmPassword) {
      return setMessage("Passwords do not match.");
    }

    setLoading(true);
    try {
      const response = await postData("/api/reset-password", {
        token,
        id,
        newPassword: password,
      });
      const { message } = response;
      setSuccess(true);
      setMessage(message);
      setTimeout(() => router.push("/login"), 3000);
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
              Reset Your Password
            </h1>
            <p className="text-sm lg:text-base leading-6 text-heading w-[80%] text-center">
              Please set a new password to secure your account.
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
                  type="password"
                  id="password"
                  required
                  label="New Password"
                  value={password}
                  autoComplete="off"
                  placeholder="Enter your new password"
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <div className="mb-4">
                <Input
                  type="password"
                  id="configmPassword"
                  required
                  label="Confirm Password"
                  value={confirmPassword}
                  autoComplete="off"
                  placeholder="Confirm your new password"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>
              <Button
                buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white w-full justify-center mx-auto my-6"
                buttonText="Reset Password"
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
