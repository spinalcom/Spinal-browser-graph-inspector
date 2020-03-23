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
  <div class="app-header">
    <div class="logo"><img src="/assets/spinal.png" alt="" /></div>
    <div class="title">Graph Node Inspector</div>
    <div class="any"></div>
  </div>
</template>

<script>
export default {
  name: "AppHeader"
};
</script>

<style lang="scss" scoped>
.app-header {
  display: flex;
  align-content: center;
  justify-content: space-between;
  height: 64px;
  background-color: #eee;
  overflow: hidden;
  color: #fff;
}
.logo img {
  font-size: 24px;
  float: left;
  width: auto;
  height: 60px;
}
ul {
  float: left;
  width: calc(100%-200%);
  li {
    padding: 20px;
    display: inline-block;
    a {
      color: #fff;
      text-decoration: none;
    }
  }
}
.any {
  content: " ";
  width: 200px;
}
.title {
  color: black;
  align-self: center;
  height: 20px;
  text-align: center;
}
</style>
