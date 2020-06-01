import 'spinal-model-graph';
import Spinal from "./spinal.js";
import NodeFactory from "./nodeModel/NodeFactory";
declare class Viewer {
    graph: Spinal;
    width: number;
    height: number;
    margin: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    element: any;
    svg: any;
    simulation: any;
    visualisation: boolean;
    nodeFactory: NodeFactory;
    stateCourse: boolean;
    constructor(spinal: Spinal);
    resize(): void;
    draw(): void;
    init(element: any, server_id: any): Promise<void>;
}
export default Viewer;
