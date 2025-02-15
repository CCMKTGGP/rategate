import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { Types } from "mongoose";
import Business from "@/lib/models/business";
import Plan from "@/lib/models/plan";
import Review from "@/lib/models/review";

type Params = Promise<{ businessSlug: string }>;

// get business details api from business slug
export const GET = async (request: Request, context: { params: Params }) => {
  try {
    const { businessSlug } = await context.params;

    // check if the businessSlug exist
    if (!businessSlug) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid business slug!" }),
        { status: 400 }
      );
    }

    // establish the database connection
    await connect();

    // load all plans
    await Plan.find({});

    // get business details from businessSlug
    const business = await Business.findOne({ slug: businessSlug }).populate({
      path: "plan_id",
      select: ["_id", "plan_id", "max_reviews", "max_locations"],
    });

    if (!business) {
      return new NextResponse(
        JSON.stringify({
          message: "Business does not exist!",
        }),
        { status: 400 }
      );
    }

    let is_allowed_to_review = true;
    // check if the business has reached the maximum number of reviews
    // fetch all the reviews where businessId is equal to params business id
    const reviews = await Review.find({
      business_id: new Types.ObjectId(business.businessId),
    });

    if (
      business.plan_id.max_reviews &&
      reviews.length >= business.plan_id.max_reviews
    ) {
      is_allowed_to_review = false;
    }

    return new NextResponse(
      JSON.stringify({
        message: "Business Details fetched successfully!",
        data: { business, is_allowed_to_review },
      }),
      { status: 200 }
    );
  } catch (err) {
    return new NextResponse("Error in fetching business " + err, {
      status: 500,
    });
  }
};
