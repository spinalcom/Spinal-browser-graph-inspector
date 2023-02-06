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
    <table class="styled-table">
      <thead>
        <tr>
          <th>Info Node</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ligne in target" :key="ligne.key" class="active-row">
          <td>{{ ligne.key }}</td>
          <td>{{ ligne.value }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import Viewer from "../viewer";
import Spinal from "../spinal";
import Vue from "vue";
import EventBus from "./event-bus";
import elementVueRec from "./elementVueRec.vue";
import {
  SpinalNode,
  SpinalRelationLstPtr,
  BaseSpinalRelation
} from "spinal-model-graph";

export default {
  name: "AppElement",
  data() {
    return {
      server_id: -1,
      message: "Please Browse The Graph To View Node Information",
      emptymessage: "",
      target: []
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
      this.target = [{ key: "serverId", value: realNode._server_id }];
      if (realNode instanceof SpinalNode) {
        this.target.push(
          { key: "staticId", value: realNode.info.id.get() },
          { key: "name", value: realNode.info.name.get() },
          { key: "type", value: realNode.info.type.get() }
        );
      } else if (realNode instanceof BaseSpinalRelation) {
        console.log(realNode);
      }
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
  font-family: sans-serif;
  white-space: nowrap;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.styled-table {
  border-collapse: collapse;
  margin: 25px 0;
  font-size: 0.9em;
  font-family: sans-serif;
  min-width: 400px;
}

.styled-table thead tr {
  color: #ffffff;
  text-align: left;
}
.styled-table th,
.styled-table td {
  padding: 12px 15px;
}

.styled-table tbody tr {
  border-bottom: 1px solid #dddddd;
}

.styled-table tbody tr.active-row {
  font-weight: bold;
  color: #009879;
}
</style>
