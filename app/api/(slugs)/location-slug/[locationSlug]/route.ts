import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { Types } from "mongoose";
import Location from "@/lib/models/location";
import Stripe from "stripe";
import Employee from "@/lib/models/employee";

type Params = Promise<{ locationSlug: string }>;

// get location details api from location slug
export const GET = async (request: Request, context: { params: Params }) => {
  try {
    const { locationSlug } = await context.params;

    // check if the locationSlug exist
    if (!locationSlug) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid location slug!" }),
        { status: 400 }
      );
    }

    // establish the database connection
    await connect();

    // get location details from locationSlug
    const location = await Location.findOne({ slug: locationSlug });

    if (!location) {
      return new NextResponse(
        JSON.stringify({
          message: "Location does not exist!",
        }),
        { status: 400 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        message: "Location Details fetched successfully!",
        data: location,
      }),
      { status: 200 }
    );
  } catch (err) {
    return new NextResponse("Error in fetching location " + err, {
      status: 500,
    });
  }
};
