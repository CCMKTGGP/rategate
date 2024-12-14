import connect from "@/lib/db";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { verificationEmailTemplate } from "@/utils/verificationEmailTempelate";
import { sendEmail } from "@/utils/sendEmail";
import { IBusiness } from "@/context/businessContext";
import Business from "@/lib/models/business";
import User from "@/lib/models/user";

function getVerificationToken(business: IBusiness): string {
  // Generate the token
  const verificationToken = crypto.randomBytes(20).toString("hex");

  // Hash the token
  business.verify_token = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  business.verify_token_expire = new Date(Date.now() + 30 * 60 * 1000);
  const numberOfRetries = business?.number_of_retries || 0;
  business.number_of_retries = numberOfRetries + 1;
  return verificationToken;
}

export const POST = async (request: Request) => {
  try {
    const { businessId, userId } = await request.json();

    // establish the connection with database
    await connect();

    // check if the user is already present or not
    const user = await User.findById(userId);
    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "User does not exist!" }),
        { status: 400 }
      );
    }

    // check if the business is already present or not
    const business = await Business.findById(businessId);
    if (!business) {
      return new NextResponse(
        JSON.stringify({ message: "Business does not exist!" }),
        { status: 400 }
      );
    }

    if (business.number_of_retries >= 5) {
      return new NextResponse(
        JSON.stringify({
          message:
            "You have maxed out the attemps to verify your email. Please write us an email at rategate.cc and we will get back to you!",
        }),
        { status: 400 }
      );
    }

    // generate a verification token for the business and save it in the database
    const verificationToken = getVerificationToken(business);
    await business.save();

    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-business-email?verifyToken=${verificationToken}&user_id=${user?._id}&business_id=${business?._id}`;
    const message = verificationEmailTemplate(verificationLink);
    // Send verification email
    await sendEmail(business?.email, "Email Verification", message);

    return new NextResponse(
      JSON.stringify({ message: "Email sent successfully!", data: business }),
      {
        status: 200,
      }
    );
  } catch (err) {
    return new NextResponse("Error in sending email " + err, { status: 500 });
  }
};
