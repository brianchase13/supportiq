import { autumnHandler } from "autumn-js/next";
import { auth } from "@/lib/auth";

export const { GET, POST } = autumnHandler({
  identify: async (request) => {
    try {
      // Get the user from Supabase Auth
      const cookieStore = request.cookies;
    const user = await auth.getUser(cookieStore);

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