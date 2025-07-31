"use client";
import ApiError from "@/app/components/api-error";
import RatingDistributionChart from "@/app/components/charts/RatingDistributionChart";
import ReviewsByEmployeeChart from "@/app/components/charts/ReviewsByEmployeeChart";
import ReviewsByLocationChart from "@/app/components/charts/ReviewsByLocationChart";
import ReviewTrendChart from "@/app/components/charts/ReviewTrendChart";
import Sidebar from "@/app/components/sidebar";
import ArrowDownSvg from "@/app/components/svg/ArrowDown";
import Checkmark from "@/app/components/svg/Checkmark";
import TopBar from "@/app/components/topbar";
import { useBusinessContext } from "@/context/businessContext";
import { IReview, useReviewsContext } from "@/context/reviewContext";
import React, { useMemo, useState } from "react";

export default function Trends() {
  const { business } = useBusinessContext();
  const { reviews } = useReviewsContext();

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const [filteredReviews, setFilteredReviews] = useState<IReview[]>(reviews);
  const [isFiltered, setIsFiltered] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("ALL");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("ALL");
  const [dateError, setDateError] = useState("");

  const applyFilter = () => {
    const fromDate = from
      ? new Date(
          Date.UTC(
            new Date(from).getUTCFullYear(),
            new Date(from).getUTCMonth(),
            new Date(from).getUTCDate(),
            0,
            0,
            0,
            0
          )
        )
      : null;

    const toDate = to
      ? new Date(
          Date.UTC(
            new Date(to).getUTCFullYear(),
            new Date(to).getUTCMonth(),
            new Date(to).getUTCDate(),
            23,
            59,
            59,
            999
          )
        )
      : null;

    if (fromDate && !toDate) {
      setDateError("To date is required and cannot be empty!");
      return;
    }

    const result = reviews.filter((review) => {
      const created = new Date(review.createdAt);
      const matchesDate =
        (!fromDate || created >= fromDate) && (!toDate || created <= toDate);
      const matchesLocation =
        selectedLocation === "ALL" ||
        review.location_id?.name === selectedLocation;

      const matchesEmployee =
        selectedEmployee === "ALL" ||
        review.employee_id?.name === selectedEmployee;

      return matchesDate && matchesLocation && matchesEmployee;
    });

    setFilteredReviews(result);
    setIsFiltered(true);
  };

  const metrics = useMemo(() => {
    const totalReviews = filteredReviews.length;
    let locationReviews = 0;
    let employeeReviews = 0;
    let reviewsWithoutLocationOrEmployee = 0;

    filteredReviews.forEach((review) => {
      const hasLocation =
        review.location_id && review.location_id._id && !review.employee_id;
      const hasEmployee = review.employee_id && review.employee_id._id;

      if (hasLocation) locationReviews++;
      if (hasEmployee) employeeReviews++;
      if (!hasLocation && !hasEmployee) reviewsWithoutLocationOrEmployee++;
    });

    return {
      totalReviews,
      locationReviews,
      employeeReviews,
      reviewsWithoutLocationOrEmployee,
    };
  }, [filteredReviews]);

  return (
    <div className="flex items-start bg-white">
      <Sidebar />
      <div className="flex-1 h-screen overflow-auto">
        <TopBar />
        <div className="px-8 py-4">
          <div className="flex flex-col pb-12">
            <h3 className="font-archivo text-2xl leading-[48px] text-heading font-semibold">
              Trends
            </h3>
            <p className="text-base leading-[24px] font-medium text-subHeading ">
              {"See how your team(s) and location(s) are performing over time."}
            </p>
            <div className="my-8 flex flex-col gap-2">
              <h3 className="font-archivo text-2xl leading-[48px] text-heading font-semibold">
                Filter Reviews
              </h3>
              <div className="flex gap-6 items-start">
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <label className="block text-sm text-heading font-medium">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={from}
                    max={formattedDate}
                    onChange={(e) => {
                      setFrom(e.target.value);
                      setTo("");
                    }}
                    className="border border-stroke px-6 py-1.5 rounded-[8px] w-full"
                  />
                </div>
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <label className="block text-sm text-heading font-medium">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={to}
                    min={from}
                    max={formattedDate}
                    onChange={(e) => setTo(e.target.value)}
                    className="border border-stroke px-6 py-1.5 rounded-[8px] w-full"
                  />
                </div>
                <div className="flex flex-col min-w-[200px]">
                  <p className="text-sm leading-sm text-subHeading">Location</p>
                  <div className="group relative py-3">
                    <div className="flex items-center">
                      <p className="text-base leading-24px text-heading font-medium">
                        {selectedLocation}
                      </p>
                      <div className="ml-auto">
                        <ArrowDownSvg width="16" height="16" fill="#171A1F" />
                      </div>
                    </div>
                    <div className="hidden group-hover:block">
                      <div className="w-full bg-white p-4 rounded-[12px] border border-stroke/60 absolute top-12 z-10">
                        {[
                          "ALL",
                          ...new Set(
                            reviews
                              .map((r) => r.location_id?.name)
                              .filter(Boolean)
                          ),
                        ].map((value) => {
                          const isSelected = value === selectedLocation;
                          return (
                            <div
                              key={value}
                              className="flex items-center cursor-pointer py-2"
                              onClick={() => {
                                setSelectedLocation(value);
                              }}
                            >
                              <p
                                className={`text-base leading-6 ${
                                  isSelected
                                    ? "text-primary font-bold"
                                    : "text-heading"
                                }`}
                              >
                                {value}
                              </p>
                              {isSelected && (
                                <div className="ml-auto">
                                  <Checkmark
                                    width="20"
                                    height="20"
                                    fill="#636AE8"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col min-w-[200px]">
                  <p className="text-sm leading-sm text-subHeading">Employee</p>
                  <div className="group relative py-3">
                    <div className="flex items-center">
                      <p className="text-base leading-24px text-heading font-medium">
                        {selectedEmployee}
                      </p>
                      <div className="ml-auto">
                        <ArrowDownSvg width="16" height="16" fill="#171A1F" />
                      </div>
                    </div>
                    <div className="hidden group-hover:block">
                      <div className="w-full bg-white p-4 rounded-[12px] border border-stroke/60 absolute top-12 z-10">
                        {[
                          "ALL",
                          ...new Set(
                            reviews
                              .map((r) => r.employee_id?.name)
                              .filter(Boolean)
                          ),
                        ].map((value) => {
                          const isSelected = value === selectedEmployee;
                          return (
                            <div
                              key={value}
                              className="flex items-center cursor-pointer py-2"
                              onClick={() => setSelectedEmployee(value)}
                            >
                              <p
                                className={`text-base leading-6 ${
                                  isSelected
                                    ? "text-primary font-bold"
                                    : "text-heading"
                                }`}
                              >
                                {value}
                              </p>
                              {isSelected && (
                                <div className="ml-auto">
                                  <Checkmark
                                    width="20"
                                    height="20"
                                    fill="#636AE8"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-6">
                <button
                  onClick={applyFilter}
                  className="bg-primary text-white px-6 py-2 rounded hover:bg-primaryHover font-inter font-medium"
                >
                  Apply Filter
                </button>
                {isFiltered && (
                  <button
                    onClick={() => {
                      setFrom("");
                      setTo("");
                      setSelectedLocation("ALL");
                      setSelectedEmployee("ALL");
                      setFilteredReviews(reviews);
                      setIsFiltered(false);
                    }}
                    className="bg-transparent text-subHeading px-6 py-2 hover:text-primary font-inter font-medium hover:font-bold transition-all"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              {dateError && (
                <ApiError
                  message={dateError}
                  setMessage={(value) => setDateError(value)}
                />
              )}
            </div>
            <hr className="my-4" />
            {filteredReviews.length > 0 ? (
              <div className="my-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="border border-stroke p-4 rounded-[8px] bg-white shadow-card">
                    <p className="text-subHeading text-sm">Total Reviews</p>
                    <p className="text-2xl leading-10 font-semibold">
                      {metrics.totalReviews}
                    </p>
                  </div>
                  <div className="border border-stroke p-4 rounded-[8px] bg-white shadow-card">
                    <p className="text-subHeading text-sm">
                      Total Business Reviews
                    </p>
                    <p className="text-2xl leading-10 font-semibold">
                      {metrics.reviewsWithoutLocationOrEmployee}
                    </p>
                  </div>
                  <div className="border border-stroke p-4 rounded-[8px] bg-white shadow-card">
                    <p className="text-subHeading text-sm">
                      Total Location Reviews
                    </p>
                    <p className="text-2xl leading-10 font-semibold">
                      {metrics.locationReviews}
                    </p>
                  </div>
                  <div className="border border-stroke p-4 rounded-[8px] bg-white shadow-card">
                    <p className="text-subHeading text-sm">
                      Total Employee Reviews
                    </p>
                    <p className="text-2xl leading-10 font-semibold">
                      {metrics.employeeReviews}
                    </p>
                  </div>
                </div>
                <div className="my-8">
                  <div className="flex items-start flex-wrap gap-6">
                    <div className="w-[48%] mt-4">
                      <h3 className="font-archivo text-2xl leading-[48px] text-heading font-semibold">
                        Overall Rating Distribution
                      </h3>
                      <RatingDistributionChart
                        reviews={filteredReviews}
                        businessId={business._id}
                      />
                    </div>
                    <div className="w-[48%] mt-4">
                      <h3 className="font-archivo text-2xl leading-[48px] text-heading font-semibold">
                        Reviews Trend Over Time
                      </h3>
                      <ReviewTrendChart
                        reviews={filteredReviews}
                        businessId={business._id}
                      />
                    </div>
                    <div className="w-[48%] mt-4">
                      <h3 className="font-archivo text-2xl leading-[48px] text-heading font-semibold">
                        Reviews by Location
                      </h3>
                      <ReviewsByLocationChart
                        reviews={filteredReviews}
                        businessId={business._id}
                      />
                    </div>
                    <div className="w-[48%] mt-4">
                      <h3 className="font-archivo text-2xl leading-[48px] text-heading font-semibold">
                        Reviews by Employees
                      </h3>
                      <ReviewsByEmployeeChart
                        reviews={filteredReviews}
                        businessId={business._id}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="my-4">
                <p className="text-base leading-[24px] font-medium text-subHeading ">
                  Oops, there are no reviews registered for the given filters!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
