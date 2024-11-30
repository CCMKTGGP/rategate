import React from "react";
import { IIconProps } from "./interface";

export default function Checkmark({
  width = "14",
  height = "14",
  fill = "#F2F2FD",
}: IIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.4502 7L5.3752 9.925L11.5502 3.75"
        stroke={fill}
        strokeWidth="0.78"
        strokeMiterlimit="10"
        strokeLinecap="square"
      />
    </svg>
  );
}
