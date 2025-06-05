const isDev = process.env.npm_lifecycle_event === "dev";

// server.js
const path = require("path");
const fs = require("fs");
const esbuild = require("esbuild");
const chokidar = require("chokidar");
const browserSync = require("browser-sync").create();

const projectRoot = process.cwd();
const entryDir = isDev ? "default" : "";
const outDir = path.join(projectRoot, ".dev");

if (!fs.existsSync(path.join(projectRoot, "balder.ts")) && !isDev) {
    fs.cpSync(path.join(__dirname, "default"), projectRoot, { recursive: true });
    fs.mkdirSync(path.join(projectRoot, "apps"));
    console.log("Initial setup complete")
}

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
}


async function buildOnce() {
    try {

        await esbuild.build({
            entryPoints: [path.join(projectRoot, entryDir, "app.ts")],
            outfile: path.join(outDir, "bundle.js"),
            bundle: true,
            sourcemap: true,
            format: "esm",
            external: ["./balder.ts", "./default/balder.ts"],
        });

        await esbuild.build({
            entryPoints: [path.join(projectRoot, entryDir, "balder.ts")],
            outfile: path.join(outDir, "balder.js"),
            bundle: false,
            format: "esm",
            sourcemap: true,
        });

        console.log("Built → bundle.js + balder.js");
        browserSync.reload();
    } catch (err) {
        console.error("Build failed:", err);
    }
}


buildOnce().then(() => {
    console.log("Initial build complete.");
});


chokidar
    .watch(path.join(projectRoot, "*"), { ignoreInitial: true })
    .on("all", (event, pathChanged) => {
        console.log(`File ${pathChanged} changed (${event}). Rebuilding…`);
        buildOnce();
    });


browserSync.init({
    server: {
        baseDir: [path.join(__dirname, "template"), outDir, path.join(projectRoot, entryDir, "assets")],
    },
    files: [
        path.join(__dirname, "template", "index.html"),
        path.join(projectRoot, entryDir, "*"),
    ],
    port: 3000,
    ui: false,
    notify: false,
});
