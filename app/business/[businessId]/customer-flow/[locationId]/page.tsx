import CustomerFlowReviewForm from "@/app/components/customer-flow-review-form";
import React from "react";

type Params = Promise<{
  businessId: string;
  locationId: string;
}>;

export default async function Review({ params }: { params: Params }) {
  const { businessId, locationId } = await params;
  return (
    <CustomerFlowReviewForm businessId={businessId} locationId={locationId} />
  );
}
