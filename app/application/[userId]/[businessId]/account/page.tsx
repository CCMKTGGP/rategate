"use client";
import ApiError from "@/app/components/api-error";
import ApiSuccess from "@/app/components/api-success";
import Button from "@/app/components/button";
import Input from "@/app/components/input";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/topbar";
import { useBusinessContext } from "@/context/businessContext";
import { putData } from "@/utils/fetch";
import Image from "next/image";
import React, { useState } from "react";

export default function Account() {
  const { business, setBusiness } = useBusinessContext();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadFileLoading, setUploadFileLoading] = useState(false);
  const [name, setName] = useState(business.name);
  const [email, setEmail] = useState(business.email);
  const [phoneNumber, setPhoneNumber] = useState(business.phone_number);
  const [reviewRedirectUrl, setReviewRedirectUrl] = useState(
    business.review_redirect || ""
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [file, setFile] = useState<any>();
  const [fileName, setFileName] = useState("No file chosen");
  const [error, setError] = useState({
    nameError: "",
    emailError: "",
    phoneNumberError: "",
    reviewRedirectUrlError: "",
    fileNameError: "",
    apiError: "",
  });

  function isValidURL(url: string) {
    const urlRegex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/[^\s]*)?$/i;
    return urlRegex.test(url);
  }

  function checkName() {
    if (!name) {
      setError((error) => ({
        ...error,
        nameError: "Location Name is required",
      }));
      return false;
    }
    setError((error) => ({
      ...error,
      nameError: "",
    }));
    return true;
  }

  function checkReviewRedirectUrl() {
    if (reviewRedirectUrl) {
      if (!isValidURL(reviewRedirectUrl)) {
        setError((error) => ({
          ...error,
          reviewRedirectUrlError: "Invalid URL format",
        }));
        return false;
      }
      setError((error) => ({
        ...error,
        reviewRedirectUrlError: "",
      }));
      return true;
    }
    return true;
  }

  function handleFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      setFile(file);
    } else {
      setFileName("No file chosen");
    }
  }

  async function handleUpdateBusiness() {
    const ALL_CHECKS_PASS = [checkName(), checkReviewRedirectUrl()].every(
      Boolean
    );
    if (!ALL_CHECKS_PASS) return;
    setIsLoading(true);
    try {
      const response = await putData(`/api/business/${business._id}`, {
        data: {
          name,
          phone_number: phoneNumber,
          review_redirect: reviewRedirectUrl,
        },
      });
      const { message, data } = response;
      setBusiness(data);
      setSuccessMessage(message);
    } catch (error) {
      setError((error: any) => ({
        ...error,
        apiError: error.message,
      }));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUploadFile() {
    setUploadFileLoading(true);
    if (!fileName) {
      setError((error: any) => ({
        ...error,
        fileNameError: "Please select a file.",
      }));
      return;
    }

    const formData = new FormData();
    formData.append("logo", file);
    formData.append("businessId", business._id);
    formData.append("fileName", fileName);

    try {
      const response = await fetch("/api/upload-logo", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      const { data, message } = result;
      setBusiness(data);
      setSuccessMessage(message);
    } catch (error) {
      setError((error: any) => ({
        ...error,
        fileNameError: error.message,
      }));
    } finally {
      setUploadFileLoading(false);
    }
  }

  return (
    <div className="flex items-start bg-white">
      <Sidebar />
      <div className="flex-1 h-screen overflow-auto">
        <TopBar />
        <div className="px-8 py-4">
          <div className="flex flex-col pb-12">
            <h3 className="font-archivo text-2xl leading-[48px] text-heading font-semibold">
              Account Details
            </h3>
            <p className="text-base leading-[24px] font-medium text-subHeading ">
              Manage your account details.
            </p>
            {successMessage && (
              <ApiSuccess
                message={successMessage}
                setMessage={(value) => setSuccessMessage(value)}
              />
            )}
            <div className="flex items-start gap-4">
              <div className="bg-white rounded-[12px] w-[550px] px-6 py-8 shadow-card border border-stroke/30 mt-8">
                <div className="flex flex-col gap-4">
                  <Input
                    type="text"
                    label="Business Name"
                    value={name}
                    placeholder="Enter name of the location"
                    onChange={(event) => setName(event.target.value)}
                    error={error.nameError}
                    disabled={isLoading}
                  />
                  <Input
                    type="email"
                    value={email}
                    label="Business Email"
                    placeholder="Enter your business email address"
                    onChange={(event) => setEmail(event.target.value)}
                    error={error.emailError}
                    disabled
                  />
                  <Input
                    type="number"
                    label="Business Telephone"
                    maxLength={10}
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(event) => {
                      if (event.target.value.length <= 10) {
                        setPhoneNumber(event.target.value);
                      }
                      return;
                    }}
                    error={error.phoneNumberError}
                    disabled={isLoading}
                  />
                  <Input
                    type="text"
                    label="Review Redirect URL"
                    value={reviewRedirectUrl}
                    placeholder="Enter your review redirect URL"
                    onChange={(event) =>
                      setReviewRedirectUrl(event.target.value)
                    }
                    onBlur={checkReviewRedirectUrl}
                    error={error.reviewRedirectUrlError}
                    disabled={isLoading}
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
                  <div className="flex flex-start items-center gap-6 mt-4">
                    <Button
                      isDisabled={isLoading || uploadFileLoading}
                      buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-[#F3F4F6] text-[#565E6C]"
                      buttonText="Reset"
                      onClick={() => {
                        setName(business.name);
                        setEmail(business.email);
                        setPhoneNumber(business.phone_number);
                        setReviewRedirectUrl(business.review_redirect);
                      }}
                    />
                    <Button
                      isDisabled={isLoading || uploadFileLoading}
                      isLoading={isLoading}
                      buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white"
                      buttonText="Update"
                      onClick={() => {
                        const ALL_CHECKS_PASS = [checkName()].every(Boolean);
                        if (!ALL_CHECKS_PASS) return;
                        handleUpdateBusiness();
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-[12px] w-[550px] px-6 py-8 shadow-card border border-stroke/30 mt-8">
                <div className="flex flex-col gap-4">
                  {business.logo_url && (
                    <div className="my-2">
                      <p className="block text-sm text-heading mb-2 font-inter font-bold">
                        Business Logo
                      </p>
                      <Image
                        src={business.logo_url}
                        alt={`Logo of ${business.name}`}
                        width={50}
                        height={50}
                        priority
                      />
                    </div>
                  )}
                  <div className="my-2">
                    <p className="block text-sm text-heading mb-4 font-inter font-bold">
                      Upload Logo
                    </p>
                    <input
                      type="file"
                      id="file-input"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-input"
                      className="bg-primary text-white px-6 py-3 rounded-[8px] cursor-pointer mt-4 shadow-button hover:shadow-buttonHover font-mediun"
                    >
                      Choose File
                    </label>
                    <span
                      style={{
                        fontSize: "1rem",
                        color: "#333",
                        marginLeft: "12px",
                      }}
                      className="text-heading text-lg leading-10 font-medium"
                    >
                      {fileName}
                    </span>
                    <hr className="my-8" />
                    {error.fileNameError && (
                      <ApiError
                        message={error.fileNameError}
                        setMessage={(value) =>
                          setError((error) => ({
                            ...error,
                            fileNameError: value,
                          }))
                        }
                      />
                    )}
                    <div className="flex flex-start items-center gap-6 mt-4">
                      <Button
                        isDisabled={isLoading || uploadFileLoading}
                        buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-[#F3F4F6] text-[#565E6C]"
                        buttonText="Reset"
                        onClick={() => {
                          setFileName("No file chosen");
                          setFile(null);
                        }}
                      />
                      <Button
                        isDisabled={isLoading || uploadFileLoading || !file}
                        isLoading={uploadFileLoading}
                        buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white"
                        buttonText="Upload"
                        onClick={() => {
                          handleUploadFile();
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
