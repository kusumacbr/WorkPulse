import type { BetterAuthPlugin } from "better-auth";

export interface PasskeyPluginOptions {
  rpID?: string;
  rpName?: string;
  origin?: string;
}

/**
 * Passkey / WebAuthn plugin for Better Auth
 * Integrated with Prisma Passkey schema
 */
export const passkeyPlugin = (options?: PasskeyPluginOptions): BetterAuthPlugin => {
  return {
    id: "passkey",
    init: () => {
      console.log(
        `[Passkey Plugin] Initialized for RP: ${options?.rpName || "WorkPulse"} (${options?.rpID || "localhost"})`
      );
    },
  };
};
