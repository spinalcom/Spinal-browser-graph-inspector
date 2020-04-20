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
  <div ref="appGraph" class="app-Graph">
    <div class="dropdown">
      <button id="button" class="button" v-on:click="showLegend">
        <img src="/assets/info.png" alt="" />
      </button>

      <div id="myDropdown" class="dropdown-content">
        <ul class="demo">
          <li>
            <img src="/assets/start.png" alt="" />
            <p>Strating Node</p>
          </li>
          <li>
            <img src="/assets/simplenode.png" alt="" />
            <p>Simple Node</p>
          </li>
          <li>
            <img src="/assets/lastnode.png" alt="" />
            <p>Leaf Node</p>
          </li>
          <li>
            <img src="/assets/lstptr.png" alt="" />
            <p>Relation LstPtr</p>
          </li>
          <li>
            <img src="/assets/ref.png" alt="" />
            <p>Relation Ref</p>
          </li>
          <li>
            <img src="/assets/ptrlst.png" alt="" />
            <p>Relation PtrLst</p>
          </li>
          <hr />
          <li>
            <img src="/assets/mouse2.png" alt="" />
            <p>Left Click: chldren course</p>
          </li>
          <li>
            <img src="/assets/mouse2.png" alt="" />
            <p>Right Click: parent course</p>
          </li>
          <li>
            <img src="/assets/mouse2.png" alt="" />
            <p>Middle Click: open the node in a new panel</p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import Viewer from "../viewer";
import Spinal from "../spinal";

export default {
  name: "AppGraph",
  data() {
    return {
      show: 0
    };
  },
  mounted() {
    const spinal = Spinal.getInstance();
    this.viewer = new Viewer(spinal);
    this.viewer.init(this.$refs.appGraph, this.server_id);
  },
  methods: {
    resize() {
      this.viewer.resize.call(this.viewer);
    },
    showLegend() {
      document.getElementById("myDropdown").classList.toggle("show");
    }
  },
  props: {
    server_id: { require: true, type: Number }
  }
};
</script>

<style lang="scss" scoped>
* {
  padding: 0;
  margin: 0;
}
.app-Graph {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
$blue: #666;

.dropdown {
  position: relative;
  float: right;
}

.dropdown-content {
  display: none;
  position: absolute;
  right: 0px;
  background-color: #222;
  min-width: 340px;
  overflow: auto;
  box-shadow: 0px 8px 16px 0px rgba(76, 69, 69, 0.2);
  z-index: 1;
  font-family: "Gill Sans", sans-serif;
}

.show {
  display: block;
}

.button {
  cursor: help;
  outline: none;
  margin-right: 3px;
  width: 25px;
  height: 25px;
  background-color: $blue;
  border: 2px solid black;
  border-radius: 35px;
  text-decoration: none;
  padding: 5px 5px;
  color: black;
  display: inline-block;
  &:hover {
    background-color: rgb(187, 184, 184);
    color: $blue;
    border: 2px solid black;
  }
}
.button img {
  font-size: 24px;
  cursor: help;
  margin-left: -5px;
  margin-top: -5px;
  width: 21px;
  height: 21px;
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
