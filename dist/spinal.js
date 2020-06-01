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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const axios_1 = require("axios");
var spinalgraph = require('spinal-model-graph');
class Spinal {
    constructor() {
        this.connectPromise = null;
        this.connectPromise = null;
        this.connect();
    }
    static getInstance() {
        if (Spinal.instance === null) {
            Spinal.instance = new Spinal();
        }
        return Spinal.instance;
    }
    getauth() {
        const encryptedHex = window.localStorage.getItem('spinalhome_cfg');
        return JSON.parse(atob(encryptedHex));
    }
    disconnect() {
        window.localStorage.removeItem('spinalhome_cfg');
        // @ts-ignore
        window.location = "/html/drive/";
    }
    connect() {
        if (this.connectPromise !== null) {
            return this.connectPromise;
        }
        const serverHost = window.location.origin;
        spinal_core_connectorjs_type_1.FileSystem.CONNECTOR_TYPE = "Browser";
        const user = this.getauth();
        this.connectPromise = new Promise((resolve, reject) => {
            return axios_1.default.get(`${serverHost}/get_user_id`, {
                params: {
                    u: user.username,
                    p: user.password
                }
            }).then(response => {
                let id = parseInt(response.data);
                const host = serverHost.replace(/https?:\/\//, "");
                this.conn = spinal_core_connectorjs_type_1.spinalCore.connect(`http://${id}:${user.password}@${host}/`);
                resolve(this.conn);
            }, () => {
                reject('Authentication Connection Error');
            });
        });
        return this.connectPromise;
    }
    load(serve_id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connect();
            return new Promise((resolve, reject) => {
                this.conn.load_ptr(serve_id, (model) => {
                    if (!model) {
                        // on error
                        alert("error model not found.");
                        reject();
                    }
                    else {
                        // on success
                        resolve(model);
                    }
                });
            });
        });
    }
}
Spinal.instance = null;
exports.Spinal = Spinal;
exports.default = Spinal;
//# sourceMappingURL=spinal.js.map