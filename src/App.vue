<template>
  <ToastBar />
  <router-view />
  <DialogFade />
</template>

<script setup>
import { provide } from 'vue';
import { useToast } from './composables/useToast';
import ToastBar from './components/Toast/ToastBar.vue';
import DialogFade from './components/Dialog/fade.vue';
import DialogService from './components/Dialog/dialog';

const toast = useToast();
provide('toast', toast);
provide('$dialog', DialogService);
</script>
