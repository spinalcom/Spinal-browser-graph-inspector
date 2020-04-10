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

import { FileSystem } from "spinal-core-connectorjs_type";

const config = {
  spinalConnector: {
    user: 168,
    password: 'IZEnMGgpUZxm',
    host: 'localhost',
    port: 8080,
    protocol: 'http'
  },
  file: {
    path: '/__users__/admin/Digital_twin'
  }
};
var spinalCore = require('spinal-core-connectorjs');
var spinalgraph = require('spinal-model-graph');

export class Spinal {
  static instance = null;
  conn: spinal.FileSystem;
  static getInstance(): Spinal {
    if (Spinal.instance === null) {
      Spinal.instance = new Spinal();
    }
    return Spinal.instance;
  }
  private constructor() {
    const connect_opt =
      `http://${config.spinalConnector.user}:${config.spinalConnector.password}@${
      config.spinalConnector.host}:${config.spinalConnector.port}/`;

    this.conn = spinalCore.connect(connect_opt);
    FileSystem.CONNECTOR_TYPE = "Browser";
  }


  getServeIdByName(name) {
    const url = window.location.href;
    name = name.replace(/[[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return results[2].replace(/\+/g, " ");
  }


  load() {

    let serve_id = parseInt(this.getServeIdByName("id"));
    return new Promise((resolve, reject) => {
      this.conn.load_ptr(serve_id,
        (model) => {
          if (!model) {
            // on error
            alert("error model not found.")
            reject()
          } else {
            // on success
            resolve(model);
          }

        })
    })
  }




}

export default Spinal
