import ReviewForm from "@/app/components/review-form";
import React from "react";

type Params = Promise<{
  businessSlug: string;
  locationSlug: string;
  employeeSlug: string;
}>;

export default async function Review({ params }: { params: Params }) {
  const { businessSlug, locationSlug, employeeSlug } = await params;
  return (
    <ReviewForm
      businessSlug={businessSlug}
      locationSlug={locationSlug}
      employeeSlug={employeeSlug}
    />
  );
}
