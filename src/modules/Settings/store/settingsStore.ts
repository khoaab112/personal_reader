import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
  const isDarkMode = ref(localStorage.getItem('isDarkMode') === 'true');

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
  };

  watch(isDarkMode, (newVal) => {
    localStorage.setItem('isDarkMode', newVal.toString());
    if (newVal) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, { immediate: true });

  return { isDarkMode, toggleDarkMode };
});
