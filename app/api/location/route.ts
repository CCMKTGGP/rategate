import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { Types } from "mongoose";
import Business from "@/lib/models/business";
import User from "@/lib/models/user";
import Location from "@/lib/models/location";
import PAYMENT_CONSTANTS from "@/utils/payments";
import Stripe from "stripe";
import { SUBSCRIPTION_TYPES } from "@/constants/subscription_types";

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!);

// get all locations for a business id
export const GET = async (request: Request) => {
  try {
    // extract the business id from the search params
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");

    // check if the businessId exist and is valid
    if (!businessId || !Types.ObjectId.isValid(businessId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid or missing businessId!" }),
        { status: 400 }
      );
    }
    // establish the connection with database
    await connect();

    // get all the locations present in the database for a business id
    const locations = await Location.find({
      business_id: new Types.ObjectId(businessId),
    });

    // return them to frontend
    return new NextResponse(
      JSON.stringify({
        message: "locations fetched successfully!",
        data: locations,
      }),
      { status: 200 }
    );
  } catch (err) {
    return new NextResponse("Error in fetching all locations " + err, {
      status: 500,
    });
  }
};

// create new location for a business
export const POST = async (request: Request) => {
  try {
    // extract the request body from request
    const { userId, businessId, name, address } = await request.json();

    // check if the userId exist and is valid
    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid or missing userId!" }),
        { status: 400 }
      );
    }

    // check if the businessId exist and is valid
    if (!businessId || !Types.ObjectId.isValid(businessId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid or missing businessId!" }),
        { status: 400 }
      );
    }

    // establish the database connection
    await connect();

    // check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "User does not exist!" }),
        { status: 400 }
      );
    }

    // check if the business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return new NextResponse(
        JSON.stringify({ message: "Business does not exist!" }),
        { status: 400 }
      );
    }

    // create a one time payment subscription here.
    const priceId: string = process.env.STRIPE_PRICE_ID_LOCATION as string;
    const mode: any = PAYMENT_CONSTANTS.PAYMENT_MODE as string;

    // Metadata for Checkout session
    const metadata: any = {
      data: JSON.stringify({
        type: SUBSCRIPTION_TYPES.ADD_LOCATION,
        data: {
          name,
          address,
          total_reviews: 0,
          total_members: 0,
          business_id: businessId,
        },
      }),
    };

    // Handle lifetime plan (one-time payment)
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode,
      customer_email: business.email,
      billing_address_collection: "required",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/application/${userId}/${businessId}/payment-success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/application/${userId}/${businessId}/dashboard/add-location`,
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
  } catch (err) {
    return new NextResponse("Error in creating location " + err, {
      status: 500,
    });
  }
};
