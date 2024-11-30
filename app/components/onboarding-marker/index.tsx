import React from "react";

export default function OnboardingMarker({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {Array.from({ length: totalSteps }, (_, index) => {
          return (
            <div
              key={index}
              className={`w-10 h-2 rounded-full ${
                index + 1 === currentStep
                  ? "bg-primary"
                  : currentStep > index
                  ? "bg-primaryHover"
                  : "bg-stroke"
              }`}
            />
          );
        })}
      </div>
      <p className="text-sm leading-4 text-subHeading">
        {currentStep} of {totalSteps}
      </p>
    </div>
  );
}
