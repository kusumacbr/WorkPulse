import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins/organization";
import { passkeyPlugin } from "./passkey-plugin";
import { prisma } from "../db/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    resetPassword: {
      enabled: true,
      sendResetEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
        console.log(`[Auth] Password reset link for ${user.email}: ${url}`);
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "mock-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-client-secret",
      prompt: "select_account",
    },
  },
  user: {
    additionalFields: {
      status: {
        type: "string",
        defaultValue: "ACTIVE",
      },
    },
    changeEmail: {
      enabled: true,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  plugins: [
    passkeyPlugin({
      rpID: process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost",
      rpName: "WorkPulse - Xorstack",
      origin: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    }),
    organization(),
  ],
  callbacks: {
    async onUserCreated({ user }: { user: { email?: string } }) {
      if (user.email && !user.email.endsWith("@xorstack.com")) {
        console.warn(`[Auth Warning] Non-xorstack email registered: ${user.email}`);
      }
    },
  },
});
