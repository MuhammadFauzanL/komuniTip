import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import vue3GoogleLogin from 'vue3-google-login'

const app = createApp(App)

app.use(router)
app.use(vue3GoogleLogin, {
  clientId: '311805605602-jt2iq9o9cauq49bu2ho645heeukbdabr.apps.googleusercontent.com'
})

app.mount('#app')
