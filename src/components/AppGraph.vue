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
  <div ref="appGraph" class="app-Graph"></div>
</template>

<script>
import Viewer from "../viewer";
import Spinal from "../spinal";

export default {
  name: "AppGraph",
  mounted() {
    const spinal = Spinal.getInstance();
    this.viewer = new Viewer(spinal);
    this.viewer.init(this.$refs.appGraph);
  },
  methods: {
    resize() {
      this.viewer.resize.call(this.viewer);
    }
  }
};
</script>

<style>
.app-Graph {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
