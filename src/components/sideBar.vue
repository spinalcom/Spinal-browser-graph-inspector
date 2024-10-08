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
import Spinal from "../spinal";

function rederictionDrive() {
  let location = "/html/drive/";
  window.document.location = location;
  window.focus();
}
function signOut() {
  const spinal = Spinal.getInstance();
  spinal.disconnect();
}

function closeSlideMenu() {}
</script>

<template>
  <div id="side-menu" class="side-nav">
    <div class="header-nav">
      <button @click="closeSlideMenu">
        <img src="../assets/menu.svg" class="svg" alt="menu" />
      </button>

      <!-- <a href="#" class="btn-close" v-on:click="closeSlideMenu"
        ><img src="../assets/menu.svg" class="svg" alt="menu"
      /></a> -->
    </div>
    <div class="login">
      <a href="#" v-on:click="rederictionDrive"
        ><img src="../assets/return.png" alt="" /> Return to SpinalBIM Drive</a
      >
      <div class="signout" v-on:click="signOut">
        <a href="#"><img src="../assets/logout.png" alt="" /> Sign out</a>
      </div>
    </div>
  </div>
</template>

<style>
.svg {
  width: 20px;
  height: 20px;
}
.side-nav {
  height: 100%;
  width: 400px;
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
