import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/lyrics/index.vue"),
    meta: { title: "图片展示" },
  },
  {
    path: "/upload",
    name: "Upload",
    component: () => import("../views/upload/index.vue"),
    meta: { title: "上传图片", requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫 - 设置页面标题
router.afterEach((to) => {
  document.title = to.meta.title || "Hello darkness, my old friend.";
});

export default router;
