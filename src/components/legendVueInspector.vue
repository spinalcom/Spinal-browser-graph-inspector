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

<template>
  <div class="dropdown1">
    <button id="button" class="button" v-on:click="showLegend">
      <img src="../assets/info.png?width=20" alt="" />
    </button>
    <div id="myDropdown1" class="dropdown1-content" :class="{ show: legend }">
      <table class="legend-table-inspector">
        <tr>
          <th>
            <img width="20px" src="../assets/simplenode.png?width=20" alt="" />
          </th>
          <th>Closed Model</th>
        </tr>
        <tr>
          <th><img width="20px" src="../assets/open.png?width=20" alt="" /></th>
          <th>Open Or Void Model</th>
        </tr>
        <tr>
          <th><img width="20px" src="../assets/last.png?width=20" alt="" /></th>
          <th>Atomic Model</th>
        </tr>
        <tr>
          <th><img width="20px" src="../assets/ptr.png?width=20" alt="" /></th>
          <th>Closed Ptr Or Pbr</th>
        </tr>
        <tr>
          <th><img width="20px" src="../assets/last.png?width=20" alt="" /></th>
          <th>Open Ptr Or Pbr</th>
        </tr>
        <tr>
          <th>
            <img width="20px" src="../assets/start.png?width=20" alt="" />
          </th>
          <th>Atomic Model</th>
        </tr>
        <tr>
          <th><img width="20px" src="../assets/ids.png?width=20" alt="" /></th>
          <th>Closed Lst</th>
        </tr>
        <tr style="border-bottom: 1px solid #ddd">
          <th>
            <img width="20px" src="../assets/idsopen.png?width=20" alt="" />
          </th>
          <th>Open Lst</th>
        </tr>
        <tr>
          <th><v-icon>mdi-mouse-left-click-outline</v-icon></th>
          <th>Open Object Attribut</th>
        </tr>
        <tr>
          <th><v-icon>mdi-mouse-right-click-outline</v-icon></th>
          <th>
            <p>Edit (only for Str, Val, Bool)</p>
          </th>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "legendVueInspector",
  data() {
    return {
      legend: false,
    };
  },
  methods: {
    showLegend() {
      this.legend = !this.legend;
    },
  },
};
</script>

<style scoped>
* {
  padding: 0;
  margin: 0;
}
.dropdown1 {
  position: relative;
  float: right;
}
.dropdown1-content {
  display: none;
  position: absolute;
  border: white solid 1px;
  border-radius: 13px;
  right: 0px;
  background-color: #222;
  min-width: 220px;
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
  outline: none;
  margin-right: 3px;
  width: 24px;
  height: 24px;
  background-color: #666;
  border: 2px solid black;
  border-radius: 35px;
  text-decoration: none;
  padding: 5px 5px;
  color: black;
  display: inline-block;
}
.button:hover {
  background-color: rgb(187, 184, 184);
  color: #666;
  border: 2px solid black;
}

.button img {
  font-size: 24px;
  cursor: help;
  margin-left: -6px;
  margin-top: -6px;
  width: 22px;
  height: 22px;
}
.legend-table-inspector {
  border-collapse: collapse;
  margin: 6px 0;
  width: 100%;
  font-family: sans-serif;
}
.legend-table-inspector * {
  text-align: left;
}
.legend-table-inspector th:first-child {
  text-align: center;
}
.legend-table-inspector img {
  vertical-align: middle;
}
div.tooltip {
  position: absolute;
  text-align: center;
  width: 200px;
  height: 100px;
  padding: 2px;
  font: 12px sans-serif;
  background: lightsteelblue;
  pointer-events: none;
}
</style>
