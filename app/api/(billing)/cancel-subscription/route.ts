import Business from "@/lib/models/business";
import Plan from "@/lib/models/plan";
import User from "@/lib/models/user";
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

  try {
    // fetch all plans
    const plans = await Plan.find();

    const freePlan: any = plans.filter(
      (plan) => plan.plan_id === PlanTypes.BASIC.toLowerCase()
    );
    let responseMessage = "";

    // Handle subscription cancellation
    if (business.subscription_id) {
      try {
        // Cancel the Stripe subscription
        await stripe.subscriptions.cancel(business.subscription_id);
        // Update the business's record: clear subscriptionId and plan
        business.subscription_id = null;
        business.plan_id = new Types.ObjectId(freePlan?.[0]?._id);

        await business.save();
        responseMessage += "Subscription canceled successfully! ";
      } catch (error) {
        return new NextResponse(
          JSON.stringify({ message: "Failed to cancel subscription!" }),
          { status: 500 }
        );
      }
    }
    return new NextResponse(
      JSON.stringify({
        message: responseMessage,
        data: business,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return new NextResponse("Error in canceling subscription " + error, {
      status: 500,
    });
  }
}