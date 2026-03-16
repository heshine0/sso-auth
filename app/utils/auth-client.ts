import { createAuthClient } from "better-auth/vue"
import { adminClient } from "better-auth/client/plugins"

// Ensure only one auth client instance. and run in client
const authClient = createAuthClient({
    baseURL: typeof window !== "undefined" ? window.location.origin : process.env.BETTER_AUTH_URL,
    fetchOptions: {
        // Cookies are "same-origin" relative to Nuxt
        credentials: "same-origin"
    },
    plugins: [
        adminClient()
    ]
})


export default authClient;