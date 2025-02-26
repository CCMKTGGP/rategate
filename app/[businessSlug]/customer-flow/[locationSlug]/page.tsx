import CustomerFlowReviewForm from "@/app/components/customer-flow-review-form";
import React from "react";

type Params = Promise<{
  businessSlug: string;
  locationSlug: string;
}>;

export default async function Review({ params }: { params: Params }) {
  const { businessSlug, locationSlug } = await params;
  return (
    <CustomerFlowReviewForm
      businessSlug={businessSlug}
      locationSlug={locationSlug}
    />
  );
}
