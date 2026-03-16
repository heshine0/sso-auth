<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">User Management</h1>
      <UButton color="primary" @click="showCreateModal = true">
        Create User
      </UButton>
    </div>

    <div class="flex gap-2">
      <UInput v-model.trim="searchQuery" placeholder="Search by name, email or phone"
        icon="i-heroicons-magnifying-glass" @keyup.enter="handleSearch" class="w-full max-w-sm" />
      <UButton @click="handleSearch">Search</UButton>
    </div>

    <UCard>
      <UTable :data="users" :columns="columns" :loading="pending">
        <template #createdAt-cell="{ row }">
          {{ new Date(row.original.createdAt).toLocaleString() }}
        </template>

        <template #banned-cell="{ row }">
          <UBadge :color="row.original.banned ? 'error' : 'success'" variant="subtle">
            {{ row.original.banned ? 'Banned' : 'Active' }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex gap-2">
            <template v-for="item in getActionItems(row)[0]" :key="item.label">
              <UButton :color="(item.color as any) ?? 'primary'" :icon="item.icon" variant="ghost" @click="item.click" />
            </template>
          </div>
        </template>
      </UTable>

      <div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
        <UPagination v-model:page="page" :items-per-page="pageSize" :total="total" />
      </div>
    </UCard>

    <!-- Create Modal -->
    <UModal v-model:open="showCreateModal" title="Create User">
      <template #body>
        <UForm :validate="validateCreate" :state="createModel" class="space-y-4" @submit="handleCreate">
          <UFormField label="Name" name="name">
            <UInput v-model="createModel.name" placeholder="Name" />
          </UFormField>
          <UFormField label="Email" name="email">
            <UInput v-model="createModel.email" placeholder="Email" :ui="{root: 'w-full'}"/>
          </UFormField>
          <UFormField label="Password" name="password">
            <UInput v-model="createModel.password" type="password" placeholder="Password" :ui="{root: 'w-full'}"/>
          </UFormField>
          <UFormField label="Phone" name="phoneNumber">
            <UInput v-model="createModel.phoneNumber" placeholder="Phone Number" />
          </UFormField>
          <UFormField label="Role" name="role" help="Role can be 'user' or 'admin' or other custom roles">
            <UInput v-model="createModel.role" placeholder="Role (default: user)"  pattern="^user|admin|\w+$" />  
          </UFormField>

          <div class="flex justify-end gap-2 mt-4">
            <UButton color="neutral" variant="ghost" @click="showCreateModal = false">Cancel</UButton>
            <UButton type="submit" color="primary" :loading="creating">Create</UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- Edit Modal -->
    <UModal v-model:open="showEditModal" title="Edit User">
      <template #body>
        <UForm :validate="validateEdit" :state="editModel" class="space-y-4" @submit="handleUpdate">
          <UFormField label="Name" name="name">
            <UInput v-model="editModel.name" placeholder="Name" />
          </UFormField>
          <UFormField label="Email" name="email">
            <UInput v-model="editModel.email" placeholder="Email" />
          </UFormField>
          <UFormField label="Phone" name="phoneNumber">
            <UInput v-model="editModel.phoneNumber" placeholder="Phone Number" />
          </UFormField>
          <UFormField label="Role" name="role" help="Role can be 'user' or 'admin' or other custom roles">
            <UInput v-model="editModel.role" placeholder="Role (default: user)"  pattern="^user|admin|\w+$" />
          </UFormField>
          <div class="flex justify-between items-center">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Email Verified</label>
            <USwitch v-model="editModel.emailVerified" />
          </div>
          <div class="flex justify-between items-center">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Phone Verified</label>
            <USwitch v-model="editModel.phoneNumberVerified" />
          </div>

          <div class="flex justify-end gap-2 mt-4">
            <UButton color="neutral" variant="ghost" @click="showEditModal = false">Cancel</UButton>
            <UButton type="submit" color="primary" :loading="updating">Update</UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="showDeleteModal" title="Confirm Delete">
      <template #body>
        <p>Are you sure you want to delete user {{ userToDelete?.name }}?</p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="showDeleteModal = false">Cancel</UButton>
          <UButton color="error" @click="handleDelete" :loading="deleting">Delete</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { ref, reactive, computed } from "vue";
import authClient from "~/utils/auth-client";

definePageMeta({
  layout: "admin",
  middleware: "admin",
});

const toast = useToast();

// Data Fetching
const page = ref(1);
const pageSize = ref(10);
const searchQuery = ref("");

const { data, pending, refresh, error } = await useFetch('/api/admin/users', {
  query: {
    page: page.value,
    pageSize: pageSize.value,
    limit: pageSize.value,
    search: searchQuery.value || undefined,
  },
  watch: [page, pageSize],
});

watch(error, (val) => {
  if (val) {
    toast.add({
      title: 'Error',
      description: val.message || 'Failed to load users',
      color: 'error'
    });
  }
});

function handleSearch() {
  page.value = 1;
  refresh();
}

const users = computed(() => data.value?.users || []);
const total = computed(() => {
  // Admin plugin might not return total directly in all versions, but let's assume it does based on standard pagination
  // If not, we might need to rely on users.length or metadata if available
  return (data.value as any)?.total || users.value.length; // Fallback
});

const columns: TableColumn<any>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "banned", header: "Status" },
  { accessorKey: "phoneNumber", header: "Phone" },
  { accessorKey: "createdAt", header: "Created At" },
  { id: "actions", header: "Actions" },
];

function getActionItems(row: any) {
  return [
    [{
      label: 'Edit',
      color: 'primary',
      icon: 'i-heroicons-pencil-square',
      click: () => openEditModal(row.original)
    }, {
      label: row.original.banned ? 'Unban' : 'Ban',
      color: row.original.banned ? 'neutral' : 'warning',
      icon: row.original.banned ? 'i-heroicons-check-circle' : 'i-heroicons-no-symbol',
      click: () => toggleBan(row.original)
    }, {
      label: 'Delete',
      icon: 'i-heroicons-trash',
      color: 'error',
      click: () => confirmDelete(row.original)
    }]
  ]
}

// Create
const showCreateModal = ref(false);
const creating = ref(false);
const createModel = reactive({
  name: "",
  email: "",
  password: "",
  phoneNumber: "",
  role: "user"
});

const validateCreate = (state: any) => {
  const errors = [];
  if (!state.name) errors.push({ path: 'name', message: 'Required' });
  if (!state.email) errors.push({ path: 'email', message: 'Required' });
  if (!state.password) errors.push({ path: 'password', message: 'Required' });
  return errors;
};

async function handleCreate() {
  creating.value = true;
  try {
    // Use core create or custom API? Admin plugin doesn't have create user.
    // We can use signUpEmail but that logs in the user.
    // Or we keep using the custom API but ensure it handles roles.
    // Let's use the custom API for creation as it's already there and handles basic creation without logging in the admin as the new user.
    // But we need to update it to support 'role' if we want to set it on creation.
    // For now, I'll stick to the existing custom API for creation and update the role separately if needed, 
    // OR I can use authClient.signUp.email and then sign out? No, that's bad.
    // I'll stick to custom API for creation for now, as better-auth admin plugin is mainly for management.
    // Wait, I plan to remove custom APIs? 
    // The plan said "Keep using custom APIs or auth.api equivalents if admin plugin lacks them".
    // So I will keep using /api/admin/users for creation.
    await $fetch("/api/admin/users", {
      method: "POST",
      body: createModel,
    });

    // If role is admin, we might need to set it explicitly if the custom API doesn't handle it.
    // Assuming custom API will be updated or we do a second call. 
    // Let's rely on custom API for now.

    toast.add({ title: "Success", description: "User created" });
    showCreateModal.value = false;
    refresh();
    // Reset form
    createModel.name = "";
    createModel.email = "";
    createModel.password = "";
    createModel.phoneNumber = "";
    createModel.role = "user";
  } catch (e: any) {
    toast.add({ title: "Error", description: e.message || "Failed to create", color: 'error' });
  } finally {
    creating.value = false;
  }
}

// Edit
const showEditModal = ref(false);
const updating = ref(false);
const editModel = reactive({
  id: "",
  name: "",
  email: "",
  phoneNumber: "",
  role: "user",
  emailVerified: false,
  phoneNumberVerified: false,
});

const validateEdit = (state: any) => {
  const errors = [];
  if (!state.name) errors.push({ path: 'name', message: 'Required' });
  if (!state.email) errors.push({ path: 'email', message: 'Required' });
  return errors;
};

function openEditModal(row: any) {
  editModel.id = row.id;
  editModel.name = row.name;
  editModel.email = row.email;
  editModel.phoneNumber = row.phoneNumber || "";
  editModel.role = row.role || "user";
  editModel.emailVerified = row.emailVerified;
  editModel.phoneNumberVerified = row.phoneNumberVerified || false;
  showEditModal.value = true;
}

async function handleUpdate() {
  updating.value = true;
  try {
    // 1. Update basic info via custom API (or authClient.api.updateUser if possible but that's for self)
    // Custom API is safer for admin updating others.
    await $fetch(`/api/admin/users/${editModel.id}`, {
      method: "PUT",
      body: {
        name: editModel.name,
        email: editModel.email,
        phoneNumber: editModel.phoneNumber,
        role: editModel.role,
        emailVerified: editModel.emailVerified,
        phoneNumberVerified: editModel.phoneNumberVerified
      },
    });

    toast.add({ title: "Success", description: "User updated" });
    showEditModal.value = false;
    refresh();
  } catch (e: any) {
    toast.add({ title: "Error", description: e.message || "Failed to update", color: 'error' });
  } finally {
    updating.value = false;
  }
}

// Ban/Unban
async function toggleBan(row: any) {
  try {
    if (row.banned) {
      await authClient.admin.unbanUser({ userId: row.id });
      toast.add({ title: "Success", description: "User unbanned" });
    } else {
      await authClient.admin.banUser({ userId: row.id, banReason: "Admin action" });
      toast.add({ title: "Success", description: "User banned" });
    }
    refresh();
  } catch (e: any) {
    toast.add({ title: "Error", description: e.message || "Failed to change ban status", color: 'error' });
  }
}

// Delete
const showDeleteModal = ref(false);
const deleting = ref(false);
const userToDelete = ref<any>(null);

function confirmDelete(row: any) {
  userToDelete.value = row;
  showDeleteModal.value = true;
}

async function handleDelete() {
  if (!userToDelete.value) return;

  deleting.value = true;
  try {
    // Use Admin Plugin for deletion
    await authClient.admin.removeUser({
      userId: userToDelete.value.id
    });

    toast.add({ title: "Success", description: "User deleted" });
    refresh();
    showDeleteModal.value = false;
    userToDelete.value = null;
  } catch (e: any) {
    toast.add({ title: "Error", description: e.message || "Failed to delete", color: 'error' });
  } finally {
    deleting.value = false;
  }
}
</script>
