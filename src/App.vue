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
<http://resources.spinalcom.com/licenses.pdf\>.
-->
<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from "vue";
import Spinal from "./spinal";
import AppGraph from "./components/AppGraph.vue";
import AppElement from "./components/AppElement.vue";
import AppDbInspector from "./components/AppDbInspector.vue";
import AppForceGraph from "./components/AppForceGraph.vue";

const drawer = ref(false);
const activeTab = ref<"dag" | "force">("dag");
const forceGraphRef = ref<InstanceType<typeof AppForceGraph> | null>(null);

async function setActiveTab(tab: "dag" | "force") {
  activeTab.value = tab;
  if (tab === "force") {
    await nextTick();
    forceGraphRef.value?.tryInit();
  }
}

// Resize state
const leftWidth = ref(70); // % width of graph panel
const topHeight = ref(50); // % height of top inspector pane
const appLayout = ref<HTMLElement | null>(null);
const inspectorPanel = ref<HTMLElement | null>(null);
const resizing = ref<"horizontal" | "vertical" | null>(null);

function startResizeH(e: MouseEvent) {
  resizing.value = "horizontal";
  e.preventDefault();
}
function startResizeV(e: MouseEvent) {
  resizing.value = "vertical";
  e.preventDefault();
}
function onMouseMove(e: MouseEvent) {
  if (!resizing.value) return;
  if (resizing.value === "horizontal" && appLayout.value) {
    const rect = appLayout.value.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    leftWidth.value = Math.min(Math.max(pct, 20), 85);
  } else if (resizing.value === "vertical" && inspectorPanel.value) {
    const rect = inspectorPanel.value.getBoundingClientRect();
    const pct = ((e.clientY - rect.top) / rect.height) * 100;
    topHeight.value = Math.min(Math.max(pct, 10), 90);
  }
}
function onMouseUp() {
  resizing.value = null;
}

onMounted(() => {
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
});
onUnmounted(() => {
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
});

function logOut() {
  const spinal = Spinal.getInstance();
  spinal.disconnect();
}

function getAttrFromUrlQuery(name: string) {
  const url = window.location.href;
  name = name.replace(/[[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return "NaN";
  if (!results[2]) return "NaN";
  return results[2].replace(/\+/g, " ");
}

const server_id = ref(parseInt(getAttrFromUrlQuery("id")));
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
      <v-toolbar-title style="color: black"
        >Graph node inspector</v-toolbar-title
      >
      <v-app-bar-nav-icon
        style="color: black"
        variant="text"
        @click.stop="drawer = !drawer"
        icon="mdi-menu"
      ></v-app-bar-nav-icon>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" location="right" temporary>
      <v-list class="sidebar-list">
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
      <div
        ref="appLayout"
        class="app-layout"
        :class="{ 'is-resizing': resizing }"
      >
        <!-- Left: graph panels -->
        <div class="graph-panel" :style="{ width: leftWidth + '%' }">
          <div class="tab-bar">
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'dag' }"
              @click="setActiveTab('dag')"
            >
              DAG Inspector
            </button>
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'force' }"
              @click="setActiveTab('force')"
            >
              Force Inspector
            </button>
          </div>
          <div class="tab-content">
            <div v-show="activeTab === 'dag'" class="tab-pane">
              <app-Graph :server_id="server_id"></app-Graph>
            </div>
            <div v-show="activeTab === 'force'" class="tab-pane">
              <app-Force-Graph
                ref="forceGraphRef"
                :server_id="server_id"
              ></app-Force-Graph>
            </div>
          </div>
        </div>

        <!-- Horizontal divider -->
        <div class="h-resizer" @mousedown="startResizeH"></div>

        <!-- Right: inspector column -->
        <div
          ref="inspectorPanel"
          class="inspector-panel"
          :style="{ width: 100 - leftWidth + '%' }"
        >
          <div class="inspector-pane" :style="{ height: topHeight + '%' }">
            <div class="pane-title">Inspector</div>
            <div class="pane-content">
              <app-Db-Inspector></app-Db-Inspector>
            </div>
          </div>

          <!-- Vertical divider -->
          <div class="v-resizer" @mousedown="startResizeV"></div>

          <div
            class="inspector-pane"
            :style="{ height: 100 - topHeight + '%' }"
          >
            <div class="pane-title">Element Inspector</div>
            <div class="pane-content">
              <app-Element></app-Element>
            </div>
          </div>
        </div>
      </div>
    </v-main>
  </v-layout>
</template>

<style scoped>
.app-layout {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* Disable text selection while dragging */
.app-layout.is-resizing {
  user-select: none;
}
.app-layout.is-resizing * {
  pointer-events: none;
}
.app-layout.is-resizing .h-resizer,
.app-layout.is-resizing .v-resizer {
  pointer-events: all;
}

/* Graph panel */
.graph-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 200px;
  flex-shrink: 0;
}

/* Horizontal divider between panels */
.h-resizer {
  width: 5px;
  height: 100%;
  background: #3a3a3a;
  cursor: col-resize;
  flex-shrink: 0;
  transition: background 0.15s;
}
.h-resizer:hover,
.app-layout.is-resizing .h-resizer {
  background: #1976d2;
}

/* Tab bar */
.tab-bar {
  display: flex;
  background: #1e1e1e;
  border-bottom: 1px solid #444;
  height: 40px;
  flex-shrink: 0;
}

.tab-btn {
  padding: 6px 16px;
  background: #2a2a2a;
  color: #ccc;
  border: none;
  border-right: 1px solid #444;
  cursor: pointer;
  font-family: sans-serif;
  font-size: 13px;
  outline: none;
  transition: background 0.2s;
}
.tab-btn:hover {
  background: #3a3a3a;
  color: #fff;
}
.tab-btn.active {
  background: #1e1e1e;
  color: #fff;
  border-bottom: 2px solid #1976d2;
}

.tab-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}
.tab-pane {
  position: absolute;
  inset: 0;
}

/* Inspector panel */
.inspector-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  min-width: 150px;
  flex-shrink: 0;
}

.inspector-pane {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
  min-height: 40px;
}

/* Vertical divider between inspector panes */
.v-resizer {
  height: 5px;
  width: 100%;
  background: #3a3a3a;
  cursor: row-resize;
  flex-shrink: 0;
  transition: background 0.15s;
}
.v-resizer:hover,
.app-layout.is-resizing .v-resizer {
  background: #1976d2;
}

.pane-title {
  padding: 6px 16px;
  background: #2a2a2a;
  color: #ccc;
  font-family: sans-serif;
  height: 40px;
  line-height: 28px;
  font-size: 13px;
  border-bottom: 1px solid #444;
  flex-shrink: 0;
}

.pane-content {
  flex: 1;
  overflow: auto;
  min-height: 0;
}
.sidebar-list > *:hover {
  background-color: #1976d2 !important;
}

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px grey;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb {
  background: rgb(201, 194, 194);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #1976d2;
}
</style>
