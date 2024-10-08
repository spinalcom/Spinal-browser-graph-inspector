/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
import "./assets/main.css";
import "golden-layout/dist/css/goldenlayout-base.css";
import "golden-layout/dist/css/themes/goldenlayout-dark-theme.css";
import "@mdi/font/css/materialdesignicons.css";
import vuetify from "./plugins/vuetify";
import { createApp } from "vue";
import App from "./App.vue";

window.__VUE_OPTIONS_API__ = true;
window.__VUE_PROD_DEVTOOLS__ = true;
window.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = true;
const app = createApp(App).use(vuetify);
app.mount("#app");
// @ts-ignore
window.setImmediate = (cb) => {
  return window.setTimeout(cb, 0);
};
