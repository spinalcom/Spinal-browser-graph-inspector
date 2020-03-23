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
  <div id="app-Element">
    <ul>
      <elementVueRec :attrName="''" :sever_Id="server_id"></elementVueRec>
    </ul>
  </div>
</template>

<script>
import Viewer from "../viewer";
import Spinal from "../spinal";
import Vue from "vue";
import EventBus from "./event-bus";
import elementVueRec from "./elementVueRec.vue";

export default {
  name: "AppElement",
  data() {
    return {
      server_id: -1
    };
  },
  components: {
    elementVueRec
  },
  mounted() {
    EventBus.$on(".droite", realNode => {
      this.server_id = realNode.info._server_id;
    });
  }
};
</script>

<style>
ul {
  list-style: none;
  margin-left: 0;
  padding-left: 0;
}
li {
  margin-bottom: 15px; /* à adapter */
}
</style>
