<template>
  <n-config-provider :theme="settingsStore.isDarkMode ? darkTheme : null">
    <n-dialog-provider>
      <n-message-provider>
        <AppGlobalError>
          <div class="app-layout" :class="{ 'dark': settingsStore.isDarkMode }">
            <router-view />
          </div>
        </AppGlobalError>
      </n-message-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NDialogProvider, darkTheme } from 'naive-ui';
import { useSettingsStore } from './modules/Settings/store/settingsStore';
import AppGlobalError from './components/AppGlobalError.vue';

const settingsStore = useSettingsStore();
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--n-color);
  color: var(--n-text-color);
  transition: background-color 0.3s, color 0.3s;
}
.app-layout {
  min-height: 100vh;
}
.dark {
  background-color: #101014;
  color: #fff;
}
</style>
