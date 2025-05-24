"use client";

import { useEffect, useRef, useMemo } from "react";
import Chart from "chart.js/auto";
import { ChartProps } from "./interface";

export default function ReviewTrendChart({ reviews, businessId }: ChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  const reviewsPerDay = useMemo(() => {
    const counts: Record<string, number> = {};

    reviews
      .filter((r) => r.business_id._id === businessId)
      .forEach((r) => {
        const date = new Date(r.createdAt).toISOString().split("T")[0];
        counts[date] = (counts[date] || 0) + 1;
      });

    // Sort the entries by date
    const sortedEntries = Object.entries(counts).sort(
      ([dateA], [dateB]) =>
        new Date(dateA).getTime() - new Date(dateB).getTime()
    );

    return Object.fromEntries(sortedEntries);
  }, [reviews, businessId]);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(chartRef.current, {
      type: "line",
      data: {
        labels: Object.keys(reviewsPerDay),
        datasets: [
          {
            label: "Reviews per Day",
            data: Object.values(reviewsPerDay),
            borderColor: "rgba(75, 192, 192, 1)",
            fill: false,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: "Date",
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Number of Reviews",
            },
          },
        },
      },
    });
  }, [reviewsPerDay]);

  return (
    <div className="w-full h-[300px]">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}
