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
import { SpinalNode } from "spinal-model-graph"
import ANode from "./ANode";
import { FileSystem } from "spinal-core-connectorjs_type";
import NodeRelationG from "./NodeRelationG"
import { D3Node } from "./D3Node";
import { BaseSpinalRelation } from "./types";

class NodeG extends ANode {

  constructor(node: SpinalNode<any>) {
    super(node);
    this.category = "node";
    this.type = node.getType().get();
    this.hasChildren = node.children.keys().length > 0 ? true : false
  }

  getChildren(): Promise<BaseSpinalRelation[]> {
    const arr = []
    const realNode = <SpinalNode<any>>(FileSystem._objects[this._serverId]);
    for (const [, maprelation] of realNode.children) {
      for (const [, relation] of maprelation) {
        arr.push(relation);
      }
    }
    return Promise.resolve(arr);
  }
}
export default NodeG
