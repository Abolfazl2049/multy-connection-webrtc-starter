// scripts/minify.js
import {promises as fs} from "fs";
import path from "path";
import {fileURLToPath} from "url";
import {minify} from "terser";

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Resolve the dist directory relative to the project root (assuming scripts/ is one level down)
const distDir = path.resolve(__dirname, "../dist");
// Set to true to minify files in subdirectories as well
const recursive = true;
// Set to true to keep the original file extension (e.g., file.js -> file.js)
// Set to false to add .min.js (e.g., file.js -> file.min.js) - Requires output modification
const overwriteOriginals = true; // WARNING: This will replace your original files in dist!
// --- End Configuration ---

async function findJsFiles(dir) {
  let jsFiles = [];
  try {
    const entries = await fs.readdir(dir, {withFileTypes: true});
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && recursive) {
        jsFiles = jsFiles.concat(await findJsFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith(".js") && !entry.name.endsWith(".min.js")) {
        // Avoid minifying already minified files if using .min.js extension
        jsFiles.push(fullPath);
      }
    }
  } catch (err) {
    // If distDir doesn't exist, treat it as no JS files found
    if (err.code === "ENOENT") {
      console.warn(`Warning: Directory not found: ${dir}`);
      return [];
    }
    console.error(`Error reading directory ${dir}:`, err);
    throw err; // Rethrow other errors
  }
  return jsFiles;
}

async function minifyFile(filePath) {
  try {
    const code = await fs.readFile(filePath, "utf8");
    console.log(`Minifying: ${path.relative(distDir, filePath)}`);

    const result = await minify(code, {
      sourceMap: false, // Set to true or options object if you need source maps
      mangle: true, // Enable variable name mangling
      compress: true, // Enable compression options
      // Add other Terser options here if needed:
      // https://github.com/terser/terser#minify-options ,
      keep_classnames: false,
      keep_fnames: false
    });

    if (result.error) {
      throw result.error; // Throw Terser specific errors
    }

    if (result.code) {
      const outputPath = overwriteOriginals ? filePath : filePath.replace(/\.js$/, ".min.js"); // Example for adding .min.js

      if (!overwriteOriginals && outputPath === filePath) {
        console.warn(`  -> Skipping write for ${filePath} as output path is the same and overwriteOriginals is false.`);
        return; // Prevent accidental overwrite if logic fails
      }

      await fs.writeFile(outputPath, result.code, "utf8");
      console.log(`  -> Success: ${path.relative(distDir, outputPath)}`);
    } else {
      console.warn(`  -> No code generated for ${filePath}. Skipping write.`);
    }
  } catch (error) {
    console.error(`\nError minifying ${path.relative(distDir, filePath)}:`);
    console.error(error);
    // Decide if you want to stop the whole process on error or continue
    // throw error; // Uncomment to stop on first error
  }
}

async function runMinification() {
  console.log(`Starting minification in: ${distDir}`);
  console.log(`Recursive: ${recursive}, Overwrite Originals: ${overwriteOriginals}`);
  console.log("---");

  try {
    const jsFiles = await findJsFiles(distDir);

    if (jsFiles.length === 0) {
      console.log("No .js files found to minify.");
      return;
    }

    console.log(`Found ${jsFiles.length} .js file(s).`);

    // Run minification tasks potentially in parallel (adjust if memory becomes an issue)
    await Promise.all(jsFiles.map(filePath => minifyFile(filePath)));

    console.log("---");
    console.log("Minification process finished.");
  } catch (error) {
    console.error("\n---");
    console.error("An error occurred during the minification process:", error);
    process.exit(1); // Exit with an error code
  }
}

// --- Execute the script ---
runMinification();
