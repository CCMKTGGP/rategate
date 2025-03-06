import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { Types } from "mongoose";
import Stripe from "stripe";
import Employee from "@/lib/models/employee";

type Params = Promise<{ employeeSlug: string }>;

// get employee details api from slug
export const GET = async (request: Request, context: { params: Params }) => {
  try {
    const { employeeSlug } = await context.params;

    // check if the employeeSlug exist
    if (!employeeSlug) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid employee slug!" }),
        { status: 400 }
      );
    }

    // establish the database connection
    await connect();

    // get employee details from employeeSlug
    const employee = await Employee.findOne({ slug: employeeSlug });

    if (!employee) {
      return new NextResponse(
        JSON.stringify({
          message: "Employee does not exist!",
        }),
        { status: 400 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        message: "Employee Details fetched successfully!",
        data: employee,
      }),
      { status: 200 }
    );
  } catch (err) {
    return new NextResponse("Error in fetching employee " + err, {
      status: 500,
    });
  }
};
