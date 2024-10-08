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
  <div class="dropdown">
    <button id="button" class="button" @click="legend = !legend">
      <img src="../assets/info.png" alt="" />
    </button>

    <div id="myDropdown" class="dropdown-content" :class="{ show: legend }">
      <table class="legend-table-graph-inspector">
        <tr>
          <th>
            <img width="20px" src="../assets/start.png?width=20" alt="" />
          </th>
          <th>Strating Node</th>
        </tr>

        <tr>
          <th>
            <img width="20px" src="../assets/simplenode.png?width=20" alt="" />
          </th>
          <th>Simple Node</th>
        </tr>
        <tr>
          <th>
            <img width="20px" src="../assets/lastnode.png?width=20" alt="" />
          </th>
          <th>Leaf Node</th>
        </tr>
        <tr>
          <th>
            <img width="20px" src="../assets/ptrlst.png?width=20" alt="" />
          </th>
          <th>Relation PtrLst</th>
        </tr>
        <tr>
          <th>
            <img width="20px" src="../assets/lstptr.png?width=20" alt="" />
          </th>
          <th>Relation LstPtr</th>
        </tr>
        <tr style="border-bottom: 1px solid #ddd">
          <th><img width="20px" src="../assets/ref.png?width=20" alt="" /></th>
          <th>Relation Ref</th>
        </tr>
        <tr>
          <th><v-icon>mdi-mouse-left-click-outline</v-icon></th>
          <th>open / close the selection</th>
        </tr>
        <tr style="border-bottom: 1px solid #ddd">
          <th><v-icon>mdi-mouse-right-click-outline</v-icon></th>
          <th>select only</th>
        </tr>
      </table>
      <p style="text-align: center">
        <img src="../assets/childcourse.png" class="typecourse1" alt="" /> or
        <img src="../assets/parentcourse.png" class="typecourse2" alt="" /> to
        select the method to traverse the graph
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
let legend = ref(false);
</script>

<style scoped>
* {
  padding: 0;
  margin: 0;
}
.dropdown {
  position: relative;
  float: right;
}
.dropdown-content {
  display: none;
  border: white solid 1px;
  border-radius: 13px;
  position: absolute;
  right: 0px;
  background-color: #222;
  min-width: 248px;
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
.button :hover {
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
.legend-table-graph-inspector {
  border-collapse: collapse;
  margin: 6px 0;
  width: 100%;
  font-family: sans-serif;
}
.legend-table-graph-inspector * {
  text-align: left;
}
.legend-table-graph-inspector th:first-child {
  text-align: center;
}

.typecourse1 {
  width: 80px;
}
.typecourse2 {
  width: 70px;
}
</style>
