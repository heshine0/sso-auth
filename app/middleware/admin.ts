import authClient from "~/utils/auth-client"

export default defineNuxtRouteMiddleware(async (to, from) => {
    const { data: session } = await authClient.useSession(useFetch)

    if (!session.value) {
        return navigateTo('/login')
    }

    if (session.value.user.role !== 'admin') {
        return navigateTo('/')
    }
})
