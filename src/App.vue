<!--
Copyright 2024 SpinalCom - www.spinalcom.com

This file is part of SpinalCore.

Please read all of the following terms and conditions
of the Software license Agreement ("Agreement")
carefully.

This Agreement is a legally binding contract between
the Licensee (as defined below) and SpinalCom that
sets forth the terms and conditions that govern your
use of the Program. By installing and/or using the
Program, you agree to abide by all the terms and
conditions stated or referenced herein.

If you do not agree to abide by these terms and
conditions, do not demonstrate your acceptance and do
not install or use the Program.
You should have received a copy of the license along
with this file. If not, see
<http://resources.spinalcom.com/licenses.pdf>.
-->
<script setup lang="ts">
import { ref } from "vue";
import { GoldenLayout } from "./plugins/GoldenLayout";
import { ComponentItemConfig, ItemType, LayoutConfig } from "golden-layout";
import Spinal from "./spinal";
import AppGraph from "./components/AppGraph.vue";
import AppElement from "./components/AppElement.vue";
import AppDbInspector from "./components/AppDbInspector.vue";

const drawer = ref(false);

function logOut() {
  const spinal = Spinal.getInstance();
  spinal.disconnect();
}

function getServeIdByName(name) {
  const url = window.location.href;
  name = name.replace(/[[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return "NaN";
  if (!results[2]) return "NaN";
  return results[2].replace(/\+/g, " ");
}
const server_id = ref(parseInt(getServeIdByName("id")));
const miniRowConfig: LayoutConfig = {
  root: {
    type: ItemType.row,
    content: [
      {
        type: "component",
        title: "Graph Node Inspector",
        header: { show: "top" },
        componentType: "graphinspector",
        width: 70,
      } as ComponentItemConfig,
      {
        type: ItemType.column,
        content: [
          {
            type: "component",
            title: "node inspector",
            header: { show: "top" },
            componentType: "nodeinspector",
            componentState: { abc: 123 },
          } as ComponentItemConfig,
          {
            type: "component",
            title: "Element Node Inspector",
            header: { show: "top", popout: false },
            componentType: "elementinspector",
          } as ComponentItemConfig,
        ],
      },
    ],
  },
};
const layoutConfig = ref(miniRowConfig);
</script>

<template>
  <v-layout style="height: 100%">
    <v-app-bar color="white" prominent>
      <img
        height="100%"
        src="./assets/spinal.png?width=300"
        alt="spinalcom logo"
      />

      <v-spacer></v-spacer>
      <v-toolbar-title>Graph node inspector</v-toolbar-title>

      <v-app-bar-nav-icon
        variant="text"
        @click.stop="drawer = !drawer"
        icon="mdi-menu"
      ></v-app-bar-nav-icon>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" location="right" temporary>
      <v-list>
        <v-list-item href="/html/drive/">
          <template v-slot:prepend>
            <v-icon icon="mdi-keyboard-return"></v-icon>
          </template>
          <v-list-item-tile>Return to SpinalBIM Drive</v-list-item-tile>
        </v-list-item>
        <v-list-item @click="logOut">
          <template v-slot:prepend>
            <v-icon icon="mdi-logout"></v-icon>
          </template>
          <v-list-item-tile>Log Out</v-list-item-tile>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main style="height: 100%">
      <golden-layout style="height: 100%" :config="layoutConfig">
        <template #graphinspector>
          <app-Graph ref="app-graph" :server_id="server_id"></app-Graph>
        </template>
        <template #nodeinspector>
          <app-Db-Inspector ref="app-Db-Inspector"></app-Db-Inspector>
        </template>
        <template #elementinspector>
          <app-Element></app-Element>
        </template>
      </golden-layout>
    </v-main>
  </v-layout>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px grey;
  border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: rgb(201, 194, 194);
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #b4f5ab;
}

.app-Db-Inspector .tooltip {
  pointer-events: none;
}
</style>
