import { NextResponse } from "next/server";
import slugify from "slugify";
import crypto from "crypto";
import * as bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connect from "@/lib/db";
import User from "@/lib/models/user";
import { cookies } from "next/headers";
import { verificationEmailTemplate } from "@/utils/verificationEmailTempelate";
import { sendEmail } from "@/utils/sendEmail";
import { IUser } from "@/context/userContext";
import Plan from "@/lib/models/plan";
import { PlanTypes } from "@/utils/planTypes";
import Business from "@/lib/models/business";
import { Types } from "mongoose";

function getVerificationToken(user: IUser): string {
  // Generate the token
  const verificationToken = crypto.randomBytes(20).toString("hex");

  // Hash the token
  user.verify_token = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  user.verify_token_expire = new Date(Date.now() + 30 * 60 * 1000);
  return verificationToken;
}

export const POST = async (request: Request) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      businessName,
      businessPhoneNumber,
    } = await request.json();

    // encrypt the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    // establish the connection with database
    await connect();

    // check if the user is already present or not
    const user = await User.findOne({ email });
    if (user) {
      return new NextResponse(
        JSON.stringify({
          message: "User already present with this email. Please try Login!",
        }),
        { status: 400 }
      );
    }

    // fetch all plans
    const plans = await Plan.find();

    const freePlan: any = plans.filter(
      (plan) => plan.plan_id === PlanTypes.BASIC.toLowerCase()
    );

    // generate a unique slug for the business name
    let newSlug = slugify(businessName, { lower: true, strict: true });
    let existingBusinessWithSlugName = await Business.find({ slug: newSlug });

    while (existingBusinessWithSlugName.length > 0) {
      newSlug = `${slugify(businessName, {
        lower: true,
        strict: true,
      })}-${existingBusinessWithSlugName.length + 1}`;
      existingBusinessWithSlugName = await Business.find({ slug: newSlug });
    }

    // create the new business object
    const newBusiness = new Business({
      name: businessName,
      email,
      phone_number: businessPhoneNumber,
      plan_id: new Types.ObjectId(freePlan?.[0]?._id),
      slug: newSlug,
    });
    await newBusiness.save();

    // create the new user object
    const newUser = new User({
      first_name: firstName,
      last_name: lastName,
      email,
      password: hashedPassword,
      number_of_retries: 0,
      business_id: new Types.ObjectId(newBusiness._id),
    });

    // generate a verification token for the user and save it in the database
    const verificationToken = getVerificationToken(newUser);
    await newUser.save();

    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-email?verifyToken=${verificationToken}&id=${newUser?._id}`;
    const message = verificationEmailTemplate(verificationLink);
    // Send verification email
    await sendEmail(newUser?.email, "Email Verification", message);

    // create a jwt token and send it as a resppnse
    const token = jwt.sign({ newUser }, process.env.TOKEN_SECRET || "sign");

    const response = { ...newUser?._doc, token };

    (await cookies()).set({
      name: "userData",
      value: JSON.stringify(response),
      httpOnly: true,
      path: "/",
    });

    return new NextResponse(
      JSON.stringify({
        message: "User created successfully!",
        data: { user: response, business: newBusiness },
      }),
      {
        status: 201,
      }
    );
  } catch (err) {
    return new NextResponse("Error in creating users " + err, { status: 500 });
  }
};
