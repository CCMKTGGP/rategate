import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { Types } from "mongoose";
import Review from "@/lib/models/review";
import Business from "@/lib/models/business";
import Plan from "@/lib/models/plan";
import Location from "@/lib/models/location";

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
    const { rating, feedback, businessId, locationId, employeeId, platform } =
      await request.json();

    // check if the businessId exist and is valid
    if (!businessId || !Types.ObjectId.isValid(businessId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid or missing businessId!" }),
        { status: 400 }
      );
    }

    // check if locationId exist if yes then check if it is valid
    if (locationId && !Types.ObjectId.isValid(locationId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid locationId!" }),
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

    // if no location id exists then update the platform of the business
    if (!locationId) {
      // loop through all the platforms of the business
      const updatedPlatforms = business.platforms.map((p: any) => {
        if (p.id === platform.id) {
          p.total_reviews += 1;
          return p;
        }
        return p;
      });
      // update the users table with the new business id
      const updatedBusiness = await Business.findOneAndUpdate(
        { _id: businessId },
        {
          platforms: updatedPlatforms,
        },
        {
          new: true,
        }
      );

      // check if the process successed
      if (!updatedBusiness) {
        return new NextResponse(
          JSON.stringify({ message: "Business not updated!" }),
          { status: 400 }
        );
      }
    }

    // if the review is for a location than update the total reviews for the provider of the location
    if (locationId) {
      // find if the location exists in our database
      const location = await Location.findById(locationId);
      if (!location) {
        return new NextResponse(
          JSON.stringify({ message: "Location does not exist!" }),
          { status: 400 }
        );
      }
      // loop through all the platforms of the location
      const updatedPlatforms = location.platforms.map((p: any) => {
        if (p.id === platform.id) {
          p.total_reviews += 1;
          return p;
        }
        return p;
      });
      // update the users table with the new business id
      const updatedLocation = await Location.findOneAndUpdate(
        { _id: locationId },
        {
          platforms: updatedPlatforms,
          total_reviews: location.total_reviews + 1,
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
    }

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
