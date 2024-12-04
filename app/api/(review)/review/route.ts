import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { Types } from "mongoose";
import User from "@/lib/models/user";
import Contact from "@/lib/models/contact";
import Review from "@/lib/models/review";

// create review
export const POST = async (request: Request) => {
  try {
    // extract the request body from request
    const { rating, feedback, businessId, locationId, employeeId } =
      await request.json();

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
    const business = await User.findById(businessId);
    if (!business) {
      return new NextResponse(
        JSON.stringify({ message: "Business does not exist!" }),
        { status: 400 }
      );
    }

    // create the new review object
    const newReview = new Review({
      rating,
      feedback,
      location_id: new Types.ObjectId(locationId),
      employee_id: new Types.ObjectId(employeeId),
      business_id: new Types.ObjectId(business._id),
    });
    await newReview.save();

    return new NextResponse(
      JSON.stringify({
        message: "Review created successfully!",
        data: newReview,
      }),
      {
        status: 201,
      }
    );
  } catch (err) {
    return new NextResponse("Error in creating review " + err, {
      status: 500,
    });
  }
};
