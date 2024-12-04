import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { Types } from "mongoose";
import Contact from "@/lib/models/contact";
import Business from "@/lib/models/business";

// create contact
export const POST = async (request: Request) => {
  try {
    // extract the request body from request
    const { firstName, lastName, email, businessId } = await request.json();

    // check if the businessId exist and is valid
    if (!businessId || !Types.ObjectId.isValid(businessId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid or missing businessId!" }),
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

    // create the new contact object
    const newContact = new Contact({
      first_name: firstName,
      last_name: lastName,
      email,
      business_id: new Types.ObjectId(business._id),
    });
    await newContact.save();

    return new NextResponse(
      JSON.stringify({
        message: "Contact created successfully!",
        data: newContact,
      }),
      {
        status: 201,
      }
    );
  } catch (err) {
    return new NextResponse("Error in creating contact " + err, {
      status: 500,
    });
  }
};
