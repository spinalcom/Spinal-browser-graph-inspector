<!--
Copyright 2020 SpinalCom - www.spinalcom.com

This file is part of SpinalCore.

Please read all of the following terms and conditions
of the Free Software license Agreement ("Agreement")
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
<template>
  <div class="graph">
    <app-header></app-header>

    <div class="container">
      <golden-layout class="golden">
        <gl-row :hasHeaders="true">
          <gl-component
            class="comp"
            @resize="onResize('app-Graph')"
            title="Graph Node Inspector"
            :closable="false"
            :width="70"
          >
            <app-Graph ref="app-Graph"></app-Graph>
          </gl-component>

          <gl-col>
            <gl-component
              class="comp"
              @resize="onResize('app-Graph')"
              title="DB Inspector"
              :closable="false"
              ><app-Db-Inspector></app-Db-Inspector>
            </gl-component>
            <gl-component
              class="comp"
              title="Element Node Inspector"
              :closable="false"
              :width="30"
            >
              <app-Element></app-Element>
            </gl-component>
          </gl-col>
        </gl-row>
      </golden-layout>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Inject, Model, Prop, Watch } from "vue-property-decorator";
import AppHeader from "./components/AppHeader.vue";
import AppGraph from "./components/AppGraph.vue";
import AppElement from "./components/AppElement.vue";
import AppDbInspector from "./components/AppDbInspector.vue";

export default {
  name: "App",
  components: {
    AppHeader,
    AppGraph,
    AppElement,
    AppDbInspector
  },
  methods: {
    onResize(ref) {
      this.$refs[ref].resize();
    }
  }
};
</script>
<style>
html,
body,
.graph {
  height: 100%;
  width: 100%;
  position: relative;
  color: white;
  background-color: #222;
}
.container {
  width: 100%;
  height: calc(100% - 64px);
  position: relative;
}

.gauche {
  width: 70%;
  float: left;
}

#droite {
  width: 30%;
  height: 700px;
  float: left;
  color: white;
  background-color: #444;
}

.golden {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.comp {
  overflow: hidden;
}
</style>
