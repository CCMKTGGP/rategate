import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { Types } from "mongoose";
import Review from "@/lib/models/review";
import Location from "@/lib/models/location";

// get all reviews for a location.
export const GET = async (request: Request) => {
  try {
    // extract the location id from the search params
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");

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
        JSON.stringify({ message: "Location does not exist!" }),
        { status: 400 }
      );
    }

    // fetch all the reviews where locationId is equal to params location id
    const reviews = await Review.find({
      location_id: new Types.ObjectId(locationId),
      business_id: { $ne: location.businessId },
    });
    return new NextResponse(
      JSON.stringify({
        message: "Reviews fetched successfully!",
        data: reviews,
      }),
      { status: 200 }
    );
  } catch (err) {
    return new NextResponse("Error in fetching reviews " + err, {
      status: 500,
    });
  }
};
