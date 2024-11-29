import { NextResponse } from "next/server";
import crypto from "crypto";
import connect from "@/lib/db";
import User from "@/lib/models/user";

export async function GET(reqeust: Request) {
  try {
    await connect();

    const { searchParams } = new URL(reqeust.url);
    const verificationToken = searchParams.get("verifyToken") as string;
    const userId = searchParams.get("id");

    if (!verificationToken || !userId) {
      return NextResponse.json(
        { message: "Invalid or missing parameters" },
        { status: 400 }
      );
    }

    const verifyToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    const user = await User.findOne({
      _id: userId,
      verify_token: verifyToken,
      verify_token_expire: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    user.is_verified = true;
    user.number_of_retries = undefined;
    user.verify_token = undefined;
    user.verify_token_expire = undefined;

    await user.save();

    // redirect to the calendar dashboard with user id
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/application/${user?._id}/onboarding`
    );
  } catch (error) {
    return new NextResponse("Error in verify user " + error, { status: 500 });
  }
}
