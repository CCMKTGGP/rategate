"use client";

import { useEffect, useRef, useMemo } from "react";
import Chart from "chart.js/auto";
import { ChartProps } from "./interface";

export default function ReviewsByLocationChart({
  reviews,
  businessId,
}: ChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  const reviewsByLocation = useMemo(() => {
    const counts: Record<string, number> = {};
    reviews
      .filter(
        (r) =>
          r.business_id._id === businessId &&
          r.location_id &&
          r.location_id._id &&
          !r.employee_id
      )
      .forEach((r) => {
        const name = r.location_id!.name;
        counts[name] = (counts[name] || 0) + 1;
      });
    return counts;
  }, [reviews, businessId]);

  const hasData = Object.keys(reviewsByLocation).length > 0;

  useEffect(() => {
    if (!chartRef.current || !hasData) return;
    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: Object.keys(reviewsByLocation),
        datasets: [
          {
            label: "Reviews by Location",
            data: Object.values(reviewsByLocation),
            backgroundColor: "rgba(243, 156, 18, 0.4)",
            borderColor: "#f39c12",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: { beginAtZero: true, ticks: { stepSize: 1 } },
        },
      },
    });
  }, [reviewsByLocation]);

  return (
    <div className="w-full h-[400px]">
      {hasData ? (
        <canvas ref={chartRef} />
      ) : (
        <div className="text-left text-subHeading text-sm">
          No location reviews to display.
        </div>
      )}
    </div>
  );
}
