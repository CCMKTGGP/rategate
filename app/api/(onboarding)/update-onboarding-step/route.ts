import connect from "@/lib/db";
import Business from "@/lib/models/business";
import User from "@/lib/models/user";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  try {
    // extract the request body from request
    const { userId, businessId, onboardingStep } = await request.json();

    // check if the businessId exist and is valid
    if (!businessId || !Types.ObjectId.isValid(businessId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid or missing businessId!" }),
        { status: 400 }
      );
    }

    // check if the userId exist and is valid
    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid or missing userId!" }),
        { status: 400 }
      );
    }

    // establish the database connection
    await connect();

    // check if the business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return new NextResponse(
        JSON.stringify({ message: "Business does not exist!" }),
        { status: 400 }
      );
    }

    // check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "User does not exist!" }),
        { status: 400 }
      );
    }

    // update the users table with the new business id
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      {
        current_onboarding_step: onboardingStep,
      },
      {
        new: true,
      }
    );

    // check if the process successed
    if (!updatedUser) {
      return new NextResponse(
        JSON.stringify({ message: "User not updated!" }),
        { status: 400 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        message: "Onboarding Step updated!",
        data: user,
      }),
      {
        status: 201,
      }
    );
  } catch (err) {
    return new NextResponse("Error in updating onboarding step " + err, {
      status: 500,
    });
  }
};
