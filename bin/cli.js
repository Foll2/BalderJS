#!/usr/bin/env node

const isDev = process.env.npm_lifecycle_event === "dev";

if (isDev) {
    console.log("⚙️  Dev mode detected via npm_lifecycle_event.");
}

require("../server.js");