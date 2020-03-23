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
import 'spinal-model-graph'
import Spinal from "./spinal.js"; //graph connection and recovery
import NodeG from "./nodeModel/NodeG"; //type node
import NodeRelationG from "./nodeModel/NodeRelationG"; // type relation
import d3 = require("d3"); // lib d3js
import ANode from './nodeModel/ANode'; //interface Node

import { D3Node } from './nodeModel/D3Node'; //interface D3Node
import nodeFactory from "./nodeModel/NodeFactory";
import { FileSystem } from 'spinal-core-connectorjs_type';
import { SpinalNode } from 'spinal-model-graph';
import EventBus from "./components/event-bus.js";
class Viewer {

  graph: Spinal;
  width: number;
  height: number;
  margin = { top: 20, right: 90, bottom: 30, left: 90 }
  element: any;
  svg: any;
  simulation: any;
  constructor(spinal: Spinal) {
    this.graph = spinal
  }
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
  draw() {

    if (typeof this.svg !== "undefined") {

      this.svg.attr("width", this.width + this.margin.right + this.margin.left)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
      this.simulation
        .force('center', d3.forceCenter(this.width / 2, this.height / 2)) //center — pulls all nodes to the center
    }

  }
  async init(element: any) {
    this.element = element;


    const data = <SpinalNode<any>>(await this.graph.load()); //load graph

    this.width = element.clientWidth - this.margin.left - this.margin.right;
    this.height = element.clientHeight - this.margin.top - this.margin.bottom;
    let i = 0;
    let node: any, link: any;


    //build hierarchy d3 graph from entry point
    // const root = d3.hierarchy(nodeG);
    const root = nodeFactory.createNode(data);



    //create the svg
    this.svg = d3.select(element).append('svg')
      .call(d3.zoom().scaleExtent([1 / 2, 8]).on('zoom', zoomed))
      .on("dblclick.zoom", null)
      .attr("width", this.width + this.margin.right + this.margin.left)
      .attr("height", this.height + this.margin.top + this.margin.bottom)


    const svg = this.svg.append('g')
      .attr("transform", "translate("
        + this.margin.left + "," + this.margin.top + ")");


    //create links group
    const mylink = svg.append('g')



    //create arrow head svg
    svg.append('defs').append('marker')
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


    //create the simulation force 
    var simulation = d3.forceSimulation()
      .force('charge', d3.forceManyBody().strength(-3000)) //charge — nodes repel from each other which prevents overlap
      .force('link', d3.forceLink().id(function (d: D3Node) { //link — specifies that id is the link variable
        let res = d.id + 10
        return res.toString();
      })
        .distance(function (d: any) {
          if (d.target.data.category === "node") {
            return 300;
          }

          return 100;
        }).strength(5))

      .force('center', d3.forceCenter(this.width / 2, this.height / 2)) //center — pulls all nodes to the center
      .force("collide ", d3.forceCollide().radius(7)) //collide-specify a ‘repel radius’ of 10 x node radius — to prevent overlap and leave space for label
      .on('tick', ticked)

    this.simulation = simulation;
    //declare arrowhead path
    var edgepaths = svg.selectAll(".edgepath");





    function update() {

      const nodes = flatten(root) // recover ids nodes
      const links = createLinks(nodes)  //recover links
      // const links = []

      // const nodes = flatten(root) // recover ids nodes

      // const links = root.links()  //recover links



      //build the d3 links************************************/
      link = mylink
        .selectAll('.link')
        .data(links, function (d: any) {

          return d.target.id
        })

      link.exit().remove()

      const linkEnter = link
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('marker-end', 'url(#arrowhead)')
        .style('stroke', '#f8f8f8')
        .style('opacity', '0.5')
        .style('stroke-width', 2)

      edgepaths = svg.selectAll(".edgepath")
        .data(links)
        .enter()
        .append('path')
        .attr('class', 'edgepath')
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0)
        .attr('id', function (d, i) { return 'edgepath' + i })
        .style("pointer-events", "none");

      link = linkEnter.merge(link)






      //build the d3 nodes ************************************/
      node = svg
        .selectAll('.node')
        .data(nodes, function (d: D3Node) {
          return d.id.toString();
        })

      node.exit().remove()

      const nodeEnter = node
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('stroke-width', 1.2)
        .style('fill', color)
        .style('opacity', 1)
        .on('click', allclicked)
        .on("contextmenu", rclicked)
        // .on('dblclick', clicked)
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended))



      nodeEnter.append(function (d) {
        //create nodes Node
        if (d.data.category === "node") {
          const doc = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          doc.setAttribute("r", "10")
          doc.setAttribute("stroke", "#f8f8f8")
          doc.style.textAnchor = d.children ? 'end' : 'start';
          return doc
        }
        //create nodes Relation
        const svg1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        svg1.setAttribute("width", "20");
        svg1.setAttribute("height", "20");
        svg1.setAttribute("stroke", "#f8f8f8")

        svg1.setAttribute('transform', `translate(-10, -10)`);
        svg1.style.textAnchor = d.children ? 'end' : 'start';
        return svg1
      })

      //add node labels
      nodeEnter.append("text")
        .text(function (d) {
          if (d.data.name === "undefined") {
            d.data.name = "Graph";
          }
          return d.data.name;
        })
        .attr('transform', `translate(-17,-15)`)
        .style('fill', "#fff")
        .style('font-family', "sans-serif")

      node = nodeEnter.merge(node)


      //append the data to the simulation
      simulation.force<any>('link').links(links);
      simulation.nodes(nodes)
    }




    //node color function
    function color(d) {

      if (d.data._serverId === root.data._serverId) {
        return "rgb(240, 169, 169)";
      } else if (d.data.category === "node") {
        return "#320ff2";
      } else {
        return "#7efed4";

      }
    }


    //node ticked function
    function ticked() {
      link
        .attr('x1', function (d) { return d.source.x; })
        .attr('y1', function (d) { return d.source.y; })
        .attr('x2', function (d) { return d.target.x; })
        .attr('y2', function (d) { return d.target.y; })

      node
        .attr('transform', function (d) { return `translate(${d.x}, ${d.y})` })

      edgepaths.attr('d', function (d: any) {
        return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
      });
    }


    //node clicked function
    async function clicked(d: D3Node) {

      if (ANode.collapseOrOpen(d)) {
        await ANode.updateChildren(d, nodeFactory);
      }
      update()
    }

    async function rclicked(d: D3Node) {

      d3.event.preventDefault();
      // react on right-clicking
      const realNode = (FileSystem._objects[d.data._serverId]);
      EventBus.$emit(".droite", realNode);


    }


    function allclicked(d) {
      clicked(d);
      rclicked(d)
    }

    // dragstarted function
    function dragstarted(d: D3Node) {
      if (!d3.event.active) simulation.alphaTarget(0.1).restart()
      d.fx = d.x
      d.fy = d.y
    }


    // dragged function
    function dragged(d: D3Node) {
      d.fx = d3.event.x
      d.fy = d3.event.y
    }

    // dragended function
    function dragended(d: D3Node) {
      if (!d3.event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    // flatten function
    function flatten(root: any): D3Node[] {
      const nodes: Set<D3Node> = new Set();



      function recurse(node) {
        if (nodes.has(node)) return;
        if (!node.id) node.id = ++i;
        else ++i;

        nodes.add(node)
        if (node.children) node.children.forEach(recurse)
        // if (node.parent) node.parent.forEach(recurse)
      }
      recurse(root)
      return Array.from(nodes)
    }
    function createLinks(nodes: D3Node[]) {
      const links = []
      let id = 0
      for (const node of nodes) {
        if (Array.isArray(node.children))
          for (const child of node.children) {
            links.push({
              source: node,
              target: child,
              index: id++
            })
          }
      }

      return links
    }

    // Zoom function
    function zoomed() {
      svg.attr('transform', d3.event.transform)
    }

    update()

  }


}

export default Viewer
