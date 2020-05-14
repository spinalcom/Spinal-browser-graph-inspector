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
    <div class="message">
      {{ info() ? message : emptymessage }}
    </div>
    <ul>
      <elementVueRec :attrName="''" :sever_Id="server_id" class="element">
      </elementVueRec>
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
      server_id: -1,
      message: "Please Browse The Graph To View Node Information",
      emptymessage: ""
    };
  },
  components: {
    elementVueRec
  },
  methods: {
    info() {
      if (this.server_id === -1) {
        return true;
      } else return false;
    }
  },
  mounted() {
    EventBus.$on("realNodeElement", realNode => {
      this.server_id = realNode._server_id;
    });
  }
};
</script>

<style>
.element {
  font-family: sans-serif;
}
.message {
  min-width: 350px;
  position: absolute;
  color: #999;
  text-align: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
