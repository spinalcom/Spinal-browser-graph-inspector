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
import "spinal-model-graph";
import SpinalIO from "./spinal.js"; //graph connection and recovery
import * as d3 from "d3"; // lib d3js
import { ANode } from "./nodeModel/ANode"; //interface Node
import type { D3Node } from "./nodeModel/D3Node"; //interface D3Node
import { NodeFactory } from "./nodeModel/NodeFactory";
import { FileSystem } from "spinal-core-connectorjs";
import { type SpinalNode, SpinalGraph } from "spinal-model-graph";
import EventBus from "./components/event-bus.js";

const HORIZONTAL_SPACING = 200;
const VERTICAL_SPACING = 60;

class Viewer {
  graph: SpinalIO;
  width!: number;
  height!: number;
  margin = { top: 20, right: 90, bottom: 30, left: 90 };
  element!: HTMLElement;
  svg: any;
  simulation: any;
  visualisation: boolean = false;
  nodeFactory: NodeFactory;
  stateCourse: boolean = false;
  layoutMode: "dag" | "force" = "dag";
  private _render: (() => void) | null = null;
  private _update: (() => void) | null = null;

  setLayoutMode(mode: "dag" | "force") {
    this.layoutMode = mode;
    if (mode === "force") {
      if (this._update) this._update();
    } else {
      if (this.simulation) this.simulation.stop();
      if (this._render) this._render();
    }
  }

  constructor(spinal: SpinalIO) {
    this.graph = spinal;
    this.nodeFactory = new NodeFactory();
  }
  //resize function
  resize() {
    const element = this.element;
    let width1 = element.clientWidth - this.margin.left - this.margin.right;
    let height1 =
      this.element.clientHeight - this.margin.top - this.margin.bottom;
    if (width1 != this.width || height1 != this.height) {
      this.width = width1;
      this.height = height1;
      this.draw();
    }
  }
  //draw function

  draw() {
    if (typeof this.svg !== "undefined") {
      this.svg
        .attr("width", this.width + this.margin.right + this.margin.left)
        .attr("height", this.height + this.margin.top + this.margin.bottom);
      if (this.layoutMode === "force" && this.simulation) {
        this.simulation.force(
          "center",
          d3.forceCenter(this.width / 2, this.height / 2),
        );
      }
    }
  }

  // initialisation function
  async init(element: HTMLElement, server_id: number) {
    this.element = element;
    this.element = element; //initialisation of DOMElement
    const data = <SpinalNode<any>>await this.graph.load(server_id); //load graph
    this.width = element.clientWidth - this.margin.left - this.margin.right; //width of element
    this.height = element.clientHeight - this.margin.top - this.margin.bottom; //height of element

    this.width = element.clientWidth - this.margin.left - this.margin.right;
    this.height = element.clientHeight - this.margin.top - this.margin.bottom;
    const self = this;
    let i = 0;
    let node: any, link: any, edgepath: any;

    //build hierarchy d3 graph from entry point
    const root = this.nodeFactory.createNode(data);
    // Pin root at center
    root.x = this.width / 2;
    root.y = this.height / 2;
    //create the svg
    this.svg = d3
      .select(element)
      .append("svg")
      .call(d3.zoom().scaleExtent([0.01, 8]).on("zoom", zoomed))
      .on("dblclick.zoom", null)
      .attr("width", this.width + this.margin.right + this.margin.left)
      .attr("height", this.height + this.margin.top + this.margin.bottom);

    //create svg groupe
    const svg = this.svg
      .append("g")
      .attr(
        "transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")",
      );

    //create links group
    const mylink = svg.append("g");
    const myedgepath = svg.append("g");

    // DAG layout: position new nodes relative to an anchor, avoiding column overlap
    const positionNewNodes = (
      anchor: D3Node,
      newNodes: D3Node[],
      direction: "right" | "left",
    ) => {
      const ax = anchor.x ?? this.width / 2;
      const ay = anchor.y ?? this.height / 2;
      const targetX =
        ax + (direction === "right" ? HORIZONTAL_SPACING : -HORIZONTAL_SPACING);
      const count = newNodes.length;
      const totalHeight = (count - 1) * VERTICAL_SPACING;

      // Collect y-positions already occupied at the target column (within half a column width)
      const colTolerance = HORIZONTAL_SPACING * 0.4;
      const occupiedYs: number[] = [];
      for (const n of this.nodeFactory.nodeMap.values()) {
        if (
          n.x !== undefined &&
          n.y !== undefined &&
          Math.abs(n.x - targetX) < colTolerance &&
          !newNodes.includes(n)
        ) {
          occupiedYs.push(n.y);
        }
      }
      occupiedYs.sort((a, b) => a - b);

      // Try to center around the anchor; fall back to placing below existing nodes
      let startY = ay - totalHeight / 2;
      if (occupiedYs.length > 0) {
        const proposedYs = Array.from(
          { length: count },
          (_, i) => startY + i * VERTICAL_SPACING,
        );
        const hasOverlap = proposedYs.some((py) =>
          occupiedYs.some((oy) => Math.abs(oy - py) < VERTICAL_SPACING * 0.9),
        );
        if (hasOverlap) {
          startY = occupiedYs[occupiedYs.length - 1] + VERTICAL_SPACING;
        }
      }

      newNodes.forEach((n, idx) => {
        n.x = targetX;
        n.y = startY + idx * VERTICAL_SPACING;
      });
    };

    // Force simulation — created once, stopped initially (DAG mode default)
    this.simulation = d3
      .forceSimulation()
      .force("charge", d3.forceManyBody().strength(-1000))
      .force(
        "link",
        d3
          .forceLink()
          .id((d: D3Node) => (d.id + 10).toString())
          .distance((d: any) => (d.target.data.category === "node" ? 100 : 70))
          .strength(2),
      )
      .force("center", d3.forceCenter(this.width / 2, this.height / 2))
      .force("collide", d3.forceCollide(5).strength(10))
      .on("tick", () => {
        if (link && node && edgepath) render();
      })
      .stop();

    // Add arrowhead marker once
    this.svg
      .append("defs")
      .append("svg:marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 16)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("xoverflow", "visible")
      .append("svg:path")
      .attr("d", "M 0,-5 L 10 ,0 L 0,5")
      .attr("fill", "#f8f8f8")
      .style("stroke", "none");

    //node clicked function children course
    const ChildrenCourse = async (d: D3Node) => {
      const realNode = FileSystem._objects[d.data._serverId];
      if (ANode.collapseOrOpen(d)) {
        await ANode.updateChildren(d, this.nodeFactory);
        if (this.layoutMode === "dag") {
          const newChildren = (d.children || []).filter(
            (c) => c.x === undefined,
          );
          positionNewNodes(d, newChildren, "right");
        }
      }
      EventBus.$emit("realNode", realNode);
      EventBus.$emit("realNodeElement", realNode);
      update();
    };

    //node clicked function parent course
    const parentCourse = async (d: D3Node) => {
      const realNode = FileSystem._objects[d.data._serverId];
      if (ANode.collapseOrOpenParent(d)) {
        await ANode.updateParent(d, this.nodeFactory);
        if (this.layoutMode === "dag") {
          const newParents = (d.parent || []).filter((p) => p.x === undefined);
          positionNewNodes(d, newParents, "left");
        }
      }
      EventBus.$emit("realNode", realNode);
      EventBus.$emit("realNodeElement", realNode);
      update();
    };

    //node clicked function strating node in new tab
    const newpage = async (d: D3Node) => {
      if (d.data.category === "node") {
        const server_id = d.data._serverId;
        EventBus.$emit("server_id", server_id);
      }
      update();
    };

    const openNodeInDbInspector = async (d: D3Node) => {
      d3.event.preventDefault();
      const realNode = FileSystem._objects[d.data._serverId];
      EventBus.$emit("realNode", realNode);
      EventBus.$emit("realNodeElement", realNode);
      update();
    };

    const click = async (d: D3Node) => {
      if (this.stateCourse === false) ChildrenCourse(d);
      else parentCourse(d);
    };

    function update() {
      const nodes = flatten(root); // recover ids nodes
      const links = createLinks(nodes); //recover links

      //build the d3 links
      link = mylink.selectAll(".link").data(links, function (d: any) {
        return d.target.id;
      });
      link.exit().remove();

      const linkEnter = link
        .enter()
        .append("line")
        .attr("class", "link")
        .attr("marker-end", "url(#arrowhead)")
        .style("stroke", "#f8f8f8")
        .style("opacity", "0.5")
        .style("stroke-width", 2);
      link = linkEnter.merge(link);

      edgepath = myedgepath
        .selectAll(".edgepath")
        .data(links)
        .enter()
        .append("path")
        .attr("class", "edgepath")
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0)
        .attr("id", function (d, i) {
          return "edgepath" + i;
        })
        .style("pointer-events", "none");
      edgepath = edgepath.merge(edgepath);

      //build the d3 nodes
      node = svg.selectAll(".node").data(nodes, function (d: D3Node) {
        return d.id.toString();
      });

      node.exit().remove();

      const nodeEnter = node
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("id", "test")
        .attr("stroke-width", 1.2)
        .style("fill", color)
        .style("opacity", 1)
        .on("click", click)
        .on("contextmenu", openNodeInDbInspector)
        .on("auxclick", function (d) {
          var evnt = window.event;
          if ((<any>evnt).which === 2) {
            newpage(d);
          }
        })
        .call(
          d3
            .drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended),
        );

      nodeEnter.append(function (d) {
        //create nodes Node
        if (d.data.category === "node") {
          const doc = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle",
          );
          doc.setAttribute("r", "10");
          doc.setAttribute("stroke", "#f8f8f8");
          doc.style.textAnchor = d.children ? "end" : "start";
          return doc;
        }
        //create nodes Relation
        const svg1 = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect",
        );
        svg1.setAttribute("width", "20");
        svg1.setAttribute("height", "20");
        svg1.setAttribute("stroke", "#f8f8f8");

        svg1.setAttribute("transform", `translate(-10, -10)`);
        svg1.style.textAnchor = d.children ? "end" : "start";
        return svg1;
      });

      //add node labels
      nodeEnter
        .append("text")
        .text(function (d: D3Node) {
          const realNode = FileSystem._objects[d.data._serverId];
          if (realNode instanceof SpinalGraph) {
            d.data.name = "SpinalGraph";
          } else if (d.data.name === "undefined" || d.data.name === undefined) {
            d.data.name = "undefined name";
          }
          if (d.data.category === "node") {
            return d.data.name;
          } else {
            return d.data.name + "{" + realNode.getNbChildren() + "}";
          }
        })
        .attr("transform", `translate(-17,-15)`)
        .style("fill", "#fff")
        .style("font-family", "sans-serif")
        .style("font-style", function (d) {
          if (d.data.name === "undefined") return "italic";
          return "normal";
        });
      node = nodeEnter.merge(node);

      // Render: DAG uses direct positioning; force hands off to simulation
      if (self.layoutMode === "force") {
        self.simulation.force<any>("link").links(links);
        self.simulation.nodes(nodes);
        self.simulation.alpha(0.3).restart();
      } else {
        render();
      }
    }
    //color palette of nodes and relations
    let style = {
      nodefill: {
        empty: "#fff", // or atomic or unknown
        enterpoint: "#F3FF00",
        ptrlst: "#F40911",
        lstptr: "#E47579",
        lstptrLst: "#f1ba02",
        ref: "#09bf3b",
        objClosed: "#320ff2",
      },
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
        } else if (d.data.type === "LstPtr") {
          return style.nodefill.lstptr;
        } else if (d.data.type === "LstPtrLst") {
          return style.nodefill.lstptrLst;
        } else if (d.data.type === "Ref") {
          return style.nodefill.ref;
        }
      }
    }

    //render function — directly positions all DOM elements
    self._render = render;
    self._update = update;
    function render() {
      if (!link || !node || !edgepath) return;
      link
        .attr("x1", function (d) {
          return d.source.x;
        })
        .attr("y1", function (d) {
          return d.source.y;
        })
        .attr("x2", function (d) {
          return d.target.x;
        })
        .attr("y2", function (d) {
          return d.target.y;
        });

      node.attr("transform", function (d) {
        return `translate(${d.x}, ${d.y})`;
      });

      edgepath.attr("d", function (d: any) {
        return `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`;
      });
    }

    // dragstarted function
    function dragstarted(d: D3Node) {
      d.fx = d.x;
      d.fy = d.y;
    }

    // dragged function
    function dragged(d: D3Node) {
      d.x = d3.event.x;
      d.y = d3.event.y;
      render();
    }

    // dragended function
    function dragended(d: D3Node) {
      d.fx = null;
      d.fy = null;
    }

    // flatten function
    function flatten(root: any): D3Node[] {
      const nodes: Set<D3Node> = new Set();

      function recurse(node) {
        if (nodes.has(node)) return;
        if (!node.id) node.id = ++i;
        else ++i;

        nodes.add(node);
        if (node.children) node.children.forEach(recurse);
        if (node.parent) node.parent.forEach(recurse);
      }
      recurse(root);
      return Array.from(nodes);
    }
    //chek link exist
    function chekLink(source: D3Node, target: D3Node, links: any[]): boolean {
      for (let index = 0; index < links.length; index++) {
        if (
          source.data === links[index].source.data &&
          target.data === links[index].target.data
        ) {
          return true;
        }
      }
      return false;
    }

    //create links
    function createLinks(nodes: D3Node[]) {
      const links: {
        source: D3Node;
        target: D3Node;
        index: number;
      }[] = [];
      let id = 0;
      for (const node of nodes) {
        if (Array.isArray(node.parent)) {
          for (const parent of node.parent) {
            if (!chekLink(parent, node, links)) {
              links.push({
                source: parent,
                target: node,
                index: id++,
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
                index: id++,
              });
            }
          }
      }
      return links;
    }

    // Zoom function
    function zoomed() {
      svg.attr("transform", d3.event.transform);
    }
    update();
  }
}

export default Viewer;
