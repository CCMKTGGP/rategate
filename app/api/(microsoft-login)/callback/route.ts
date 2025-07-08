import { COLLECT_BUSINESS_NAME } from "@/constants/onboarding-constants";
import connect from "@/lib/db";
import { msalConfig } from "@/lib/microsoftClient";
import Plan from "@/lib/models/plan";
import User from "@/lib/models/user";
import { splitFullName } from "@/utils/registerUtils";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { NextRequest, NextResponse } from "next/server";

const cca = new ConfidentialClientApplication(msalConfig);

export async function GET(req: NextRequest) {
  const code: string = req.nextUrl.searchParams.get("code") as string;

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/auth/error?error=user denied access!`
    );
  }
  try {
    // get the user details from the code
    const result = await cca.acquireTokenByCode({
      code,
      scopes: ["User.Read"],
      redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/callback`,
    });

    // extract the name, email, access token and expiry from result
    const { account } = result;

    console.log("account", account);

    // establish the connection with database
    await connect();

    // load all plans
    await Plan.find({});

    const selectedUser = await User.findOne({ email: account?.username });

    if (!selectedUser) {
      const { first_name, last_name } = splitFullName(account?.name || "");
      const newUser = new User({
        first_name,
        last_name,
        email: account?.username,
        is_verified: true,
        current_onboarding_step: COLLECT_BUSINESS_NAME,
      });
      await newUser.save();
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/auth/microsoft-redirect?email=${account?.username}`
    );
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({
        message: error.message,
      }),
      { status: 500 }
    );
  }
}
