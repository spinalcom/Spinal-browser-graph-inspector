"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const ANode_1 = require("./ANode");
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
class NodeRelationG extends ANode_1.default {
    constructor(node) {
        super(node);
        this.category = "relation";
        this.type = node.getType();
        this.hasChildren = node.getNbChildren() > 0 ? true : false;
    }
    getChildren() {
        const realNode = (spinal_core_connectorjs_type_1.FileSystem._objects[this._serverId]);
        return realNode.getChildren();
    }
}
exports.default = NodeRelationG;
//# sourceMappingURL=NodeRelationG.js.map