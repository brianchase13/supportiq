import { betterAuth } from "better-auth"

export const auth = betterAuth({
  database: {
    provider: "sqlite",
    url: "./database.sqlite" // Simple SQLite for demo
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
  },
  plugins: [
    // Add plugins here when they become available
  ],
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.User