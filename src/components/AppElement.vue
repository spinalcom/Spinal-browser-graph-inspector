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
      <tbody>
        <tr v-for="ligne in target" :key="ligne.key" class="active-row">
          <td @click="copyData(ligne.key)">{{ ligne.key }}</td>
          <td @click="copyData(ligne.value)">{{ ligne.value }}</td>
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
import {
  SpinalNode,
  SpinalRelationLstPtr,
  SpinalRelationPtrLst,
  SpinalRelationRef,
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
  components: {},
  methods: {
    info() {
      if (this.server_id === -1) {
        return true;
      } else return false;
    },
    async copyData(text) {
      try {
        await navigator.clipboard.writeText(text);
      } catch(e) {
          alert('Cannot copy');
      }
    },
    handleAtomic(model, key = model.constructor.name, force = false) {
      if (
        model instanceof Str ||
        model instanceof Bool ||
        model instanceof Val
      ) {
        this.target.push({ key, value: model.get() });
        return true;
      } else if (
        model instanceof Ptr ||
        model instanceof Pbr
        ) {
        this.target.push({ key, value: `target = ${model.data.value}` });
      } else if (force) {
        this.target.push({ key, value: "" });
        return true;
      }
      return false;
    },
    handleSpinalNode(model) {
      if (model instanceof SpinalNode) {
        return this.handleobject(model.info);
      }
      return false;
    },
    handleobject(model) {
      for (const key of model._attribute_names) {
        if (Object.hasOwnProperty.call(model, key)) {
          const element = model[key];
          this.handleAtomic(element, key, true);
        }
      }
      return true;
    },
    handleLst(model) {
      if (model instanceof Lst) {
        for (let idx = 0; idx < model.length; idx++) {
          const element = model[idx];
          this.handleAtomic(element, idx, true);
        }
        return true;
      }
      return false;
    },
    handleSpinalRelation(model) {
      if (
        model instanceof SpinalRelationLstPtr ||
        model instanceof SpinalRelationRef
      ) {
        this.target.push(
          { key: "name", value: model.name.get() },
          { key: "Nb Childrens", value: model.children.length }
        );
        return true;
      } else if (
        model instanceof SpinalRelationPtrLst 
      ) {
        this.target.push(
          { key: "name", value: model.name.get() },
          { key: "Nb Childrens", value: model.children.info.ids.length }
        );
        return true;
      }
      return false
    }
  },
  mounted() {
    EventBus.$on("realNodeElement", model => {
      this.server_id = model._server_id;
      this.target = [{ key: "serverId", value: model._server_id }];
      const fcts = [
        this.handleSpinalNode,
        this.handleSpinalRelation,
        this.handleAtomic,
        this.handleLst,
        this.handleobject
      ];
      for (const fct of fcts) {
        if (fct(model)) return;
      }
    });
  }
};
</script>

<style>
#app-Element {
  display: flex;
  justify-content: center;
}
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
  margin: 8px 0 25px 0;
  font-size: 0.9em;
  font-family: sans-serif;
  min-width: 400px;
  width: calc(100% - 16px);
}

/* .styled-table thead tr {
  color: #ffffff;
  text-align: left;
} */
.styled-table th,
.styled-table td {
  padding: 12px 15px;
}

.styled-table tbody tr {
  border-bottom: 1px solid #dddddd;
}

.styled-table tbody tr.active-row {
  color: #fff;
}
.styled-table tbody tr.active-row td {
  cursor: pointer;
}
.styled-table tbody tr.active-row td:hover {
  background-color: #eeeeee0f;
}

</style>
