import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/db";
import { Types } from "mongoose";
import Business from "@/lib/models/business";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const POST = async (request: NextRequest) => {
  try {
    const formData = await request.formData();

    // extract the request body from request
    const file: any = formData.get("logo");
    const businessId = formData.get("businessId") as string;

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

    if (!file || !file?.name) {
      return new NextResponse(
        JSON.stringify({ message: "Logo file is required!" }),
        { status: 400 }
      );
    }

    // Convert the file to a Buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload the file to Cloudinary
    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "business_logos" }, // Specify the folder in Cloudinary
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        )
        .end(fileBuffer); // Pipe the buffer into Cloudinary's stream
    });

    // Extract the secure URL from Cloudinary
    const logoUrl = uploadResult.secure_url;

    // update the business
    const updatedBusiness = await Business.findOneAndUpdate(
      { _id: business._id },
      { logo_url: logoUrl },
      { new: true }
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
        message: "Logo Uploaded successfully!",
        data: updatedBusiness,
      }),
      {
        status: 200,
      }
    );
  } catch (err) {
    return new NextResponse("Error in upload file " + err, {
      status: 500,
    });
  }
};
