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
  <div class="dropdown1">
    <button id="button" class="button" v-on:click="showLegend">
      <img src="/assets/info.png" alt="" />
    </button>
    <div id="myDropdown1" class="dropdown1-content" :class="{ show: legend }">
      <ul class="demo1">
        <li>
          <img src="/assets/simplenode.png" alt="" />
          <p>Closed Model</p>
        </li>
        <li>
          <img src="/assets/open.png" alt="" />
          <p>Open Or Void Model</p>
        </li>
        <li>
          <img src="/assets/last.png" alt="" />
          <p>Atomic Model</p>
        </li>
        <li>
          <img src="/assets/ptr.png" alt="" />
          <p>Closed Ptr Or Pbr</p>
        </li>
        <li>
          <img src="/assets/start.png" alt="" />
          <p>Open Ptr Or Pbr</p>
        </li>

        <li>
          <img src="/assets/ids.png" alt="" />
          <p>Closed Lst</p>
        </li>
        <li>
          <img src="/assets/idsopen.png" alt="" />
          <p>Open Lst</p>
        </li>
        <hr />
        <li>
          <img src="/assets/mouse2.png" alt="" />
          <p>Left Click: Open Object Attribut</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "legendVueInspector",
  data() {
    return {
      legend: false
    };
  },
  methods: {
    showLegend() {
      this.legend = !this.legend;
    }
  }
};
</script>

<style lang="scss" scoped>
* {
  padding: 0;
  margin: 0;
}
$blue: #666;
.dropdown1 {
  position: relative;
  float: right;
}
.dropdown1-content {
  display: none;
  position: absolute;
  right: 0px;
  background-color: #222;
  min-width: 270px;
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
  margin-left: -6px;
  margin-top: -6px;
  width: 22px;
  height: 22px;
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
  font-size: 14px;
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
