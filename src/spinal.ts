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

import { FileSystem, spinalCore } from "spinal-core-connectorjs_type";
import axios from "axios";

export class Spinal {
  static instance = null;
  connectPromise = null;
  conn: spinal.FileSystem;
  static getInstance(): Spinal {
    if (Spinal.instance === null) {
      Spinal.instance = new Spinal();
    }
    return Spinal.instance;
  }
  private constructor() {
    this.connectPromise = null;
    this.connect();
  }
  getauth(): { username: string; password: string } {
    const encryptedHex = window.localStorage.getItem("spinalhome_cfg");
    return JSON.parse(atob(encryptedHex));
  }
  disconnect() {
    window.localStorage.removeItem("spinalhome_cfg");
    // @ts-ignore
    window.location = "/html/drive/";
  }

  connect() {
    if (this.connectPromise !== null) {
      return this.connectPromise;
    }
    const serverHost = window.location.origin;
    FileSystem.CONNECTOR_TYPE = "Browser";
    const user = this.getauth();

    this.connectPromise = new Promise((resolve, reject) => {
      return axios
        .get(`${serverHost}/get_user_id`, {
          params: {
            u: user.username,
            p: user.password
          }
        })
        .then(
          response => {
            let id = parseInt(response.data);
            const host = serverHost.replace(/https?:\/\//, "");
            this.conn = spinalCore.connect(
              `http://${id}:${user.password}@${host}/`
            );
            resolve(this.conn);
          },
          () => {
            reject("Authentication Connection Error");
          }
        );
    });
    return this.connectPromise;
  }

  async load(serve_id) {
    await this.connect();
    return new Promise((resolve, reject) => {
      this.conn.load_ptr(serve_id, model => {
        if (!model) {
          // on error
          alert("error model not found.");
          reject();
        } else {
          // on success
          resolve(model);
        }
      });
    });
  }
}

export default Spinal;
