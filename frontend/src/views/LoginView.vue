<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLogin = ref(true)
const showPassword = ref(false)
const isLoading = ref(false)
const email = ref('')
const password = ref('')
const name = ref('')
const role = ref('employee')
const API = "https://leave-management-system-2ocz.onrender.com"

const handleSubmit = async () => {
  if (!email.value || !password.value) return alert("Please fill all fields")
  isLoading.value = true
  try {
    if (isLogin.value) {
      const res = await axios.post(`${API}/login`, { email: email.value, password: password.value })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', res.data.role)
      localStorage.setItem('userName', res.data.name)
      router.push('/dashboard')
    } else {
      await axios.post(`${API}/register`, { name: name.value, email: email.value, password: password.value, role: role.value })
      alert("Registration successful! You can now login.")
      isLogin.value = true
    }
  } catch (e) {
    alert(e.response?.data?.msg || "Server Error. Check your connection.")
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-[80vh] px-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
      <div class="bg-slate-800 p-8 text-white text-center">
        <h1 class="text-3xl font-extrabold tracking-tight">LEAVE PORTAL</h1>
        <p class="mt-2 text-slate-300 text-sm">{{ isLogin ? 'Sign in to your account' : 'Create a new account' }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="p-8 space-y-5">
        <div v-if="!isLogin">
          <label class="block text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
          <input v-model="name" type="text" required placeholder="Enter your name" class="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none transition" />
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
          <input v-model="email" type="email" required placeholder="email@domain.com" class="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none transition" />
        </div>

        <div class="relative">
          <label class="block text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
          <input v-model="password" :type="showPassword ? 'text' : 'password'" required placeholder="••••••••" class="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none transition" />
          <button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-9 text-xs font-bold text-slate-600 hover:text-slate-800">
            {{ showPassword ? 'HIDE' : 'SHOW' }}
          </button>
        </div>

        <div v-if="!isLogin">
          <label class="block text-xs font-bold text-gray-500 uppercase ml-1">Account Role</label>
          <select v-model="role" class="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none cursor-pointer">
            <option value="employee">Employee</option>
            <option value="employer">Employer</option>
          </select>
        </div>

        <button type="submit" :disabled="isLoading" class="w-full bg-slate-800 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-slate-900 shadow-lg active:scale-95 transition disabled:opacity-50">
          <span v-if="isLoading">Loading...</span>
          <span v-else>{{ isLogin ? 'Login' : 'Register' }}</span>
        </button>

        <p @click="isLogin = !isLogin" class="text-center text-sm font-semibold text-slate-600 cursor-pointer hover:underline">
          {{ isLogin ? "Need an account? Sign up" : 'Have an account? Login' }}
        </p>
      </form>
    </div>
  </div>
</template>