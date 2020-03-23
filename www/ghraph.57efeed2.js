// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"graph-data.json":[function(require,module,exports) {
module.exports = [{
  "name": "flare",
  "children": [{
    "name": "analytics",
    "children": [{
      "name": "cluster",
      "children": [{
        "name": "AgglomerativeCluster",
        "size": 3938
      }, {
        "name": "CommunityStructure",
        "size": 3812
      }, {
        "name": "HierarchicalCluster",
        "size": 6714
      }, {
        "name": "MergeEdge",
        "size": 743
      }]
    }, {
      "name": "graph",
      "children": [{
        "name": "BetweennessCentrality",
        "size": 3534
      }, {
        "name": "LinkDistance",
        "size": 5731
      }, {
        "name": "MaxFlowMinCut",
        "size": 7840
      }, {
        "name": "ShortestPaths",
        "size": 5914
      }, {
        "name": "SpanningTree",
        "size": 3416
      }]
    }, {
      "name": "optimization",
      "children": [{
        "name": "AspectRatioBanker",
        "size": 7074
      }]
    }]
  }, {
    "name": "animate",
    "children": [{
      "name": "Easing",
      "size": 17010
    }, {
      "name": "FunctionSequence",
      "size": 5842
    }, {
      "name": "interpolate",
      "children": [{
        "name": "ArrayInterpolator",
        "size": 1983
      }, {
        "name": "ColorInterpolator",
        "size": 2047
      }, {
        "name": "DateInterpolator",
        "size": 1375
      }, {
        "name": "Interpolator",
        "size": 8746
      }, {
        "name": "MatrixInterpolator",
        "size": 2202
      }, {
        "name": "NumberInterpolator",
        "size": 1382
      }, {
        "name": "ObjectInterpolator",
        "size": 1629
      }, {
        "name": "PointInterpolator",
        "size": 1675
      }, {
        "name": "RectangleInterpolator",
        "size": 2042
      }]
    }, {
      "name": "ISchedulable",
      "size": 1041
    }, {
      "name": "Parallel",
      "size": 5176
    }, {
      "name": "Pause",
      "size": 449
    }, {
      "name": "Scheduler",
      "size": 5593
    }, {
      "name": "Sequence",
      "size": 5534
    }, {
      "name": "Transition",
      "size": 9201
    }, {
      "name": "Transitioner",
      "size": 19975
    }, {
      "name": "TransitionEvent",
      "size": 1116
    }, {
      "name": "Tween",
      "size": 6006
    }]
  }, {
    "name": "data",
    "children": [{
      "name": "converters",
      "children": [{
        "name": "Converters",
        "size": 721
      }, {
        "name": "DelimitedTextConverter",
        "size": 4294
      }, {
        "name": "GraphMLConverter",
        "size": 9800
      }, {
        "name": "IDataConverter",
        "size": 1314
      }, {
        "name": "JSONConverter",
        "size": 2220
      }]
    }, {
      "name": "DataField",
      "size": 1759
    }, {
      "name": "DataSchema",
      "size": 2165
    }, {
      "name": "DataSet",
      "size": 586
    }, {
      "name": "DataSource",
      "size": 3331
    }, {
      "name": "DataTable",
      "size": 772
    }, {
      "name": "DataUtil",
      "size": 3322
    }]
  }, {
    "name": "display",
    "children": [{
      "name": "DirtySprite",
      "size": 8833
    }, {
      "name": "LineSprite",
      "size": 1732
    }, {
      "name": "RectSprite",
      "size": 3623
    }, {
      "name": "TextSprite",
      "size": 10066
    }]
  }, {
    "name": "flex",
    "children": [{
      "name": "FlareVis",
      "size": 4116
    }]
  }, {
    "name": "physics",
    "children": [{
      "name": "DragForce",
      "size": 1082
    }, {
      "name": "GravityForce",
      "size": 1336
    }, {
      "name": "IForce",
      "size": 319
    }, {
      "name": "NBodyForce",
      "size": 10498
    }, {
      "name": "Particle",
      "size": 2822
    }, {
      "name": "Simulation",
      "size": 9983
    }, {
      "name": "Spring",
      "size": 2213
    }, {
      "name": "SpringForce",
      "size": 1681
    }]
  }, {
    "name": "query",
    "children": [{
      "name": "AggregateExpression",
      "size": 1616
    }, {
      "name": "And",
      "size": 1027
    }, {
      "name": "Arithmetic",
      "size": 3891
    }, {
      "name": "Average",
      "size": 891
    }, {
      "name": "BinaryExpression",
      "size": 2893
    }, {
      "name": "Comparison",
      "size": 5103
    }, {
      "name": "CompositeExpression",
      "size": 3677
    }, {
      "name": "Count",
      "size": 781
    }, {
      "name": "DateUtil",
      "size": 4141
    }, {
      "name": "Distinct",
      "size": 933
    }, {
      "name": "Expression",
      "size": 5130
    }, {
      "name": "ExpressionIterator",
      "size": 3617
    }, {
      "name": "Fn",
      "size": 3240
    }, {
      "name": "If",
      "size": 2732
    }, {
      "name": "IsA",
      "size": 2039
    }, {
      "name": "Literal",
      "size": 1214
    }, {
      "name": "Match",
      "size": 3748
    }, {
      "name": "Maximum",
      "size": 843
    }, {
      "name": "methods",
      "children": [{
        "name": "add",
        "size": 593
      }, {
        "name": "and",
        "size": 330
      }, {
        "name": "average",
        "size": 287
      }, {
        "name": "count",
        "size": 277
      }, {
        "name": "distinct",
        "size": 292
      }, {
        "name": "div",
        "size": 595
      }, {
        "name": "eq",
        "size": 594
      }, {
        "name": "fn",
        "size": 460
      }, {
        "name": "gt",
        "size": 603
      }, {
        "name": "gte",
        "size": 625
      }, {
        "name": "iff",
        "size": 748
      }, {
        "name": "isa",
        "size": 461
      }, {
        "name": "lt",
        "size": 597
      }, {
        "name": "lte",
        "size": 619
      }, {
        "name": "max",
        "size": 283
      }, {
        "name": "min",
        "size": 283
      }, {
        "name": "mod",
        "size": 591
      }, {
        "name": "mul",
        "size": 603
      }, {
        "name": "neq",
        "size": 599
      }, {
        "name": "not",
        "size": 386
      }, {
        "name": "or",
        "size": 323
      }, {
        "name": "orderby",
        "size": 307
      }, {
        "name": "range",
        "size": 772
      }, {
        "name": "select",
        "size": 296
      }, {
        "name": "stddev",
        "size": 363
      }, {
        "name": "sub",
        "size": 600
      }, {
        "name": "sum",
        "size": 280
      }, {
        "name": "update",
        "size": 307
      }, {
        "name": "variance",
        "size": 335
      }, {
        "name": "where",
        "size": 299
      }, {
        "name": "xor",
        "size": 354
      }, {
        "name": "_",
        "size": 264
      }]
    }, {
      "name": "Minimum",
      "size": 843
    }, {
      "name": "Not",
      "size": 1554
    }, {
      "name": "Or",
      "size": 970
    }, {
      "name": "Query",
      "size": 13896
    }, {
      "name": "Range",
      "size": 1594
    }, {
      "name": "StringUtil",
      "size": 4130
    }, {
      "name": "Sum",
      "size": 791
    }, {
      "name": "Variable",
      "size": 1124
    }, {
      "name": "Variance",
      "size": 1876
    }, {
      "name": "Xor",
      "size": 1101
    }]
  }, {
    "name": "scale",
    "children": [{
      "name": "IScaleMap",
      "size": 2105
    }, {
      "name": "LinearScale",
      "size": 1316
    }, {
      "name": "LogScale",
      "size": 3151
    }, {
      "name": "OrdinalScale",
      "size": 3770
    }, {
      "name": "QuantileScale",
      "size": 2435
    }, {
      "name": "QuantitativeScale",
      "size": 4839
    }, {
      "name": "RootScale",
      "size": 1756
    }, {
      "name": "Scale",
      "size": 4268
    }, {
      "name": "ScaleType",
      "size": 1821
    }, {
      "name": "TimeScale",
      "size": 5833
    }]
  }, {
    "name": "util",
    "children": [{
      "name": "Arrays",
      "size": 8258
    }, {
      "name": "Colors",
      "size": 10001
    }, {
      "name": "Dates",
      "size": 8217
    }, {
      "name": "Displays",
      "size": 12555
    }, {
      "name": "Filter",
      "size": 2324
    }, {
      "name": "Geometry",
      "size": 10993
    }, {
      "name": "heap",
      "children": [{
        "name": "FibonacciHeap",
        "size": 9354
      }, {
        "name": "HeapNode",
        "size": 1233
      }]
    }, {
      "name": "IEvaluable",
      "size": 335
    }, {
      "name": "IPredicate",
      "size": 383
    }, {
      "name": "IValueProxy",
      "size": 874
    }, {
      "name": "math",
      "children": [{
        "name": "DenseMatrix",
        "size": 3165
      }, {
        "name": "IMatrix",
        "size": 2815
      }, {
        "name": "SparseMatrix",
        "size": 3366
      }]
    }, {
      "name": "Maths",
      "size": 17705
    }, {
      "name": "Orientation",
      "size": 1486
    }, {
      "name": "palette",
      "children": [{
        "name": "ColorPalette",
        "size": 6367
      }, {
        "name": "Palette",
        "size": 1229
      }, {
        "name": "ShapePalette",
        "size": 2059
      }, {
        "name": "SizePalette",
        "size": 2291
      }]
    }, {
      "name": "Property",
      "size": 5559
    }, {
      "name": "Shapes",
      "size": 19118
    }, {
      "name": "Sort",
      "size": 6887
    }, {
      "name": "Stats",
      "size": 6557
    }, {
      "name": "Strings",
      "size": 22026
    }]
  }, {
    "name": "vis",
    "children": [{
      "name": "axis",
      "children": [{
        "name": "Axes",
        "size": 1302
      }, {
        "name": "Axis",
        "size": 24593
      }, {
        "name": "AxisGridLine",
        "size": 652
      }, {
        "name": "AxisLabel",
        "size": 636
      }, {
        "name": "CartesianAxes",
        "size": 6703
      }]
    }, {
      "name": "controls",
      "children": [{
        "name": "AnchorControl",
        "size": 2138
      }, {
        "name": "ClickControl",
        "size": 3824
      }, {
        "name": "Control",
        "size": 1353
      }, {
        "name": "ControlList",
        "size": 4665
      }, {
        "name": "DragControl",
        "size": 2649
      }, {
        "name": "ExpandControl",
        "size": 2832
      }, {
        "name": "HoverControl",
        "size": 4896
      }, {
        "name": "IControl",
        "size": 763
      }, {
        "name": "PanZoomControl",
        "size": 5222
      }, {
        "name": "SelectionControl",
        "size": 7862
      }, {
        "name": "TooltipControl",
        "size": 8435
      }]
    }, {
      "name": "data",
      "children": [{
        "name": "Data",
        "size": 20544
      }, {
        "name": "DataList",
        "size": 19788
      }, {
        "name": "DataSprite",
        "size": 10349
      }, {
        "name": "EdgeSprite",
        "size": 3301
      }, {
        "name": "NodeSprite",
        "size": 19382
      }, {
        "name": "render",
        "children": [{
          "name": "ArrowType",
          "size": 698
        }, {
          "name": "EdgeRenderer",
          "size": 5569
        }, {
          "name": "IRenderer",
          "size": 353
        }, {
          "name": "ShapeRenderer",
          "size": 2247
        }]
      }, {
        "name": "ScaleBinding",
        "size": 11275
      }, {
        "name": "Tree",
        "size": 7147
      }, {
        "name": "TreeBuilder",
        "size": 9930
      }]
    }, {
      "name": "events",
      "children": [{
        "name": "DataEvent",
        "size": 2313
      }, {
        "name": "SelectionEvent",
        "size": 1880
      }, {
        "name": "TooltipEvent",
        "size": 1701
      }, {
        "name": "VisualizationEvent",
        "size": 1117
      }]
    }, {
      "name": "legend",
      "children": [{
        "name": "Legend",
        "size": 20859
      }, {
        "name": "LegendItem",
        "size": 4614
      }, {
        "name": "LegendRange",
        "size": 10530
      }]
    }, {
      "name": "operator",
      "children": [{
        "name": "distortion",
        "children": [{
          "name": "BifocalDistortion",
          "size": 4461
        }, {
          "name": "Distortion",
          "size": 6314
        }, {
          "name": "FisheyeDistortion",
          "size": 3444
        }]
      }, {
        "name": "encoder",
        "children": [{
          "name": "ColorEncoder",
          "size": 3179
        }, {
          "name": "Encoder",
          "size": 4060
        }, {
          "name": "PropertyEncoder",
          "size": 4138
        }, {
          "name": "ShapeEncoder",
          "size": 1690
        }, {
          "name": "SizeEncoder",
          "size": 1830
        }]
      }, {
        "name": "filter",
        "children": [{
          "name": "FisheyeTreeFilter",
          "size": 5219
        }, {
          "name": "GraphDistanceFilter",
          "size": 3165
        }, {
          "name": "VisibilityFilter",
          "size": 3509
        }]
      }, {
        "name": "IOperator",
        "size": 1286
      }, {
        "name": "label",
        "children": [{
          "name": "Labeler",
          "size": 9956
        }, {
          "name": "RadialLabeler",
          "size": 3899
        }, {
          "name": "StackedAreaLabeler",
          "size": 3202
        }]
      }, {
        "name": "layout",
        "children": [{
          "name": "AxisLayout",
          "size": 6725
        }, {
          "name": "BundledEdgeRouter",
          "size": 3727
        }, {
          "name": "CircleLayout",
          "size": 9317
        }, {
          "name": "CirclePackingLayout",
          "size": 12003
        }, {
          "name": "DendrogramLayout",
          "size": 4853
        }, {
          "name": "ForceDirectedLayout",
          "size": 8411
        }, {
          "name": "IcicleTreeLayout",
          "size": 4864
        }, {
          "name": "IndentedTreeLayout",
          "size": 3174
        }, {
          "name": "Layout",
          "size": 7881
        }, {
          "name": "NodeLinkTreeLayout",
          "size": 12870
        }, {
          "name": "PieLayout",
          "size": 2728
        }, {
          "name": "RadialTreeLayout",
          "size": 12348
        }, {
          "name": "RandomLayout",
          "size": 870
        }, {
          "name": "StackedAreaLayout",
          "size": 9121
        }, {
          "name": "TreeMapLayout",
          "size": 9191
        }]
      }, {
        "name": "Operator",
        "size": 2490
      }, {
        "name": "OperatorList",
        "size": 5248
      }, {
        "name": "OperatorSequence",
        "size": 4190
      }, {
        "name": "OperatorSwitch",
        "size": 2581
      }, {
        "name": "SortOperator",
        "size": 2023
      }]
    }, {
      "name": "Visualization",
      "size": 16540
    }]
  }]
}];
},{}],"ghraph.js":[function(require,module,exports) {
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
var margin = {
  top: 20,
  right: 120,
  bottom: 20,
  left: 120
},
    width = 960 - margin.right - margin.left,
    height = 800 - margin.top - margin.bottom;

var root = require("./graph-data.json");

var i = 0,
    duration = 750,
    rectW = 60,
    rectH = 30;
var tree = d3.layout.tree().nodeSize([70, 40]);
var diagonal = d3.svg.diagonal().projection(function (d) {
  return [d.x + rectW / 2, d.y + rectH / 2];
});
var svg = d3.select("#body").append("svg").attr("width", 1000).attr("height", 1000).call(zm = d3.behavior.zoom().scaleExtent([1, 3]).on("zoom", redraw)).append("g").attr("transform", "translate(" + 350 + "," + 20 + ")"); //necessary so that zoom knows where to zoom and unzoom from

zm.translate([350, 20]);
root.x0 = 0;
root.y0 = height / 2;

function collapse(d) {
  if (d.children) {
    d._children = d.children;

    d._children.forEach(collapse);

    d.children = null;
  }
}

root.children.forEach(collapse);
update(root);
d3.select("#body").style("height", "800px");

function update(source) {
  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes); // Normalize for fixed-depth.

  nodes.forEach(function (d) {
    d.y = d.depth * 180;
  }); // Update the nodes…

  var node = svg.selectAll("g.node").data(nodes, function (d) {
    return d.id || (d.id = ++i);
  }); // Enter any new nodes at the parent's previous position.

  var nodeEnter = node.enter().append("g").attr("class", "node").attr("transform", function (d) {
    return "translate(" + source.x0 + "," + source.y0 + ")";
  }).on("click", click);
  nodeEnter.append("rect").attr("width", rectW).attr("height", rectH).attr("stroke", "black").attr("stroke-width", 1).style("fill", function (d) {
    return d._children ? "lightsteelblue" : "#fff";
  });
  nodeEnter.append("text").attr("x", rectW / 2).attr("y", rectH / 2).attr("dy", ".35em").attr("text-anchor", "middle").text(function (d) {
    return d.name;
  }); // Transition nodes to their new position.

  var nodeUpdate = node.transition().duration(duration).attr("transform", function (d) {
    return "translate(" + d.x + "," + d.y + ")";
  });
  nodeUpdate.select("rect").attr("width", rectW).attr("height", rectH).attr("stroke", "black").attr("stroke-width", 1).style("fill", function (d) {
    return d._children ? "lightsteelblue" : "#fff";
  });
  nodeUpdate.select("text").style("fill-opacity", 1); // Transition exiting nodes to the parent's new position.

  var nodeExit = node.exit().transition().duration(duration).attr("transform", function (d) {
    return "translate(" + source.x + "," + source.y + ")";
  }).remove();
  nodeExit.select("rect").attr("width", rectW).attr("height", rectH) //.attr("width", bbox.getBBox().width)""
  //.attr("height", bbox.getBBox().height)
  .attr("stroke", "black").attr("stroke-width", 1);
  nodeExit.select("text"); // Update the links…

  var link = svg.selectAll("path.link").data(links, function (d) {
    return d.target.id;
  }); // Enter any new links at the parent's previous position.

  link.enter().insert("path", "g").attr("class", "link").attr("x", rectW / 2).attr("y", rectH / 2).attr("d", function (d) {
    var o = {
      x: source.x0,
      y: source.y0
    };
    return diagonal({
      source: o,
      target: o
    });
  }); // Transition links to their new position.

  link.transition().duration(duration).attr("d", diagonal); // Transition exiting nodes to the parent's new position.

  link.exit().transition().duration(duration).attr("d", function (d) {
    var o = {
      x: source.x,
      y: source.y
    };
    return diagonal({
      source: o,
      target: o
    });
  }).remove(); // Stash the old positions for transition.

  nodes.forEach(function (d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
} // Toggle children on click.


function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }

  update(d);
} //Redraw for zoom


function redraw() {
  //console.log("here", d3.event.translate, d3.event.scale);
  svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
}
},{"./graph-data.json":"graph-data.json"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "45851" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","ghraph.js"], null)
//# sourceMappingURL=/html/graph/ghraph.57efeed2.js.map