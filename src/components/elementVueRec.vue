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
  <ul v-if="items.length > 0">
    {{
      name
    }}
    <elementVueRec
      v-for="item in items"
      :key="item.sever_Id"
      :attrName="item.attrName"
      :sever_Id="item.sever_Id"
    >
    </elementVueRec>
  </ul>
</template>

<script>
import Vue from "vue";
import {
  FileSystem,
  Obj,
  TypedArray,
  Lst,
  Str,
  Val,
  Bool
} from "spinal-core-connectorjs_type";
const elementVueRec = Vue.extend({
  name: "elementVueRec",
  components: {
    elementVueRec
  },
  props: {
    attrName: {
      default: () => {
        return "";
      },
      type: String
    },
    sever_Id: {
      require: true,
      type: Number,
      default: () => {
        return -1;
      }
    }
  },
  data() {
    return {
      name: "",
      items: []
    };
  },
  methods: {
    update() {
      if (this.sever_Id === -1) {
        return;
      }
      const node = FileSystem._objects[this.sever_Id];
      if (node instanceof Ptr) {
        if (this.attrName === "") {
          this.name = node.constructor.name;
        } else {
          this.name = `<strong>${this.attrName}: ${node.constructor.name}</strong>`;
        }
      } else if (
        node instanceof Str ||
        node instanceof Val ||
        node instanceof Bool
      ) {
        if (this.attrName === "") {
          this.name = node.get();
        } else {
          this.name = `${this.attrName}: ${node.get()}`;
        }
      } else if (node instanceof TypedArray) {
        if (this.attrName === "") {
          this.name = node.constructor.name;
        } else {
          this.name = `${this.attrName}: ${node.constructor.name}`;
        }
      } else if (node instanceof Lst) {
        if (this.attrName === "") {
          this.name = node.constructor.name;
        } else {
          this.name = `${this.attrName}: ${node.constructor.name}`;
        }
        for (let index = 0; index < node.length; index++) {
          this.items.push({
            attrName: index.toString(),
            sever_Id: node[index]._server_id
          });
        }
      } else {
        if (this.attrName === "") {
          this.name = node.constructor.name;
        } else {
          this.name = `${this.attrName}: ${node.constructor.name}`;
        }
        for (let index = 0; index < node._attribute_names.length; index++) {
          const attr = node._attribute_names[index];
          this.items.push({
            attrName: attr,
            sever_Id: node[attr]._server_id
          });
        }
      }
    }
  },
  mounted() {
    this.update();
  },
  watch: {
    sever_Id() {
      this.items = [];
      this.update();
    }
  }
});
export default elementVueRec;
</script>

<style>
ul {
  margin: 10px;
  padding: 10px;
}
li {
  margin: 10px;
  padding: 10px;
}
td {
  text-align: left;
  padding: 8px;
  border: 3px solid #44475c;

  border-right: 2px solid #7d82a8;
}
table td:last-child {
  border-right: none;
}
table tbody tr:nth-child(2n) td {
  background: #d4d8f9;
}
</style>
