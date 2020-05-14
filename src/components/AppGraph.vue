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
    <legendVueGraph></legendVueGraph>
    <div id="rates">
      <button id="course" v-on:click="setCourse">
        {{ courseType }}
      </button>
    </div>
  </div>
</template>

<script>
import Viewer from "../viewer";
import Spinal from "../spinal";
import EventBus from "./event-bus";
import legendVueGraph from "./legendVueGraph";

export default {
  name: "AppGraph",
  data() {
    return {
      state: false,
      legend: false,
      courseType: "Children Course"
    };
  },
  components: {
    legendVueGraph
  },
  mounted() {
    const spinal = Spinal.getInstance();
    this.viewer = new Viewer(spinal);
    this.viewer.init(this.$refs.appGraph, this.server_id);
  },
  methods: {
    setCourse() {
      this.state = !this.state;
      this.viewer.stateCourse = this.state;
      if (this.courseType === "Children Course")
        this.courseType = "Parent Course";
      else this.courseType = "Children Course";
    },
    resize() {
      this.viewer.resize.call(this.viewer);
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
.typecourse {
  vertical-align: middle;
  width: 100px;
  height: 21px;
}
#course {
  cursor: alias;
  outline: none;
  color: #fff;
  background: #666;
  padding: 5px;
  display: inline-block;
  border: none;
  transition: all 0.4s ease 0s;
  font-family: "Gill Sans", sans-serif;
  &:hover {
    text-shadow: 0px 0px 6px rgba(255, 255, 255, 1);
    -webkit-box-shadow: 0px 5px 40px -10px rgba(0, 0, 0, 0.57);
    -moz-box-shadow: 0px 5px 40px -10px rgba(0, 0, 0, 0.57);
    box-shadow: 0px 5px 40px -10px rgba(0, 0, 0, 0.57);
    transition: all 0.4s ease 0s;
  }
}
</style>
