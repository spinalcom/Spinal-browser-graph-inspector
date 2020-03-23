/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

import ANode from "./ANode";
import { BaseSpinalRelation } from "./types";
import { FileSystem } from "spinal-core-connectorjs_type";
import { SpinalNode } from "spinal-model-graph";
import NodeG from "./NodeG";
import { D3Node } from "./D3Node";

class NodeRelationG extends ANode {

  constructor(node: BaseSpinalRelation) {
    super(node);
    this.category = "relation";
    this.type = node.getType();

    this.hasChildren = node.getNbChildren() > 0 ? true : false
  }

  getChildren(): Promise<SpinalNode<any>[]> {
    const realNode = <SpinalNode<any>>(FileSystem._objects[this._serverId]);
    return realNode.getChildren();
  }




}


export default NodeRelationG
