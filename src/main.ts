import "./style.css";
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { dbService } from './core/database/DatabaseService';

const app = createApp(App);

// Initialize DB safely before mounting (or concurrently)
dbService.init().then(async () => {
  if (!localStorage.getItem('sys_data_cleared_001')) {
    await dbService.clearAllData();
    localStorage.setItem('sys_data_cleared_001', 'true');
  }

  app.use(createPinia());
  app.use(router);
  app.mount('#app');
});

