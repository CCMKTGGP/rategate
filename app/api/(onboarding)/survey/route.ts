import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { Types } from "mongoose";
import User from "@/lib/models/user";
import Survey from "@/lib/models/survey";
import Business from "@/lib/models/business";

export const GET = async () => {
  try {
    // establish the connection with database
    await connect();

    // get all the servey present in the database
    const survey = await Survey.find();

    // return them to frontend
    return new NextResponse(
      JSON.stringify({
        message: "All survey fetched successfully!",
        data: survey,
      }),
      { status: 200 }
    );
  } catch (err) {
    return new NextResponse("Error in fetching all survey " + err, {
      status: 500,
    });
  }
};

// create new survey
export const POST = async (request: Request) => {
  try {
    // extract the request body from request
    const {
      userId,
      businessId,
      hearFrom,
      currentFeedbackCollection,
      feedbackFrequency,
    } = await request.json();

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

    // create the new survey object
    const newSurvey = new Survey({
      hear_from: hearFrom,
      current_feedback_collection: currentFeedbackCollection,
      feedback_frequency: feedbackFrequency,
      business_id: new Types.ObjectId(businessId),
    });
    await newSurvey.save();

    // update the users table with the new business id
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      {
        business_id: new Types.ObjectId(businessId),
        current_onboarding_step: null,
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
        message: "Survey created successfully!",
        data: newSurvey,
      }),
      {
        status: 201,
      }
    );
  } catch (err) {
    return new NextResponse("Error in creating survey " + err, {
      status: 500,
    });
  }
};
