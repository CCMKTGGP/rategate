"use client";
import ApiError from "@/app/components/api-error";
import ApiSuccess from "@/app/components/api-success";
import Button from "@/app/components/button";
import DeleteModal from "@/app/components/delete-modal";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/topbar";
import { useBusinessContext } from "@/context/businessContext";
import { useUserContext } from "@/context/userContext";
import { fetchData, postData } from "@/utils/fetch";
import { PlanTypes } from "@/utils/planTypes";
import Image from "next/image";
import React, { useEffect, useState } from "react";

interface IPlan {
  _id: string;
  plan_id: string;
  name: string;
  description: string;
  max_reviews: number;
  max_locations: number;
  price: 0;
  features: Array<string>;
}

export default function Billing() {
  const { user, setToggleFetchUserDetails, toggleFetchUserDetails } =
    useUserContext();
  const {
    business,
    setToggleFetchBusinessDetails,
    toggleFetchBusinessDetails,
  } = useBusinessContext();
  const [fetchPlansLoading, setFetchPlansLoading] = useState(false);
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [error, setError] = useState({
    apiError: "",
  });
  const [checkoutLoading, setCheckoutLoading] = useState<{
    planId: string;
    isLoading: boolean;
  }>({
    planId: "",
    isLoading: false,
  });
  const [cancelSubscriptionLoading, setCancelSubscriptionLoading] =
    useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteModal, setDeleteModal] = useState<{
    toggle: boolean;
    data: IPlan | null;
  }>({
    toggle: false,
    data: null,
  });

  useEffect(() => {
    async function fetchAllPlans() {
      setFetchPlansLoading(true);
      try {
        const response = await fetchData("/api/plans");
        const { data } = response;
        setPlans(data);
      } catch (err: any) {
        setError((prev) => ({
          ...prev,
          apiError: err.message,
        }));
      } finally {
        setFetchPlansLoading(false);
      }
    }

    fetchAllPlans();
  }, []);

  async function handleCheckout(planId: string) {
    setCheckoutLoading({ planId, isLoading: true });

    try {
      const response = await postData(`/api/checkout`, {
        planId,
        userId: user._id,
        businessId: business._id,
      });
      const { sessionUrl } = response?.data;
      if (sessionUrl === "") {
        window.location.reload();
      }
      window.location.href = sessionUrl;
    } catch (error: any) {
      setError((err: any) => ({
        ...err,
        apiError: error?.message,
      }));
    } finally {
      setCheckoutLoading({ planId: "", isLoading: false });
    }
  }

  async function handleDeleteSubscription(planId: string | any) {
    setCancelSubscriptionLoading(true);
    try {
      const response = await postData("/api/cancel-subscription", {
        planId,
        userId: user._id,
        businessId: business._id,
      });
      const { message } = response;
      setSuccessMessage(message);
      setDeleteModal({
        toggle: false,
        data: null,
      });
      setToggleFetchUserDetails(!toggleFetchUserDetails);
      setToggleFetchBusinessDetails(!toggleFetchBusinessDetails);
    } catch (err: any) {
      setDeleteModal({
        toggle: false,
        data: null,
      });
      setError((error) => ({
        ...error,
        apiError: err.message,
      }));
    } finally {
      setCancelSubscriptionLoading(false);
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
              Plans
            </h3>
            <p className="text-base leading-[24px] font-medium text-subHeading ">
              Start with the Free plan and build your way up to Professional or
              Enterprise.
            </p>
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
            {successMessage && (
              <ApiSuccess
                message={successMessage}
                setMessage={(value) => setSuccessMessage(value)}
              />
            )}
            <div className="my-8 flex items-start gap-8">
              {fetchPlansLoading ? (
                <p className="text-base leading-[24px] font-medium text-subHeading pt-6">
                  Fetching plans...
                </p>
              ) : plans.length > 0 ? (
                plans.map((plan: IPlan) => {
                  const isPlanRecomended =
                    plan.plan_id.toLowerCase() ===
                    PlanTypes.PROFESSIONAL.toLowerCase();
                  const isCurrentPlan = business?.plan_id._id === plan._id;
                  return (
                    <div
                      className={`font-archivo shadow-card w-[350px] p-6 flex flex-col border rounded-[40px] ${
                        isPlanRecomended
                          ? "bg-primary text-white"
                          : "bg-white text-heading"
                      } ${
                        isCurrentPlan && isPlanRecomended
                          ? "border-white"
                          : isCurrentPlan
                          ? "border-primary"
                          : "border-stroke/30"
                      }`}
                      key={plan._id}
                    >
                      <div className="py-2 flex items-center">
                        {isPlanRecomended ? (
                          <Image
                            src={`/non_recomended_plan.svg`}
                            alt="non recomended plan svg"
                            width={40}
                            height={40}
                            priority
                          />
                        ) : (
                          <Image
                            src={`/recomended_plan.svg`}
                            alt="recomended plan svg"
                            width={40}
                            height={40}
                            priority
                          />
                        )}
                        {isCurrentPlan && (
                          <div className="ml-auto">
                            <div
                              className={`inline-block text-xs px-3 py-1 rounded-[8px] font-bold ${
                                isPlanRecomended
                                  ? "bg-white text-primary "
                                  : "bg-primary text-white "
                              }`}
                            >
                              Current Plan
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="py-2">
                        <h3 className="text-xl leading-8 font-semibold">
                          {plan.name}
                        </h3>
                        <p className="text-sm leading-4 my-2">
                          {plan.description}
                        </p>
                      </div>
                      <div className="py-4">
                        <p className="text-sm leading-4">
                          <span className="text-5xl">${plan.price}</span> / per
                          month
                        </p>
                      </div>
                      <hr
                        className={`my-6 ${
                          isPlanRecomended ? "bg-stroke/30" : "bg-stroke/30"
                        }`}
                      />
                      <div className="py-4">
                        <p className="text-base leading-8 font-inter">
                          Features
                        </p>
                        {plan.features.map((feature, index) => {
                          return (
                            <div
                              className="my-4 flex items-center gap-2"
                              key={`id-${index + 1}`}
                            >
                              {isPlanRecomended ? (
                                <Image
                                  src="/recomended_tick.svg"
                                  alt="recomended checkmark svg"
                                  width={20}
                                  height={20}
                                  priority
                                />
                              ) : (
                                <Image
                                  src="/non_recomended_tick.svg"
                                  alt="non recomended checkmark svg"
                                  width={20}
                                  height={20}
                                  priority
                                />
                              )}
                              <span className="text-base leading-6 font-inter">
                                {feature}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      {plan.plan_id.toLowerCase() !==
                        PlanTypes.BASIC.toLowerCase() &&
                        (isCurrentPlan ? (
                          <div className="py-4">
                            <Button
                              isLoading={cancelSubscriptionLoading}
                              isDisabled={
                                cancelSubscriptionLoading ||
                                checkoutLoading.isLoading
                              }
                              buttonClassName={`px-6 py-3.5 rounded-[12px] justify-center shadow-button hover:shadow-buttonHover w-full bg-[#FDE4E4] text-[#913838]`}
                              buttonText="Cancel Subscription"
                              onClick={() => {
                                setDeleteModal({
                                  toggle: true,
                                  data: plan,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <div className="py-4">
                            <Button
                              isLoading={
                                checkoutLoading.planId === plan._id &&
                                checkoutLoading.isLoading
                              }
                              isDisabled={
                                cancelSubscriptionLoading ||
                                checkoutLoading.isLoading
                              }
                              buttonClassName={`px-6 py-3.5 rounded-[12px] justify-center shadow-button hover:shadow-buttonHover w-full bg-white text-heading border border-stroke/30`}
                              buttonText="Upgrade Now"
                              onClick={() => {
                                handleCheckout(plan._id);
                              }}
                            />
                          </div>
                        ))}
                    </div>
                  );
                })
              ) : null}
            </div>
          </div>
        </div>
        {deleteModal.toggle && (
          <DeleteModal
            heading="Cancel Subsciption"
            subHeading={`Are you sure you want to cancel your subscription for plan named "${deleteModal?.data?.name}". Please keep in mind that these changes will not be reverted`}
            isLoading={cancelSubscriptionLoading}
            onCancel={() =>
              setDeleteModal({
                toggle: false,
                data: null,
              })
            }
            onConfirm={() => handleDeleteSubscription(deleteModal?.data?._id)}
          />
        )}
      </div>
    </div>
  );
}
