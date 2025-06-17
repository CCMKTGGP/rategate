import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { NextAuthOptions, Session } from "next-auth";
import { COLLECT_BUSINESS_NAME } from "@/constants/onboarding-constants";
import { splitFullName } from "@/utils/registerUtils";
import connect from "@/lib/db";
import User from "@/lib/models/user";

const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope: [
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
          ].join(" "),
          response: "code",
        },
      },
    }),
  ],
  secret: process.env.NEXT_AUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (account && user) {
        const { email } = user;
        // establish the connection with database
        await connect();

        // check if the user exists in the database
        const selectedUser = await User.findOne({ email });

        if (!selectedUser) {
          // sign up the user if they do not exist
          const { first_name, last_name } = splitFullName(user.name || "");
          // create the new user object
          const newUser = new User({
            first_name,
            last_name,
            email,
            is_verified: true,
            current_onboarding_step: COLLECT_BUSINESS_NAME,
          });
          await newUser.save();
        }
      }
      return true;
    },
    async jwt({ token, account, user }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
      }
      return token;
    },
  },
  pages: {
    error: "/auth/error",
  },
};

export interface EnrichedSession extends Session {
  provider: string;
  accessToken: string;
  refreshToken: string;
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
