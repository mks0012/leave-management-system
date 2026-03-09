<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const role = localStorage.getItem('role')
const userName = localStorage.getItem('userName')
const token = localStorage.getItem('token')
const leaves = ref([])
const isLoading = ref(false)
const API = "http://localhost:5000"

const today = new Date().toISOString().split('T')[0]
const leaveForm = ref({ type: 'Sick Leave', start: today, end: today, reason: '' })

const fetchData = async () => {
  isLoading.value = true
  try {
    const endpoint = role === 'employer' ? '/admin/leaves' : '/my-leaves'
    const res = await axios.get(`${API}${endpoint}`, { headers: { Authorization: `Bearer ${token}` }})
    leaves.value = res.data
  } catch (e) {
    if (e.response?.status === 401) logout()
  } finally {
    isLoading.value = false
  }
}

const applyLeave = async () => {
  if (new Date(leaveForm.value.start) > new Date(leaveForm.value.end)) {
    return alert("End date cannot be before start date!")
  }
  try {
    await axios.post(`${API}/leaves`, leaveForm.value, { headers: { Authorization: `Bearer ${token}` }})
    alert("Application Submitted!"); leaveForm.value.reason = ''; fetchData()
  } catch (e) { alert("Submission failed") }
}

const updateStatus = async (id, status) => {
  try {
    await axios.patch(`${API}/admin/leaves/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` }})
    fetchData()
  } catch (e) { alert("Error updating status") }
}

const logout = () => { localStorage.clear(); router.push('/') }
onMounted(() => { if (!token) router.push('/'); else fetchData(); })
</script>

<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8">
    <header class="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm mb-8 border border-gray-100">
      <div class="text-center md:text-left">
        <h1 class="text-2xl font-black text-slate-800 capitalize">Welcome, {{ userName }}</h1>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{{ role }} Dashboard</p>
      </div>
      <button @click="logout" class="mt-4 md:mt-0 bg-slate-100 text-slate-600 px-8 py-2 rounded-xl font-bold hover:bg-red-600 hover:text-white transition">Logout</button>
    </header>

    <div v-if="isLoading" class="text-center py-20 font-bold text-slate-400 animate-pulse">Loading data...</div>

    <div v-else>
      <div v-if="role === 'employee'" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 class="text-xl font-bold mb-6 text-slate-800">Apply for Leave</h2>
          <div class="space-y-4">
            <select v-model="leaveForm.type" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
              <option>Sick Leave</option><option>Casual Leave</option><option>Vacation</option>
            </select>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-[10px] font-bold text-slate-400 uppercase">Start Date</label>
                <input v-model="leaveForm.start" type="date" :min="today" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              <div>
                <label class="text-[10px] font-bold text-slate-400 uppercase">End Date</label>
                <input v-model="leaveForm.end" type="date" :min="leaveForm.start" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
            </div>
            <textarea v-model="leaveForm.reason" placeholder="Reason for leave..." class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl h-32 outline-none focus:ring-2 focus:ring-slate-500"></textarea>
            <button @click="applyLeave" class="w-full bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-black transition shadow-lg">Submit Request</button>
          </div>
        </div>

        <div class="lg:col-span-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 class="text-xl font-bold mb-6 text-slate-800">My Leave Status</h2>
          <div v-if="leaves.length === 0" class="text-center py-20 text-slate-300">No applications found.</div>
          <div v-for="l in leaves" :key="l._id" class="p-5 border border-slate-100 rounded-2xl mb-4 bg-slate-50 flex justify-between items-center">
            <div>
              <p class="font-bold text-slate-700">{{ l.type }}</p>
              <p class="text-xs text-slate-400">{{ l.start }} to {{ l.end }}</p>
              <p class="text-sm text-slate-500 mt-2 italic">"{{ l.reason }}"</p>
            </div>
            <div :class="l.status === 'Approved' ? 'bg-green-100 text-green-700' : l.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'" class="px-4 py-1 rounded-full font-bold text-[10px] uppercase">
              {{ l.status }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="role === 'employer'" class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 class="text-2xl font-bold mb-8 text-slate-800">Employee Requests</h2>
        <div v-if="leaves.length === 0" class="text-center py-20 text-slate-300">No pending requests to display.</div>
        <div class="overflow-x-auto" v-else>
          <table class="w-full text-left">
            <thead>
              <tr class="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th class="pb-4 pl-4">Employee</th><th class="pb-4">Dates</th><th class="pb-4">Status</th><th class="pb-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="l in leaves" :key="l._id" class="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition">
                <td class="py-6 pl-4 font-bold text-slate-700">{{ l.employeeName }}</td>
                <td class="py-6 text-sm text-slate-500">{{ l.start }} — {{ l.end }}</td>
                <td class="py-6"><span class="text-xs font-bold uppercase tracking-tighter" :class="l.status === 'Approved' ? 'text-green-600' : l.status === 'Rejected' ? 'text-red-600' : 'text-amber-500'">{{ l.status }}</span></td>
                <td class="py-6">
                  <div v-if="l.status === 'Pending'" class="flex justify-center gap-3">
                    <button @click="updateStatus(l._id, 'Approved')" class="text-[10px] font-black bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-black transition">APPROVE</button>
                    <button @click="updateStatus(l._id, 'Rejected')" class="text-[10px] font-black bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition">REJECT</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>