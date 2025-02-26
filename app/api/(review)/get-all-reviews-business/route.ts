import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { Types } from "mongoose";
import Review from "@/lib/models/review";
import Business from "@/lib/models/business";
import Location from "@/lib/models/location";
import Employee from "@/lib/models/employee";

// get all reviews for a business.
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

    // establish the database connection
    await connect();

    // get business details from businessId
    const business = await Business.findById(businessId);
    if (!business) {
      return new NextResponse(
        JSON.stringify({ message: "Business does not exist!" }),
        { status: 400 }
      );
    }

    // load all locations
    await Location.find({});

    // load all employees
    await Employee.find({});

    // fetch all the reviews where businessId is equal to params business id
    const reviews = await Review.find({
      business_id: new Types.ObjectId(businessId),
    })
      .populate({
        path: "business_id",
        select: ["_id", "name"],
      })
      .populate({
        path: "location_id",
        select: ["_id", "name"],
      })
      .populate({
        path: "employee_id",
        select: ["_id", "name"],
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
