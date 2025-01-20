import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/db";
import { Types } from "mongoose";
import Business from "@/lib/models/business";

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

    // Save the file to the local disk
    const uploadsDir = path.join(process.cwd(), "/public/uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.name.replace(/\s/g, "-")}`;
    const filePath = path.join(uploadsDir, fileName);

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, fileBuffer);

    // Update the business with the new logo URL
    const logoUrl = `/uploads/${fileName}`;

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
