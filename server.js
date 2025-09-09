const isDev = process.env.npm_lifecycle_event === "dev";

// server.js
const path = require("path");
const fs = require("fs");
const esbuild = require("esbuild");
const chokidar = require("chokidar");
const browserSync = require("browser-sync").create();

const projectRoot = process.cwd();
const entryDir = isDev ? "src" : "";
const outDir = path.join(projectRoot, ".dev");

if (!fs.existsSync(path.join(projectRoot, "balder.ts")) && !isDev) {
    if (fs.readdirSync(projectRoot).some(file => file.endsWith(".ts"))) {
        fs.cpSync(path.join(__dirname, "src", "balder.ts"), path.join(projectRoot, "balder.ts"));
    } else {
        fs.cpSync(path.join(__dirname, "src"), projectRoot, { recursive: true,  });
    }
    if (!fs.existsSync(path.join(projectRoot, "apps"))) {
        fs.mkdirSync(path.join(projectRoot, "apps"));
    }
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
            external: ["./balder.ts", "./src/balder.ts"],
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
        console.error(err);
    }
}


buildOnce().then(() => {
    console.log("Initial build complete.");
});


chokidar
    .watch(path.join(projectRoot, entryDir), { ignoreInitial: true, ignored: (path) => path.includes('.dev')})
    .on("all", (event, pathChanged) => {
        // if (/^(?:\.\/)?\.dev(?:[\\/]|$)/.test(path.relative(projectRoot, pathChanged))) return;
        console.log(`File ${pathChanged} (${event}). Rebuilding…`);
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
