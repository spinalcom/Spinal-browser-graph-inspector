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
  <!-- eslint-disable vue/html-self-closing -->
  <div class="graph">
    <link
      rel="stylesheet"
      href="https://use.fontawesome.com/releases/v5.8.1/css/all.css"
      integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf"
      crossorigin="anonymous"
    />
    <app-header></app-header>
    ​
    <div class="container">
      <div id="side-menu" class="side-nav">
        <div class="header-nav">
          <a href="#" class="btn-close" v-on:click="closeSlideMenu"
            ><svg width="30" height="30" class="svg">
              <path d="M0,5 20,5" stroke="#4d4c4c" stroke-width="2" />
              <path d="M0,10 20,10" stroke="#4d4c4c" stroke-width="2" />
              <path d="M0,15 20,15" stroke="#4d4c4c" stroke-width="2" /></svg
          ></a>
          <div class="logo"><img src="/assets/spinal.png" alt="" /></div>
        </div>
        <div class="login">
          <a href="" v-on:click="rederictionDrive"
            ><img src="/assets/return.png" alt="" /> Return to SpinalBIM
            Drive</a
          >
          <a href="#"><img src="/assets/logout.png" alt="" /> Sign out</a>
        </div>
      </div>
      <golden-layout class="golden">
        <gl-row :has-headers="true">
          <gl-stack :width="60">
            <!-- <gl-component
              class="comp"
              title="Graph Node Inspector"
              :closable="false"
              @resize="onResize('app-Graph')"
            >
              <app-Graph ref="app-Graph"></app-Graph>
            </gl-component> -->
            ​
            <gl-component
              class="comp"
              title="Graph Node Inspector"
              :closable="true"
              v-for="(id, index) in ids"
              :key="index"
              @resize="onResize('app-graph')"
              @show="onShow(index)"
              @hide="onHide(index)"
            >
              <app-Graph ref="app-graph" :id="'app-graph' + index" :server_id="id"></app-Graph>
            </gl-component>
          </gl-stack>
          <gl-col class="col" :width="40">
            <gl-component
              class="comp"
              title="DB Inspector"
              :closable="false"
              :height="70"
            >
              <app-Db-Inspector ref="app-Db-Inspector"></app-Db-Inspector>
            </gl-component>
            <gl-component
              class="comp"
              title="Element Node Inspector"
              :closable="true"
            >
              <app-Element></app-Element>
            </gl-component>
          </gl-col>
        </gl-row>
      </golden-layout>
    </div>
  </div>
</template>
​
<script lang="ts">
import Vue from "vue";
import { Component, Inject, Model, Prop, Watch } from "vue-property-decorator";
import AppHeader from "./components/AppHeader.vue";
import AppGraph from "./components/AppGraph.vue";
import AppElement from "./components/AppElement.vue";
import AppDbInspector from "./components/AppDbInspector.vue";
import EventBusSideNav from "./components/event-bus-side-nav.js";
import EventBus from "./components/event-bus.js";

EventBusSideNav.$on("size", size => {
  console.log(size);
  document.getElementById("side-menu").style.width = size;
});

export default {
  name: "App",
  components: {
    AppHeader,
    AppGraph,
    AppElement,
    AppDbInspector
  },
  data() {
    return {
      ids: [],
      currentIdx : 0
    };
  },
  methods: {
    onShow(index) {console.log("onShow", index);
    },
onHide(index) {console.log("onHide", index);
},
    initids() {
      EventBus.$on("server_id", server_id => {
        console.log(this.$refs);

        this.ids.push(server_id);
        console.log(this.ids);
        console.log(server_id);
      });
    },
    onResize(ref) {
      console.log(ref);
      
      this.$refs[ref].forEach(el => {
        el.resize();
      });
    },
    closeSlideMenu() {
      document.getElementById("side-menu").style.width = "0";
    },
    rederictionDrive() {
      let myWindow = window.open("", "");
      let location = "/html/drive/";
      myWindow.document.location = <any>location;
      myWindow.focus();
    },
    getServeIdByName(name) {
      const url = window.location.href;
      name = name.replace(/[[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return "";
      return results[2].replace(/\+/g, " ");
    }
  },
  mounted() {
    this.initids();
    console.log(this.$refs);
  },
  created() {
    var server_id = parseInt(this.getServeIdByName("id"));
    this.ids.push(server_id);
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
.svg {
  width: 20px;
  height: 20px;
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
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.comp {
  overflow: hidden;
}

.side-nav {
  height: 100%;
  width: 0;
  position: fixed;
  z-index: 5;
  top: 0;
  right: 0;
  left: auto;
  background-color: #424242;
  overflow-x: hidden;
  overflow-y: auto;
  padding-top: 60px;
  transition: 0.5s;
  box-shadow: 0 8px 10px -5px rgba(0, 0, 0, 0.2),
    0 16px 24px 2px rgba(0, 0, 0, 0.14), 0 6px 30px 5px rgba(0, 0, 0, 0.12);
}

.side-nav a {
  text-decoration: none;
  font-size: 14px;
  font-family: sans-serif;
  line-height: 1.25em;
  white-space: nowrap;
  color: #fff;
  display: block;
  transition: 0.3s;
}

.side-nav a:hover {
  opacity: 0.33;
  color: #777;
}

.side-nav .btn-close {
  padding: 10px 10px 10px 30px;
  position: absolute;
  top: 0;
  right: 8px;
  font-size: 32px;
  margin-left: 50px;
}
.logo img {
  font-size: 24px;
  float: left;
  width: auto;
  height: 73px;
}
.header-nav {
  margin-top: -69px;
  width: auto;
  height: 73px;
  background-color: #fff;
  display: flex;
  flex-wrap: nowrap;
}
.login a {
  margin: 10px;
  vertical-align: middle;
}
.login a img {
  vertical-align: middle;
  width: 25px;
  height: 25px;
  padding: 10px;
}
</style>
