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
  <div ref="GlTemplate" style="position: absolute; overflow: hidden">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const GlTemplate = ref<null | HTMLElement>(null);

const numberToPixels = (value: number): string => {
  return value.toString(10) + "px";
};

const setPosAndSize = (
  left: number,
  top: number,
  width: number,
  height: number
): void => {
  if (GlTemplate.value) {
    const el = GlTemplate.value as HTMLElement;
    el.style.left = numberToPixels(left);
    el.style.top = numberToPixels(top);
    el.style.width = numberToPixels(width);
    el.style.height = numberToPixels(height);
  }
};

const setVisibility = (visible: boolean): void => {
  if (GlTemplate.value) {
    const el = GlTemplate.value as HTMLElement;
    if (visible) {
      el.style.display = "";
    } else {
      el.style.display = "none";
    }
  }
};

const setZIndex = (value: string): void => {
  if (GlTemplate.value) {
    const el = GlTemplate.value as HTMLElement;
    el.style.zIndex = value;
  }
};

defineExpose({
  setPosAndSize,
  setVisibility,
  setZIndex,
});
</script>
