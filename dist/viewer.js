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
//load the libraries 
require("spinal-model-graph");
const d3 = require("d3"); // lib d3js
const ANode_1 = require("./nodeModel/ANode"); //interface Node
const NodeFactory_1 = require("./nodeModel/NodeFactory");
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const event_bus_js_1 = require("./components/event-bus.js");
class Viewer {
    constructor(spinal) {
        this.margin = { top: 20, right: 90, bottom: 30, left: 90 };
        this.visualisation = false;
        this.stateCourse = false;
        this.graph = spinal;
        this.nodeFactory = new NodeFactory_1.default();
    }
    //resize function
    resize() {
        const element = this.element;
        let width1 = element.clientWidth - this.margin.left - this.margin.right;
        let height1 = this.element.clientHeight - this.margin.top - this.margin.bottom;
        if (width1 != this.width || height1 != this.height) {
            this.width = width1;
            this.height = height1;
            this.draw();
        }
    }
    //draw function
    draw() {
        if (typeof this.svg !== "undefined") {
            this.svg.attr("width", this.width + this.margin.right + this.margin.left)
                .attr("height", this.height + this.margin.top + this.margin.bottom);
            this.simulation
                .force('center', d3.forceCenter(this.width / 2, this.height / 2)); //center — pulls all nodes to the center
        }
    }
    // initialisation function
    init(element, server_id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.element = element;
            console.log(this.element);
            this.element = element; //initialisation of DOMElement
            const data = (yield this.graph.load(server_id)); //load graph
            this.width = element.clientWidth - this.margin.left - this.margin.right; //width of element
            this.height = element.clientHeight - this.margin.top - this.margin.bottom; //height of element
            this.width = element.clientWidth - this.margin.left - this.margin.right;
            this.height = element.clientHeight - this.margin.top - this.margin.bottom;
            let i = 0;
            let node, link, edgepath, arrowhead;
            //build hierarchy d3 graph from entry point
            const root = this.nodeFactory.createNode(data);
            //create the svg
            this.svg = d3.select(element).append('svg')
                .call(d3.zoom().scaleExtent([0.01, 8]).on('zoom', zoomed))
                .on("dblclick.zoom", null)
                .attr("width", this.width + this.margin.right + this.margin.left)
                .attr("height", this.height + this.margin.top + this.margin.bottom);
            //create svg groupe 
            const svg = this.svg.append('g')
                .attr("transform", "translate("
                + this.margin.left + "," + this.margin.top + ")");
            //create links group
            const mylink = svg.append('g');
            const myedgepath = svg.append('g');
            const myarrowhead = svg.append('g');
            //create the simulation force 
            var simulation = d3.forceSimulation()
                .force('charge', d3.forceManyBody().strength(-1000)) //charge — nodes repel from each other which prevents overlap
                .force('link', d3.forceLink().id(function (d) {
                let res = d.id + 10;
                return res.toString();
            })
                .distance(function (d) {
                if (d.target.data.category === "node")
                    return 100;
                else
                    return 70;
            }).strength(2))
                .force('center', d3.forceCenter(this.width / 2, this.height / 2)) //center — pulls all nodes to the center
                .force("collide ", d3.forceCollide(5).strength(10)) //collide-specify a ‘repel radius’ of 10 x node radius — to prevent overlap and leave space for label
                .on('tick', ticked);
            this.simulation = simulation;
            //node clicked function children course
            const ChildrenCourse = (d) => __awaiter(this, void 0, void 0, function* () {
                const realNode = (spinal_core_connectorjs_type_1.FileSystem._objects[d.data._serverId]);
                if (ANode_1.default.collapseOrOpen(d)) {
                    yield ANode_1.default.updateChildren(d, this.nodeFactory);
                }
                event_bus_js_1.default.$emit("realNode", realNode);
                event_bus_js_1.default.$emit("realNodeElement", realNode);
                update();
            });
            //node clicked function parent course
            const parentCourse = (d) => __awaiter(this, void 0, void 0, function* () {
                const realNode = (spinal_core_connectorjs_type_1.FileSystem._objects[d.data._serverId]);
                if (ANode_1.default.collapseOrOpenParent(d)) {
                    yield ANode_1.default.updateParent(d, this.nodeFactory);
                }
                event_bus_js_1.default.$emit("realNode", realNode);
                event_bus_js_1.default.$emit("realNodeElement", realNode);
                update();
            });
            //node clicked function strating node in new tab
            const newpage = (d) => __awaiter(this, void 0, void 0, function* () {
                if (d.data.category === "node") {
                    const server_id = d.data._serverId;
                    event_bus_js_1.default.$emit("server_id", server_id);
                }
                update();
            });
            const openNodeInDbInspector = (d) => __awaiter(this, void 0, void 0, function* () {
                d3.event.preventDefault();
                const realNode = (spinal_core_connectorjs_type_1.FileSystem._objects[d.data._serverId]);
                event_bus_js_1.default.$emit("realNode", realNode);
                event_bus_js_1.default.$emit("realNodeElement", realNode);
                update();
            });
            const click = (d) => __awaiter(this, void 0, void 0, function* () {
                if (this.stateCourse === false)
                    ChildrenCourse(d);
                else
                    parentCourse(d);
            });
            function update() {
                const nodes = flatten(root); // recover ids nodes
                const links = createLinks(nodes); //recover links
                console.log("update", nodes, links);
                //build the d3 links
                link = mylink
                    .selectAll('.link')
                    .data(links, function (d) {
                    return d.target.id;
                });
                link.exit().remove();
                const linkEnter = link
                    .enter()
                    .append('line')
                    .attr('class', 'link')
                    .attr('marker-end', 'url(#arrowhead)')
                    .style('stroke', '#f8f8f8')
                    .style('opacity', '0.5')
                    .style('stroke-width', 2);
                link = linkEnter.merge(link);
                edgepath = myedgepath.selectAll(".edgepath")
                    .data(links)
                    .enter()
                    .append('path')
                    .attr('class', 'edgepath')
                    .attr('fill-opacity', 0)
                    .attr('stroke-opacity', 0)
                    .attr('id', function (d, i) { return 'edgepath' + i; })
                    .style("pointer-events", "none");
                edgepath = edgepath.merge(edgepath);
                //create arrow head svg
                arrowhead = svg.append('defs').append('svg:marker')
                    .attr('class', 'arrowhead')
                    .attr('id', 'arrowhead')
                    .attr('viewBox', '-0 -5 10 10')
                    .attr('refX', 16)
                    .attr('refY', 0)
                    .attr('orient', 'auto')
                    .attr('markerWidth', 8)
                    .attr('markerHeight', 8)
                    .attr('xoverflow', 'visible')
                    .append('svg:path')
                    .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
                    .attr('fill', '#f8f8f8')
                    .style('stroke', 'none');
                arrowhead = arrowhead.merge(arrowhead);
                //build the d3 nodes
                node = svg
                    .selectAll('.node')
                    .data(nodes, function (d) {
                    return d.id.toString();
                });
                node.exit().remove();
                const nodeEnter = node
                    .enter()
                    .append('g')
                    .attr('class', 'node')
                    .attr('id', 'test')
                    .attr('stroke-width', 1.2)
                    .style('fill', color)
                    .style('opacity', 1)
                    .on('click', click)
                    .on("contextmenu", openNodeInDbInspector)
                    .on("auxclick", function (d) {
                    var evnt = window.event;
                    if (evnt.which === 2) {
                        newpage(d);
                    }
                })
                    .call(d3.drag()
                    .on('start', dragstarted)
                    .on('drag', dragged)
                    .on('end', dragended));
                nodeEnter.append(function (d) {
                    //create nodes Node
                    if (d.data.category === "node") {
                        const doc = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                        doc.setAttribute("r", "10");
                        doc.setAttribute("stroke", "#f8f8f8");
                        doc.style.textAnchor = d.children ? 'end' : 'start';
                        return doc;
                    }
                    //create nodes Relation
                    const svg1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    svg1.setAttribute("width", "20");
                    svg1.setAttribute("height", "20");
                    svg1.setAttribute("stroke", "#f8f8f8");
                    svg1.setAttribute('transform', `translate(-10, -10)`);
                    svg1.style.textAnchor = d.children ? 'end' : 'start';
                    return svg1;
                });
                //add node labels
                nodeEnter.append("text")
                    .text(function (d) {
                    const realNode = (spinal_core_connectorjs_type_1.FileSystem._objects[d.data._serverId]);
                    if (d.data.name === "undefined") {
                        d.data.name = "Graph";
                    }
                    if (d.data.category === "node") {
                        return d.data.name;
                    }
                    else {
                        return d.data.name + "{" + realNode.getNbChildren() + "}";
                    }
                })
                    .attr('transform', `translate(-17,-15)`)
                    .style('fill', "#fff")
                    .style('font-family', "sans-serif");
                node = nodeEnter.merge(node);
                //append the data to the simulation
                simulation.force('link').links(links);
                simulation.nodes(nodes);
            }
            //color palette of nodes and relations
            let style = {
                nodefill: {
                    empty: "#fff",
                    enterpoint: "#F3FF00",
                    ptrlst: "#F40911",
                    lstptr: "#E47579",
                    ref: "09bf3b",
                    objClosed: "#320ff2"
                }
            };
            //node color function
            function color(d) {
                if (d.data.hasChildren === false) {
                    return style.nodefill.empty;
                }
                if (d.data._serverId === root.data._serverId) {
                    return style.nodefill.enterpoint;
                }
                if (d.data.category === "node") {
                    return style.nodefill.objClosed;
                }
                if (d.data.category === "relation") {
                    if (d.data.type === "PtrLst") {
                        return style.nodefill.ptrlst;
                    }
                    else if (d.data.type === "LstPtr") {
                        return style.nodefill.lstptr;
                    }
                    else if (d.data.type === "Ref") {
                        return style.nodefill.ref;
                    }
                }
            }
            //node ticked function
            function ticked() {
                link
                    .attr('x1', function (d) { return d.source.x; })
                    .attr('y1', function (d) { return d.source.y; })
                    .attr('x2', function (d) { return d.target.x; })
                    .attr('y2', function (d) { return d.target.y; });
                node
                    .attr('transform', function (d) { return `translate(${d.x}, ${d.y})`; });
                edgepath.attr('d', function (d) {
                    return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
                });
            }
            // dragstarted function
            function dragstarted(d) {
                if (!d3.event.active)
                    simulation.alphaTarget(0.1).restart();
                d.fx = d.x;
                d.fy = d.y;
            }
            // dragged function
            function dragged(d) {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            }
            // dragended function
            function dragended(d) {
                if (!d3.event.active)
                    simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }
            // flatten function
            function flatten(root) {
                const nodes = new Set();
                function recurse(node) {
                    if (nodes.has(node))
                        return;
                    if (!node.id)
                        node.id = ++i;
                    else
                        ++i;
                    nodes.add(node);
                    if (node.children)
                        node.children.forEach(recurse);
                    if (node.parent)
                        node.parent.forEach(recurse);
                }
                recurse(root);
                return Array.from(nodes);
            }
            //chek link exist  
            function chekLink(source, target, links) {
                for (let index = 0; index < links.length; index++) {
                    if (source.data === links[index].source.data && target.data === links[index].target.data) {
                        return true;
                    }
                }
                return false;
            }
            //create links 
            function createLinks(nodes) {
                const links = [];
                let id = 0;
                for (const node of nodes) {
                    if (Array.isArray(node.parent)) {
                        for (const parent of node.parent) {
                            if (!chekLink(parent, node, links)) {
                                links.push({
                                    source: parent,
                                    target: node,
                                    index: id++
                                });
                            }
                        }
                    }
                    if (Array.isArray(node.children))
                        for (const child of node.children) {
                            if (!chekLink(node, child, links)) {
                                links.push({
                                    source: node,
                                    target: child,
                                    index: id++
                                });
                            }
                        }
                }
                return links;
            }
            // Zoom function
            function zoomed() {
                svg.attr('transform', d3.event.transform);
            }
            update();
        });
    }
}
exports.default = Viewer;
//# sourceMappingURL=viewer.js.map