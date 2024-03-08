import Vue from "vue";
import VueRouter from "vue-router";
import ApplicationPage from "@/views/ApplicationPage";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "ApplicationPage",
    component: ApplicationPage,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
