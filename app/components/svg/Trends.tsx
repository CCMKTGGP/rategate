import React from "react";
import { IIconProps } from "./interface";

export default function TrendsSvg({
  width = "24",
  height = "24",
  fill = "#9095A0",
}: IIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 21V19H22V21H2ZM3 18V11H6V18H3ZM8 18V6H11V18H8ZM13 18V9H16V18H13ZM18 18V3H21V18H18Z"
        fill={fill}
      />
    </svg>
  );
}
