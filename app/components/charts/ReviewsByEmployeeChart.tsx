"use client";

import { useEffect, useRef, useMemo } from "react";
import Chart from "chart.js/auto";
import { ChartProps } from "./interface";

export default function ReviewsByEmployeeChart({
  reviews,
  businessId,
}: ChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  const reviewsByEmployee = useMemo(() => {
    const counts: Record<string, number> = {};
    reviews
      .filter(
        (r) =>
          r.business_id._id === businessId && r.employee_id && r.employee_id._id
      )
      .forEach((r) => {
        const name = r.employee_id!.name;
        counts[name] = (counts[name] || 0) + 1;
      });
    return counts;
  }, [reviews, businessId]);

  const hasData = Object.keys(reviewsByEmployee).length > 0;

  useEffect(() => {
    if (!chartRef.current || !hasData) return;
    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: Object.keys(reviewsByEmployee),
        datasets: [
          {
            label: "Reviews by Employee",
            data: Object.values(reviewsByEmployee),
            backgroundColor: "rgba(142, 68, 173, 0.4)",
            borderColor: "#8e44ad",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
          },
        },
      },
    });
  }, [reviewsByEmployee]);

  return (
    <div className="w-full h-[400px]">
      {hasData ? (
        <canvas ref={chartRef} />
      ) : (
        <div className="text-left text-subHeading text-sm">
          No employee reviews to display.
        </div>
      )}
    </div>
  );
}
