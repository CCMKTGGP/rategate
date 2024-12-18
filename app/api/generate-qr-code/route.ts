import { NextResponse } from "next/server";
import QRCode from "qrcode";

// create qr code
export const POST = async (request: Request) => {
  try {
    // extract the request body from request
    const { data } = await request.json();

    // check if the request body exists
    if (!data) {
      return new NextResponse(
        JSON.stringify({ message: "Data is required to generate QR code!" }),
        { status: 400 }
      );
    }

    // Generate QR Code as a base64 string
    const qrCodeUrl = await QRCode.toDataURL(data);

    return new NextResponse(
      JSON.stringify({
        message: "QR code generated and saved successfully",
        data: { qrCodeUrl },
      }),
      {
        status: 201,
      }
    );
  } catch (err) {
    return new NextResponse("Error in generating qr code " + err, {
      status: 500,
    });
  }
};
