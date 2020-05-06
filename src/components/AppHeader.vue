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
  <div class="app-header">
    <div class="logo"><img src="/assets/spinal.png" alt="" /></div>
    <div class="title">
      <h3>Graph_node_inspector</h3>
    </div>
    <div class="any">
      <span class="user">admin</span>
      <div class="navbar">
        <span class="open-slide">
          <a href="#" v-on:click="openSlideMenu">
            <svg width="30" height="30" class="svg">
              <path d="M0,5 20,5" stroke="#4d4c4c" stroke-width="2" />
              <path d="M0,10 20,10" stroke="#4d4c4c" stroke-width="2" />
              <path d="M0,15 20,15" stroke="#4d4c4c" stroke-width="2" />
            </svg>
          </a>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import EventBus from "./event-bus.js";

export default {
  name: "AppHeader",
  methods: {
    openSlideMenu() {
      let size = "400px";
      EventBus.$emit("size", size);
    },
  },
};
</script>

<style lang="scss" scoped>
.app-header {
  display: flex;
  align-content: center;
  justify-content: space-between;
  height: 64px;
  background-color: #fff;
  overflow: hidden;
  color: #fff;
}
p {
  display: block;
  font-size: 1.5em;
  margin-block-start: 0.83em;
  margin-block-end: 0.83em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
  font-weight: bold;
}
.logo img {
  font-size: 24px;
  float: left;
  width: auto;
  height: 73px;
}
.any img {
  font-size: 24px;
  margin-left: -5px;
  margin-top: -5px;
  width: 30px;
  height: 30px;
}
ul {
  float: left;
  width: calc(100%-200%);
  li {
    padding: 20px;
    display: inline-block;
    a {
      color: #fff;
      text-decoration: none;
    }
  }
}
.svg {
  width: 20px;
  height: 20px;
}
.any {
  content: "";
  width: 90px;
  display: flex;
  justify-content: space-between;
  vertical-align: middle;
}
.any .user {
  color: black;
  vertical-align: middle;
  margin-top: 20px;
}
.title {
  font-family: sans-serif;
  font-size: 1.5em;
  margin-block-start: 0.83em;
  margin-block-end: 0.83em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
  font-weight: bold;
  color: black;
  align-self: center;
  height: 20px;
  text-align: center;
}
a {
  text-decoration: none;
  color: black;
  &:hover {
    text-decoration: underline;
  }
}

.navbar a {
  float: right;
  display: block;
  color: black;
  text-align: center;
  padding: 8px 8px;
  margin: 10px;
  text-decoration: none;
  font-size: 17px;
}

.navbar a:hover {
  border-radius: 45%;
  background-color: #e0dbdb;
  color: #000;
  transition: 0.1s;
}

.side-nav {
  height: 100%;
  width: 0;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  background-color: #111;
  opacity: 0.9;
  overflow-x: hidden;
  padding-top: 60px;
  transition: 0.5s;
}
</style>
