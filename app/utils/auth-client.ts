import { createAuthClient } from "better-auth/vue"

// Ensure only one auth client instance. and run in client
const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
    baseURL: typeof window !== "undefined" ? window.location.origin : process.env.BETTER_AUTH_URL,
    fetchOptions: {
        // Cookies are "same-origin" relative to Nuxt
        credentials: "same-origin"
    }
})


export default authClient;