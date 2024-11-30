import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { Types } from "mongoose";
import Business from "@/lib/models/business";

type Params = Promise<{ businessId: string }>;

// get business details api
export const GET = async (request: Request, context: { params: Params }) => {
  try {
    const { businessId } = await context.params;

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
        JSON.stringify({
          message: "Business does not exist!",
        }),
        { status: 400 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        message: "Business Details fetched successfully!",
        data: business,
      }),
      { status: 200 }
    );
  } catch (err) {
    return new NextResponse("Error in fetching business " + err, {
      status: 500,
    });
  }
};

// update business api
export const PUT = async (request: Request, context: { params: Params }) => {
  try {
    const { businessId } = await context.params;
    // extract the fields from the request object
    const { data } = await request.json();

    // establish the connection with database
    await connect();

    // check if the businessId is valid
    if (!businessId || !Types.ObjectId.isValid(businessId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid or missing businessId!" }),
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

    // update the business
    const updatedBusiness = await Business.findOneAndUpdate(
      { _id: business._id },
      {
        ...data,
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

    return new NextResponse(
      JSON.stringify({
        message: "Business updated successfully!",
        data: updatedBusiness,
      }),
      {
        status: 200,
      }
    );
  } catch (err) {
    return new NextResponse("Error in updating business " + err, {
      status: 500,
    });
  }
};

// delete business api
export const DELETE = async (request: Request, context: { params: Params }) => {
  try {
    const { businessId } = await context.params;

    // establish the connection with database
    await connect();

    // check if the businessId is valid
    if (!businessId || !Types.ObjectId.isValid(businessId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid or missing businessId!" }),
        { status: 400 }
      );
    }

    // check if the Business exists in the database
    const business = await Business.findById(businessId);
    if (!business) {
      return new NextResponse(
        JSON.stringify({ message: "Business does not exist!" }),
        { status: 400 }
      );
    }

    const deleteBusiness = await Business.findByIdAndDelete({
      _id: business._id,
    });

    // check if the process successed
    if (!deleteBusiness) {
      return new NextResponse(
        JSON.stringify({ message: "Business not deleted!" }),
        { status: 400 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        message: `Business, ${business.name} has been deleted successfully!`,
      }),
      {
        status: 200,
      }
    );
  } catch (err) {
    return new NextResponse("Error in deleting business " + err, {
      status: 500,
    });
  }
};
