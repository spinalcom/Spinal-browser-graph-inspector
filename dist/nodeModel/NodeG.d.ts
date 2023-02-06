import { SpinalNode } from "spinal-model-graph";
import ANode from "./ANode";
import { BaseSpinalRelation } from "./types";
declare class NodeG extends ANode {
    constructor(node: SpinalNode<any>);
    getChildren(): Promise<BaseSpinalRelation[]>;
}
export default NodeG;
