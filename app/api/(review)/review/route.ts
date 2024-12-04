import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { Types } from "mongoose";
import Review from "@/lib/models/review";
import Business from "@/lib/models/business";
import Plan from "@/lib/models/plan";

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

    // load all plans
    await Plan.find({});

    // get business details from businessId
    const business = await Business.findById(businessId).populate({
      path: "plan_id",
      select: ["_id", "plan_id", "max_reviews"],
    });
    if (!business) {
      return new NextResponse(
        JSON.stringify({ message: "Business does not exist!" }),
        { status: 400 }
      );
    }

    // fetch all the reviews where businessId is equal to params business id
    const reviews = await Review.find({
      business_id: new Types.ObjectId(businessId),
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

    // load all plans
    await Plan.find({});

    // get business details from businessId
    const business = await Business.findById(businessId).populate({
      path: "plan_id",
      select: ["_id", "plan_id", "max_reviews"],
    });
    if (!business) {
      return new NextResponse(
        JSON.stringify({ message: "Business does not exist!" }),
        { status: 400 }
      );
    }

    // fetch all the reviews where businessId is equal to params business id
    const reviews = await Review.find({
      business_id: new Types.ObjectId(businessId),
    });

    if (reviews.length >= business.max_reviews) {
      return new NextResponse(
        JSON.stringify({
          message:
            "Your business has maxed out the free reviews. For more reviews please subscrbe to our plans!",
        }),
        { status: 400 }
      );
    }

    // create the new review object
    const newReview = new Review({
      rating,
      feedback: feedback ? feedback : null,
      location_id: locationId ? new Types.ObjectId(locationId) : null,
      employee_id: employeeId ? new Types.ObjectId(employeeId) : null,
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
