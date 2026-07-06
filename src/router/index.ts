import { createRouter, createWebHistory } from 'vue-router';
import LibraryView from '@/modules/Library/views/LibraryView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Library',
      component: LibraryView
    },
    {
      path: '/reader/:id',
      name: 'Reader',
      component: () => import('@/modules/Reader/views/ReaderView.vue')
    }
  ]
});

export default router;
