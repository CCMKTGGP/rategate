import React from "react";
import Input from "../input";
import { IPlatformCheckboxProps } from "./interface";

export default function PlatformCheckbox({
  platform,
  isLoading,
  url,
  placeholder,
  onChange,
  onDelete,
  showSeparator = true,
}: IPlatformCheckboxProps) {
  const { id, name } = platform;

  return (
    <form
      className="my-2 py-2 flex flex-col gap-2 rounded-[8px]"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <div className="w-[95%]">
        <div className="flex items-center">
          <p className="text-base text-heading pb-2 font-bold">{name}</p>
          <div className="ml-auto">
            <button
              type="button"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-error"
              onClick={() => onDelete(id)}
            >
              <img
                src="/Delete.svg"
                alt="Delete Icon for location"
                className="w-[16px]"
              />
            </button>
          </div>
        </div>
        <Input
          type="text"
          value={url}
          placeholder={placeholder}
          helpertext={`Enter your ${name} page url here`}
          onChange={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onChange({
              id,
              url: event.target.value,
            });
          }}
          disabled={isLoading}
        />
      </div>
      {showSeparator && <hr className="mt-4 mb-0" />}
    </form>
  );
}
