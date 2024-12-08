"use client";
import { IBusiness } from "@/context/businessContext";
import { fetchData, postData } from "@/utils/fetch";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Button from "../button";
import ArrowDownSvg from "../svg/ArrowDown";
import { useRouter } from "next/navigation";
import {
  ADD_NEGATIVE_FEEDBACK,
  COLLECT_CONTACT_INFO,
  COLLECT_RATING,
  LANDING_PAGE,
  NEGATIVE_FEEDBACK_THANK_YOU,
  POSITIVE_FEEDBACK_THANK_YOU,
  SELECT_PLATFORM,
} from "@/constants/review_steps";
import Input from "../input";
import ApiSuccess from "../api-success";
import ApiError from "../api-error";
import { ILocation } from "@/app/api/location/interface";

export default function ReviewForm({
  businessId,
  locationId,
  employeeId,
}: {
  businessId: string;
  locationId?: string;
  employeeId?: string;
}) {
  const router = useRouter();
  const [business, setBusiness] = useState<IBusiness>();
  const [location, setLocation] = useState<ILocation>();
  const [isAllowedToReview, setIsAllowedToReview] = useState(true);
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(LANDING_PAGE);
  const [negativeFeedback, setNegativeFeedback] = useState("");
  const [postReviewLoading, setPostReviewLoading] = useState(false);
  const [contactFormLoading, setContactFormLoading] = useState(false);
  const [_, setReviewSuccessMessage] = useState("");
  const [contactSuccessMessage, setContactSuccessMessage] = useState("");
  const [contactFormDetails, setContactFormDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [error, setError] = useState({
    firstNameError: "",
    lastNameError: "",
    emailError: "",
    negativeFeedbackError: "",
    apiError: "",
  });
  const [noBusinessError, setNoBusinessError] = useState(false);

  // destructure the state here
  const { firstName, lastName, email } = contactFormDetails;

  useEffect(() => {
    async function getBusinessDetails() {
      try {
        const response = await fetchData(`/api/business/${businessId}`);
        const { data } = response;
        setBusiness(data.business);
        setIsAllowedToReview(data.is_allowed_to_review);
      } catch (err: any) {
        setNoBusinessError(true);
      } finally {
        setIsLoading(false);
      }
    }
    async function getLocationDetails() {
      try {
        const response = await fetchData(`/api/location/${locationId}`);
        const { data } = response;
        setLocation(data);
      } catch (err: any) {
        setNoBusinessError(true);
      } finally {
        setIsLoading(false);
      }
    }

    if (businessId) {
      getBusinessDetails();
    }

    if (locationId) {
      getLocationDetails();
    }
  }, [businessId]);

  function getBackButton(lastStep: string) {
    return (
      <button
        type="button"
        className="border-0 bg-transparent flex items-center gap-2 pt-4"
        onClick={() => {
          setCurrentStep(lastStep);
        }}
      >
        <div className="rotate-90">
          <ArrowDownSvg />
        </div>
        <p className="text-sm leading-2 text-subHeading">back</p>
      </button>
    );
  }

  function checkEmail() {
    if (!email) {
      setError((error) => ({
        ...error,
        emailError: "Email is required",
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

  function checkFirstName() {
    if (!firstName) {
      setError((error) => ({
        ...error,
        firstNameError: "First Name is required",
      }));
      return false;
    }
    setError((error) => ({
      ...error,
      firstNameError: "",
    }));
    return true;
  }

  function checkLastName() {
    if (!lastName) {
      setError((error) => ({
        ...error,
        lastNameError: "Last Name is required",
      }));
      return false;
    }
    setError((error) => ({
      ...error,
      lastNameError: "",
    }));
    return true;
  }

  async function handleContactFormSubmit() {
    const ALL_CHECKS_PASS = [
      checkEmail(),
      checkFirstName(),
      checkLastName(),
    ].every(Boolean);

    if (!ALL_CHECKS_PASS) return;
    setContactFormLoading(true);
    try {
      const response = await postData(`/api/contact`, {
        firstName,
        lastName,
        email,
        businessId,
      });
      setContactSuccessMessage("Thank you for your contact!");
      router.push("/");
    } catch (err: any) {
      setError((error) => ({
        ...error,
        apiError: err.message,
      }));
    } finally {
      setContactFormLoading(false);
    }
  }

  async function handlePostPositiveFeedback(url: string) {
    setPostReviewLoading(true);
    try {
      const response = await postData(`/api/review`, {
        rating,
        businessId,
        locationId,
        employeeId,
      });
      const { message } = response;
      setReviewSuccessMessage(message);
      setCurrentStep(POSITIVE_FEEDBACK_THANK_YOU);
      window.open(url, "_blank");
    } catch (err: any) {
      setError((error) => ({
        ...error,
        apiError: err.message,
      }));
    } finally {
      setPostReviewLoading(false);
    }
  }

  async function handlePostNegativeFeedback() {
    setPostReviewLoading(true);
    try {
      const response = await postData(`/api/review`, {
        rating,
        feedback: negativeFeedback,
        businessId,
        locationId,
        employeeId,
      });
      const { message } = response;
      setReviewSuccessMessage(message);
      setCurrentStep(NEGATIVE_FEEDBACK_THANK_YOU);
    } catch (err: any) {
      setError((error) => ({
        ...error,
        apiError: err.message,
      }));
    } finally {
      setPostReviewLoading(false);
    }
  }

  const LANDING_PAGE_COMPONENT = (
    <div className="py-6 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl leading-8 text-heading font-archivo font-bold">
          How are we doing?
        </h2>
        <p className="text-base leading-6 text-subHeading">
          Thank you for taking the time to tell us about your experience.
        </p>
      </div>
      <div className="flex flex-start">
        <Button
          buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white"
          buttonText="Start Your Review"
          onClick={() => {
            setCurrentStep(COLLECT_RATING);
          }}
        />
      </div>
    </div>
  );
  const CHOOSE_RATING = (
    <div>
      {getBackButton(LANDING_PAGE)}
      <div className="py-6 flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <p className="text-base leading-6 text-subHeading">
            Please rate your experience, your feedback is important to us.
          </p>
          <h2 className="text-2xl leading-8 text-heading font-archivo font-bold">
            How would you rate your experience with {business?.name}?
          </h2>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-heading">Choose</p>
          <div className="flex items-center gap-4">
            {Array.from({ length: 5 }, (_, index) => {
              return index < rating ? (
                <button key={index} onClick={() => setRating(index + 1)}>
                  <Image
                    src="/rate-filled.png"
                    alt="Filled rating image"
                    width={40}
                    height={10}
                    priority
                  />
                </button>
              ) : (
                <button key={index} onClick={() => setRating(index + 1)}>
                  <Image
                    src="/rate-empty.png"
                    alt="Empty rating image"
                    width={40}
                    height={10}
                    priority
                  />
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-start">
          <Button
            isDisabled={rating <= 0}
            buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white"
            buttonText="Continue"
            onClick={() => {
              if (rating >= 4) {
                setCurrentStep(SELECT_PLATFORM);
                return;
              }
              setCurrentStep(ADD_NEGATIVE_FEEDBACK);
            }}
          />
        </div>
      </div>
    </div>
  );
  const SHARE_ON_OTHER_PLATFORMS = (
    <div>
      {getBackButton(COLLECT_RATING)}
      <div className="py-6 flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl leading-8 text-heading font-archivo font-bold">
            Please select a platform to leave your review.
          </h2>
          <p className="text-base leading-6 text-subHeading">
            {
              "We'd appreciate you leaving your review on one of the following platforms."
            }
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-4">
          {business?.platforms
            .filter((platform) => platform.url !== "")
            .map((platform, index) => {
              return (
                <button
                  key={index}
                  type="button"
                  className="w-[150px] h-[150px] md:w-[250px] md:h-[200px] bg-white border border-stroke/20 rounded-[12px] shadow-card flex flex-col items-center justify-center gap-6"
                  onClick={() => handlePostPositiveFeedback(platform.url)}
                  disabled={postReviewLoading}
                >
                  <Image
                    src={`/${platform.id}.svg`}
                    alt={`Logo of ${platform.name}`}
                    width={50}
                    height={50}
                    priority
                  />
                  <p className="text-sm md:text-base leading-md text-heading">
                    {platform.name}
                  </p>
                </button>
              );
            })}
        </div>
        {postReviewLoading && (
          <p className="text-base leading-6 text-subHeading">
            posting your review...
          </p>
        )}
      </div>
    </div>
  );
  const COLLECT_NEGATIVE_FEEDBACK = (
    <div>
      {getBackButton(COLLECT_RATING)}
      <div className="py-6 flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl leading-8 text-heading font-archivo font-bold">
            Please let us know how we can improve.
          </h2>
          <p className="text-base leading-6 text-subHeading">
            Please share as much information as you can.
          </p>
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="negative-feedback"
            className="block text-sm text-heading mb-2 font-inter font-bold"
          >
            Response
          </label>
          <textarea
            id="negative-feedback"
            name="negative-feedback"
            className={`font-inter w-full px-4 py-3 mb-2 outline-none border placeholder:text-md placeholder:text-grey bg-white ${
              error.negativeFeedbackError !== ""
                ? "border-error"
                : "border-stroke/50"
            } rounded-md`}
            rows={4}
            cols={50}
            onChange={(event) => {
              setError({ ...error, negativeFeedbackError: "" });
              setNegativeFeedback(event.target.value);
            }}
            value={negativeFeedback}
          />
          {error.negativeFeedbackError !== "" ? (
            <p className="text-error text-sm font-medium">
              {error.negativeFeedbackError}
            </p>
          ) : null}
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
        <div className="flex flex-start items-center gap-4">
          <Button
            isDisabled={postReviewLoading}
            buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-[#F3F4F6] text-[#565E6C]"
            buttonText="Cancel"
            onClick={() => {
              setCurrentStep(COLLECT_RATING);
            }}
          />
          <Button
            isDisabled={postReviewLoading}
            isLoading={postReviewLoading}
            buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white"
            buttonText="Continue"
            onClick={() => {
              if (negativeFeedback === "") {
                setError({
                  ...error,
                  negativeFeedbackError: "Response is required",
                });
                return;
              }
              handlePostNegativeFeedback();
            }}
          />
        </div>
      </div>
    </div>
  );
  const POSITIVE_THANK_YOU = (
    <div>
      <div className="py-6 flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl leading-8 text-heading font-archivo font-bold">
            Thank you for your feedback.
          </h2>
          <p className="text-base leading-6 text-subHeading">
            We look forward to seeing you again.
          </p>
        </div>
        <div className="flex flex-start">
          <Button
            buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white"
            buttonText="End Review"
            onClick={() => {
              router.push("/");
            }}
          />
        </div>
      </div>
    </div>
  );
  const NEGATIVE_THANK_YOU = (
    <div>
      <div className="py-6 flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl leading-8 text-heading font-archivo font-bold">
            Thank you for your feedback.
          </h2>
          <p className="text-base leading-6 text-subHeading">
            {
              "Thank you for sharing your thoughts. We're always looking for ways to improve and make every experience memorable."
            }
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="text-lg leading-6 text-heading font-archivo font-bold">
            Would you like to leave your contact information in case we’d like
            to follow up?
          </h3>
        </div>
        <div className="flex flex-start items-center gap-4 flex-wrap">
          <Button
            buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-[#F3F4F6] text-[#565E6C]"
            buttonText="End Review"
            onClick={() => {
              router.push("/");
            }}
          />
          <Button
            buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white"
            buttonText="Add Contact Info"
            onClick={() => {
              setCurrentStep(COLLECT_CONTACT_INFO);
            }}
          />
        </div>
      </div>
    </div>
  );
  const CONTACT_INFO_FORM = (
    <div>
      <div className="py-6 flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl leading-8 text-heading font-archivo font-bold">
            Please leave your contact information.
          </h2>
          <p className="text-base leading-6 text-subHeading">
            We'll use your information only to contact you about this feedback.
          </p>
        </div>
        <div className="flex flex-col md:w-[350px]">
          <Input
            type="text"
            label="First Name"
            value={firstName}
            placeholder="Enter your first name"
            onChange={(event) =>
              setContactFormDetails((prev) => ({
                ...prev,
                firstName: event.target.value,
              }))
            }
            error={error.firstNameError}
            disabled={isLoading}
          />
          <Input
            type="text"
            label="Last Name"
            value={lastName}
            placeholder="Enter your last name"
            onChange={(event) =>
              setContactFormDetails((prev) => ({
                ...prev,
                lastName: event.target.value,
              }))
            }
            error={error.lastNameError}
            disabled={isLoading}
          />
          <Input
            type="email"
            value={email}
            label="Email"
            placeholder="Enter your email address"
            onChange={(event) =>
              setContactFormDetails((prev) => ({
                ...prev,
                email: event.target.value,
              }))
            }
            error={error.emailError}
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
          {contactSuccessMessage && (
            <div className="flex justify-center">
              <ApiSuccess
                message={contactSuccessMessage}
                setMessage={(value) => setContactSuccessMessage(value)}
              />
            </div>
          )}
        </div>
        <div className="flex flex-start items-center gap-4">
          <Button
            isDisabled={contactFormLoading}
            buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-[#F3F4F6] text-[#565E6C]"
            buttonText="Form Reset"
            onClick={() => {
              setContactFormDetails({
                firstName: "",
                lastName: "",
                email: "",
              });
            }}
          />
          <Button
            isDisabled={contactFormLoading}
            isLoading={contactFormLoading}
            buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white"
            buttonText="Submit"
            onClick={() => {
              handleContactFormSubmit();
            }}
          />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-[100vw] h-[100vh] bg-background flex items-center justify-center">
        Fetching business details...
      </div>
    );
  }

  if (noBusinessError) {
    return (
      <main className="p-6 md:p-12 bg-background h-[100vh] overflow-auto">
        <div className="py-4">
          <Image
            src="/logo.png"
            alt="Logo of Rategate"
            className="h-8"
            width={135}
            height={50}
            priority
          />
        </div>
        <div className="py-6 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl leading-8 text-heading font-archivo font-bold">
              No business registered
            </h2>
            <p className="text-base leading-6 text-subHeading">
              With the given url, there is no business registered in our
              database. Follow this link to create an account at Rategate.
            </p>
          </div>
          <div className="flex flex-start">
            <Button
              buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white"
              buttonText="Register Now"
              onClick={() => {
                router.push("/");
              }}
            />
          </div>
        </div>
      </main>
    );
  }

  if (!isAllowedToReview) {
    return (
      <main className="p-6 md:p-12 bg-background h-[100vh] overflow-auto">
        <div className="py-4">
          <Image
            src="/logo.png"
            alt="Logo of Rategate"
            className="h-8"
            width={135}
            height={50}
            priority
          />
        </div>
        <div className="py-6 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl leading-8 text-heading font-archivo font-bold">
              Maxed out free reviews!
            </h2>
            <p className="text-base leading-6 text-subHeading">
              Your business has maxed out the free reviews on basic plan. Please
              subscribe to a plan to get more reviews.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 md:p-12 bg-background h-[100vh] overflow-auto">
      <div className="py-4">
        <Image
          src="/logo.png"
          alt="Logo of Rategate"
          className="h-8"
          width={135}
          height={50}
          priority
        />
      </div>
      <h1 className="text-3xl leading-[1.6] text-heading font-archivo font-bold max-w-[90%]">
        {business?.name}
      </h1>
      {location?._id && (
        <p className="text-base leading-[24px] font-medium text-subHeading">
          {"Review Location ->"} {location?.name}
        </p>
      )}
      {currentStep === LANDING_PAGE && LANDING_PAGE_COMPONENT}
      {currentStep === COLLECT_RATING && CHOOSE_RATING}
      {currentStep === SELECT_PLATFORM && SHARE_ON_OTHER_PLATFORMS}
      {currentStep === ADD_NEGATIVE_FEEDBACK && COLLECT_NEGATIVE_FEEDBACK}
      {currentStep === POSITIVE_FEEDBACK_THANK_YOU && POSITIVE_THANK_YOU}
      {currentStep === NEGATIVE_FEEDBACK_THANK_YOU && NEGATIVE_THANK_YOU}
      {currentStep === COLLECT_CONTACT_INFO && CONTACT_INFO_FORM}
    </main>
  );
}