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
import "spinal-model-graph";
import SpinalIO from "./spinal.js";
import * as d3 from "d3";
import { ANode } from "./nodeModel/ANode";
import type { D3Node } from "./nodeModel/D3Node";
import { NodeFactory } from "./nodeModel/NodeFactory";
import { FileSystem } from "spinal-core-connectorjs";
import { type SpinalNode, SpinalGraph } from "spinal-model-graph";
import EventBus from "./components/event-bus.js";

// Seed new nodes in a small circle around their anchor so that link
// directions are well-defined from the very first tick, which ensures
// arrowhead markers are rendered correctly.
const SEED_RADIUS = 80;

class ViewerForce {
  graph: SpinalIO;
  width!: number;
  height!: number;
  margin = { top: 20, right: 90, bottom: 30, left: 90 };
  element!: HTMLElement;
  svg: any;
  simulation: any;
  nodeFactory: NodeFactory;
  stateCourse: boolean = false;

  constructor(spinal: SpinalIO) {
    this.graph = spinal;
    this.nodeFactory = new NodeFactory();
  }

  resize() {
    const element = this.element;
    const width1 = element.clientWidth - this.margin.left - this.margin.right;
    const height1 = element.clientHeight - this.margin.top - this.margin.bottom;
    if (width1 !== this.width || height1 !== this.height) {
      this.width = width1;
      this.height = height1;
      this.draw();
    }
  }

  draw() {
    if (typeof this.svg !== "undefined") {
      this.svg
        .attr("width", this.width + this.margin.right + this.margin.left)
        .attr("height", this.height + this.margin.top + this.margin.bottom);
      if (this.simulation) {
        this.simulation.force(
          "center",
          d3.forceCenter(this.width / 2, this.height / 2),
        );
      }
    }
  }

  async init(element: HTMLElement, server_id: number) {
    this.element = element;
    const data = <SpinalNode<any>>await this.graph.load(server_id);
    this.width = element.clientWidth - this.margin.left - this.margin.right;
    this.height = element.clientHeight - this.margin.top - this.margin.bottom;

    const self = this;
    let i = 0;
    let node: any, link: any, edgepath: any;
    let selectedNode: D3Node | null = null;
    const SELECTION_COLOR = "#ff8c00";

    const root = this.nodeFactory.createNode(data);
    root.x = this.width / 2;
    root.y = this.height / 2;

    this.svg = d3
      .select(element)
      .append("svg")
      .call(d3.zoom().scaleExtent([0.01, 8]).on("zoom", zoomed))
      .on("dblclick.zoom", null)
      .attr("width", this.width + this.margin.right + this.margin.left)
      .attr("height", this.height + this.margin.top + this.margin.bottom);

    const defs = this.svg.append("defs");
    // Use markerUnits="userSpaceOnUse" so that refX is in pixels and the
    // arrowhead tip reliably lands just outside the node circle (r=10).
    // refX=22 places the tip ~12 px before the line endpoint (node centre),
    // which is 2 px past the circle edge and always visible.
    for (const [id, fill] of [
      ["arrowhead-force", "#f8f8f8"],
      ["arrowhead-force-selected", "#ff8c00"],
    ] as [string, string][]) {
      defs
        .append("svg:marker")
        .attr("id", id)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 22)
        .attr("refY", 0)
        .attr("orient", "auto")
        .attr("markerUnits", "userSpaceOnUse")
        .attr("markerWidth", 12)
        .attr("markerHeight", 12)
        .attr("overflow", "visible")
        .append("svg:path")
        .attr("d", "M 0,-5 L 10 ,0 L 0,5")
        .attr("fill", fill)
        .style("stroke", "none");
    }

    const svg = this.svg
      .append("g")
      .attr(
        "transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")",
      );

    const mylink = svg.append("g");
    const myedgepath = svg.append("g");

    // Force simulation
    this.simulation = d3
      .forceSimulation()
      .force("charge", d3.forceManyBody().strength(-1000))
      .force(
        "link",
        d3
          .forceLink()
          .id((d: any) => d.id.toString())
          .distance((d: any) => (d.target.data.category === "node" ? 100 : 70))
          .strength(2),
      )
      .force("center", d3.forceCenter(this.width / 2, this.height / 2))
      .force("collide", d3.forceCollide(20).strength(0.5))
      .on("tick", () => {
        if (link && node && edgepath) render();
      });

    // Seed new D3Nodes (x/y undefined) near an anchor node so link
    // directions are non-degenerate from the first simulation tick.
    const seedPositions = (anchor: D3Node, newNodes: D3Node[]) => {
      const ax = anchor.x ?? this.width / 2;
      const ay = anchor.y ?? this.height / 2;
      newNodes.forEach((n, idx) => {
        if (n.x === undefined || n.y === undefined) {
          const angle = (2 * Math.PI * idx) / Math.max(newNodes.length, 1);
          n.x = ax + SEED_RADIUS * Math.cos(angle);
          n.y = ay + SEED_RADIUS * Math.sin(angle);
        }
      });
    };

    const ChildrenCourse = async (d: D3Node) => {
      selectedNode = d;
      const realNode = FileSystem._objects[d.data._serverId];
      if (ANode.collapseOrOpen(d)) {
        await ANode.updateChildren(d, this.nodeFactory);
        const newChildren = (d.children || []).filter((c) => c.x === undefined);
        seedPositions(d, newChildren);
      }
      EventBus.$emit("realNode", realNode);
      EventBus.$emit("realNodeElement", realNode);
      update();
    };

    const parentCourse = async (d: D3Node) => {
      selectedNode = d;
      const realNode = FileSystem._objects[d.data._serverId];
      if (ANode.collapseOrOpenParent(d)) {
        await ANode.updateParent(d, this.nodeFactory);
        const newParents = (d.parent || []).filter((p) => p.x === undefined);
        seedPositions(d, newParents);
      }
      EventBus.$emit("realNode", realNode);
      EventBus.$emit("realNodeElement", realNode);
      update();
    };

    const newpage = async (d: D3Node) => {
      if (d.data.category === "node") {
        EventBus.$emit("server_id", d.data._serverId);
      }
      update();
    };

    const openNodeInDbInspector = async (d: D3Node) => {
      d3.event.preventDefault();
      selectedNode = d;
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
      const nodes = flatten(root);
      const links = createLinks(nodes);

      link = mylink.selectAll(".link").data(links, function (d: any) {
        return d.target.id;
      });
      link.exit().remove();

      const linkEnter = link
        .enter()
        .append("line")
        .attr("class", "link")
        .attr("marker-end", "url(#arrowhead-force)")
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
        .attr("id", function (_d: any, idx: number) {
          return "edgepath-force" + idx;
        })
        .style("pointer-events", "none");
      edgepath = edgepath.merge(edgepath);

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
        .on("auxclick", function (d: D3Node) {
          const evnt = window.event;
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

      nodeEnter.append(function (d: D3Node) {
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
        .attr("stroke", "#000")
        .attr("stroke-width", "3px")
        .attr("stroke-linejoin", "round")
        .style("paint-order", "stroke fill")
        .style("font-style", function (d: D3Node) {
          if (d.data.name === "undefined") return "italic";
          return "normal";
        });

      node = nodeEnter.merge(node);

      // Restart simulation with updated nodes and links
      self.simulation.force<any>("link").links(links);
      self.simulation.nodes(nodes);
      self.simulation.alpha(0.3).restart();

      // Render once immediately so elements are positioned before the first
      // async tick fires (avoids a flash of zero-position content).
      render();
      applySelection();
    }

    const style = {
      nodefill: {
        empty: "#fff",
        enterpoint: "#F3FF00",
        ptrlst: "#F40911",
        lstptr: "#E47579",
        lstptrLst: "#f1ba02",
        ref: "#09bf3b",
        objClosed: "#320ff2",
      },
    };

    function color(d: D3Node) {
      if (d.data.hasChildren === false) return style.nodefill.empty;
      if (d.data._serverId === root.data._serverId)
        return style.nodefill.enterpoint;
      if (d.data.category === "node") return style.nodefill.objClosed;
      if (d.data.category === "relation") {
        if (d.data.type === "PtrLst") return style.nodefill.ptrlst;
        else if (d.data.type === "LstPtr") return style.nodefill.lstptr;
        else if (d.data.type === "LstPtrLst") return style.nodefill.lstptrLst;
        else if (d.data.type === "Ref") return style.nodefill.ref;
      }
    }

    function applySelection() {
      if (!node || !link) return;
      node
        .selectAll("circle, rect")
        .attr("stroke", "#f8f8f8")
        .attr("stroke-width", 1.2);
      link
        .style("stroke", "#f8f8f8")
        .style("opacity", "0.5")
        .style("stroke-width", 2)
        .attr("marker-end", "url(#arrowhead-force)");
      if (!selectedNode) return;
      node
        .filter((d: D3Node) => d === selectedNode)
        .selectAll("circle, rect")
        .attr("stroke", SELECTION_COLOR)
        .attr("stroke-width", 3);
      node.filter((d: D3Node) => d === selectedNode).raise();
      link
        .filter(
          (d: any) => d.source === selectedNode || d.target === selectedNode,
        )
        .style("stroke", SELECTION_COLOR)
        .style("opacity", "1")
        .style("stroke-width", 2)
        .attr("marker-end", "url(#arrowhead-force-selected)");
    }

    function render() {
      if (!link || !node || !edgepath) return;
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: D3Node) => `translate(${d.x}, ${d.y})`);

      edgepath.attr(
        "d",
        (d: any) =>
          `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`,
      );
    }

    function dragstarted(d: D3Node) {
      if (!self.simulation.event.active)
        self.simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d: D3Node) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d: D3Node) {
      if (!self.simulation.event.active) self.simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    function flatten(root: any): D3Node[] {
      const nodes: Set<D3Node> = new Set();
      function recurse(n: any) {
        if (nodes.has(n)) return;
        if (!n.id) n.id = ++i;
        else ++i;
        nodes.add(n);
        if (n.children) n.children.forEach(recurse);
        if (n.parent) n.parent.forEach(recurse);
      }
      recurse(root);
      return Array.from(nodes);
    }

    function chekLink(source: D3Node, target: D3Node, links: any[]): boolean {
      for (const l of links) {
        if (source.data === l.source.data && target.data === l.target.data)
          return true;
      }
      return false;
    }

    function createLinks(nodes: D3Node[]) {
      const links: { source: D3Node; target: D3Node; index: number }[] = [];
      let id = 0;
      for (const n of nodes) {
        if (Array.isArray(n.parent)) {
          for (const parent of n.parent) {
            if (!chekLink(parent, n, links))
              links.push({ source: parent, target: n, index: id++ });
          }
        }
        if (Array.isArray(n.children)) {
          for (const child of n.children) {
            if (!chekLink(n, child, links))
              links.push({ source: n, target: child, index: id++ });
          }
        }
      }
      return links;
    }

    function zoomed() {
      svg.attr("transform", d3.event.transform);
    }

    update();
  }
}

export default ViewerForce;
