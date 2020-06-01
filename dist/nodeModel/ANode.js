"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const spinal_model_graph_1 = require("spinal-model-graph");
class ANode {
    constructor(node) {
        this.id = node.getId().get();
        this._serverId = node._server_id;
        this.name = node.getName().get();
        this.category = "undef";
        this.hasChildren = false;
        this.children = [];
        this._children = null;
    }
    getChildren(node) {
        return Promise.resolve([]);
    }
    static getActifChild(node) {
        if (Array.isArray(node.children)) {
            return node.children;
        }
        else if (Array.isArray(node._children))
            return node._children;
        else {
            node.children = [];
            return node.children;
        }
    }
    static checkChildExist(id, node) {
        let children = ANode.getActifChild(node);
        for (const child of children) {
            if (child.data.id === id) {
                return true;
            }
        }
        return false;
    }
    isOpen() {
        return (this._children === null);
    }
    getColor() {
        if (!this.isOpen() && this.hasChildren)
            return "#f00";
        return "#ff4433";
    }
    static collapseOrOpen(node) {
        if (Array.isArray(node._children)) {
            node.children = node._children;
            node._children = null;
            return false;
        }
        else {
            node._children = node.children;
            node.children = null;
            return true;
        }
    }
    static collapseOrOpenParent(node) {
        if (Array.isArray(node._parent)) {
            node.parent = node._parent;
            node._parent = null;
            return false;
        }
        else {
            node._parent = node.parent;
            node.parent = null;
            return true;
        }
    }
    static updateChildren(node, nodeFactory) {
        return __awaiter(this, void 0, void 0, function* () {
            const children = yield node.data.getChildren();
            const c = ANode.getActifChild(node);
            for (const child of children) {
                if (ANode.checkChildExist(child.getId().get(), node)) {
                    // update node
                    continue;
                }
                const n = nodeFactory.createNode(child, node);
                c.push(n);
            }
        });
    }
    static updateParent(node, nodeFactory) {
        return __awaiter(this, void 0, void 0, function* () {
            const promise = [];
            const realNode = (spinal_core_connectorjs_type_1.FileSystem._objects[node.data._serverId]);
            if (realNode instanceof spinal_model_graph_1.SpinalNode) {
                for (const [, listnode] of realNode.parents) {
                    for (let index = 0; index < listnode.length; index++) {
                        promise.push(listnode[index].load());
                    }
                }
                const parents = yield Promise.all(promise);
                node.parent = [];
                for (const parent of parents) {
                    const n = nodeFactory.createNode(parent);
                    node.parent.push(n);
                }
            }
            else {
                const parent = yield realNode.parent.load();
                const s = nodeFactory.createNode(parent);
                node.parent = [s];
            }
        });
    }
}
exports.default = ANode;
//# sourceMappingURL=ANode.js.map