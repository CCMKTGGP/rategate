import { getMsalClient } from "@/lib/microsoftClient";
import { NextResponse } from "next/server";

export async function GET() {
  const authority = `https://login.microsoftonline.com/common/`;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/callback`;

  // Generate an authorization URL for the user to log in
  const authUrl = await getMsalClient().getAuthCodeUrl({
    scopes: ["User.Read"],
    redirectUri,
    authority,
  });

  // return NextResponse.redirect(authUrl);
  return new NextResponse(
    JSON.stringify(
      {
        message: "Login url fetched successfully!",
        data: authUrl,
      },
      null,
      4
    ),
    {
      status: 200,
    }
  );
}
