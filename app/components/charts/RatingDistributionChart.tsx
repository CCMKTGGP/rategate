"use client";

import { useEffect, useRef, useMemo } from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { ChartProps } from "./interface";

Chart.register(ChartDataLabels);

export default function RatingDistributionChart({
  reviews,
  businessId,
}: ChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  const ratingCount = useMemo(() => {
    const count: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews
      .filter((r) => r.business_id._id === businessId)
      .forEach((r) => count[r.rating]++);
    return count;
  }, [reviews, businessId]);

  useEffect(() => {
    const total = Object.values(ratingCount).reduce((a, b) => a + b, 0);
    if (!chartRef.current) return;

    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(chartRef.current, {
      type: "pie",
      data: {
        labels: Object.keys(ratingCount).map((r) => `${r} Stars`),
        datasets: [
          {
            label: "Rating Distribution",
            data: Object.values(ratingCount),
            backgroundColor: [
              "rgba(142, 68, 173, 0.8)",
              "rgba(241, 196, 15, 0.8)",
              "rgba(231, 76, 60, 0.8)",
              "rgba(46, 204, 113, 0.8)",
              "rgba(52, 152, 219, 0.8)",
            ],
          },
        ],
      },
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.raw as number;
                const pct = ((val / total) * 100).toFixed(1);
                return `${val} reviews (${pct}%)`;
              },
            },
          },
          datalabels: {
            formatter: (val) => `${((val / total) * 100).toFixed(1)}%`,
            color: "#fff",
            font: { weight: "bold", size: 12 },
          },
        },
      },
    });
  }, [ratingCount]);

  return (
    <div className="w-[300px] h-[300px]">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}
