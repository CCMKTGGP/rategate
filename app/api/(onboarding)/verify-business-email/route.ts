import { NextResponse } from "next/server";
import crypto from "crypto";
import connect from "@/lib/db";
import User from "@/lib/models/user";
import { COLLECT_SURVEY } from "@/constants/onboarding-constants";
import Business from "@/lib/models/business";

export async function GET(reqeust: Request) {
  try {
    await connect();

    const { searchParams } = new URL(reqeust.url);
    const verificationToken = searchParams.get("verifyToken") as string;
    const userId = searchParams.get("user_id");
    const businessId = searchParams.get("business_id");

    if (!verificationToken || !businessId || !userId) {
      return NextResponse.json(
        { message: "Invalid or missing parameters" },
        { status: 400 }
      );
    }

    const verifyToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    const business = await Business.findOne({
      _id: businessId,
      verify_token: verifyToken,
      verify_token_expire: { $gt: new Date() },
    });

    const user = await User.findOne({ _id: userId });

    if (!business) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    business.is_email_verified = true;
    business.number_of_retries = undefined;
    business.verify_token = undefined;
    business.verify_token_expire = undefined;

    await business.save();

    // update the users table with the new business id
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      {
        current_onboarding_step: COLLECT_SURVEY,
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

    // redirect to the collect survey with business id
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/application/${user?._id}/collect-survey`
    );
  } catch (error) {
    return new NextResponse("Error in verify business " + error, {
      status: 500,
    });
  }
}
