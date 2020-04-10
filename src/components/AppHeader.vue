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
    <div class="title">Graph Node Inspector</div>
    <div class="any">
      <button id="button" class="button" v-on:click="openpopup">
        <img src="/assets/logo.png" alt="" />
      </button>
    </div>
  </div>
</template>

<script>
import EventBusHelp from "./event-bus-help.js";

export default {
  name: "AppHeader",
  methods: {
    openpopup() {
      let display = "flex";
      EventBusHelp.$emit("help", display);
    }
  }
};
</script>

<style lang="scss" scoped>
.app-header {
  display: flex;
  align-content: center;
  justify-content: space-between;
  height: 64px;
  background-color: #eee;
  overflow: hidden;
  color: #fff;
}
.logo img {
  font-size: 24px;
  float: left;
  width: auto;
  height: 60px;
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
.any {
  content: " ";
  width: 200px;
}
.title {
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
$blue: #1686d9;

.button {
  cursor: help;
  margin-left: 130px;
  margin-top: 15px;
  width: 35px;
  height: 35px;
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
</style>
