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
  <div ref="appForceGraph" class="app-graph-force">
    <legendVueGraph></legendVueGraph>
    <div class="top-controls">
      <div id="rates">
        <button id="course" v-on:click="setCourse">
          {{ courseType }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Viewer from "../viewerForce";
import SpinalIO from "../spinal";
import legendVueGraph from "./legendVueGraph";

export default {
  name: "AppForceGraph",
  data() {
    return {
      state: false,
      courseType: "Children Course",
    };
  },
  components: { legendVueGraph },
  mounted() {
    const spinal = SpinalIO.getInstance();
    this.viewer = new Viewer(spinal);
    this.initialized = false;
  },
  methods: {
    tryInit() {
      if (this.initialized) return;
      const el = this.$refs.appForceGraph;
      if (!el || el.clientWidth === 0 || el.clientHeight === 0) return;
      this.initialized = true;
      this.viewer.init(el, this.server_id);
    },
    setCourse() {
      this.state = !this.state;
      this.viewer.stateCourse = this.state;
      this.courseType = this.state ? "Parent Course" : "Children Course";
    },
  },
  props: { server_id: { require: true, type: Number } },
};
</script>

<style scoped>
.app-graph-force {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #1e1e1e;
  color: #fff;
}
.top-controls {
  position: absolute;
  top: 5px;
  left: 5px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 6px;
  z-index: 2;
}
.typecourse {
  vertical-align: middle;
  width: 100px;
  height: 21px;
}
#course {
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  background: rgba(80, 80, 80, 0.9);
  color: #fff;
  padding: 4px 8px;
  cursor: pointer;
  outline: none;
}
#course:hover {
  background: rgba(95, 95, 95, 0.95);
}
</style>
