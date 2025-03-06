"use client";

import { useEffect, useRef, useMemo } from "react";
import ChartDataLabels from "chartjs-plugin-datalabels";
import Chart from "chart.js/auto";
import { IReview } from "@/context/reviewContext";
Chart.register(ChartDataLabels);

export default function ReviewCharts({
  reviews,
  businessId,
}: {
  reviews: IReview[];
  businessId: string;
}) {
  const ratingChartRef = useRef<HTMLCanvasElement | null>(null);
  const reviewTrendChartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstances = useRef<{ [key: string]: Chart | null }>({});

  const { ratingCount, reviewsPerDay } = useMemo(() => {
    const filteredReviews = reviews
      .filter((review) => review.business_id._id === businessId)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        // Ensure that createdAt is a valid date
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          return 0; // Return 0 if either date is invalid
        }
        return dateA.getTime() - dateB.getTime(); // Sort by timestamp (oldest to newest)
      });

    const ratingCount: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    const reviewsPerDay: Record<string, number> = {};

    filteredReviews.forEach(({ rating, createdAt }) => {
      const date = new Date(createdAt).toISOString().split("T")[0];
      reviewsPerDay[date] = (reviewsPerDay[date] || 0) + 1;
      ratingCount[rating] += 1;
    });

    return { ratingCount, reviewsPerDay };
  }, [reviews, businessId]);

  useEffect(() => {
    if (ratingChartRef.current) {
      if (chartInstances.current["ratingDistribution"]) {
        chartInstances.current["ratingDistribution"]!.destroy();
      }

      const totalReviews = Object.values(ratingCount).reduce(
        (acc, val) => acc + val,
        0
      );

      chartInstances.current["ratingDistribution"] = new Chart(
        ratingChartRef.current,
        {
          type: "pie",
          data: {
            labels: Object.keys(ratingCount).map((r) => `${r} Stars`),
            datasets: [
              {
                label: "Rating Distribution",
                data: Object.values(ratingCount),
                backgroundColor: [
                  "rgba(142, 68, 173, 0.8)", // Purple
                  "rgba(241, 196, 15, 0.8)", // Yellow
                  "rgba(231, 76, 60, 0.8)", // Red
                  "rgba(46, 204, 113, 0.8)", // Green
                  "rgba(52, 152, 219, 0.8)", // Blue
                ],
                hoverOffset: 4,
              },
            ],
          },
          options: {
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (tooltipItem) {
                    const value: any = tooltipItem.raw;
                    const percentage = ((value / totalReviews) * 100).toFixed(
                      2
                    );
                    return `${value} reviews (${percentage}%)`;
                  },
                },
              },
              datalabels: {
                formatter: (value, context) => {
                  const percentage =
                    ((value / totalReviews) * 100).toFixed(1) + "%";
                  return percentage;
                },
                color: "#fff",
                font: {
                  weight: "bold",
                  size: 12,
                },
              },
            },
          },
        }
      );
    }

    if (reviewTrendChartRef.current) {
      if (chartInstances.current["reviewTrend"]) {
        chartInstances.current["reviewTrend"]!.destroy();
      }
      chartInstances.current["reviewTrend"] = new Chart(
        reviewTrendChartRef.current,
        {
          type: "line",
          data: {
            labels: Object.keys(reviewsPerDay),
            datasets: [
              {
                label: "Reviews per Day",
                data: Object.values(reviewsPerDay),
                borderColor: "rgba(75, 192, 192, 1)",
                fill: false,
              },
            ],
          },
        }
      );
    }
  }, [ratingCount, reviewsPerDay]);

  return (
    <div className="flex items-start gap-4">
      <div className="basis-[40%]">
        <h3 className="font-archivo text-2xl leading-[48px] text-heading font-semibold">
          Overall Rating Distribution
        </h3>
        <div className="w-[300px] h-[300px]">
          <canvas ref={ratingChartRef}></canvas>
        </div>
      </div>
      <div className="basis-[60%]">
        <h3 className="font-archivo text-2xl leading-[48px] text-heading font-semibold">
          Reviews Trend Over Time
        </h3>
        <div className="w-full h-[300px]">
          <canvas ref={reviewTrendChartRef}></canvas>
        </div>
      </div>
    </div>
  );
}
