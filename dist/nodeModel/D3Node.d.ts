import NodeRelationG from "./NodeRelationG";
import NodeG from "./NodeG";
export interface D3Node {
    data: NodeG | NodeRelationG;
    height?: number;
    depth?: number;
    parent: D3Node[];
    _parent?: D3Node[];
    children?: D3Node[];
    _children?: D3Node[];
    id?: number;
    index?: number;
    isRoot?: boolean;
    x?: number;
    y?: number;
    vy?: number;
    vx?: number;
    fx?: any;
    fy?: any;
}
