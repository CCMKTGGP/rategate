import { NextResponse } from "next/server";
import connect from "@/lib/db";
import Business from "@/lib/models/business";
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
