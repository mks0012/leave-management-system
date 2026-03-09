import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

// Global state check: If token exists, we ensure the router knows
const token = localStorage.getItem('token')
if (token) {
  // You could add a global 'isLoggedIn' property here if needed
}

app.use(router)
app.mount('#app')