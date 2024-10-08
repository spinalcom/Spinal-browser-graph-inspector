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
  <div ref="appDbInspector" class="app-Db-Inspector">
    <legendVueInspector></legendVueInspector>
    <v-dialog width="auto" min-width="400" max-width="600" v-model="dialog">
      <v-card title="Edit">
        <v-card-text>
          <v-text-field
            v-if="model_type == 'Str'"
            v-model="tmpStr"
            label="Str"
          ></v-text-field>
          <v-number-input
            v-else-if="model_type == 'Val'"
            :reverse="false"
            controlVariant="default"
            label="Val"
            v-model="tmpVal"
            :hideInput="false"
            :inset="false"
          ></v-number-input>
          <v-select
            label="Bool"
            :items="[
              { title: 'true', value: true },
              { title: 'false', value: false },
            ]"
            variant="solo"
            v-if="model_type == 'Bool'"
            v-model="tmpBool"
          ></v-select>
          <v-card-actions>
            <v-btn text="Close" color="warning" @click="reset()"></v-btn>
            <v-spacer></v-spacer>
            <v-btn
              text="Confirm"
              color="primary"
              @click="onConfirmEdit()"
            ></v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { dbInspector } from "../dbInspector";
import eventBus from "./event-bus";
import legendVueInspector from "./legendVueInspector";
import { Str, Val, Bool, FileSystem } from "spinal-core-connectorjs";

export default {
  name: "AppDbInspector",
  data() {
    return {
      server_id: -1,
      legend: false,
      dialog: false,
      selectedServerIdModel: null,
      tmpStr: "",
      tmpVal: 0,
      tmpBool: false,
    };
  },
  components: {
    legendVueInspector,
  },
  mounted() {
    dbInspector(this.$refs.appDbInspector);
    eventBus.$on("openEditDbInspector", (selectedServerIdModel) => {
      if (selectedServerIdModel) {
        const model = FileSystem._objects[selectedServerIdModel];
        console.log(model);
        if (
          model instanceof Val ||
          model instanceof Str ||
          model instanceof Bool
        ) {
          this.selectedServerIdModel = selectedServerIdModel;
          if (model instanceof Str) this.tmpStr = model.get();
          if (model instanceof Val) this.tmpVal = model.get();
          if (model instanceof Bool) this.tmpBool = model.get();
          this.dialog = true;
        }
      }
    });
  },
  computed: {
    model_type() {
      if (this.selectedServerIdModel) {
        return (
          FileSystem._objects[this.selectedServerIdModel]?.constructor.name ||
          ""
        );
      }
      return "";
    },
  },
  methods: {
    resize() {},
    showLegend() {
      this.legend = !this.legend;
    },
    reset() {
      this.dialog = false;
      this.selectedServerIdModel = null;
    },
    async onConfirmEdit() {
      if (this.selectedServerIdModel) {
        const model = FileSystem._objects[this.selectedServerIdModel];
        if (model instanceof Str) {
          model.set(this.tmpStr);
        } else if (model instanceof Val) {
          model.set(this.tmpVal);
        } else if (model instanceof Bool) {
          model.set(this.tmpBool);
        }
        this.reset();
      }
    },
  },
};
</script>

<style scoped>
* {
  padding: 0;
  margin: 0;
}
.app-Db-Inspector {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
