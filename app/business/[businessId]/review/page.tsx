import ReviewForm from "@/app/components/review-form";
import React from "react";

type Params = Promise<{
  businessId: string;
  locationId: string;
  employeeId: string;
}>;

export default async function Review({ params }: { params: Params }) {
  const { businessId } = await params;
  return <ReviewForm businessId={businessId} />;
}
