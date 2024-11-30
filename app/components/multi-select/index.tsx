import React from "react";
import ArrowDownSvg from "../svg/ArrowDown";
import IMultiSelectProps from "./interface";

export default function MultiSelect({
  id,
  label,
  error = "",
  helpertext = "",
  value = "",
  className = "",
  disabled,
  options,
  selectedOptions,
  onChange,
}: IMultiSelectProps) {
  return (
    <div className="py-2">
      <label
        htmlFor={id}
        className="block text-sm text-heading mb-2 font-inter font-bold"
      >
        {label}
      </label>
      <div
        className={`relative group font-inter w-full flex items-center px-4 py-3 mb-2 ${
          value ? "bg-white" : "bg-[#F3F4F6]"
        } ${
          error !== "" ? "border-error" : "border-stroke/50"
        } rounded-md ${className} ${
          disabled ? "cursor-not-allowed bg-[rgba(175,176,178,0.2)]" : null
        }`}
      >
        <p>{selectedOptions?.toString()}</p>
        <div className="ml-auto">
          <ArrowDownSvg width="20" height="20" fill="#BCC1CA" />
        </div>
        <div className="absolute top-11 left-0 bg-white rounded-md border border-stroke hidden group-hover:block w-full px-4 py-6">
          hello world
        </div>
      </div>
      {helpertext !== "" ? (
        <p className="text-stroke text-sm font-medium">{helpertext}</p>
      ) : null}
      {error !== "" ? (
        <p className="text-error text-sm font-medium">{error}</p>
      ) : null}
    </div>
  );
}
