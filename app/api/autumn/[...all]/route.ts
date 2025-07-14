import { autumnHandler } from "autumn-js/next";
import { auth } from "@/lib/auth";

export const { GET, POST } = autumnHandler({
  identify: async (request) => {
    try {
      // Get the user from Supabase Auth
      const user = await auth.getUser();

      if (!user) {
        // Return null for unauthenticated users
        return null;
      }

      return {
        customerId: user.id,
        customerData: {
          name: user.user_metadata?.name || user.email,
          email: user.email,
        },
      };
    } catch (error) {
      console.error("Error identifying user for Autumn:", error);
      return null;
    }
  },
});