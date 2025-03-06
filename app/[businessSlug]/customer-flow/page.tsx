import CustomerFlowReviewForm from "@/app/components/customer-flow-review-form";
import React from "react";

type Params = Promise<{
  businessSlug: string;
}>;

export default async function Review({ params }: { params: Params }) {
  const { businessSlug } = await params;
  return <CustomerFlowReviewForm businessSlug={businessSlug} />;
}
