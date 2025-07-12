import { autumnHandler } from "autumn-js/next";
import { auth } from "@/lib/auth";

export const { GET, POST } = autumnHandler({
  identify: async (request) => {
    try {
      // Get the session from Better Auth
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user) {
        // Return null for unauthenticated users
        return null;
      }

      return {
        customerId: session.user.id,
        customerData: {
          name: session.user.name || session.user.email,
          email: session.user.email,
        },
      };
    } catch (error) {
      console.error("Error identifying user for Autumn:", error);
      return null;
    }
  },
});