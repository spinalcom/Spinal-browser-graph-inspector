"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ANode_1 = require("./ANode");
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
class NodeG extends ANode_1.default {
    constructor(node) {
        super(node);
        this.category = "node";
        this.type = node.getType().get();
        this.hasChildren = node.children.keys().length > 0 ? true : false;
    }
    getChildren() {
        const arr = [];
        const realNode = (spinal_core_connectorjs_type_1.FileSystem._objects[this._serverId]);
        for (const [, maprelation] of realNode.children) {
            for (const [, relation] of maprelation) {
                arr.push(relation);
            }
        }
        return Promise.resolve(arr);
    }
}
exports.default = NodeG;
//# sourceMappingURL=NodeG.js.map