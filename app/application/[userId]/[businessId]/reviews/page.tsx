"use client";

import moment from "moment";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/topbar";
import { useBusinessContext } from "@/context/businessContext";
import React, { useState, useMemo } from "react";
import Image from "next/image";
import { REVIEW_TYPES } from "@/constants/review_steps";
import ArrowDownSvg from "@/app/components/svg/ArrowDown";
import ReviewCharts from "@/app/components/review-charts/indev";
import { useReviewsContext } from "@/context/reviewContext";
import Checkmark from "@/app/components/svg/Checkmark";

export default function Reviews() {
  const ALL = "All";
  const { business } = useBusinessContext();
  const { reviews } = useReviewsContext();
  const [selectedType, setSelectedType] = useState(ALL);

  const filteredReviews = useMemo(() => {
    if (selectedType === ALL) return reviews;
    return reviews.filter((review) =>
      selectedType.toLowerCase() === REVIEW_TYPES.POSITIVE.toLowerCase()
        ? review.rating >= 4
        : review.rating <= 3
    );
  }, [selectedType, reviews]);

  return (
    <div className="flex items-start bg-white">
      <Sidebar />
      <div className="flex-1 h-screen overflow-auto">
        <TopBar />
        <div className="px-8 py-4">
          <div className="flex flex-col pb-12">
            <h3 className="font-archivo text-2xl leading-[48px] text-heading font-semibold">
              Reviews
            </h3>
            <p className="text-base leading-[24px] font-medium text-subHeading ">
              Manage your reviews here, see which location is doing best.
            </p>
            <div className="mt-8">
              <div className="flex items-start">
                <div className="flex flex-col basis-52">
                  <p className="text-sm leading-sm text-subHeading">
                    Business Name
                  </p>
                  <p className="text-base leading-24px text-heading font-medium">
                    {business.name}
                  </p>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm leading-sm text-subHeading">
                    Review Type
                  </p>
                  <div className="group relative">
                    <div className="flex items-center gap-4">
                      <p className="text-base leading-24px text-heading font-medium">
                        {selectedType}
                      </p>
                      <ArrowDownSvg width="16" height="16" fill="#171A1F" />
                    </div>
                    <div className="hidden group-hover:block">
                      <div className="w-[150px] bg-white p-4 rounded-[12px] border border-stroke/60 absolute top-6 z-10">
                        {["ALL", ...Object.keys(REVIEW_TYPES)].map((value) => {
                          const isSelected =
                            value.toLowerCase() === selectedType.toLowerCase();
                          return (
                            <div
                              key={value}
                              className="flex items-center gap-4 cursor-pointer py-2"
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedType(ALL);
                                  return;
                                }
                                setSelectedType(value);
                              }}
                            >
                              <p
                                className={`text-base leading-6 uppercase ${
                                  isSelected
                                    ? "text-primary font-bold"
                                    : "text-heading"
                                }`}
                              >
                                {value}
                              </p>
                              {isSelected && (
                                <Checkmark
                                  width="20"
                                  height="20"
                                  fill="#636AE8"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* REVIEW CARDS HERE  */}
              <div className="mt-8">
                {filteredReviews?.length > 0 ? (
                  filteredReviews?.map((review) => {
                    return (
                      <div
                        key={review._id}
                        className="bg-white border border-stroke/60 rounded-[12px] p-4 w-[60%] mt-4 flex flex-col gap-2"
                      >
                        {/* Business Name / Location Name / Employee Name */}
                        <div className="mt-2">
                          <h2 className="text-lg font-semibold text-heading">
                            Review for{" "}
                            {review?.employee_id
                              ? review?.employee_id?.name
                              : review?.location_id
                              ? review?.location_id?.name
                              : review?.business_id?.name}
                          </h2>
                          <p className="text-sm text-subHeading">
                            posted on{" "}
                            {moment(review.createdAt).format("MMM D, YYYY")}
                          </p>
                        </div>

                        {/* Rating and type */}
                        <div className="flex items-center mt-2">
                          <div className="basis-[30%]">
                            <div className="flex flex-col gap-2 mt-2 mb-4">
                              <p className="text-sm leading-sm text-gray-500">
                                Rating
                              </p>
                              <div className="flex items-center">
                                {Array.from({ length: 5 }, (_, index) => {
                                  return index < review.rating ? (
                                    <div key={index}>
                                      <Image
                                        src="/rate-filled.png"
                                        alt="Filled rating image"
                                        width={25}
                                        height={15}
                                        priority
                                      />
                                    </div>
                                  ) : (
                                    <div key={index}>
                                      <Image
                                        src="/rate-empty.png"
                                        alt="Empty rating image"
                                        width={25}
                                        height={15}
                                        priority
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Type */}
                          <div className="basis-[30%]">
                            <div className="flex flex-col gap-2 mt-2 mb-4">
                              <p className="text-sm leading-sm text-gray-500">
                                Type
                              </p>
                              <p className="text-heading">{review?.type}</p>
                            </div>
                          </div>
                        </div>

                        {/* Feedback */}
                        <div className="flex flex-col gap-2 mt-2 mb-4">
                          <p className="text-sm leading-sm text-gray-500">
                            Feedback
                          </p>
                          {review?.feedback ? (
                            <p className="text-heading">{review?.feedback}</p>
                          ) : (
                            <p className="text-heading">
                              Posted on {review?.provider}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-base leading-[24px] font-medium text-subHeading pt-6">
                    No reviews found.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
