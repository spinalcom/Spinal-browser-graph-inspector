/*
 * Copyright 2024 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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

import "@mdi/font/css/materialdesignicons.css";
import "vuetify/dist/vuetify.css";
// import '../../node_modules/front-end-component-library/dist/style.css';

// Vuetify
// import '@fortawesome/fontawesome-free/css/all.css';
import { createVuetify } from "vuetify";
import { aliases, fa } from "vuetify/lib/iconsets/fa";
import { mdi } from "vuetify/lib/iconsets/mdi";
import * as components from "vuetify/lib/components";
import * as directives from "vuetify/lib/directives";
import { VNumberInput } from "vuetify/lib/labs/VNumberInput";

components.VNumberInput = VNumberInput;

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "dark",
  },
  icons: {
    defaultSet: "mdi",
  },
});
