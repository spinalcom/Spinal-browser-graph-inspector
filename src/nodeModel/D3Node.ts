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

import NodeRelationG from "./NodeRelationG";
import NodeG from "./NodeG";

export interface D3Node {
  data: NodeG | NodeRelationG;
  height?: number;
  depth?: number;
  parent: D3Node[]
  children?: D3Node[]
  _children?: D3Node[]
  id?: number
  index?: number
  isRoot?: boolean;
  x?: number
  y?: number
  vy?: number
  vx?: number
  fx?: any
  fy?: any
}
