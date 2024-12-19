import { SUBSCRIPTION_TYPES } from "@/constants/subscription_types";
import connect from "@/lib/db";
import Business from "@/lib/models/business";
import Employee from "@/lib/models/employee";
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
        } catch (err) {
          console.log(err);
        }
      }

      // if the type is for employee
      if (
        sessionData?.type?.toLowerCase() ===
        SUBSCRIPTION_TYPES.ADD_EMPLOYEE.toLowerCase()
      ) {
        try {
          // find the location based on the locationId in the metadata
          const locationId = sessionData?.data?.location_id;
          await connect();
          const location = await Location.findById(locationId);

          if (!location) {
            return new NextResponse(
              JSON.stringify({ message: "Location does not exist!" }),
              { status: 400 }
            );
          }

          // create the new employee object
          const newEmployee = new Employee({
            ...sessionData?.data,
            employee_subscription_id: subscriptionId,
          });
          await newEmployee.save();

          // update the total members in the location
          location.total_members += 1;
          await location.save();

          return new NextResponse(
            JSON.stringify({
              message: "Employee created successfully!",
              data: newEmployee,
            }),
            {
              status: 201,
            }
          );
        } catch (err) {
          console.log(err);
        }
      }

      // if the type is for business subscription
      if (
        sessionData?.type?.toLowerCase() ===
        SUBSCRIPTION_TYPES.SUBSCRIBE_PLAN.toLowerCase()
      ) {
        try {
          const { plan_id, business_id } = sessionData?.data;
          await connect();
          const business = await Business.findById(business_id);

          if (!business) {
            return new NextResponse(
              JSON.stringify({ message: "Business does not exist!" }),
              { status: 400 }
            );
          }

          const updateData = {
            plan_id: new Types.ObjectId(plan_id),
            subscription_id: subscriptionId,
          };
          await Business.findOneAndUpdate({ _id: business_id }, updateData);
        } catch (err) {
          console.log(err);
        }
      }

      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      const subscription = event.data.object as Stripe.Subscription;
      const updateSubscriptionMetadata = subscription.metadata?.data;
      const updateSubscriptionSessionData = JSON.parse(
        updateSubscriptionMetadata || ""
      );
      const { plan_id, business_id } = updateSubscriptionSessionData?.data;

      if (business_id) {
        await connect();

        const updateFields =
          event.type === "customer.subscription.deleted"
            ? { subscription_id: null }
            : {
                subscription_id: subscription.id,
                plan_id: new Types.ObjectId(plan_id),
              };

        try {
          await Business.findOneAndUpdate({ _id: business_id }, updateFields);
        } catch (err: any) {
          console.log(
            `Failed to update user for event ${event.type}:`,
            err.message
          );
        }
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
      return new NextResponse("Received", { status: 200 });
  }

  return new NextResponse("Webhook Received: ", { status: 200 });
};
