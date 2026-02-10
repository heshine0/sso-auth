<script setup lang="ts">

const {data:session} = await authClient.useSession(useFetch);
const email = ref("");
const password = ref("");
const name = ref("");

const signUp = async () => {
  await authClient.signUp.email({
    email: email.value,
    password: password.value,
    name: name.value,
  });
};

const signIn = async () => {
  await authClient.signIn.email({
    email: email.value,
    password: password.value,
  });
};

const signOut = async () => {
  await authClient.signOut();
};
</script>

<template>
  <div style="padding: 20px;">
    <h1>Better Auth Demo</h1>
    <div v-if="session">
      <p>Signed in as: {{ session.user.name }} ({{ session.user.email }})</p>
      <button @click="signOut">Sign Out</button>
    </div>
    <div v-else>
      <div style="margin-bottom: 20px;">
        <h2>Sign Up</h2>
        <input v-model="name" placeholder="Name" style="margin-right: 10px;" />
        <input v-model="email" placeholder="Email" style="margin-right: 10px;" />
        <input v-model="password" type="password" placeholder="Password" style="margin-right: 10px;" />
        <button @click="signUp">Sign Up</button>
      </div>
      <div>
        <h2>Sign In</h2>
        <input v-model="email" placeholder="Email" style="margin-right: 10px;" />
        <input v-model="password" type="password" placeholder="Password" style="margin-right: 10px;" />
        <button @click="signIn">Sign In</button>
      </div>
    </div>
  </div>
</template>
