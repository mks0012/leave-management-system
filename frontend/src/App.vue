<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-blue-700 text-white shadow-md p-4 mb-0">
      <div class="max-w-6xl mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <span class="text-2xl font-extrabold tracking-tighter">LEAVE PORTAL</span>
        
          <span class="text-lg font-medium"></span>
        </div>
        <div class="text-sm font-light italic">
          v1.0 | Professional Edition
        </div>
      </div>
    </nav>

    <router-view />
  </div>
</template>

<script setup>
// No extra logic needed here
</script>

<style>
body {
  margin: 0;
  font-family: 'Inter', sans-serif;
}
</style>