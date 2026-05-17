import path, { join } from "path";
import fs from "fs";
import { createHash } from "crypto";

// We use Hasher to add a version identifier to the public URLs of static assets (script.js -> script.js?v=c040ed4)
// Hashes are calculated at start-up, ensuring there is no performance penalty during lookups.

// The version is the MD5 hash of the file's content. Thus, when the content changes, the version also changes.
// This lets us set a far-future expires header for static assets w/o worrying about cache invalidation,
// while ensuring that the user only downloads static assets that have changed since the last deployment.
export class Hasher {
  #cache;
  constructor({
    prefix = "/static",
    root = process.cwd() + "/static",
    filesystem = fs,
  }) {
    this.#cache = files(root, filesystem).reduce((cache, file) => {
      // We prepend /prefix/ for O(1) lookup. Given the /static/ prefix:
      // /css/main.css becomes /static/css/main.css,
      // /css/main.<hash>.css becomes /static/css/main.css?v=<hash>
      return cache.set(
        join(prefix, file.rel(root)),
        join(prefix, file.withHash(root)),
      );
    }, new Map());
  }

  hashed(path) {
    return this.#cache.get(path) ?? path;
  }
}

function files(root, filesystem) {
  return filesystem
    .readdirSync(root, { withFileTypes: true })
    .map((dirent) => {
      const absolute = path.join(root, dirent.name);
      return dirent.isDirectory()
        ? files(absolute, filesystem)
        : new File(absolute, filesystem);
    })
    .flat();
}

class File {
  #absolute;
  #filesystem;
  constructor(absolute, filesystem) {
    this.#absolute = absolute;
    this.#filesystem = filesystem;
  }

  rel(root) {
    return path.relative(root, this.#absolute);
  }

  withHash(root) {
    // css/app.css -> css/app.css?v=<hash>
    return this.rel(root) + "?v=" + this.#hash;
  }

  get #hash() {
    return createHash("md5")
      .update(this.#content)
      .digest("hex")
      .substring(0, 8);
  }

  get #content() {
    return this.#filesystem.readFileSync(this.#absolute);
  }
}

const hasher = new Hasher({});

export const hashed = (path) => hasher.hashed(path);
