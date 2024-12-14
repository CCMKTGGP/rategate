import { SUBSCRIPTION_TYPES } from "@/constants/subscription_types";
import connect from "@/lib/db";
import Location from "@/lib/models/location";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const POST = async (req: NextRequest) => {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    return new NextResponse("Webhook Error: ", { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata?.data;
      const sessionData = JSON.parse(metadata || "");

      const subscriptionId = session.subscription as string;

      if (
        sessionData?.type?.toLowerCase() ===
        SUBSCRIPTION_TYPES.ADD_LOCATION.toLowerCase()
      ) {
        try {
          await connect();
          // create the new location object
          const newLocation = new Location({
            ...sessionData?.data,
            location_subscription_id: subscriptionId,
          });
          await newLocation.save();

          return new NextResponse(
            JSON.stringify({
              message: "Location created successfully!",
              data: newLocation,
            }),
            {
              status: 201,
            }
          );
        } catch (err) {}
      }
      break;
    // case "customer.subscription.created":
    // case "customer.subscription.updated":
    // case "customer.subscription.deleted":
    //   const subscription = event.data.object as Stripe.Subscription;
    //   const userIdFromMetadata = subscription.metadata?.userId;
    //   const plan_id = subscription.metadata?.planId;
    //   const plan_type = subscription.metadata?.planType;

    //   if (userIdFromMetadata) {
    //     await connect();

    //     const updateFields =
    //       event.type === "customer.subscription.deleted"
    //         ? { subscriptionId: null, planType: null }
    //         : {
    //             subscriptionId: subscription.id,
    //             planType: plan_type,
    //             plan: new Types.ObjectId(plan_id),
    //           };

    //     try {
    //       await User.findOneAndUpdate(
    //         { _id: userIdFromMetadata },
    //         updateFields
    //       );
    //     } catch (err: any) {
    //       console.log(
    //         `Failed to update user for event ${event.type}:`,
    //         err.message
    //       );
    //     }
    //   }
    //   break;
    default:
      console.log(`Unhandled event type ${event.type}`);
      return new NextResponse("Received", { status: 200 });
  }

  return new NextResponse("Webhook Received: ", { status: 200 });
};
