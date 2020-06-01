import { D3Node } from "./D3Node";
import { SpinalAnyNode } from "./types";
declare class NodeFactory {
    nodeMap: Map<number, D3Node>;
    constructor();
    checkParentExist(parent: D3Node, node: D3Node): boolean;
    createNode(node: SpinalAnyNode, parent?: D3Node): D3Node;
}
export default NodeFactory;
