import React from "react";
import Checkmark from "../svg/Checkmark";
import Input from "../input";
import { IPlatformCheckboxProps } from "./interface";

export default function PlatformCheckbox({
  platform,
  checked,
  isLoading,
  url,
  placeholder,
  onSelect,
  onChange,
}: IPlatformCheckboxProps) {
  const { id, name, helpertext } = platform;

  return (
    <form
      className={`my-2 py-2 flex flex-col gap-2 rounded-[8px]  ${
        checked ? "bg-[#FAFAFB]" : "bg-transparent"
      }`}
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <button
        type="button"
        className={`border-0 flex items-center gap-4 px-2 py-1 bg-transparent`}
        onClick={() => onSelect({ id, name })}
      >
        <div
          className={`w-7 h-7 flex items-center justify-center rounded-[8px] ${
            checked ? "bg-primary border-0" : "bg-white border border-stroke"
          }`}
        >
          {checked && <Checkmark width="18" height="18" />}
        </div>
        <p className="text-base text-heading leading-8">{name}</p>
      </button>
      {checked && (
        <div className="pl-14 w-[95%]">
          <Input
            type="text"
            value={url}
            placeholder={placeholder}
            helpertext={helpertext}
            onChange={(event) =>
              onChange({
                id,
                url: event.target.value,
              })
            }
            disabled={isLoading}
          />
        </div>
      )}
    </form>
  );
}
