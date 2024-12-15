import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { Types } from "mongoose";
import Location from "@/lib/models/location";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!);

type Params = Promise<{ locationId: string }>;

// get location details api
export const GET = async (request: Request, context: { params: Params }) => {
  try {
    const { locationId } = await context.params;

    // check if the locationId exist and is valid
    if (!locationId || !Types.ObjectId.isValid(locationId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid or missing locationId!" }),
        { status: 400 }
      );
    }

    // establish the database connection
    await connect();

    // get location details from locationId
    const location = await Location.findById(locationId);

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

// update location api
export const PUT = async (request: Request, context: { params: Params }) => {
  try {
    const { locationId } = await context.params;
    // extract the fields from the request object
    const { data } = await request.json();
    // establish the connection with database
    await connect();

    // check if the locationId is valid
    if (!locationId || !Types.ObjectId.isValid(locationId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid or missing locationId!" }),
        { status: 400 }
      );
    }

    // check if the location exists
    const location = await Location.findById(locationId);
    if (!location) {
      return new NextResponse(
        JSON.stringify({ message: "Location does not exist!" }),
        { status: 400 }
      );
    }

    // update the locaton
    const updatedLocation = await Location.findOneAndUpdate(
      { _id: location._id },
      {
        ...data,
      },
      {
        new: true,
      }
    );

    // check if the process successed
    if (!updatedLocation) {
      return new NextResponse(
        JSON.stringify({ message: "Location not updated!" }),
        { status: 400 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        message: "Location updated successfully!",
        data: updatedLocation,
      }),
      {
        status: 200,
      }
    );
  } catch (err) {
    return new NextResponse("Error in updating location " + err, {
      status: 500,
    });
  }
};

// delete location api
export const DELETE = async (request: Request, context: { params: Params }) => {
  try {
    const { locationId } = await context.params;

    // establish the connection with database
    await connect();

    // check if the locationId is valid
    if (!locationId || !Types.ObjectId.isValid(locationId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid or missing locationId!" }),
        { status: 400 }
      );
    }

    // check if the Location exists in the database
    const location = await Location.findById(locationId);
    if (!location) {
      return new NextResponse(
        JSON.stringify({ message: "Location does not exist!" }),
        { status: 400 }
      );
    }

    // cancel subscription flow
    try {
      // Cancel the Stripe subscription
      await stripe.subscriptions.cancel(location.location_subscription_id);
      location.location_subscription_id = null;
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ message: "Failed to cancel subscription!" }),
        { status: 500 }
      );
    }

    const deletelocation = await Location.findByIdAndDelete({
      _id: location._id,
    });

    // check if the process successed
    if (!deletelocation) {
      return new NextResponse(
        JSON.stringify({ message: "Location not deleted!" }),
        { status: 400 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        message: `Location, ${location.name} has been deleted successfully!`,
      }),
      {
        status: 200,
      }
    );
  } catch (err) {
    return new NextResponse("Error in deleting location " + err, {
      status: 500,
    });
  }
};
