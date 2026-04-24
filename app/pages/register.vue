<template>
    <div>
        <h2 class="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Create Account</h2>

        <UForm
            :validate="validateSignUp"
            :state="signUpModel"
            class="space-y-4"
            @submit="handleSignUp"
        >
            <UFormField label="Name" name="name" orientation="horizontal" class="w-72">
                <UInput v-model="signUpModel.name" placeholder="Your name" />
            </UFormField>

            <UFormField label="Email" name="email" orientation="horizontal" class="w-72">
                <UInput v-model="signUpModel.email" placeholder="Email" />
            </UFormField>

            <UFormField label="Password" name="password" orientation="horizontal" class="w-72">
                <UInput
                    v-model="signUpModel.password"
                    type="password"
                    placeholder="Password"
                />
            </UFormField>

            <UFormField label="Confirm Password" name="confirmPassword" orientation="horizontal" class="w-72">
                <UInput
                    v-model="signUpModel.confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                />
            </UFormField>

            <div class="mt-4">
                <UButton type="submit" color="primary" block :loading="loading"> Sign Up </UButton>
            </div>
        </UForm>

        <p class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?
            <NuxtLink to="/login" class="text-primary-500 hover:text-primary-600">Sign in</NuxtLink>
        </p>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

definePageMeta({
    layout: "auth",
});

const config = useRuntimeConfig();
if (config.public.allowRegistration !== 'true') {
    navigateTo('/');
}

const toast = useToast();
const loading = ref(false);

const signUpModel = reactive({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
});

const validateSignUp = (state: any) => {
    const errors = [];
    if (!state.name) errors.push({ path: "name", message: "Required" });
    if (!state.email) errors.push({ path: "email", message: "Required" });
    if (!state.password) errors.push({ path: "password", message: "Required" });
    if (state.password && state.password.length < 8) {
        errors.push({ path: "password", message: "Password must be at least 8 characters" });
    }
    if (state.password !== state.confirmPassword) {
        errors.push({ path: "confirmPassword", message: "Passwords do not match" });
    }
    return errors;
};

const handleSignUp = async () => {
    loading.value = true;
    try {
        const { error } = await authClient.signUp.email({
            email: signUpModel.email,
            password: signUpModel.password,
            name: signUpModel.name,
        });

        if (error) {
            toast.add({
                title: "Error",
                description: error.message || "Sign up failed",
                color: "warning",
            });
        } else {
            toast.add({ title: "Success", description: "Account created successfully" });
            navigateTo("/login");
        }
    } catch (err: any) {
        toast.add({
            title: "Error",
            description: err.message || "An unexpected error occurred",
            color: "warning",
        });
    } finally {
        loading.value = false;
    }
};
</script>
