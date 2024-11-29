import React from "react";
import { IInputProps } from "./interface";

const Input = (props: IInputProps) => {
  const {
    error,
    hasHelperText,
    helperText,
    label,
    className,
    disabled,
    value,
  } = props;
  return (
    <div className="py-2">
      {label !== "" && (
        <label
          htmlFor={label}
          className="block text-sm text-heading mb-2 font-inter"
        >
          {label}
        </label>
      )}
      {hasHelperText ? (
        <p className="text-subHeading text-sm font-medium">{helperText}</p>
      ) : null}
      <input
        id={label}
        className={`font-inter w-full px-4 py-3 mb-2 outline-none border placeholder:text-md placeholder:text-grey ${
          value ? "bg-white" : "bg-[#F3F4F6]"
        } ${
          error !== "" ? "border-error" : "border-stroke/50"
        } rounded-md ${className} ${
          disabled ? "cursor-not-allowed bg-[rgba(175,176,178,0.2)]" : null
        }`}
        {...props}
      />
      {error !== "" ? (
        <p className="text-error text-sm font-medium">{error}</p>
      ) : null}
    </div>
  );
};

export default Input;
