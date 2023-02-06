import ANode from "./ANode";
import { BaseSpinalRelation } from "./types";
import { SpinalNode } from "spinal-model-graph";
declare class NodeRelationG extends ANode {
    constructor(node: BaseSpinalRelation);
    getChildren(): Promise<SpinalNode<any>[]>;
}
export default NodeRelationG;
