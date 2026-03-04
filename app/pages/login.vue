<template>
    <div>
        <h2 class="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">SSO Auth</h2>

        <UForm
            :validate="validateSignIn"
            :state="signInModel"
            class="space-y-4"
            @submit="handleSignIn"
        >
            <UFormField label="Email" name="email" orientation="horizontal" class="w-72">
                <UInput v-model="signInModel.email" placeholder="Email" />
            </UFormField>

            <UFormField label="Password" name="password" orientation="horizontal" class="w-72">
                <UInput
                    v-model="signInModel.password"
                    type="password"
                    placeholder="Password"
                />
            </UFormField>

            <div class="mt-4">
                <UButton type="submit" color="primary" block :loading="loading"> Sign In </UButton>
            </div>
        </UForm>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

definePageMeta({
    layout: "auth",
});

const toast = useToast();
const loading = ref(false);

// Sign In Logic
const signInModel = reactive({
    email: "",
    password: "",
});

const validateSignIn = (state: any) => {
    const errors = [];
    if (!state.email) errors.push({ path: "email", message: "Required" });
    if (!state.password) errors.push({ path: "password", message: "Required" });
    return errors;
};

const handleSignIn = async () => {
    loading.value = true;
    try {
        const { error } = await authClient.signIn.email({
            email: signInModel.email,
            password: signInModel.password,
        });

        if (error) {
            toast.add({
                title: "Error",
                description: error.message || "Sign in failed",
                color: "warning",
            });
        } else {
            toast.add({ title: "Success", description: "Sign in successful" });
            navigateTo("/admin/users"); // Redirect to admin dashboard
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
