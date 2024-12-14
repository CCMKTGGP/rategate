import { NextResponse } from "next/server";
import crypto from "crypto";
import connect from "@/lib/db";
import { Types } from "mongoose";
import Business from "@/lib/models/business";
import User from "@/lib/models/user";
import { BUSINESS_EMAIL_NOT_VERIFIED } from "@/constants/onboarding-constants";
import Plan from "@/lib/models/plan";
import { PlanTypes } from "@/utils/planTypes";
import { IBusiness } from "@/context/businessContext";
import { verificationEmailTemplate } from "@/utils/verificationEmailTempelate";
import { sendEmail } from "@/utils/sendEmail";

function getVerificationToken(Business: IBusiness): string {
  // Generate the token
  const verificationToken = crypto.randomBytes(20).toString("hex");

  // Hash the token
  Business.verify_token = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  Business.verify_token_expire = new Date(Date.now() + 30 * 60 * 1000);
  return verificationToken;
}

export const GET = async () => {
  try {
    // establish the connection with database
    await connect();

    // get all the businesses present in the database
    const businesses = await Business.find();

    // return them to frontend
    return new NextResponse(
      JSON.stringify({
        message: "Business fetched successfully!",
        data: businesses,
      }),
      { status: 200 }
    );
  } catch (err) {
    return new NextResponse("Error in fetching all businesses " + err, {
      status: 500,
    });
  }
};

// create new Business
export const POST = async (request: Request) => {
  try {
    // extract the request body from request
    const { userId, name, email, phoneNumber, platforms } =
      await request.json();

    // check if the userId exist and is valid
    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid or missing userId!" }),
        { status: 400 }
      );
    }

    // establish the database connection
    await connect();

    // check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "User does not exist!" }),
        { status: 400 }
      );
    }

    // check if the user is already registered in a business or not
    if (user.business_id) {
      return new NextResponse(
        JSON.stringify({ message: "User already has a business registered!" }),
        { status: 400 }
      );
    }

    // fetch all plans
    const plans = await Plan.find();

    const freePlan: any = plans.filter(
      (plan) => plan.plan_id === PlanTypes.BASIC.toLowerCase()
    );

    // create the new business object
    const newBusiness = new Business({
      name,
      email,
      phone_number: phoneNumber,
      platforms,
      plan_id: new Types.ObjectId(freePlan?.[0]?._id),
    });
    await newBusiness.save();

    // update the users table with the new business id
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      {
        business_id: new Types.ObjectId(newBusiness._id),
        current_onboarding_step: BUSINESS_EMAIL_NOT_VERIFIED,
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

    // generate a verification token for the user and save it in the database
    const verificationToken = getVerificationToken(newBusiness);
    await newBusiness.save();

    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-business-email?verifyToken=${verificationToken}&user_id=${user?._id}&business_id=${newBusiness?._id}`;
    const message = verificationEmailTemplate(verificationLink);

    // Send verification email
    await sendEmail(newBusiness?.email, "Email Verification", message);

    return new NextResponse(
      JSON.stringify({
        message: "Business created successfully!",
        data: newBusiness,
      }),
      {
        status: 201,
      }
    );
  } catch (err) {
    return new NextResponse("Error in creating business " + err, {
      status: 500,
    });
  }
};
