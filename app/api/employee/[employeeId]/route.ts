import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { Types } from "mongoose";
import Stripe from "stripe";
import Employee from "@/lib/models/employee";
import Location from "@/lib/models/location";

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!);

type Params = Promise<{ employeeId: string }>;

// get employee details api
export const GET = async (request: Request, context: { params: Params }) => {
  try {
    const { employeeId } = await context.params;

    // check if the employeeId exist and is valid
    if (!employeeId || !Types.ObjectId.isValid(employeeId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid or missing employeeId!" }),
        { status: 400 }
      );
    }

    // establish the database connection
    await connect();

    // get employee details from employeeId
    const employee = await Employee.findById(employeeId);

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

// update employee api
export const PUT = async (request: Request, context: { params: Params }) => {
  try {
    const { employeeId } = await context.params;
    // extract the fields from the request object
    const { data } = await request.json();
    // establish the connection with database
    await connect();

    // check if the employeeId is valid
    if (!employeeId || !Types.ObjectId.isValid(employeeId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid or missing employeeId!" }),
        { status: 400 }
      );
    }

    // check if the employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return new NextResponse(
        JSON.stringify({ message: "Employee does not exist!" }),
        { status: 400 }
      );
    }

    // update the employee
    const updatedEmployee = await Employee.findOneAndUpdate(
      { _id: employee._id },
      {
        ...data,
      },
      {
        new: true,
      }
    );

    // check if the process successed
    if (!updatedEmployee) {
      return new NextResponse(
        JSON.stringify({ message: "Employee not updated!" }),
        { status: 400 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        message: "Employee updated successfully!",
        data: updatedEmployee,
      }),
      {
        status: 200,
      }
    );
  } catch (err) {
    return new NextResponse("Error in updating employee " + err, {
      status: 500,
    });
  }
};

// delete employee api
export const DELETE = async (request: Request, context: { params: Params }) => {
  try {
    const { employeeId } = await context.params;
    const { locationId } = await request.json();

    // establish the connection with database
    await connect();

    // check if the employeeId is valid
    if (!employeeId || !Types.ObjectId.isValid(employeeId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid or missing employeeId!" }),
        { status: 400 }
      );
    }

    // check if the locationId is valid
    if (!locationId || !Types.ObjectId.isValid(locationId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid or missing locationId!" }),
        { status: 400 }
      );
    }

    // check if the Employee exists in the database
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return new NextResponse(
        JSON.stringify({ message: "Employee does not exist!" }),
        { status: 400 }
      );
    }

    // check if the Location exists in the database
    const location = await Location.findById(locationId);
    if (!location) {
      return new NextResponse(
        JSON.stringify({ message: "Location does not exist!" }),
        { status: 400 }
      );
    }

    // cancel subscription flow
    try {
      // Cancel the Stripe subscription
      await stripe.subscriptions.cancel(employee.employee_subscription_id);
      employee.employee_subscription_id = null;

      // decrease the count of total members from the location.
      location.total_members -= 1;

      // save the location
      await location.save();
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ message: "Failed to cancel subscription!" }),
        { status: 500 }
      );
    }

    const deleteEmployee = await Employee.findByIdAndDelete({
      _id: employee._id,
    });

    // check if the process successed
    if (!deleteEmployee) {
      return new NextResponse(
        JSON.stringify({ message: "Employee not deleted!" }),
        { status: 400 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        message: `Employee, ${employee.name} has been deleted successfully!`,
      }),
      {
        status: 200,
      }
    );
  } catch (err) {
    return new NextResponse("Error in deleting employee " + err, {
      status: 500,
    });
  }
};
