<template>
  <ToastBar />
  <router-view />
</template>

<script setup>
import { provide } from 'vue';
import { useToast } from './composables/useToast';
import ToastBar from './components/Toast/ToastBar.vue';

const toast = useToast();
provide('toast', toast);
</script>
