import { SUBSCRIPTION_TYPES } from "@/constants/subscription_types";
import Business from "@/lib/models/business";
import Plan from "@/lib/models/plan";
import User from "@/lib/models/user";
import PAYMENT_CONSTANTS from "@/utils/payments";
import { PlanTypes } from "@/utils/planTypes";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!);

export async function POST(req: NextRequest) {
  const { planId, userId, businessId } = await req.json();

  // check if the planId exist and is valid
  if (!planId || !Types.ObjectId.isValid(planId)) {
    return new NextResponse(
      JSON.stringify({ message: "Invalid or missing planId!" }),
      { status: 400 }
    );
  }

  // get plan details
  const plan = await Plan.findById(planId);
  if (!plan) {
    return new NextResponse(
      JSON.stringify({ message: "Plan does not exist!" }),
      { status: 400 }
    );
  }

  // check if the user id exists and is valid
  if (!userId || !Types.ObjectId.isValid(userId)) {
    return new NextResponse(
      JSON.stringify({ message: "Invalid or missing userId!" }),
      { status: 400 }
    );
  }

  // get user details
  const user = await User.findById(userId);
  if (!user) {
    return new NextResponse(
      JSON.stringify({ message: "User does not exist!" }),
      { status: 400 }
    );
  }

  // check if the business id exists and is valid
  if (!businessId || !Types.ObjectId.isValid(businessId)) {
    return new NextResponse(
      JSON.stringify({ message: "Invalid or missing businessId!" }),
      { status: 400 }
    );
  }

  // get business details
  const business = await Business.findById(businessId);
  if (!business) {
    return new NextResponse(
      JSON.stringify({ message: "Business does not exist!" }),
      { status: 400 }
    );
  }

  let priceId: string | undefined;
  let mode: any;

  switch (plan?.plan_id) {
    case PlanTypes.PROFESSIONAL.toLowerCase():
      priceId = process.env.STRIPE_PRICE_ID_PROFESSIONAL;
      mode = PAYMENT_CONSTANTS.SUBSCRIPTION_MODE;
      break;
    case PlanTypes.ENTERPRISE.toLowerCase():
      priceId = process.env.STRIPE_PRICE_ID_ENTERPRISE;
      mode = PAYMENT_CONSTANTS.SUBSCRIPTION_MODE;
      break;
    default:
      return new NextResponse(
        JSON.stringify({ message: "Invalid plan type!" }),
        { status: 400 }
      );
  }

  // Validate that priceId is not undefined
  if (!priceId) {
    return new NextResponse(
      JSON.stringify({
        message: "Price ID not defined for the selected plan!",
      }),
      { status: 400 }
    );
  }

  // Metadata for Checkout session
  const metadata: any = {
    data: JSON.stringify({
      type: SUBSCRIPTION_TYPES.SUBSCRIBE_PLAN,
      data: {
        plan_id: new Types.ObjectId(plan._id),
        business_id: new Types.ObjectId(business._id),
      },
    }),
  };

  try {
    if (
      mode === PAYMENT_CONSTANTS.SUBSCRIPTION_MODE &&
      business.subscription_id
    ) {
      // Retrieve the subscription to get the subscription item ID
      const subscription = await stripe.subscriptions.retrieve(
        business.subscription_id
      );

      // Get the subscription item ID from the subscription's items array
      const subscriptionItemId = subscription.items.data[0].id;

      // Update existing subscription
      const updatedSubscription = await stripe.subscriptions.update(
        business.subscription_id,
        {
          proration_behavior: "none",
          items: [
            {
              id: subscriptionItemId,
              deleted: true,
            },
            {
              price: priceId,
            },
          ],
          metadata,
        }
      );

      return new NextResponse(
        JSON.stringify({
          message: "Subscription updated successfully!",
          data: { sessionUrl: "", metadata: metadata },
        }),
        { status: 200 }
      );
    } else {
      // Create new subscription
      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: priceId, quantity: 1 }],
        mode,
        customer_email: business.email,
        billing_address_collection: "required",
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/application/${userId}/${businessId}/payment-success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/application/${userId}/${businessId}/billing`,
        metadata,
      });

      return new NextResponse(
        JSON.stringify({
          message: "Url Created successfully!",
          data: { sessionUrl: session.url, metadata: metadata },
        }),
        {
          status: 200,
        }
      );
    }
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: "Error in checkout " + error }),
      {
        status: 500,
      }
    );
  }
}
