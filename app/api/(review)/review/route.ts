import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { Types } from "mongoose";
import Review from "@/lib/models/review";
import Business from "@/lib/models/business";
import Plan from "@/lib/models/plan";
import Location from "@/lib/models/location";
import Employee from "@/lib/models/employee";

// create review
export const POST = async (request: Request) => {
  try {
    // extract the request body from request
    const {
      rating,
      feedback,
      businessId,
      locationId,
      employeeId,
      platform,
      type,
    } = await request.json();

    // check if the businessId exist and is valid
    if (!businessId || !Types.ObjectId.isValid(businessId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid or missing businessId!" }),
        { status: 400 }
      );
    }

    // check if locationId exist if yes then check if it is valid
    if (locationId && !Types.ObjectId.isValid(locationId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid locationId!" }),
        { status: 400 }
      );
    }
    // check if employeeId exist if yes then check if it is valid
    if (employeeId && !Types.ObjectId.isValid(employeeId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid employeeId!" }),
        { status: 400 }
      );
    }

    // establish the database connection
    await connect();

    // load all plans
    await Plan.find({});

    // get business details from businessId
    const business = await Business.findById(businessId).populate({
      path: "plan_id",
      select: ["_id", "plan_id", "max_reviews"],
    });
    if (!business) {
      return new NextResponse(
        JSON.stringify({ message: "Business does not exist!" }),
        { status: 400 }
      );
    }

    // fetch all the reviews where businessId is equal to params business id
    const reviews = await Review.find({
      business_id: new Types.ObjectId(businessId),
    });

    if (reviews.length >= business.max_reviews) {
      return new NextResponse(
        JSON.stringify({
          message:
            "Your business has maxed out the free reviews. For more reviews please subscrbe to our plans!",
        }),
        { status: 400 }
      );
    }

    // create the new review object
    const newReview = new Review({
      rating,
      type,
      provider:
        platform && Object.keys(platform).length > 0 ? platform.name : null,
      feedback: feedback ? feedback : null,
      location_id: locationId ? new Types.ObjectId(locationId) : null,
      employee_id: employeeId ? new Types.ObjectId(employeeId) : null,
      business_id: new Types.ObjectId(business._id),
    });
    await newReview.save();

    // if no location id exists then update the platform of the business
    if (!locationId && !feedback) {
      // loop through all the platforms of the business
      const updatedPlatforms = business.platforms.map((p: any) => {
        if (p.id === platform.id) {
          p.total_reviews += 1;
          return p;
        }
        return p;
      });
      // update the users table with the new business id
      const updatedBusiness = await Business.findOneAndUpdate(
        { _id: businessId },
        {
          platforms: updatedPlatforms,
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
    }

    // if the review is for a location than update the total reviews for the provider of the location
    if (locationId) {
      // find if the location exists in our database
      const location = await Location.findById(locationId);
      if (!location) {
        return new NextResponse(
          JSON.stringify({ message: "Location does not exist!" }),
          { status: 400 }
        );
      }
      let locationUpdateData = {};
      locationUpdateData = {
        total_reviews: location.total_reviews + 1,
      };

      if (!feedback) {
        // loop through all the platforms of the location
        const updatedPlatforms = location.platforms.map((p: any) => {
          if (p.id === platform.id) {
            p.total_reviews += 1;
            return p;
          }
          return p;
        });
        locationUpdateData = {
          ...locationUpdateData,
          platforms: updatedPlatforms,
        };
      }
      // update the location table with the total reviews for the provider of the location
      const updatedLocation = await Location.findOneAndUpdate(
        { _id: locationId },
        {
          ...locationUpdateData,
        },
        {
          new: true,
        }
      );

      // check if the process successed
      if (!updatedLocation) {
        return new NextResponse(
          JSON.stringify({ message: "Location not updated!" }),
          { status: 400 }
        );
      }
    }

    if (employeeId) {
      // find if the employee exists in our database
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return new NextResponse(
          JSON.stringify({ message: "Employee does not exist!" }),
          { status: 400 }
        );
      }
      // update the employee table with the total reviews of the employee
      const updatedEmployee = await Employee.findOneAndUpdate(
        { _id: employeeId },
        {
          total_reviews: employee.total_reviews + 1,
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
    }

    return new NextResponse(
      JSON.stringify({
        message: "Review created successfully!",
        data: newReview,
      }),
      {
        status: 201,
      }
    );
  } catch (err) {
    return new NextResponse("Error in creating review " + err, {
      status: 500,
    });
  }
};
