"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_model_graph_1 = require("spinal-model-graph");
const NodeG_1 = require("./NodeG");
const NodeRelationG_1 = require("./NodeRelationG");
class NodeFactory {
    constructor() {
        this.nodeMap = new Map();
    }
    checkParentExist(parent, node) {
        if (node.parent)
            for (const p of node.parent) {
                if (p.data._serverId === parent.data._serverId) {
                    return true;
                }
            }
        return false;
    }
    createNode(node, parent = null) {
        if (this.nodeMap.has(node._server_id)) {
            let d3Node = this.nodeMap.get(node._server_id);
            if (parent && !this.checkParentExist(parent, d3Node)) {
                d3Node.parent.push(parent);
            }
            return d3Node;
        }
        let aNode;
        if (node instanceof spinal_model_graph_1.SpinalNode) {
            aNode = new NodeG_1.default(node);
        }
        else {
            aNode = new NodeRelationG_1.default(node);
        }
        let n = {
            parent: parent ? [parent] : null,
            data: aNode,
        };
        this.nodeMap.set(aNode._serverId, n);
        return n;
    }
}
// const nodeFactory = new NodeFactory()
// export default nodeFactory;
exports.default = NodeFactory;
//# sourceMappingURL=NodeFactory.js.map