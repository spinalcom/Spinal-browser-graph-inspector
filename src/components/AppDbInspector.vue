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
  <div ref="appDbInspector" class="app-Db-Inspector">
    <div class="dropdown1">
      <button id="button" class="button" v-on:click="showLegend">
        <img src="/assets/logo.png" alt="" />
      </button>
      <div id="myDropdown1" class="dropdown1-content">
        <ul class="demo1">
          <li>
            <img src="/assets/simplenode.png" alt="" />
            <p>Close Node</p>
          </li>
          <li>
            <img src="/assets/open.png" alt="" />
            <p>Open Node</p>
          </li>
          <li>
            <img src="/assets/last.png" alt="" />
            <p>Last Node</p>
          </li>
          <li>
            <img src="/assets/ptr.png" alt="" />
            <p>Close Ptr Node</p>
          </li>
          <li>
            <img src="/assets/start.png" alt="" />
            <p>Open Ptr Node</p>
          </li>

          <li>
            <img src="/assets/ids.png" alt="" />
            <p>Close Ref Node</p>
          </li>
          <li>
            <img src="/assets/idsopen.png" alt="" />
            <p>Open Ref Node</p>
          </li>
          <li>
            <img src="/assets/mouse2.png" alt="" />
            <p>graph depth</p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import Viewer from "../viewer";
import Spinal from "../spinal";
import Vue from "vue";
import EventBus from "./event-bus";
import { dbInspector } from "../dbInspector";

export default {
  name: "AppDbInspector",
  data() {
    return {
      server_id: -1
    };
  },
  mounted() {
    dbInspector(this.$refs.appDbInspector);
  },
  methods: {
    resize() {},
    showLegend() {
      document.getElementById("myDropdown1").classList.toggle("show");
    }
  }
};
</script>

<style lang="scss" scoped>
* {
  padding: 0;
  margin: 0;
}
.app-Db-Inspector {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
$blue: #1686d9;

.dropdown1 {
  position: relative;
  float: left;
}

.dropdown1-content {
  display: none;
  position: absolute;
  background-color: #222;
  min-width: 150px;
  overflow: auto;
  box-shadow: 0px 8px 16px 0px rgba(71, 69, 69, 0.2);
  z-index: 1;
  font-family: "Gill Sans", sans-serif;
}

.show {
  display: block;
}

.button {
  cursor: help;
  margin-right: 3px;
  width: 25px;
  height: 25px;
  background-color: $blue;
  border: 2px solid white;
  border-radius: 35px;
  text-decoration: none;
  padding: 5px 5px;
  color: white;
  display: inline-block;
  &:hover {
    background-color: white;
    color: $blue;
    border: 2px solid $blue;
  }
}
.button img {
  font-size: 24px;
  cursor: help;
  margin-left: -5px;
  margin-top: -5px;
  width: 20px;
  height: 20px;
}
ul {
  list-style-type: none;
}
ul li {
  margin: 5px;
}
ul li img {
  vertical-align: middle;
  width: 20px;
  height: 20px;
}
ul li p {
  display: inline-block;
  vertical-align: middle;
}
</style>
