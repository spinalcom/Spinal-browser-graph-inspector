/*
 * Copyright 2024 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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

import type { D3Node } from "./D3Node";
import { SpinalNode } from "spinal-model-graph";
import type { SpinalAnyNode } from "./types";
import { NodeG } from "./NodeG";
import { NodeRelationG } from "./NodeRelationG";

export class NodeFactory {
  nodeMap: Map<number, D3Node>;

  constructor() {
    this.nodeMap = new Map();
  }

  checkParentExist(parent: D3Node, node: D3Node): boolean {
    if (node.parent)
      for (const p of node.parent) {
        if (p.data._serverId === parent.data._serverId) {
          return true;
        }
      }
    return false;
  }

  createNode(node: SpinalAnyNode, parent: D3Node | null = null): D3Node {
    if (this.nodeMap.has(node._server_id!)) {
      let d3Node = this.nodeMap.get(node._server_id!)!;
      if (parent && d3Node && !this.checkParentExist(parent, d3Node)) {
        d3Node.parent!.push(parent);
      }
      return d3Node;
    }
    let aNode;
    if (node instanceof SpinalNode) {
      aNode = new NodeG(node);
    } else {
      aNode = new NodeRelationG(node);
    }
    let n = {
      parent: parent ? [parent] : null,
      data: aNode,
    };
    this.nodeMap.set(aNode._serverId, n);
    return n;
  }
}
