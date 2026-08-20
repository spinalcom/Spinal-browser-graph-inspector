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
  <div ref="appGraph" class="app-Graph">
    <legendVueGraph></legendVueGraph>
    <div class="top-controls">
      <div id="rates">
        <button id="course" v-on:click="setCourse">
          {{ courseType }}
        </button>
      </div>
      <div class="search-panel">
        <input
          v-model="searchQuery"
          class="search-input"
          type="text"
          placeholder="Search node name..."
          @input="onSearchInput"
          @keydown.enter.prevent="nextSearchResult"
        />
        <button
          class="search-btn"
          @click="prevSearchResult"
          :disabled="matchCount === 0"
        >
          Prev
        </button>
        <button
          class="search-btn"
          @click="nextSearchResult"
          :disabled="matchCount === 0"
        >
          Next
        </button>
        <span class="search-count">
          {{ searchPosition }} / {{ matchCount }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import Viewer from "../viewerDag";
import SpinalIO from "../spinal";
import legendVueGraph from "./legendVueGraph";

export default {
  name: "AppGraph",
  data() {
    return {
      state: false,
      legend: false,
      courseType: "Children Course",
      searchQuery: "",
      matchCount: 0,
      searchPosition: 0,
    };
  },
  components: {
    legendVueGraph,
  },
  mounted() {
    const spinal = SpinalIO.getInstance();
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
    onSearchInput() {
      const state = this.viewer.setSearchQuery(this.searchQuery);
      this.matchCount = state.count;
      this.searchPosition = state.current;
    },
    nextSearchResult() {
      const state = this.viewer.selectNextSearchMatch();
      this.matchCount = state.count;
      this.searchPosition = state.current;
    },
    prevSearchResult() {
      const state = this.viewer.selectPreviousSearchMatch();
      this.matchCount = state.count;
      this.searchPosition = state.current;
    },
  },
  props: {
    server_id: { require: true, type: Number },
  },
};
</script>

<style scoped>
* {
  padding: 0;
  margin: 0;
}
.app-Graph {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
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

.search-panel {
  display: flex;
  gap: 6px;
  align-items: center;
}

.search-input {
  width: 200px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  background: rgba(20, 20, 20, 0.8);
  color: #fff;
  padding: 4px 8px;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-btn {
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  background: rgba(80, 80, 80, 0.9);
  color: #fff;
  padding: 4px 8px;
  cursor: pointer;
}

.search-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.search-count {
  color: #fff;
  min-width: 50px;
  text-align: center;
  font-size: 12px;
}
</style>
