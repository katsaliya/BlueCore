"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initVectorAiBridge = initVectorAiBridge;
exports.upsertVectorAiBridge = upsertVectorAiBridge;
exports.queryVectorAiBridge = queryVectorAiBridge;
const env_1 = require("../config/env");
async function initVectorAiBridge(payload) {
    const url = `${env_1.env.VECTORAI_BRIDGE_BASE_URL}/init`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    const data = await response.json();
    return {
        status: response.status,
        data
    };
}
async function upsertVectorAiBridge(payload) {
    const url = `${env_1.env.VECTORAI_BRIDGE_BASE_URL}/upsert`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    const data = await response.json();
    return {
        status: response.status,
        data
    };
}
async function queryVectorAiBridge(payload) {
    const url = `${env_1.env.VECTORAI_BRIDGE_BASE_URL}/query`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    const data = await response.json();
    return {
        status: response.status,
        data
    };
}
