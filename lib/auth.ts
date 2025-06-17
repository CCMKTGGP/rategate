import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { COLLECT_BUSINESS_NAME } from "@/constants/onboarding-constants";
import { splitFullName } from "@/utils/registerUtils";
import connect from "@/lib/db";
import User from "@/lib/models/user";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
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
        await connect();
        const selectedUser = await User.findOne({ email });

        if (!selectedUser) {
          const { first_name, last_name } = splitFullName(user.name || "");
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

export default authOptions;
