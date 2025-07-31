import { NextResponse } from "next/server";
import slugify from "slugify";
import connect from "@/lib/db";
import { Types } from "mongoose";
import Business from "@/lib/models/business";
import User from "@/lib/models/user";
import PAYMENT_CONSTANTS from "@/utils/payments";
import Stripe from "stripe";
import { SUBSCRIPTION_TYPES } from "@/constants/subscription_types";
import Employee from "@/lib/models/employee";
import Location from "@/lib/models/location";

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!);

// get all employees for a location id
export const GET = async (request: Request) => {
  try {
    // extract the location id from the search params
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");

    // check if the locationId exist and is valid
    if (!locationId || !Types.ObjectId.isValid(locationId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid or missing locationId!" }),
        { status: 400 }
      );
    }
    // establish the connection with database
    await connect();

    // get all the employees present in the database for a location id
    const employees = await Employee.find({
      location_id: new Types.ObjectId(locationId),
    });

    // return them to frontend
    return new NextResponse(
      JSON.stringify({
        message: "Employees fetched successfully!",
        data: employees,
      }),
      { status: 200 }
    );
  } catch (err) {
    return new NextResponse("Error in fetching all employees " + err, {
      status: 500,
    });
  }
};

// create new employee for a location
export const POST = async (request: Request) => {
  try {
    // extract the request body from request
    const { userId, businessId, locationId, name, employeeId } =
      await request.json();

    // check if the userId exist and is valid
    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid or missing userId!" }),
        { status: 400 }
      );
    }

    // check if the businessId exist and is valid
    if (!businessId || !Types.ObjectId.isValid(businessId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid or missing businessId!" }),
        { status: 400 }
      );
    }

    // check if the locationId exist and is valid
    if (!locationId || !Types.ObjectId.isValid(locationId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid or missing locationId!" }),
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

    // check if the business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return new NextResponse(
        JSON.stringify({ message: "Business does not exist!" }),
        { status: 400 }
      );
    }

    // check if the location exists
    const location = await Location.findById(locationId);
    if (!location) {
      return new NextResponse(
        JSON.stringify({ message: "Location does not exist!" }),
        { status: 400 }
      );
    }

    // generate a unique slug for the employee name
    let newSlug = slugify(name, { lower: true, strict: true });
    let existingEmployeeWithSlugName = await Employee.find({ slug: newSlug });

    while (existingEmployeeWithSlugName.length > 0) {
      newSlug = `${slugify(name, {
        lower: true,
        strict: true,
      })}-${existingEmployeeWithSlugName.length + 1}`;
      existingEmployeeWithSlugName = await Employee.find({ slug: newSlug });
    }

    // create a one time payment subscription here.
    const priceId: string = process.env.STRIPE_PRICE_ID_EMPLOYEE as string;
    const mode: any = PAYMENT_CONSTANTS.SUBSCRIPTION_MODE as string;

    // Metadata for Checkout session
    const metadata: any = {
      data: JSON.stringify({
        type: SUBSCRIPTION_TYPES.ADD_EMPLOYEE,
        data: {
          name,
          employee_id: employeeId,
          total_reviews: 0,
          business_id: new Types.ObjectId(business._id),
          location_id: new Types.ObjectId(location._id),
          slug: newSlug,
        },
      }),
    };

    // Handle lifetime plan (one-time payment)
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode,
      customer_email: business.email,
      billing_address_collection: "required",
      allow_promotion_codes: true,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/application/${userId}/${businessId}/payment-success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/application/${userId}/${businessId}/dashboard/view-location/${locationId}/add-employee`,
      metadata,
    });

    return new NextResponse(
      JSON.stringify({
        message: "Url Created successfully!",
        data: { sessionUrl: session.url, metadata: metadata },
      }),
      {
        status: 200,
      }
    );
  } catch (err) {
    return new NextResponse("Error in creating location " + err, {
      status: 500,
    });
  }
};
