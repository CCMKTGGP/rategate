import React from "react";
import { IIconProps } from "./interface";

export default function ArrowRight({
  width = "24",
  height = "24",
  fill = "#9095A0",
}: IIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.66634 15.9997L25.333 15.9997M25.333 15.9997L15.9997 6.66634M25.333 15.9997L15.9997 25.333"
        stroke={fill}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
