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
import { D3Node } from "./D3Node";
import { SpinalAnyNode } from "./types";
import { FileSystem } from "spinal-core-connectorjs_type";
import { SpinalNode } from "spinal-model-graph";

abstract class ANode {
  id: string;
  _serverId: number;
  name: string;
  type: string;
  category: string;
  contextIds: string[];
  hasChildren: boolean;
  children: ANode[];
  _children: ANode[];

  constructor(node: SpinalAnyNode) {
    this.id = node.getId().get();
    this._serverId = node._server_id;
    this.name = node.getName() ? node.getName().get() : undefined
    this.category = "undef";
    this.hasChildren = false;
    this.children = [];
    this._children = null;
  }

  getChildren(node: D3Node): Promise<SpinalAnyNode[]> {
    return Promise.resolve([]);
  }


  static getActifChild(node: D3Node): D3Node[] {

    if (Array.isArray(node.children)) {
      return node.children;
    } else if (Array.isArray(node._children))
      return node._children;
    else {
      node.children = [];
      return node.children;
    }
  }

  static checkChildExist(id: string, node: D3Node): boolean {
    let children = ANode.getActifChild(node);
    for (const child of children) {
      if (child.data.id === id) {
        return true;
      }
    }
    return false;

  }
  isOpen(): boolean {
    return (this._children === null);
  }

  getColor(): string {
    if (!this.isOpen() && this.hasChildren)
      return "#f00";
    return "#ff4433"
  }

  static collapseOrOpen(node: D3Node): boolean {
    if (Array.isArray(node._children)) {
      node.children = node._children;
      node._children = null;
      return false;
    } else {
      node._children = node.children;
      node.children = null;
      return true;
    }

  }

  static collapseOrOpenParent(node: D3Node): boolean {
    if (Array.isArray(node._parent)) {
      node.parent = node._parent;
      node._parent = null;
      return false;
    } else {
      node._parent = node.parent;
      node.parent = null;
      return true;
    }

  }


  static async updateChildren(node: D3Node, nodeFactory) {
    const children: SpinalAnyNode[] = await node.data.getChildren()

    const c = ANode.getActifChild(node)
    for (const child of children) {

      if (ANode.checkChildExist(child.getId().get(), node)) {
        // update node
        continue;
      }



      const n = nodeFactory.createNode(child, node)
      c.push(n)
    }

  }

  static async updateParent(node: D3Node, nodeFactory) {
    const promise = [];
    const realNode = (FileSystem._objects[node.data._serverId]);
    if (realNode instanceof SpinalNode) {
      for (const [, listnode] of realNode.parents) {
        for (let index = 0; index < listnode.length; index++) {
          promise.push(listnode[index].load());
        }
      }
      const parents = await Promise.all(promise);
      node.parent = [];
      for (const parent of parents) {

        const n = nodeFactory.createNode(parent)
        node.parent.push(n)
      }
    } else {
      const parent = await realNode.parent.load();
      const s = nodeFactory.createNode(parent);
      node.parent = [s];

    }

  }

}
export default ANode
