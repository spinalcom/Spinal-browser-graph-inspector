import { D3Node } from "./D3Node";
import { SpinalAnyNode } from "./types";
declare abstract class ANode {
    id: string;
    _serverId: number;
    name: string;
    type: string;
    category: string;
    contextIds: string[];
    hasChildren: boolean;
    children: ANode[];
    _children: ANode[];
    constructor(node: SpinalAnyNode);
    getChildren(node: D3Node): Promise<SpinalAnyNode[]>;
    static getActifChild(node: D3Node): D3Node[];
    static checkChildExist(id: string, node: D3Node): boolean;
    isOpen(): boolean;
    getColor(): string;
    static collapseOrOpen(node: D3Node): boolean;
    static collapseOrOpenParent(node: D3Node): boolean;
    static updateChildren(node: D3Node, nodeFactory: any): Promise<void>;
    static updateParent(node: D3Node, nodeFactory: any): Promise<void>;
}
export default ANode;
