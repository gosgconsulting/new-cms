var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// sparti-cms/utils/debugLogger.js
function debugLog(...args) {
  if (DEBUG_ENABLED) {
    console.log(DEBUG_PREFIX, ...args);
  }
}
function debugError(...args) {
  if (DEBUG_ENABLED) {
    console.error(DEBUG_PREFIX, ...args);
  }
}
var DEBUG_ENABLED, DEBUG_PREFIX;
var init_debugLogger = __esm({
  "sparti-cms/utils/debugLogger.js"() {
    DEBUG_ENABLED = process.env.DEBUG === "true" || process.env.NODE_ENV === "development";
    DEBUG_PREFIX = "[testing]";
  }
});

// sparti-cms/db/connection.js
import { Pool } from "pg";
function getConnectionInfo() {
  const connString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  const info = {
    hasConnectionString: !!connString,
    source: process.env.DATABASE_PUBLIC_URL ? "DATABASE_PUBLIC_URL" : process.env.DATABASE_URL ? "DATABASE_URL" : "none",
    host: null,
    port: null,
    database: null,
    user: null
  };
  if (connString) {
    try {
      const url = new URL(connString.replace("postgresql://", "http://"));
      info.host = url.hostname;
      info.port = url.port || 5432;
      info.database = url.pathname.replace("/", "") || "default";
      info.user = url.username || "unknown";
    } catch (e) {
    }
  }
  return info;
}
async function query(text, params, retries = 3) {
  let lastError;
  const connString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || "";
  const isLocalhost = connString.includes("localhost") || connString.includes("127.0.0.1") || connString.includes("::1");
  const maxRetries = isLocalhost ? 5 : retries;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let client;
    try {
      const poolInstance = getPool();
      if (isMockMode) {
        return await poolInstance.query(text, params);
      }
      const connectionTimeout = isLocalhost ? 3e4 : 1e4;
      client = await Promise.race([
        poolInstance.connect(),
        new Promise(
          (_, reject) => setTimeout(() => reject(new Error(`Connection timeout after ${connectionTimeout / 1e3} seconds`)), connectionTimeout)
        )
      ]);
      const result = await client.query(text, params);
      client.release();
      return result;
    } catch (error) {
      if (client) {
        try {
          client.release();
        } catch (releaseError) {
          debugError("Error releasing client:", releaseError);
        }
      }
      lastError = error;
      if (attempt === 1) {
        debugError("Query error (attempt 1):", error.message);
        if (error.code) {
          debugError("Error code:", error.code);
        }
        if (error.errno) {
          debugError("Error number:", error.errno);
        }
        if (error.syscall) {
          debugError("System call:", error.syscall);
        }
      } else {
        debugError(`Query error (attempt ${attempt}/${retries}):`, error.message);
      }
      if (error.code === "42P01" || // Table doesn't exist
      error.code === "23505" || // Unique violation
      error.code === "23503" || // Foreign key violation
      error.code === "MOCK_DB") {
        throw error;
      }
      if (error.code === "ECONNRESET" || error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
        if (attempt === 1) {
          debugError("Database connection issue detected. Possible causes:");
          if (isLocalhost) {
            debugError("  - PostgreSQL service is not running locally");
            debugError("  - PostgreSQL is starting up (may take a few seconds)");
            debugError("  - Incorrect connection string or credentials in .env");
            debugError("  - PostgreSQL is not listening on the expected port");
          } else {
            debugError("  - Database server is not running or not accessible");
            debugError("  - Network connectivity issues");
            debugError("  - Incorrect connection string or credentials");
            debugError("  - Firewall blocking the connection");
            debugError("  - Database server may be paused (Railway free tier)");
          }
        }
      }
      if (attempt < maxRetries) {
        let delay;
        if (isLocalhost && error.code === "ECONNREFUSED") {
          delay = Math.min(2e3 * Math.pow(2, attempt - 1), 1e4);
        } else {
          delay = Math.min(1e3 * Math.pow(2, attempt - 1), 5e3);
        }
        debugLog(`Retrying query in ${delay}ms... (attempt ${attempt}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  debugError("Query failed after all retries");
  debugError("Last error:", lastError.message);
  if (lastError.code === "ECONNRESET") {
    debugError("");
    debugError("============================================");
    debugError("DATABASE CONNECTION FAILED");
    debugError("============================================");
    debugError("The server will continue running, but database");
    debugError("operations will fail until the connection is fixed.");
    debugError("");
    debugError("To fix this:");
    debugError("1. Check if your database server is running");
    debugError("2. Verify DATABASE_URL or DATABASE_PUBLIC_URL env var");
    debugError("3. Check network connectivity");
    debugError("4. For Railway: ensure database is not paused");
    debugError("============================================");
  }
  throw lastError;
}
var getConnectionString, pool, isMockMode, MockClient, MockPool, getPool, canUserAccessTenant, poolProxy, connection_default;
var init_connection = __esm({
  "sparti-cms/db/connection.js"() {
    init_debugLogger();
    getConnectionString = () => {
      const connString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
      if (process.env.DATABASE_PUBLIC_URL) {
        debugLog("Using DATABASE_PUBLIC_URL for connection");
      } else if (process.env.DATABASE_URL) {
        debugLog("Using DATABASE_URL for connection");
      } else {
        debugError("WARNING: No DATABASE_URL or DATABASE_PUBLIC_URL found in environment variables!");
        debugError("Falling back to MOCK DATABASE mode so the app can run without a real DB.");
        debugError("To fix: Set DATABASE_PUBLIC_URL or DATABASE_URL in your .env file");
        debugError("Example: DATABASE_PUBLIC_URL=postgresql://user:password@host:port/database");
        return null;
      }
      try {
        const url = new URL(connString.replace("postgresql://", "http://"));
        debugLog(`Connecting to database at ${url.hostname}:${url.port || 5432}`);
        debugLog(`Database name: ${url.pathname.replace("/", "") || "default"}`);
      } catch (e) {
        debugError("Could not parse connection string for logging:", e.message);
        debugError("Connection string format should be: postgresql://user:password@host:port/database");
      }
      return connString;
    };
    pool = null;
    isMockMode = process.env.MOCK_DATABASE === "true" || !process.env.DATABASE_PUBLIC_URL && !process.env.DATABASE_URL;
    MockClient = class {
      async query(text, params) {
        const sql = String(text || "").trim().toLowerCase();
        if (sql.startsWith("select 1")) {
          return { rows: [{ "?column?": 1 }], rowCount: 1 };
        }
        if (sql.startsWith("select")) {
          return { rows: [], rowCount: 0 };
        }
        const err = new Error("Mock database mode: write/DDL operations are not available");
        err.code = "MOCK_DB";
        throw err;
      }
      release() {
      }
    };
    MockPool = class {
      totalCount = 0;
      idleCount = 0;
      waitingCount = 0;
      on() {
      }
      async connect() {
        return new MockClient();
      }
      async query(text, params) {
        const client = await this.connect();
        try {
          return await client.query(text, params);
        } finally {
          client.release();
        }
      }
    };
    getPool = () => {
      if (!pool) {
        if (isMockMode) {
          debugError("MOCK DATABASE mode enabled. No DATABASE_URL found. Returning empty results for reads.");
          pool = new MockPool();
          return pool;
        }
        debugLog("Initializing database connection pool...");
        const connInfo = getConnectionInfo();
        debugLog("Connection info:", {
          source: connInfo.source,
          host: connInfo.host,
          port: connInfo.port,
          database: connInfo.database,
          user: connInfo.user
        });
        try {
          const connString = getConnectionString();
          if (!connString) {
            throw new Error("No database connection string available");
          }
          const isLocalhost = connString.includes("localhost") || connString.includes("127.0.0.1") || connString.includes("::1");
          const useSSL = !isLocalhost || process.env.DATABASE_SSL === "true";
          const connectionTimeout = isLocalhost ? 3e4 : 1e4;
          const dbConfig = {
            connectionString: connString,
            ...useSSL ? { ssl: { rejectUnauthorized: false } } : {},
            max: 20,
            idleTimeoutMillis: 3e4,
            connectionTimeoutMillis: connectionTimeout
          };
          pool = new Pool(dbConfig);
          pool.on("connect", (client) => {
            debugLog("Connected to PostgreSQL database");
            debugLog("Connection pool active");
          });
          pool.on("error", (err) => {
            debugError("PostgreSQL connection pool error:", err);
            debugError("Pool error details:", {
              code: err.code,
              message: err.message,
              errno: err.errno,
              syscall: err.syscall
            });
          });
          debugLog("Database connection pool created");
        } catch (error) {
          debugError("Failed to create database connection pool:", error);
          debugError("Pool creation error details:", {
            code: error.code,
            message: error.message,
            stack: error.stack
          });
          throw error;
        }
      }
      return pool;
    };
    canUserAccessTenant = (user, tenantId) => {
      if (!user) return false;
      if (user.is_super_admin) return true;
      return user.tenant_id === tenantId;
    };
    poolProxy = new Proxy({}, {
      get(target, prop) {
        const poolInstance = getPool();
        return poolInstance[prop];
      }
    });
    connection_default = poolProxy;
  }
});

// sparti-cms/db/modules/layouts.js
async function getLayoutBySlug(slug, language = "default") {
  try {
    const pageRes = await query(`SELECT id FROM pages WHERE slug = $1`, [slug]);
    if (pageRes.rows.length === 0) return null;
    const pageId = pageRes.rows[0].id;
    const layoutRes = await query(`SELECT layout_json, version, updated_at FROM page_layouts WHERE page_id = $1 AND language = $2`, [pageId, language]);
    return layoutRes.rows[0] || { layout_json: { components: [] }, version: 1 };
  } catch (error) {
    console.error("Error fetching layout by slug:", error);
    throw error;
  }
}
async function upsertLayoutBySlug(slug, layoutJson, language = "default") {
  try {
    const pageRes = await query(`SELECT id FROM pages WHERE slug = $1`, [slug]);
    if (pageRes.rows.length === 0) {
      throw new Error("Page not found for slug: " + slug);
    }
    const pageId = pageRes.rows[0].id;
    const result = await query(`
      INSERT INTO page_layouts (page_id, language, layout_json, version, updated_at)
      VALUES ($1, $2, $3, 1, NOW())
      ON CONFLICT (page_id, language)
      DO UPDATE SET layout_json = EXCLUDED.layout_json, version = page_layouts.version + 1, updated_at = NOW()
      RETURNING layout_json, version
    `, [pageId, language, layoutJson]);
    return result.rows[0];
  } catch (error) {
    console.error("Error upserting layout by slug:", error);
    throw error;
  }
}
var init_layouts = __esm({
  "sparti-cms/db/modules/layouts.js"() {
    init_connection();
  }
});

// sparti-cms/services/googleTranslationService.js
function extractTextFromHtml(html) {
  if (!html || typeof html !== "string") {
    return { textSegments: [], htmlTemplate: html };
  }
  const textSegments = [];
  const timestamp = Date.now();
  const placeholderPattern = `{{TRANSLATE_TEXT_${timestamp}_`;
  let placeholderIndex = 0;
  let htmlTemplate = html;
  const parts = html.split(/(<[^>]+>)/);
  const processedParts = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith("<") && part.endsWith(">")) {
      processedParts.push(part);
    } else {
      const trimmedText = part.trim();
      if (trimmedText && trimmedText.length > 0) {
        textSegments.push(trimmedText);
        const placeholder = `${placeholderPattern}${placeholderIndex}}}`;
        processedParts.push(placeholder);
        placeholderIndex++;
      } else {
        processedParts.push(part);
      }
    }
  }
  htmlTemplate = processedParts.join("");
  return { textSegments, htmlTemplate };
}
function reconstructHtmlWithTranslatedText(htmlTemplate, translatedSegments) {
  let result = htmlTemplate;
  const timestampMatch = htmlTemplate.match(/TRANSLATE_TEXT_(\d+)_/);
  if (!timestampMatch) {
    return htmlTemplate;
  }
  const timestamp = timestampMatch[1];
  translatedSegments.forEach((translatedText, index) => {
    const placeholder = `{{TRANSLATE_TEXT_${timestamp}_${index}}}`;
    result = result.replace(placeholder, translatedText);
  });
  return result;
}
function containsHtml(text) {
  if (!text || typeof text !== "string") {
    return false;
  }
  return /<[^>]+>/.test(text);
}
function splitTextIntoChunks(text, maxBytes = 15e4) {
  if (!text || typeof text !== "string") {
    return [text];
  }
  const textBytes = Buffer.byteLength(text, "utf8");
  if (textBytes <= maxBytes) {
    return [text];
  }
  const sentences = text.split(/([.!?]\s+)/);
  const chunks = [];
  let currentChunk = "";
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const testChunk = currentChunk + sentence;
    const testBytes = Buffer.byteLength(testChunk, "utf8");
    if (testBytes <= maxBytes) {
      currentChunk = testChunk;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      if (Buffer.byteLength(sentence, "utf8") > maxBytes) {
        const words = sentence.split(/\s+/);
        let wordChunk = "";
        for (const word of words) {
          const testWordChunk = wordChunk + (wordChunk ? " " : "") + word;
          const wordBytes = Buffer.byteLength(testWordChunk, "utf8");
          if (wordBytes <= maxBytes) {
            wordChunk = testWordChunk;
          } else {
            if (wordChunk) {
              chunks.push(wordChunk.trim());
            }
            wordChunk = word;
          }
        }
        if (wordChunk) {
          currentChunk = wordChunk;
        }
      } else {
        currentChunk = sentence;
      }
    }
  }
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  return chunks.length > 0 ? chunks : [text];
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function processInBatches(items, processor, batchSize = 10) {
  const results = new Array(items.length);
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchPromises = batch.map(
      (item, batchIndex) => processor(item, i + batchIndex)
    );
    const batchResults = await Promise.allSettled(batchPromises);
    batchResults.forEach((result, batchIndex) => {
      const originalIndex = i + batchIndex;
      if (result.status === "fulfilled") {
        results[originalIndex] = result.value;
      } else {
        results[originalIndex] = { error: result.reason };
      }
    });
    if (i + batchSize < items.length) {
      await sleep(200);
    }
  }
  return results;
}
async function translateTextChunk(text, targetLanguage, sourceLanguage = null, timeoutMs = 6e4, maxRetries = 3) {
  const apiKey = process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY || process.env.VITE_GOOGLE_CLOUD_TRANSLATION_API_KEY;
  if (!apiKey) {
    throw new Error("Google Cloud Translation API key not found");
  }
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            q: text,
            target: targetLanguage,
            ...sourceLanguage && { source: sourceLanguage },
            format: "text"
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Google Translation API error: ${response.status} ${errorText}`);
        }
        const data = await response.json();
        return data.data.translations[0].translatedText;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        const errorCause = fetchError.cause || fetchError;
        const isTimeout = fetchError.name === "AbortError" || fetchError.code === "ETIMEDOUT" || errorCause.code === "ETIMEDOUT" || errorCause.name === "AggregateError" && errorCause.code === "ETIMEDOUT" || fetchError.message && fetchError.message.includes("timeout") || fetchError.message && fetchError.message.includes("ETIMEDOUT") || fetchError.message && fetchError.message.includes("fetch failed");
        if (isTimeout) {
          throw new Error(`Request timeout after ${timeoutMs}ms`);
        }
        throw fetchError;
      }
    } catch (error) {
      lastError = error;
      const errorCause = error.cause || error;
      const isRetryable = error.message && (error.message.includes("timeout") || error.message.includes("ETIMEDOUT") || error.message.includes("fetch failed") || error.message.includes("network")) || error.code === "ETIMEDOUT" || errorCause.code === "ETIMEDOUT" || errorCause.name === "AggregateError" && errorCause.code === "ETIMEDOUT";
      if (attempt === maxRetries) {
        throw error;
      }
      if (!isRetryable) {
        console.log(`[testing] Non-retryable error on attempt ${attempt + 1}, not retrying:`, error.message);
        throw error;
      }
      const delayMs = Math.min(1e3 * Math.pow(2, attempt), 1e4);
      console.log(`[testing] Translation attempt ${attempt + 1} failed (${error.message}), retrying in ${delayMs}ms...`);
      await sleep(delayMs);
    }
  }
  throw lastError || new Error("Translation failed after all retries");
}
var translateText;
var init_googleTranslationService = __esm({
  "sparti-cms/services/googleTranslationService.js"() {
    translateText = async (text, targetLanguage, sourceLanguage = null) => {
      try {
        if (!text) {
          return text;
        }
        const textBytes = Buffer.byteLength(text, "utf8");
        const hasHtml = containsHtml(text);
        console.log(`[testing] Translating text to ${targetLanguage}${sourceLanguage ? ` from ${sourceLanguage}` : ""} (${textBytes} bytes${hasHtml ? ", contains HTML" : ""})`);
        if (hasHtml) {
          const { textSegments, htmlTemplate } = extractTextFromHtml(text);
          if (textSegments.length === 0) {
            return text;
          }
          console.log(`[testing] Extracted ${textSegments.length} text segments from HTML`);
          const translatedSegments = await processInBatches(
            textSegments,
            async (segment, index) => {
              try {
                const chunks2 = splitTextIntoChunks(segment);
                if (chunks2.length === 1) {
                  return await translateTextChunk(chunks2[0], targetLanguage, sourceLanguage);
                } else {
                  const translatedChunks = await processInBatches(
                    chunks2,
                    async (chunk) => {
                      try {
                        return await translateTextChunk(chunk, targetLanguage, sourceLanguage);
                      } catch (error) {
                        console.error(`[testing] Error translating chunk within segment ${index}:`, error);
                        return chunk;
                      }
                    },
                    5
                    // Process 5 chunks at a time (smaller batch for nested chunks)
                  );
                  const validChunks = translatedChunks.map((result, chunkIndex) => {
                    if (result && typeof result === "object" && result.error) {
                      console.error(`[testing] Error translating chunk ${chunkIndex + 1} within segment ${index}:`, result.error);
                      return chunks2[chunkIndex];
                    }
                    return result;
                  });
                  return validChunks.join(" ");
                }
              } catch (error) {
                console.error(`[testing] Error translating HTML text segment ${index}:`, error);
                return segment;
              }
            },
            5
            // Process 5 segments at a time (reduced to avoid overwhelming API)
          );
          const finalSegments = translatedSegments.map((result, index) => {
            if (result && typeof result === "object" && result.error) {
              console.error(`[testing] Error translating HTML text segment ${index}:`, result.error);
              return textSegments[index];
            }
            return result;
          });
          const translatedHtml = reconstructHtmlWithTranslatedText(htmlTemplate, finalSegments);
          return translatedHtml;
        }
        const chunks = splitTextIntoChunks(text);
        if (chunks.length === 1) {
          return await translateTextChunk(chunks[0], targetLanguage, sourceLanguage);
        } else {
          console.log(`[testing] Splitting into ${chunks.length} chunks for translation`);
          const translatedChunks = await processInBatches(
            chunks,
            async (chunk, index) => {
              console.log(`[testing] Translating chunk ${index + 1}/${chunks.length} (${Buffer.byteLength(chunk, "utf8")} bytes)`);
              return await translateTextChunk(chunk, targetLanguage, sourceLanguage);
            },
            5
            // Process 5 chunks at a time (reduced to avoid overwhelming API)
          );
          const validChunks = translatedChunks.map((result, index) => {
            if (result && typeof result === "object" && result.error) {
              console.error(`[testing] Error translating chunk ${index + 1}:`, result.error);
              return chunks[index];
            }
            return result;
          });
          return validChunks.join(" ");
        }
      } catch (error) {
        console.error("[testing] Error translating text:", error);
        return text;
      }
    };
  }
});

// node_modules/dotenv/package.json
var require_package = __commonJS({
  "node_modules/dotenv/package.json"(exports2, module) {
    module.exports = {
      name: "dotenv",
      version: "17.2.3",
      description: "Loads environment variables from .env file",
      main: "lib/main.js",
      types: "lib/main.d.ts",
      exports: {
        ".": {
          types: "./lib/main.d.ts",
          require: "./lib/main.js",
          default: "./lib/main.js"
        },
        "./config": "./config.js",
        "./config.js": "./config.js",
        "./lib/env-options": "./lib/env-options.js",
        "./lib/env-options.js": "./lib/env-options.js",
        "./lib/cli-options": "./lib/cli-options.js",
        "./lib/cli-options.js": "./lib/cli-options.js",
        "./package.json": "./package.json"
      },
      scripts: {
        "dts-check": "tsc --project tests/types/tsconfig.json",
        lint: "standard",
        pretest: "npm run lint && npm run dts-check",
        test: "tap run tests/**/*.js --allow-empty-coverage --disable-coverage --timeout=60000",
        "test:coverage": "tap run tests/**/*.js --show-full-coverage --timeout=60000 --coverage-report=text --coverage-report=lcov",
        prerelease: "npm test",
        release: "standard-version"
      },
      repository: {
        type: "git",
        url: "git://github.com/motdotla/dotenv.git"
      },
      homepage: "https://github.com/motdotla/dotenv#readme",
      funding: "https://dotenvx.com",
      keywords: [
        "dotenv",
        "env",
        ".env",
        "environment",
        "variables",
        "config",
        "settings"
      ],
      readmeFilename: "README.md",
      license: "BSD-2-Clause",
      devDependencies: {
        "@types/node": "^18.11.3",
        decache: "^4.6.2",
        sinon: "^14.0.1",
        standard: "^17.0.0",
        "standard-version": "^9.5.0",
        tap: "^19.2.0",
        typescript: "^4.8.4"
      },
      engines: {
        node: ">=12"
      },
      browser: {
        fs: false
      }
    };
  }
});

// node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  "node_modules/dotenv/lib/main.js"(exports2, module) {
    var fs4 = __require("fs");
    var path6 = __require("path");
    var os = __require("os");
    var crypto2 = __require("crypto");
    var packageJson = require_package();
    var version2 = packageJson.version;
    var TIPS = [
      "\u{1F510} encrypt with Dotenvx: https://dotenvx.com",
      "\u{1F510} prevent committing .env to code: https://dotenvx.com/precommit",
      "\u{1F510} prevent building .env in docker: https://dotenvx.com/prebuild",
      "\u{1F4E1} add observability to secrets: https://dotenvx.com/ops",
      "\u{1F465} sync secrets across teammates & machines: https://dotenvx.com/ops",
      "\u{1F5C2}\uFE0F backup and recover secrets: https://dotenvx.com/ops",
      "\u2705 audit secrets and track compliance: https://dotenvx.com/ops",
      "\u{1F504} add secrets lifecycle management: https://dotenvx.com/ops",
      "\u{1F511} add access controls to secrets: https://dotenvx.com/ops",
      "\u{1F6E0}\uFE0F  run anywhere with `dotenvx run -- yourcommand`",
      "\u2699\uFE0F  specify custom .env file path with { path: '/custom/path/.env' }",
      "\u2699\uFE0F  enable debug logging with { debug: true }",
      "\u2699\uFE0F  override existing env vars with { override: true }",
      "\u2699\uFE0F  suppress all logs with { quiet: true }",
      "\u2699\uFE0F  write to custom object with { processEnv: myObject }",
      "\u2699\uFE0F  load multiple .env files with { path: ['.env.local', '.env'] }"
    ];
    function _getRandomTip() {
      return TIPS[Math.floor(Math.random() * TIPS.length)];
    }
    function parseBoolean(value) {
      if (typeof value === "string") {
        return !["false", "0", "no", "off", ""].includes(value.toLowerCase());
      }
      return Boolean(value);
    }
    function supportsAnsi() {
      return process.stdout.isTTY;
    }
    function dim(text) {
      return supportsAnsi() ? `\x1B[2m${text}\x1B[0m` : text;
    }
    var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
    function parse2(src) {
      const obj = {};
      let lines = src.toString();
      lines = lines.replace(/\r\n?/mg, "\n");
      let match;
      while ((match = LINE.exec(lines)) != null) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, "\n");
          value = value.replace(/\\r/g, "\r");
        }
        obj[key] = value;
      }
      return obj;
    }
    function _parseVault(options) {
      options = options || {};
      const vaultPath = _vaultPath(options);
      options.path = vaultPath;
      const result = DotenvModule.configDotenv(options);
      if (!result.parsed) {
        const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
        err.code = "MISSING_DATA";
        throw err;
      }
      const keys = _dotenvKey(options).split(",");
      const length = keys.length;
      let decrypted;
      for (let i = 0; i < length; i++) {
        try {
          const key = keys[i].trim();
          const attrs = _instructions(result, key);
          decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
          break;
        } catch (error) {
          if (i + 1 >= length) {
            throw error;
          }
        }
      }
      return DotenvModule.parse(decrypted);
    }
    function _warn(message) {
      console.error(`[dotenv@${version2}][WARN] ${message}`);
    }
    function _debug(message) {
      console.log(`[dotenv@${version2}][DEBUG] ${message}`);
    }
    function _log(message) {
      console.log(`[dotenv@${version2}] ${message}`);
    }
    function _dotenvKey(options) {
      if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
        return options.DOTENV_KEY;
      }
      if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
        return process.env.DOTENV_KEY;
      }
      return "";
    }
    function _instructions(result, dotenvKey) {
      let uri;
      try {
        uri = new URL(dotenvKey);
      } catch (error) {
        if (error.code === "ERR_INVALID_URL") {
          const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        }
        throw error;
      }
      const key = uri.password;
      if (!key) {
        const err = new Error("INVALID_DOTENV_KEY: Missing key part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environment = uri.searchParams.get("environment");
      if (!environment) {
        const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
      const ciphertext = result.parsed[environmentKey];
      if (!ciphertext) {
        const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
        err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
        throw err;
      }
      return { ciphertext, key };
    }
    function _vaultPath(options) {
      let possibleVaultPath = null;
      if (options && options.path && options.path.length > 0) {
        if (Array.isArray(options.path)) {
          for (const filepath of options.path) {
            if (fs4.existsSync(filepath)) {
              possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
            }
          }
        } else {
          possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
        }
      } else {
        possibleVaultPath = path6.resolve(process.cwd(), ".env.vault");
      }
      if (fs4.existsSync(possibleVaultPath)) {
        return possibleVaultPath;
      }
      return null;
    }
    function _resolveHome(envPath) {
      return envPath[0] === "~" ? path6.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function _configVault(options) {
      const debug = parseBoolean(process.env.DOTENV_CONFIG_DEBUG || options && options.debug);
      const quiet = parseBoolean(process.env.DOTENV_CONFIG_QUIET || options && options.quiet);
      if (debug || !quiet) {
        _log("Loading env from encrypted .env.vault");
      }
      const parsed2 = DotenvModule._parseVault(options);
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsed2, options);
      return { parsed: parsed2 };
    }
    function configDotenv(options) {
      const dotenvPath = path6.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      let debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || options && options.debug);
      let quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || options && options.quiet);
      if (options && options.encoding) {
        encoding = options.encoding;
      } else {
        if (debug) {
          _debug("No encoding is specified. UTF-8 is used by default");
        }
      }
      let optionPaths = [dotenvPath];
      if (options && options.path) {
        if (!Array.isArray(options.path)) {
          optionPaths = [_resolveHome(options.path)];
        } else {
          optionPaths = [];
          for (const filepath of options.path) {
            optionPaths.push(_resolveHome(filepath));
          }
        }
      }
      let lastError;
      const parsedAll = {};
      for (const path7 of optionPaths) {
        try {
          const parsed2 = DotenvModule.parse(fs4.readFileSync(path7, { encoding }));
          DotenvModule.populate(parsedAll, parsed2, options);
        } catch (e) {
          if (debug) {
            _debug(`Failed to load ${path7} ${e.message}`);
          }
          lastError = e;
        }
      }
      const populated = DotenvModule.populate(processEnv, parsedAll, options);
      debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || debug);
      quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || quiet);
      if (debug || !quiet) {
        const keysCount = Object.keys(populated).length;
        const shortPaths = [];
        for (const filePath of optionPaths) {
          try {
            const relative2 = path6.relative(process.cwd(), filePath);
            shortPaths.push(relative2);
          } catch (e) {
            if (debug) {
              _debug(`Failed to load ${filePath} ${e.message}`);
            }
            lastError = e;
          }
        }
        _log(`injecting env (${keysCount}) from ${shortPaths.join(",")} ${dim(`-- tip: ${_getRandomTip()}`)}`);
      }
      if (lastError) {
        return { parsed: parsedAll, error: lastError };
      } else {
        return { parsed: parsedAll };
      }
    }
    function config(options) {
      if (_dotenvKey(options).length === 0) {
        return DotenvModule.configDotenv(options);
      }
      const vaultPath = _vaultPath(options);
      if (!vaultPath) {
        _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
        return DotenvModule.configDotenv(options);
      }
      return DotenvModule._configVault(options);
    }
    function decrypt(encrypted, keyStr) {
      const key = Buffer.from(keyStr.slice(-64), "hex");
      let ciphertext = Buffer.from(encrypted, "base64");
      const nonce = ciphertext.subarray(0, 12);
      const authTag = ciphertext.subarray(-16);
      ciphertext = ciphertext.subarray(12, -16);
      try {
        const aesgcm = crypto2.createDecipheriv("aes-256-gcm", key, nonce);
        aesgcm.setAuthTag(authTag);
        return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
      } catch (error) {
        const isRange = error instanceof RangeError;
        const invalidKeyLength = error.message === "Invalid key length";
        const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
        if (isRange || invalidKeyLength) {
          const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        } else if (decryptionFailed) {
          const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
          err.code = "DECRYPTION_FAILED";
          throw err;
        } else {
          throw error;
        }
      }
    }
    function populate(processEnv, parsed2, options = {}) {
      const debug = Boolean(options && options.debug);
      const override = Boolean(options && options.override);
      const populated = {};
      if (typeof parsed2 !== "object") {
        const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
        err.code = "OBJECT_REQUIRED";
        throw err;
      }
      for (const key of Object.keys(parsed2)) {
        if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
          if (override === true) {
            processEnv[key] = parsed2[key];
            populated[key] = parsed2[key];
          }
          if (debug) {
            if (override === true) {
              _debug(`"${key}" is already defined and WAS overwritten`);
            } else {
              _debug(`"${key}" is already defined and was NOT overwritten`);
            }
          }
        } else {
          processEnv[key] = parsed2[key];
          populated[key] = parsed2[key];
        }
      }
      return populated;
    }
    var DotenvModule = {
      configDotenv,
      _configVault,
      _parseVault,
      config,
      decrypt,
      parse: parse2,
      populate
    };
    module.exports.configDotenv = DotenvModule.configDotenv;
    module.exports._configVault = DotenvModule._configVault;
    module.exports._parseVault = DotenvModule._parseVault;
    module.exports.config = DotenvModule.config;
    module.exports.decrypt = DotenvModule.decrypt;
    module.exports.parse = DotenvModule.parse;
    module.exports.populate = DotenvModule.populate;
    module.exports = DotenvModule;
  }
});

// sparti-cms/db/sequelize.js
import { Sequelize } from "sequelize";
var import_dotenv, getConnectionString2, parseConnectionString, createSequelizeInstance, sequelizeInstance, getSequelize, sequelize_default;
var init_sequelize = __esm({
  "sparti-cms/db/sequelize.js"() {
    import_dotenv = __toESM(require_main(), 1);
    import_dotenv.default.config();
    getConnectionString2 = () => {
      return process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
    };
    parseConnectionString = (connectionString) => {
      try {
        const url = new URL(connectionString.replace("postgresql://", "http://"));
        return {
          host: url.hostname,
          port: parseInt(url.port) || 5432,
          database: url.pathname.slice(1),
          // Remove leading slash
          username: url.username,
          password: url.password
        };
      } catch (error) {
        console.error("[testing] Error parsing connection string:", error);
        throw error;
      }
    };
    createSequelizeInstance = () => {
      const connectionString = getConnectionString2();
      if (!connectionString) {
        console.error("[testing] WARNING: DATABASE_URL or DATABASE_PUBLIC_URL environment variable is required");
        console.error("[testing] Please create a .env file in the project root with:");
        console.error("[testing] DATABASE_PUBLIC_URL=postgresql://user:password@host:port/database");
        console.error("[testing] OR");
        console.error("[testing] DATABASE_URL=postgresql://user:password@host:port/database");
        throw new Error("DATABASE_URL or DATABASE_PUBLIC_URL environment variable is required. Please create a .env file in the project root.");
      }
      const config = parseConnectionString(connectionString);
      const isLocalhost = config.host === "localhost" || config.host === "127.0.0.1" || config.host === "::1" || connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
      const useSSL = !isLocalhost || process.env.DATABASE_SSL === "true";
      const sequelize2 = new Sequelize(config.database, config.username, config.password, {
        host: config.host,
        port: config.port,
        dialect: "postgres",
        dialectOptions: useSSL ? {
          ssl: {
            rejectUnauthorized: false
            // For Railway and other cloud providers
          }
        } : {},
        pool: {
          max: 20,
          min: 0,
          acquire: 3e4,
          idle: 1e4
        },
        logging: process.env.NODE_ENV === "development" ? console.log : false
      });
      return sequelize2;
    };
    sequelizeInstance = null;
    getSequelize = () => {
      if (!sequelizeInstance) {
        sequelizeInstance = createSequelizeInstance();
      }
      return sequelizeInstance;
    };
    sequelize_default = getSequelize();
  }
});

// sparti-cms/db/sequelize/models/Category.js
import { DataTypes } from "sequelize";
function Category(sequelize2) {
  const Category6 = sequelize2.define("Category", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "categories",
        key: "id"
      },
      onDelete: "SET NULL"
    },
    meta_title: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    meta_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    post_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: "categories",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true
  });
  Category6.associate = function(models2) {
    Category6.belongsTo(Category6, {
      as: "parent",
      foreignKey: "parent_id"
    });
    Category6.hasMany(Category6, {
      as: "children",
      foreignKey: "parent_id"
    });
    Category6.belongsToMany(models2.Post, {
      through: models2.PostCategory,
      foreignKey: "category_id",
      otherKey: "post_id",
      as: "posts"
    });
  };
  return Category6;
}
var init_Category = __esm({
  "sparti-cms/db/sequelize/models/Category.js"() {
  }
});

// sparti-cms/db/sequelize/models/Tag.js
import { DataTypes as DataTypes2 } from "sequelize";
function Tag(sequelize2) {
  const Tag6 = sequelize2.define("Tag", {
    id: {
      type: DataTypes2.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes2.STRING(200),
      allowNull: false
    },
    slug: {
      type: DataTypes2.STRING(200),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes2.TEXT,
      allowNull: true
    },
    meta_title: {
      type: DataTypes2.STRING(255),
      allowNull: true
    },
    meta_description: {
      type: DataTypes2.TEXT,
      allowNull: true
    },
    post_count: {
      type: DataTypes2.INTEGER,
      defaultValue: 0
    },
    created_at: {
      type: DataTypes2.DATE,
      defaultValue: DataTypes2.NOW
    },
    updated_at: {
      type: DataTypes2.DATE,
      defaultValue: DataTypes2.NOW
    }
  }, {
    tableName: "tags",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true
  });
  Tag6.associate = function(models2) {
    Tag6.belongsToMany(models2.Post, {
      through: models2.PostTag,
      foreignKey: "tag_id",
      otherKey: "post_id",
      as: "posts"
    });
  };
  return Tag6;
}
var init_Tag = __esm({
  "sparti-cms/db/sequelize/models/Tag.js"() {
  }
});

// sparti-cms/db/sequelize/models/Post.js
import { DataTypes as DataTypes3 } from "sequelize";
function Post(sequelize2) {
  const Post7 = sequelize2.define("Post", {
    id: {
      type: DataTypes3.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes3.STRING(255),
      allowNull: false
    },
    slug: {
      type: DataTypes3.STRING(255),
      allowNull: false,
      unique: true
    },
    content: {
      type: DataTypes3.TEXT,
      allowNull: true
    },
    excerpt: {
      type: DataTypes3.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes3.STRING(20),
      defaultValue: "draft"
    },
    post_type: {
      type: DataTypes3.STRING(50),
      defaultValue: "post"
    },
    author_id: {
      type: DataTypes3.INTEGER,
      allowNull: true
    },
    parent_id: {
      type: DataTypes3.INTEGER,
      allowNull: true,
      references: {
        model: "posts",
        key: "id"
      }
    },
    menu_order: {
      type: DataTypes3.INTEGER,
      defaultValue: 0
    },
    featured_image_id: {
      type: DataTypes3.INTEGER,
      allowNull: true
    },
    meta_title: {
      type: DataTypes3.STRING(255),
      allowNull: true
    },
    meta_description: {
      type: DataTypes3.TEXT,
      allowNull: true
    },
    meta_keywords: {
      type: DataTypes3.TEXT,
      allowNull: true
    },
    canonical_url: {
      type: DataTypes3.STRING(500),
      allowNull: true
    },
    robots_meta: {
      type: DataTypes3.STRING(100),
      defaultValue: "index,follow"
    },
    og_title: {
      type: DataTypes3.STRING(255),
      allowNull: true
    },
    og_description: {
      type: DataTypes3.TEXT,
      allowNull: true
    },
    og_image: {
      type: DataTypes3.STRING(500),
      allowNull: true
    },
    twitter_title: {
      type: DataTypes3.STRING(255),
      allowNull: true
    },
    twitter_description: {
      type: DataTypes3.TEXT,
      allowNull: true
    },
    twitter_image: {
      type: DataTypes3.STRING(500),
      allowNull: true
    },
    view_count: {
      type: DataTypes3.INTEGER,
      defaultValue: 0
    },
    last_viewed_at: {
      type: DataTypes3.DATE,
      allowNull: true
    },
    published_at: {
      type: DataTypes3.DATE,
      allowNull: true
    },
    tenant_id: {
      type: DataTypes3.STRING(255),
      allowNull: true
    },
    wordpress_id: {
      type: DataTypes3.INTEGER,
      allowNull: true,
      comment: "WordPress post ID for sync tracking"
    },
    wordpress_sync_enabled: {
      type: DataTypes3.BOOLEAN,
      defaultValue: false,
      comment: "Whether this post participates in WordPress sync"
    },
    wordpress_last_synced_at: {
      type: DataTypes3.DATE,
      allowNull: true,
      comment: "Timestamp of last successful sync with WordPress"
    },
    wordpress_sync_hash: {
      type: DataTypes3.STRING(64),
      allowNull: true,
      comment: "Hash of post content for change detection"
    },
    created_at: {
      type: DataTypes3.DATE,
      defaultValue: DataTypes3.NOW
    },
    updated_at: {
      type: DataTypes3.DATE,
      defaultValue: DataTypes3.NOW
    }
  }, {
    tableName: "posts",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true
  });
  Post7.associate = function(models2) {
    Post7.belongsToMany(models2.Category, {
      through: models2.PostCategory,
      foreignKey: "post_id",
      otherKey: "category_id",
      as: "categories"
    });
    Post7.belongsToMany(models2.Tag, {
      through: models2.PostTag,
      foreignKey: "post_id",
      otherKey: "tag_id",
      as: "tags"
    });
  };
  return Post7;
}
var init_Post = __esm({
  "sparti-cms/db/sequelize/models/Post.js"() {
  }
});

// sparti-cms/db/sequelize/models/PostCategory.js
import { DataTypes as DataTypes4 } from "sequelize";
function PostCategory(sequelize2) {
  const PostCategory4 = sequelize2.define("PostCategory", {
    post_id: {
      type: DataTypes4.INTEGER,
      primaryKey: true,
      references: {
        model: "posts",
        key: "id"
      },
      onDelete: "CASCADE"
    },
    category_id: {
      type: DataTypes4.INTEGER,
      primaryKey: true,
      references: {
        model: "categories",
        key: "id"
      },
      onDelete: "CASCADE"
    }
  }, {
    tableName: "post_categories",
    timestamps: false,
    underscored: true
  });
  return PostCategory4;
}
var init_PostCategory = __esm({
  "sparti-cms/db/sequelize/models/PostCategory.js"() {
  }
});

// sparti-cms/db/sequelize/models/PostTag.js
import { DataTypes as DataTypes5 } from "sequelize";
function PostTag(sequelize2) {
  const PostTag4 = sequelize2.define("PostTag", {
    post_id: {
      type: DataTypes5.INTEGER,
      primaryKey: true,
      references: {
        model: "posts",
        key: "id"
      },
      onDelete: "CASCADE"
    },
    tag_id: {
      type: DataTypes5.INTEGER,
      primaryKey: true,
      references: {
        model: "tags",
        key: "id"
      },
      onDelete: "CASCADE"
    }
  }, {
    tableName: "post_tags",
    timestamps: false,
    underscored: true
  });
  return PostTag4;
}
var init_PostTag = __esm({
  "sparti-cms/db/sequelize/models/PostTag.js"() {
  }
});

// sparti-cms/db/sequelize/models/SiteSchema.js
import { DataTypes as DataTypes6 } from "sequelize";
function SiteSchema(sequelize2) {
  const SiteSchema4 = sequelize2.define("SiteSchema", {
    id: {
      type: DataTypes6.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    schema_key: {
      type: DataTypes6.STRING(255),
      allowNull: false
    },
    schema_value: {
      type: DataTypes6.JSONB,
      allowNull: true
    },
    language: {
      type: DataTypes6.STRING(50),
      allowNull: false,
      defaultValue: "default"
    },
    tenant_id: {
      type: DataTypes6.STRING(255),
      allowNull: true
    },
    created_at: {
      type: DataTypes6.DATE,
      defaultValue: DataTypes6.NOW
    },
    updated_at: {
      type: DataTypes6.DATE,
      defaultValue: DataTypes6.NOW
    }
  }, {
    tableName: "site_schemas",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["schema_key", "tenant_id", "language"],
        name: "site_schemas_schema_key_tenant_id_language_unique"
      }
    ]
  });
  return SiteSchema4;
}
var init_SiteSchema = __esm({
  "sparti-cms/db/sequelize/models/SiteSchema.js"() {
  }
});

// sparti-cms/db/sequelize/models/SiteSetting.js
import { DataTypes as DataTypes7 } from "sequelize";
function SiteSetting(sequelize2) {
  const SiteSetting4 = sequelize2.define("SiteSetting", {
    id: {
      type: DataTypes7.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    setting_key: {
      type: DataTypes7.STRING(255),
      allowNull: false
    },
    setting_value: {
      type: DataTypes7.TEXT,
      allowNull: true
    },
    setting_type: {
      type: DataTypes7.STRING(50),
      defaultValue: "text"
    },
    setting_category: {
      type: DataTypes7.STRING(100),
      defaultValue: "general"
    },
    is_public: {
      type: DataTypes7.BOOLEAN,
      defaultValue: false
    },
    tenant_id: {
      type: DataTypes7.STRING(255),
      allowNull: true
    },
    theme_id: {
      type: DataTypes7.STRING(255),
      allowNull: true
    },
    created_at: {
      type: DataTypes7.DATE,
      defaultValue: DataTypes7.NOW
    },
    updated_at: {
      type: DataTypes7.DATE,
      defaultValue: DataTypes7.NOW
    }
  }, {
    tableName: "site_settings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["setting_key", "tenant_id", "theme_id"],
        name: "site_settings_setting_key_tenant_theme_unique"
      },
      {
        fields: ["tenant_id", "theme_id"],
        name: "idx_site_settings_tenant_theme"
      },
      {
        fields: ["theme_id"],
        name: "idx_site_settings_theme_id"
      }
    ]
  });
  return SiteSetting4;
}
var init_SiteSetting = __esm({
  "sparti-cms/db/sequelize/models/SiteSetting.js"() {
  }
});

// sparti-cms/db/sequelize/models/User.js
import { DataTypes as DataTypes8 } from "sequelize";
function User(sequelize2) {
  const User3 = sequelize2.define("User", {
    id: {
      type: DataTypes8.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    first_name: {
      type: DataTypes8.STRING(255),
      allowNull: true
    },
    last_name: {
      type: DataTypes8.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes8.STRING(255),
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes8.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes8.STRING(50),
      allowNull: true
    },
    status: {
      type: DataTypes8.STRING(20),
      defaultValue: "active"
    },
    is_active: {
      type: DataTypes8.BOOLEAN,
      defaultValue: true
    },
    tenant_id: {
      type: DataTypes8.STRING(255),
      allowNull: true
    },
    is_super_admin: {
      type: DataTypes8.BOOLEAN,
      defaultValue: false
    },
    created_at: {
      type: DataTypes8.DATE,
      defaultValue: DataTypes8.NOW
    },
    updated_at: {
      type: DataTypes8.DATE,
      defaultValue: DataTypes8.NOW
    }
  }, {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true
  });
  User3.associate = function(models2) {
  };
  return User3;
}
var init_User = __esm({
  "sparti-cms/db/sequelize/models/User.js"() {
  }
});

// sparti-cms/db/sequelize/models/Page.js
import { DataTypes as DataTypes9 } from "sequelize";
function PageFactory(sequelize2) {
  const Page3 = sequelize2.define("Page", {
    id: {
      type: DataTypes9.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    page_name: {
      type: DataTypes9.STRING(255),
      allowNull: false
    },
    slug: {
      type: DataTypes9.STRING(255),
      allowNull: false
    },
    meta_title: {
      type: DataTypes9.STRING(255),
      allowNull: true
    },
    meta_description: {
      type: DataTypes9.TEXT,
      allowNull: true
    },
    seo_index: {
      type: DataTypes9.BOOLEAN,
      defaultValue: true
    },
    status: {
      type: DataTypes9.STRING(50),
      defaultValue: "draft"
    },
    page_type: {
      type: DataTypes9.STRING(50),
      allowNull: false,
      defaultValue: "page"
    },
    tenant_id: {
      type: DataTypes9.STRING(255),
      allowNull: false,
      defaultValue: "tenant-gosg"
    },
    campaign_source: {
      type: DataTypes9.STRING(100),
      allowNull: true
    },
    conversion_goal: {
      type: DataTypes9.STRING(255),
      allowNull: true
    },
    legal_type: {
      type: DataTypes9.STRING(100),
      allowNull: true
    },
    last_reviewed_date: {
      type: DataTypes9.DATEONLY,
      allowNull: true
    },
    version: {
      type: DataTypes9.STRING(20),
      allowNull: true
    },
    created_at: {
      type: DataTypes9.DATE,
      defaultValue: DataTypes9.NOW
    },
    updated_at: {
      type: DataTypes9.DATE,
      defaultValue: DataTypes9.NOW
    }
  }, {
    tableName: "pages",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["slug", "tenant_id"],
        name: "unique_slug_per_tenant"
      },
      {
        fields: ["tenant_id"],
        name: "idx_pages_tenant_id"
      },
      {
        fields: ["page_type"],
        name: "idx_pages_page_type"
      },
      {
        fields: ["status"],
        name: "idx_pages_status"
      }
    ]
  });
  return Page3;
}
var init_Page = __esm({
  "sparti-cms/db/sequelize/models/Page.js"() {
  }
});

// sparti-cms/db/sequelize/models/index.js
var models_exports = {};
__export(models_exports, {
  default: () => models_default,
  sequelize: () => sequelize
});
var sequelize, Category2, Tag2, Post2, PostCategory2, PostTag2, SiteSchema2, SiteSetting2, User2, Page, models, models_default;
var init_models = __esm({
  "sparti-cms/db/sequelize/models/index.js"() {
    init_sequelize();
    init_Category();
    init_Tag();
    init_Post();
    init_PostCategory();
    init_PostTag();
    init_SiteSchema();
    init_SiteSetting();
    init_User();
    init_Page();
    sequelize = getSequelize();
    Category2 = Category(sequelize);
    Tag2 = Tag(sequelize);
    Post2 = Post(sequelize);
    PostCategory2 = PostCategory(sequelize);
    PostTag2 = PostTag(sequelize);
    SiteSchema2 = SiteSchema(sequelize);
    SiteSetting2 = SiteSetting(sequelize);
    User2 = User(sequelize);
    Page = PageFactory(sequelize);
    models = {
      Category: Category2,
      Tag: Tag2,
      Post: Post2,
      PostCategory: PostCategory2,
      PostTag: PostTag2,
      SiteSchema: SiteSchema2,
      SiteSetting: SiteSetting2,
      User: User2,
      Page
    };
    Object.keys(models).forEach((modelName) => {
      if (models[modelName].associate) {
        models[modelName].associate(models);
      }
    });
    models_default = models;
  }
});

// sparti-cms/db/modules/branding.js
import { Op as Op2, QueryTypes } from "sequelize";
async function getBrandingSettings(tenantId = "tenant-gosg", themeId = null) {
  try {
    debugLog(`getBrandingSettings called with tenantId: ${tenantId}, themeId: ${themeId}`);
    const whereClause = {
      [Op2.and]: [
        {
          setting_category: {
            [Op2.in]: ["branding", "seo", "localization", "theme"]
          }
        },
        {
          // For public API, we want public settings OR theme settings OR branding/localization settings
          // Branding and localization settings should be public by default
          [Op2.or]: [
            { is_public: true },
            { setting_category: "theme" },
            { setting_category: "branding" },
            { setting_category: "localization" }
          ]
        },
        {
          [Op2.or]: [
            { tenant_id: tenantId },
            { tenant_id: null }
          ]
        }
      ]
    };
    const orderClause = themeId ? [
      [sequelize.literal(`CASE WHEN tenant_id = '${tenantId}' THEN 0 ELSE 1 END`), "ASC"],
      [sequelize.literal(`CASE WHEN theme_id = '${themeId}' THEN 0 ELSE 1 END`), "ASC"],
      sequelize.literal("tenant_id DESC NULLS LAST"),
      sequelize.literal("theme_id DESC NULLS LAST"),
      ["setting_category", "ASC"],
      ["setting_key", "ASC"]
    ] : [
      [sequelize.literal(`CASE WHEN tenant_id = '${tenantId}' THEN 0 ELSE 1 END`), "ASC"],
      sequelize.literal("tenant_id DESC NULLS LAST"),
      ["setting_category", "ASC"],
      ["setting_key", "ASC"]
    ];
    const results = await SiteSetting3.findAll({
      where: whereClause,
      order: orderClause,
      attributes: ["setting_key", "setting_value", "setting_type", "setting_category", "is_public", "tenant_id", "theme_id"]
    });
    debugLog(`getBrandingSettings found ${results.length} settings for tenant ${tenantId}, theme ${themeId}`);
    if (results.length > 0) {
      debugLog(`Sample settings:`, results.slice(0, 3).map((r) => ({
        key: r.setting_key,
        category: r.setting_category,
        is_public: r.is_public,
        tenant_id: r.tenant_id,
        theme_id: r.theme_id
      })));
    }
    const settings = {
      branding: {},
      seo: {},
      localization: {},
      theme: {}
    };
    const seenKeys = /* @__PURE__ */ new Set();
    results.forEach((row) => {
      const category = row.setting_category || "branding";
      if (!settings[category]) settings[category] = {};
      const key = `${category}.${row.setting_key}`;
      const isTenantSpecific = row.tenant_id === tenantId;
      const isThemeSpecific = row.theme_id === themeId;
      if (!seenKeys.has(key) || isTenantSpecific && isThemeSpecific) {
        settings[category][row.setting_key] = row.setting_value;
        if (isTenantSpecific) {
          seenKeys.add(key);
        }
      }
    });
    debugLog(`getBrandingSettings returning:`, {
      brandingKeys: Object.keys(settings.branding),
      seoKeys: Object.keys(settings.seo),
      localizationKeys: Object.keys(settings.localization),
      themeKeys: Object.keys(settings.theme)
    });
    return settings;
  } catch (error) {
    console.error(`Error fetching branding settings for tenant ${tenantId}, theme ${themeId}:`, error);
    throw error;
  }
}
async function getPublicSEOSettings(tenantId = "tenant-gosg") {
  try {
    const results = await SiteSetting3.findAll({
      where: {
        is_public: true,
        [Op2.or]: [
          { setting_category: "seo" },
          { setting_key: { [Op2.in]: ["site_name", "site_tagline", "site_description", "site_logo", "site_favicon", "country", "timezone", "language", "theme_styles"] } }
        ],
        [Op2.or]: [
          { tenant_id: tenantId },
          { tenant_id: null }
        ]
      },
      order: [
        [sequelize.literal(`CASE WHEN tenant_id = '${tenantId}' THEN 0 ELSE 1 END`), "ASC"],
        ["setting_key", "ASC"]
      ],
      attributes: ["setting_key", "setting_value", "setting_type", "tenant_id"]
    });
    const settings = {};
    const seenKeys = /* @__PURE__ */ new Set();
    results.forEach((row) => {
      if (!seenKeys.has(row.setting_key) || row.tenant_id === tenantId) {
        settings[row.setting_key] = row.setting_value;
        if (row.tenant_id === tenantId) {
          seenKeys.add(row.setting_key);
        }
      }
    });
    return settings;
  } catch (sequelizeError) {
    debugError(`Sequelize query failed, trying raw SQL fallback:`, sequelizeError.message);
    try {
      const sqlQuery = `
        SELECT setting_key, setting_value, setting_type, tenant_id
        FROM site_settings
        WHERE is_public = true
          AND (
            setting_category = 'seo'
            OR setting_key IN ('site_name', 'site_tagline', 'site_description', 'site_logo', 'site_favicon', 'country', 'timezone', 'language', 'theme_styles')
          )
          AND (tenant_id = $1 OR tenant_id IS NULL)
        ORDER BY 
          CASE WHEN tenant_id = $1 THEN 0 ELSE 1 END ASC,
          setting_key ASC
      `;
      const result = await query(sqlQuery, [tenantId]);
      const settings = {};
      const seenKeys = /* @__PURE__ */ new Set();
      result.rows.forEach((row) => {
        if (!seenKeys.has(row.setting_key) || row.tenant_id === tenantId) {
          settings[row.setting_key] = row.setting_value;
          if (row.tenant_id === tenantId) {
            seenKeys.add(row.setting_key);
          }
        }
      });
      return settings;
    } catch (rawQueryError) {
      debugError(`Both Sequelize and raw SQL queries failed for tenant ${tenantId}:`, rawQueryError.message);
      return {};
    }
  }
}
async function updateBrandingSetting(key, value, tenantId = "tenant-gosg") {
  try {
    if (!tenantId) {
      throw new Error("Tenant ID is required to update branding settings. Master settings (tenant_id = NULL) should be updated via admin interface.");
    }
    const settingType = key.includes("logo") || key.includes("favicon") || key.includes("image") ? "media" : "text";
    const category = key.startsWith("site_") ? "branding" : "general";
    const existing = await SiteSetting3.findOne({
      where: {
        setting_key: key,
        tenant_id: tenantId,
        theme_id: null
      }
    });
    let result;
    if (existing) {
      await existing.update({
        setting_value: value,
        setting_type: settingType,
        setting_category: category
      });
      result = existing;
    } else {
      try {
        result = await SiteSetting3.create({
          setting_key: key,
          setting_value: value,
          setting_type: settingType,
          setting_category: category,
          tenant_id: tenantId,
          theme_id: null
        });
      } catch (insertError) {
        if (insertError.name === "SequelizeUniqueConstraintError" || insertError.code === "23505") {
          const retryExisting = await SiteSetting3.findOne({
            where: {
              setting_key: key,
              tenant_id: tenantId,
              theme_id: null
            }
          });
          if (retryExisting) {
            await retryExisting.update({
              setting_value: value,
              setting_type: settingType,
              setting_category: category
            });
            result = retryExisting;
          } else {
            throw insertError;
          }
        } else {
          throw insertError;
        }
      }
    }
    if (!result) {
      throw new Error("Failed to update branding setting. Ensure tenant_id is provided.");
    }
    return result.toJSON();
  } catch (error) {
    console.error(`Error updating branding setting for tenant ${tenantId}:`, error);
    throw error;
  }
}
function extractTranslatableTextFromSchema(obj, path6 = "", result = {}) {
  if (obj === null || obj === void 0) {
    return result;
  }
  const skipFields = ["id", "src", "link", "url", "image", "images", "avatar", "logo", "phoneNumber", "email", "date", "rating", "version", "sort_order", "sortOrder", "level", "required", "value", "type", "key"];
  if (typeof obj === "string") {
    if (obj.trim().length > 0 && !obj.startsWith("http") && !obj.startsWith("/") && !obj.match(/^[a-zA-Z0-9_-]+$/)) {
      result[path6] = obj;
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      extractTranslatableTextFromSchema(item, path6 ? `${path6}[${index}]` : `[${index}]`, result);
    });
  } else if (typeof obj === "object") {
    Object.keys(obj).forEach((key) => {
      if (skipFields.includes(key.toLowerCase())) {
        return;
      }
      const newPath = path6 ? `${path6}.${key}` : key;
      extractTranslatableTextFromSchema(obj[key], newPath, result);
    });
  }
  return result;
}
function injectTranslatedTextIntoSchema(obj, translations, path6 = "") {
  if (obj === null || obj === void 0) {
    return obj;
  }
  if (typeof obj === "string") {
    if (translations[path6] !== void 0) {
      return translations[path6];
    }
    return obj;
  } else if (Array.isArray(obj)) {
    return obj.map((item, index) => {
      const itemPath = path6 ? `${path6}[${index}]` : `[${index}]`;
      return injectTranslatedTextIntoSchema(item, translations, itemPath);
    });
  } else if (typeof obj === "object") {
    const result = {};
    Object.keys(obj).forEach((key) => {
      const newPath = path6 ? `${path6}.${key}` : key;
      result[key] = injectTranslatedTextIntoSchema(obj[key], translations, newPath);
    });
    return result;
  }
  return obj;
}
async function getConfiguredLanguages(tenantId) {
  const languagesResult = await SiteSetting3.findOne({
    where: {
      setting_key: "site_content_languages",
      tenant_id: tenantId
    },
    attributes: ["setting_value"]
  });
  if (!languagesResult || !languagesResult.setting_value) {
    return [];
  }
  const rawValue = languagesResult.setting_value;
  if (rawValue.includes(",")) {
    return rawValue.split(",").filter((lang) => lang.trim() !== "");
  } else if (rawValue.trim() !== "") {
    return [rawValue.trim()];
  }
  return [];
}
async function getDefaultLanguage(tenantId) {
  const defaultLanguageResult = await SiteSetting3.findOne({
    where: {
      setting_key: "site_language",
      tenant_id: tenantId
    },
    attributes: ["setting_value"]
  });
  return defaultLanguageResult && defaultLanguageResult.setting_value ? defaultLanguageResult.setting_value : "default";
}
async function getTargetLanguages(tenantId) {
  const allLanguages = await getConfiguredLanguages(tenantId);
  if (allLanguages.length === 0) {
    return [];
  }
  const defaultLanguage = await getDefaultLanguage(tenantId);
  return allLanguages.filter((lang) => lang !== defaultLanguage && lang !== "default");
}
async function ensureSiteSchemaLanguageColumn() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable("site_schemas");
    if (!tableDescription.language) {
      await queryInterface.addColumn("site_schemas", "language", {
        type: sequelize.Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "default"
      });
    }
  } catch (error) {
    if (error.code !== "42701" && !error.message.includes("already exists")) {
      debugLog("Note: Could not ensure language column exists:", error.message);
    }
  }
}
async function ensureSiteSchemaUniqueConstraint() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const constraints = await queryInterface.showConstraint("site_schemas", "site_schemas_schema_key_tenant_id_language_unique").catch(() => null);
    if (!constraints) {
      const allConstraints = await queryInterface.showConstraints("site_schemas");
      const oldConstraints = allConstraints.filter(
        (c) => c.constraintType === "UNIQUE" && c.constraintName.includes("schema_key") && c.constraintName.includes("tenant_id") && !c.constraintName.includes("language")
      );
      for (const constraint of oldConstraints) {
        await queryInterface.removeConstraint("site_schemas", constraint.constraintName).catch(() => {
        });
      }
      await queryInterface.addConstraint("site_schemas", {
        fields: ["schema_key", "tenant_id", "language"],
        type: "unique",
        name: "site_schemas_schema_key_tenant_id_language_unique"
      });
      debugLog("Added composite unique constraint for site_schemas");
    }
  } catch (error) {
    debugLog("Note: Could not ensure composite unique constraint exists:", error.message);
  }
}
async function translateSchemaTextFields(textMap, targetLanguage, defaultLanguage) {
  const translations = {};
  const textPaths = Object.keys(textMap);
  for (const textPath of textPaths) {
    const originalText = textMap[textPath];
    try {
      const translatedText = await translateText(originalText, targetLanguage, defaultLanguage);
      translations[textPath] = translatedText;
      debugLog(`Translated schema text ${textPath}: "${originalText.substring(0, 50)}..." -> "${translatedText.substring(0, 50)}..."`);
    } catch (error) {
      debugError(`Error translating schema text at path ${textPath}:`, error);
      translations[textPath] = originalText;
    }
  }
  return translations;
}
async function translateSchemaToLanguage(schemaKey, schemaValue, targetLanguage, defaultLanguage, tenantId, textMap) {
  try {
    debugLog(`Translating schema ${schemaKey} to ${targetLanguage}...`);
    const translations = await translateSchemaTextFields(textMap, targetLanguage, defaultLanguage);
    const translatedSchema = injectTranslatedTextIntoSchema(schemaValue, translations);
    await upsertSiteSchema(schemaKey, translatedSchema, targetLanguage, tenantId);
    debugLog(`Successfully translated and saved schema ${schemaKey} for language ${targetLanguage}`);
  } catch (error) {
    debugError(`Error translating schema ${schemaKey} to ${targetLanguage}:`, error);
    throw error;
  }
}
async function translateSchemaToAllLanguages(schemaKey, schemaValue, tenantId) {
  try {
    debugLog(`Starting translation for schema ${schemaKey} and tenant ${tenantId}`);
    const targetLanguages = await getTargetLanguages(tenantId);
    if (targetLanguages.length === 0) {
      debugLog(`No target languages to translate to, skipping translation`);
      return;
    }
    debugLog(`Translating to ${targetLanguages.length} languages: ${targetLanguages.join(", ")}`);
    const textMap = extractTranslatableTextFromSchema(schemaValue);
    const textPaths = Object.keys(textMap);
    if (textPaths.length === 0) {
      console.log(`[testing] No translatable text found in schema, skipping translation`);
      return;
    }
    console.log(`[testing] Found ${textPaths.length} translatable text fields`);
    const defaultLanguage = await getDefaultLanguage(tenantId);
    for (const targetLanguage of targetLanguages) {
      try {
        await translateSchemaToLanguage(schemaKey, schemaValue, targetLanguage, defaultLanguage, tenantId, textMap);
      } catch (error) {
        console.error(`[testing] Failed to translate schema ${schemaKey} to ${targetLanguage}, continuing with other languages`);
      }
    }
    console.log(`[testing] Completed translation process for schema ${schemaKey}`);
  } catch (error) {
    console.error(`[testing] Error in translateSchemaToAllLanguages:`, error);
  }
}
async function upsertSiteSchema(schemaKey, schemaValue, language, tenantId) {
  let operationSuccessful = false;
  try {
    const [schema, created] = await SiteSchema3.findOrCreate({
      where: {
        schema_key: schemaKey,
        tenant_id: tenantId,
        language
      },
      defaults: {
        schema_key: schemaKey,
        schema_value: schemaValue,
        language,
        tenant_id: tenantId
      }
    });
    if (!created) {
      await schema.update({
        schema_value: schemaValue
      });
    }
    operationSuccessful = true;
  } catch (error) {
    console.error(`[testing] Error upserting schema ${schemaKey}:`, error);
    throw error;
  }
  if (operationSuccessful && language === "default" && tenantId) {
    translateSchemaToAllLanguages(schemaKey, schemaValue, tenantId).catch((error) => {
      console.error(`[testing] Error in background translation for schema ${schemaKey}:`, error);
    });
  }
}
async function getSiteSchema(schemaKey, tenantId, language = "default") {
  try {
    await ensureSiteSchemaLanguageColumn();
    const siteSchema = await SiteSchema3.findOne({
      where: {
        schema_key: schemaKey,
        tenant_id: tenantId,
        [Op2.or]: [
          { language },
          { language: "default" }
        ]
      },
      order: [
        // Prefer the specified language over 'default'
        [sequelize.literal(`CASE WHEN language = '${language}' THEN 0 ELSE 1 END`), "ASC"]
      ]
    });
    if (!siteSchema) {
      return null;
    }
    const schemaValue = siteSchema.schema_value;
    return typeof schemaValue === "string" ? JSON.parse(schemaValue) : schemaValue;
  } catch (error) {
    console.error("Error fetching site schema:", error);
    throw error;
  }
}
async function updateSiteSchema(schemaKey, schemaValue, tenantId, language = "default") {
  try {
    await ensureSiteSchemaLanguageColumn();
    await ensureSiteSchemaUniqueConstraint();
    await upsertSiteSchema(schemaKey, schemaValue, language, tenantId);
    return true;
  } catch (error) {
    console.error("Error updating site schema:", error);
    throw error;
  }
}
async function updateMultipleBrandingSettings(settings, tenantId = "tenant-gosg", themeId = null) {
  if (!tenantId) {
    throw new Error("Tenant ID is required to update settings. Master settings (tenant_id = NULL) should be updated via admin interface.");
  }
  const transaction = await sequelize.transaction();
  const errors = [];
  let transactionAborted = false;
  let firstError = null;
  try {
    for (const [key, value] of Object.entries(settings)) {
      if (value === null || value === void 0) {
        continue;
      }
      if (transactionAborted) {
        errors.push({ key, error: "Transaction aborted" });
        continue;
      }
      try {
        const settingType = key.includes("logo") || key.includes("favicon") || key.includes("image") ? "media" : key.includes("description") ? "textarea" : "text";
        const category = key.startsWith("site_") ? "branding" : ["country", "timezone", "language"].includes(key) ? "localization" : key === "theme_styles" ? "theme" : "general";
        const isPublic = category === "seo" || category === "branding" || category === "localization";
        const settingValue = typeof value === "object" ? JSON.stringify(value) : String(value);
        const normalizedThemeId = themeId || null;
        let setting = await SiteSetting3.findOne({
          where: {
            setting_key: key,
            tenant_id: tenantId
            // Don't filter by theme_id initially - we'll update it if needed
          },
          transaction
        });
        if (setting) {
          await setting.update({
            setting_value: settingValue,
            setting_type: settingType,
            setting_category: category,
            is_public: isPublic,
            theme_id: normalizedThemeId
            // Update theme_id to match what we want
          }, { transaction });
        } else {
          try {
            setting = await SiteSetting3.create({
              setting_key: key,
              setting_value: settingValue,
              setting_type: settingType,
              setting_category: category,
              is_public: isPublic,
              tenant_id: tenantId,
              theme_id: normalizedThemeId
            }, { transaction });
          } catch (createError) {
            if (createError.name === "SequelizeUniqueConstraintError" || createError.code === "23505" || createError.parent?.code === "23505") {
              let found;
              try {
                found = await sequelize.query(`
                  SELECT * FROM site_settings 
                  WHERE setting_key = :key 
                    AND tenant_id = :tenantId
                  LIMIT 1
                `, {
                  replacements: { key, tenantId },
                  type: QueryTypes.SELECT,
                  transaction
                });
              } catch (queryError) {
                console.error(`[testing] Error in raw query to find existing setting:`, queryError);
                throw createError;
              }
              if (found && found.length > 0) {
                setting = await SiteSetting3.findByPk(found[0].id, { transaction });
                if (setting) {
                  await setting.update({
                    setting_value: settingValue,
                    setting_type: settingType,
                    setting_category: category,
                    is_public: isPublic,
                    theme_id: normalizedThemeId
                  }, { transaction });
                } else {
                  throw createError;
                }
              } else {
                console.error(`[testing] Unique constraint violation for ${key} but record not found. Tenant: ${tenantId}, Theme: ${normalizedThemeId}`);
                throw createError;
              }
            } else {
              throw createError;
            }
          }
        }
      } catch (settingError) {
        if (settingError.parent && settingError.parent.code === "25P02") {
          transactionAborted = true;
          const abortError = firstError ? `Transaction aborted due to previous error in ${firstError.key}: ${firstError.error}` : "Transaction aborted due to an error";
          errors.push({ key, error: abortError });
          console.error(`[testing] Transaction aborted while processing ${key}. First error was:`, firstError);
          break;
        }
        if (!firstError) {
          firstError = {
            key,
            error: settingError.message || settingError.toString(),
            code: settingError.code || settingError.parent?.code,
            detail: settingError.detail || settingError.parent?.detail,
            constraint: settingError.constraint
          };
        }
        console.error(`[testing] Error updating setting ${key}:`, {
          name: settingError.name,
          message: settingError.message,
          code: settingError.code,
          parentCode: settingError.parent?.code,
          parentMessage: settingError.parent?.message,
          constraint: settingError.constraint,
          detail: settingError.detail,
          stack: settingError.stack
        });
        errors.push({
          key,
          error: settingError.message || settingError.toString(),
          code: settingError.code || settingError.parent?.code,
          detail: settingError.detail || settingError.parent?.detail,
          constraint: settingError.constraint
        });
      }
    }
    if (transactionAborted || errors.length > 0) {
      await transaction.rollback();
      let errorMessage;
      if (transactionAborted) {
        if (firstError) {
          errorMessage = `Transaction was aborted due to an error in ${firstError.key}: ${firstError.error}${firstError.detail ? ` (${firstError.detail})` : ""}${firstError.constraint ? ` [Constraint: ${firstError.constraint}]` : ""}`;
        } else {
          errorMessage = "Transaction was aborted due to an error";
        }
      } else {
        errorMessage = `Failed to update ${errors.length} setting(s): ${errors.map((e) => `${e.key} (${e.code || e.error}${e.detail ? ` - ${e.detail}` : ""})`).join(", ")}`;
      }
      throw new Error(errorMessage);
    }
    await transaction.commit();
    return true;
  } catch (error) {
    if (!transaction.finished && !transactionAborted) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error(`[testing] Error during rollback:`, rollbackError);
      }
    }
    console.error(`[testing] Error updating multiple branding settings for tenant ${tenantId}, theme ${themeId}:`, error);
    console.error(`[testing] Error name: ${error.name}, message: ${error.message}`);
    if (error.parent) {
      console.error(`[testing] Parent error: ${error.parent.message}`);
      console.error(`[testing] Parent error code: ${error.parent.code}`);
      if (error.parent.sql) {
        console.error(`[testing] SQL: ${error.parent.sql}`);
      }
    }
    throw error;
  }
}
async function getsitesettingsbytenant(tenantId) {
  try {
    const results = await SiteSetting3.findAll({
      where: {
        [Op2.or]: [
          { tenant_id: tenantId },
          { tenant_id: null }
        ]
      },
      order: [
        [sequelize.literal(`CASE WHEN tenant_id = '${tenantId}' THEN 0 ELSE 1 END`), "ASC"],
        ["setting_category", "ASC"],
        ["setting_key", "ASC"]
      ]
    });
    return results.map((row) => row.toJSON());
  } catch (error) {
    console.error("Error fetching site settings by tenant:", error);
    throw error;
  }
}
async function getThemeStyles(tenantId = "tenant-gosg", themeId = null) {
  try {
    const setting = await getSiteSettingByKey("theme_styles", tenantId, themeId);
    if (setting && setting.setting_value) {
      try {
        return typeof setting.setting_value === "string" ? JSON.parse(setting.setting_value) : setting.setting_value;
      } catch (e) {
        console.error(`Error parsing theme styles for tenant ${tenantId}, theme ${themeId}:`, e);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error(`Error fetching theme styles for tenant ${tenantId}, theme ${themeId}:`, error);
    throw error;
  }
}
async function getThemeSettings(tenantId = "tenant-gosg", themeId = null) {
  try {
    const whereClause = {
      [Op2.and]: [
        {
          [Op2.or]: [
            { tenant_id: tenantId },
            { tenant_id: null }
          ]
        }
      ]
    };
    let orderClause;
    if (themeId) {
      whereClause[Op2.and].push({
        [Op2.or]: [
          { theme_id: themeId },
          { theme_id: null }
        ]
      });
      orderClause = [
        [sequelize.literal(`CASE WHEN tenant_id = '${tenantId}' THEN 0 ELSE 1 END`), "ASC"],
        [sequelize.literal(`CASE WHEN theme_id = '${themeId}' THEN 0 ELSE 1 END`), "ASC"],
        sequelize.literal("tenant_id DESC NULLS LAST"),
        sequelize.literal("theme_id DESC NULLS LAST"),
        ["setting_category", "ASC"],
        ["setting_key", "ASC"]
      ];
    } else {
      whereClause[Op2.and].push({
        theme_id: null
      });
      orderClause = [
        [sequelize.literal(`CASE WHEN tenant_id = '${tenantId}' THEN 0 ELSE 1 END`), "ASC"],
        sequelize.literal("tenant_id DESC NULLS LAST"),
        ["setting_category", "ASC"],
        ["setting_key", "ASC"]
      ];
    }
    const results = await SiteSetting3.findAll({
      where: whereClause,
      order: orderClause,
      attributes: ["setting_key", "setting_value", "setting_type", "setting_category", "is_public", "tenant_id", "theme_id"]
    });
    const settings = {};
    const seenKeys = /* @__PURE__ */ new Set();
    results.forEach((row) => {
      const category = row.setting_category || "general";
      if (!settings[category]) settings[category] = {};
      const key = `${category}.${row.setting_key}`;
      const isTenantSpecific = row.tenant_id === tenantId;
      const isThemeSpecific = row.theme_id === themeId;
      if (!seenKeys.has(key) || isTenantSpecific && isThemeSpecific) {
        settings[category][row.setting_key] = row.setting_value;
        if (isTenantSpecific) {
          seenKeys.add(key);
        }
      }
    });
    return settings;
  } catch (error) {
    console.error(`Error fetching theme settings for tenant ${tenantId}, theme ${themeId}:`, error);
    throw error;
  }
}
async function getSiteSettingByKey(key, tenantId = "tenant-gosg", themeId = null) {
  try {
    const whereClause = {
      [Op2.and]: [
        {
          setting_key: key
        },
        {
          [Op2.or]: [
            { tenant_id: tenantId },
            { tenant_id: null }
          ]
        }
      ]
    };
    let orderClause;
    if (themeId) {
      whereClause[Op2.and].push({
        [Op2.or]: [
          { theme_id: themeId },
          { theme_id: null }
        ]
      });
      orderClause = [
        [sequelize.literal(`CASE WHEN tenant_id = '${tenantId}' THEN 0 ELSE 1 END`), "ASC"],
        [sequelize.literal(`CASE WHEN theme_id = '${themeId}' THEN 0 ELSE 1 END`), "ASC"],
        sequelize.literal("tenant_id DESC NULLS LAST"),
        sequelize.literal("theme_id DESC NULLS LAST")
      ];
    } else {
      whereClause[Op2.and].push({
        theme_id: null
      });
      orderClause = [
        [sequelize.literal(`CASE WHEN tenant_id = '${tenantId}' THEN 0 ELSE 1 END`), "ASC"],
        sequelize.literal("tenant_id DESC NULLS LAST")
      ];
    }
    const result = await SiteSetting3.findOne({
      where: whereClause,
      order: orderClause,
      attributes: ["setting_key", "setting_value", "setting_type", "setting_category", "is_public", "tenant_id", "theme_id"]
    });
    return result ? result.toJSON() : null;
  } catch (error) {
    console.error(`Error fetching site setting for key ${key}, tenant ${tenantId}, theme ${themeId}:`, error);
    throw error;
  }
}
async function updateSiteSettingByKey(key, value, type = "text", category = "general", tenantId = "tenant-gosg", themeId = null) {
  try {
    if (!tenantId) {
      throw new Error("Tenant ID is required to update settings. Master settings (tenant_id = NULL) should be updated via admin interface.");
    }
    const isPublic = category === "seo" || category === "branding";
    const existing = await SiteSetting3.findOne({
      where: {
        setting_key: key,
        tenant_id: tenantId,
        theme_id: themeId || null
      }
    });
    let setting;
    if (existing) {
      if (!existing.tenant_id) {
        throw new Error("Cannot update master setting. Master settings (tenant_id = NULL) are shared across all tenants.");
      }
      await existing.update({
        setting_value: value,
        setting_type: type,
        setting_category: category,
        is_public: isPublic,
        theme_id: themeId || null
      });
      setting = existing;
    } else {
      try {
        setting = await SiteSetting3.create({
          setting_key: key,
          setting_value: value,
          setting_type: type,
          setting_category: category,
          is_public: isPublic,
          tenant_id: tenantId,
          theme_id: themeId || null
        });
      } catch (createError) {
        if (createError.name === "SequelizeUniqueConstraintError" || createError.code === "23505") {
          const retryExisting = await SiteSetting3.findOne({
            where: {
              setting_key: key,
              tenant_id: tenantId,
              theme_id: themeId || null
            }
          });
          if (retryExisting) {
            await retryExisting.update({
              setting_value: value,
              setting_type: type,
              setting_category: category,
              is_public: isPublic,
              theme_id: themeId || null
            });
            setting = retryExisting;
          } else {
            throw createError;
          }
        } else {
          throw createError;
        }
      }
    }
    return setting.toJSON();
  } catch (error) {
    console.error(`Error updating site setting for key ${key}, tenant ${tenantId}, theme ${themeId}:`, error);
    throw error;
  }
}
async function updateSEOSettings(seoData) {
  const transaction = await sequelize.transaction();
  try {
    const seoSettings = {
      meta_title: seoData.meta_title,
      meta_description: seoData.meta_description,
      meta_keywords: seoData.meta_keywords,
      meta_author: seoData.meta_author,
      og_title: seoData.og_title,
      og_description: seoData.og_description,
      og_image: seoData.og_image,
      og_type: seoData.og_type,
      twitter_card: seoData.twitter_card,
      twitter_site: seoData.twitter_site,
      twitter_image: seoData.twitter_image
    };
    for (const [key, value] of Object.entries(seoSettings)) {
      if (value !== void 0) {
        const settingType = key.includes("image") ? "media" : key.includes("description") ? "textarea" : "text";
        const existing = await SiteSetting3.findOne({
          where: {
            setting_key: key,
            tenant_id: null,
            theme_id: null
          },
          transaction
        });
        if (existing) {
          await existing.update({
            setting_value: value,
            setting_type: settingType
          }, { transaction });
        } else {
          try {
            await SiteSetting3.create({
              setting_key: key,
              setting_value: value,
              setting_type: settingType,
              setting_category: "seo",
              is_public: true,
              tenant_id: null,
              theme_id: null
            }, { transaction });
          } catch (createError) {
            if (createError.name === "SequelizeUniqueConstraintError" || createError.code === "23505") {
              const retryExisting = await SiteSetting3.findOne({
                where: {
                  setting_key: key,
                  tenant_id: null,
                  theme_id: null
                },
                transaction
              });
              if (retryExisting) {
                await retryExisting.update({
                  setting_value: value,
                  setting_type: settingType
                }, { transaction });
              } else {
                throw createError;
              }
            } else {
              throw createError;
            }
          }
        }
      }
    }
    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating SEO settings:", error);
    throw error;
  }
}
async function migrateLogoToDatabase(logoPath, altText = "Site Logo") {
  try {
    const { createMediaItem } = await import("../media-management.js").catch(() => ({}));
    if (!createMediaItem) {
      throw new Error("createMediaItem function not found");
    }
    const logoMediaData = {
      filename: "site-logo.png",
      original_filename: "go-sg-logo-official.png",
      alt_text: altText,
      title: "Site Logo",
      description: "Main site logo",
      url: logoPath,
      relative_path: logoPath,
      mime_type: "image/png",
      file_extension: "png",
      file_size: 5e4,
      // Estimated size
      media_type: "image",
      folder_id: null,
      // Will be assigned to logos folder
      is_featured: true,
      seo_optimized: true
    };
    const logoMedia = await createMediaItem(logoMediaData);
    await updateBrandingSetting("site_logo", logoMedia.id.toString());
    console.log("Logo migrated to database:", logoMedia.id);
    return logoMedia;
  } catch (error) {
    console.error("Error migrating logo to database:", error);
    throw error;
  }
}
async function migrateFaviconToDatabase(faviconPath) {
  try {
    const { createMediaItem } = await import("../media-management.js").catch(() => ({}));
    if (!createMediaItem) {
      throw new Error("createMediaItem function not found");
    }
    const faviconMediaData = {
      filename: "favicon.png",
      original_filename: "favicon.png",
      alt_text: "Site Favicon",
      title: "Site Favicon",
      description: "Site favicon icon",
      url: faviconPath,
      relative_path: faviconPath,
      mime_type: "image/png",
      file_extension: "png",
      file_size: 5e3,
      // Estimated size
      width: 32,
      height: 32,
      media_type: "image",
      folder_id: null,
      is_featured: true,
      seo_optimized: true
    };
    const faviconMedia = await createMediaItem(faviconMediaData);
    await updateBrandingSetting("site_favicon", faviconMedia.id.toString());
    console.log("Favicon migrated to database:", faviconMedia.id);
    return faviconMedia;
  } catch (error) {
    console.error("Error migrating favicon to database:", error);
    throw error;
  }
}
async function getCustomCodeSettings(tenantId = "tenant-gosg") {
  try {
    console.log(`[testing] getCustomCodeSettings called with tenantId: ${tenantId}`);
    const results = await SiteSetting3.findAll({
      where: {
        setting_category: "custom_code",
        [Op2.or]: [
          { tenant_id: tenantId },
          { tenant_id: null }
        ]
      },
      order: [
        [sequelize.literal(`CASE WHEN tenant_id = '${tenantId}' THEN 0 ELSE 1 END`), "ASC"],
        ["setting_key", "ASC"]
      ],
      attributes: ["setting_key", "setting_value", "setting_type", "tenant_id"]
    });
    const settings = {
      head: "",
      body: "",
      gtmId: "",
      gaId: "",
      gscVerification: ""
    };
    const seenKeys = /* @__PURE__ */ new Set();
    results.forEach((row) => {
      const key = row.setting_key;
      const isTenantSpecific = row.tenant_id === tenantId;
      if (key === "custom_code_head" && (!seenKeys.has("head") || isTenantSpecific)) {
        settings.head = row.setting_value || "";
        if (isTenantSpecific) seenKeys.add("head");
      } else if (key === "custom_code_body" && (!seenKeys.has("body") || isTenantSpecific)) {
        settings.body = row.setting_value || "";
        if (isTenantSpecific) seenKeys.add("body");
      } else if (key === "custom_code_gtm_id" && (!seenKeys.has("gtmId") || isTenantSpecific)) {
        settings.gtmId = row.setting_value || "";
        if (isTenantSpecific) seenKeys.add("gtmId");
      } else if (key === "custom_code_ga_id" && (!seenKeys.has("gaId") || isTenantSpecific)) {
        settings.gaId = row.setting_value || "";
        if (isTenantSpecific) seenKeys.add("gaId");
      } else if (key === "custom_code_gsc_verification" && (!seenKeys.has("gscVerification") || isTenantSpecific)) {
        settings.gscVerification = row.setting_value || "";
        if (isTenantSpecific) seenKeys.add("gscVerification");
      }
    });
    console.log(`[testing] getCustomCodeSettings returning settings for tenant ${tenantId}`);
    return settings;
  } catch (error) {
    console.error(`Error fetching custom code settings for tenant ${tenantId}:`, error);
    throw error;
  }
}
async function updateCustomCodeSettings(settings, tenantId = "tenant-gosg") {
  if (!tenantId) {
    throw new Error("Tenant ID is required to update custom code settings");
  }
  const transaction = await sequelize.transaction();
  const errors = [];
  let transactionAborted = false;
  try {
    const settingsMap = {
      head: { key: "custom_code_head", type: "textarea" },
      body: { key: "custom_code_body", type: "textarea" },
      gtmId: { key: "custom_code_gtm_id", type: "text" },
      gaId: { key: "custom_code_ga_id", type: "text" },
      gscVerification: { key: "custom_code_gsc_verification", type: "text" }
    };
    for (const [field, value] of Object.entries(settings)) {
      if (!settingsMap[field]) {
        continue;
      }
      if (transactionAborted) {
        errors.push({ key: field, error: "Transaction aborted" });
        continue;
      }
      try {
        const { key: settingKey, type: settingType } = settingsMap[field];
        const settingValue = value !== null && value !== void 0 ? String(value) : "";
        let setting = await SiteSetting3.findOne({
          where: {
            setting_key: settingKey,
            tenant_id: tenantId,
            theme_id: null
          },
          transaction
        });
        if (setting) {
          await setting.update({
            setting_value: settingValue,
            setting_type: settingType,
            setting_category: "custom_code",
            is_public: false
          }, { transaction });
        } else {
          try {
            setting = await SiteSetting3.create({
              setting_key: settingKey,
              setting_value: settingValue,
              setting_type: settingType,
              setting_category: "custom_code",
              is_public: false,
              tenant_id: tenantId,
              theme_id: null
            }, { transaction });
          } catch (createError) {
            if (createError.name === "SequelizeUniqueConstraintError" || createError.code === "23505" || createError.parent?.code === "23505") {
              const found = await sequelize.query(`
                SELECT * FROM site_settings 
                WHERE setting_key = :key 
                  AND COALESCE(tenant_id, '') = COALESCE(:tenantId, '')
                  AND COALESCE(theme_id, '') = ''
                LIMIT 1
              `, {
                replacements: { key: settingKey, tenantId },
                type: QueryTypes.SELECT,
                transaction
              });
              if (found && found.length > 0) {
                setting = await SiteSetting3.findByPk(found[0].id, { transaction });
                if (setting) {
                  await setting.update({
                    setting_value: settingValue,
                    setting_type: settingType,
                    setting_category: "custom_code",
                    is_public: false
                  }, { transaction });
                } else {
                  throw createError;
                }
              } else {
                throw createError;
              }
            } else {
              throw createError;
            }
          }
        }
      } catch (settingError) {
        if (settingError.parent && settingError.parent.code === "25P02") {
          transactionAborted = true;
          errors.push({ key: field, error: "Transaction aborted" });
          console.error(`[testing] Transaction aborted while processing ${field}`);
          break;
        }
        console.error(`[testing] Error updating custom code setting ${field}:`, {
          name: settingError.name,
          message: settingError.message,
          code: settingError.code
        });
        errors.push({
          key: field,
          error: settingError.message || settingError.toString()
        });
      }
    }
    if (transactionAborted || errors.length > 0) {
      await transaction.rollback();
      const errorMessage = transactionAborted ? "Transaction was aborted due to an error" : `Failed to update ${errors.length} custom code setting(s): ${errors.map((e) => `${e.key} (${e.error})`).join(", ")}`;
      throw new Error(errorMessage);
    }
    await transaction.commit();
    return true;
  } catch (error) {
    if (!transaction.finished && !transactionAborted) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error(`[testing] Error during rollback:`, rollbackError);
      }
    }
    console.error(`[testing] Error updating custom code settings for tenant ${tenantId}:`, error);
    throw error;
  }
}
var SiteSchema3, SiteSetting3;
var init_branding = __esm({
  "sparti-cms/db/modules/branding.js"() {
    init_googleTranslationService();
    init_models();
    init_connection();
    init_debugLogger();
    ({ SiteSchema: SiteSchema3, SiteSetting: SiteSetting3 } = models_default);
  }
});

// sparti-cms/db/modules/forms.js
var forms_exports = {};
__export(forms_exports, {
  getEmailSettingsByFormId: () => getEmailSettingsByFormId,
  getFormById: () => getFormById,
  getFormSubmissions: () => getFormSubmissions,
  saveFormSubmission: () => saveFormSubmission,
  saveFormSubmissionExtended: () => saveFormSubmissionExtended
});
async function getFormById(formId, tenantId = null) {
  try {
    const isNumeric = !isNaN(parseInt(formId));
    let result;
    if (isNumeric) {
      if (tenantId) {
        result = await query(
          "SELECT * FROM forms WHERE (id = $1 OR name = $2) AND LOWER(TRIM(tenant_id)) = LOWER(TRIM($3::text))",
          [parseInt(formId), String(formId), String(tenantId)]
        );
      } else {
        result = await query(
          "SELECT * FROM forms WHERE id = $1 OR name = $2",
          [parseInt(formId), String(formId)]
        );
      }
    } else {
      if (tenantId) {
        result = await query(
          "SELECT * FROM forms WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) AND LOWER(TRIM(tenant_id)) = LOWER(TRIM($2::text))",
          [formId, String(tenantId)]
        );
      } else {
        result = await query("SELECT * FROM forms WHERE name = $1", [formId]);
      }
    }
    return result.rows[0];
  } catch (error) {
    console.error("Error getting form:", error);
    throw error;
  }
}
async function getEmailSettingsByFormId(formId) {
  try {
    const result = await query("SELECT * FROM email_settings WHERE form_id = $1", [formId]);
    return result.rows[0];
  } catch (error) {
    console.error("Error getting email settings:", error);
    return null;
  }
}
async function saveFormSubmissionExtended(formData) {
  try {
    let form = await getFormById(formData.form_id, formData.tenant_id);
    if (!form) {
      console.log("Form not found in new forms table, creating default form for:", formData.form_id);
      let tenantId = formData.tenant_id;
      if (!tenantId) {
        const tenantResult = await query(`
          SELECT DISTINCT tenant_id 
          FROM form_submissions 
          WHERE form_id = $1 AND tenant_id IS NOT NULL 
          LIMIT 1
        `, [formData.form_id]);
        if (tenantResult.rows.length > 0) {
          tenantId = tenantResult.rows[0].tenant_id;
        }
      }
      const defaultFormResult = await query(`
        INSERT INTO forms (name, description, fields, settings, is_active, tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        formData.form_name || formData.form_id,
        `Auto-created form for ${formData.form_id}`,
        JSON.stringify([
          { field_name: "name", field_type: "text", field_label: "Name", is_required: true, sort_order: 1 },
          { field_name: "email", field_type: "email", field_label: "Email", is_required: true, sort_order: 2 },
          { field_name: "phone", field_type: "tel", field_label: "Phone", is_required: false, sort_order: 3 },
          { field_name: "company", field_type: "text", field_label: "Company", is_required: false, sort_order: 4 },
          { field_name: "message", field_type: "textarea", field_label: "Message", is_required: true, sort_order: 5 }
        ]),
        JSON.stringify({ submit_button_text: "Send Message", success_message: "Thank you for your message!" }),
        true,
        tenantId || null
      ]);
      form = defaultFormResult.rows[0];
      await query(`
        INSERT INTO email_settings (
          form_id, notification_enabled, notification_emails, notification_subject, 
          notification_template, auto_reply_enabled, auto_reply_subject, auto_reply_template, from_name
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        form.id,
        true,
        ["admin@gosg.com.sg"],
        `New ${form.name} Submission`,
        "You have received a new form submission from {{name}} ({{email}}).\n\nMessage:\n{{message}}\n\nPhone: {{phone}}\nCompany: {{company}}",
        true,
        "Thank you for contacting GOSG",
        "Dear {{name}},\n\nThank you for contacting us. We have received your message and will get back to you within 24 hours.\n\nBest regards,\nGOSG Team",
        "GOSG Team"
      ]);
    }
    const submissionData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      message: formData.message
    };
    const result = await query(`
      INSERT INTO form_submissions_extended 
        (form_id, submission_data, submitter_email, submitter_name, submitter_ip, user_agent, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'new')
      RETURNING *
    `, [
      form.id,
      JSON.stringify(submissionData),
      formData.email,
      formData.name,
      formData.ip_address,
      formData.user_agent
    ]);
    return {
      submission: result.rows[0],
      form
    };
  } catch (error) {
    console.error("Error saving form submission to new database:", error);
    throw error;
  }
}
async function saveFormSubmission(formData) {
  try {
    const legacyResult = await query(`
      INSERT INTO form_submissions 
        (form_id, form_name, name, email, phone, company, message, status, ip_address, user_agent, tenant_id, submitted_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      formData.form_id,
      formData.form_name,
      formData.name,
      formData.email,
      formData.phone || null,
      formData.company || null,
      formData.message || null,
      formData.status || "new",
      formData.ip_address || null,
      formData.user_agent || null,
      formData.tenant_id || null
    ]);
    let extendedResult = null;
    try {
      extendedResult = await saveFormSubmissionExtended(formData);
    } catch (newDbError) {
      console.error("Error saving to new forms database:", newDbError);
    }
    return {
      submission: legacyResult.rows[0],
      extended: extendedResult
    };
  } catch (error) {
    console.error("Error saving form submission:", error);
    throw error;
  }
}
async function getFormSubmissions(formId) {
  try {
    let result = await query(`
      SELECT 
        id,
        submission_data,
        submitter_email,
        submitter_name,
        submitted_at
      FROM form_submissions_extended
      WHERE form_id = $1
      ORDER BY submitted_at DESC
    `, [formId]);
    if (result.rows.length === 0) {
      result = await query(`
        SELECT 
          id,
          name,
          email,
          phone,
          message,
          submitted_at
        FROM form_submissions
        WHERE form_id = $1
        ORDER BY submitted_at DESC
      `, [formId]);
      const formatted2 = result.rows.map((row) => ({
        id: row.id.toString(),
        date: new Date(row.submitted_at).toLocaleString("en-SG", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        }),
        data: {
          name: row.name || "",
          email: row.email || "",
          phone: row.phone || "",
          message: row.message || ""
        }
      }));
      return formatted2;
    }
    const formatted = result.rows.map((row) => {
      let submissionData = {};
      try {
        if (typeof row.submission_data === "string") {
          submissionData = JSON.parse(row.submission_data);
        } else {
          submissionData = row.submission_data || {};
        }
      } catch (e) {
        console.error("Error parsing submission_data:", e);
        submissionData = {};
      }
      return {
        id: row.id.toString(),
        date: new Date(row.submitted_at).toLocaleString("en-SG", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        }),
        data: submissionData
      };
    });
    return formatted;
  } catch (error) {
    console.error("Error fetching form submissions:", error);
    throw error;
  }
}
var init_forms = __esm({
  "sparti-cms/db/modules/forms.js"() {
    init_connection();
  }
});

// sparti-cms/db/modules/contacts.js
async function createContact(contactData, tenantId = null) {
  try {
    const result = await query(`
      INSERT INTO contacts 
        (first_name, last_name, email, phone, company, source, notes, status, tags, tenant_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (email) 
      DO UPDATE SET 
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = COALESCE(EXCLUDED.phone, contacts.phone),
        company = COALESCE(EXCLUDED.company, contacts.company),
        source = CASE WHEN contacts.source = 'form' THEN EXCLUDED.source ELSE contacts.source END,
        notes = COALESCE(EXCLUDED.notes, contacts.notes),
        tenant_id = COALESCE(EXCLUDED.tenant_id, contacts.tenant_id),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      contactData.first_name,
      contactData.last_name || null,
      contactData.email,
      contactData.phone || null,
      contactData.company || null,
      contactData.source || "form",
      contactData.notes || null,
      contactData.status || "new",
      contactData.tags || null,
      tenantId
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("Error creating contact:", error);
    throw error;
  }
}
async function getContacts(limit = 50, offset = 0, search = "", tenantId = null) {
  try {
    let whereClause = "";
    let params = [];
    let paramIndex = 1;
    const conditions = [];
    if (tenantId) {
      conditions.push(`tenant_id = $${paramIndex}`);
      params.push(tenantId);
      paramIndex++;
    }
    if (search) {
      conditions.push(`(
        first_name ILIKE $${paramIndex} OR 
        last_name ILIKE $${paramIndex} OR 
        email ILIKE $${paramIndex} OR 
        company ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(" AND ")}`;
    }
    const limitParam = `$${paramIndex}`;
    const offsetParam = `$${paramIndex + 1}`;
    params.push(limit, offset);
    const result = await query(`
      SELECT 
        id,
        first_name,
        last_name,
        email,
        phone,
        company,
        source,
        status,
        tags,
        tenant_id,
        created_at,
        updated_at
      FROM contacts 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limitParam} OFFSET ${offsetParam}
    `, params);
    const countParams = params.slice(0, paramIndex - 1);
    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM contacts 
      ${whereClause}
    `, countParams);
    return {
      contacts: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset
    };
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
}
async function getContact(contactId, tenantId = null) {
  try {
    let whereClause = "WHERE id = $1";
    let params = [contactId];
    if (tenantId) {
      whereClause += " AND tenant_id = $2";
      params.push(tenantId);
    }
    const result = await query(`
      SELECT * FROM contacts ${whereClause}
    `, params);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error fetching contact:", error);
    throw error;
  }
}
async function updateContact(contactId, contactData) {
  try {
    const result = await query(`
      UPDATE contacts 
      SET 
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        email = COALESCE($4, email),
        phone = COALESCE($5, phone),
        company = COALESCE($6, company),
        source = COALESCE($7, source),
        notes = COALESCE($8, notes),
        status = COALESCE($9, status),
        tags = COALESCE($10, tags),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [
      contactId,
      contactData.first_name,
      contactData.last_name,
      contactData.email,
      contactData.phone,
      contactData.company,
      contactData.source,
      contactData.notes,
      contactData.status,
      contactData.tags
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
}
async function deleteContact(contactId) {
  try {
    await query(`DELETE FROM contacts WHERE id = $1`, [contactId]);
    return true;
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
}
async function getContactsWithMessages(limit = 50, offset = 0, search = "", tenantId = null) {
  try {
    let whereClause = "";
    let params = [];
    let paramIndex = 1;
    const conditions = [];
    if (tenantId) {
      conditions.push(`c.tenant_id = $${paramIndex}`);
      params.push(tenantId);
      paramIndex++;
    }
    if (search) {
      conditions.push(`(
        c.first_name ILIKE $${paramIndex} OR 
        c.last_name ILIKE $${paramIndex} OR 
        c.email ILIKE $${paramIndex} OR 
        c.company ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(" AND ")}`;
    }
    const limitParam = `$${paramIndex}`;
    const offsetParam = `$${paramIndex + 1}`;
    params.push(limit, offset);
    const result = await query(`
      SELECT 
        c.id,
        c.first_name,
        c.last_name,
        c.email,
        c.phone,
        c.company,
        c.source,
        c.status,
        c.tags,
        c.notes,
        c.tenant_id,
        c.created_at,
        c.updated_at,
        COALESCE(
          JSON_AGG(
            CASE WHEN fs.id IS NOT NULL THEN
              JSON_BUILD_OBJECT(
                'id', fs.id,
                'form_name', fs.form_name,
                'message', fs.message,
                'submitted_at', fs.submitted_at
              )
            END
          ) FILTER (WHERE fs.id IS NOT NULL), 
          '[]'::json
        ) as form_messages
      FROM contacts c
      LEFT JOIN form_submissions fs ON c.email = fs.email AND (fs.tenant_id = c.tenant_id OR fs.tenant_id IS NULL)
      ${whereClause}
      GROUP BY c.id, c.first_name, c.last_name, c.email, c.phone, c.company, c.source, c.status, c.tags, c.notes, c.tenant_id, c.created_at, c.updated_at
      ORDER BY c.created_at DESC
      LIMIT ${limitParam} OFFSET ${offsetParam}
    `, params);
    const countParams = params.slice(0, paramIndex - 1);
    const countResult = await query(`
      SELECT COUNT(DISTINCT c.id) as total 
      FROM contacts c
      LEFT JOIN form_submissions fs ON c.email = fs.email AND (fs.tenant_id = c.tenant_id OR fs.tenant_id IS NULL)
      ${whereClause}
    `, countParams);
    return {
      contacts: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset
    };
  } catch (error) {
    console.error("Error fetching contacts with messages:", error);
    throw error;
  }
}
var init_contacts = __esm({
  "sparti-cms/db/modules/contacts.js"() {
    init_connection();
  }
});

// sparti-cms/db/modules/media.js
var media_exports = {};
__export(media_exports, {
  createMediaFile: () => createMediaFile,
  createMediaFolder: () => createMediaFolder,
  deleteMediaFile: () => deleteMediaFile,
  deleteMediaFolder: () => deleteMediaFolder,
  getMediaFile: () => getMediaFile,
  getMediaFiles: () => getMediaFiles,
  getMediaFolders: () => getMediaFolders,
  getTenantStorageName: () => getTenantStorageName,
  initializeTenantMediaFolders: () => initializeTenantMediaFolders,
  updateMediaFile: () => updateMediaFile,
  updateMediaFolder: () => updateMediaFolder
});
async function getTenantStorageName(tenantId) {
  try {
    const envKey = `RAILWAY_STORAGE_${tenantId.toUpperCase().replace(/-/g, "_")}`;
    const envStorageName = process.env[envKey];
    if (envStorageName) {
      console.log(`[testing] Using storage from env ${envKey}: ${envStorageName}`);
      return envStorageName;
    }
    const result = await query(`
      SELECT storage_name FROM tenants WHERE id = $1
    `, [tenantId]);
    if (result.rows.length > 0 && result.rows[0].storage_name) {
      return result.rows[0].storage_name;
    }
    return tenantId;
  } catch (error) {
    console.error(`[testing] Error getting storage name for tenant ${tenantId}:`, error);
    return tenantId;
  }
}
async function getMediaFolders(tenantId, parentFolderId = null) {
  try {
    let whereClause = "WHERE (tenant_id = $1 OR tenant_id IS NULL)";
    let params = [tenantId];
    if (parentFolderId !== null) {
      whereClause += " AND parent_folder_id = $2";
      params.push(parentFolderId);
    } else {
      whereClause += " AND parent_folder_id IS NULL";
    }
    const result = await query(`
      SELECT * FROM media_folders
      ${whereClause}
      AND is_active = true
      ORDER BY 
        CASE WHEN tenant_id = $1 THEN 0 ELSE 1 END,
        name ASC
    `, params);
    const seenSlugs = /* @__PURE__ */ new Set();
    const uniqueFolders = [];
    for (const folder of result.rows) {
      if (!seenSlugs.has(folder.slug)) {
        seenSlugs.add(folder.slug);
        uniqueFolders.push(folder);
      }
    }
    return uniqueFolders;
  } catch (error) {
    console.error(`[testing] Error fetching media folders for tenant ${tenantId}:`, error);
    throw error;
  }
}
async function createMediaFolder(folderData, tenantId) {
  try {
    const { name, slug, description, parent_folder_id, folder_path } = folderData;
    const result = await query(`
      INSERT INTO media_folders (name, slug, description, parent_folder_id, folder_path, tenant_id, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
      RETURNING *
    `, [name, slug, description, parent_folder_id || null, folder_path, tenantId]);
    return result.rows[0];
  } catch (error) {
    console.error(`[testing] Error creating media folder for tenant ${tenantId}:`, error);
    if (error.code === "23505" || error.name === "SequelizeUniqueConstraintError") {
      throw new Error("A folder with this slug already exists for this tenant");
    }
    throw error;
  }
}
async function updateMediaFolder(folderId, folderData, tenantId) {
  try {
    const { name, slug, description, parent_folder_id, folder_path } = folderData;
    const result = await query(`
      UPDATE media_folders
      SET name = COALESCE($1, name),
          slug = COALESCE($2, slug),
          description = COALESCE($3, description),
          parent_folder_id = COALESCE($4, parent_folder_id),
          folder_path = COALESCE($5, folder_path),
          updated_at = NOW()
      WHERE id = $6 AND tenant_id = $7
      RETURNING *
    `, [name, slug, description, parent_folder_id, folder_path, folderId, tenantId]);
    if (result.rows.length === 0) {
      throw new Error("Folder not found or does not belong to this tenant");
    }
    return result.rows[0];
  } catch (error) {
    console.error(`[testing] Error updating media folder for tenant ${tenantId}:`, error);
    throw error;
  }
}
async function deleteMediaFolder(folderId, tenantId) {
  try {
    const result = await query(`
      UPDATE media_folders
      SET is_active = false, updated_at = NOW()
      WHERE id = $1 AND tenant_id = $2
      RETURNING *
    `, [folderId, tenantId]);
    if (result.rows.length === 0) {
      throw new Error("Folder not found or does not belong to this tenant");
    }
    return result.rows[0];
  } catch (error) {
    console.error(`[testing] Error deleting media folder for tenant ${tenantId}:`, error);
    throw error;
  }
}
async function getMediaFiles(tenantId, filters = {}) {
  try {
    let whereClause = "WHERE tenant_id = $1";
    let params = [tenantId];
    if (filters.folder_id !== void 0) {
      if (filters.folder_id === null) {
        whereClause += " AND folder_id IS NULL";
      } else {
        whereClause += " AND folder_id = $2";
        params.push(filters.folder_id);
      }
    }
    if (filters.media_type) {
      whereClause += ` AND media_type = $${params.length + 1}`;
      params.push(filters.media_type);
    }
    if (filters.search) {
      whereClause += ` AND (filename ILIKE $${params.length + 1} OR title ILIKE $${params.length + 1} OR alt_text ILIKE $${params.length + 1})`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    whereClause += " AND is_active = true";
    const result = await query(`
      SELECT * FROM media
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, filters.limit || 50, filters.offset || 0]);
    const countResult = await query(`
      SELECT COUNT(*) as total FROM media
      ${whereClause}
    `, params);
    return {
      files: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit: filters.limit || 50,
      offset: filters.offset || 0
    };
  } catch (error) {
    console.error(`[testing] Error fetching media files for tenant ${tenantId}:`, error);
    throw error;
  }
}
async function getMediaFile(mediaId, tenantId) {
  try {
    const result = await query(`
      SELECT * FROM media
      WHERE id = $1 AND tenant_id = $2 AND is_active = true
    `, [mediaId, tenantId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error(`[testing] Error fetching media file for tenant ${tenantId}:`, error);
    throw error;
  }
}
async function createMediaFile(mediaData, tenantId) {
  try {
    const {
      filename,
      original_filename,
      slug,
      alt_text,
      title,
      description,
      url,
      relative_path,
      mime_type,
      file_extension,
      file_size,
      width,
      height,
      duration,
      folder_id,
      media_type,
      metadata
    } = mediaData;
    const result = await query(`
      INSERT INTO media (
        filename, original_filename, slug, alt_text, title, description,
        url, relative_path, mime_type, file_extension, file_size,
        width, height, duration, folder_id, media_type, metadata,
        tenant_id, is_active, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, true, NOW(), NOW())
      RETURNING *
    `, [
      filename,
      original_filename,
      slug,
      alt_text,
      title,
      description,
      url,
      relative_path,
      mime_type,
      file_extension,
      file_size,
      width,
      height,
      duration,
      folder_id || null,
      media_type,
      metadata || null,
      tenantId
    ]);
    return result.rows[0];
  } catch (error) {
    console.error(`[testing] Error creating media file for tenant ${tenantId}:`, error);
    if (error.code === "23505" || error.name === "SequelizeUniqueConstraintError") {
      throw new Error("A media file with this slug already exists for this tenant");
    }
    throw error;
  }
}
async function updateMediaFile(mediaId, mediaData, tenantId) {
  try {
    const {
      alt_text,
      title,
      description,
      folder_id,
      is_featured,
      seo_optimized
    } = mediaData;
    const result = await query(`
      UPDATE media
      SET alt_text = COALESCE($1, alt_text),
          title = COALESCE($2, title),
          description = COALESCE($3, description),
          folder_id = COALESCE($4, folder_id),
          is_featured = COALESCE($5, is_featured),
          seo_optimized = COALESCE($6, seo_optimized),
          updated_at = NOW()
      WHERE id = $7 AND tenant_id = $8
      RETURNING *
    `, [alt_text, title, description, folder_id, is_featured, seo_optimized, mediaId, tenantId]);
    if (result.rows.length === 0) {
      throw new Error("Media file not found or does not belong to this tenant");
    }
    return result.rows[0];
  } catch (error) {
    console.error(`[testing] Error updating media file for tenant ${tenantId}:`, error);
    throw error;
  }
}
async function deleteMediaFile(mediaId, tenantId) {
  try {
    const result = await query(`
      UPDATE media
      SET is_active = false, updated_at = NOW()
      WHERE id = $1 AND tenant_id = $2
      RETURNING *
    `, [mediaId, tenantId]);
    if (result.rows.length === 0) {
      throw new Error("Media file not found or does not belong to this tenant");
    }
    return result.rows[0];
  } catch (error) {
    console.error(`[testing] Error deleting media file for tenant ${tenantId}:`, error);
    throw error;
  }
}
async function initializeTenantMediaFolders(tenantId) {
  try {
    console.log(`[testing] Initializing media folders for tenant: ${tenantId}`);
    const existingFolders = await getMediaFolders(tenantId);
    if (existingFolders.length > 0) {
      console.log(`[testing] Media folders already exist for tenant ${tenantId}`);
      return existingFolders;
    }
    const defaultFolders = [
      { name: "Images", slug: "images", folder_path: "/images" },
      { name: "Videos", slug: "videos", folder_path: "/videos" },
      { name: "Documents", slug: "documents", folder_path: "/documents" },
      { name: "Other", slug: "other", folder_path: "/other" }
    ];
    const createdFolders = [];
    for (const folder of defaultFolders) {
      try {
        const created = await createMediaFolder(folder, tenantId);
        createdFolders.push(created);
      } catch (error) {
        console.error(`[testing] Error creating folder ${folder.name}:`, error);
      }
    }
    console.log(`[testing] Created ${createdFolders.length} media folders for tenant ${tenantId}`);
    return createdFolders;
  } catch (error) {
    console.error(`[testing] Error initializing media folders for tenant ${tenantId}:`, error);
    throw error;
  }
}
var init_media = __esm({
  "sparti-cms/db/modules/media.js"() {
    init_connection();
    init_connection();
  }
});

// sparti-cms/db/sequelize/run-migrations.js
var run_migrations_exports = {};
__export(run_migrations_exports, {
  isMigrationExecuted: () => isMigrationExecuted,
  runMigrations: () => runMigrations
});
import path from "path";
import { fileURLToPath as fileURLToPath3 } from "url";
import { Sequelize as Sequelize2 } from "sequelize";
async function runMigrations(migrationNames = null) {
  const sequelize2 = getSequelize();
  const queryInterface = sequelize2.getQueryInterface();
  try {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
        name VARCHAR(255) NOT NULL PRIMARY KEY
      );
    `);
  } catch (error) {
  }
  const [executedMigrations] = await queryInterface.sequelize.query(
    'SELECT name FROM "SequelizeMeta" ORDER BY name'
  );
  const executedNames = executedMigrations.map((r) => r.name);
  const fs4 = await import("fs");
  const migrationsDir = path.join(__dirname3, "migrations");
  const migrationFiles = fs4.readdirSync(migrationsDir).filter((file) => file.endsWith(".js")).sort();
  let migrationsToRun = migrationFiles;
  if (migrationNames && migrationNames.length > 0) {
    migrationsToRun = migrationFiles.filter(
      (file) => migrationNames.includes(file) && !executedNames.includes(file)
    );
  } else {
    migrationsToRun = migrationFiles.filter(
      (file) => !executedNames.includes(file)
    );
  }
  for (const migrationFile of migrationsToRun) {
    try {
      console.log(`[testing] Running migration: ${migrationFile}`);
      const migrationPath = path.join(migrationsDir, migrationFile);
      const migration = await import(`file://${migrationPath}`);
      const migrationModule = migration.default || migration;
      if (migrationModule && migrationModule.up) {
        await migrationModule.up(queryInterface, Sequelize2);
      } else {
        throw new Error(`Migration ${migrationFile} does not export an 'up' function`);
      }
      await queryInterface.sequelize.query(
        `INSERT INTO "SequelizeMeta" (name) VALUES ('${migrationFile}')`
      );
      console.log(`[testing] Completed migration: ${migrationFile}`);
    } catch (error) {
      console.error(`[testing] Error running migration ${migrationFile}:`, error);
      throw error;
    }
  }
  if (migrationsToRun.length === 0) {
    console.log("[testing] No pending migrations to run");
  } else {
    console.log(`[testing] Successfully ran ${migrationsToRun.length} migration(s)`);
  }
}
async function isMigrationExecuted(migrationName) {
  const sequelize2 = getSequelize();
  try {
    const [results] = await sequelize2.query(
      `SELECT name FROM "SequelizeMeta" WHERE name = '${migrationName}'`
    );
    return results.length > 0;
  } catch (error) {
    if (error.message.includes("does not exist")) {
      return false;
    }
    throw error;
  }
}
var __filename3, __dirname3;
var init_run_migrations = __esm({
  "sparti-cms/db/sequelize/run-migrations.js"() {
    init_sequelize();
    __filename3 = fileURLToPath3(import.meta.url);
    __dirname3 = path.dirname(__filename3);
  }
});

// sparti-cms/db/scripts/create-master-header-footer-pages.js
var create_master_header_footer_pages_exports = {};
__export(create_master_header_footer_pages_exports, {
  createMasterHeaderFooterPages: () => createMasterHeaderFooterPages
});
async function createMasterHeaderFooterPages() {
  console.log("[testing] Creating master Header and Footer pages...");
  try {
    const headerCheck = await query(`
      SELECT id FROM pages WHERE tenant_id IS NULL AND page_type = 'header'
    `);
    if (headerCheck.rows.length === 0) {
      await createPage({
        page_name: "Header",
        slug: "/header",
        page_type: "header",
        status: "published",
        seo_index: false,
        tenant_id: null,
        // Master page
        meta_title: "Header",
        meta_description: "Site header configuration"
      });
      console.log("[testing] Created master Header page");
    } else {
      console.log("[testing] Master Header page already exists");
    }
    const footerCheck = await query(`
      SELECT id FROM pages WHERE tenant_id IS NULL AND page_type = 'footer'
    `);
    if (footerCheck.rows.length === 0) {
      await createPage({
        page_name: "Footer",
        slug: "/footer",
        page_type: "footer",
        status: "published",
        seo_index: false,
        tenant_id: null,
        // Master page
        meta_title: "Footer",
        meta_description: "Site footer configuration"
      });
      console.log("[testing] Created master Footer page");
    } else {
      console.log("[testing] Master Footer page already exists");
    }
    const headerResult = await query(`
      SELECT id FROM pages WHERE tenant_id IS NULL AND page_type = 'header'
    `);
    if (headerResult.rows.length > 0) {
      const headerId = headerResult.rows[0].id;
      const headerLayoutCheck = await query(`
        SELECT id FROM page_layouts WHERE page_id = $1 AND language = 'default'
      `, [headerId]);
      if (headerLayoutCheck.rows.length === 0) {
        await query(`
          INSERT INTO page_layouts (page_id, language, layout_json, version, updated_at)
          VALUES ($1, 'default', $2::jsonb, 1, NOW())
        `, [headerId, JSON.stringify({ components: [] })]);
        console.log("[testing] Created empty layout for master Header page");
      }
    }
    const footerResult = await query(`
      SELECT id FROM pages WHERE tenant_id IS NULL AND page_type = 'footer'
    `);
    if (footerResult.rows.length > 0) {
      const footerId = footerResult.rows[0].id;
      const footerLayoutCheck = await query(`
        SELECT id FROM page_layouts WHERE page_id = $1 AND language = 'default'
      `, [footerId]);
      if (footerLayoutCheck.rows.length === 0) {
        await query(`
          INSERT INTO page_layouts (page_id, language, layout_json, version, updated_at)
          VALUES ($1, 'default', $2::jsonb, 1, NOW())
        `, [footerId, JSON.stringify({ components: [] })]);
        console.log("[testing] Created empty layout for master Footer page");
      }
    }
    console.log("[testing] Master Header and Footer pages setup complete");
    return true;
  } catch (error) {
    console.error("[testing] Error creating master Header/Footer pages:", error);
    throw error;
  }
}
var init_create_master_header_footer_pages = __esm({
  "sparti-cms/db/scripts/create-master-header-footer-pages.js"() {
    init_db();
    init_pages();
    if (import.meta.url === `file://${process.argv[1]}`) {
      createMasterHeaderFooterPages().then(() => {
        console.log("[testing] Script completed successfully");
        process.exit(0);
      }).catch((error) => {
        console.error("[testing] Script failed:", error);
        process.exit(1);
      });
    }
  }
});

// sparti-cms/services/themeSync.js
var themeSync_exports = {};
__export(themeSync_exports, {
  createTheme: () => createTheme,
  ensureDemoTenantHasThemePages: () => ensureDemoTenantHasThemePages,
  getAllThemes: () => getAllThemes,
  getDefaultLayoutForTheme: () => getDefaultLayoutForTheme,
  getThemeBySlug: () => getThemeBySlug,
  getThemePagesFromFileSystem: () => getThemePagesFromFileSystem,
  getThemesFromFileSystem: () => getThemesFromFileSystem,
  readThemePages: () => readThemePages,
  syncDemoTenantPagesFromFileSystem: () => syncDemoTenantPagesFromFileSystem,
  syncThemePages: () => syncThemePages,
  syncThemesFromFileSystem: () => syncThemesFromFileSystem
});
import fs from "fs";
import path2 from "path";
import { fileURLToPath as fileURLToPath4 } from "url";
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  if (typeof fs.cpSync === "function") {
    fs.cpSync(src, dest, { recursive: true });
    return;
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path2.join(src, entry.name);
    const destPath = path2.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
function formatThemeName(slug) {
  let formatted = slug.replace(/([a-z])([A-Z])/g, "$1 $2");
  const commonPatterns = {
    "landingpage": "Landing Page",
    "homepage": "Home Page",
    "aboutpage": "About Page",
    "contactpage": "Contact Page"
  };
  const lowerSlug = slug.toLowerCase();
  if (commonPatterns[lowerSlug]) {
    return commonPatterns[lowerSlug];
  }
  formatted = formatted.replace(/([a-z])([a-z][A-Z])/g, "$1 $2");
  return formatted.split(/[-_\s]+/).map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
}
function readThemeConfig(slug) {
  try {
    const themesDir = path2.join(__dirname4, "../theme");
    const themePath = path2.join(themesDir, slug);
    const configPath = path2.join(themePath, "theme.json");
    if (!fs.existsSync(themePath)) {
      console.log(`[testing] Theme folder does not exist: ${themePath}`);
      return null;
    }
    if (!fs.existsSync(configPath)) {
      console.log(`[testing] theme.json not found for theme: ${slug}`);
      return null;
    }
    const configContent = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(configContent);
    if (!config.name) {
      console.warn(`[testing] theme.json for ${slug} is missing required 'name' field`);
      return null;
    }
    return config;
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    console.error(`[testing] Error reading theme.json for ${slug}:`, error.message);
    return null;
  }
}
function readThemePages(slug) {
  try {
    const themesDir = path2.join(__dirname4, "../theme");
    const themePath = path2.join(themesDir, slug);
    const pagesPath = path2.join(themePath, "pages.json");
    if (!fs.existsSync(themePath)) {
      console.log(`[testing] Theme folder does not exist: ${themePath}`);
      return null;
    }
    if (!fs.existsSync(pagesPath)) {
      console.log(`[testing] pages.json not found for theme: ${slug}`);
      return [];
    }
    const pagesContent = fs.readFileSync(pagesPath, "utf8");
    const pagesData = JSON.parse(pagesContent);
    if (!pagesData.pages || !Array.isArray(pagesData.pages)) {
      console.warn(`[testing] pages.json for ${slug} has invalid structure - expected 'pages' array`);
      return [];
    }
    const validPages = pagesData.pages.filter((page) => {
      if (!page.page_name || !page.slug) {
        console.warn(`[testing] Page in ${slug} is missing required fields (page_name or slug)`);
        return false;
      }
      return true;
    });
    return validPages;
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    console.error(`[testing] Error reading pages.json for ${slug}:`, error.message);
    return [];
  }
}
function writeThemeConfig(slug, config) {
  try {
    const themesDir = path2.join(__dirname4, "../theme");
    const themePath = path2.join(themesDir, slug);
    const configPath = path2.join(themePath, "theme.json");
    if (!fs.existsSync(themePath)) {
      fs.mkdirSync(themePath, { recursive: true });
    }
    if (!config.name) {
      throw new Error('Theme config must have a "name" field');
    }
    const jsonContent = JSON.stringify(config, null, 2);
    fs.writeFileSync(configPath, jsonContent, "utf8");
    console.log(`[testing] Created theme.json for theme: ${slug}`);
    return true;
  } catch (error) {
    console.error(`[testing] Error writing theme.json for ${slug}:`, error);
    return false;
  }
}
function getThemePagesFromFileSystem(themeSlug) {
  try {
    const rawPages = readThemePages(themeSlug);
    if (!rawPages || rawPages.length === 0) {
      return [];
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const formattedPages = rawPages.map((page) => {
      let pageId = page.slug;
      pageId = pageId.replace(/^\/+|\/+$/g, "").replace(/\//g, "-");
      if (!pageId || pageId === "") {
        pageId = "homepage";
      }
      const fullId = `theme-${themeSlug}-${pageId}`;
      return {
        id: fullId,
        page_name: page.page_name,
        slug: page.slug,
        status: page.status || "published",
        page_type: page.page_type || "page",
        meta_title: page.meta_title || null,
        meta_description: page.meta_description || null,
        seo_index: page.seo_index !== void 0 ? page.seo_index : true,
        campaign_source: page.campaign_source || null,
        conversion_goal: page.conversion_goal || null,
        legal_type: page.legal_type || null,
        version: page.version || null,
        theme_id: themeSlug,
        // Include theme_id to identify which theme this page belongs to
        created_at: now,
        updated_at: now,
        from_filesystem: true
        // Flag to indicate this came from file system
      };
    });
    return formattedPages;
  } catch (error) {
    console.error(`[testing] Error getting theme pages from file system for ${themeSlug}:`, error);
    return [];
  }
}
function getThemesFromFileSystem() {
  try {
    const themesDir = path2.join(__dirname4, "../theme");
    if (!fs.existsSync(themesDir)) {
      console.log("[testing] Themes directory does not exist:", themesDir);
      return [];
    }
    const themeFolders = fs.readdirSync(themesDir, { withFileTypes: true }).filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name).filter((slug) => !EXCLUDED_THEME_SLUGS.has(slug));
    if (themeFolders.length === 0) {
      console.log("[testing] No theme folders found in:", themesDir);
      return [];
    }
    const themes = themeFolders.map((slug) => {
      const config = readThemeConfig(slug);
      if (config) {
        return {
          id: slug,
          slug,
          name: config.name,
          description: config.description || `Theme: ${config.name}`,
          version: config.version,
          author: config.author,
          tags: config.tags || [],
          is_active: config.is_active !== void 0 ? config.is_active : true,
          from_filesystem: true
        };
      } else {
        const fallbackName = formatThemeName(slug);
        return {
          id: slug,
          slug,
          name: fallbackName,
          description: `Theme: ${fallbackName}`,
          is_active: true,
          from_filesystem: true
        };
      }
    });
    return themes;
  } catch (error) {
    console.error("[testing] Error reading themes from file system:", error);
    return [];
  }
}
async function syncThemesFromFileSystem() {
  try {
    const themesDir = path2.join(__dirname4, "../theme");
    if (!fs.existsSync(themesDir)) {
      console.log("[testing] Themes directory does not exist:", themesDir);
      return { success: true, synced: 0, message: "Themes directory not found" };
    }
    const themeFolders = fs.readdirSync(themesDir, { withFileTypes: true }).filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name).filter((slug) => !EXCLUDED_THEME_SLUGS.has(slug));
    if (themeFolders.length === 0) {
      console.log("[testing] No theme folders found in:", themesDir);
      return { success: true, synced: 0, message: "No themes found" };
    }
    console.log(`[testing] Found ${themeFolders.length} theme folder(s):`, themeFolders);
    let syncedCount = 0;
    const results = [];
    for (const themeSlug of themeFolders) {
      try {
        let existingTheme;
        try {
          existingTheme = await query(`
            SELECT id, name, slug, updated_at
            FROM themes
            WHERE slug = $1 OR id = $1
          `, [themeSlug]);
        } catch (dbError) {
          if (dbError.code === "42P01" || dbError.message?.includes("does not exist")) {
            console.log(`[testing] Themes table doesn't exist, skipping database sync for ${themeSlug}`);
            results.push({
              slug: themeSlug,
              action: "skipped",
              name: formatThemeName(themeSlug),
              reason: "Database table does not exist"
            });
            continue;
          }
          throw dbError;
        }
        const config = readThemeConfig(themeSlug);
        const themeName = config?.name || formatThemeName(themeSlug);
        const themeDescription = config?.description || `Theme: ${themeName}`;
        const themeTags = config?.tags || [];
        const isActive = config?.is_active !== void 0 ? config.is_active : true;
        const now = (/* @__PURE__ */ new Date()).toISOString();
        let themeDbId;
        if (existingTheme.rows.length > 0) {
          themeDbId = existingTheme.rows[0].id;
          const hasTagsColumn = existingTheme.rows[0].tags !== void 0;
          if (hasTagsColumn) {
            await query(`
              UPDATE themes
              SET name = $1, description = $2, updated_at = $3, is_active = $4, tags = $5
              WHERE slug = $6 OR id = $6
            `, [themeName, themeDescription, now, isActive, themeTags, themeSlug]);
          } else {
            await query(`
              UPDATE themes
              SET name = $1, description = $2, updated_at = $3, is_active = $4
              WHERE slug = $5 OR id = $5
            `, [themeName, themeDescription, now, isActive, themeSlug]);
          }
          results.push({
            slug: themeSlug,
            id: themeDbId,
            action: "updated",
            name: themeName
          });
          syncedCount++;
          console.log(`[testing] Updated theme: ${themeSlug} (${themeName}) with ID: ${themeDbId}`);
        } else {
          themeDbId = themeSlug;
          try {
            await query(`
              INSERT INTO themes (id, name, slug, description, created_at, updated_at, is_active, tags)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
              themeDbId,
              themeName,
              themeSlug,
              themeDescription,
              now,
              now,
              isActive,
              themeTags
            ]);
          } catch (tagsError) {
            if (tagsError.message?.includes('column "tags"') || tagsError.code === "42703") {
              await query(`
                INSERT INTO themes (id, name, slug, description, created_at, updated_at, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
              `, [
                themeDbId,
                themeName,
                themeSlug,
                themeDescription,
                now,
                now,
                isActive
              ]);
            } else {
              throw tagsError;
            }
          }
          results.push({
            slug: themeSlug,
            id: themeDbId,
            action: "created",
            name: themeName
          });
          syncedCount++;
          console.log(`[testing] Created theme: ${themeSlug} (${themeName}) with ID: ${themeDbId}`);
        }
      } catch (error) {
        console.error(`[testing] Error syncing theme ${themeSlug}:`, error);
        results.push({
          slug: themeSlug,
          action: "error",
          error: error.message
        });
      }
    }
    let settingsSyncedCount = 0;
    try {
      const tenantsResult = await query(`
        SELECT DISTINCT tenant_id 
        FROM site_settings 
        WHERE tenant_id IS NOT NULL
      `);
      const tenantIds = tenantsResult.rows.map((row) => row.tenant_id);
      console.log(`[testing] Found ${tenantIds.length} tenant(s) to sync settings for`);
      for (const themeResult of results) {
        if (themeResult.action === "created" || themeResult.action === "updated") {
          const themeDbId = themeResult.id || themeResult.slug;
          for (const tenantId of tenantIds) {
            try {
              const updated = await query(`
                UPDATE site_settings
                SET theme_id = $1, updated_at = CURRENT_TIMESTAMP
                WHERE tenant_id = $2
                  AND (theme_id = $3 OR theme_id IS NULL)
                  AND setting_key IN ('theme_styles', 'site_name', 'site_tagline', 'site_description', 'site_logo', 'site_favicon')
                  AND (theme_id != $1 OR theme_id IS NULL)
                RETURNING id, setting_key
              `, [themeDbId, tenantId, themeResult.slug]);
              if (updated.rows.length > 0) {
                settingsSyncedCount += updated.rows.length;
                console.log(`[testing] Synced ${updated.rows.length} setting(s) for tenant ${tenantId}, theme ${themeResult.slug} (ID: ${themeDbId})`);
              }
            } catch (tenantError) {
              console.log(`[testing] Note: Could not sync settings for tenant ${tenantId}, theme ${themeResult.slug}:`, tenantError.message);
            }
          }
        }
      }
    } catch (settingsError) {
      console.log(`[testing] Note: Could not sync theme settings:`, settingsError.message);
    }
    return {
      success: true,
      synced: syncedCount,
      total: themeFolders.length,
      results,
      settingsSynced: settingsSyncedCount,
      message: `Synced ${syncedCount} theme(s) and ${settingsSyncedCount} setting(s)`
    };
  } catch (error) {
    console.error("[testing] Error in syncThemesFromFileSystem:", error);
    return {
      success: false,
      synced: 0,
      error: error.message,
      message: "Failed to sync themes"
    };
  }
}
async function getAllThemes() {
  try {
    let result;
    try {
      result = await query(`
        SELECT id, name, slug, description, created_at, updated_at, is_active, tags
        FROM themes
        WHERE is_active = true
          AND slug NOT IN ('template', 'masterastrowind')
          AND id NOT IN ('template', 'masterastrowind')
        ORDER BY name ASC
      `);
    } catch (tagsError) {
      if (tagsError.message?.includes('column "tags"') || tagsError.code === "42703") {
        result = await query(`
          SELECT id, name, slug, description, created_at, updated_at, is_active
          FROM themes
          WHERE is_active = true
            AND slug NOT IN ('template', 'masterastrowind')
            AND id NOT IN ('template', 'masterastrowind')
          ORDER BY name ASC
        `);
      } else {
        throw tagsError;
      }
    }
    return result.rows;
  } catch (error) {
    console.error("[testing] Error getting themes from database, falling back to file system:", error.message);
    console.log("[testing] Using file system themes as fallback");
    return getThemesFromFileSystem();
  }
}
function getDefaultLayoutForTheme(themeSlug) {
  const themeComponentMap = {
    "landingpage": {
      components: [
        {
          id: "header-1",
          type: "header-main",
          props: {
            logo: {
              src: "/assets/go-sg-logo-official.png",
              alt: "GO SG Digital Marketing Agency"
            },
            ctaText: "Contact Us",
            showCTA: true,
            isFixed: true
          }
        },
        {
          id: "hero-1",
          type: "hero-main",
          props: {
            badgeText: "Results in 3 months or less",
            showBadge: true,
            headingLine1: "We Boost Your SEO",
            headingLine2: "In 3 Months",
            description: "We help businesses dominate search results through proven SEO strategies that increase organic traffic, boost rankings, and drive qualified leads to your website.",
            ctaButtonText: "Get a Quote",
            showClientLogos: true,
            clientLogos: [
              { src: "/assets/logos/art-in-bloom.png", alt: "Art in Bloom" },
              { src: "/assets/logos/selenightco.png", alt: "Selenightco" },
              { src: "/assets/logos/smooy.png", alt: "Smooy" },
              { src: "/assets/logos/solstice.png", alt: "Solstice" },
              { src: "/assets/logos/grub.png", alt: "Grub" },
              { src: "/assets/logos/nail-queen.png", alt: "Nail Queen" },
              { src: "/assets/logos/caro-patisserie.png", alt: "Caro P\xE2tisserie" },
              { src: "/assets/logos/spirit-stretch.png", alt: "Spirit Stretch" }
            ],
            backgroundType: "gradient",
            backgroundColor: "#ffffff"
          }
        },
        {
          id: "services-1",
          type: "services-showcase-section",
          props: {
            services: [
              {
                id: "keywords-research",
                title: "Rank on keywords with",
                highlight: "search volume",
                description: "Discover high-volume keywords with precise search data and user intent analysis. Find the perfect keywords to target for maximum organic traffic growth.",
                buttonText: "Learn More",
                images: [
                  "/src/assets/seo/keyword-research-1.png",
                  "/src/assets/seo/keyword-research-2.png"
                ]
              },
              {
                id: "content-strategy",
                title: "Find topics based on",
                highlight: "real google search results",
                description: "Discover content opportunities by analyzing actual Google search results and user behavior. Get real insights from search data to create content that ranks and converts.",
                buttonText: "View Analytics",
                images: [
                  "/src/assets/seo/content-strategy-1.png",
                  "/src/assets/seo/content-strategy-2.png"
                ]
              },
              {
                id: "link-building",
                title: "Build authority with",
                highlight: "high-quality backlinks",
                description: "Strengthen your website's authority through strategic link building campaigns. Acquire high-quality backlinks from reputable sources to boost your domain authority and rankings.",
                buttonText: "Try Link Builder",
                images: [
                  "/src/assets/seo/link-building-1.png",
                  "/src/assets/seo/link-building-2.png"
                ]
              }
            ],
            backgroundColor: "#ffffff"
          }
        },
        {
          id: "testimonials-1",
          type: "testimonials-section",
          props: {
            sectionTitle: "What our clients say",
            sectionSubtitle: "See what our customers have to say about our SEO services and results.",
            testimonials: [
              {
                text: "GoSG's SEO strategies boosted our organic traffic by 400% in just 3 months. Our website now ranks #1 for our main keywords.",
                image: "https://randomuser.me/api/portraits/women/1.jpg",
                name: "Sarah Chen",
                role: "Marketing Director"
              },
              {
                text: "Their technical SEO audit revealed critical issues we didn't know existed. After fixes, our search rankings improved dramatically.",
                image: "https://randomuser.me/api/portraits/men/2.jpg",
                name: "Marcus Tan",
                role: "Business Owner"
              },
              {
                text: "GoSG's local SEO expertise helped us dominate Singapore search results. We're now the top choice in our area.",
                image: "https://randomuser.me/api/portraits/women/3.jpg",
                name: "Priya Sharma",
                role: "E-commerce Manager"
              },
              {
                text: "From page 5 to page 1 in Google in just 4 months. GoSG's SEO approach delivered exactly what they promised.",
                image: "https://randomuser.me/api/portraits/men/4.jpg",
                name: "David Lim",
                role: "CEO"
              },
              {
                text: "Their SEO content strategy doubled our organic leads. Every blog post now ranks and brings qualified traffic.",
                image: "https://randomuser.me/api/portraits/women/5.jpg",
                name: "Jennifer Wong",
                role: "Operations Manager"
              }
            ],
            backgroundColor: "#f9fafb"
          }
        },
        {
          id: "faq-1",
          type: "faq-section",
          props: {
            title: "Frequently Asked Questions",
            subtitle: "Everything you need to know about our SEO services",
            items: [
              {
                question: "How long does it take to see results from SEO?",
                answer: "Most clients start seeing initial improvements within 1-2 months, with significant results typically appearing around the 3-4 month mark. SEO is a long-term strategy, and results continue to compound over time."
              },
              {
                question: "What services are included in your SEO packages?",
                answer: "Our comprehensive SEO packages include keyword research, technical SEO audits, on-page optimization, content creation, link building, local SEO, and detailed monthly reporting with actionable insights."
              },
              {
                question: "How do you measure SEO success?",
                answer: "We track multiple metrics including organic traffic growth, keyword rankings, conversion rates, backlink quality and quantity, page load speed, and ultimately, your return on investment from organic search."
              }
            ]
          }
        },
        {
          id: "footer-1",
          type: "footer-main",
          props: {
            ctaHeading: "Get Your SEO Strategy",
            ctaDescription: "Ready to dominate search results? Let's discuss how we can help your business grow.",
            ctaButtonText: "Start Your Journey",
            contactLinks: [
              { text: "WhatsApp", url: "https://wa.me/1234567890" },
              { text: "Book a Meeting", url: "https://calendly.com" }
            ],
            legalLinks: [
              { text: "Privacy Policy", url: "/privacy-policy" },
              { text: "Terms of Service", url: "/terms-of-service" },
              { text: "Blog", url: "/blog" }
            ],
            copyrightText: "GO SG CONSULTING. All rights reserved.",
            backgroundColor: "#0f172a"
          }
        }
      ]
    }
  };
  return themeComponentMap[themeSlug] || { components: [] };
}
async function syncThemePages(themeSlug) {
  try {
    const pages = readThemePages(themeSlug);
    if (!pages || pages.length === 0) {
      return {
        success: true,
        synced: 0,
        total: 0,
        message: `No pages found in theme ${themeSlug}`
      };
    }
    let syncedCount = 0;
    const results = [];
    for (const pageData of pages) {
      try {
        const existingPage = await query(`
          SELECT id, page_name, slug, theme_id
          FROM pages
          WHERE slug = $1 AND theme_id = $2
          LIMIT 1
        `, [pageData.slug, themeSlug]);
        const now = (/* @__PURE__ */ new Date()).toISOString();
        let pageId;
        if (existingPage.rows.length > 0) {
          pageId = existingPage.rows[0].id;
          await query(`
            UPDATE pages
            SET page_name = $1,
                meta_title = $2,
                meta_description = $3,
                seo_index = $4,
                status = $5,
                page_type = $6,
                updated_at = $7
            WHERE id = $8
          `, [
            pageData.page_name,
            pageData.meta_title || null,
            pageData.meta_description || null,
            pageData.seo_index !== void 0 ? pageData.seo_index : true,
            pageData.status || "published",
            pageData.page_type || "page",
            now,
            pageId
          ]);
          results.push({
            slug: pageData.slug,
            action: "updated",
            name: pageData.page_name
          });
          syncedCount++;
        } else {
          const insertResult = await query(`
            INSERT INTO pages (page_name, slug, meta_title, meta_description, seo_index, status, page_type, theme_id, tenant_id, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id
          `, [
            pageData.page_name,
            pageData.slug,
            pageData.meta_title || null,
            pageData.meta_description || null,
            pageData.seo_index !== void 0 ? pageData.seo_index : true,
            pageData.status || "published",
            pageData.page_type || "page",
            themeSlug,
            null,
            // null tenant_id for theme template pages - they use the same pages table
            now,
            now
          ]);
          pageId = insertResult.rows[0].id;
          results.push({
            slug: pageData.slug,
            action: "created",
            name: pageData.page_name
          });
          syncedCount++;
        }
        const layoutCheck = await query(`
          SELECT id FROM page_layouts 
          WHERE page_id = $1 AND language = 'default'
        `, [pageId]);
        if (layoutCheck.rows.length === 0) {
          let defaultLayout;
          if (pageData.slug === "/" || pageData.slug === "/home" || pageData.slug === "/index") {
            defaultLayout = getDefaultLayoutForTheme(themeSlug);
            console.log(`[testing] Creating default theme layout for homepage: ${themeSlug}`);
          } else {
            defaultLayout = { components: [] };
            console.log(`[testing] Creating empty layout for page: ${pageData.page_name}`);
          }
          await query(`
            INSERT INTO page_layouts (page_id, language, layout_json, version, updated_at)
            VALUES ($1, 'default', $2, 1, NOW())
            ON CONFLICT (page_id, language) DO NOTHING
          `, [pageId, JSON.stringify(defaultLayout)]);
          console.log(`[testing] Created layout for page ${pageData.page_name} (ID: ${pageId}) with ${defaultLayout.components?.length || 0} components`);
        }
      } catch (error) {
        console.error(`[testing] Error syncing page ${pageData.slug} for theme ${themeSlug}:`, error);
        results.push({
          slug: pageData.slug,
          action: "error",
          error: error.message
        });
      }
    }
    try {
      await ensureDemoTenantHasThemePages(themeSlug, pages);
    } catch (demoError) {
      console.error(`[testing] Error ensuring demo tenant has pages for theme ${themeSlug}:`, demoError);
    }
    return {
      success: true,
      synced: syncedCount,
      total: pages.length,
      results,
      message: `Synced ${syncedCount} page(s) for theme ${themeSlug}`
    };
  } catch (error) {
    console.error(`[testing] Error syncing pages for theme ${themeSlug}:`, error);
    return {
      success: false,
      synced: 0,
      error: error.message,
      message: `Failed to sync pages for theme ${themeSlug}`
    };
  }
}
async function ensureDemoTenantHasThemePages(themeSlug, pages) {
  const demoTenantId = "demo";
  const demoTenantCheck = await query(`
    SELECT id FROM tenants WHERE id = $1
  `, [demoTenantId]);
  if (demoTenantCheck.rows.length === 0) {
    console.log(`[testing] Demo tenant does not exist, skipping page creation`);
    return;
  }
  let createdCount = 0;
  for (const pageData of pages) {
    try {
      const existingPage = await query(`
        SELECT id, page_name, slug
        FROM pages
        WHERE slug = $1 AND theme_id = $2 AND tenant_id = $3
        LIMIT 1
      `, [pageData.slug, themeSlug, demoTenantId]);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      if (existingPage.rows.length === 0) {
        const insertResult = await query(`
          INSERT INTO pages (page_name, slug, meta_title, meta_description, seo_index, status, page_type, theme_id, tenant_id, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id
        `, [
          pageData.page_name,
          pageData.slug,
          pageData.meta_title || null,
          pageData.meta_description || null,
          pageData.seo_index !== void 0 ? pageData.seo_index : true,
          pageData.status || "published",
          pageData.page_type || "page",
          themeSlug,
          demoTenantId,
          now,
          now
        ]);
        const pageId = insertResult.rows[0].id;
        let defaultLayout;
        if (pageData.slug === "/" || pageData.slug === "/home" || pageData.slug === "/index") {
          defaultLayout = getDefaultLayoutForTheme(themeSlug);
        } else {
          defaultLayout = { components: [] };
        }
        await query(`
          INSERT INTO page_layouts (page_id, language, layout_json, version, updated_at)
          VALUES ($1, 'default', $2, 1, NOW())
          ON CONFLICT (page_id, language) DO NOTHING
        `, [pageId, JSON.stringify(defaultLayout)]);
        createdCount++;
        console.log(`[testing] Created page "${pageData.page_name}" (${pageData.slug}) for demo tenant with theme ${themeSlug}`);
      }
    } catch (error) {
      console.error(`[testing] Error creating page ${pageData.slug} for demo tenant:`, error);
    }
  }
  if (createdCount > 0) {
    console.log(`[testing] Created ${createdCount} page(s) for demo tenant with theme ${themeSlug}`);
  }
}
async function syncDemoTenantPagesFromFileSystem(themeSlug = null) {
  const demoTenantId = "demo";
  try {
    const demoTenantCheck = await query(`
      SELECT id FROM tenants WHERE id = $1
    `, [demoTenantId]);
    if (demoTenantCheck.rows.length === 0) {
      console.log(`[testing] Demo tenant does not exist, creating it...`);
      try {
        await query(`
          INSERT INTO tenants (id, name, domain, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `, [demoTenantId, "Demo Tenant", "demo.sparti.ai", true]);
        console.log(`[testing] Created demo tenant`);
      } catch (tenantError) {
        console.error(`[testing] Error creating demo tenant:`, tenantError);
        return {
          success: false,
          error: "Failed to create demo tenant",
          message: tenantError.message
        };
      }
    }
    let totalCreated = 0;
    const themes = themeSlug ? [{ slug: themeSlug }] : getThemesFromFileSystem().filter((t) => !EXCLUDED_THEME_SLUGS.has(t.slug));
    console.log(`[testing] Syncing pages for demo tenant from ${themes.length} theme(s)`);
    for (const theme of themes) {
      try {
        const themePages = getThemePagesFromFileSystem(theme.slug);
        if (themePages.length === 0) {
          console.log(`[testing] No pages found for theme ${theme.slug}`);
          continue;
        }
        await ensureDemoTenantHasThemePages(theme.slug, themePages);
        const createdResult = await query(`
          SELECT COUNT(*) as count
          FROM pages
          WHERE tenant_id = $1 AND theme_id = $2
        `, [demoTenantId, theme.slug]);
        const count = parseInt(createdResult.rows[0].count, 10);
        totalCreated += count;
        console.log(`[testing] Synced ${count} page(s) for theme ${theme.slug}`);
      } catch (themeError) {
        console.error(`[testing] Error syncing pages for theme ${theme.slug}:`, themeError);
      }
    }
    return {
      success: true,
      totalCreated,
      themesProcessed: themes.length,
      message: `Synced ${totalCreated} page(s) for demo tenant from ${themes.length} theme(s)`
    };
  } catch (error) {
    console.error("[testing] Error syncing demo tenant pages from file system:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to sync demo tenant pages"
    };
  }
}
async function getThemeBySlug(slug) {
  try {
    const result = await query(`
      SELECT id, name, slug, description, created_at, updated_at, is_active
      FROM themes
      WHERE slug = $1 OR id = $1
      LIMIT 1
    `, [slug]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("[testing] Error getting theme by slug:", error);
    throw error;
  }
}
async function createTheme(slug, name, description) {
  try {
    const themesDir = path2.join(__dirname4, "../theme");
    if (!fs.existsSync(themesDir)) {
      fs.mkdirSync(themesDir, { recursive: true });
      console.log("[testing] Created themes directory:", themesDir);
    }
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      throw new Error("Invalid slug. Slug must contain only lowercase letters, numbers, and hyphens.");
    }
    if (EXCLUDED_THEME_SLUGS.has(slug)) {
      throw new Error(`Theme slug "${slug}" is reserved.`);
    }
    const themePath = path2.join(themesDir, slug);
    if (fs.existsSync(themePath)) {
      throw new Error(`Theme folder "${slug}" already exists`);
    }
    try {
      const existingTheme = await query(`
        SELECT id, slug FROM themes WHERE slug = $1 OR id = $1 LIMIT 1
      `, [slug]);
      if (existingTheme.rows.length > 0) {
        throw new Error(`Theme "${slug}" already exists in database`);
      }
    } catch (dbError) {
      if (dbError.message.includes("already exists")) {
        throw dbError;
      }
      console.log("[testing] Database check failed, will attempt to create theme anyway:", dbError.message);
    }
    fs.mkdirSync(themePath, { recursive: true });
    console.log("[testing] Created theme folder:", themePath);
    const projectPublicDir = path2.join(__dirname4, "../../public");
    const themePublicDir = path2.join(projectPublicDir, "theme", slug);
    const themeAssetsDir = path2.join(themePublicDir, "assets");
    ensureDir(themeAssetsDir);
    const masterPublicDir = path2.join(projectPublicDir, "theme", "master");
    if (fs.existsSync(masterPublicDir)) {
      copyDirRecursive(masterPublicDir, themePublicDir);
    }
    const indexFile = path2.join(themePath, "index.tsx");
    const themeName = name || formatThemeName(slug);
    const themeComponent = `import React from 'react';

interface TenantLandingProps {
  tenantName?: string;
  tenantSlug?: string;
}

/**
 * Theme: ${themeName}
 * This is a customizable theme component.
 *
 * Asset convention:
 * - Put assets in /public/theme/${slug}/assets
 * - Refer to them with: /theme/${slug}/assets/<file>
 */
const TenantLanding: React.FC<TenantLandingProps> = ({ 
  tenantName = 'Theme', 
  tenantSlug = '${slug}' 
}) => {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 w-full py-6 px-4 md:px-8 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <a href={\`/theme/\${tenantSlug}\`} className="flex items-center z-10">
              <span className="h-12 inline-flex items-center font-bold text-xl">{tenantName}</span>
            </a>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to {tenantName}</h1>
            <p className="text-muted-foreground text-lg">
              Theme scaffold created. Add assets under <code className="bg-muted px-1 rounded">/public/theme/${slug}/assets</code>.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {tenantName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default TenantLanding;
`;
    fs.writeFileSync(indexFile, themeComponent, "utf8");
    console.log("[testing] Created theme index file:", indexFile);
    const themeNameFormatted = name || formatThemeName(slug);
    const themeDescription = description || `Theme: ${themeNameFormatted}`;
    const themeConfig = {
      name: themeNameFormatted,
      description: themeDescription,
      version: "1.0.0",
      is_active: true,
      preview_image: "assets/preview.svg",
      demo_url: `/theme/${slug}`
    };
    const configWritten = writeThemeConfig(slug, themeConfig);
    if (!configWritten) {
      console.warn(`[testing] Failed to create theme.json for ${slug}, but theme folder was created`);
    }
    const pagesConfig = {
      pages: [
        {
          page_name: "Homepage",
          slug: "/",
          meta_title: themeNameFormatted,
          meta_description: themeDescription,
          seo_index: true,
          status: "published",
          page_type: "page"
        }
      ]
    };
    try {
      const pagesPath = path2.join(themePath, "pages.json");
      const pagesContent = JSON.stringify(pagesConfig, null, 2);
      fs.writeFileSync(pagesPath, pagesContent, "utf8");
      console.log(`[testing] Created pages.json for theme: ${slug}`);
    } catch (error) {
      console.warn(`[testing] Failed to create pages.json for ${slug}:`, error);
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    try {
      const result = await query(`
        INSERT INTO themes (id, name, slug, description, created_at, updated_at, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, name, slug, description, created_at, updated_at, is_active
      `, [slug, themeNameFormatted, slug, themeDescription, now, now, true]);
      console.log("[testing] Created theme in database:", result.rows[0]);
      return {
        ...result.rows[0],
        folder_created: true
      };
    } catch (dbError) {
      console.error("[testing] Failed to create theme in database, but folder was created:", dbError);
      return {
        id: slug,
        name: themeNameFormatted,
        slug,
        description: themeDescription,
        is_active: true,
        folder_created: true,
        database_created: false,
        error: dbError.message
      };
    }
  } catch (error) {
    console.error("[testing] Error creating theme:", error);
    throw error;
  }
}
var __filename4, __dirname4, EXCLUDED_THEME_SLUGS;
var init_themeSync = __esm({
  "sparti-cms/services/themeSync.js"() {
    init_db();
    __filename4 = fileURLToPath4(import.meta.url);
    __dirname4 = path2.dirname(__filename4);
    EXCLUDED_THEME_SLUGS = /* @__PURE__ */ new Set([
      // Internal namespaces / removed legacy/base themes
      "template",
      // Keep excluded - old namespace
      // 'master',  // Remove - now a normal theme
      "masterastrowind"
    ]);
  }
});

// sparti-cms/db/modules/pages.js
import { Op as Op3 } from "sequelize";
async function initializeSEOPagesTables() {
  try {
    console.log("Initializing unified pages table...");
    const { runMigrations: runMigrations2 } = await Promise.resolve().then(() => (init_run_migrations(), run_migrations_exports));
    await runMigrations2(["20241202000003-create-page-tables.js"]);
    const { createMasterHeaderFooterPages: createMasterHeaderFooterPages2 } = await Promise.resolve().then(() => (init_create_master_header_footer_pages(), create_master_header_footer_pages_exports));
    await createMasterHeaderFooterPages2();
    const homePageRes = await query(`SELECT id FROM pages WHERE slug = '/' AND tenant_id = 'tenant-gosg'`);
    let homePageId = homePageRes.rows[0]?.id;
    if (!homePageId) {
      const created = await query(`
        INSERT INTO pages (page_name, slug, meta_title, meta_description, seo_index, status, tenant_id)
        VALUES ('Homepage', '/', 'GO SG - Professional SEO Services Singapore', 'Leading SEO agency in Singapore providing comprehensive digital marketing solutions to boost your online presence and drive organic traffic.', true, 'published', 'tenant-gosg')
        RETURNING id
      `);
      homePageId = created.rows[0].id;
    }
    const layoutCheck = await query(`SELECT 1 FROM page_layouts WHERE page_id = $1 AND language = 'default'`, [homePageId]);
    if (layoutCheck.rows.length === 0) {
      const defaultLayout = {
        components: [
          { key: "Header", props: {} },
          { key: "HeroSection", props: { headline: "Rank #1 on Google" } },
          { key: "SEOResultsSection", props: {} },
          { key: "SEOServicesShowcase", props: {} },
          { key: "NewTestimonials", props: {} },
          { key: "FAQAccordion", props: { title: "Frequently Asked Questions" } },
          { key: "BlogSection", props: {} },
          { key: "ContactForm", props: {} },
          { key: "Footer", props: {} }
        ]
      };
      await query(`
        INSERT INTO page_layouts (page_id, language, layout_json, version, updated_at)
        VALUES ($1, 'default', $2, 1, NOW())
        ON CONFLICT (page_id, language) DO NOTHING
      `, [homePageId, JSON.stringify(defaultLayout)]);
    }
    console.log("Unified pages table initialized successfully");
    return true;
  } catch (error) {
    console.error("Pages table initialization failed:", error);
    return false;
  }
}
async function createPage(pageData) {
  try {
    const {
      page_type = "page",
      campaign_source,
      conversion_goal,
      legal_type,
      last_reviewed_date,
      version: version2,
      tenant_id = "tenant-gosg",
      ...commonFields
    } = pageData;
    const page = await Page2.create({
      page_name: commonFields.page_name,
      slug: commonFields.slug,
      meta_title: commonFields.meta_title || null,
      meta_description: commonFields.meta_description || null,
      seo_index: commonFields.seo_index !== void 0 ? commonFields.seo_index : page_type === "legal" ? false : true,
      status: commonFields.status || "draft",
      page_type,
      tenant_id,
      campaign_source: campaign_source || null,
      conversion_goal: conversion_goal || null,
      legal_type: legal_type || null,
      last_reviewed_date: last_reviewed_date || null,
      version: version2 || (page_type === "legal" ? "1.0" : null)
    });
    return page.toJSON();
  } catch (error) {
    console.error("Error creating page:", error);
    throw error;
  }
}
async function getPages(pageType = null, tenantId = "tenant-gosg") {
  try {
    const whereClause = {
      [Op3.or]: [
        { tenant_id: tenantId },
        { tenant_id: null }
      ]
    };
    if (pageType) {
      whereClause.page_type = pageType;
    }
    const pages = await Page2.findAll({
      where: whereClause,
      order: [
        [Page2.sequelize.literal(`CASE WHEN tenant_id = '${tenantId}' THEN 0 ELSE 1 END`), "ASC"],
        ["page_type", "ASC"],
        ["created_at", "DESC"]
      ]
    });
    return pages.map((page) => page.toJSON());
  } catch (error) {
    console.error("Error fetching pages:", error);
    throw error;
  }
}
async function getPage(pageId, tenantId = "tenant-gosg") {
  try {
    const page = await Page2.findOne({
      where: {
        id: pageId,
        [Op3.or]: [
          { tenant_id: tenantId },
          { tenant_id: null }
        ]
      },
      order: [
        [Page2.sequelize.literal(`CASE WHEN tenant_id = '${tenantId}' THEN 0 ELSE 1 END`), "ASC"]
      ]
    });
    return page ? page.toJSON() : null;
  } catch (error) {
    console.error("Error fetching page:", error);
    throw error;
  }
}
async function updatePage(pageId, pageData, tenantId = "tenant-gosg") {
  try {
    const existingPage = await Page2.findByPk(pageId);
    if (!existingPage) {
      throw new Error("Page not found");
    }
    if (!existingPage.tenant_id) {
      throw new Error("Cannot update master page. Master pages (tenant_id = NULL) are shared across all tenants.");
    }
    const {
      campaign_source,
      conversion_goal,
      legal_type,
      last_reviewed_date,
      version: version2,
      ...commonFields
    } = pageData;
    const updateData = {};
    if (commonFields.page_name !== void 0) updateData.page_name = commonFields.page_name;
    if (commonFields.slug !== void 0) updateData.slug = commonFields.slug;
    if (commonFields.meta_title !== void 0) updateData.meta_title = commonFields.meta_title;
    if (commonFields.meta_description !== void 0) updateData.meta_description = commonFields.meta_description;
    if (commonFields.seo_index !== void 0) updateData.seo_index = commonFields.seo_index;
    if (commonFields.status !== void 0) updateData.status = commonFields.status;
    if (campaign_source !== void 0) updateData.campaign_source = campaign_source;
    if (conversion_goal !== void 0) updateData.conversion_goal = conversion_goal;
    if (legal_type !== void 0) updateData.legal_type = legal_type;
    if (last_reviewed_date !== void 0) updateData.last_reviewed_date = last_reviewed_date;
    if (version2 !== void 0) updateData.version = version2;
    const [updatedCount] = await Page2.update(updateData, {
      where: {
        id: pageId,
        tenant_id: tenantId
      }
    });
    if (updatedCount === 0) {
      throw new Error("Page not found or is a master page (cannot update master pages)");
    }
    const updatedPage = await Page2.findByPk(pageId);
    return updatedPage.toJSON();
  } catch (error) {
    console.error("Error updating page:", error);
    throw error;
  }
}
async function deletePage(pageId, tenantId = "tenant-gosg") {
  try {
    const existingPage = await Page2.findByPk(pageId);
    if (!existingPage) {
      throw new Error("Page not found");
    }
    if (!existingPage.tenant_id) {
      throw new Error("Cannot delete master page. Master pages (tenant_id = NULL) are shared across all tenants.");
    }
    const deletedCount = await Page2.destroy({
      where: {
        id: pageId,
        tenant_id: tenantId
      }
    });
    if (deletedCount === 0) {
      throw new Error("Page not found or is a master page (cannot delete master pages)");
    }
    return deletedCount > 0;
  } catch (error) {
    console.error("Error deleting page:", error);
    throw error;
  }
}
async function getAllPagesWithTypes(tenantId = "tenant-gosg", themeId = null) {
  try {
    console.log(`[testing] getAllPagesWithTypes: Called with tenantId=${tenantId}, themeId=${themeId || "null"}`);
    let queryText = `
      SELECT 
        id,
        page_name,
        slug,
        meta_title,
        meta_description,
        seo_index,
        status,
        page_type,
        theme_id,
        tenant_id,
        created_at,
        updated_at,
        campaign_source,
        conversion_goal,
        legal_type,
        last_reviewed_date,
        version
      FROM pages
      WHERE (tenant_id = $1 OR tenant_id IS NULL)
    `;
    const params = [tenantId];
    if (themeId === "custom" || themeId === null) {
      queryText += ` AND (theme_id IS NULL OR theme_id = 'custom')`;
      console.log(`[testing] getAllPagesWithTypes: Filtering for custom theme (theme_id IS NULL OR 'custom')`);
    } else if (themeId) {
      queryText += ` AND theme_id = $2`;
      params.push(themeId);
      console.log(`[testing] getAllPagesWithTypes: Filtering for theme_id = ${themeId}`);
    }
    queryText += ` ORDER BY 
      CASE WHEN tenant_id = $1 THEN 0 ELSE 1 END,
      page_type, 
      created_at DESC`;
    console.log(`[testing] getAllPagesWithTypes: Executing query: ${queryText}`);
    console.log(`[testing] getAllPagesWithTypes: Query params:`, params);
    const result = await query(queryText, params);
    const dbPages = result.rows;
    console.log(`[testing] getAllPagesWithTypes: Database returned ${dbPages.length} page(s)`);
    if (dbPages.length > 0) {
      const themeIds = dbPages.map((p) => p.theme_id).filter((v, i, a) => a.indexOf(v) === i);
      console.log(`[testing] getAllPagesWithTypes: Theme IDs in database results: ${themeIds.join(", ")}`);
    }
    const hasMatchingPages = dbPages.length > 0 && (!themeId || themeId === "custom" || dbPages.some((page) => {
      if (themeId === "custom" || themeId === null) {
        return !page.theme_id || page.theme_id === "custom";
      }
      return page.theme_id === themeId;
    }));
    console.log(`[testing] getAllPagesWithTypes: tenantId === 'demo': ${tenantId === "demo"}`);
    console.log(`[testing] getAllPagesWithTypes: dbPages.length === 0: ${dbPages.length === 0}`);
    console.log(`[testing] getAllPagesWithTypes: hasMatchingPages: ${hasMatchingPages}`);
    if (tenantId === "demo" && (!hasMatchingPages || dbPages.length === 0)) {
      console.log(`[testing] Demo tenant: No matching pages in database, fetching from file system (theme: ${themeId || "all"})`);
      try {
        const { getThemesFromFileSystem: getThemesFromFileSystem2, getThemePagesFromFileSystem: getThemePagesFromFileSystem2, syncDemoTenantPagesFromFileSystem: syncDemoTenantPagesFromFileSystem2 } = await Promise.resolve().then(() => (init_themeSync(), themeSync_exports));
        const allThemePages = [];
        if (themeId && themeId !== "custom") {
          console.log(`[testing] Demo tenant: Fetching pages for specific theme: ${themeId}`);
          try {
            const themePages = getThemePagesFromFileSystem2(themeId);
            console.log(`[testing] Demo tenant: getThemePagesFromFileSystem returned:`, themePages ? `${themePages.length} page(s)` : "null/undefined");
            if (themePages && Array.isArray(themePages) && themePages.length > 0) {
              const validPages = themePages.filter((page) => {
                const isValid = page && page.page_name && page.slug;
                if (!isValid) {
                  console.warn(`[testing] Demo tenant: Skipping invalid page:`, page);
                }
                return isValid;
              });
              const pagesWithThemeId = validPages.map((page) => ({
                ...page,
                theme_id: themeId,
                tenant_id: "demo",
                from_filesystem: true,
                // Ensure required fields are present
                id: page.id || `theme-${themeId}-${page.slug.replace(/^\/+|\/+$/g, "").replace(/\//g, "-") || "homepage"}`,
                page_type: page.page_type || "page",
                status: page.status || "published"
              }));
              allThemePages.push(...pagesWithThemeId);
              console.log(`[testing] Demo tenant: Found ${pagesWithThemeId.length} valid page(s) from theme ${themeId}`);
              syncDemoTenantPagesFromFileSystem2(themeId).catch((syncError) => {
                console.error(`[testing] Failed to sync pages to database (non-critical):`, syncError);
              });
            } else {
              console.warn(`[testing] Demo tenant: No pages found in file system for theme ${themeId} (result: ${themePages ? "empty array" : "null/undefined"})`);
            }
          } catch (themeError) {
            console.error(`[testing] Error getting pages for theme ${themeId}:`, themeError);
            console.error(`[testing] Error stack:`, themeError.stack);
          }
        } else {
          console.log("[testing] Demo tenant: Fetching pages from all themes");
          const themes = getThemesFromFileSystem2();
          console.log(`[testing] Demo tenant: Found ${themes.length} theme(s) in file system`);
          for (const theme of themes) {
            try {
              const themePages = getThemePagesFromFileSystem2(theme.slug);
              console.log(`[testing] Demo tenant: getThemePagesFromFileSystem for ${theme.slug} returned:`, themePages ? `${themePages.length} page(s)` : "null/undefined");
              if (themePages && Array.isArray(themePages) && themePages.length > 0) {
                const validPages = themePages.filter((page) => {
                  const isValid = page && page.page_name && page.slug;
                  if (!isValid) {
                    console.warn(`[testing] Demo tenant: Skipping invalid page from theme ${theme.slug}:`, page);
                  }
                  return isValid;
                });
                const pagesWithThemeId = validPages.map((page) => ({
                  ...page,
                  theme_id: theme.slug,
                  tenant_id: "demo",
                  from_filesystem: true,
                  // Ensure required fields are present
                  id: page.id || `theme-${theme.slug}-${page.slug.replace(/^\/+|\/+$/g, "").replace(/\//g, "-") || "homepage"}`,
                  page_type: page.page_type || "page",
                  status: page.status || "published"
                }));
                allThemePages.push(...pagesWithThemeId);
                console.log(`[testing] Demo tenant: Found ${pagesWithThemeId.length} valid page(s) from theme ${theme.slug}`);
              } else {
                console.log(`[testing] Demo tenant: No pages found in file system for theme ${theme.slug} (result: ${themePages ? "empty array" : "null/undefined"})`);
              }
            } catch (themeError) {
              console.error(`[testing] Error getting pages for theme ${theme.slug}:`, themeError);
              console.error(`[testing] Error stack:`, themeError.stack);
            }
          }
          if (allThemePages.length > 0) {
            syncDemoTenantPagesFromFileSystem2(null).catch((syncError) => {
              console.error(`[testing] Failed to sync pages to database (non-critical):`, syncError);
            });
          }
        }
        console.log(`[testing] Demo tenant: Total ${allThemePages.length} page(s) from file system`);
        if (allThemePages.length === 0) {
          console.warn(`[testing] Demo tenant: No pages found in file system. Check if themes have pages.json files.`);
        }
        return allThemePages;
      } catch (fsError) {
        console.error("[testing] Error fetching pages from file system for demo tenant:", fsError);
        return [];
      }
    }
    return dbPages;
  } catch (error) {
    console.error("[testing] Error fetching all pages with types:", error);
    if (tenantId === "demo") {
      console.log(`[testing] Demo tenant: Database error, trying file system fallback (theme: ${themeId || "all"})`);
      try {
        const { getThemesFromFileSystem: getThemesFromFileSystem2, getThemePagesFromFileSystem: getThemePagesFromFileSystem2, syncDemoTenantPagesFromFileSystem: syncDemoTenantPagesFromFileSystem2 } = await Promise.resolve().then(() => (init_themeSync(), themeSync_exports));
        const allThemePages = [];
        if (themeId && themeId !== "custom") {
          console.log(`[testing] Demo tenant: Fetching pages for specific theme: ${themeId}`);
          try {
            const themePages = getThemePagesFromFileSystem2(themeId);
            console.log(`[testing] Demo tenant: getThemePagesFromFileSystem returned:`, themePages ? `${themePages.length} page(s)` : "null/undefined");
            if (themePages && Array.isArray(themePages) && themePages.length > 0) {
              const validPages = themePages.filter((page) => {
                const isValid = page && page.page_name && page.slug;
                if (!isValid) {
                  console.warn(`[testing] Demo tenant: Skipping invalid page:`, page);
                }
                return isValid;
              });
              const pagesWithThemeId = validPages.map((page) => ({
                ...page,
                theme_id: themeId,
                tenant_id: "demo",
                from_filesystem: true,
                // Ensure required fields are present
                id: page.id || `theme-${themeId}-${page.slug.replace(/^\/+|\/+$/g, "").replace(/\//g, "-") || "homepage"}`,
                page_type: page.page_type || "page",
                status: page.status || "published"
              }));
              allThemePages.push(...pagesWithThemeId);
              console.log(`[testing] Demo tenant: Found ${pagesWithThemeId.length} valid page(s) from theme ${themeId}`);
              syncDemoTenantPagesFromFileSystem2(themeId).catch((syncError) => {
                console.error(`[testing] Failed to sync pages to database (non-critical):`, syncError);
              });
            }
          } catch (themeError) {
            console.error(`[testing] Error getting pages for theme ${themeId}:`, themeError);
            console.error(`[testing] Error stack:`, themeError.stack);
          }
        } else {
          console.log("[testing] Demo tenant: Fetching pages from all themes");
          const themes = getThemesFromFileSystem2();
          console.log(`[testing] Demo tenant: Found ${themes.length} theme(s) in file system`);
          for (const theme of themes) {
            try {
              const themePages = getThemePagesFromFileSystem2(theme.slug);
              console.log(`[testing] Demo tenant: getThemePagesFromFileSystem for ${theme.slug} returned:`, themePages ? `${themePages.length} page(s)` : "null/undefined");
              if (themePages && Array.isArray(themePages) && themePages.length > 0) {
                const validPages = themePages.filter((page) => {
                  const isValid = page && page.page_name && page.slug;
                  if (!isValid) {
                    console.warn(`[testing] Demo tenant: Skipping invalid page from theme ${theme.slug}:`, page);
                  }
                  return isValid;
                });
                const pagesWithThemeId = validPages.map((page) => ({
                  ...page,
                  theme_id: theme.slug,
                  tenant_id: "demo",
                  from_filesystem: true,
                  // Ensure required fields are present
                  id: page.id || `theme-${theme.slug}-${page.slug.replace(/^\/+|\/+$/g, "").replace(/\//g, "-") || "homepage"}`,
                  page_type: page.page_type || "page",
                  status: page.status || "published"
                }));
                allThemePages.push(...pagesWithThemeId);
                console.log(`[testing] Demo tenant: Found ${pagesWithThemeId.length} valid page(s) from theme ${theme.slug}`);
              }
            } catch (themeError) {
              console.error(`[testing] Error getting pages for theme ${theme.slug}:`, themeError);
              console.error(`[testing] Error stack:`, themeError.stack);
            }
          }
          if (allThemePages.length > 0) {
            syncDemoTenantPagesFromFileSystem2(null).catch((syncError) => {
              console.error(`[testing] Failed to sync pages to database (non-critical):`, syncError);
            });
          }
        }
        console.log(`[testing] Demo tenant: Fallback successful, returning ${allThemePages.length} page(s) from file system`);
        if (allThemePages.length === 0) {
          console.warn(`[testing] Demo tenant: No pages found in file system. Check if themes have pages.json files.`);
        }
        return allThemePages;
      } catch (fsError) {
        console.error("[testing] File system fallback also failed:", fsError);
        throw error;
      }
    }
    throw error;
  }
}
async function updatePageSlug(pageId, pageType, newSlug, oldSlug, tenantId = "tenant-gosg") {
  const client = await connection_default.connect();
  try {
    await client.query("BEGIN");
    if (!newSlug.startsWith("/")) {
      newSlug = "/" + newSlug;
    }
    const existingSlug = await client.query(`
      SELECT slug FROM pages WHERE slug = $1 AND tenant_id = $2 AND id != $3
    `, [newSlug, tenantId, pageId]);
    if (existingSlug.rows.length > 0) {
      throw new Error(`Slug '${newSlug}' already exists`);
    }
    const updateResult = await client.query(`
      UPDATE pages 
      SET slug = $1, updated_at = NOW() 
      WHERE id = $2 AND tenant_id = $3 AND page_type = $4
      RETURNING *
    `, [newSlug, pageId, tenantId, pageType]);
    if (updateResult.rows.length === 0) {
      throw new Error(`Page not found or page type mismatch`);
    }
    if (oldSlug === "/blog" && newSlug !== "/blog") {
      console.log("Blog slug changed, blog post adaptation needed");
      await logSlugChange(pageId, pageType, oldSlug, newSlug, "Blog slug changed - manual blog post update required");
    }
    await client.query("COMMIT");
    return updateResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating slug:", error);
    throw error;
  } finally {
    client.release();
  }
}
function validateSlug(slug) {
  slug = slug.trim();
  if (!slug.startsWith("/")) {
    slug = "/" + slug;
  }
  const slugRegex = /^\/[a-z0-9\-\/]*$/;
  if (!slugRegex.test(slug)) {
    throw new Error("Slug can only contain lowercase letters, numbers, hyphens, and slashes");
  }
  if (slug.includes("//")) {
    throw new Error("Slug cannot contain double slashes");
  }
  if (slug.length > 1 && slug.endsWith("/")) {
    slug = slug.slice(0, -1);
  }
  return slug;
}
async function logSlugChange(pageId, pageType, oldSlug, newSlug, notes = null) {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS slug_change_log (
        id SERIAL PRIMARY KEY,
        page_id INTEGER NOT NULL,
        page_type VARCHAR(20) NOT NULL,
        old_slug VARCHAR(255) NOT NULL,
        new_slug VARCHAR(255) NOT NULL,
        notes TEXT,
        changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    await query(`
      INSERT INTO slug_change_log (page_id, page_type, old_slug, new_slug, notes)
      VALUES ($1, $2, $3, $4, $5)
    `, [pageId, pageType, oldSlug, newSlug, notes]);
  } catch (error) {
    console.error("Error logging slug change:", error);
  }
}
async function getSlugChangeHistory(pageId = null, pageType = null) {
  try {
    let whereClause = "";
    let params = [];
    if (pageId && pageType) {
      whereClause = "WHERE page_id = $1 AND page_type = $2";
      params = [pageId, pageType];
    } else if (pageType) {
      whereClause = "WHERE page_type = $1";
      params = [pageType];
    }
    const result = await query(`
      SELECT * FROM slug_change_log 
      ${whereClause}
      ORDER BY changed_at DESC
    `, params);
    return result.rows;
  } catch (error) {
    console.error("Error fetching slug change history:", error);
    return [];
  }
}
async function updatePageName(pageId, pageType, newName, tenantId = "tenant-gosg") {
  try {
    const result = await query(`
      UPDATE pages 
      SET page_name = $1, updated_at = NOW() 
      WHERE id = $2 AND tenant_id = $3 AND page_type = $4
    `, [newName, pageId, tenantId, pageType]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error updating page name:", error);
    throw error;
  }
}
async function toggleSEOIndex(pageId, pageType, currentIndex, tenantId = "tenant-gosg") {
  try {
    const newIndex = !currentIndex;
    const result = await query(`
      UPDATE pages 
      SET seo_index = $1, updated_at = NOW() 
      WHERE id = $2 AND tenant_id = $3 AND page_type = $4
    `, [newIndex, pageId, tenantId, pageType]);
    return newIndex;
  } catch (error) {
    console.error("Error toggling SEO index:", error);
    throw error;
  }
}
async function getPageWithLayout(pageId, tenantId = "tenant-gosg") {
  try {
    const pageResult = await query(`
      SELECT 
        id,
        page_name,
        slug,
        meta_title,
        meta_description,
        seo_index,
        status,
        page_type,
        tenant_id,
        created_at,
        updated_at
      FROM pages
      WHERE id = $1 AND (tenant_id = $2 OR tenant_id IS NULL)
      ORDER BY CASE WHEN tenant_id = $2 THEN 0 ELSE 1 END
      LIMIT 1
    `, [pageId, tenantId]);
    if (pageResult.rows.length === 0) {
      return null;
    }
    const page = pageResult.rows[0];
    const layoutResult = await query(`
      SELECT layout_json, version, updated_at
      FROM page_layouts
      WHERE page_id = $1 AND language = 'default'
      ORDER BY version DESC
      LIMIT 1
    `, [pageId]);
    if (layoutResult.rows.length > 0) {
      page.layout = layoutResult.rows[0].layout_json;
    }
    return page;
  } catch (error) {
    console.error("Error fetching page with layout:", error);
    throw error;
  }
}
async function updatePageData(pageId, pageName, metaTitle, metaDescription, seoIndex, tenantId = "tenant-gosg") {
  try {
    const checkResult = await query(`SELECT tenant_id FROM pages WHERE id = $1`, [pageId]);
    if (checkResult.rows.length === 0) {
      console.log(`Page ${pageId} not found`);
      return false;
    }
    if (!checkResult.rows[0].tenant_id) {
      throw new Error("Cannot update master page. Master pages (tenant_id = NULL) are shared across all tenants.");
    }
    const result = await query(`
      UPDATE pages 
      SET page_name = $1, meta_title = $2, meta_description = $3, seo_index = $4, updated_at = NOW()
      WHERE id = $5 AND tenant_id = $6
    `, [pageName, metaTitle, metaDescription, seoIndex, pageId, tenantId]);
    if (result.rowCount > 0) {
      return true;
    }
    console.log(`Page ${pageId} not found for tenant ${tenantId}`);
    return false;
  } catch (error) {
    console.error("Error updating page data:", error);
    throw error;
  }
}
async function ensurePageExists(pageId, tenantId, themeId = null) {
  console.log("[testing] ========== ensurePageExists ==========");
  console.log("[testing] Parameters:", {
    pageId,
    pageIdType: typeof pageId,
    pageIdIsNumeric: /^\d+$/.test(String(pageId)),
    tenantId,
    themeId
  });
  let pageCheck;
  if (themeId) {
    console.log("[testing] Checking page with theme_id...");
    pageCheck = await query(`
      SELECT id FROM pages WHERE id::text = $1 AND tenant_id = $2 AND theme_id = $3
    `, [pageId, tenantId, themeId]);
    console.log("[testing] Query result (text match):", {
      rowsFound: pageCheck.rows.length,
      foundPageIds: pageCheck.rows.map((r) => r.id)
    });
    if (pageCheck.rows.length === 0 && /^\d+$/.test(String(pageId))) {
      console.log("[testing] Retrying with integer pageId...");
      pageCheck = await query(`
        SELECT id FROM pages WHERE id = $1 AND tenant_id = $2 AND theme_id = $3
      `, [parseInt(pageId), tenantId, themeId]);
      console.log("[testing] Query result (integer match):", {
        rowsFound: pageCheck.rows.length,
        foundPageIds: pageCheck.rows.map((r) => r.id)
      });
    }
  } else {
    console.log("[testing] Checking page without theme_id...");
    pageCheck = await query(`
      SELECT id FROM pages WHERE id::text = $1 AND tenant_id = $2
    `, [pageId, tenantId]);
    console.log("[testing] Query result (text match, no theme):", {
      rowsFound: pageCheck.rows.length,
      foundPageIds: pageCheck.rows.map((r) => r.id)
    });
    if (pageCheck.rows.length === 0 && /^\d+$/.test(String(pageId))) {
      console.log("[testing] Retrying with integer pageId (no theme)...");
      pageCheck = await query(`
        SELECT id FROM pages WHERE id = $1 AND tenant_id = $2
      `, [parseInt(pageId), tenantId]);
      console.log("[testing] Query result (integer match, no theme):", {
        rowsFound: pageCheck.rows.length,
        foundPageIds: pageCheck.rows.map((r) => r.id)
      });
    }
  }
  if (pageCheck.rows.length === 0) {
    console.error("[testing] Page not found:", {
      pageId,
      tenantId,
      themeId
    });
    return false;
  }
  console.log("[testing] Page exists:", {
    pageId: pageCheck.rows[0].id,
    found: true
  });
  return true;
}
async function ensureLanguageColumnExists() {
  try {
    await query(`
      ALTER TABLE page_layouts 
      ADD COLUMN IF NOT EXISTS language VARCHAR(50) NOT NULL DEFAULT 'default'
    `);
  } catch (error) {
    if (error.code !== "42701" && !error.message.includes("already exists")) {
      console.log("[testing] Note: Could not ensure language column exists:", error.message);
    }
  }
}
async function cleanupDuplicateLayouts(pageId, language) {
  await query(`
    WITH ranked_layouts AS (
      SELECT id, 
             ROW_NUMBER() OVER (PARTITION BY page_id, language ORDER BY updated_at DESC, id DESC) as rn
      FROM page_layouts
      WHERE page_id = $1 AND language = $2
    )
    DELETE FROM page_layouts
    WHERE page_id = $1 AND language = $2
    AND id IN (
      SELECT id FROM ranked_layouts WHERE rn > 1
    )
  `, [pageId, language]);
}
async function ensureCompositeUniqueConstraintExists(language) {
  try {
    const constraintCheck = await query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'page_layouts' 
      AND constraint_type = 'UNIQUE'
      AND constraint_name = 'page_layouts_page_id_language_unique'
    `);
    if (constraintCheck.rows.length === 0) {
      try {
        await query(`
          ALTER TABLE page_layouts 
          ADD CONSTRAINT page_layouts_page_id_language_unique UNIQUE (page_id, language)
        `);
        console.log("[testing] Added composite unique constraint at runtime");
      } catch (constraintError) {
        if (constraintError.code === "23505") {
          console.log("[testing] Cleaning up duplicates before adding constraint...");
          const duplicates = await query(`
            SELECT page_id, COUNT(*) as count
            FROM page_layouts
            GROUP BY page_id, language
            HAVING COUNT(*) > 1
          `);
          for (const dup of duplicates.rows) {
            await cleanupDuplicateLayouts(dup.page_id, language);
          }
          await query(`
            ALTER TABLE page_layouts 
            ADD CONSTRAINT page_layouts_page_id_language_unique UNIQUE (page_id, language)
          `);
        }
      }
    }
  } catch (error) {
    console.log("[testing] Note: Could not ensure composite unique constraint exists:", error.message);
  }
}
async function updateExistingLayout(pageId, layoutJson, language) {
  console.log("[testing] ========== updateExistingLayout ==========");
  console.log("[testing] Parameters:", {
    pageId,
    pageIdType: typeof pageId,
    language,
    layoutJsonType: typeof layoutJson,
    layoutJsonKeys: layoutJson ? Object.keys(layoutJson) : [],
    componentsCount: layoutJson?.components ? Array.isArray(layoutJson.components) ? layoutJson.components.length : "not array" : "no components"
  });
  let normalizedPageId = pageId;
  if (typeof pageId === "string" && /^\d+$/.test(pageId)) {
    normalizedPageId = parseInt(pageId, 10);
    console.log("[testing] Normalized pageId from string to integer:", normalizedPageId);
  } else if (typeof pageId !== "number") {
    console.warn("[testing] pageId is not a number or numeric string:", pageId);
  }
  const completeLayoutJson = layoutJson && typeof layoutJson === "object" ? layoutJson : { components: [] };
  const jsonString = JSON.stringify(completeLayoutJson);
  console.log("[testing] JSON stringified length:", jsonString.length);
  console.log("[testing] JSON stringified preview (first 200 chars):", jsonString.substring(0, 200));
  const updateResult = await query(`
    UPDATE page_layouts 
    SET 
      layout_json = $2::jsonb,
      version = version + 1,
      updated_at = NOW()
    WHERE page_id = $1 AND language = $3
  `, [normalizedPageId, jsonString, language]);
  console.log("[testing] UPDATE query result:", {
    rowCount: updateResult.rowCount,
    command: updateResult.command,
    rowsAffected: updateResult.rowCount > 0 ? "YES" : "NO",
    normalizedPageId
  });
  if (updateResult.rowCount === 0) {
    console.warn("[testing] UPDATE matched 0 rows - layout may not exist for this page_id and language");
    if (normalizedPageId !== pageId) {
      console.log("[testing] Retrying UPDATE with original pageId format...");
      const retryResult = await query(`
        UPDATE page_layouts 
        SET 
          layout_json = $2::jsonb,
          version = version + 1,
          updated_at = NOW()
        WHERE page_id::text = $1 AND language = $3
      `, [String(pageId), jsonString, language]);
      console.log("[testing] Retry UPDATE result:", {
        rowCount: retryResult.rowCount,
        rowsAffected: retryResult.rowCount > 0 ? "YES" : "NO"
      });
      return retryResult.rowCount > 0;
    }
  }
  return updateResult.rowCount > 0;
}
async function insertNewLayout(pageId, layoutJson, language) {
  console.log("[testing] ========== insertNewLayout ==========");
  console.log("[testing] Parameters:", {
    pageId,
    pageIdType: typeof pageId,
    language,
    layoutJsonType: typeof layoutJson,
    layoutJsonKeys: layoutJson ? Object.keys(layoutJson) : [],
    componentsCount: layoutJson?.components ? Array.isArray(layoutJson.components) ? layoutJson.components.length : "not array" : "no components"
  });
  let normalizedPageId = pageId;
  if (typeof pageId === "string" && /^\d+$/.test(pageId)) {
    normalizedPageId = parseInt(pageId, 10);
    console.log("[testing] Normalized pageId from string to integer:", normalizedPageId);
  } else if (typeof pageId !== "number") {
    console.warn("[testing] pageId is not a number or numeric string:", pageId);
  }
  const completeLayoutJson = layoutJson && typeof layoutJson === "object" ? layoutJson : { components: [] };
  const jsonString = JSON.stringify(completeLayoutJson);
  console.log("[testing] JSON stringified length:", jsonString.length);
  console.log("[testing] JSON stringified preview (first 200 chars):", jsonString.substring(0, 200));
  try {
    const insertResult = await query(`
      INSERT INTO page_layouts (page_id, language, layout_json, version, updated_at)
      VALUES ($1, $2, $3::jsonb, 1, NOW())
      RETURNING id, page_id, language, version
    `, [normalizedPageId, language, jsonString]);
    console.log("[testing] INSERT query result:", {
      success: true,
      insertedId: insertResult.rows[0]?.id,
      pageId: insertResult.rows[0]?.page_id,
      language: insertResult.rows[0]?.language,
      version: insertResult.rows[0]?.version,
      normalizedPageId
    });
  } catch (insertError) {
    console.error("[testing] INSERT query failed:", {
      error: insertError.message,
      code: insertError.code,
      constraint: insertError.constraint,
      normalizedPageId
    });
    throw insertError;
  }
}
function extractTranslatableText(obj, path6 = "", result = {}) {
  if (obj === null || obj === void 0) {
    return result;
  }
  const skipFields = ["id", "src", "link", "url", "image", "images", "avatar", "logo", "phoneNumber", "email", "date", "rating", "version", "sort_order", "sortOrder", "level", "required", "value", "type", "key"];
  if (typeof obj === "string") {
    if (obj.trim().length > 0 && !obj.startsWith("http") && !obj.startsWith("/") && !obj.match(/^[a-zA-Z0-9_-]+$/)) {
      result[path6] = obj;
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      extractTranslatableText(item, path6 ? `${path6}[${index}]` : `[${index}]`, result);
    });
  } else if (typeof obj === "object") {
    Object.keys(obj).forEach((key) => {
      if (skipFields.includes(key.toLowerCase())) {
        return;
      }
      const newPath = path6 ? `${path6}.${key}` : key;
      extractTranslatableText(obj[key], newPath, result);
    });
  }
  return result;
}
function injectTranslatedText(obj, translations, path6 = "") {
  if (obj === null || obj === void 0) {
    return obj;
  }
  if (typeof obj === "string") {
    if (translations[path6] !== void 0) {
      return translations[path6];
    }
    return obj;
  } else if (Array.isArray(obj)) {
    return obj.map((item, index) => {
      const itemPath = path6 ? `${path6}[${index}]` : `[${index}]`;
      return injectTranslatedText(item, translations, itemPath);
    });
  } else if (typeof obj === "object") {
    const result = {};
    Object.keys(obj).forEach((key) => {
      const newPath = path6 ? `${path6}.${key}` : key;
      result[key] = injectTranslatedText(obj[key], translations, newPath);
    });
    return result;
  }
  return obj;
}
async function getConfiguredLanguages2(tenantId) {
  const languagesResult = await query(`
    SELECT setting_value 
    FROM site_settings 
    WHERE setting_key = 'site_content_languages' 
    AND tenant_id = $1
  `, [tenantId]);
  if (languagesResult.rows.length === 0 || !languagesResult.rows[0].setting_value) {
    return [];
  }
  const rawValue = languagesResult.rows[0].setting_value;
  if (rawValue.includes(",")) {
    return rawValue.split(",").filter((lang) => lang.trim() !== "");
  } else if (rawValue.trim() !== "") {
    return [rawValue.trim()];
  }
  return [];
}
async function getDefaultLanguage2(tenantId) {
  const defaultLanguageResult = await query(`
    SELECT setting_value 
    FROM site_settings 
    WHERE setting_key = 'site_language' 
    AND tenant_id = $1
  `, [tenantId]);
  return defaultLanguageResult.rows.length > 0 ? defaultLanguageResult.rows[0].setting_value : "default";
}
async function getTargetLanguages2(tenantId) {
  const allLanguages = await getConfiguredLanguages2(tenantId);
  if (allLanguages.length === 0) {
    return [];
  }
  const defaultLanguage = await getDefaultLanguage2(tenantId);
  return allLanguages.filter((lang) => lang !== defaultLanguage && lang !== "default");
}
async function translateTextFields(textMap, targetLanguage, defaultLanguage) {
  const translations = {};
  const textPaths = Object.keys(textMap);
  for (const textPath of textPaths) {
    const originalText = textMap[textPath];
    try {
      const translatedText = await translateText(originalText, targetLanguage, defaultLanguage);
      translations[textPath] = translatedText;
      console.log(`[testing] Translated ${textPath}: "${originalText.substring(0, 50)}..." -> "${translatedText.substring(0, 50)}..."`);
    } catch (error) {
      console.error(`[testing] Error translating text at path ${textPath}:`, error);
      translations[textPath] = originalText;
    }
  }
  return translations;
}
async function translateLayoutToLanguage(pageId, layoutJson, targetLanguage, defaultLanguage, textMap) {
  try {
    console.log(`[testing] Translating to ${targetLanguage}...`);
    const translations = await translateTextFields(textMap, targetLanguage, defaultLanguage);
    const translatedLayout = injectTranslatedText(layoutJson, translations);
    await upsertPageLayout(pageId, translatedLayout, targetLanguage);
    console.log(`[testing] Successfully translated and saved layout for language ${targetLanguage}`);
  } catch (error) {
    console.error(`[testing] Error translating to ${targetLanguage}:`, error);
    throw error;
  }
}
async function translateLayoutToAllLanguages(pageId, layoutJson, tenantId) {
  try {
    console.log(`[testing] Starting translation for page ${pageId} and tenant ${tenantId}`);
    const targetLanguages = await getTargetLanguages2(tenantId);
    if (targetLanguages.length === 0) {
      console.log(`[testing] No target languages to translate to, skipping translation`);
      return;
    }
    console.log(`[testing] Translating to ${targetLanguages.length} languages: ${targetLanguages.join(", ")}`);
    const textMap = extractTranslatableText(layoutJson);
    const textPaths = Object.keys(textMap);
    if (textPaths.length === 0) {
      console.log(`[testing] No translatable text found in layout, skipping translation`);
      return;
    }
    console.log(`[testing] Found ${textPaths.length} translatable text fields`);
    const defaultLanguage = await getDefaultLanguage2(tenantId);
    for (const targetLanguage of targetLanguages) {
      try {
        await translateLayoutToLanguage(pageId, layoutJson, targetLanguage, defaultLanguage, textMap);
      } catch (error) {
        console.error(`[testing] Failed to translate to ${targetLanguage}, continuing with other languages`);
      }
    }
    console.log(`[testing] Completed translation process for page ${pageId}`);
  } catch (error) {
    console.error(`[testing] Error in translateLayoutToAllLanguages:`, error);
  }
}
async function upsertPageLayout(pageId, layoutJson, language, tenantId = null) {
  console.log("[testing] ========== upsertPageLayout ==========");
  console.log("[testing] Parameters:", {
    pageId,
    pageIdType: typeof pageId,
    language,
    tenantId,
    layoutJsonType: typeof layoutJson,
    componentsCount: layoutJson?.components ? Array.isArray(layoutJson.components) ? layoutJson.components.length : "not array" : "no components"
  });
  let normalizedPageId = pageId;
  if (typeof pageId === "string" && /^\d+$/.test(pageId)) {
    normalizedPageId = parseInt(pageId, 10);
    console.log("[testing] Normalized pageId from string to integer:", normalizedPageId);
  } else if (typeof pageId !== "number") {
    console.warn("[testing] pageId is not a number or numeric string:", pageId);
  }
  let operationSuccessful = false;
  console.log("[testing] Step 1: Attempting to update existing layout...");
  const wasUpdated = await updateExistingLayout(normalizedPageId, layoutJson, language);
  if (wasUpdated) {
    console.log("[testing] Step 1: Update successful");
    operationSuccessful = true;
  } else {
    console.log("[testing] Step 1: Update failed, checking if layout exists...");
    let existingCheck = await query(`
      SELECT id, page_id, language, version FROM page_layouts WHERE page_id = $1 AND language = $2
    `, [normalizedPageId, language]);
    if (existingCheck.rows.length === 0 && normalizedPageId !== pageId) {
      console.log("[testing] Step 2: Retrying existing check with original pageId format...");
      existingCheck = await query(`
        SELECT id, page_id, language, version FROM page_layouts WHERE page_id::text = $1 AND language = $2
      `, [String(pageId), language]);
    }
    console.log("[testing] Step 2: Existing layout check:", {
      rowsFound: existingCheck.rows.length,
      existingLayouts: existingCheck.rows.map((r) => ({
        id: r.id,
        page_id: r.page_id,
        language: r.language,
        version: r.version
      }))
    });
    if (existingCheck.rows.length === 0) {
      console.log("[testing] Step 2: No existing layout found, inserting new layout...");
      await insertNewLayout(normalizedPageId, layoutJson, language);
      operationSuccessful = true;
      console.log("[testing] Step 2: Insert successful");
    } else {
      console.log("[testing] Step 2: Layout exists but update failed, retrying update...");
      const actualPageId = existingCheck.rows[0].page_id;
      console.log("[testing] Step 2: Using actual page_id from database:", actualPageId);
      const wasUpdatedRetry = await updateExistingLayout(actualPageId, layoutJson, language);
      operationSuccessful = wasUpdatedRetry;
      console.log("[testing] Step 2: Retry update result:", wasUpdatedRetry);
    }
  }
  console.log("[testing] upsertPageLayout result:", {
    operationSuccessful,
    pageId,
    normalizedPageId,
    language
  });
  if (operationSuccessful && language === "default" && tenantId) {
    console.log("[testing] Triggering translation to other languages...");
    translateLayoutToAllLanguages(normalizedPageId, layoutJson, tenantId).catch((error) => {
      console.error(`[testing] Error in background translation for page ${normalizedPageId}:`, error);
    });
  }
  return operationSuccessful;
}
async function updatePageLayout(pageId, layoutJson, tenantId, language = "default", themeId = null) {
  console.log("[testing] ========== updatePageLayout ==========");
  console.log("[testing] Parameters:", {
    pageId,
    pageIdType: typeof pageId,
    tenantId,
    language,
    themeId,
    layoutJsonType: typeof layoutJson,
    componentsCount: layoutJson?.components ? Array.isArray(layoutJson.components) ? layoutJson.components.length : "not array" : "no components"
  });
  if (!tenantId) {
    const error = new Error("Tenant ID is required");
    error.code = "VALIDATION_ERROR";
    console.error("[testing] Validation failed: Tenant ID is required");
    throw error;
  }
  console.log("[testing] Step 1: Validating page exists...");
  const pageExists = await ensurePageExists(pageId, tenantId, themeId);
  if (!pageExists) {
    console.error("[testing] Step 1: Page validation failed - page does not exist");
    return false;
  }
  console.log("[testing] Step 1: Page validation passed");
  try {
    console.log("[testing] Step 2: Ensuring database schema is up to date...");
    await ensureLanguageColumnExists();
    await ensureCompositeUniqueConstraintExists(language);
    console.log("[testing] Step 2: Database schema check complete");
    console.log("[testing] Step 3: Upserting page layout...");
    const upsertResult = await upsertPageLayout(pageId, layoutJson, language, tenantId);
    console.log("[testing] Step 3: Upsert result:", upsertResult);
    if (!upsertResult) {
      console.error("[testing] Step 3: Upsert failed");
      return false;
    }
    console.log("[testing] Step 4: Verifying save by querying database...");
    const verifyQuery = await query(`
      SELECT id, page_id, language, version, updated_at, 
             jsonb_typeof(layout_json) as json_type,
             jsonb_array_length(layout_json->'components') as components_count
      FROM page_layouts 
      WHERE page_id = $1 AND language = $2
    `, [pageId, language]);
    if (verifyQuery.rows.length > 0) {
      console.log("[testing] Step 4: Verification successful:", {
        layoutId: verifyQuery.rows[0].id,
        pageId: verifyQuery.rows[0].page_id,
        language: verifyQuery.rows[0].language,
        version: verifyQuery.rows[0].version,
        updatedAt: verifyQuery.rows[0].updated_at,
        jsonType: verifyQuery.rows[0].json_type,
        componentsCount: verifyQuery.rows[0].components_count
      });
    } else {
      console.error("[testing] Step 4: Verification failed - layout not found in database after save");
    }
    console.log("[testing] ========== updatePageLayout completed successfully ==========");
    return true;
  } catch (error) {
    console.error("[testing] ========== updatePageLayout error ==========");
    console.error("[testing] Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
}
async function savePageVersion(pageId, tenantId, pageData, layoutJson, userId = null, comment = null) {
  try {
    const versionResult = await query(`
      SELECT COALESCE(MAX(version_number), 0) + 1 as next_version
      FROM page_versions
      WHERE page_id = $1 AND tenant_id = $2
    `, [pageId, tenantId]);
    const nextVersion = parseInt(versionResult.rows[0]?.next_version || 1);
    const result = await query(`
      INSERT INTO page_versions (
        page_id, tenant_id, version_number,
        page_name, slug, meta_title, meta_description, seo_index, status, page_type,
        campaign_source, conversion_goal, legal_type, last_reviewed_date,
        layout_json, created_by, comment, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
      RETURNING *
    `, [
      pageId,
      tenantId,
      nextVersion,
      pageData.page_name || "",
      pageData.slug || "",
      pageData.meta_title || null,
      pageData.meta_description || null,
      pageData.seo_index !== void 0 ? pageData.seo_index : true,
      pageData.status || "draft",
      pageData.page_type || "page",
      pageData.campaign_source || null,
      pageData.conversion_goal || null,
      pageData.legal_type || null,
      pageData.last_reviewed_date || null,
      JSON.stringify(layoutJson),
      userId,
      comment
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("[testing] Error saving page version:", error);
    throw error;
  }
}
var Page2;
var init_pages = __esm({
  "sparti-cms/db/modules/pages.js"() {
    init_connection();
    init_connection();
    init_googleTranslationService();
    init_models();
    ({ Page: Page2 } = models_default);
  }
});

// sparti-cms/db/modules/ecommerce.js
function handleTableError(error) {
  if (error.code === "42P01" || error.message?.includes("does not exist")) {
    console.error("[testing] PERN-Store tables do not exist. Run migration: npm run sequelize:migrate");
    throw new Error("Ecommerce tables not found. Please run database migrations.");
  }
  throw error;
}
async function getProductsWithDetails(tenantId, filters = {}) {
  try {
    let sql = `
      SELECT 
        p.id,
        p.name,
        p.handle as slug,
        p.status,
        p.featured_image as image_url,
        p.description,
        p.created_at,
        p.updated_at,
        COALESCE(SUM(pv.inventory_quantity), 0)::integer as inventory_total,
        COUNT(pv.id)::integer as variant_count,
        pc.name as category_name
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      LEFT JOIN product_category_relations pcr ON p.id = pcr.product_id
      LEFT JOIN product_categories pc ON pcr.category_id = pc.id
      WHERE p.tenant_id = $1
    `;
    const params = [tenantId];
    if (filters.status) {
      sql += ` AND p.status = $${params.length + 1}`;
      params.push(filters.status);
    }
    if (filters.search) {
      sql += ` AND (p.name ILIKE $${params.length + 1} OR p.description ILIKE $${params.length + 1})`;
      params.push(`%${filters.search}%`);
    }
    sql += ` GROUP BY p.id, p.name, p.handle, p.status, p.featured_image, p.description, p.created_at, p.updated_at, pc.name`;
    sql += ` ORDER BY p.created_at DESC`;
    if (filters.limit) {
      sql += ` LIMIT $${params.length + 1}`;
      params.push(filters.limit);
    }
    const result = await query(sql, params);
    return result.rows;
  } catch (error) {
    console.error("[testing] Error getting products with details:", error);
    return handleTableError(error);
  }
}
async function getProducts(tenantId, filters = {}) {
  try {
    let sql = `
      SELECT product_id, name, slug, price, description, image_url, 
             created_at, updated_at
      FROM pern_products
      WHERE tenant_id = $1
    `;
    const params = [tenantId];
    if (filters.search) {
      sql += ` AND (name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`;
      params.push(`%${filters.search}%`);
    }
    sql += ` ORDER BY created_at DESC`;
    if (filters.limit) {
      sql += ` LIMIT $${params.length + 1}`;
      params.push(filters.limit);
    }
    const result = await query(sql, params);
    return result.rows;
  } catch (error) {
    console.error("[testing] Error getting products:", error);
    return handleTableError(error);
  }
}
async function getProductFromProductsTable(productId, tenantId) {
  try {
    const result = await query(`
      SELECT 
        id as product_id,
        name,
        handle as slug,
        status,
        featured_image as image_url,
        description,
        created_at,
        updated_at,
        COALESCE(
          (SELECT MIN(pv.price) FROM product_variants pv WHERE pv.product_id = id),
          0
        ) as price
      FROM products
      WHERE id = $1 AND tenant_id = $2
    `, [productId, tenantId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("[testing] Error getting product from products table:", error);
    return handleTableError(error);
  }
}
async function getProduct(productId, tenantId) {
  try {
    const result = await query(`
      SELECT product_id, name, slug, price, description, image_url, 
             created_at, updated_at
      FROM pern_products
      WHERE product_id = $1 AND tenant_id = $2
    `, [productId, tenantId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("[testing] Error getting product:", error);
    return handleTableError(error);
  }
}
async function getProductBySlug(slug, tenantId) {
  try {
    const result = await query(`
      SELECT product_id, name, slug, price, description, image_url, 
             created_at, updated_at
      FROM pern_products
      WHERE slug = $1 AND tenant_id = $2
    `, [slug, tenantId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("[testing] Error getting product by slug:", error);
    return handleTableError(error);
  }
}
async function createProduct(productData, tenantId) {
  try {
    const { name, slug, price, description, image_url, is_subscription, subscription_frequency } = productData;
    const hasSubscriptionColumns = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'pern_products' 
      AND column_name = 'is_subscription'
    `).then((result) => result.rows.length > 0).catch(() => false);
    if (hasSubscriptionColumns) {
      const result = await query(`
        INSERT INTO pern_products (name, slug, price, description, image_url, tenant_id, is_subscription, subscription_frequency)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING product_id, name, slug, price, description, image_url, 
                  is_subscription, subscription_frequency, created_at, updated_at
      `, [name, slug, price, description || "", image_url || null, tenantId, is_subscription || false, subscription_frequency || null]);
      return result.rows[0];
    } else {
      const descriptionValue = description || "";
      const result = await query(`
        INSERT INTO pern_products (name, slug, price, description, image_url, tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING product_id, name, slug, price, description, image_url, 
                  created_at, updated_at
      `, [name, slug, price, descriptionValue, image_url || null, tenantId]);
      return result.rows[0];
    }
  } catch (error) {
    console.error("[testing] Error creating product:", error);
    return handleTableError(error);
  }
}
async function updateProduct(productId, productData, tenantId) {
  try {
    const { name, slug, price, description, image_url } = productData;
    const updates = [];
    const params = [];
    let paramIndex = 1;
    if (name !== void 0) {
      updates.push(`name = $${paramIndex++}`);
      params.push(name);
    }
    if (slug !== void 0) {
      updates.push(`slug = $${paramIndex++}`);
      params.push(slug);
    }
    if (price !== void 0) {
      updates.push(`price = $${paramIndex++}`);
      params.push(price);
    }
    if (description !== void 0) {
      updates.push(`description = $${paramIndex++}`);
      params.push(description);
    }
    if (image_url !== void 0) {
      updates.push(`image_url = $${paramIndex++}`);
      params.push(image_url);
    }
    if (updates.length === 0) {
      return await getProduct(productId, tenantId);
    }
    params.push(productId, tenantId);
    const result = await query(`
      UPDATE pern_products
      SET ${updates.join(", ")}, updated_at = NOW()
      WHERE product_id = $${paramIndex++} AND tenant_id = $${paramIndex++}
      RETURNING product_id, name, slug, price, description, image_url, 
                created_at, updated_at
    `, params);
    return result.rows[0] || null;
  } catch (error) {
    console.error("[testing] Error updating product:", error);
    return handleTableError(error);
  }
}
async function deleteProduct(productId, tenantId) {
  try {
    const result = await query(`
      DELETE FROM pern_products
      WHERE product_id = $1 AND tenant_id = $2
    `, [productId, tenantId]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("[testing] Error deleting product:", error);
    return handleTableError(error);
  }
}
async function getCartById(cartId, tenantId) {
  try {
    const cartResult = await query(`
      SELECT id, user_id FROM pern_cart
      WHERE id = $1 AND tenant_id = $2
      LIMIT 1
    `, [cartId, tenantId]);
    if (cartResult.rows.length === 0) {
      return null;
    }
    const cart = cartResult.rows[0];
    const itemsResult = await query(`
      SELECT 
        ci.id,
        ci.cart_id,
        ci.product_id,
        ci.quantity,
        p.name as product_name,
        p.slug as product_slug,
        p.price,
        p.image_url
      FROM pern_cart_item ci
      JOIN pern_products p ON ci.product_id = p.product_id
      WHERE ci.cart_id = $1 AND ci.tenant_id = $2
      ORDER BY ci.created_at DESC
    `, [cartId, tenantId]);
    return {
      id: cart.id,
      user_id: cart.user_id,
      items: itemsResult.rows
    };
  } catch (error) {
    console.error("[testing] Error getting cart by ID:", error);
    return handleTableError(error);
  }
}
async function getOrCreateGuestCart(tenantId) {
  try {
    let cartResult = await query(`
      SELECT id FROM pern_cart
      WHERE user_id IS NULL AND tenant_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [tenantId]);
    let cartId;
    if (cartResult.rows.length === 0) {
      const newCart = await query(`
        INSERT INTO pern_cart (user_id, tenant_id)
        VALUES (NULL, $1)
        RETURNING id
      `, [tenantId]);
      cartId = newCart.rows[0].id;
    } else {
      cartId = cartResult.rows[0].id;
    }
    const itemsResult = await query(`
      SELECT 
        ci.id,
        ci.cart_id,
        ci.product_id,
        ci.quantity,
        p.name as product_name,
        p.slug as product_slug,
        p.price,
        p.image_url
      FROM pern_cart_item ci
      JOIN pern_products p ON ci.product_id = p.product_id
      WHERE ci.cart_id = $1 AND ci.tenant_id = $2
      ORDER BY ci.created_at DESC
    `, [cartId, tenantId]);
    return {
      id: cartId,
      user_id: null,
      items: itemsResult.rows
    };
  } catch (error) {
    console.error("[testing] Error getting/creating guest cart:", error);
    return handleTableError(error);
  }
}
async function associateCartWithUser(cartId, userId, tenantId) {
  try {
    const result = await query(`
      UPDATE pern_cart
      SET user_id = $1
      WHERE id = $2 AND tenant_id = $3 AND user_id IS NULL
      RETURNING id, user_id
    `, [userId, cartId, tenantId]);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  } catch (error) {
    console.error("[testing] Error associating cart with user:", error);
    return handleTableError(error);
  }
}
async function getCart(userId, tenantId) {
  try {
    let cartResult = await query(`
      SELECT id FROM pern_cart
      WHERE user_id = $1 AND tenant_id = $2
      LIMIT 1
    `, [userId, tenantId]);
    let cartId;
    if (cartResult.rows.length === 0) {
      const newCart = await query(`
        INSERT INTO pern_cart (user_id, tenant_id)
        VALUES ($1, $2)
        RETURNING id
      `, [userId, tenantId]);
      cartId = newCart.rows[0].id;
    } else {
      cartId = cartResult.rows[0].id;
    }
    const itemsResult = await query(`
      SELECT 
        ci.id,
        ci.cart_id,
        ci.product_id,
        ci.quantity,
        p.name as product_name,
        p.slug as product_slug,
        p.price,
        p.image_url
      FROM pern_cart_item ci
      JOIN pern_products p ON ci.product_id = p.product_id
      WHERE ci.cart_id = $1 AND ci.tenant_id = $2
      ORDER BY ci.created_at DESC
    `, [cartId, tenantId]);
    return {
      id: cartId,
      user_id: userId,
      items: itemsResult.rows
    };
  } catch (error) {
    console.error("[testing] Error getting cart:", error);
    return handleTableError(error);
  }
}
async function addToCartById(cartId, productId, quantity, tenantId) {
  try {
    const cartCheck = await query(`
      SELECT id FROM pern_cart
      WHERE id = $1 AND tenant_id = $2
    `, [cartId, tenantId]);
    if (cartCheck.rows.length === 0) {
      throw new Error("Cart not found");
    }
    const existing = await query(`
      SELECT id, quantity FROM pern_cart_item
      WHERE cart_id = $1 AND product_id = $2 AND tenant_id = $3
    `, [cartId, productId, tenantId]);
    if (existing.rows.length > 0) {
      const result = await query(`
        UPDATE pern_cart_item
        SET quantity = quantity + $1, updated_at = NOW()
        WHERE id = $2 AND tenant_id = $3
        RETURNING id, cart_id, product_id, quantity
      `, [quantity, existing.rows[0].id, tenantId]);
      return result.rows[0];
    } else {
      const result = await query(`
        INSERT INTO pern_cart_item (cart_id, product_id, quantity, tenant_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, cart_id, product_id, quantity
      `, [cartId, productId, quantity, tenantId]);
      return result.rows[0];
    }
  } catch (error) {
    console.error("[testing] Error adding to cart by ID:", error);
    return handleTableError(error);
  }
}
async function addToCart(userId, productId, quantity, tenantId) {
  try {
    const cart = await getCart(userId, tenantId);
    const cartId = cart.id;
    const existing = await query(`
      SELECT id, quantity FROM pern_cart_item
      WHERE cart_id = $1 AND product_id = $2 AND tenant_id = $3
    `, [cartId, productId, tenantId]);
    if (existing.rows.length > 0) {
      const result = await query(`
        UPDATE pern_cart_item
        SET quantity = quantity + $1, updated_at = NOW()
        WHERE id = $2 AND tenant_id = $3
        RETURNING id, cart_id, product_id, quantity
      `, [quantity, existing.rows[0].id, tenantId]);
      return result.rows[0];
    } else {
      const result = await query(`
        INSERT INTO pern_cart_item (cart_id, product_id, quantity, tenant_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, cart_id, product_id, quantity
      `, [cartId, productId, quantity, tenantId]);
      return result.rows[0];
    }
  } catch (error) {
    console.error("[testing] Error adding to cart:", error);
    return handleTableError(error);
  }
}
async function updateCartItem(cartItemId, quantity, tenantId) {
  try {
    if (quantity <= 0) {
      return await removeFromCart(cartItemId, tenantId);
    }
    const result = await query(`
      UPDATE pern_cart_item
      SET quantity = $1, updated_at = NOW()
      WHERE id = $2 AND tenant_id = $3
      RETURNING id, cart_id, product_id, quantity
    `, [quantity, cartItemId, tenantId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("[testing] Error updating cart item:", error);
    return handleTableError(error);
  }
}
async function removeFromCart(cartItemId, tenantId) {
  try {
    const result = await query(`
      DELETE FROM pern_cart_item
      WHERE id = $1 AND tenant_id = $2
    `, [cartItemId, tenantId]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("[testing] Error removing from cart:", error);
    return handleTableError(error);
  }
}
async function getOrders(tenantId, filters = {}) {
  try {
    let sql = `
      SELECT 
        o.order_id,
        o.user_id,
        o.status,
        o.date,
        o.amount,
        o.total,
        o.ref,
        o.payment_method,
        u.email as user_email,
        u.first_name || ' ' || u.last_name as user_name
      FROM pern_orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.tenant_id = $1
    `;
    const params = [tenantId];
    if (filters.status) {
      sql += ` AND o.status = $${params.length + 1}`;
      params.push(filters.status);
    }
    if (filters.userId) {
      sql += ` AND o.user_id = $${params.length + 1}`;
      params.push(filters.userId);
    }
    if (filters.dateFrom) {
      sql += ` AND o.date >= $${params.length + 1}`;
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      sql += ` AND o.date <= $${params.length + 1}`;
      params.push(filters.dateTo);
    }
    sql += ` ORDER BY o.date DESC`;
    if (filters.limit) {
      sql += ` LIMIT $${params.length + 1}`;
      params.push(filters.limit);
    }
    const result = await query(sql, params);
    return result.rows;
  } catch (error) {
    console.error("[testing] Error getting orders:", error);
    return handleTableError(error);
  }
}
async function getOrder(orderId, tenantId) {
  try {
    const orderResult = await query(`
      SELECT 
        o.order_id,
        o.user_id,
        o.status,
        o.date,
        o.amount,
        o.total,
        o.ref,
        o.payment_method,
        u.email as user_email,
        u.first_name || ' ' || u.last_name as user_name
      FROM pern_orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.order_id = $1 AND o.tenant_id = $2
    `, [orderId, tenantId]);
    if (orderResult.rows.length === 0) {
      return null;
    }
    const order = orderResult.rows[0];
    const itemsResult = await query(`
      SELECT 
        oi.id,
        oi.order_id,
        oi.product_id,
        oi.quantity,
        p.name as product_name,
        p.slug as product_slug,
        p.price
      FROM pern_order_item oi
      JOIN pern_products p ON oi.product_id = p.product_id
      WHERE oi.order_id = $1 AND oi.tenant_id = $2
    `, [orderId, tenantId]);
    return {
      ...order,
      items: itemsResult.rows
    };
  } catch (error) {
    console.error("[testing] Error getting order:", error);
    return handleTableError(error);
  }
}
async function createOrder(orderData, tenantId) {
  const {
    user_id,
    status = "pending",
    amount,
    total,
    ref,
    payment_method,
    items,
    guest_email,
    guest_name
  } = orderData;
  await query("BEGIN");
  try {
    console.log("[testing] Creating order with data:", {
      user_id,
      status,
      amount,
      total,
      ref,
      payment_method,
      tenantId,
      guest_email: guest_email || null,
      guest_name: guest_name || null,
      itemsCount: items?.length || 0
    });
    const orderResult = await query(`
      INSERT INTO pern_orders (user_id, status, amount, total, ref, payment_method, tenant_id, guest_email, guest_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING order_id, user_id, status, date, amount, total, ref, payment_method, guest_email, guest_name
    `, [user_id, status, amount, total, ref, payment_method, tenantId, guest_email || null, guest_name || null]);
    const order = orderResult.rows[0];
    const orderId = order.order_id;
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await query(`
          INSERT INTO pern_order_item (order_id, product_id, quantity, tenant_id)
          VALUES ($1, $2, $3, $4)
        `, [orderId, item.product_id, item.quantity, tenantId]);
      }
    }
    await query("COMMIT");
    return await getOrder(orderId, tenantId);
  } catch (error) {
    try {
      await query("ROLLBACK");
    } catch (rollbackError) {
      console.error("[testing] Error during rollback:", rollbackError);
      try {
        await query("BEGIN");
        await query("ROLLBACK");
      } catch (clearError) {
        console.error("[testing] Error clearing transaction state:", clearError);
      }
    }
    console.error("[testing] Error creating order:", error);
    console.error("[testing] Error details:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
      table: error.table,
      column: error.column
    });
    throw handleTableError(error);
  }
}
async function updateOrderStatus(orderId, status, tenantId) {
  try {
    const result = await query(`
      UPDATE pern_orders
      SET status = $1, updated_at = NOW()
      WHERE order_id = $2 AND tenant_id = $3
      RETURNING order_id, user_id, status, date, amount, total, ref, payment_method
    `, [status, orderId, tenantId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("[testing] Error updating order status:", error);
    return handleTableError(error);
  }
}
async function getReviews(productId, tenantId) {
  try {
    const result = await query(`
      SELECT 
        r.id,
        r.product_id,
        r.user_id,
        r.content,
        r.rating,
        r.date,
        u.email as user_email,
        u.first_name || ' ' || u.last_name as user_name
      FROM pern_reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1 AND r.tenant_id = $2
      ORDER BY r.date DESC
    `, [productId, tenantId]);
    return result.rows;
  } catch (error) {
    console.error("[testing] Error getting reviews:", error);
    return handleTableError(error);
  }
}
async function createReview(reviewData, tenantId) {
  try {
    const { product_id, user_id, content, rating } = reviewData;
    const existing = await query(`
      SELECT id FROM pern_reviews
      WHERE product_id = $1 AND user_id = $2 AND tenant_id = $3
    `, [product_id, user_id, tenantId]);
    if (existing.rows.length > 0) {
      throw new Error("User has already reviewed this product");
    }
    const result = await query(`
      INSERT INTO pern_reviews (product_id, user_id, content, rating, tenant_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, product_id, user_id, content, rating, date
    `, [product_id, user_id, content, rating, tenantId]);
    return result.rows[0];
  } catch (error) {
    console.error("[testing] Error creating review:", error);
    if (error.message === "User has already reviewed this product") {
      throw error;
    }
    return handleTableError(error);
  }
}
async function deleteReview(reviewId, tenantId) {
  try {
    const result = await query(`
      DELETE FROM pern_reviews
      WHERE id = $1 AND tenant_id = $2
    `, [reviewId, tenantId]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("[testing] Error deleting review:", error);
    return handleTableError(error);
  }
}
var init_ecommerce = __esm({
  "sparti-cms/db/modules/ecommerce.js"() {
    init_db();
  }
});

// sparti-cms/db/modules/content.js
async function getPosts() {
  try {
    const result = await query(`
      SELECT 
        p.*,
        COALESCE(
          JSON_AGG(
            CASE 
              WHEN t.id IS NOT NULL THEN 
                JSON_BUILD_OBJECT(
                  'id', t.id,
                  'name', t.name,
                  'taxonomy', tt.taxonomy
                )
              ELSE NULL 
            END
          ) FILTER (WHERE t.id IS NOT NULL), 
          '[]'
        ) as terms
      FROM posts p
      LEFT JOIN term_relationships tr ON p.id = tr.object_id
      LEFT JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.id
      LEFT JOIN terms t ON tt.term_id = t.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    return result.rows;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
}
async function getPost(id) {
  try {
    const result = await query(`
      SELECT 
        p.*,
        COALESCE(
          JSON_AGG(
            CASE 
              WHEN t.id IS NOT NULL THEN 
                JSON_BUILD_OBJECT(
                  'id', t.id,
                  'name', t.name,
                  'taxonomy', tt.taxonomy
                )
              ELSE NULL 
            END
          ) FILTER (WHERE t.id IS NOT NULL), 
          '[]'
        ) as terms
      FROM posts p
      LEFT JOIN term_relationships tr ON p.id = tr.object_id
      LEFT JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.id
      LEFT JOIN terms t ON tt.term_id = t.id
      WHERE p.id = $1
      GROUP BY p.id
    `, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
}
async function createPost(data) {
  try {
    const postResult = await query(`
      INSERT INTO posts (
        title, slug, content, excerpt, status, post_type, author_id,
        meta_title, meta_description, meta_keywords, canonical_url,
        og_title, og_description, og_image, twitter_title, twitter_description, twitter_image,
        published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `, [
      data.title,
      data.slug,
      data.content || "",
      data.excerpt || "",
      data.status || "draft",
      data.post_type || "post",
      data.author_id,
      data.meta_title || "",
      data.meta_description || "",
      data.meta_keywords || "",
      data.canonical_url || "",
      data.og_title || "",
      data.og_description || "",
      data.og_image || "",
      data.twitter_title || "",
      data.twitter_description || "",
      data.twitter_image || "",
      data.published_at
    ]);
    const post = postResult.rows[0];
    if (data.categories && data.categories.length > 0) {
      for (const categoryId of data.categories) {
        const taxonomyResult = await query(`
          SELECT id FROM term_taxonomy WHERE term_id = $1 AND taxonomy = 'category'
        `, [categoryId]);
        if (taxonomyResult.rows.length > 0) {
          await query(`
            INSERT INTO term_relationships (object_id, term_taxonomy_id)
            VALUES ($1, $2)
          `, [post.id, taxonomyResult.rows[0].id]);
        }
      }
    }
    if (data.tags && data.tags.length > 0) {
      for (const tagId of data.tags) {
        const taxonomyResult = await query(`
          SELECT id FROM term_taxonomy WHERE term_id = $1 AND taxonomy = 'post_tag'
        `, [tagId]);
        if (taxonomyResult.rows.length > 0) {
          await query(`
            INSERT INTO term_relationships (object_id, term_taxonomy_id)
            VALUES ($1, $2)
          `, [post.id, taxonomyResult.rows[0].id]);
        }
      }
    }
    return await getPost(post.id);
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}
async function updatePost(id, data) {
  try {
    const postResult = await query(`
      UPDATE posts SET
        title = COALESCE($2, title),
        slug = COALESCE($3, slug),
        content = COALESCE($4, content),
        excerpt = COALESCE($5, excerpt),
        status = COALESCE($6, status),
        author_id = COALESCE($7, author_id),
        meta_title = COALESCE($8, meta_title),
        meta_description = COALESCE($9, meta_description),
        meta_keywords = COALESCE($10, meta_keywords),
        og_title = COALESCE($11, og_title),
        og_description = COALESCE($12, og_description),
        twitter_title = COALESCE($13, twitter_title),
        twitter_description = COALESCE($14, twitter_description),
        published_at = COALESCE($15, published_at),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id, data.title, data.slug, data.content, data.excerpt, data.status, data.author_id, data.meta_title, data.meta_description, data.meta_keywords, data.og_title, data.og_description, data.twitter_title, data.twitter_description, data.published_at]);
    if (postResult.rows.length === 0) {
      throw new Error("Post not found");
    }
    await query(`DELETE FROM term_relationships WHERE object_id = $1`, [id]);
    if (data.categories && data.categories.length > 0) {
      for (const categoryId of data.categories) {
        const taxonomyResult = await query(`
          SELECT id FROM term_taxonomy WHERE term_id = $1 AND taxonomy = 'category'
        `, [categoryId]);
        if (taxonomyResult.rows.length > 0) {
          await query(`
            INSERT INTO term_relationships (object_id, term_taxonomy_id)
            VALUES ($1, $2)
          `, [id, taxonomyResult.rows[0].id]);
        }
      }
    }
    if (data.tags && data.tags.length > 0) {
      for (const tagId of data.tags) {
        const taxonomyResult = await query(`
          SELECT id FROM term_taxonomy WHERE term_id = $1 AND taxonomy = 'post_tag'
        `, [tagId]);
        if (taxonomyResult.rows.length > 0) {
          await query(`
            INSERT INTO term_relationships (object_id, term_taxonomy_id)
            VALUES ($1, $2)
          `, [id, taxonomyResult.rows[0].id]);
        }
      }
    }
    return await getPost(id);
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
}
async function deletePost(id) {
  try {
    await query(`DELETE FROM term_relationships WHERE object_id = $1`, [id]);
    const result = await query(`DELETE FROM posts WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      throw new Error("Post not found");
    }
    return result.rows[0];
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}
var init_content = __esm({
  "sparti-cms/db/modules/content.js"() {
    init_connection();
  }
});

// sparti-cms/db/modules/terms.js
async function getTerms() {
  try {
    const result = await query(`
      SELECT t.*, tt.taxonomy, tt.description as taxonomy_description
      FROM terms t
      LEFT JOIN term_taxonomy tt ON t.id = tt.term_id
      ORDER BY t.name
    `);
    return result.rows;
  } catch (error) {
    console.error("Error fetching terms:", error);
    throw error;
  }
}
async function getTerm(id) {
  try {
    const result = await query(`
      SELECT t.*, tt.taxonomy, tt.description as taxonomy_description
      FROM terms t
      LEFT JOIN term_taxonomy tt ON t.id = tt.term_id
      WHERE t.id = $1
    `, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error fetching term:", error);
    throw error;
  }
}
async function createTerm(data) {
  try {
    const termResult = await query(`
      INSERT INTO terms (name, slug, description, meta_title, meta_description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      data.name,
      data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      data.description || "",
      data.meta_title || `${data.name} - GO SG Digital Marketing`,
      data.meta_description || data.description || `Learn about ${data.name} with GO SG's expert insights and strategies.`
    ]);
    const term = termResult.rows[0];
    if (data.taxonomy) {
      await query(`
        INSERT INTO term_taxonomy (term_id, taxonomy, description)
        VALUES ($1, $2, $3)
      `, [term.id, data.taxonomy, data.description || `${data.taxonomy} for ${data.name} content`]);
    }
    return term;
  } catch (error) {
    console.error("Error creating term:", error);
    throw error;
  }
}
async function updateTerm(id, data) {
  try {
    const result = await query(`
      UPDATE terms SET
        name = COALESCE($2, name),
        slug = COALESCE($3, slug),
        description = COALESCE($4, description),
        meta_title = COALESCE($5, meta_title),
        meta_description = COALESCE($6, meta_description),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id, data.name, data.slug, data.description, data.meta_title, data.meta_description]);
    if (result.rows.length === 0) {
      throw new Error("Term not found");
    }
    return result.rows[0];
  } catch (error) {
    console.error("Error updating term:", error);
    throw error;
  }
}
async function deleteTerm(id) {
  try {
    await query(`DELETE FROM term_relationships WHERE term_taxonomy_id IN (SELECT id FROM term_taxonomy WHERE term_id = $1)`, [id]);
    await query(`DELETE FROM term_taxonomy WHERE term_id = $1`, [id]);
    const result = await query(`DELETE FROM terms WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      throw new Error("Term not found");
    }
    return result.rows[0];
  } catch (error) {
    console.error("Error deleting term:", error);
    throw error;
  }
}
var init_terms = __esm({
  "sparti-cms/db/modules/terms.js"() {
    init_connection();
  }
});

// sparti-cms/db/modules/categories.js
async function getCategories() {
  try {
    const categories = await Category3.findAll({
      attributes: {
        include: [
          [
            Category3.sequelize.literal(`(
              SELECT COUNT(DISTINCT pc.post_id)
              FROM post_categories pc
              WHERE pc.category_id = "Category".id
            )`),
            "post_count"
          ]
        ]
      },
      order: [["name", "ASC"]]
    });
    for (const category of categories) {
      const count = await PostCategory3.count({
        where: { category_id: category.id }
      });
      await category.update({ post_count: count });
    }
    return categories.map((cat) => cat.toJSON());
  } catch (error) {
    console.error("[testing] Error fetching categories:", error);
    throw error;
  }
}
async function getCategory(id) {
  try {
    const category = await Category3.findByPk(id, {
      include: [
        {
          model: Category3,
          as: "parent",
          attributes: ["id", "name", "slug"]
        },
        {
          model: Category3,
          as: "children",
          attributes: ["id", "name", "slug"]
        }
      ]
    });
    if (!category) return null;
    const count = await PostCategory3.count({
      where: { category_id: category.id }
    });
    await category.update({ post_count: count });
    return category.toJSON();
  } catch (error) {
    console.error("[testing] Error fetching category:", error);
    throw error;
  }
}
async function createCategory(data) {
  try {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
    const category = await Category3.create({
      name: data.name,
      slug,
      description: data.description || "",
      parent_id: data.parent_id || null,
      meta_title: data.meta_title || `${data.name} - GO SG Digital Marketing`,
      meta_description: data.meta_description || data.description || `Learn about ${data.name} with GO SG's expert insights and strategies.`,
      post_count: 0
    });
    console.log("[testing] Category created:", category.id);
    return category.toJSON();
  } catch (error) {
    console.error("[testing] Error creating category:", error);
    throw error;
  }
}
async function updateCategory(id, data) {
  try {
    const category = await Category3.findByPk(id);
    if (!category) {
      throw new Error("Category not found");
    }
    await category.update({
      name: data.name !== void 0 ? data.name : category.name,
      slug: data.slug !== void 0 ? data.slug : category.slug,
      description: data.description !== void 0 ? data.description : category.description,
      parent_id: data.parent_id !== void 0 ? data.parent_id : category.parent_id,
      meta_title: data.meta_title !== void 0 ? data.meta_title : category.meta_title,
      meta_description: data.meta_description !== void 0 ? data.meta_description : category.meta_description
    });
    const count = await PostCategory3.count({
      where: { category_id: category.id }
    });
    await category.update({ post_count: count });
    console.log("[testing] Category updated:", category.id);
    return category.toJSON();
  } catch (error) {
    console.error("[testing] Error updating category:", error);
    throw error;
  }
}
async function deleteCategory(id) {
  try {
    const category = await Category3.findByPk(id);
    if (!category) {
      throw new Error("Category not found");
    }
    await Category3.update(
      { parent_id: null },
      { where: { parent_id: id } }
    );
    const categoryData = category.toJSON();
    await category.destroy();
    console.log("[testing] Category deleted:", id);
    return categoryData;
  } catch (error) {
    console.error("[testing] Error deleting category:", error);
    throw error;
  }
}
async function updateCategoryPostCount(categoryId) {
  try {
    const count = await PostCategory3.count({
      where: { category_id: categoryId }
    });
    await Category3.update(
      { post_count: count },
      { where: { id: categoryId } }
    );
  } catch (error) {
    console.error("[testing] Error updating category post count:", error);
  }
}
async function getPostCategories(postId) {
  try {
    const post = await Post3.findByPk(postId, {
      include: [{
        model: Category3,
        as: "categories",
        through: { attributes: [] }
        // Exclude junction table attributes
      }]
    });
    if (!post) return [];
    return post.categories.map((cat) => cat.toJSON());
  } catch (error) {
    console.error("[testing] Error fetching post categories:", error);
    throw error;
  }
}
async function findOrCreateCategory(slug, data) {
  try {
    const existing = await Category3.findOne({ where: { slug } });
    if (existing) {
      console.log("[testing] Found existing category:", slug);
      return existing.toJSON();
    }
    const category = await createCategory({
      name: data.name || slug,
      slug,
      description: data.description || "",
      parent_id: data.parent_id || null,
      meta_title: data.meta_title,
      meta_description: data.meta_description
    });
    return category;
  } catch (error) {
    console.error("[testing] Error in findOrCreateCategory:", error);
    throw error;
  }
}
async function setPostCategories(postId, categoryIds) {
  try {
    const post = await Post3.findByPk(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    const categories = await Category3.findAll({
      where: { id: categoryIds }
    });
    await post.setCategories(categories);
    for (const categoryId of categoryIds) {
      await updateCategoryPostCount(categoryId);
    }
    console.log("[testing] Post categories updated for post:", postId);
  } catch (error) {
    console.error("[testing] Error setting post categories:", error);
    throw error;
  }
}
var Category3, Post3, PostCategory3;
var init_categories = __esm({
  "sparti-cms/db/modules/categories.js"() {
    init_models();
    ({ Category: Category3, Post: Post3, PostCategory: PostCategory3 } = models_default);
  }
});

// sparti-cms/db/modules/tags.js
async function getTags() {
  try {
    const tags = await Tag3.findAll({
      order: [["name", "ASC"]]
    });
    for (const tag of tags) {
      const count = await PostTag3.count({
        where: { tag_id: tag.id }
      });
      await tag.update({ post_count: count });
    }
    return tags.map((tag) => tag.toJSON());
  } catch (error) {
    console.error("[testing] Error fetching tags:", error);
    throw error;
  }
}
async function getTag(id) {
  try {
    const tag = await Tag3.findByPk(id);
    if (!tag) return null;
    const count = await PostTag3.count({
      where: { tag_id: tag.id }
    });
    await tag.update({ post_count: count });
    return tag.toJSON();
  } catch (error) {
    console.error("[testing] Error fetching tag:", error);
    throw error;
  }
}
async function createTag(data) {
  try {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
    const tag = await Tag3.create({
      name: data.name,
      slug,
      description: data.description || "",
      meta_title: data.meta_title || `${data.name} - GO SG Digital Marketing`,
      meta_description: data.meta_description || data.description || `Learn about ${data.name} with GO SG's expert insights and strategies.`,
      post_count: 0
    });
    console.log("[testing] Tag created:", tag.id);
    return tag.toJSON();
  } catch (error) {
    console.error("[testing] Error creating tag:", error);
    throw error;
  }
}
async function updateTag(id, data) {
  try {
    const tag = await Tag3.findByPk(id);
    if (!tag) {
      throw new Error("Tag not found");
    }
    await tag.update({
      name: data.name !== void 0 ? data.name : tag.name,
      slug: data.slug !== void 0 ? data.slug : tag.slug,
      description: data.description !== void 0 ? data.description : tag.description,
      meta_title: data.meta_title !== void 0 ? data.meta_title : tag.meta_title,
      meta_description: data.meta_description !== void 0 ? data.meta_description : tag.meta_description
    });
    const count = await PostTag3.count({
      where: { tag_id: tag.id }
    });
    await tag.update({ post_count: count });
    console.log("[testing] Tag updated:", tag.id);
    return tag.toJSON();
  } catch (error) {
    console.error("[testing] Error updating tag:", error);
    throw error;
  }
}
async function deleteTag(id) {
  try {
    const tag = await Tag3.findByPk(id);
    if (!tag) {
      throw new Error("Tag not found");
    }
    const tagData = tag.toJSON();
    await tag.destroy();
    console.log("[testing] Tag deleted:", id);
    return tagData;
  } catch (error) {
    console.error("[testing] Error deleting tag:", error);
    throw error;
  }
}
async function updateTagPostCount(tagId) {
  try {
    const count = await PostTag3.count({
      where: { tag_id: tagId }
    });
    await Tag3.update(
      { post_count: count },
      { where: { id: tagId } }
    );
  } catch (error) {
    console.error("[testing] Error updating tag post count:", error);
  }
}
async function getPostTags(postId) {
  try {
    const post = await Post4.findByPk(postId, {
      include: [{
        model: Tag3,
        as: "tags",
        through: { attributes: [] }
        // Exclude junction table attributes
      }]
    });
    if (!post) return [];
    return post.tags.map((tag) => tag.toJSON());
  } catch (error) {
    console.error("[testing] Error fetching post tags:", error);
    throw error;
  }
}
async function findOrCreateTag(slug, data) {
  try {
    const existing = await Tag3.findOne({ where: { slug } });
    if (existing) {
      console.log("[testing] Found existing tag:", slug);
      return existing.toJSON();
    }
    const tag = await createTag({
      name: data.name || slug,
      slug,
      description: data.description || "",
      meta_title: data.meta_title,
      meta_description: data.meta_description
    });
    return tag;
  } catch (error) {
    console.error("[testing] Error in findOrCreateTag:", error);
    throw error;
  }
}
async function setPostTags(postId, tagIds) {
  try {
    const post = await Post4.findByPk(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    const tags = await Tag3.findAll({
      where: { id: tagIds }
    });
    await post.setTags(tags);
    for (const tagId of tagIds) {
      await updateTagPostCount(tagId);
    }
    console.log("[testing] Post tags updated for post:", postId);
  } catch (error) {
    console.error("[testing] Error setting post tags:", error);
    throw error;
  }
}
async function bulkCreateTags(tagsData) {
  try {
    const createdTags = [];
    for (const tagData of tagsData) {
      try {
        const tag = await createTag(tagData);
        createdTags.push(tag);
      } catch (error) {
        console.error("[testing] Error creating tag in bulk:", tagData.name, error);
      }
    }
    return createdTags;
  } catch (error) {
    console.error("[testing] Error bulk creating tags:", error);
    throw error;
  }
}
var Tag3, Post4, PostTag3;
var init_tags = __esm({
  "sparti-cms/db/modules/tags.js"() {
    init_models();
    ({ Tag: Tag3, Post: Post4, PostTag: PostTag3 } = models_default);
  }
});

// sparti-cms/db/index.js
var db_exports = {};
__export(db_exports, {
  addToCart: () => addToCart,
  addToCartById: () => addToCartById,
  associateCartWithUser: () => associateCartWithUser,
  bulkCreateTags: () => bulkCreateTags,
  canUserAccessTenant: () => canUserAccessTenant,
  createCategory: () => createCategory,
  createContact: () => createContact,
  createMediaFile: () => createMediaFile,
  createMediaFolder: () => createMediaFolder,
  createOrder: () => createOrder,
  createPage: () => createPage,
  createPost: () => createPost,
  createProduct: () => createProduct,
  createReview: () => createReview,
  createTag: () => createTag,
  createTerm: () => createTerm,
  deleteCategory: () => deleteCategory,
  deleteContact: () => deleteContact,
  deleteMediaFile: () => deleteMediaFile,
  deleteMediaFolder: () => deleteMediaFolder,
  deletePage: () => deletePage,
  deletePost: () => deletePost,
  deleteProduct: () => deleteProduct,
  deleteReview: () => deleteReview,
  deleteTag: () => deleteTag,
  deleteTerm: () => deleteTerm,
  findOrCreateCategory: () => findOrCreateCategory,
  findOrCreateTag: () => findOrCreateTag,
  getAllPagesWithTypes: () => getAllPagesWithTypes,
  getBrandingSettings: () => getBrandingSettings,
  getCart: () => getCart,
  getCartById: () => getCartById,
  getCategories: () => getCategories,
  getCategory: () => getCategory,
  getContact: () => getContact,
  getContacts: () => getContacts,
  getContactsWithMessages: () => getContactsWithMessages,
  getCustomCodeSettings: () => getCustomCodeSettings,
  getEmailSettingsByFormId: () => getEmailSettingsByFormId,
  getFormById: () => getFormById,
  getFormSubmissions: () => getFormSubmissions,
  getLayoutBySlug: () => getLayoutBySlug,
  getMediaFile: () => getMediaFile,
  getMediaFiles: () => getMediaFiles,
  getMediaFolders: () => getMediaFolders,
  getOrCreateGuestCart: () => getOrCreateGuestCart,
  getOrder: () => getOrder,
  getOrders: () => getOrders,
  getPage: () => getPage,
  getPageWithLayout: () => getPageWithLayout,
  getPages: () => getPages,
  getPost: () => getPost,
  getPostCategories: () => getPostCategories,
  getPostTags: () => getPostTags,
  getPosts: () => getPosts,
  getProduct: () => getProduct,
  getProductBySlug: () => getProductBySlug,
  getProducts: () => getProducts,
  getPublicSEOSettings: () => getPublicSEOSettings,
  getReviews: () => getReviews,
  getSiteSchema: () => getSiteSchema,
  getSiteSettingByKey: () => getSiteSettingByKey,
  getSlugChangeHistory: () => getSlugChangeHistory,
  getTag: () => getTag,
  getTags: () => getTags,
  getTenantStorageName: () => getTenantStorageName,
  getTerm: () => getTerm,
  getTerms: () => getTerms,
  getThemeSettings: () => getThemeSettings,
  getThemeStyles: () => getThemeStyles,
  getsitesettingsbytenant: () => getsitesettingsbytenant,
  initializeSEOPagesTables: () => initializeSEOPagesTables,
  initializeTenantMediaFolders: () => initializeTenantMediaFolders,
  logSlugChange: () => logSlugChange,
  migrateFaviconToDatabase: () => migrateFaviconToDatabase,
  migrateLogoToDatabase: () => migrateLogoToDatabase,
  pool: () => connection_default,
  query: () => query,
  removeFromCart: () => removeFromCart,
  saveFormSubmission: () => saveFormSubmission,
  saveFormSubmissionExtended: () => saveFormSubmissionExtended,
  savePageVersion: () => savePageVersion,
  setPostCategories: () => setPostCategories,
  setPostTags: () => setPostTags,
  toggleSEOIndex: () => toggleSEOIndex,
  updateBrandingSetting: () => updateBrandingSetting,
  updateCartItem: () => updateCartItem,
  updateCategory: () => updateCategory,
  updateContact: () => updateContact,
  updateCustomCodeSettings: () => updateCustomCodeSettings,
  updateMediaFile: () => updateMediaFile,
  updateMediaFolder: () => updateMediaFolder,
  updateMultipleBrandingSettings: () => updateMultipleBrandingSettings,
  updateOrderStatus: () => updateOrderStatus,
  updatePage: () => updatePage,
  updatePageData: () => updatePageData,
  updatePageLayout: () => updatePageLayout,
  updatePageName: () => updatePageName,
  updatePageSlug: () => updatePageSlug,
  updatePost: () => updatePost,
  updateProduct: () => updateProduct,
  updateSEOSettings: () => updateSEOSettings,
  updateSiteSchema: () => updateSiteSchema,
  updateSiteSettingByKey: () => updateSiteSettingByKey,
  updateTag: () => updateTag,
  updateTerm: () => updateTerm,
  upsertLayoutBySlug: () => upsertLayoutBySlug,
  validateSlug: () => validateSlug
});
var init_db = __esm({
  "sparti-cms/db/index.js"() {
    init_connection();
    init_connection();
    init_layouts();
    init_branding();
    init_forms();
    init_contacts();
    init_media();
    init_pages();
    init_ecommerce();
    init_content();
    init_terms();
    init_categories();
    init_tags();
  }
});

// node_modules/uuid/dist-node/max.js
var max_default;
var init_max = __esm({
  "node_modules/uuid/dist-node/max.js"() {
    max_default = "ffffffff-ffff-ffff-ffff-ffffffffffff";
  }
});

// node_modules/uuid/dist-node/nil.js
var nil_default;
var init_nil = __esm({
  "node_modules/uuid/dist-node/nil.js"() {
    nil_default = "00000000-0000-0000-0000-000000000000";
  }
});

// node_modules/uuid/dist-node/regex.js
var regex_default;
var init_regex = __esm({
  "node_modules/uuid/dist-node/regex.js"() {
    regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;
  }
});

// node_modules/uuid/dist-node/validate.js
function validate(uuid) {
  return typeof uuid === "string" && regex_default.test(uuid);
}
var validate_default;
var init_validate = __esm({
  "node_modules/uuid/dist-node/validate.js"() {
    init_regex();
    validate_default = validate;
  }
});

// node_modules/uuid/dist-node/parse.js
function parse(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  let v;
  return Uint8Array.of((v = parseInt(uuid.slice(0, 8), 16)) >>> 24, v >>> 16 & 255, v >>> 8 & 255, v & 255, (v = parseInt(uuid.slice(9, 13), 16)) >>> 8, v & 255, (v = parseInt(uuid.slice(14, 18), 16)) >>> 8, v & 255, (v = parseInt(uuid.slice(19, 23), 16)) >>> 8, v & 255, (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255, v / 4294967296 & 255, v >>> 24 & 255, v >>> 16 & 255, v >>> 8 & 255, v & 255);
}
var parse_default;
var init_parse = __esm({
  "node_modules/uuid/dist-node/parse.js"() {
    init_validate();
    parse_default = parse;
  }
});

// node_modules/uuid/dist-node/stringify.js
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}
function stringify(arr, offset = 0) {
  const uuid = unsafeStringify(arr, offset);
  if (!validate_default(uuid)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid;
}
var byteToHex, stringify_default;
var init_stringify = __esm({
  "node_modules/uuid/dist-node/stringify.js"() {
    init_validate();
    byteToHex = [];
    for (let i = 0; i < 256; ++i) {
      byteToHex.push((i + 256).toString(16).slice(1));
    }
    stringify_default = stringify;
  }
});

// node_modules/uuid/dist-node/rng.js
import { randomFillSync } from "node:crypto";
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}
var rnds8Pool, poolPtr;
var init_rng = __esm({
  "node_modules/uuid/dist-node/rng.js"() {
    rnds8Pool = new Uint8Array(256);
    poolPtr = rnds8Pool.length;
  }
});

// node_modules/uuid/dist-node/v1.js
function v1(options, buf, offset) {
  let bytes;
  const isV6 = options?._v6 ?? false;
  if (options) {
    const optionsKeys = Object.keys(options);
    if (optionsKeys.length === 1 && optionsKeys[0] === "_v6") {
      options = void 0;
    }
  }
  if (options) {
    bytes = v1Bytes(options.random ?? options.rng?.() ?? rng(), options.msecs, options.nsecs, options.clockseq, options.node, buf, offset);
  } else {
    const now = Date.now();
    const rnds = rng();
    updateV1State(_state, now, rnds);
    bytes = v1Bytes(rnds, _state.msecs, _state.nsecs, isV6 ? void 0 : _state.clockseq, isV6 ? void 0 : _state.node, buf, offset);
  }
  return buf ?? unsafeStringify(bytes);
}
function updateV1State(state, now, rnds) {
  state.msecs ??= -Infinity;
  state.nsecs ??= 0;
  if (now === state.msecs) {
    state.nsecs++;
    if (state.nsecs >= 1e4) {
      state.node = void 0;
      state.nsecs = 0;
    }
  } else if (now > state.msecs) {
    state.nsecs = 0;
  } else if (now < state.msecs) {
    state.node = void 0;
  }
  if (!state.node) {
    state.node = rnds.slice(10, 16);
    state.node[0] |= 1;
    state.clockseq = (rnds[8] << 8 | rnds[9]) & 16383;
  }
  state.msecs = now;
  return state;
}
function v1Bytes(rnds, msecs, nsecs, clockseq, node, buf, offset = 0) {
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  if (!buf) {
    buf = new Uint8Array(16);
    offset = 0;
  } else {
    if (offset < 0 || offset + 16 > buf.length) {
      throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    }
  }
  msecs ??= Date.now();
  nsecs ??= 0;
  clockseq ??= (rnds[8] << 8 | rnds[9]) & 16383;
  node ??= rnds.slice(10, 16);
  msecs += 122192928e5;
  const tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
  buf[offset++] = tl >>> 24 & 255;
  buf[offset++] = tl >>> 16 & 255;
  buf[offset++] = tl >>> 8 & 255;
  buf[offset++] = tl & 255;
  const tmh = msecs / 4294967296 * 1e4 & 268435455;
  buf[offset++] = tmh >>> 8 & 255;
  buf[offset++] = tmh & 255;
  buf[offset++] = tmh >>> 24 & 15 | 16;
  buf[offset++] = tmh >>> 16 & 255;
  buf[offset++] = clockseq >>> 8 | 128;
  buf[offset++] = clockseq & 255;
  for (let n = 0; n < 6; ++n) {
    buf[offset++] = node[n];
  }
  return buf;
}
var _state, v1_default;
var init_v1 = __esm({
  "node_modules/uuid/dist-node/v1.js"() {
    init_rng();
    init_stringify();
    _state = {};
    v1_default = v1;
  }
});

// node_modules/uuid/dist-node/v1ToV6.js
function v1ToV6(uuid) {
  const v1Bytes2 = typeof uuid === "string" ? parse_default(uuid) : uuid;
  const v6Bytes = _v1ToV6(v1Bytes2);
  return typeof uuid === "string" ? unsafeStringify(v6Bytes) : v6Bytes;
}
function _v1ToV6(v1Bytes2) {
  return Uint8Array.of((v1Bytes2[6] & 15) << 4 | v1Bytes2[7] >> 4 & 15, (v1Bytes2[7] & 15) << 4 | (v1Bytes2[4] & 240) >> 4, (v1Bytes2[4] & 15) << 4 | (v1Bytes2[5] & 240) >> 4, (v1Bytes2[5] & 15) << 4 | (v1Bytes2[0] & 240) >> 4, (v1Bytes2[0] & 15) << 4 | (v1Bytes2[1] & 240) >> 4, (v1Bytes2[1] & 15) << 4 | (v1Bytes2[2] & 240) >> 4, 96 | v1Bytes2[2] & 15, v1Bytes2[3], v1Bytes2[8], v1Bytes2[9], v1Bytes2[10], v1Bytes2[11], v1Bytes2[12], v1Bytes2[13], v1Bytes2[14], v1Bytes2[15]);
}
var init_v1ToV6 = __esm({
  "node_modules/uuid/dist-node/v1ToV6.js"() {
    init_parse();
    init_stringify();
  }
});

// node_modules/uuid/dist-node/md5.js
import { createHash } from "node:crypto";
function md5(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return createHash("md5").update(bytes).digest();
}
var md5_default;
var init_md5 = __esm({
  "node_modules/uuid/dist-node/md5.js"() {
    md5_default = md5;
  }
});

// node_modules/uuid/dist-node/v35.js
function stringToBytes(str) {
  str = unescape(encodeURIComponent(str));
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; ++i) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes;
}
function v35(version2, hash, value, namespace, buf, offset) {
  const valueBytes = typeof value === "string" ? stringToBytes(value) : value;
  const namespaceBytes = typeof namespace === "string" ? parse_default(namespace) : namespace;
  if (typeof namespace === "string") {
    namespace = parse_default(namespace);
  }
  if (namespace?.length !== 16) {
    throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
  }
  let bytes = new Uint8Array(16 + valueBytes.length);
  bytes.set(namespaceBytes);
  bytes.set(valueBytes, namespaceBytes.length);
  bytes = hash(bytes);
  bytes[6] = bytes[6] & 15 | version2;
  bytes[8] = bytes[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = bytes[i];
    }
    return buf;
  }
  return unsafeStringify(bytes);
}
var DNS, URL2;
var init_v35 = __esm({
  "node_modules/uuid/dist-node/v35.js"() {
    init_parse();
    init_stringify();
    DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    URL2 = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
  }
});

// node_modules/uuid/dist-node/v3.js
function v3(value, namespace, buf, offset) {
  return v35(48, md5_default, value, namespace, buf, offset);
}
var v3_default;
var init_v3 = __esm({
  "node_modules/uuid/dist-node/v3.js"() {
    init_md5();
    init_v35();
    v3.DNS = DNS;
    v3.URL = URL2;
    v3_default = v3;
  }
});

// node_modules/uuid/dist-node/native.js
import { randomUUID } from "node:crypto";
var native_default;
var init_native = __esm({
  "node_modules/uuid/dist-node/native.js"() {
    native_default = { randomUUID };
  }
});

// node_modules/uuid/dist-node/v4.js
function _v4(options, buf, offset) {
  options = options || {};
  const rnds = options.random ?? options.rng?.() ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    if (offset < 0 || offset + 16 > buf.length) {
      throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    }
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  return _v4(options, buf, offset);
}
var v4_default;
var init_v4 = __esm({
  "node_modules/uuid/dist-node/v4.js"() {
    init_native();
    init_rng();
    init_stringify();
    v4_default = v4;
  }
});

// node_modules/uuid/dist-node/sha1.js
import { createHash as createHash2 } from "node:crypto";
function sha1(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return createHash2("sha1").update(bytes).digest();
}
var sha1_default;
var init_sha1 = __esm({
  "node_modules/uuid/dist-node/sha1.js"() {
    sha1_default = sha1;
  }
});

// node_modules/uuid/dist-node/v5.js
function v5(value, namespace, buf, offset) {
  return v35(80, sha1_default, value, namespace, buf, offset);
}
var v5_default;
var init_v5 = __esm({
  "node_modules/uuid/dist-node/v5.js"() {
    init_sha1();
    init_v35();
    v5.DNS = DNS;
    v5.URL = URL2;
    v5_default = v5;
  }
});

// node_modules/uuid/dist-node/v6.js
function v6(options, buf, offset) {
  options ??= {};
  offset ??= 0;
  let bytes = v1_default({ ...options, _v6: true }, new Uint8Array(16));
  bytes = v1ToV6(bytes);
  if (buf) {
    for (let i = 0; i < 16; i++) {
      buf[offset + i] = bytes[i];
    }
    return buf;
  }
  return unsafeStringify(bytes);
}
var v6_default;
var init_v6 = __esm({
  "node_modules/uuid/dist-node/v6.js"() {
    init_stringify();
    init_v1();
    init_v1ToV6();
    v6_default = v6;
  }
});

// node_modules/uuid/dist-node/v6ToV1.js
function v6ToV1(uuid) {
  const v6Bytes = typeof uuid === "string" ? parse_default(uuid) : uuid;
  const v1Bytes2 = _v6ToV1(v6Bytes);
  return typeof uuid === "string" ? unsafeStringify(v1Bytes2) : v1Bytes2;
}
function _v6ToV1(v6Bytes) {
  return Uint8Array.of((v6Bytes[3] & 15) << 4 | v6Bytes[4] >> 4 & 15, (v6Bytes[4] & 15) << 4 | (v6Bytes[5] & 240) >> 4, (v6Bytes[5] & 15) << 4 | v6Bytes[6] & 15, v6Bytes[7], (v6Bytes[1] & 15) << 4 | (v6Bytes[2] & 240) >> 4, (v6Bytes[2] & 15) << 4 | (v6Bytes[3] & 240) >> 4, 16 | (v6Bytes[0] & 240) >> 4, (v6Bytes[0] & 15) << 4 | (v6Bytes[1] & 240) >> 4, v6Bytes[8], v6Bytes[9], v6Bytes[10], v6Bytes[11], v6Bytes[12], v6Bytes[13], v6Bytes[14], v6Bytes[15]);
}
var init_v6ToV1 = __esm({
  "node_modules/uuid/dist-node/v6ToV1.js"() {
    init_parse();
    init_stringify();
  }
});

// node_modules/uuid/dist-node/v7.js
function v7(options, buf, offset) {
  let bytes;
  if (options) {
    bytes = v7Bytes(options.random ?? options.rng?.() ?? rng(), options.msecs, options.seq, buf, offset);
  } else {
    const now = Date.now();
    const rnds = rng();
    updateV7State(_state2, now, rnds);
    bytes = v7Bytes(rnds, _state2.msecs, _state2.seq, buf, offset);
  }
  return buf ?? unsafeStringify(bytes);
}
function updateV7State(state, now, rnds) {
  state.msecs ??= -Infinity;
  state.seq ??= 0;
  if (now > state.msecs) {
    state.seq = rnds[6] << 23 | rnds[7] << 16 | rnds[8] << 8 | rnds[9];
    state.msecs = now;
  } else {
    state.seq = state.seq + 1 | 0;
    if (state.seq === 0) {
      state.msecs++;
    }
  }
  return state;
}
function v7Bytes(rnds, msecs, seq, buf, offset = 0) {
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  if (!buf) {
    buf = new Uint8Array(16);
    offset = 0;
  } else {
    if (offset < 0 || offset + 16 > buf.length) {
      throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    }
  }
  msecs ??= Date.now();
  seq ??= rnds[6] * 127 << 24 | rnds[7] << 16 | rnds[8] << 8 | rnds[9];
  buf[offset++] = msecs / 1099511627776 & 255;
  buf[offset++] = msecs / 4294967296 & 255;
  buf[offset++] = msecs / 16777216 & 255;
  buf[offset++] = msecs / 65536 & 255;
  buf[offset++] = msecs / 256 & 255;
  buf[offset++] = msecs & 255;
  buf[offset++] = 112 | seq >>> 28 & 15;
  buf[offset++] = seq >>> 20 & 255;
  buf[offset++] = 128 | seq >>> 14 & 63;
  buf[offset++] = seq >>> 6 & 255;
  buf[offset++] = seq << 2 & 255 | rnds[10] & 3;
  buf[offset++] = rnds[11];
  buf[offset++] = rnds[12];
  buf[offset++] = rnds[13];
  buf[offset++] = rnds[14];
  buf[offset++] = rnds[15];
  return buf;
}
var _state2, v7_default;
var init_v7 = __esm({
  "node_modules/uuid/dist-node/v7.js"() {
    init_rng();
    init_stringify();
    _state2 = {};
    v7_default = v7;
  }
});

// node_modules/uuid/dist-node/version.js
function version(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  return parseInt(uuid.slice(14, 15), 16);
}
var version_default;
var init_version = __esm({
  "node_modules/uuid/dist-node/version.js"() {
    init_validate();
    version_default = version;
  }
});

// node_modules/uuid/dist-node/index.js
var dist_node_exports = {};
__export(dist_node_exports, {
  MAX: () => max_default,
  NIL: () => nil_default,
  parse: () => parse_default,
  stringify: () => stringify_default,
  v1: () => v1_default,
  v1ToV6: () => v1ToV6,
  v3: () => v3_default,
  v4: () => v4_default,
  v5: () => v5_default,
  v6: () => v6_default,
  v6ToV1: () => v6ToV1,
  v7: () => v7_default,
  validate: () => validate_default,
  version: () => version_default
});
var init_dist_node = __esm({
  "node_modules/uuid/dist-node/index.js"() {
    init_max();
    init_nil();
    init_parse();
    init_stringify();
    init_v1();
    init_v1ToV6();
    init_v3();
    init_v4();
    init_v5();
    init_v6();
    init_v6ToV1();
    init_v7();
    init_validate();
    init_version();
  }
});

// server/config/constants.js
var constants_exports = {};
__export(constants_exports, {
  JWT_SECRET: () => JWT_SECRET,
  PORT: () => PORT,
  RESEND_API_KEY: () => RESEND_API_KEY,
  SMTP_FROM_EMAIL: () => SMTP_FROM_EMAIL
});
var RESEND_API_KEY, SMTP_FROM_EMAIL, JWT_SECRET, DEFAULT_PORT, rawPort, parsed, PORT;
var init_constants = __esm({
  "server/config/constants.js"() {
    RESEND_API_KEY = process.env.RESEND_API_KEY;
    SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || "noreply@gosg.com";
    JWT_SECRET = process.env.JWT_SECRET || "sparti-demo-secret-key";
    DEFAULT_PORT = 4173;
    rawPort = process.env.PORT;
    parsed = rawPort != null && rawPort !== "" ? parseInt(String(rawPort), 10) : NaN;
    PORT = Number.isNaN(parsed) || parsed < 1 || parsed > 65535 ? DEFAULT_PORT : parsed;
  }
});

// sparti-cms/utils/convertTestimonialsToItems.ts
var convertTestimonialsToItems_exports = {};
__export(convertTestimonialsToItems_exports, {
  convertLayoutTestimonialsToItems: () => convertLayoutTestimonialsToItems,
  convertTestimonialsComponentToItems: () => convertTestimonialsComponentToItems,
  convertTestimonialsToItems: () => convertTestimonialsToItems
});
function convertTestimonialsToItems(testimonials) {
  if (!testimonials || !Array.isArray(testimonials)) {
    return [];
  }
  return testimonials.map((testimonial, index) => {
    const testimonialKey = `testimonial-${index + 1}`;
    return {
      key: testimonialKey,
      type: "array",
      items: [
        {
          key: `${testimonialKey}_image`,
          type: "image",
          src: testimonial.image || testimonial.avatar || "",
          alt: testimonial.name || `Testimonial ${index + 1}`
        },
        {
          key: `${testimonialKey}_text`,
          type: "textarea",
          content: testimonial.text || testimonial.quote || ""
        },
        {
          key: `${testimonialKey}_name`,
          type: "heading",
          level: 4,
          content: testimonial.name || ""
        },
        {
          key: `${testimonialKey}_role`,
          type: "text",
          content: testimonial.role || ""
        },
        ...testimonial.company ? [{
          key: `${testimonialKey}_company`,
          type: "text",
          content: testimonial.company
        }] : [],
        ...testimonial.rating ? [{
          key: `${testimonialKey}_rating`,
          type: "text",
          content: String(testimonial.rating)
        }] : []
      ]
    };
  });
}
function convertTestimonialsComponentToItems(component) {
  if (component.items && component.items.length > 0) {
    const hasTestimonialsArray = component.items.some(
      (item) => item.key === "testimonials" && item.type === "array" && item.items
    );
    if (hasTestimonialsArray) {
      const updatedItems = component.items.map((item) => {
        if (item.key === "testimonials" && item.type === "array") {
          const testimonials2 = item.testimonials || item.items || [];
          if (testimonials2.length > 0 && testimonials2[0] && !testimonials2[0].key) {
            const convertedTestimonials = convertTestimonialsToItems(testimonials2);
            return {
              ...item,
              items: convertedTestimonials
            };
          }
        }
        return item;
      });
      return {
        ...component,
        items: updatedItems
      };
    }
  }
  const testimonials = component.testimonials || component.props?.testimonials || component.data?.testimonials || [];
  const sectionTitle = component.sectionTitle || component.props?.sectionTitle || component.data?.sectionTitle || "What our clients say";
  const sectionSubtitle = component.sectionSubtitle || component.props?.sectionSubtitle || component.data?.sectionSubtitle || "See what our customers have to say about our services.";
  const items = [
    {
      key: "title",
      type: "heading",
      level: 2,
      content: sectionTitle
    },
    {
      key: "subtitle",
      type: "text",
      content: sectionSubtitle
    },
    {
      key: "testimonials",
      type: "array",
      items: convertTestimonialsToItems(testimonials)
    }
  ];
  return {
    ...component,
    items
  };
}
function convertLayoutTestimonialsToItems(layoutJson) {
  if (!layoutJson.components || !Array.isArray(layoutJson.components)) {
    return { ...layoutJson, components: [] };
  }
  const convertedComponents = layoutJson.components.map((component) => {
    if (component.type === "testimonials-section" || component.key === "testimonials-section" || component.key === "testimonials-section") {
      return convertTestimonialsComponentToItems(component);
    }
    return component;
  });
  return {
    ...layoutJson,
    components: convertedComponents
  };
}
var init_convertTestimonialsToItems = __esm({
  "sparti-cms/utils/convertTestimonialsToItems.ts"() {
  }
});

// sparti-cms/utils/schema-validator.ts
var schema_validator_exports = {};
__export(schema_validator_exports, {
  getValidationSummary: () => getValidationSummary,
  validateComponentSchema: () => validateComponentSchema,
  validateItemType: () => validateItemType,
  validatePageSchema: () => validatePageSchema,
  validateSchemaRequirements: () => validateSchemaRequirements
});
function validateItemType(item) {
  const errors = [];
  const warnings = [];
  if (!item.type) {
    errors.push("Item must have a type");
    return { isValid: false, errors, warnings };
  }
  switch (item.type) {
    case "heading":
      if (!item.content || typeof item.content !== "string") {
        errors.push("Heading must have text content");
      }
      if (item.level && (item.level < 1 || item.level > 6)) {
        errors.push("Heading level must be between 1 and 6");
      }
      break;
    case "text":
    case "textarea":
      if (item.content !== void 0 && typeof item.content !== "string") {
        errors.push("Text content must be a string");
      }
      break;
    case "image":
      if (!item.src || typeof item.src !== "string") {
        errors.push("Image must have a valid src URL");
      }
      if (item.alt && typeof item.alt !== "string") {
        warnings.push("Image alt should be a string");
      }
      break;
    case "link":
      if (!item.link || typeof item.link !== "string") {
        errors.push("Link must have a valid href string");
      }
      if (item.label && typeof item.label !== "string") {
        warnings.push("Link label should be a string");
      }
      break;
    case "button":
      if (item.buttonText && typeof item.buttonText !== "string") {
        warnings.push("Button text should be a string");
      }
      if (item.link && typeof item.link !== "string") {
        errors.push("Button must have a valid action URL (link)");
      }
      break;
    case "array":
      if (!Array.isArray(item.items)) {
        errors.push("Array item must have an items array");
      }
      break;
    default:
      break;
  }
  return { isValid: errors.length === 0, errors, warnings };
}
function validateComponentSchema(component) {
  const errors = [];
  const warnings = [];
  if (!component.type || typeof component.type !== "string") {
    errors.push("Component must have a valid type");
    return { isValid: false, errors, warnings };
  }
  if (!component.items || !Array.isArray(component.items)) {
    errors.push("Component must have an items array");
    return { isValid: false, errors, warnings };
  }
  if (component.items.length === 0) {
    warnings.push("Component has no items");
  }
  component.items.forEach((item, index) => {
    const res = validateItemType(item);
    if (!res.isValid) errors.push(`Item ${index}: ${res.errors.join(", ")}`);
    warnings.push(...res.warnings.map((w) => `Item ${index}: ${w}`));
  });
  return { isValid: errors.length === 0, errors, warnings };
}
function validatePageSchema(schema) {
  const errors = [];
  const warnings = [];
  if (!schema.components || !Array.isArray(schema.components)) {
    errors.push("Schema must have a components array");
    return { isValid: false, errors, warnings };
  }
  if (schema.components.length === 0) {
    warnings.push("Page has no components");
  }
  schema.components.forEach((component, index) => {
    const res = validateComponentSchema(component);
    if (!res.isValid) errors.push(`Component ${index}: ${res.errors.join(", ")}`);
    warnings.push(...res.warnings.map((w) => `Component ${index}: ${w}`));
  });
  const componentTypes = schema.components.map((c) => c.type);
  const unique = new Set(componentTypes);
  if (componentTypes.length !== unique.size) {
    warnings.push("Some components have duplicate types");
  }
  return { isValid: errors.length === 0, errors, warnings };
}
function validateSchemaRequirements(schema, requirements) {
  const errors = [];
  const warnings = [];
  if (requirements.minComponents && schema.components.length < requirements.minComponents) {
    errors.push(`Page must have at least ${requirements.minComponents} components`);
  }
  if (requirements.maxComponents && schema.components.length > requirements.maxComponents) {
    errors.push(`Page must have at most ${requirements.maxComponents} components`);
  }
  if (requirements.requiredComponents) {
    const componentTypes = schema.components.map((c) => c.type);
    const missing = requirements.requiredComponents.filter((req) => !componentTypes.includes(req));
    if (missing.length > 0) {
      errors.push(`Missing required components: ${missing.join(", ")}`);
    }
  }
  if (requirements.allowedItemTypes) {
    const allItemTypes = schema.components.flatMap((c) => c.items.map((i) => i.type));
    const invalid = allItemTypes.filter((t) => !requirements.allowedItemTypes.includes(t));
    if (invalid.length > 0) {
      errors.push(`Invalid item types found: ${[...new Set(invalid)].join(", ")}`);
    }
  }
  return { isValid: errors.length === 0, errors, warnings };
}
function getValidationSummary(schema) {
  const validation = validatePageSchema(schema);
  const totalItems = schema.components.reduce((sum, c) => sum + c.items.length, 0);
  const itemTypeCounts = {};
  schema.components.forEach((component) => {
    component.items.forEach((item) => {
      itemTypeCounts[item.type] = (itemTypeCounts[item.type] || 0) + 1;
    });
  });
  return {
    totalComponents: schema.components.length,
    totalItems,
    itemTypeCounts,
    hasErrors: validation.errors.length > 0,
    hasWarnings: validation.warnings.length > 0
  };
}
var init_schema_validator = __esm({
  "sparti-cms/utils/schema-validator.ts"() {
  }
});

// sparti-cms/registry/sync.ts
async function syncFromDatabase(tenantId) {
  const result = {
    added: [],
    updated: [],
    removed: [],
    errors: []
  };
  console.log("Demo: Would sync from database for tenant", tenantId);
  return result;
}
async function syncToDatabase(tenantId, components2) {
  console.log("Demo: Would sync to database for tenant", tenantId, "with", components2.length, "components");
}
var init_sync = __esm({
  "sparti-cms/registry/sync.ts"() {
  }
});

// sparti-cms/registry/components/header.json
var header_default;
var init_header = __esm({
  "sparti-cms/registry/components/header.json"() {
    header_default = {
      id: "header-main",
      name: "Header",
      type: "container",
      category: "layout",
      description: "Main site header with logo and CTA button",
      properties: {
        logo: {
          type: "object",
          description: "Logo image and alt text",
          editable: true,
          required: true,
          default: {
            src: "/placeholder.svg",
            alt: "Site Logo"
          }
        },
        ctaText: {
          type: "string",
          description: "Call-to-action button text",
          editable: true,
          required: true,
          default: "Contact Us"
        },
        showCTA: {
          type: "boolean",
          description: "Show/hide CTA button",
          editable: true,
          default: true
        },
        isFixed: {
          type: "boolean",
          description: "Fixed positioning on scroll",
          editable: true,
          default: true
        }
      },
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: ["header", "navigation", "layout", "global"],
      dependencies: ["react-router-dom"],
      last_updated: "2025-01-28T12:00:00Z"
    };
  }
});

// sparti-cms/registry/components/footer.json
var footer_default;
var init_footer = __esm({
  "sparti-cms/registry/components/footer.json"() {
    footer_default = {
      id: "footer-main",
      name: "Footer",
      type: "container",
      category: "layout",
      description: "Main site footer with CTA, links, and copyright",
      properties: {
        ctaHeading: {
          type: "string",
          description: "CTA section heading",
          editable: true,
          required: true,
          default: "Get Your SEO Strategy"
        },
        ctaDescription: {
          type: "string",
          description: "CTA section description",
          editable: true,
          required: true,
          default: "Ready to dominate search results? Let's discuss how we can help your business grow."
        },
        ctaButtonText: {
          type: "string",
          description: "CTA button text",
          editable: true,
          default: "Start Your Journey"
        },
        contactLinks: {
          type: "array",
          description: "Contact link items",
          editable: true,
          default: [
            {
              text: "WhatsApp",
              url: "https://wa.me/1234567890"
            },
            {
              text: "Book a Meeting",
              url: "https://calendly.com"
            }
          ]
        },
        legalLinks: {
          type: "array",
          description: "Legal link items",
          editable: true,
          default: [
            {
              text: "Privacy Policy",
              url: "/privacy-policy"
            },
            {
              text: "Terms of Service",
              url: "/terms-of-service"
            },
            {
              text: "Blog",
              url: "/blog"
            }
          ]
        },
        copyrightText: {
          type: "string",
          description: "Copyright text",
          editable: true,
          default: "GO SG CONSULTING. All rights reserved."
        },
        backgroundColor: {
          type: "string",
          description: "Background color for the footer",
          editable: true,
          default: "#0f172a"
        }
      },
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: ["footer", "layout", "global", "cta"],
      dependencies: ["react-router-dom", "lucide-react"],
      last_updated: "2025-10-17T12:00:00Z"
    };
  }
});

// sparti-cms/registry/components/hero.json
var hero_default;
var init_hero = __esm({
  "sparti-cms/registry/components/hero.json"() {
    hero_default = {
      id: "hero-main",
      name: "Hero Section",
      type: "container",
      category: "content",
      description: "Main hero section with headline, description, and CTA",
      properties: {
        badgeText: {
          type: "string",
          description: "Top badge text",
          editable: true,
          default: "Trusted by great teams"
        },
        showBadge: {
          type: "boolean",
          description: "Show/hide badge",
          editable: true,
          default: true
        },
        headingLine1: {
          type: "string",
          description: "First line of heading",
          editable: true,
          required: true,
          default: "Grow your business"
        },
        headingLine2: {
          type: "string",
          description: "Second line of heading (highlighted)",
          editable: true,
          required: true,
          default: "with a simple hero"
        },
        description: {
          type: "string",
          description: "Hero description text",
          editable: true,
          required: true,
          default: "Use this space for a short, neutral description of your product or service."
        },
        ctaButtonText: {
          type: "string",
          description: "CTA button text",
          editable: true,
          default: "Get Started"
        },
        showClientLogos: {
          type: "boolean",
          description: "Show client logos carousel",
          editable: true,
          default: true
        },
        clientLogos: {
          type: "array",
          description: "Client logos for the carousel",
          editable: true,
          default: [
            { src: "/placeholder.svg", alt: "Client Logo 1" },
            { src: "/placeholder.svg", alt: "Client Logo 2" },
            { src: "/placeholder.svg", alt: "Client Logo 3" },
            { src: "/placeholder.svg", alt: "Client Logo 4" },
            { src: "/placeholder.svg", alt: "Client Logo 5" },
            { src: "/placeholder.svg", alt: "Client Logo 6" },
            { src: "/placeholder.svg", alt: "Client Logo 7" },
            { src: "/placeholder.svg", alt: "Client Logo 8" }
          ]
        },
        backgroundType: {
          type: "string",
          description: "Type of background (color, image, or gradient)",
          editable: true,
          default: "gradient"
        },
        backgroundColor: {
          type: "string",
          description: "Background color",
          editable: true,
          default: "#ffffff"
        }
      },
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: ["hero", "banner", "cta", "homepage"],
      dependencies: ["framer-motion", "lucide-react"],
      last_updated: "2025-10-17T12:00:00Z"
    };
  }
});

// sparti-cms/registry/components/client-logos.json
var client_logos_default;
var init_client_logos = __esm({
  "sparti-cms/registry/components/client-logos.json"() {
    client_logos_default = {
      id: "client-logos-carousel",
      name: "Client Logos",
      type: "media",
      category: "content",
      description: "Animated carousel of client logos",
      properties: {
        logos: {
          type: "array",
          description: "Array of logo objects",
          editable: true,
          required: true,
          default: []
        },
        animationSpeed: {
          type: "number",
          description: "Animation duration in seconds",
          editable: true,
          default: 30
        },
        pauseOnHover: {
          type: "boolean",
          description: "Pause animation on hover",
          editable: true,
          default: false
        },
        logoHeight: {
          type: "number",
          description: "Logo height in pixels",
          editable: true,
          default: 40
        }
      },
      editor: "MediaEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: ["logos", "carousel", "clients", "animation"],
      dependencies: ["framer-motion"],
      last_updated: "2025-01-28T12:00:00Z"
    };
  }
});

// sparti-cms/registry/components/pain-points.json
var pain_points_default;
var init_pain_points = __esm({
  "sparti-cms/registry/components/pain-points.json"() {
    pain_points_default = {
      id: "pain-point-section",
      name: "Pain Points",
      type: "container",
      category: "content",
      description: "Section highlighting customer pain points",
      properties: {
        badgeText: {
          type: "string",
          description: "Text for the top badge",
          editable: true,
          default: "You have a website but it's not generating clicks?"
        },
        headingLine1: {
          type: "string",
          description: "First part of heading",
          editable: true,
          default: "You Invest... But"
        },
        headingLine2: {
          type: "string",
          description: "Highlighted part of heading",
          editable: true,
          default: "Nothing Happens?"
        },
        rotatingAnimationText1: {
          type: "string",
          description: "Rotating Animation Text 1",
          editable: true,
          default: "low traffic"
        },
        rotatingAnimationText2: {
          type: "string",
          description: "Rotating Animation Text 2",
          editable: true,
          default: "stagnant"
        },
        rotatingAnimationText3: {
          type: "string",
          description: "Rotating Animation Text 3",
          editable: true,
          default: "no traffic"
        },
        painPoints: {
          type: "array",
          description: "Array of pain point items",
          editable: true,
          required: true,
          default: [
            {
              title: "Organic traffic stuck at 0",
              icon: "x"
            },
            {
              title: "No clicks, no leads, no sales",
              icon: "mouse-pointer-click"
            },
            {
              title: "Competitors ranking above you",
              icon: "bar-chart-3"
            }
          ]
        },
        backgroundType: {
          type: "string",
          description: "Type of background",
          editable: true,
          default: "gradient"
        },
        backgroundColor: {
          type: "string",
          description: "Background color for the section",
          editable: true,
          default: "#0f172a"
        }
      },
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: ["pain-points", "problems", "content", "features"],
      dependencies: ["lucide-react", "framer-motion"],
      last_updated: "2025-10-17T12:00:00Z"
    };
  }
});

// sparti-cms/registry/components/seo-results.json
var seo_results_default;
var init_seo_results = __esm({
  "sparti-cms/registry/components/seo-results.json"() {
    seo_results_default = {
      id: "seo-results-section",
      name: "SEO Results",
      type: "container",
      category: "content",
      description: "Showcase of SEO results and case studies",
      properties: {
        title: {
          type: "string",
          description: "Section title",
          editable: true,
          required: true,
          default: "Sample Results"
        },
        highlightedText: {
          type: "string",
          description: "Highlighted text in the title",
          editable: true,
          default: "Results"
        },
        subtitle: {
          type: "string",
          description: "Section subtitle",
          editable: true,
          default: "Example outcomes shown for demonstration purposes."
        },
        results: {
          type: "array",
          description: "Array of result items",
          editable: true,
          required: true,
          default: [
            { img: "/placeholder.svg", label: "Result example 1" },
            { img: "/placeholder.svg", label: "Result example 2" },
            { img: "/placeholder.svg", label: "Result example 3" },
            { img: "/placeholder.svg", label: "Result example 4" },
            { img: "/placeholder.svg", label: "Result example 5" },
            { img: "/placeholder.svg", label: "Result example 6" },
            { img: "/placeholder.svg", label: "Result example 7" },
            { img: "/placeholder.svg", label: "Result example 8" }
          ]
        },
        ctaButtonText: {
          type: "string",
          description: "CTA button text",
          editable: true,
          default: "Learn More"
        },
        backgroundColor: {
          type: "string",
          description: "Background color for the section",
          editable: true,
          default: "bg-gradient-to-b from-background via-secondary/30 to-background"
        }
      },
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: ["results", "case-studies", "testimonials", "proof"],
      dependencies: ["framer-motion"],
      last_updated: "2025-10-17T12:00:00Z"
    };
  }
});

// sparti-cms/registry/components/services.json
var services_default;
var init_services = __esm({
  "sparti-cms/registry/components/services.json"() {
    services_default = {
      id: "services-showcase-section",
      name: "Services Showcase",
      type: "container",
      category: "content",
      description: "Showcase of SEO services offered",
      properties: {
        services: {
          type: "array",
          description: "Array of service items",
          editable: true,
          required: true,
          default: [
            {
              id: "keywords-research",
              title: "Rank on keywords with",
              highlight: "search volume",
              description: "Discover high-volume keywords with precise search data and user intent analysis. Find the perfect keywords to target for maximum organic traffic growth.",
              buttonText: "Learn More",
              images: [
                "/src/assets/seo/keyword-research-1.png",
                "/src/assets/seo/keyword-research-2.png"
              ]
            },
            {
              id: "content-strategy",
              title: "Find topics based on",
              highlight: "real google search results",
              description: "Discover content opportunities by analyzing actual Google search results and user behavior. Get real insights from search data to create content that ranks and converts.",
              buttonText: "View Analytics",
              images: [
                "/src/assets/seo/content-strategy-1.png",
                "/src/assets/seo/content-strategy-2.png"
              ]
            },
            {
              id: "link-building",
              title: "Build authority with",
              highlight: "high-quality backlinks",
              description: "Strengthen your website's authority through strategic link building campaigns. Acquire high-quality backlinks from reputable sources to boost your domain authority and rankings.",
              buttonText: "Try Link Builder",
              images: [
                "/src/assets/seo/link-building-1.png",
                "/src/assets/seo/link-building-2.png"
              ]
            }
          ]
        },
        backgroundColor: {
          type: "string",
          description: "Background color for the section",
          editable: true,
          default: "#ffffff"
        }
      },
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: ["services", "features", "offerings", "seo"],
      dependencies: ["framer-motion", "lucide-react"],
      last_updated: "2025-10-17T12:00:00Z"
    };
  }
});

// sparti-cms/registry/components/what-is-seo.json
var what_is_seo_default;
var init_what_is_seo = __esm({
  "sparti-cms/registry/components/what-is-seo.json"() {
    what_is_seo_default = {
      id: "what-is-seo-section",
      name: "What is SEO",
      type: "container",
      category: "content",
      description: "Section explaining SEO services with grid of service items",
      properties: {
        title: {
          type: "string",
          description: "Section title",
          editable: true,
          required: true,
          default: "What is"
        },
        highlightedText: {
          type: "string",
          description: "Highlighted text in the title",
          editable: true,
          default: "SEO"
        },
        subtitle: {
          type: "string",
          description: "Section subtitle",
          editable: true,
          default: "Search Engine Optimization (SEO) is the practice of optimizing your website to rank higher in search results. Here's how we make it work for your business:"
        },
        services: {
          type: "array",
          description: "Array of SEO service items",
          editable: true,
          required: true,
          default: [
            {
              icon: "Search",
              title: "Keyword Research",
              description: "In-depth analysis to identify high-value keywords that drive qualified traffic to your business."
            },
            {
              icon: "FileText",
              title: "On-Page Optimization",
              description: "Optimize your website content, meta tags, and structure for maximum search engine visibility."
            },
            {
              icon: "Code",
              title: "Technical SEO",
              description: "Fix technical issues, improve site speed, and ensure your website is crawlable by search engines."
            },
            {
              icon: "BarChart3",
              title: "SEO Analytics",
              description: "Track and measure your SEO performance with detailed reporting and actionable insights."
            },
            {
              icon: "Link2",
              title: "Link Building",
              description: "Build high-quality backlinks from authoritative websites to boost your domain authority."
            },
            {
              icon: "Users",
              title: "Local SEO",
              description: "Optimize your business for local search results and Google My Business visibility."
            },
            {
              icon: "TrendingUp",
              title: "Content Strategy",
              description: "Create SEO-optimized content that engages your audience and ranks on search engines."
            },
            {
              icon: "Target",
              title: "Competitor Analysis",
              description: "Analyze your competitors' strategies to identify opportunities and stay ahead."
            }
          ]
        },
        ctaText: {
          type: "string",
          description: "CTA text above button",
          editable: true,
          default: "Ready to see how SEO can transform your business?"
        },
        ctaButtonText: {
          type: "string",
          description: "CTA button text",
          editable: true,
          default: "Start Your SEO Partnership"
        },
        backgroundColor: {
          type: "string",
          description: "Background color for the section",
          editable: true,
          default: "#ffffff"
        }
      },
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: ["seo", "services", "education", "content"],
      dependencies: ["framer-motion", "lucide-react"],
      last_updated: "2025-10-17T12:00:00Z"
    };
  }
});

// sparti-cms/registry/components/testimonials.json
var testimonials_default;
var init_testimonials = __esm({
  "sparti-cms/registry/components/testimonials.json"() {
    testimonials_default = {
      id: "testimonials-section",
      name: "Testimonials",
      type: "container",
      category: "content",
      description: "Customer testimonials and reviews",
      properties: {
        sectionTitle: {
          type: "string",
          description: "Section title",
          editable: true,
          required: true,
          default: "What customers say"
        },
        sectionSubtitle: {
          type: "string",
          description: "Section subtitle",
          editable: true,
          default: "Short, neutral subtitle for testimonials."
        },
        testimonials: {
          type: "array",
          description: "Array of testimonial items",
          editable: true,
          required: true,
          default: [
            { text: "This is a sample testimonial used for layout testing.", image: "/placeholder.svg", name: "Alex Doe", role: "Product Manager" },
            { text: "Great experience \u2014 this placeholder quote demonstrates the component state.", image: "/placeholder.svg", name: "Sam Lee", role: "Founder" },
            { text: "A concise example testimonial to verify styles and spacing.", image: "/placeholder.svg", name: "Jordan Kim", role: "Operations Lead" },
            { text: "Neutral review text for design validation and QA.", image: "/placeholder.svg", name: "Taylor Ray", role: "CTO" },
            { text: "Another sample quote for the testimonials grid or carousel.", image: "/placeholder.svg", name: "Riley Chen", role: "Marketing Lead" }
          ]
        },
        backgroundColor: {
          type: "string",
          description: "Background color for the section",
          editable: true,
          default: "#f9fafb"
        }
      },
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: ["testimonials", "reviews", "social-proof", "trust"],
      dependencies: ["framer-motion"],
      last_updated: "2025-10-17T12:00:00Z"
    };
  }
});

// sparti-cms/registry/components/faq.json
var faq_default;
var init_faq = __esm({
  "sparti-cms/registry/components/faq.json"() {
    faq_default = {
      id: "faq-section",
      name: "FAQ Section",
      type: "container",
      category: "interactive",
      description: "Frequently asked questions with accordion",
      properties: {
        title: {
          type: "string",
          description: "Section title",
          editable: true,
          required: true,
          default: "Frequently Asked Questions"
        },
        subtitle: {
          type: "string",
          description: "Section subtitle",
          editable: true,
          default: "Everything you need to know about our SEO services"
        },
        items: {
          type: "array",
          description: "Array of FAQ items",
          editable: true,
          required: true,
          default: [
            {
              question: "How long does it take to see results from SEO?",
              answer: "Most clients start seeing initial improvements within 1-2 months, with significant results typically appearing around the 3-4 month mark. SEO is a long-term strategy, and results continue to compound over time."
            },
            {
              question: "What services are included in your SEO packages?",
              answer: "Our comprehensive SEO packages include keyword research, technical SEO audits, on-page optimization, content creation, link building, local SEO, and detailed monthly reporting with actionable insights."
            },
            {
              question: "How do you measure SEO success?",
              answer: "We track multiple metrics including organic traffic growth, keyword rankings, conversion rates, backlink quality and quantity, page load speed, and ultimately, your return on investment from organic search."
            }
          ]
        }
      },
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: ["faq", "questions", "accordion", "interactive"],
      dependencies: ["framer-motion", "lucide-react"],
      last_updated: "2025-10-17T12:00:00Z"
    };
  }
});

// sparti-cms/registry/components/blog-preview.json
var blog_preview_default;
var init_blog_preview = __esm({
  "sparti-cms/registry/components/blog-preview.json"() {
    blog_preview_default = {
      id: "blog-preview-section",
      name: "Blog Preview",
      type: "container",
      category: "content",
      description: "Preview of latest blog posts",
      properties: {
        title: {
          type: "string",
          description: "Section title",
          editable: true,
          required: true,
          default: "Latest SEO Insights"
        },
        subtitle: {
          type: "string",
          description: "Section subtitle",
          editable: true,
          default: "Stay ahead of the curve with our expert SEO tips, strategies, and industry insights."
        },
        backgroundColor: {
          type: "string",
          description: "Background color for the section",
          editable: true,
          default: "bg-gradient-to-br from-gray-50 to-blue-50/30"
        }
      },
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: ["blog", "posts", "articles", "content"],
      dependencies: ["react-router-dom", "framer-motion", "lucide-react"],
      last_updated: "2025-10-17T12:00:00Z"
    };
  }
});

// sparti-cms/registry/components/whatsapp-button.json
var whatsapp_button_default;
var init_whatsapp_button = __esm({
  "sparti-cms/registry/components/whatsapp-button.json"() {
    whatsapp_button_default = {
      id: "whatsapp-button",
      name: "WhatsApp Button",
      type: "button",
      category: "interactive",
      description: "Floating WhatsApp contact button",
      properties: {
        phoneNumber: {
          type: "string",
          description: "WhatsApp phone number",
          editable: true,
          required: true,
          default: "+6512345678"
        },
        message: {
          type: "string",
          description: "Pre-filled message",
          editable: true,
          default: "Hi, I'm interested in your SEO services"
        },
        position: {
          type: "string",
          description: "Button position",
          editable: true,
          default: "bottom-right"
        }
      },
      editor: "ButtonEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: ["whatsapp", "contact", "floating", "cta"],
      dependencies: ["lucide-react"],
      last_updated: "2025-01-28T12:00:00Z"
    };
  }
});

// sparti-cms/registry/components/contact-modal.json
var contact_modal_default;
var init_contact_modal = __esm({
  "sparti-cms/registry/components/contact-modal.json"() {
    contact_modal_default = {
      id: "contact-modal",
      name: "Contact Modal",
      type: "container",
      category: "interactive",
      description: "Contact form modal overlay",
      properties: {
        modalTitle: {
          type: "string",
          description: "Modal title",
          editable: true,
          default: "Get in Touch"
        },
        formFields: {
          type: "array",
          description: "Form field configuration",
          editable: true,
          default: []
        },
        submitButtonText: {
          type: "string",
          description: "Submit button text",
          editable: true,
          default: "Send Message"
        },
        successMessage: {
          type: "string",
          description: "Success message after submission",
          editable: true,
          default: "Thank you! We'll be in touch soon."
        }
      },
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: ["contact", "form", "modal", "lead-generation"],
      dependencies: ["@radix-ui/react-dialog"],
      last_updated: "2025-01-28T12:00:00Z"
    };
  }
});

// sparti-cms/registry/components/rich-text.json
var rich_text_default;
var init_rich_text = __esm({
  "sparti-cms/registry/components/rich-text.json"() {
    rich_text_default = {
      id: "rich-text-editor",
      name: "Rich Text Editor",
      type: "text",
      category: "content",
      description: "Rich text editor with formatting toolbar for headings, paragraphs, lists, and styling",
      properties: {
        content: {
          type: "string",
          description: "HTML content with formatting",
          editable: true,
          required: true,
          default: "<h2>Add your content here</h2><p>This is a rich text editor with formatting options. You can add headings, paragraphs, lists, and more.</p>"
        },
        alignment: {
          type: "string",
          description: "Text alignment",
          editable: true,
          default: "left"
        },
        maxWidth: {
          type: "string",
          description: "Maximum width of the text container",
          editable: true,
          default: "100%"
        },
        padding: {
          type: "string",
          description: "Padding around the text",
          editable: true,
          default: "1rem"
        }
      },
      editor: "TextEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: ["text", "content", "rich text", "editor", "wysiwyg"],
      dependencies: ["@tiptap/react", "@tiptap/starter-kit", "@tiptap/extension-text-align"],
      last_updated: "2025-10-16T12:00:00Z"
    };
  }
});

// sparti-cms/registry/components/image-gallery.json
var image_gallery_default;
var init_image_gallery = __esm({
  "sparti-cms/registry/components/image-gallery.json"() {
    image_gallery_default = {
      id: "image-gallery",
      name: "Image Gallery",
      type: "media",
      category: "media",
      description: "Image gallery with multiple images that can be displayed in a grid, carousel, or masonry layout",
      properties: {
        images: {
          type: "array",
          description: "Array of image objects with src, alt, and title properties",
          editable: true,
          required: true,
          default: [
            {
              src: "/placeholder.svg",
              alt: "Gallery image 1",
              title: "Image 1"
            },
            {
              src: "/placeholder.svg",
              alt: "Gallery image 2",
              title: "Image 2"
            },
            {
              src: "/placeholder.svg",
              alt: "Gallery image 3",
              title: "Image 3"
            }
          ]
        },
        layout: {
          type: "string",
          description: "Gallery layout style",
          editable: true,
          default: "grid"
        },
        columns: {
          type: "number",
          description: "Number of columns for grid layout",
          editable: true,
          default: 3
        },
        gap: {
          type: "string",
          description: "Gap between images",
          editable: true,
          default: "1rem"
        },
        aspectRatio: {
          type: "string",
          description: "Aspect ratio for images",
          editable: true,
          default: "16/9"
        },
        enableLightbox: {
          type: "boolean",
          description: "Enable lightbox for image viewing",
          editable: true,
          default: true
        }
      },
      editor: "ImageEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: ["images", "gallery", "media", "photos", "grid", "carousel"],
      dependencies: ["framer-motion", "react-responsive-masonry"],
      last_updated: "2025-10-16T12:00:00Z"
    };
  }
});

// sparti-cms/registry/components/background-image.json
var background_image_default;
var init_background_image = __esm({
  "sparti-cms/registry/components/background-image.json"() {
    background_image_default = {
      id: "background-image",
      name: "Background Image",
      type: "container",
      category: "layout",
      description: "Container with customizable background image, color, or video",
      properties: {
        backgroundType: {
          type: "string",
          description: "Type of background (color, image, or video)",
          editable: true,
          default: "image"
        },
        backgroundColor: {
          type: "string",
          description: "Background color (used when type is color)",
          editable: true,
          default: "#ffffff"
        },
        backgroundImage: {
          type: "string",
          description: "URL of the background image",
          editable: true,
          default: "/placeholder.svg"
        },
        backgroundVideo: {
          type: "string",
          description: "URL of the background video",
          editable: true,
          default: ""
        },
        backgroundSize: {
          type: "string",
          description: "Background size property",
          editable: true,
          default: "cover"
        },
        backgroundPosition: {
          type: "string",
          description: "Background position property",
          editable: true,
          default: "center"
        },
        backgroundRepeat: {
          type: "string",
          description: "Background repeat property",
          editable: true,
          default: "no-repeat"
        },
        backgroundAttachment: {
          type: "string",
          description: "Background attachment property",
          editable: true,
          default: "scroll"
        },
        overlay: {
          type: "boolean",
          description: "Add a color overlay on top of the background",
          editable: true,
          default: false
        },
        overlayColor: {
          type: "string",
          description: "Color of the overlay",
          editable: true,
          default: "rgba(0,0,0,0.5)"
        },
        minHeight: {
          type: "string",
          description: "Minimum height of the container",
          editable: true,
          default: "400px"
        },
        padding: {
          type: "string",
          description: "Padding inside the container",
          editable: true,
          default: "2rem"
        },
        content: {
          type: "string",
          description: "Content inside the container",
          editable: true,
          default: "<div class='p-4'><h2>Section with Background</h2><p>Add your content here</p></div>"
        }
      },
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: ["background", "container", "layout", "section", "image", "video"],
      dependencies: [],
      last_updated: "2025-10-16T12:00:00Z"
    };
  }
});

// sparti-cms/registry/components/about-section.json
var about_section_default;
var init_about_section = __esm({
  "sparti-cms/registry/components/about-section.json"() {
    about_section_default = {
      id: "about-section",
      name: "About Section",
      type: "aboutSection",
      category: "content",
      description: "About Section component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: [
        "content",
        "aboutsection"
      ],
      last_updated: "2025-12-25T09:34:01.403Z"
    };
  }
});

// sparti-cms/registry/components/accordion.json
var accordion_default;
var init_accordion = __esm({
  "sparti-cms/registry/components/accordion.json"() {
    accordion_default = {
      id: "accordion",
      name: "Accordion",
      type: "Accordion",
      category: "content",
      description: "Accordion component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: [
        "content",
        "accordion"
      ],
      last_updated: "2025-12-25T09:34:01.388Z"
    };
  }
});

// sparti-cms/registry/components/array.json
var array_default;
var init_array = __esm({
  "sparti-cms/registry/components/array.json"() {
    array_default = {
      id: "array",
      name: "Array",
      type: "array",
      category: "content",
      description: "Array component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: [
        "content",
        "array"
      ],
      last_updated: "2025-12-25T09:34:01.385Z"
    };
  }
});

// sparti-cms/registry/components/blog-section.json
var blog_section_default;
var init_blog_section = __esm({
  "sparti-cms/registry/components/blog-section.json"() {
    blog_section_default = {
      id: "blog-section",
      name: "Blog Section",
      type: "BlogSection",
      category: "content",
      description: "Blog Section component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: [
        "content",
        "blogsection"
      ],
      last_updated: "2025-12-25T09:34:01.408Z"
    };
  }
});

// sparti-cms/registry/components/c-t-a-section.json
var c_t_a_section_default;
var init_c_t_a_section = __esm({
  "sparti-cms/registry/components/c-t-a-section.json"() {
    c_t_a_section_default = {
      id: "c-t-a-section",
      name: "C T A Section",
      type: "CTASection",
      category: "interactive",
      description: "C T A Section component with 0 configurable properties",
      properties: {},
      editor: "ButtonEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: [
        "interactive",
        "cta",
        "button",
        "ctasection"
      ],
      last_updated: "2025-12-25T09:34:01.402Z"
    };
  }
});

// sparti-cms/registry/components/contact-form.json
var contact_form_default;
var init_contact_form = __esm({
  "sparti-cms/registry/components/contact-form.json"() {
    contact_form_default = {
      id: "contact-form",
      name: "Contact Form",
      type: "ContactForm",
      category: "form",
      description: "Contact Form component with 0 configurable properties",
      properties: {},
      editor: "InputEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: [
        "form",
        "form",
        "input",
        "contactform"
      ],
      last_updated: "2025-12-25T09:34:01.408Z"
    };
  }
});

// sparti-cms/registry/components/contact-info.json
var contact_info_default;
var init_contact_info = __esm({
  "sparti-cms/registry/components/contact-info.json"() {
    contact_info_default = {
      id: "contact-info",
      name: "Contact Info",
      type: "ContactInfo",
      category: "content",
      description: "Contact Info component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: [
        "content",
        "contactinfo"
      ],
      last_updated: "2025-12-25T09:34:01.404Z"
    };
  }
});

// sparti-cms/registry/components/content-image-section.json
var content_image_section_default;
var init_content_image_section = __esm({
  "sparti-cms/registry/components/content-image-section.json"() {
    content_image_section_default = {
      id: "section-content-image",
      name: "Content + Image Section",
      type: "container",
      description: "A section with content on the left and images on the right",
      category: "layout",
      subcategory: "Feature",
      tags: ["content", "image", "layout", "section"],
      version: "1.0.0",
      editor: "ContainerEditor",
      properties: {
        backgroundColor: {
          type: "string",
          description: "Background color of the section",
          default: "#ffffff",
          format: "color"
        },
        paddingTop: {
          type: "string",
          description: "Top padding of the section",
          default: "medium",
          enum: ["small", "medium", "large"]
        },
        paddingBottom: {
          type: "string",
          description: "Bottom padding of the section",
          default: "medium",
          enum: ["small", "medium", "large"]
        },
        alignment: {
          type: "string",
          description: "Content alignment",
          default: "left",
          enum: ["left", "center"]
        },
        contentWidth: {
          type: "string",
          description: "Width of the content side",
          default: "50%"
        },
        content: {
          type: "object",
          description: "Content block with heading, text and button",
          properties: {
            heading: {
              type: "string",
              description: "Section heading",
              default: "Powerful Solutions for Your Business"
            },
            text: {
              type: "string",
              description: "Section text content",
              default: "<p>Our comprehensive solutions are designed to meet your business needs and help you achieve your goals. With our expertise and dedication, we deliver results that exceed expectations.</p><p>Contact us today to learn how we can help your business grow.</p>",
              format: "html"
            },
            buttonText: {
              type: "string",
              description: "Button text",
              default: "Learn More"
            },
            buttonUrl: {
              type: "string",
              description: "Button URL",
              default: "/services"
            },
            buttonStyle: {
              type: "string",
              description: "Button style",
              default: "primary",
              enum: ["primary", "secondary", "outline"]
            }
          }
        },
        images: {
          type: "array",
          description: "Image gallery",
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "Unique ID for the image"
              },
              src: {
                type: "string",
                description: "Image source URL",
                format: "url"
              },
              alt: {
                type: "string",
                description: "Image alt text"
              },
              caption: {
                type: "string",
                description: "Image caption"
              }
            }
          },
          default: [
            {
              id: "img-1",
              src: "/assets/images/content-image-1.jpg",
              alt: "Business professionals in a meeting",
              caption: "Our team of experts"
            }
          ]
        }
      },
      components: ["field-rich-text", "field-gallery", "component-button"]
    };
  }
});

// sparti-cms/registry/components/content-section.json
var content_section_default;
var init_content_section = __esm({
  "sparti-cms/registry/components/content-section.json"() {
    content_section_default = {
      id: "content-section",
      name: "Content Section",
      type: "ContentSection",
      category: "content",
      description: "Content Section component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: [
        "content",
        "content",
        "text",
        "contentsection"
      ],
      last_updated: "2025-12-25T09:34:01.386Z"
    };
  }
});

// sparti-cms/registry/components/content.json
var content_default2;
var init_content2 = __esm({
  "sparti-cms/registry/components/content.json"() {
    content_default2 = {
      id: "content",
      name: "Content",
      type: "Content",
      category: "content",
      description: "Content component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: [
        "content",
        "content",
        "text"
      ],
      last_updated: "2025-12-25T09:34:01.387Z"
    };
  }
});

// sparti-cms/registry/components/cta-section.json
var cta_section_default;
var init_cta_section = __esm({
  "sparti-cms/registry/components/cta-section.json"() {
    cta_section_default = {
      id: "cta-section",
      name: "Cta Section",
      type: "ctaSection",
      category: "interactive",
      description: "Cta Section component with 0 configurable properties",
      properties: {},
      editor: "ButtonEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: [
        "interactive",
        "cta",
        "button",
        "ctasection"
      ],
      last_updated: "2025-12-25T09:34:01.401Z"
    };
  }
});

// sparti-cms/registry/components/f-a-q-accordion.json
var f_a_q_accordion_default;
var init_f_a_q_accordion = __esm({
  "sparti-cms/registry/components/f-a-q-accordion.json"() {
    f_a_q_accordion_default = {
      id: "f-a-q-accordion",
      name: "F A Q Accordion",
      type: "FAQAccordion",
      category: "content",
      description: "F A Q Accordion component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: [
        "content",
        "faqaccordion"
      ],
      last_updated: "2025-12-25T09:34:01.407Z"
    };
  }
});

// sparti-cms/registry/components/f-a-q-section.json
var f_a_q_section_default;
var init_f_a_q_section = __esm({
  "sparti-cms/registry/components/f-a-q-section.json"() {
    f_a_q_section_default = {
      id: "f-a-q-section",
      name: "F A Q Section",
      type: "FAQSection",
      category: "content",
      description: "F A Q Section component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: [
        "content",
        "faqsection"
      ],
      last_updated: "2025-12-25T09:34:01.397Z"
    };
  }
});

// sparti-cms/registry/components/faq-section.json
var faq_section_default;
var init_faq_section = __esm({
  "sparti-cms/registry/components/faq-section.json"() {
    faq_section_default = {
      id: "faq-section",
      name: "Faq Section",
      type: "faqSection",
      category: "content",
      description: "Faq Section component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: [
        "content",
        "faqsection"
      ],
      last_updated: "2025-12-25T09:34:01.400Z"
    };
  }
});

// sparti-cms/registry/components/features-section.json
var features_section_default;
var init_features_section = __esm({
  "sparti-cms/registry/components/features-section.json"() {
    features_section_default = {
      id: "features-section",
      name: "Features Section",
      type: "featuresSection",
      category: "content",
      description: "Features Section component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: [
        "content",
        "featuressection"
      ],
      last_updated: "2025-12-25T09:34:01.394Z"
    };
  }
});

// sparti-cms/registry/components/gallery-section.json
var gallery_section_default;
var init_gallery_section = __esm({
  "sparti-cms/registry/components/gallery-section.json"() {
    gallery_section_default = {
      id: "gallery-section",
      name: "Gallery Section",
      type: "GallerySection",
      category: "media",
      description: "Gallery Section component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: [
        "media",
        "media",
        "image",
        "gallerysection"
      ],
      last_updated: "2025-12-25T09:34:01.393Z"
    };
  }
});

// sparti-cms/registry/components/hero-section-simple.json
var hero_section_simple_default;
var init_hero_section_simple = __esm({
  "sparti-cms/registry/components/hero-section-simple.json"() {
    hero_section_simple_default = {
      id: "hero-section-simple",
      name: "Hero Section Simple",
      type: "HeroSectionSimple",
      category: "content",
      description: "Hero Section Simple component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: [
        "content",
        "hero",
        "banner",
        "herosectionsimple"
      ],
      last_updated: "2025-12-25T09:34:01.397Z"
    };
  }
});

// sparti-cms/registry/components/hero-section.json
var hero_section_default;
var init_hero_section = __esm({
  "sparti-cms/registry/components/hero-section.json"() {
    hero_section_default = {
      id: "hero-section",
      name: "Hero Section",
      type: "HeroSection",
      category: "content",
      description: "Hero Section component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: [
        "content",
        "hero",
        "banner",
        "herosection"
      ],
      last_updated: "2025-12-25T09:34:01.384Z"
    };
  }
});

// sparti-cms/registry/components/image-content-section.json
var image_content_section_default;
var init_image_content_section = __esm({
  "sparti-cms/registry/components/image-content-section.json"() {
    image_content_section_default = {
      id: "section-image-content",
      name: "Image + Content Section",
      type: "container",
      description: "A section with images on the left and content on the right",
      category: "layout",
      subcategory: "Feature",
      tags: ["image", "content", "layout", "section"],
      version: "1.0.0",
      editor: "ContainerEditor",
      properties: {
        backgroundColor: {
          type: "string",
          description: "Background color of the section",
          default: "#f8f9fa",
          format: "color"
        },
        paddingTop: {
          type: "string",
          description: "Top padding of the section",
          default: "medium",
          enum: ["small", "medium", "large"]
        },
        paddingBottom: {
          type: "string",
          description: "Bottom padding of the section",
          default: "medium",
          enum: ["small", "medium", "large"]
        },
        alignment: {
          type: "string",
          description: "Content alignment",
          default: "right",
          enum: ["right", "center"]
        },
        contentWidth: {
          type: "string",
          description: "Width of the content side",
          default: "50%"
        },
        content: {
          type: "object",
          description: "Content block with heading, text and button",
          properties: {
            heading: {
              type: "string",
              description: "Section heading",
              default: "Innovative Approaches to Digital Marketing"
            },
            text: {
              type: "string",
              description: "Section text content",
              default: "<p>Our innovative digital marketing strategies help businesses connect with their target audience and achieve measurable results. We combine creativity with data-driven insights to create campaigns that drive engagement and conversions.</p>",
              format: "html"
            },
            buttonText: {
              type: "string",
              description: "Button text",
              default: "Get Started"
            },
            buttonUrl: {
              type: "string",
              description: "Button URL",
              default: "/contact"
            },
            buttonStyle: {
              type: "string",
              description: "Button style",
              default: "primary",
              enum: ["primary", "secondary", "outline"]
            }
          }
        },
        images: {
          type: "array",
          description: "Image gallery",
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "Unique ID for the image"
              },
              src: {
                type: "string",
                description: "Image source URL",
                format: "url"
              },
              alt: {
                type: "string",
                description: "Image alt text"
              },
              caption: {
                type: "string",
                description: "Image caption"
              }
            }
          },
          default: [
            {
              id: "img-1",
              src: "/assets/images/image-content-1.jpg",
              alt: "Digital marketing dashboard",
              caption: "Data-driven marketing solutions"
            }
          ]
        }
      },
      components: ["field-rich-text", "field-gallery", "component-button"]
    };
  }
});

// sparti-cms/registry/components/ingredients-section.json
var ingredients_section_default;
var init_ingredients_section = __esm({
  "sparti-cms/registry/components/ingredients-section.json"() {
    ingredients_section_default = {
      id: "ingredients-section",
      name: "Ingredients Section",
      type: "ingredientsSection",
      category: "content",
      description: "Ingredients Section component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: [
        "content",
        "ingredientssection"
      ],
      last_updated: "2025-12-25T09:34:01.402Z"
    };
  }
});

// sparti-cms/registry/components/newsletter.json
var newsletter_default;
var init_newsletter = __esm({
  "sparti-cms/registry/components/newsletter.json"() {
    newsletter_default = {
      id: "newsletter",
      name: "Newsletter",
      type: "Newsletter",
      category: "content",
      description: "Newsletter component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: [
        "content",
        "newsletter"
      ],
      last_updated: "2025-12-25T09:34:01.393Z"
    };
  }
});

// sparti-cms/registry/components/page-title.json
var page_title_default;
var init_page_title = __esm({
  "sparti-cms/registry/components/page-title.json"() {
    page_title_default = {
      id: "page-title",
      name: "Page Title",
      type: "PageTitle",
      category: "content",
      description: "Page Title component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: [
        "content",
        "pagetitle"
      ],
      last_updated: "2025-12-25T09:34:01.386Z"
    };
  }
});

// sparti-cms/registry/components/pain-point-section.json
var pain_point_section_default;
var init_pain_point_section = __esm({
  "sparti-cms/registry/components/pain-point-section.json"() {
    pain_point_section_default = {
      id: "pain-point-section",
      name: "Pain Point Section",
      type: "PainPointSection",
      category: "content",
      description: "Pain Point Section component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: [
        "content",
        "painpointsection"
      ],
      last_updated: "2025-12-25T09:34:01.404Z"
    };
  }
});

// sparti-cms/registry/components/product-grid.json
var product_grid_default;
var init_product_grid = __esm({
  "sparti-cms/registry/components/product-grid.json"() {
    product_grid_default = {
      id: "product-grid",
      name: "Product Grid",
      type: "ProductGrid",
      category: "content",
      description: "Product Grid component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: [
        "content",
        "productgrid"
      ],
      last_updated: "2025-12-25T09:34:01.391Z"
    };
  }
});

// sparti-cms/registry/components/results-section.json
var results_section_default;
var init_results_section = __esm({
  "sparti-cms/registry/components/results-section.json"() {
    results_section_default = {
      id: "results-section",
      name: "Results Section",
      type: "ResultsSection",
      category: "content",
      description: "Results Section component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: [
        "content",
        "resultssection"
      ],
      last_updated: "2025-12-25T09:34:01.405Z"
    };
  }
});

// sparti-cms/registry/components/reviews.json
var reviews_default;
var init_reviews = __esm({
  "sparti-cms/registry/components/reviews.json"() {
    reviews_default = {
      id: "reviews",
      name: "Reviews",
      type: "Reviews",
      category: "content",
      description: "Reviews component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: [
        "content",
        "reviews"
      ],
      last_updated: "2025-12-25T09:34:01.392Z"
    };
  }
});

// sparti-cms/registry/components/s-e-o-explanation.json
var s_e_o_explanation_default;
var init_s_e_o_explanation = __esm({
  "sparti-cms/registry/components/s-e-o-explanation.json"() {
    s_e_o_explanation_default = {
      id: "s-e-o-explanation",
      name: "S E O Explanation",
      type: "SEOExplanation",
      category: "content",
      description: "S E O Explanation component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: [
        "content",
        "seoexplanation"
      ],
      last_updated: "2025-12-25T09:34:01.406Z"
    };
  }
});

// sparti-cms/registry/components/s-e-o.json
var s_e_o_default;
var init_s_e_o = __esm({
  "sparti-cms/registry/components/s-e-o.json"() {
    s_e_o_default = {
      id: "s-e-o",
      name: "S E O",
      type: "SEO",
      category: "content",
      description: "S E O component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: [
        "content",
        "seo"
      ],
      last_updated: "2025-12-25T09:34:01.388Z"
    };
  }
});

// sparti-cms/registry/components/services-grid.json
var services_grid_default;
var init_services_grid = __esm({
  "sparti-cms/registry/components/services-grid.json"() {
    services_grid_default = {
      id: "services-grid",
      name: "Services Grid",
      type: "ServicesGrid",
      category: "content",
      description: "Services Grid component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: [
        "content",
        "servicesgrid"
      ],
      last_updated: "2025-12-25T09:34:01.396Z"
    };
  }
});

// sparti-cms/registry/components/services-section.json
var services_section_default;
var init_services_section = __esm({
  "sparti-cms/registry/components/services-section.json"() {
    services_section_default = {
      id: "services-section",
      name: "Services Section",
      type: "servicesSection",
      category: "content",
      description: "Services Section component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: [
        "content",
        "servicessection"
      ],
      last_updated: "2025-12-25T09:34:01.395Z"
    };
  }
});

// sparti-cms/registry/components/services-showcase.json
var services_showcase_default;
var init_services_showcase = __esm({
  "sparti-cms/registry/components/services-showcase.json"() {
    services_showcase_default = {
      id: "services-showcase",
      name: "Services Showcase",
      type: "ServicesShowcase",
      category: "content",
      description: "Services Showcase component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: [
        "content",
        "servicesshowcase"
      ],
      last_updated: "2025-12-25T09:34:01.405Z"
    };
  }
});

// sparti-cms/registry/components/showcase.json
var showcase_default;
var init_showcase = __esm({
  "sparti-cms/registry/components/showcase.json"() {
    showcase_default = {
      id: "showcase",
      name: "Showcase",
      type: "Showcase",
      category: "content",
      description: "Showcase component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: [
        "content",
        "showcase"
      ],
      last_updated: "2025-12-25T09:34:01.390Z"
    };
  }
});

// sparti-cms/registry/components/simple-header.json
var simple_header_default;
var init_simple_header = __esm({
  "sparti-cms/registry/components/simple-header.json"() {
    simple_header_default = {
      id: "simple-header",
      name: "Simple Header",
      type: "SimpleHeader",
      category: "layout",
      description: "Simple Header component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: [
        "layout",
        "navigation",
        "header",
        "simpleheader"
      ],
      last_updated: "2025-12-25T09:34:01.392Z"
    };
  }
});

// sparti-cms/registry/components/simple-hero-banner.json
var simple_hero_banner_default;
var init_simple_hero_banner = __esm({
  "sparti-cms/registry/components/simple-hero-banner.json"() {
    simple_hero_banner_default = {
      id: "simple-hero-banner",
      name: "Simple Hero Banner",
      type: "SimpleHeroBanner",
      category: "content",
      description: "Simple Hero Banner component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: [
        "content",
        "hero",
        "banner",
        "simpleherobanner"
      ],
      last_updated: "2025-12-25T09:34:01.389Z"
    };
  }
});

// sparti-cms/registry/components/social-media.json
var social_media_default;
var init_social_media = __esm({
  "sparti-cms/registry/components/social-media.json"() {
    social_media_default = {
      id: "social-media",
      name: "Social Media",
      type: "SocialMedia",
      category: "media",
      description: "Social Media component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: [
        "media",
        "socialmedia"
      ],
      last_updated: "2025-12-25T09:34:01.396Z"
    };
  }
});

// sparti-cms/registry/components/team-section.json
var team_section_default;
var init_team_section = __esm({
  "sparti-cms/registry/components/team-section.json"() {
    team_section_default = {
      id: "team-section",
      name: "Team Section",
      type: "teamSection",
      category: "content",
      description: "Team Section component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: [
        "content",
        "teamsection"
      ],
      last_updated: "2025-12-25T09:34:01.403Z"
    };
  }
});

// sparti-cms/registry/components/testimonials-section.json
var testimonials_section_default;
var init_testimonials_section = __esm({
  "sparti-cms/registry/components/testimonials-section.json"() {
    testimonials_section_default = {
      id: "testimonials-section",
      name: "Testimonials Section",
      type: "testimonialsSection",
      category: "content",
      description: "Testimonials Section component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: [
        "content",
        "testimonialssection"
      ],
      last_updated: "2025-12-25T09:34:01.399Z"
    };
  }
});

// sparti-cms/registry/components/video-section.json
var video_section_default;
var init_video_section = __esm({
  "sparti-cms/registry/components/video-section.json"() {
    video_section_default = {
      id: "video-section",
      name: "Video Section",
      type: "videoSection",
      category: "content",
      description: "Video Section component with 0 configurable properties",
      properties: {},
      editor: "VideoEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: [
        "content",
        "videosection"
      ],
      last_updated: "2025-12-25T09:34:01.398Z"
    };
  }
});

// sparti-cms/registry/components/whats-included-section.json
var whats_included_section_default;
var init_whats_included_section = __esm({
  "sparti-cms/registry/components/whats-included-section.json"() {
    whats_included_section_default = {
      id: "whats-included-section",
      name: "Whats Included Section",
      type: "whatsIncludedSection",
      category: "content",
      description: "Whats Included Section component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: [
        "content",
        "whatsincludedsection"
      ],
      last_updated: "2025-12-25T09:34:01.398Z"
    };
  }
});

// sparti-cms/registry/components/why-choose-us-section.json
var why_choose_us_section_default;
var init_why_choose_us_section = __esm({
  "sparti-cms/registry/components/why-choose-us-section.json"() {
    why_choose_us_section_default = {
      id: "why-choose-us-section",
      name: "Why Choose Us Section",
      type: "whyChooseUsSection",
      category: "content",
      description: "Why Choose Us Section component with 0 configurable properties",
      properties: {},
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "tenant",
      tags: [
        "content",
        "whychooseussection"
      ],
      last_updated: "2025-12-25T09:34:01.400Z"
    };
  }
});

// sparti-cms/registry/components/flowbite-blog-hero.json
var flowbite_blog_hero_default;
var init_flowbite_blog_hero = __esm({
  "sparti-cms/registry/components/flowbite-blog-hero.json"() {
    flowbite_blog_hero_default = {
      id: "flowbite-blog-hero",
      name: "Flowbite Blog Hero",
      type: "container",
      category: "content",
      description: "Hero section for blog page with title, subtitle, and search functionality using Flowbite design system",
      properties: {
        title: {
          type: "string",
          description: "Hero title text",
          editable: true,
          required: false,
          default: "SEO Insights & Expert Tips"
        },
        subtitle: {
          type: "string",
          description: "Hero subtitle/description text",
          editable: true,
          required: false,
          default: "Stay ahead of the curve with our latest SEO strategies, industry insights, and actionable tips to grow your online presence."
        },
        searchPlaceholder: {
          type: "string",
          description: "Search input placeholder text",
          editable: true,
          required: false,
          default: "Search articles..."
        },
        showSearch: {
          type: "boolean",
          description: "Show/hide search bar",
          editable: true,
          required: false,
          default: true
        }
      },
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: ["blog", "hero", "search", "flowbite", "diora"],
      dependencies: ["flowbite-react"],
      design_system: "flowbite",
      last_updated: "2025-01-27T00:00:00Z"
    };
  }
});

// sparti-cms/registry/components/flowbite-blog-grid.json
var flowbite_blog_grid_default;
var init_flowbite_blog_grid = __esm({
  "sparti-cms/registry/components/flowbite-blog-grid.json"() {
    flowbite_blog_grid_default = {
      id: "flowbite-blog-grid",
      name: "Flowbite Blog Grid",
      type: "container",
      category: "content",
      description: "Displays blog posts in a responsive grid layout using Flowbite design system",
      properties: {
        title: {
          type: "string",
          description: "Section title",
          editable: true,
          required: false,
          default: ""
        },
        subtitle: {
          type: "string",
          description: "Section subtitle",
          editable: true,
          required: false,
          default: ""
        },
        posts: {
          type: "array",
          description: "Array of blog post objects",
          editable: true,
          required: false,
          default: []
        }
      },
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: ["blog", "posts", "grid", "flowbite", "diora"],
      dependencies: ["flowbite-react"],
      design_system: "flowbite",
      last_updated: "2025-01-27T00:00:00Z"
    };
  }
});

// sparti-cms/registry/components/flowbite-blog-sidebar.json
var flowbite_blog_sidebar_default;
var init_flowbite_blog_sidebar = __esm({
  "sparti-cms/registry/components/flowbite-blog-sidebar.json"() {
    flowbite_blog_sidebar_default = {
      id: "flowbite-blog-sidebar",
      name: "Flowbite Blog Sidebar",
      type: "container",
      category: "navigation",
      description: "Sidebar with categories for blog filtering using Flowbite design system",
      properties: {
        title: {
          type: "string",
          description: "Sidebar title",
          editable: true,
          required: false,
          default: "Categories"
        },
        categories: {
          type: "array",
          description: "Array of category names or objects",
          editable: true,
          required: false,
          default: ["All", "SEO Strategy", "Local SEO", "Technical SEO"]
        },
        selectedCategory: {
          type: "string",
          description: "Currently selected category",
          editable: true,
          required: false,
          default: "all"
        }
      },
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: ["blog", "sidebar", "categories", "filter", "flowbite", "diora"],
      dependencies: ["flowbite-react"],
      design_system: "flowbite",
      last_updated: "2025-01-27T00:00:00Z"
    };
  }
});

// sparti-cms/registry/components/flowbite-pain-point-section.json
var flowbite_pain_point_section_default;
var init_flowbite_pain_point_section = __esm({
  "sparti-cms/registry/components/flowbite-pain-point-section.json"() {
    flowbite_pain_point_section_default = {
      id: "flowbite-pain-point-section",
      name: "Flowbite Pain Point Section",
      type: "container",
      category: "content",
      description: "Section highlighting customer pain points/problems using Flowbite design system",
      properties: {
        title: {
          type: "string",
          description: "Section title",
          editable: true,
          required: false,
          default: "You Invest... But Nothing Happens?"
        },
        subtitle: {
          type: "string",
          description: "Section subtitle/badge text",
          editable: true,
          required: false,
          default: "You have a website but it's not generating clicks?"
        },
        painPoints: {
          type: "array",
          description: "Array of pain point objects with icon and text",
          editable: true,
          required: false,
          default: [
            { icon: "X", text: "Organic traffic stuck at 0" },
            { icon: "Click", text: "No clicks, no leads, no sales" },
            { icon: "Chart", text: "Competitors ranking above you" }
          ]
        }
      },
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: ["pain-points", "problems", "challenges", "flowbite", "diora"],
      dependencies: ["flowbite-react"],
      design_system: "flowbite",
      last_updated: "2025-01-27T00:00:00Z"
    };
  }
});

// sparti-cms/registry/components/flowbite-seo-results-section.json
var flowbite_seo_results_section_default;
var init_flowbite_seo_results_section = __esm({
  "sparti-cms/registry/components/flowbite-seo-results-section.json"() {
    flowbite_seo_results_section_default = {
      id: "flowbite-seo-results-section",
      name: "Flowbite SEO Results Section",
      type: "container",
      category: "content",
      description: "Showcase of SEO results and case studies with slider using Flowbite design system",
      properties: {
        title: {
          type: "string",
          description: "Section title",
          editable: true,
          required: false,
          default: "Real SEO Results"
        },
        subtitle: {
          type: "string",
          description: "Section subtitle",
          editable: true,
          required: false,
          default: "See how we've helped businesses like yours achieve remarkable growth through strategic SEO implementation."
        },
        results: {
          type: "array",
          description: "Array of result/case study objects",
          editable: true,
          required: false,
          default: []
        },
        button: {
          type: "object",
          description: "CTA button configuration",
          editable: true,
          required: false,
          default: {
            content: "Become Our Next Case Study",
            link: "#"
          }
        }
      },
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: ["seo", "results", "case-studies", "slider", "flowbite", "diora"],
      dependencies: ["flowbite-react"],
      design_system: "flowbite",
      last_updated: "2025-01-27T00:00:00Z"
    };
  }
});

// sparti-cms/registry/components/flowbite-what-is-seo-section.json
var flowbite_what_is_seo_section_default;
var init_flowbite_what_is_seo_section = __esm({
  "sparti-cms/registry/components/flowbite-what-is-seo-section.json"() {
    flowbite_what_is_seo_section_default = {
      id: "flowbite-what-is-seo-section",
      name: "Flowbite What is SEO Section",
      type: "container",
      category: "content",
      description: "Section explaining SEO services/features in a grid layout using Flowbite design system",
      properties: {
        title: {
          type: "string",
          description: "Section title",
          editable: true,
          required: false,
          default: "What is SEO?"
        },
        subtitle: {
          type: "string",
          description: "Section subtitle",
          editable: true,
          required: false,
          default: "Search Engine Optimization (SEO) is the practice of optimizing your website to rank higher in search results."
        },
        services: {
          type: "array",
          description: "Array of SEO service objects with icon, title, and description",
          editable: true,
          required: false,
          default: []
        }
      },
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: ["seo", "services", "features", "grid", "flowbite", "diora"],
      dependencies: ["flowbite-react"],
      design_system: "flowbite",
      last_updated: "2025-01-27T00:00:00Z"
    };
  }
});

// sparti-cms/registry/components/flowbite-testimonials-section.json
var flowbite_testimonials_section_default;
var init_flowbite_testimonials_section = __esm({
  "sparti-cms/registry/components/flowbite-testimonials-section.json"() {
    flowbite_testimonials_section_default = {
      id: "flowbite-testimonials-section",
      name: "Flowbite Testimonials Section",
      type: "container",
      category: "content",
      description: "Displays customer testimonials in a grid layout using Flowbite design system",
      properties: {
        title: {
          type: "string",
          description: "Section title",
          editable: true,
          required: false,
          default: "What our clients say"
        },
        subtitle: {
          type: "string",
          description: "Section subtitle",
          editable: true,
          required: false,
          default: "See what our customers have to say about our services and results."
        },
        testimonials: {
          type: "array",
          description: "Array of testimonial objects with text, name, role, and image",
          editable: true,
          required: false,
          default: []
        }
      },
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: ["testimonials", "reviews", "social-proof", "flowbite", "diora"],
      dependencies: ["flowbite-react"],
      design_system: "flowbite",
      last_updated: "2025-01-27T00:00:00Z"
    };
  }
});

// sparti-cms/registry/components/flowbite-faq-section.json
var flowbite_faq_section_default;
var init_flowbite_faq_section = __esm({
  "sparti-cms/registry/components/flowbite-faq-section.json"() {
    flowbite_faq_section_default = {
      id: "flowbite-faq-section",
      name: "Flowbite FAQ Section",
      type: "container",
      category: "interactive",
      description: "Displays FAQ items in an accordion using Flowbite design system",
      properties: {
        title: {
          type: "string",
          description: "Section title",
          editable: true,
          required: false,
          default: "Frequently Asked Questions"
        },
        subtitle: {
          type: "string",
          description: "Section subtitle",
          editable: true,
          required: false,
          default: ""
        },
        faqItems: {
          type: "array",
          description: "Array of FAQ objects with question and answer",
          editable: true,
          required: false,
          default: []
        }
      },
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: ["faq", "accordion", "questions", "interactive", "flowbite", "diora"],
      dependencies: ["flowbite-react"],
      design_system: "flowbite",
      last_updated: "2025-01-27T00:00:00Z"
    };
  }
});

// sparti-cms/registry/components/flowbite-newsletter.json
var flowbite_newsletter_default;
var init_flowbite_newsletter = __esm({
  "sparti-cms/registry/components/flowbite-newsletter.json"() {
    flowbite_newsletter_default = {
      id: "flowbite-newsletter",
      name: "Flowbite Newsletter",
      type: "container",
      category: "interactive",
      description: "Newsletter subscription form with title, subtitle, email input, and subscribe button using Flowbite design system",
      properties: {
        title: {
          type: "string",
          description: "Newsletter title",
          editable: true,
          required: false,
          default: "Subscribe to our Newsletter"
        },
        subtitle: {
          type: "string",
          description: "Newsletter subtitle/description",
          editable: true,
          required: false,
          default: "Stay updated with our latest news and offers."
        },
        placeholder: {
          type: "string",
          description: "Email input placeholder text",
          editable: true,
          required: false,
          default: "Enter your email"
        },
        button: {
          type: "object",
          description: "Subscribe button configuration",
          editable: true,
          required: false,
          default: {
            content: "Subscribe",
            link: "#"
          }
        }
      },
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: ["newsletter", "subscription", "email", "form", "flowbite", "diora"],
      dependencies: ["flowbite-react"],
      design_system: "flowbite",
      last_updated: "2025-01-27T00:00:00Z"
    };
  }
});

// sparti-cms/registry/components/flowbite-page-title.json
var flowbite_page_title_default;
var init_flowbite_page_title = __esm({
  "sparti-cms/registry/components/flowbite-page-title.json"() {
    flowbite_page_title_default = {
      id: "flowbite-page-title",
      name: "Flowbite Page Title",
      type: "container",
      category: "content",
      description: "Simple page title section with heading and optional subtitle using Flowbite design system",
      properties: {
        title: {
          type: "string",
          description: "Page title/heading",
          editable: true,
          required: true,
          default: ""
        },
        subtitle: {
          type: "string",
          description: "Page subtitle",
          editable: true,
          required: false,
          default: ""
        }
      },
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: ["title", "heading", "page", "flowbite", "diora"],
      dependencies: ["flowbite-react"],
      design_system: "flowbite",
      last_updated: "2025-01-27T00:00:00Z"
    };
  }
});

// sparti-cms/registry/components/flowbite-content.json
var flowbite_content_default;
var init_flowbite_content = __esm({
  "sparti-cms/registry/components/flowbite-content.json"() {
    flowbite_content_default = {
      id: "flowbite-content",
      name: "Flowbite Content",
      type: "container",
      category: "content",
      description: "Rich text content section for displaying page content using Flowbite design system",
      properties: {
        title: {
          type: "string",
          description: "Content section title (optional)",
          editable: true,
          required: false,
          default: ""
        },
        content: {
          type: "string",
          description: "Rich text content (HTML supported)",
          editable: true,
          required: false,
          default: ""
        }
      },
      editor: "ContainerEditor",
      version: "1.0.0",
      tenant_scope: "global",
      tags: ["content", "text", "rich-text", "html", "flowbite", "diora"],
      dependencies: ["flowbite-react"],
      design_system: "flowbite",
      last_updated: "2025-01-27T00:00:00Z"
    };
  }
});

// sparti-cms/registry/types.ts
var init_types = __esm({
  "sparti-cms/registry/types.ts"() {
  }
});

// sparti-cms/registry/index.ts
var registry_exports = {};
__export(registry_exports, {
  ComponentRegistry: () => ComponentRegistry,
  componentRegistry: () => componentRegistry
});
var ComponentRegistry, componentRegistry;
var init_registry = __esm({
  "sparti-cms/registry/index.ts"() {
    init_sync();
    init_header();
    init_footer();
    init_hero();
    init_client_logos();
    init_pain_points();
    init_seo_results();
    init_services();
    init_what_is_seo();
    init_testimonials();
    init_faq();
    init_blog_preview();
    init_whatsapp_button();
    init_contact_modal();
    init_rich_text();
    init_image_gallery();
    init_background_image();
    init_about_section();
    init_accordion();
    init_array();
    init_blog_section();
    init_c_t_a_section();
    init_contact_form();
    init_contact_info();
    init_content_image_section();
    init_content_section();
    init_content2();
    init_cta_section();
    init_f_a_q_accordion();
    init_f_a_q_section();
    init_faq_section();
    init_features_section();
    init_gallery_section();
    init_hero_section_simple();
    init_hero_section();
    init_image_content_section();
    init_ingredients_section();
    init_newsletter();
    init_page_title();
    init_pain_point_section();
    init_product_grid();
    init_results_section();
    init_reviews();
    init_s_e_o_explanation();
    init_s_e_o();
    init_services_grid();
    init_services_section();
    init_services_showcase();
    init_showcase();
    init_simple_header();
    init_simple_hero_banner();
    init_social_media();
    init_team_section();
    init_testimonials_section();
    init_video_section();
    init_what_is_seo();
    init_whats_included_section();
    init_why_choose_us_section();
    init_flowbite_blog_hero();
    init_flowbite_blog_grid();
    init_flowbite_blog_sidebar();
    init_flowbite_pain_point_section();
    init_flowbite_seo_results_section();
    init_flowbite_what_is_seo_section();
    init_flowbite_testimonials_section();
    init_flowbite_faq_section();
    init_flowbite_newsletter();
    init_flowbite_page_title();
    init_flowbite_content();
    init_types();
    ComponentRegistry = class _ComponentRegistry {
      static instance;
      components = /* @__PURE__ */ new Map();
      // Initialization flag removed as it's handled in constructor
      constructor() {
        this.loadLocalComponents();
      }
      static getInstance() {
        if (!_ComponentRegistry.instance) {
          _ComponentRegistry.instance = new _ComponentRegistry();
        }
        return _ComponentRegistry.instance;
      }
      loadLocalComponents() {
        const gosgComponents = [
          // Layout Components
          header_default,
          footer_default,
          // Hero Section Components
          hero_default,
          client_logos_default,
          // Content Section Components
          pain_points_default,
          seo_results_default,
          services_default,
          what_is_seo_default,
          testimonials_default,
          // Interactive Components
          faq_default,
          blog_preview_default,
          // Utility Components
          whatsapp_button_default,
          contact_modal_default,
          // New Schema Editor Components
          rich_text_default,
          image_gallery_default,
          background_image_default,
          // Auto-generated components
          about_section_default,
          accordion_default,
          array_default,
          blog_section_default,
          c_t_a_section_default,
          contact_form_default,
          contact_info_default,
          content_image_section_default,
          content_section_default,
          content_default2,
          cta_section_default,
          f_a_q_accordion_default,
          f_a_q_section_default,
          faq_section_default,
          features_section_default,
          gallery_section_default,
          hero_section_simple_default,
          hero_section_default,
          image_content_section_default,
          ingredients_section_default,
          newsletter_default,
          page_title_default,
          pain_point_section_default,
          product_grid_default,
          results_section_default,
          reviews_default,
          s_e_o_explanation_default,
          s_e_o_default,
          services_grid_default,
          services_section_default,
          services_showcase_default,
          showcase_default,
          simple_header_default,
          simple_hero_banner_default,
          social_media_default,
          team_section_default,
          testimonials_section_default,
          video_section_default,
          what_is_seo_default,
          whats_included_section_default,
          why_choose_us_section_default,
          // Flowbite blog components
          flowbite_blog_hero_default,
          flowbite_blog_grid_default,
          flowbite_blog_sidebar_default,
          // Flowbite homepage components
          flowbite_pain_point_section_default,
          flowbite_seo_results_section_default,
          flowbite_what_is_seo_section_default,
          flowbite_testimonials_section_default,
          flowbite_faq_section_default,
          // Flowbite Moski components
          flowbite_newsletter_default,
          flowbite_page_title_default,
          flowbite_content_default
        ];
        gosgComponents.forEach((component) => {
          this.components.set(component.id, component);
        });
      }
      /**
       * Get all registered components
       */
      getAll() {
        return Array.from(this.components.values());
      }
      /**
       * Get component by ID
       */
      get(id) {
        return this.components.get(id);
      }
      /**
       * Get components by type
       */
      getByType(type) {
        return this.getAll().filter((component) => component.type === type);
      }
      /**
       * Get components by category
       */
      getByCategory(category) {
        return this.getAll().filter((component) => component.category === category);
      }
      /**
       * Get components by tags
       */
      getByTags(tags) {
        return this.getAll().filter(
          (component) => component.tags && tags.some((tag) => component.tags.includes(tag))
        );
      }
      /**
       * Register a new component
       */
      register(component) {
        this.validateComponent(component);
        this.components.set(component.id, component);
      }
      /**
       * Unregister a component
       */
      unregister(id) {
        return this.components.delete(id);
      }
      /**
       * Check if component exists
       */
      has(id) {
        return this.components.has(id);
      }
      /**
       * Get component editor
       */
      getEditor(id) {
        const component = this.get(id);
        return component?.editor;
      }
      /**
       * Search components by name or description
       */
      search(query2) {
        const lowerQuery = query2.toLowerCase();
        return this.getAll().filter(
          (component) => component.name.toLowerCase().includes(lowerQuery) || component.description && component.description.toLowerCase().includes(lowerQuery) || component.tags && component.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );
      }
      /**
       * Sync with database
       */
      async syncFromDatabase(tenantId) {
        const result = await syncFromDatabase(tenantId);
        result.added.forEach((component) => this.register(component));
        result.updated.forEach((component) => this.register(component));
        result.removed.forEach((id) => this.unregister(id));
      }
      /**
       * Push local components to database
       */
      async syncToDatabase(tenantId) {
        await syncToDatabase(tenantId, this.getAll());
      }
      /**
       * Validate component definition
       */
      validateComponent(component) {
        if (!component.id || typeof component.id !== "string") {
          throw new Error("Component must have a valid id");
        }
        if (!component.name || typeof component.name !== "string") {
          throw new Error("Component must have a valid name");
        }
        if (!component.type) {
          throw new Error("Component must have a valid type");
        }
        if (!component.editor) {
          throw new Error("Component must specify an editor");
        }
        if (!component.version || !/^\d+\.\d+\.\d+$/.test(component.version)) {
          throw new Error("Component must have a valid semantic version");
        }
      }
      /**
       * Export registry configuration
       */
      export() {
        return {
          version: "1.0.0",
          last_sync: (/* @__PURE__ */ new Date()).toISOString(),
          components: this.getAll()
        };
      }
      /**
       * Import registry configuration
       */
      import(config) {
        this.components.clear();
        config.components.forEach((component) => {
          this.register(component);
        });
      }
    };
    componentRegistry = ComponentRegistry.getInstance();
  }
});

// server/app.js
import express23 from "express";
import { fileURLToPath as fileURLToPath12 } from "url";
import { dirname as dirname10, join as join8 } from "path";
import { existsSync as existsSync6 } from "fs";
import { statSync } from "fs";

// server/config/app.js
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// server/middleware/cors.js
var corsMiddleware = (req, res, next) => {
  try {
    const origin = req.headers.origin || "*";
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Tenant-Id, X-Access-Key, X-API-Key, x-api-key");
    res.header("Access-Control-Expose-Headers", "Content-Type, Content-Length, Authorization, X-Requested-With");
    res.header("Access-Control-Max-Age", "86400");
    if (origin !== "*") {
      res.header("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") {
      console.log("[testing] CORS: Handling OPTIONS preflight request for", req.path, "from origin", origin);
      return res.status(200).send();
    }
    next();
  } catch (error) {
    console.error("[testing] CORS middleware error:", error);
    next();
  }
};

// server/config/app.js
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var app = express();
app.use(corsMiddleware);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// server/utils/uploads.js
import { fileURLToPath as fileURLToPath2 } from "url";
import { dirname as dirname2, join as join2 } from "path";
import { existsSync, mkdirSync } from "fs";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var getUploadsDir = () => {
  const uploadsDir = join2(__dirname2, "..", "..", "public", "uploads");
  return uploadsDir;
};
var ensureUploadsDir = () => {
  const uploadsDir = getUploadsDir();
  console.log(`[Uploads Directory] The upload directory is located at: ${uploadsDir}`);
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
    console.log("[testing] Created uploads directory:", uploadsDir);
  }
  return uploadsDir;
};

// server/routes/index.js
import express22 from "express";

// sparti-cms/db/tenant-management.js
init_db();
init_dist_node();
import bcrypt from "bcrypt";

// sparti-cms/db/tenant-initialization.js
init_db();
async function initializeTenantDefaults(tenantId) {
  console.log(`[testing] Initializing defaults for tenant: ${tenantId}`);
  const summary = {
    settings: { inserted: 0, skipped: 0 },
    branding: { inserted: 0, skipped: 0 },
    sitemap: { inserted: 0, skipped: 0 },
    robots: { inserted: 0, skipped: 0 },
    media: {
      folders: { inserted: 0, skipped: 0 }
    },
    blog: {
      categories: { inserted: 0, skipped: 0 },
      tags: { inserted: 0, skipped: 0 }
    },
    ecommerce: {
      tables_ready: false
    },
    errors: []
  };
  try {
    console.log(`[testing] Skipping Settings/Branding/SEO creation - tenants access master data (tenant_id = NULL)`);
    console.log(`[testing] Tenant-specific overrides will be created automatically when settings are modified`);
    summary.settings.inserted = 0;
    summary.branding.inserted = 0;
    console.log(`[testing] Copying master sitemap entries to tenant ${tenantId}...`);
    try {
      const masterEntries = await query(`
        SELECT url, changefreq, priority, sitemap_type, title, description, object_id, object_type
        FROM sitemap_entries
        WHERE tenant_id IS NULL AND is_active = true
      `);
      let sitemapInserted = 0;
      for (const entry of masterEntries.rows) {
        const existing = await query(`
          SELECT id FROM sitemap_entries 
          WHERE url = $1 AND tenant_id = $2
          LIMIT 1
        `, [entry.url, tenantId]);
        if (existing.rows.length === 0) {
          await query(`
            INSERT INTO sitemap_entries (
              url, changefreq, priority, sitemap_type, title, description,
              object_id, object_type, tenant_id, is_active, lastmod, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW(), NOW(), NOW())
          `, [
            entry.url,
            entry.changefreq,
            entry.priority,
            entry.sitemap_type,
            entry.title || "",
            entry.description || "",
            entry.object_id,
            entry.object_type,
            tenantId
          ]);
          sitemapInserted++;
        }
      }
      summary.sitemap.inserted = sitemapInserted;
      console.log(`[testing] Copied ${summary.sitemap.inserted} sitemap entries to tenant ${tenantId}`);
    } catch (sitemapError) {
      console.error(`[testing] Error copying sitemap entries:`, sitemapError);
      summary.errors.push(`Sitemap entries initialization: ${sitemapError.message}`);
      summary.sitemap.inserted = 0;
    }
    console.log(`[testing] Skipping robots_config copy - tenants access master data (tenant_id = NULL)`);
    summary.robots.inserted = 0;
    console.log(`[testing] Skipping categories copy - tenants access master data (tenant_id = NULL)`);
    summary.blog.categories.inserted = 0;
    console.log(`[testing] Skipping tags copy - tenants access master data (tenant_id = NULL)`);
    summary.blog.tags.inserted = 0;
    console.log(`[testing] Skipping Header/Footer page creation - tenants access master pages (tenant_id = NULL)`);
    console.log(`[testing] Copying master media folders to tenant ${tenantId}...`);
    try {
      const { createMediaFolder: createMediaFolder2 } = await Promise.resolve().then(() => (init_media(), media_exports));
      const masterFolders = await query(`
        SELECT name, slug, description, folder_path
        FROM media_folders
        WHERE tenant_id IS NULL AND is_active = true
      `);
      let mediaFoldersInserted = 0;
      for (const folder of masterFolders.rows) {
        const existing = await query(`
          SELECT id FROM media_folders 
          WHERE slug = $1 AND tenant_id = $2
          LIMIT 1
        `, [folder.slug, tenantId]);
        if (existing.rows.length === 0) {
          await createMediaFolder2({
            name: folder.name,
            slug: folder.slug,
            description: folder.description,
            folder_path: folder.folder_path
          }, tenantId);
          mediaFoldersInserted++;
        }
      }
      summary.media.folders.inserted = mediaFoldersInserted;
      console.log(`[testing] Copied ${summary.media.folders.inserted} media folders to tenant ${tenantId}`);
    } catch (mediaError) {
      console.error(`[testing] Error copying media folders:`, mediaError);
      summary.errors.push(`Media folders initialization: ${mediaError.message}`);
      summary.media.folders.inserted = 0;
    }
    console.log(`[testing] Verifying ecommerce tables exist for tenant ${tenantId}...`);
    try {
      const ecommerceTables = [
        "pern_products",
        "pern_cart",
        "pern_cart_item",
        "pern_orders",
        "pern_order_item",
        "pern_reviews"
      ];
      let tablesReady = true;
      for (const tableName of ecommerceTables) {
        const tableExists = await query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [tableName]);
        if (!tableExists.rows[0].exists) {
          console.warn(`[testing] Ecommerce table ${tableName} does not exist. Run migrations: npm run sequelize:migrate`);
          tablesReady = false;
          break;
        }
      }
      summary.ecommerce.tables_ready = tablesReady;
      if (tablesReady) {
        console.log(`[testing] Ecommerce tables verified - store is ready for tenant ${tenantId} (empty initially)`);
        console.log(`[testing] Note: Ecommerce tables are shared but tenant-isolated via tenant_id column`);
      }
    } catch (ecommerceError) {
      console.error(`[testing] Error verifying ecommerce tables:`, ecommerceError);
      summary.errors.push(`Ecommerce tables verification: ${ecommerceError.message}`);
      summary.ecommerce.tables_ready = false;
    }
    console.log(`[testing] Tenant initialization complete for ${tenantId}`);
    console.log(`[testing] Summary:`, JSON.stringify(summary, null, 2));
    console.log(`[testing] Note: Shared tables (Blog, Settings, SEO, Branding) use master data (tenant_id = NULL) accessible to all tenants`);
    console.log(`[testing] Note: Settings/Branding/SEO access master data by default, tenant-specific overrides created when modified`);
    const formattedSummary = {
      total: (summary.sitemap.inserted || 0) + (summary.media.folders.inserted || 0) + (summary.ecommerce.tables_ready ? 1 : 0),
      settings: 0,
      // Settings accessed from master, not copied
      branding: 0,
      // Branding accessed from master, not copied
      sitemap: summary.sitemap.inserted || 0,
      media_folders: summary.media.folders.inserted || 0,
      robots: 0,
      // No longer copying - tenants access master data
      categories: 0,
      // No longer copying - tenants access master data
      tags: 0,
      // No longer copying - tenants access master data
      ecommerce: summary.ecommerce.tables_ready ? 1 : 0
    };
    return {
      ...summary,
      summary: formattedSummary
    };
  } catch (error) {
    console.error(`[testing] Error initializing tenant ${tenantId}:`, error);
    summary.errors.push(error.message);
    throw error;
  }
}

// sparti-cms/db/tenant-management.js
async function getAllTenants() {
  try {
    const tenantsResult = await query(`
      SELECT 
        t.id, 
        t.name, 
        t.created_at as "createdAt", 
        t.updated_at, 
        t.database_url, 
        t.api_key,
        t.theme_id,
        t.slug,
        td.host as db_host,
        td.port as db_port,
        td.database_name as db_database_name,
        td.username as db_username,
        td.ssl as db_ssl
      FROM tenants t
      LEFT JOIN tenant_databases td ON t.id = td.tenant_id
      ORDER BY t.created_at DESC
    `);
    const tenantMap = /* @__PURE__ */ new Map();
    for (const row of tenantsResult.rows) {
      if (!tenantMap.has(row.id)) {
        tenantMap.set(row.id, {
          id: row.id,
          name: row.name,
          createdAt: row.createdAt,
          updated_at: row.updated_at,
          database_url: row.database_url,
          api_key: row.api_key,
          theme_id: row.theme_id,
          slug: row.slug
        });
        if (row.db_host) {
          tenantMap.get(row.id).database = {
            host: row.db_host,
            port: row.db_port,
            database_name: row.db_database_name,
            username: row.db_username,
            ssl: row.db_ssl
          };
        }
      }
    }
    const tenants = Array.from(tenantMap.values());
    const apiKeysResult = await query(`
      SELECT 
        tenant_id,
        id,
        api_key,
        description,
        expires_at,
        created_at
      FROM tenant_api_keys
      ORDER BY tenant_id, created_at DESC
    `);
    const apiKeysByTenant = /* @__PURE__ */ new Map();
    for (const key of apiKeysResult.rows) {
      if (!apiKeysByTenant.has(key.tenant_id)) {
        apiKeysByTenant.set(key.tenant_id, []);
      }
      apiKeysByTenant.get(key.tenant_id).push({
        id: key.id,
        api_key: key.api_key,
        description: key.description,
        expires_at: key.expires_at,
        created_at: key.created_at
      });
    }
    for (const tenant of tenants) {
      if (apiKeysByTenant.has(tenant.id)) {
        tenant.apiKeys = apiKeysByTenant.get(tenant.id);
      }
    }
    return tenants;
  } catch (error) {
    console.error("[testing] Error getting all tenants:", error);
    throw error;
  }
}
async function getTenantById(id) {
  try {
    const tenantResult = await query(`
      SELECT t.id, t.name, t.created_at as "createdAt", t.updated_at, t.database_url, t.api_key, t.theme_id, t.slug
      FROM tenants t
      WHERE t.id = $1
    `, [id]);
    if (tenantResult.rows.length === 0) {
      return null;
    }
    const tenant = tenantResult.rows[0];
    const dbResult = await query(`
      SELECT host, port, database_name, username, ssl
      FROM tenant_databases
      WHERE tenant_id = $1
    `, [id]);
    if (dbResult.rows.length > 0) {
      tenant.database = dbResult.rows[0];
    }
    const apiKeysResult = await query(`
      SELECT id, api_key, description, expires_at, created_at
      FROM tenant_api_keys
      WHERE tenant_id = $1
      ORDER BY created_at DESC
    `, [id]);
    if (apiKeysResult.rows.length > 0) {
      tenant.apiKeys = apiKeysResult.rows;
    }
    return tenant;
  } catch (error) {
    console.error(`[testing] Error getting tenant with ID ${id}:`, error);
    throw error;
  }
}
async function createTenant(tenantData) {
  const { name, theme_id } = tenantData;
  const id = `tenant-${v4_default().split("-")[0]}`;
  try {
    const result = await query(`
      INSERT INTO tenants (id, name, theme_id)
      VALUES ($1, $2, $3)
      RETURNING id, name, created_at as "createdAt", updated_at, theme_id
    `, [id, name, theme_id || null]);
    const tenant = result.rows[0];
    console.log(`[testing] Initializing default data for tenant ${id}...`);
    let initializationSummary = null;
    try {
      initializationSummary = await initializeTenantDefaults(id);
      console.log(`[testing] Tenant ${id} initialized successfully`);
    } catch (initError) {
      console.error(`[testing] Error initializing tenant defaults for ${id}:`, initError);
    }
    if (initializationSummary) {
      tenant.initialization = initializationSummary;
    }
    return tenant;
  } catch (error) {
    console.error("[testing] Error creating tenant:", error);
    throw error;
  }
}
async function updateTenant(id, tenantData) {
  try {
    const { name, theme_id } = tenantData;
    const updates = [];
    const values = [];
    let paramIndex = 1;
    if (name !== void 0) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (theme_id !== void 0) {
      updates.push(`theme_id = $${paramIndex++}`);
      values.push(theme_id || null);
    }
    if (updates.length === 0) {
      return await getTenantById(id);
    }
    updates.push(`updated_at = NOW()`);
    values.push(id);
    const result = await query(`
      UPDATE tenants
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING id, name, created_at as "createdAt", updated_at, theme_id
    `, values);
    return result.rows[0] || null;
  } catch (error) {
    console.error(`[testing] Error updating tenant with ID ${id}:`, error);
    throw error;
  }
}
async function deleteTenant(id) {
  try {
    const tenantExists = await query(`
      SELECT id FROM tenants WHERE id = $1
    `, [id]);
    if (tenantExists.rows.length === 0) {
      return { success: false, message: "Tenant not found" };
    }
    await query(`
      DELETE FROM tenants
      WHERE id = $1
    `, [id]);
    return { success: true };
  } catch (error) {
    console.error(`[testing] Error deleting tenant with ID ${id}:`, error);
    throw error;
  }
}
async function getTenantDatabaseDetails(tenantId) {
  try {
    const result = await query(`
      SELECT td.host, td.port, td.database_name, td.username, td.ssl
      FROM tenant_databases td
      WHERE td.tenant_id = $1
    `, [tenantId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error(`[testing] Error getting database details for tenant ${tenantId}:`, error);
    throw error;
  }
}
async function setTenantDatabaseDetails(tenantId, dbDetails) {
  try {
    const { host, port, database_name, username, password, ssl } = dbDetails;
    const tenantExists = await query(`
      SELECT id FROM tenants WHERE id = $1
    `, [tenantId]);
    if (tenantExists.rows.length === 0) {
      return { success: false, message: "Tenant not found" };
    }
    const dbExists = await query(`
      SELECT tenant_id FROM tenant_databases WHERE tenant_id = $1
    `, [tenantId]);
    let result;
    if (dbExists.rows.length === 0) {
      result = await query(`
        INSERT INTO tenant_databases (tenant_id, host, port, database_name, username, password, ssl)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING tenant_id, host, port, database_name, username, ssl
      `, [tenantId, host, port, database_name, username, password, ssl]);
    } else {
      result = await query(`
        UPDATE tenant_databases
        SET host = $2, port = $3, database_name = $4, username = $5, password = $6, ssl = $7, updated_at = NOW()
        WHERE tenant_id = $1
        RETURNING tenant_id, host, port, database_name, username, ssl
      `, [tenantId, host, port, database_name, username, password, ssl]);
    }
    const dbUrl = `postgresql://${username}:${password}@${host}:${port}/${database_name}`;
    await query(`
      UPDATE tenants
      SET database_url = $2, updated_at = NOW()
      WHERE id = $1
    `, [tenantId, dbUrl]);
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error(`[testing] Error setting database details for tenant ${tenantId}:`, error);
    throw error;
  }
}
async function generateTenantApiKey(tenantId, description = "API Access Key") {
  try {
    const tenantExists = await query(`
      SELECT id FROM tenants WHERE id = $1
    `, [tenantId]);
    if (tenantExists.rows.length === 0) {
      return { success: false, message: "Tenant not found" };
    }
    const apiKey = `tenant_${tenantId}_${v4_default().replace(/-/g, "")}`;
    await query(`
      INSERT INTO tenant_api_keys (tenant_id, api_key, description)
      VALUES ($1, $2, $3)
    `, [tenantId, apiKey, description]);
    return { success: true, apiKey };
  } catch (error) {
    console.error(`[testing] Error generating API key for tenant ${tenantId}:`, error);
    throw error;
  }
}
async function generateThemeApiKey(themeId, description = "API Access Key") {
  try {
    console.log(`[testing] generateThemeApiKey called with themeId: ${themeId}`);
    const themeExists = await query(`
      SELECT id, slug FROM themes WHERE id = $1 OR slug = $1
    `, [themeId]);
    console.log(`[testing] Theme query result:`, themeExists.rows);
    if (themeExists.rows.length === 0) {
      console.log(`[testing] Theme ${themeId} not found in database`);
      return { success: false, message: `Theme '${themeId}' not found in database. Please sync themes first.` };
    }
    const themeIdentifier = themeExists.rows[0].slug || themeExists.rows[0].id;
    const themeTenantId = `theme-${themeIdentifier}`;
    console.log(`[testing] Using theme identifier: ${themeIdentifier}, tenant_id: ${themeTenantId}`);
    const apiKey = `theme_${themeIdentifier}_${v4_default().replace(/-/g, "")}`;
    console.log(`[testing] Generated API key: ${apiKey.substring(0, 20)}...`);
    try {
      await query(`
        INSERT INTO tenant_api_keys (tenant_id, api_key, description)
        VALUES ($1, $2, $3)
      `, [themeTenantId, apiKey, description]);
    } catch (insertError) {
      if (insertError.code === "23503" || insertError.constraint === "tenant_api_keys_tenant_id_fkey") {
        console.log(`[testing] Foreign key constraint detected, attempting workaround...`);
        try {
          await query(`
            INSERT INTO tenants (id, name, created_at, updated_at)
            VALUES ($1, $2, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
          `, [themeTenantId, `Theme: ${themeIdentifier}`]);
          await query(`
            INSERT INTO tenant_api_keys (tenant_id, api_key, description)
            VALUES ($1, $2, $3)
          `, [themeTenantId, apiKey, description]);
        } catch (tenantError) {
          console.error(`[testing] Error creating virtual tenant or inserting API key:`, tenantError);
          throw new Error(`Failed to create API key: Database constraint violation. Please ensure the theme exists in the database.`);
        }
      } else {
        throw insertError;
      }
    }
    console.log(`[testing] API key stored successfully`);
    return { success: true, apiKey };
  } catch (error) {
    console.error(`[testing] Error generating API key for theme ${themeId}:`, error);
    console.error(`[testing] Error details:`, {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint
    });
    throw error;
  }
}
async function getTenantApiKeys(tenantId) {
  try {
    const result = await query(`
      SELECT id, api_key, description, expires_at, created_at, updated_at
      FROM tenant_api_keys
      WHERE tenant_id = $1
      ORDER BY created_at DESC
    `, [tenantId]);
    return result.rows;
  } catch (error) {
    console.error(`[testing] Error getting API keys for tenant ${tenantId}:`, error);
    throw error;
  }
}
async function deleteTenantApiKey(keyId) {
  try {
    await query(`
      DELETE FROM tenant_api_keys
      WHERE id = $1
    `, [keyId]);
    return { success: true };
  } catch (error) {
    console.error(`[testing] Error deleting API key with ID ${keyId}:`, error);
    throw error;
  }
}
async function validateApiKey(apiKey) {
  try {
    const result = await query(`
      SELECT tak.tenant_id, t.name
      FROM tenant_api_keys tak
      JOIN tenants t ON tak.tenant_id = t.id
      WHERE tak.api_key = $1
      AND (tak.expires_at IS NULL OR tak.expires_at > NOW())
    `, [apiKey]);
    if (result.rows.length === 0) {
      return { valid: false };
    }
    return { valid: true, tenant: result.rows[0] };
  } catch (error) {
    console.error(`[testing] Error validating API key:`, error);
    throw error;
  }
}

// server/middleware/tenantApiKey.js
init_db();

// sparti-cms/db/scripts/init-blog.js
init_db();
import fs2 from "fs";
import path3 from "path";
import { fileURLToPath as fileURLToPath5 } from "url";
import { dirname as dirname3 } from "path";
var __filename5 = fileURLToPath5(import.meta.url);
var __dirname5 = dirname3(__filename5);
async function initializeBlogSchema(tenantId = "tenant-gosg") {
  console.log(`Initializing blog schema for tenant: ${tenantId}`);
  try {
    const schemaPath = path3.join(__dirname5, "..", "schemas", "schema-blog.sql");
    const schemaSql = fs2.readFileSync(schemaPath, "utf8");
    const client = await connection_default.connect();
    try {
      await client.query("BEGIN");
      await client.query(`CREATE SCHEMA IF NOT EXISTS "${tenantId}"`);
      await client.query(`SET search_path TO "${tenantId}"`);
      await client.query(schemaSql);
      await client.query("COMMIT");
      console.log(`Blog schema initialized successfully for tenant: ${tenantId}`);
      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(`Error initializing blog schema for tenant ${tenantId}:`, error);
      return false;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error reading blog schema file:`, error);
    return false;
  }
}
async function isBlogSchemaInitialized(tenantId = "tenant-gosg") {
  try {
    const client = await connection_default.connect();
    try {
      await client.query(`CREATE SCHEMA IF NOT EXISTS "${tenantId}"`);
      await client.query(`SET search_path TO "${tenantId}"`);
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = $1 
          AND table_name = 'posts'
        )
      `, [tenantId]);
      return result.rows[0].exists;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error checking blog schema for tenant ${tenantId}:`, error);
    return false;
  }
}
async function ensureBlogSchemaInitialized(tenantId = "tenant-gosg") {
  const isInitialized = await isBlogSchemaInitialized(tenantId);
  if (!isInitialized) {
    return await initializeBlogSchema(tenantId);
  }
  console.log(`Blog schema already initialized for tenant: ${tenantId}`);
  return true;
}
if (process.argv[1] === fileURLToPath5(import.meta.url)) {
  const tenantId = process.argv[2] || "tenant-gosg";
  ensureBlogSchemaInitialized(tenantId).then((success) => {
    if (success) {
      console.log("Blog schema initialization complete");
    } else {
      console.error("Blog schema initialization failed");
    }
    process.exit(success ? 0 : 1);
  }).catch((error) => {
    console.error("Unexpected error during blog schema initialization:", error);
    process.exit(1);
  });
}

// server/utils/database.js
var dbInitialized = false;
var dbInitializationError = null;
var getDatabaseState = () => ({
  dbInitialized,
  dbInitializationError
});
var isMockDatabaseEnabled = () => {
  return process.env.MOCK_DATABASE === "true" || !process.env.DATABASE_URL && !process.env.DATABASE_PUBLIC_URL;
};
async function verifyUsersTableExists() {
  try {
    const { query: query2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const result = await query2(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    return {
      exists: result.rows[0].exists,
      error: null
    };
  } catch (error) {
    return {
      exists: false,
      error: {
        code: error.code,
        message: error.message
      }
    };
  }
}
async function testDatabaseQuery(testQuery = "SELECT 1") {
  try {
    const { query: query2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const result = await query2(testQuery);
    return {
      success: true,
      result: result.rows,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      result: null,
      error: {
        code: error.code,
        message: error.message,
        stack: error.stack
      }
    };
  }
}
async function getDatabaseDiagnostics() {
  const mock = isMockDatabaseEnabled();
  const diagnostics = {
    connection: {
      initialized: dbInitialized,
      error: dbInitializationError ? {
        message: dbInitializationError.message,
        code: dbInitializationError.code
      } : null
    },
    usersTable: null,
    sampleQuery: null,
    environment: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasDatabasePublicUrl: !!process.env.DATABASE_PUBLIC_URL,
      connectionSource: mock ? "mock" : process.env.DATABASE_PUBLIC_URL ? "DATABASE_PUBLIC_URL" : process.env.DATABASE_URL ? "DATABASE_URL" : "none",
      mockMode: mock
    }
  };
  const usersTableCheck = await verifyUsersTableExists();
  diagnostics.usersTable = usersTableCheck;
  if (dbInitialized) {
    const queryTest = await testDatabaseQuery("SELECT 1 as test");
    diagnostics.sampleQuery = queryTest;
  }
  return diagnostics;
}

// server/middleware/tenantApiKey.js
var authenticateTenantApiKey = async (req, res, next) => {
  try {
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = getDatabaseState();
    if (!dbInitialized2) {
      if (dbInitializationError2) {
        return res.status(503).json({
          success: false,
          error: "Database initialization failed",
          message: "Please try again later"
        });
      }
      return res.status(503).json({
        success: false,
        error: "Database is initializing",
        message: "Please try again in a moment"
      });
    }
    const apiKey = req.headers["x-api-key"] || req.headers["X-API-Key"] || (req.headers.authorization && req.headers.authorization.startsWith("Bearer ") ? req.headers.authorization.substring(7) : null);
    const tenantIdFromHeader = req.headers["x-tenant-id"] || req.headers["X-Tenant-Id"];
    const tenantIdFromQuery = req.query.tenantId;
    if (apiKey) {
      const validation = await validateApiKey(apiKey);
      if (validation.valid) {
        req.tenantId = validation.tenant.tenant_id;
        return next();
      }
      const userKeyResult = await query(`
        SELECT 
          uak.id as key_id,
          uak.access_key,
          uak.key_name,
          uak.last_used_at,
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.role,
          u.is_active,
          u.tenant_id,
          u.is_super_admin
        FROM user_access_keys uak
        JOIN users u ON uak.user_id = u.id
        WHERE uak.access_key = $1 AND uak.is_active = true
      `, [apiKey]);
      if (userKeyResult.rows.length > 0) {
        const keyData = userKeyResult.rows[0];
        if (!keyData.is_active) {
          return res.status(401).json({
            success: false,
            error: "User account is not active",
            code: "USER_INACTIVE"
          });
        }
        if (keyData.is_super_admin) {
          req.tenantId = tenantIdFromQuery || tenantIdFromHeader || keyData.tenant_id;
        } else {
          req.tenantId = keyData.tenant_id;
        }
        req.user = {
          id: keyData.id,
          first_name: keyData.first_name,
          last_name: keyData.last_name,
          email: keyData.email,
          role: keyData.role,
          tenant_id: keyData.tenant_id,
          is_super_admin: keyData.is_super_admin
        };
        await query(
          "UPDATE user_access_keys SET last_used_at = NOW() WHERE id = $1",
          [keyData.key_id]
        );
        return next();
      }
    }
    const tenantId = tenantIdFromHeader || tenantIdFromQuery;
    if (tenantId) {
      const tenantResult = await query(`
        SELECT id, name, slug
        FROM tenants
        WHERE id = $1
        LIMIT 1
      `, [tenantId]);
      if (tenantResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Tenant not found",
          code: "TENANT_NOT_FOUND"
        });
      }
      req.tenantId = tenantResult.rows[0].id;
      return next();
    }
    return res.status(401).json({
      success: false,
      error: "API key or tenant ID is required",
      code: "MISSING_AUTH"
    });
  } catch (error) {
    console.error("[testing] Error in tenant API key authentication:", error);
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      const { dbInitialized: dbInitialized2 } = getDatabaseState();
      if (!dbInitialized2) {
        return res.status(503).json({
          success: false,
          error: "Database is initializing",
          message: "Please try again in a moment"
        });
      }
    }
    return res.status(500).json({
      success: false,
      error: "Authentication error",
      code: "AUTH_ERROR"
    });
  }
};

// server/middleware/accessKey.js
init_db();
var authenticateWithAccessKey = async (req, res, next) => {
  try {
    let dbState;
    try {
      dbState = getDatabaseState();
    } catch (stateError) {
      console.error("[testing] Error getting database state in access key middleware:", stateError);
      return next();
    }
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = dbState;
    if (!dbInitialized2) {
      if (dbInitializationError2) {
        return res.status(503).json({
          success: false,
          error: "Database initialization failed",
          message: "Please try again later"
        });
      }
      return res.status(503).json({
        success: false,
        error: "Database is initializing",
        message: "Please try again in a moment"
      });
    }
    const accessKey = req.headers["x-access-key"] || req.headers["X-Access-Key"] || null;
    if (!accessKey) {
      return next();
    }
    const result = await query(`
      SELECT 
        uak.id as key_id,
        uak.access_key,
        uak.key_name,
        uak.last_used_at,
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        u.is_active,
        u.tenant_id,
        u.is_super_admin
      FROM user_access_keys uak
      JOIN users u ON uak.user_id = u.id
      WHERE uak.access_key = $1 AND uak.is_active = true
    `, [accessKey]);
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired access key"
      });
    }
    const keyData = result.rows[0];
    if (!keyData.is_active) {
      return res.status(401).json({
        success: false,
        error: "User account is not active"
      });
    }
    req.user = {
      id: keyData.id,
      first_name: keyData.first_name,
      last_name: keyData.last_name,
      email: keyData.email,
      role: keyData.role,
      tenant_id: keyData.tenant_id,
      is_super_admin: keyData.is_super_admin
    };
    if (keyData.is_super_admin) {
      req.tenantId = req.query.tenantId || req.headers["x-tenant-id"] || keyData.tenant_id;
    } else {
      req.tenantId = keyData.tenant_id;
    }
    await query(
      "UPDATE user_access_keys SET last_used_at = NOW() WHERE id = $1",
      [keyData.key_id]
    );
    next();
  } catch (error) {
    console.error("[testing] Error in access key authentication:", error);
    console.error("[testing] Error details:", {
      code: error?.code,
      message: error?.message,
      stack: error?.stack
    });
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      let dbState;
      try {
        dbState = getDatabaseState();
        if (!dbState.dbInitialized) {
          return res.status(503).json({
            success: false,
            error: "Database is initializing",
            message: "Please try again in a moment"
          });
        }
      } catch (stateError) {
        console.error("[testing] Error getting database state in catch block:", stateError);
      }
    }
    if (req.path === "/auth/login" || req.path === "/auth/register") {
      return next();
    }
    return res.status(500).json({
      success: false,
      error: "Authentication error",
      message: process.env.NODE_ENV === "development" ? `Access key authentication failed: ${error?.message || "Unknown error"}` : "Authentication error. Please try again."
    });
  }
};

// sparti-cms/render/pageRenderer.js
init_db();
function buildHtml({ head, body, lang = "en" }) {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
${head}
</head>
<body>
${body}
</body>
</html>`;
}
function buildHead(seo, pageMeta) {
  const title = pageMeta?.meta_title || seo?.meta_title || "Website";
  const description = pageMeta?.meta_description || seo?.meta_description || "";
  const ogImage = seo?.og_image || "";
  return [
    `<title>${escapeHtml(title)}</title>`,
    description ? `<meta name="description" content="${escapeAttr(description)}" />` : "",
    `<meta property="og:title" content="${escapeAttr(title)}" />`,
    description ? `<meta property="og:description" content="${escapeAttr(description)}" />` : "",
    ogImage ? `<meta property="og:image" content="${escapeAttr(ogImage)}" />` : ""
  ].filter(Boolean).join("\n");
}
function escapeHtml(str = "") {
  return String(str).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function escapeAttr(str = "") {
  return String(str).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
var components = {
  Header: (props) => `
    <header class="fixed top-0 left-0 right-0 z-50 w-full py-6 px-4 md:px-8 bg-background/95 backdrop-blur-md border-b border-border">
      <div class="container mx-auto">
        <div class="flex items-center justify-between">
          <a href="/" class="flex items-center z-10">
            <span class="h-12 inline-flex items-center font-bold">${escapeHtml(props?.brand || "GO SG CONSULTING")}</span>
          </a>
          <a href="/contact" class="hidden md:inline-flex bg-destructive text-destructive-foreground px-6 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all">Contact Us</a>
          <a href="/contact" class="md:hidden bg-destructive text-destructive-foreground px-4 py-2 rounded-full font-medium">Contact</a>
        </div>
      </div>
    </header>
  `,
  HeroSection: (props) => `
    <section class="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center px-4 pt-28 overflow-hidden bg-gradient-to-br from-background via-secondary/30 to-background text-center">
      <div class="container mx-auto max-w-5xl">
        <div class="space-y-6">
          <div>
            <span class="inline-flex items-center px-4 py-2 text-sm font-medium border border-brandPurple/20 text-brandPurple bg-brandPurple/5 rounded-full">Get Results in 3 Months</span>
          </div>
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            <span class="bg-gradient-to-r from-brandPurple via-brandTeal to-coral bg-clip-text text-transparent">${escapeHtml(props?.headline || "Rank #1 on Google")}</span><br />
            <span class="text-foreground">${escapeHtml(props?.subheadline || "In 3 Months")}</span>
          </h1>
          ${props?.description ? `<p class="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">${escapeHtml(props.description)}</p>` : ""}
          <div>
            <a href="/contact" class="inline-flex items-center px-8 py-4 text-lg font-semibold bg-coral text-white rounded-lg shadow hover:shadow-md transition-all">Get a Quote</a>
          </div>
        </div>
      </div>
    </section>
  `,
  SEOResultsSection: () => `
    <section class="py-16 container mx-auto px-4">
      <h2 class="text-3xl font-bold mb-4">SEO Results</h2>
      <p class="text-muted-foreground">Real results from real clients.</p>
    </section>
  `,
  NewTestimonials: () => `
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-6 text-center">What our clients say</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="testimonial-card">\u201CGoSG's SEO strategies boosted our organic traffic by 400%.\u201D</div>
          <div class="testimonial-card">\u201CFrom page 5 to page 1 in Google in just 4 months.\u201D</div>
        </div>
      </div>
    </section>
  `,
  FAQAccordion: (props) => `
    <section class="py-16 container mx-auto px-4">
      <h2 class="text-2xl md:text-3xl font-bold mb-4 text-center">${escapeHtml(props?.title || "Frequently Asked Questions")}</h2>
    </section>
  `,
  BlogSection: () => `
    <section class="py-16 container mx-auto px-4">
      <h2 class="text-3xl font-bold mb-4">Latest SEO Insights</h2>
    </section>
  `,
  SEOServicesShowcase: (props) => `
    <section class="py-16 container mx-auto px-4">
      <h2 class="text-3xl font-bold mb-6 text-center">Our SEO Services</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="service-card p-6 border rounded-lg">
          <h3 class="font-semibold mb-2">Technical SEO</h3>
          <p class="text-muted-foreground">Fix crawl issues and optimize site structure.</p>
        </div>
        <div class="service-card p-6 border rounded-lg">
          <h3 class="font-semibold mb-2">Content & On-page</h3>
          <p class="text-muted-foreground">Publish content that ranks and converts.</p>
        </div>
        <div class="service-card p-6 border rounded-lg">
          <h3 class="font-semibold mb-2">Off-page & Links</h3>
          <p class="text-muted-foreground">Build authority with quality backlinks.</p>
        </div>
      </div>
      <div class="text-center mt-8">
        <a href="/contact" class="inline-flex items-center px-6 py-3 bg-coral text-white rounded-lg">${escapeHtml(props?.cta || "Get a Quote")}</a>
      </div>
    </section>
  `,
  ContactForm: () => `
    <section class="py-16 container mx-auto px-4">
      <h2 class="text-2xl font-bold mb-4">Contact Us</h2>
      <p class="text-muted-foreground">Form available on SPA version.</p>
    </section>
  `,
  Footer: () => `
    <footer class="bg-slate-900 text-white py-16 px-4">
      <div class="container mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-12">
          <div class="space-y-6">
            <h2 class="text-3xl md:text-5xl font-bold mb-4"><span class="bg-gradient-to-r from-brandPurple to-brandTeal bg-clip-text text-transparent">Get Your SEO Strategy</span></h2>
            <p class="text-gray-300 text-lg">Ready to dominate search results? Let's discuss how we can help your business grow.</p>
            <a href="/contact" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brandPurple to-brandTeal rounded-lg">Start Your Journey</a>
          </div>
          <div class="lg:text-right">
            <h3 class="text-sm font-semibold mb-4 text-gray-400 uppercase tracking-wider">Contact</h3>
            <div class="space-y-3">
              <a href="#" class="block text-xl text-white hover:text-brandTeal">WhatsApp</a>
              <a href="#" class="block text-xl text-white hover:text-brandTeal">Book a Meeting</a>
            </div>
          </div>
        </div>
        <div class="pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-400">
            <a href="#" class="hover:text-brandTeal">Privacy Policy</a>
            <a href="#" class="hover:text-brandTeal">Terms of Service</a>
            <a href="/blog" class="hover:text-brandTeal">Blog</a>
          </div>
          <p class="text-sm text-gray-400">\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} GO SG CONSULTING. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `
};
function renderComponent(node, settings) {
  const tpl = components[node.key];
  if (!tpl) return `<!-- unknown component: ${node.key} -->`;
  return tpl(node.props || {}, settings);
}
async function renderPageBySlug(slug, tenantId = null) {
  let pageRes;
  if (tenantId) {
    pageRes = await query(`SELECT * FROM pages WHERE slug = $1 AND tenant_id = $2`, [slug, tenantId]);
  } else {
    pageRes = await query(`SELECT * FROM pages WHERE slug = $1`, [slug]);
  }
  const page = pageRes.rows[0];
  if (!page) return { status: 404, html: "<h1>Not Found</h1>" };
  const layoutRes = await query(`SELECT layout_json FROM page_layouts WHERE page_id = $1`, [page.id]);
  const layout = layoutRes.rows[0]?.layout_json || { components: [] };
  const settingsTenantId = tenantId || page.tenant_id || "tenant-gosg";
  const seo = await getPublicSEOSettings(settingsTenantId);
  const body = (layout.components || []).map((node) => renderComponent(node, seo)).join("\n");
  const head = buildHead(seo, page);
  const html = buildHtml({ head, body });
  return { status: 200, html };
}

// sparti-cms/cache/index.js
var DEFAULT_TTL_SECONDS = parseInt(process.env.CACHE_TTL_SECONDS || "600", 10);
var CacheStore = class {
  constructor() {
    this.store = /* @__PURE__ */ new Map();
  }
  _now() {
    return Date.now();
  }
  _isExpired(entry) {
    return entry.expiresAt !== 0 && this._now() > entry.expiresAt;
  }
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (this._isExpired(entry)) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }
  set(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
    const expiresAt = ttlSeconds > 0 ? this._now() + ttlSeconds * 1e3 : 0;
    this.store.set(key, { value, expiresAt });
  }
  delete(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
};
var cache = new CacheStore();
function getPageCache(slug) {
  return cache.get(`page:${slug}`);
}
function setPageCache(slug, payload, ttlSeconds) {
  cache.set(`page:${slug}`, payload, ttlSeconds);
}
function invalidateBySlug(slug) {
  cache.delete(`page:${slug}`);
}
function invalidateAll() {
  cache.clear();
}

// server/routes/health.js
init_db();
import express2 from "express";
init_constants();
var router = express2.Router();
router.get("/health", (req, res) => {
  const { dbInitialized: dbInitialized2 } = getDatabaseState();
  const mock = isMockDatabaseEnabled();
  res.status(200).json({
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    port: PORT,
    database: dbInitialized2 ? mock ? "mock" : "ready" : "initializing",
    mock
  });
});
router.get("/health/detailed", async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = getDatabaseState();
    const mock = isMockDatabaseEnabled();
    if (!dbInitialized2) {
      if (dbInitializationError2) {
        return res.status(503).json({
          status: "unhealthy",
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          port: PORT,
          database: "initialization_failed",
          error: dbInitializationError2.message,
          mock
        });
      }
      return res.status(200).json({
        status: "healthy",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        port: PORT,
        database: "initializing",
        mock
      });
    }
    if (mock) {
      return res.status(200).json({
        status: "healthy",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        port: PORT,
        database: "connected (mock)",
        mock: true
      });
    }
    await query("SELECT 1");
    res.status(200).json({
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      port: PORT,
      database: "connected",
      mock: false
    });
  } catch (error) {
    console.error("[testing] Detailed health check failed:", error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      port: PORT,
      database: "disconnected",
      error: error.message
    });
  }
});
router.get("/health/database", async (req, res) => {
  try {
    const diagnostics = await getDatabaseDiagnostics();
    let status = "healthy";
    let statusCode = 200;
    if (!diagnostics.connection.initialized) {
      status = "unhealthy";
      statusCode = 503;
    } else if (!diagnostics.usersTable.exists) {
      status = "unhealthy";
      statusCode = 503;
    } else if (diagnostics.sampleQuery && !diagnostics.sampleQuery.success) {
      status = "unhealthy";
      statusCode = 503;
    }
    res.status(statusCode).json({
      status,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      diagnostics,
      recommendations: getRecommendations(diagnostics)
    });
  } catch (error) {
    console.error("[testing] Database diagnostic endpoint failed:", error);
    res.status(500).json({
      status: "error",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      error: error.message,
      diagnostics: null
    });
  }
});
function getRecommendations(diagnostics) {
  const recommendations = [];
  if (!diagnostics.environment.hasDatabaseUrl && !diagnostics.environment.hasDatabasePublicUrl) {
    recommendations.push({
      issue: "Missing database connection string",
      solution: "Set DATABASE_URL or DATABASE_PUBLIC_URL environment variable",
      command: "Check your .env file or environment variables"
    });
  }
  if (!diagnostics.connection.initialized) {
    if (diagnostics.connection.error) {
      if (diagnostics.connection.error.code === "ECONNREFUSED" || diagnostics.connection.error.code === "ETIMEDOUT") {
        recommendations.push({
          issue: "Database connection failed",
          solution: "Check if database server is running and accessible",
          command: "Verify DATABASE_URL points to a running PostgreSQL instance"
        });
      } else {
        recommendations.push({
          issue: "Database initialization error",
          solution: "Check database connection string and credentials",
          command: "Verify DATABASE_URL format: postgresql://user:password@host:port/database"
        });
      }
    } else {
      recommendations.push({
        issue: "Database is still initializing",
        solution: "Wait a few moments and try again",
        command: "Check server logs for initialization progress"
      });
    }
  }
  if (!diagnostics.usersTable.exists) {
    recommendations.push({
      issue: "Users table does not exist",
      solution: "Run database migrations to create required tables",
      command: "npm run sequelize:migrate"
    });
  }
  if (diagnostics.sampleQuery && !diagnostics.sampleQuery.success) {
    recommendations.push({
      issue: "Database query failed",
      solution: "Check database permissions and connection",
      command: "Verify database user has proper access rights"
    });
  }
  if (recommendations.length === 0) {
    recommendations.push({
      issue: "No issues detected",
      solution: "Database appears to be healthy",
      command: "If login still fails, check application logs for specific errors"
    });
  }
  return recommendations;
}
var health_default = router;

// server/routes/auth.js
init_db();
import express3 from "express";
import bcrypt3 from "bcrypt";

// server/services/authService.js
init_constants();
init_db();
import jwt from "jsonwebtoken";
import bcrypt2 from "bcrypt";
var ACCESS_TOKEN_EXPIRY = "15m";
function generateAccessToken(userData) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  try {
    return jwt.sign(userData, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  } catch (error) {
    console.error("[AuthService] Access token generation error:", error);
    throw new Error("Failed to generate access token");
  }
}
function verifyAccessToken(token) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Access token has expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid access token");
    }
    throw error;
  }
}
function extractTokenFromHeader(authHeader) {
  if (!authHeader || typeof authHeader !== "string") {
    return null;
  }
  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}
function createAuthErrorResponse(message, statusCode = 401) {
  return {
    success: false,
    error: message,
    statusCode
  };
}

// server/middleware/auth.js
var authenticateUser = (req, res, next) => {
  if (req.user) {
    return next();
  }
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      return res.status(401).json(createAuthErrorResponse("Not authenticated"));
    }
    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      return next();
    } catch (error) {
      const errorMessage = error.message || "Invalid or expired token";
      return res.status(401).json(createAuthErrorResponse(errorMessage));
    }
  } catch (error) {
    console.error("[auth] Authentication middleware error:", error);
    return res.status(500).json(createAuthErrorResponse("Authentication middleware error", 500));
  }
};

// server/utils/auth.js
function generateToken(userData) {
  return generateAccessToken(userData);
}

// server/routes/auth.js
init_debugLogger();
init_pages();
init_branding();
init_themeSync();
var isLocalhostConnection = () => {
  const connString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || "";
  return connString.includes("localhost") || connString.includes("127.0.0.1") || connString.includes("::1");
};
var getLocalhostErrorMessage = (errorCode, baseMessage) => {
  if (!isLocalhostConnection()) {
    return baseMessage;
  }
  const localhostGuidance = [
    "1. Verify PostgreSQL is running locally:",
    "   - Windows: Check Services or run: net start postgresql-x64-XX",
    "   - Mac/Linux: Check with: pg_isready or systemctl status postgresql",
    "2. Verify your connection string format in .env:",
    "   DATABASE_PUBLIC_URL=postgresql://username:password@localhost:5432/database_name",
    "3. Check PostgreSQL credentials (username, password, database name)",
    "4. If SSL errors occur, add DATABASE_SSL=false to your .env file",
    "5. Verify PostgreSQL is listening on the correct port (default: 5432)"
  ].join("\n");
  return `${baseMessage}

For localhost connections:
${localhostGuidance}`;
};
var router2 = express3.Router();
var asyncHandler = (fn) => (req, res, next) => {
  const promise = Promise.resolve(fn(req, res, next));
  promise.catch((error) => {
    debugError("========== UNHANDLED ASYNC ERROR ==========");
    debugError("Unhandled async error in route handler:", error);
    debugError("Error type:", error?.constructor?.name || "Unknown");
    debugError("Error message:", error?.message);
    debugError("Error code:", error?.code || "N/A");
    debugError("Error stack:", error?.stack);
    debugError("Request path:", req.path);
    debugError("Request method:", req.method);
    debugError("Request URL:", req.url);
    debugError("Request originalUrl:", req.originalUrl);
    debugError("============================================");
    if (!res.headersSent) {
      const isDevelopment = process.env.NODE_ENV === "development" || process.env.NODE_ENV !== "production";
      const errorMessage = isDevelopment && error?.message ? `Server error: ${error.message}${error?.code ? ` (Code: ${error.code})` : ""}` : "Server error. Please try again in a moment.";
      try {
        res.status(500).json({
          success: false,
          error: errorMessage,
          message: errorMessage,
          diagnostic: "/health/database",
          errorCode: error?.code,
          ...isDevelopment && error?.stack ? { stack: error.stack } : {}
        });
      } catch (sendError) {
        debugError("Failed to send error response:", sendError);
      }
    } else {
      debugError("Response already sent, cannot send error response");
    }
  });
  return promise;
};
router2.post("/auth/login", asyncHandler(async (req, res) => {
  debugLog(" Login attempt started");
  debugLog(" Request method:", req.method);
  debugLog(" Request path:", req.path);
  debugLog(" Request body:", JSON.stringify(req.body));
  debugLog(" Request headers:", JSON.stringify(req.headers));
  if (isMockDatabaseEnabled()) {
    return res.status(503).json({
      success: false,
      error: "Database is not configured",
      message: 'This environment is running in mock database mode (no DATABASE_URL configured). Login is unavailable. Use the "Create Admin User" button for local/demo access, or connect a real database to enable authentication.'
    });
  }
  if (res.headersSent) {
    debugError(" Response already sent by middleware, aborting login handler");
    return;
  }
  try {
    debugLog(" Step 1: Checking database initialization state...");
    let dbState;
    try {
      dbState = getDatabaseState();
      debugLog(" Database state:", {
        initialized: dbState.dbInitialized,
        hasError: !!dbState.dbInitializationError
      });
    } catch (stateError) {
      debugError(" Error getting database state:", stateError);
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          error: "Server configuration error",
          message: "Unable to check database state. Please check server logs."
        });
      }
      return;
    }
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = dbState;
    if (!dbInitialized2) {
      debugError(" Database not initialized");
      if (dbInitializationError2) {
        debugError(" Database initialization error:", dbInitializationError2.message);
        return res.status(503).json({
          success: false,
          error: "Database initialization failed",
          message: `Database connection failed: ${dbInitializationError2.message}. Check DATABASE_URL or DATABASE_PUBLIC_URL environment variable in your .env file.`,
          diagnostic: "/health/database"
        });
      }
      return res.status(503).json({
        success: false,
        error: "Database is initializing",
        message: "Database is still connecting. Please try again in a moment.",
        diagnostic: "/health/database"
      });
    }
    debugLog(" Database is initialized");
    debugLog(" Step 2: Validating input...");
    debugLog(" Request body type:", typeof req.body);
    debugLog(" Request body keys:", req.body ? Object.keys(req.body) : "null/undefined");
    debugLog(" Content-Type header:", req.headers["content-type"]);
    const { email, password } = req.body || {};
    if (!req.body || typeof req.body !== "object" || Object.keys(req.body).length === 0) {
      debugError(" Request body is missing or invalid:", req.body);
      debugError(" Raw request body:", req.rawBody || "not available");
      return res.status(400).json({
        success: false,
        error: "Invalid request body",
        message: "Request body must be valid JSON with email and password fields. Make sure Content-Type is application/json."
      });
    }
    if (!email || typeof email !== "string" || email.trim() === "") {
      debugError(" Missing or invalid email. Received:", email);
      return res.status(400).json({
        success: false,
        error: "Email is required",
        message: "Please provide a valid email address"
      });
    }
    if (!password || typeof password !== "string" || password.trim() === "") {
      debugError(" Missing or invalid password");
      return res.status(400).json({
        success: false,
        error: "Password is required",
        message: "Please provide a password"
      });
    }
    debugLog(" Input validated, email:", email);
    const requestedTenantId = req.headers["x-tenant-id"] || req.headers["X-Tenant-Id"] || req.query.tenantId || null;
    if (requestedTenantId) {
      debugLog(" Requested tenant for login:", requestedTenantId);
    } else {
      debugLog(" No tenantId provided in headers/query; login will be unscoped (super admins allowed, tenant users must match by email only)");
    }
    const requestedThemeSlug = req.query.themeSlug || req.headers["x-theme-slug"] || req.headers["X-Theme-Slug"] || null;
    if (requestedThemeSlug) {
      debugLog(" Requested theme for login:", requestedThemeSlug);
    }
    debugLog(" Step 3: Checking if users table exists...");
    try {
      const tableCheck = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        );
      `);
      const tableExists = tableCheck?.rows?.[0]?.exists === true;
      debugLog(" Users table exists:", tableExists);
      if (!tableExists) {
        debugError(" Users table does not exist");
        return res.status(503).json({
          success: false,
          error: "Database not fully initialized",
          message: "Required authentication tables are missing. Please initialize the database schema.",
          diagnostic: "/health/database"
        });
      }
    } catch (checkError) {
      debugError(" Error checking users table existence:", checkError);
      debugError(" Check error details:", {
        code: checkError?.code,
        message: checkError?.message,
        errno: checkError?.errno,
        syscall: checkError?.syscall
      });
      if (res.headersSent) {
        debugError(" Response already sent, cannot send error response");
        return;
      }
      if (checkError?.code === "ECONNREFUSED" || checkError?.code === "ETIMEDOUT" || checkError?.code === "ECONNRESET") {
        const baseMessage = "Unable to connect to database. Check DATABASE_URL or DATABASE_PUBLIC_URL environment variable in your .env file and ensure database server is running.";
        return res.status(503).json({
          success: false,
          error: "Database connection failed",
          message: getLocalhostErrorMessage(checkError?.code, baseMessage),
          diagnostic: "/health/database",
          errorCode: checkError?.code
        });
      }
      return res.status(503).json({
        success: false,
        error: "Database error",
        message: `Unable to verify database state: ${checkError?.message || "Unknown error"}. Check server logs for details.`,
        diagnostic: "/health/database"
      });
    }
    debugLog(" Step 4: Testing database connection...");
    try {
      await query("SELECT 1");
      debugLog(" Database connection test successful");
    } catch (connectionTestError) {
      debugError(" Database connection test failed:", connectionTestError);
      debugError(" Connection test error details:", {
        code: connectionTestError?.code,
        message: connectionTestError?.message
      });
      if (res.headersSent) {
        debugError(" Response already sent, cannot send error response");
        return;
      }
      if (connectionTestError?.code === "ECONNREFUSED" || connectionTestError?.code === "ETIMEDOUT" || connectionTestError?.code === "ECONNRESET") {
        const baseMessage = "Unable to connect to database. If DATABASE_URL points to localhost, ensure Postgres is running locally. For cloud/Railway databases, use the full remote connection string in DATABASE_PUBLIC_URL or DATABASE_URL.";
        return res.status(503).json({
          success: false,
          error: "Database connection failed",
          message: getLocalhostErrorMessage(connectionTestError?.code, baseMessage),
          diagnostic: "/health/database",
          errorCode: connectionTestError?.code
        });
      }
      return res.status(503).json({
        success: false,
        error: "Database connection error",
        message: `Database connection test failed: ${connectionTestError?.message || "Unknown error"}. Check DATABASE_URL or DATABASE_PUBLIC_URL environment variable in your .env file.`,
        diagnostic: "/health/database",
        errorCode: connectionTestError?.code
      });
    }
    debugLog(" Step 5: Querying user by email...");
    let userResult;
    try {
      if (requestedTenantId) {
        debugLog(" Querying with tenant filter:", requestedTenantId);
        userResult = await query(
          `SELECT id, first_name, last_name, email, password_hash, role, is_active, status,
           tenant_id, COALESCE(is_super_admin, false) as is_super_admin
           FROM users
           WHERE email = $1 AND (tenant_id = $2 OR COALESCE(is_super_admin, false) = true)
           LIMIT 1`,
          [email, requestedTenantId]
        );
      } else {
        debugLog(" Querying without tenant filter");
        userResult = await query(
          `SELECT id, first_name, last_name, email, password_hash, role, is_active, status,
           tenant_id, COALESCE(is_super_admin, false) as is_super_admin
           FROM users
           WHERE email = $1
           LIMIT 1`,
          [email]
        );
      }
      debugLog(" User query completed, found", userResult.rows.length, "user(s)");
    } catch (queryError) {
      debugError(" ========== USER QUERY ERROR ==========");
      debugError(" Query error type:", queryError?.constructor?.name);
      debugError(" Query error message:", queryError?.message);
      debugError(" Query error code:", queryError?.code);
      debugError(" Query error stack:", queryError?.stack);
      debugError(" =======================================");
      debugError(" Database query error during login:", queryError);
      debugError(" Query error details:", {
        code: queryError?.code,
        message: queryError?.message,
        errno: queryError?.errno,
        syscall: queryError?.syscall,
        stack: queryError?.stack
      });
      if (res.headersSent) {
        debugError(" Response already sent, cannot send error response");
        return;
      }
      if (queryError?.code === "42P01") {
        return res.status(503).json({
          success: false,
          error: "Database table missing",
          message: "Users table does not exist. Run: npm run sequelize:migrate",
          diagnostic: "/health/database",
          errorCode: queryError.code
        });
      }
      if (queryError?.code === "ECONNREFUSED" || queryError?.code === "ETIMEDOUT" || queryError?.code === "ECONNRESET") {
        const baseMessage = "Unable to connect to database. Check DATABASE_URL or DATABASE_PUBLIC_URL environment variable in your .env file and ensure database server is running.";
        return res.status(503).json({
          success: false,
          error: "Database connection failed",
          message: getLocalhostErrorMessage(queryError?.code, baseMessage),
          diagnostic: "/health/database",
          errorCode: queryError.code
        });
      }
      if (queryError?.code && queryError.code.startsWith("42")) {
        return res.status(500).json({
          success: false,
          error: "Database query error",
          message: `Database query failed (PostgreSQL error ${queryError.code}): ${queryError.message || "Unknown error"}. Check server logs for details.`,
          diagnostic: "/health/database",
          errorCode: queryError.code
        });
      }
      return res.status(500).json({
        success: false,
        error: "Database query failed",
        message: `Unable to verify credentials: ${queryError?.message || "Unknown error"}. Check server logs for details.`,
        diagnostic: "/health/database",
        errorCode: queryError?.code
      });
    }
    debugLog(" Step 6: Validating user...");
    if (userResult.rows.length === 0) {
      debugLog(" No user found with email:", email, "for tenant:", requestedTenantId || "(none)");
      if (requestedTenantId) {
        return res.status(403).json({
          success: false,
          error: "Access denied for tenant or invalid credentials",
          message: "This account is not associated with the selected tenant."
        });
      }
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }
    const user = userResult.rows[0];
    debugLog(" User found:", user.email, "ID:", user.id, "tenant_id:", user.tenant_id, "super_admin:", user.is_super_admin);
    if (!user.is_active) {
      debugError(" User account is not active:", user.email);
      return res.status(401).json({
        success: false,
        error: "Account is not active"
      });
    }
    if (user.status && user.status !== "active") {
      debugError(" User account status not active (", user.status, "):", user.email);
      return res.status(401).json({
        success: false,
        error: "Account pending approval"
      });
    }
    if (!user.password_hash) {
      debugError(" User has no password_hash:", user.email);
      return res.status(401).json({
        success: false,
        error: "Account configuration error. Please contact support."
      });
    }
    debugLog(" Step 7: Verifying password...");
    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt3.compare(password, user.password_hash);
      debugLog(" Password verification result:", isValidPassword);
    } catch (bcryptError) {
      debugError(" Bcrypt comparison error:", bcryptError);
      debugError(" Bcrypt error details:", {
        message: bcryptError?.message,
        stack: bcryptError?.stack
      });
      if (res.headersSent) {
        debugError(" Response already sent, cannot send error response");
        return;
      }
      return res.status(500).json({
        success: false,
        error: "Password verification failed",
        message: "An error occurred while verifying password. Please try again."
      });
    }
    if (!isValidPassword) {
      debugLog(" Invalid password for user:", user.email);
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }
    if (requestedThemeSlug && !user.is_super_admin && user.tenant_id) {
      debugLog(" Validating theme-tenant relationship...");
      debugLog(" Theme validation params:", { tenant_id: user.tenant_id, themeSlug: requestedThemeSlug });
      try {
        if (!user.tenant_id || !requestedThemeSlug) {
          debugError(" Invalid parameters for theme validation:", { tenant_id: user.tenant_id, themeSlug: requestedThemeSlug });
          if (res.headersSent) {
            return;
          }
          return res.status(400).json({
            success: false,
            error: "Invalid theme validation parameters",
            message: "Missing tenant ID or theme slug for validation."
          });
        }
        const tenantThemeCheck = await query(`
          SELECT id, name, slug, theme_id
          FROM tenants
          WHERE id = $1 AND theme_id = $2
          LIMIT 1
        `, [user.tenant_id, requestedThemeSlug]);
        if (tenantThemeCheck.rows.length === 0) {
          debugLog(" User tenant does not use requested theme");
          if (res.headersSent) {
            debugError(" Response already sent, cannot send error response");
            return;
          }
          return res.status(403).json({
            success: false,
            error: "Access denied",
            message: "Your tenant does not use this theme. You can only access themes assigned to your tenant.",
            code: "TENANT_THEME_MISMATCH"
          });
        }
        debugLog(" Theme-tenant relationship validated successfully");
      } catch (themeCheckError) {
        debugError(" Error validating theme-tenant relationship:", themeCheckError);
        debugError(" Theme check error details:", {
          code: themeCheckError?.code,
          message: themeCheckError?.message,
          stack: themeCheckError?.stack
        });
        if (res.headersSent) {
          debugError(" Response already sent, cannot send error response");
          return;
        }
        if (themeCheckError?.code === "42P01") {
          return res.status(503).json({
            success: false,
            error: "Database table missing",
            message: "Tenants table does not exist. Run: npm run sequelize:migrate",
            diagnostic: "/health/database",
            errorCode: themeCheckError.code
          });
        }
        if (themeCheckError?.code === "ECONNREFUSED" || themeCheckError?.code === "ETIMEDOUT" || themeCheckError?.code === "ECONNRESET") {
          const baseMessage = "Unable to connect to database. Check DATABASE_URL or DATABASE_PUBLIC_URL environment variable in your .env file and ensure database server is running.";
          return res.status(503).json({
            success: false,
            error: "Database connection failed",
            message: getLocalhostErrorMessage(themeCheckError?.code, baseMessage),
            diagnostic: "/health/database",
            errorCode: themeCheckError.code
          });
        }
        return res.status(500).json({
          success: false,
          error: "Theme validation failed",
          message: `Unable to verify theme access: ${themeCheckError?.message || "Unknown error"}. Please try again later.`,
          errorCode: themeCheckError?.code
        });
      }
    }
    debugLog(" Step 8: Creating JWT token...");
    const tenantId = user.is_super_admin ? requestedTenantId || null : user.tenant_id;
    const userData = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      tenant_id: tenantId,
      is_super_admin: user.is_super_admin || false,
      // Include theme context in token if provided (for downstream validation)
      themeSlug: requestedThemeSlug || null
    };
    let token;
    try {
      token = generateToken(userData);
      debugLog(" JWT token created successfully");
    } catch (tokenError) {
      debugError(" Token generation error:", tokenError);
      debugError(" Token error details:", {
        message: tokenError?.message,
        stack: tokenError?.stack
      });
      if (res.headersSent) {
        debugError(" Response already sent, cannot send error response");
        return;
      }
      return res.status(500).json({
        success: false,
        error: "Token generation failed",
        message: tokenError.message || "An error occurred while generating authentication token. Please try again."
      });
    }
    debugLog(" Step 9: Sending success response...");
    if (res.headersSent) {
      debugError(" Response already sent, cannot send success response");
      return;
    }
    debugLog(" Login successful for user:", user.email);
    res.json({
      success: true,
      user: userData,
      token
    });
  } catch (error) {
    debugError(" ========== LOGIN ERROR ==========");
    debugError(" Login error:", error);
    debugError(" Login error code:", error?.code);
    debugError(" Login error message:", error?.message);
    debugError(" Login error name:", error?.name);
    debugError(" Login error errno:", error?.errno);
    debugError(" Login error syscall:", error?.syscall);
    debugError(" Login error stack:", error?.stack);
    debugError(" ===================================");
    if (res.headersSent) {
      debugError(" Response already sent, cannot send error response");
      return;
    }
    if (error?.code === "ECONNREFUSED" || error?.code === "ETIMEDOUT" || error?.code === "ENOTFOUND" || error?.code === "ECONNRESET" || error?.code === "ENETUNREACH") {
      const baseMessage = `Unable to connect to database (${error.code}). Check DATABASE_URL or DATABASE_PUBLIC_URL environment variable in your .env file and ensure database server is running.`;
      return res.status(503).json({
        success: false,
        error: "Database connection failed",
        message: getLocalhostErrorMessage(error.code, baseMessage),
        diagnostic: "/health/database",
        errorCode: error.code
      });
    }
    if (error?.code === "EPROTO" || error?.code === "ETLS" || error?.message?.includes("SSL") || error?.message?.includes("TLS")) {
      return res.status(503).json({
        success: false,
        error: "Database SSL connection failed",
        message: `SSL/TLS connection error: ${error.message}. For localhost connections, you may need to disable SSL by setting DATABASE_SSL=false in your .env file.`,
        diagnostic: "/health/database",
        errorCode: error.code
      });
    }
    let dbState;
    try {
      dbState = getDatabaseState();
    } catch (stateError) {
      debugError(" Error getting database state in catch block:", stateError);
    }
    if (error?.code === "42P01" || error?.message?.includes("does not exist")) {
      if (dbState && !dbState.dbInitialized) {
        return res.status(503).json({
          success: false,
          error: "Database is initializing",
          message: "Database is still connecting. Please try again in a moment.",
          diagnostic: "/health/database"
        });
      }
      return res.status(503).json({
        success: false,
        error: "Database table missing",
        message: "Required database tables are missing. Please initialize the database schema.",
        diagnostic: "/health/database",
        errorCode: error.code
      });
    }
    if (error?.code && error.code.startsWith("42")) {
      return res.status(500).json({
        success: false,
        error: "Database query error",
        message: `Database query failed (PostgreSQL error ${error.code}): ${error.message || "Unknown error"}. Check server logs for details.`,
        diagnostic: "/health/database",
        errorCode: error.code
      });
    }
    debugError(" ========== UNHANDLED LOGIN ERROR ==========");
    debugError(" Error type:", error?.constructor?.name || "Unknown");
    debugError(" Error message:", error?.message);
    debugError(" Error code:", error?.code || "N/A");
    debugError(" Error stack:", error?.stack);
    debugError(" ===========================================");
    const isDevelopment = process.env.NODE_ENV === "development" || process.env.NODE_ENV !== "production";
    const errorMessage = isDevelopment && error?.message ? `Login failed: ${error.message}${error?.code ? ` (Code: ${error.code})` : ""}` : error?.message || "Server error. Please try again in a moment.";
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: errorMessage,
        message: errorMessage,
        diagnostic: "/health/database",
        errorCode: error?.code,
        ...isDevelopment && error?.stack ? { stack: error.stack } : {}
      });
    }
  }
}));
router2.post("/auth/register", async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        message: "first_name, last_name, email, and password are required"
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters long"
      });
    }
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = getDatabaseState();
    if (!dbInitialized2) {
      return res.status(503).json({
        success: false,
        error: dbInitializationError2 ? "Database initialization failed" : "Database is initializing",
        message: dbInitializationError2 ? dbInitializationError2.message : "Please try again in a moment"
      });
    }
    const check = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    if (!check.rows[0].exists) {
      return res.status(503).json({
        success: false,
        error: "Database not fully initialized",
        message: "Users table is missing. Run: npm run sequelize:migrate"
      });
    }
    const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: "Email already exists",
        message: "A user with this email already exists"
      });
    }
    const password_hash = await bcrypt3.hash(password, 10);
    const result = await query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role, status, is_active)
       VALUES ($1, $2, $3, $4, 'user', 'pending', false)
       RETURNING id, first_name, last_name, email, role, status, is_active`,
      [first_name, last_name, email, password_hash]
    );
    return res.status(201).json({
      success: true,
      user: result.rows[0],
      message: "Registration successful! Your account is pending approval."
    });
  } catch (error) {
    debugError(" Registration error:", error);
    if (error?.code === "42P01") {
      return res.status(503).json({
        success: false,
        error: "Database table missing",
        message: "Users table does not exist. Run: npm run sequelize:migrate"
      });
    }
    return res.status(500).json({
      success: false,
      error: "Registration failed",
      message: error?.message || "Unknown error"
    });
  }
});
router2.get("/auth/me", authenticateUser, async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = getDatabaseState();
    if (!dbInitialized2) {
      if (dbInitializationError2) {
        return res.status(503).json({
          success: false,
          error: "Database initialization failed",
          message: "Please try again later"
        });
      }
      return res.status(503).json({
        success: false,
        error: "Database is initializing",
        message: "Please try again in a moment"
      });
    }
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated"
      });
    }
    const userId = req.user.id;
    let userResult;
    try {
      userResult = await query(
        `SELECT id, first_name, last_name, email, role, status, 
         tenant_id, 
         COALESCE(is_super_admin, false) as is_super_admin 
         FROM users WHERE id = $1`,
        [userId]
      );
    } catch (queryError) {
      debugError(" Database query error in /auth/me:", queryError);
      return res.status(500).json({
        success: false,
        error: "Database query failed",
        message: "Unable to fetch user data. Please try again later."
      });
    }
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    const user = userResult.rows[0];
    const isActive = (user.status === "active" || user.status === void 0) && user.is_active !== false;
    if (!isActive) {
      return res.status(401).json({ success: false, error: "Account is not active" });
    }
    const tenantId = user.is_super_admin ? null : user.tenant_id;
    res.json({
      success: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        tenant_id: tenantId,
        is_super_admin: user.is_super_admin || false
      }
    });
  } catch (error) {
    debugError(" Error fetching current user:", error);
    const { dbInitialized: dbInitialized2 } = getDatabaseState();
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      if (!dbInitialized2) {
        return res.status(503).json({
          success: false,
          error: "Database is initializing",
          message: "Please try again in a moment"
        });
      }
    }
    res.status(500).json({
      success: false,
      error: "Failed to fetch user data."
    });
  }
});
router2.get("/auth/verify-access-key", async (req, res) => {
  try {
    const { access_key } = req.query;
    if (!access_key) {
      return res.status(400).json({
        success: false,
        error: "Access key is required"
      });
    }
    const result = await query(`
      SELECT 
        uak.id as key_id,
        uak.access_key,
        uak.key_name,
        uak.last_used_at,
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        u.is_active,
        u.tenant_id,
        u.is_super_admin
      FROM user_access_keys uak
      JOIN users u ON uak.user_id = u.id
      WHERE uak.access_key = $1 AND uak.is_active = true
    `, [access_key]);
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired access key"
      });
    }
    const keyData = result.rows[0];
    if (!keyData.is_active) {
      return res.status(401).json({
        success: false,
        error: "User account is not active"
      });
    }
    await query(
      "UPDATE user_access_keys SET last_used_at = NOW() WHERE id = $1",
      [keyData.key_id]
    );
    res.json({
      success: true,
      user: {
        id: keyData.id,
        first_name: keyData.first_name,
        last_name: keyData.last_name,
        email: keyData.email,
        role: keyData.role,
        tenant_id: keyData.tenant_id,
        is_super_admin: keyData.is_super_admin
      },
      access_key_info: {
        key_name: keyData.key_name,
        last_used_at: keyData.last_used_at
      }
    });
  } catch (error) {
    debugError(" Error verifying access key:", error);
    debugError(" Error details:", error.message);
    debugError(" Error stack:", error.stack);
    res.status(500).json({
      success: false,
      error: "Failed to verify access key"
    });
  }
});
router2.post("/access-keys/generate", authenticateUser, async (req, res) => {
  try {
    const { key_name } = req.body;
    const userId = req.user.id;
    if (!key_name || key_name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Key name is required"
      });
    }
    const { v4: uuidv4 } = await Promise.resolve().then(() => (init_dist_node(), dist_node_exports));
    const accessKey = uuidv4();
    const result = await query(
      "INSERT INTO user_access_keys (user_id, access_key, key_name) VALUES ($1, $2, $3) RETURNING id, access_key, key_name, created_at",
      [userId, accessKey, key_name.trim()]
    );
    const newKey = result.rows[0];
    res.json({
      success: true,
      access_key: newKey.access_key,
      key_name: newKey.key_name,
      created_at: newKey.created_at,
      message: "Access key generated successfully. Save this key - it won't be shown again."
    });
  } catch (error) {
    debugError(" Error generating access key:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate access key"
    });
  }
});
router2.get("/access-keys", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { include_inactive } = req.query;
    let queryStr = `
      SELECT id, key_name, access_key, is_active, last_used_at, created_at, updated_at
      FROM user_access_keys 
      WHERE user_id = $1
    `;
    const queryParams = [userId];
    if (include_inactive !== "true") {
      queryStr += " AND is_active = true";
    }
    queryStr += " ORDER BY created_at DESC";
    const result = await query(queryStr, queryParams);
    const maskedKeys = result.rows.map((key) => ({
      ...key,
      access_key: key.access_key.length > 8 ? key.access_key.substring(0, 4) + "..." + key.access_key.substring(key.access_key.length - 4) : "****"
    }));
    res.json({
      success: true,
      access_keys: maskedKeys
    });
  } catch (error) {
    debugError(" Error fetching access keys:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch access keys"
    });
  }
});
router2.delete("/access-keys/:keyId", authenticateUser, async (req, res) => {
  try {
    const { keyId } = req.params;
    const userId = req.user.id;
    const checkResult = await query(
      "SELECT id FROM user_access_keys WHERE id = $1 AND user_id = $2",
      [keyId, userId]
    );
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Access key not found or you do not have permission to revoke it"
      });
    }
    await query(
      "UPDATE user_access_keys SET is_active = false, updated_at = NOW() WHERE id = $1",
      [keyId]
    );
    res.json({
      success: true,
      message: "Access key revoked successfully"
    });
  } catch (error) {
    debugError(" Error revoking access key:", error);
    res.status(500).json({
      success: false,
      error: "Failed to revoke access key"
    });
  }
});
router2.get("/tenants", authenticateUser, async (req, res) => {
  try {
    if (!req.user.is_super_admin) {
      if (req.tenantId) {
        const tenant = await getTenantById(req.tenantId);
        return res.json(tenant ? [tenant] : []);
      }
      return res.json([]);
    }
    const tenants = await getAllTenants();
    res.json(tenants);
  } catch (error) {
    console.error("Error fetching tenants:", error);
    res.status(500).json({ error: "Failed to fetch tenants" });
  }
});
router2.get("/tenants/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = await getTenantById(id);
    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }
    res.json(tenant);
  } catch (error) {
    console.error(`[testing] Error getting tenant with ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to get tenant" });
  }
});
router2.post("/tenants", async (req, res) => {
  try {
    const { name, template } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Tenant name is required" });
    }
    const theme_id = template && template !== "custom" ? template : null;
    if (theme_id) {
      const themeRecord = await getThemeBySlug(theme_id);
      if (!themeRecord) {
        return res.status(400).json({
          error: "Invalid theme",
          message: `Theme "${theme_id}" does not exist in the themes table. Please ensure the theme is synced from the file system.`
        });
      }
      if (!themeRecord.is_active) {
        return res.status(400).json({
          error: "Theme is not active",
          message: `Theme "${theme_id}" exists but is marked as inactive.`
        });
      }
    }
    const newTenant = await createTenant({ name, theme_id });
    const response = {
      ...newTenant,
      message: "Tenant created successfully"
    };
    if (newTenant.initialization) {
      const init = newTenant.initialization;
      const summary = init.summary || {};
      const totalInitialized = summary.total || 0;
      response.initialization = {
        success: true,
        summary: {
          settings: summary.settings || 0,
          branding: summary.branding || 0,
          sitemap: summary.sitemap || 0,
          media_folders: summary.media_folders || 0,
          robots: summary.robots || 0,
          categories: summary.categories || 0,
          tags: summary.tags || 0,
          total: totalInitialized
        },
        message: `Tenant initialized with ${totalInitialized} default records`
      };
    }
    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating tenant:", error);
    res.status(500).json({ error: "Failed to create tenant" });
  }
});
router2.post("/tenants/:id/import-theme", authenticateUser, async (req, res) => {
  try {
    const { id: tenantId } = req.params;
    const { theme } = req.body;
    if (!theme) {
      return res.status(400).json({ error: "Theme name is required" });
    }
    const tenant = await getTenantById(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }
    const themeRecord = await getThemeBySlug(theme);
    if (!themeRecord) {
      return res.status(404).json({
        error: "Theme not found",
        message: `Theme "${theme}" does not exist in the themes table. Please ensure the theme is synced from the file system.`
      });
    }
    if (!themeRecord.is_active) {
      return res.status(400).json({
        error: "Theme is not active",
        message: `Theme "${theme}" exists but is marked as inactive.`
      });
    }
    if (!tenant.theme_id) {
      await updateTenant(tenantId, { theme_id: theme });
    }
    const getThemePages = () => {
      if (theme === "landingpage") {
        return [
          {
            page_name: "Homepage",
            slug: "/",
            meta_title: "Homepage",
            meta_description: "Welcome to our homepage",
            seo_index: true,
            status: "published",
            page_type: "page"
          }
        ];
      }
      return [];
    };
    const themePages = getThemePages();
    const importedPages = [];
    for (const pageData of themePages) {
      try {
        const createdPage = await createPage({
          ...pageData,
          tenant_id: tenantId
        });
        importedPages.push(createdPage);
      } catch (error) {
        console.error(`[testing] Error importing page ${pageData.page_name}:`, error);
      }
    }
    try {
      const defaultHeaderSchema = {
        logo: {
          src: "",
          alt: "Logo",
          height: "40px"
        },
        menu: [],
        showCart: false,
        showSearch: false,
        showAccount: false
      };
      const defaultFooterSchema = {
        logo: {
          src: "",
          alt: "Logo"
        },
        links: [],
        socialLinks: [],
        copyright: `\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} ${tenant.name}. All rights reserved.`
      };
      const { getSiteSchema: getSiteSchema2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const existingHeader = await getSiteSchema2("header", tenantId);
      if (!existingHeader) {
        await updateSiteSchema("header", defaultHeaderSchema, "default", tenantId);
      }
      const existingFooter = await getSiteSchema2("footer", tenantId);
      if (!existingFooter) {
        await updateSiteSchema("footer", defaultFooterSchema, "default", tenantId);
      }
    } catch (schemaError) {
      debugError(" Error importing schemas:", schemaError);
    }
    res.json({
      success: true,
      message: `Theme "${theme}" imported successfully`,
      importedPages: importedPages.length,
      pages: importedPages
    });
  } catch (error) {
    debugError(" Error importing theme:", error);
    res.status(500).json({ error: "Failed to import theme" });
  }
});
router2.post("/tenants/:id/sync", authenticateUser, async (req, res) => {
  try {
    const { id: tenantId } = req.params;
    const tenant = await getTenantById(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }
    if (!req.user.is_super_admin && req.user.tenant_id !== tenantId) {
      return res.status(403).json({ error: "Access denied" });
    }
    console.log(`[testing] Syncing tenant ${tenantId}...`);
    const initializationSummary = await initializeTenantDefaults(tenantId);
    const summary = initializationSummary.summary || {
      total: 0,
      settings: 0,
      branding: 0,
      sitemap: initializationSummary.sitemap?.inserted || 0,
      media_folders: initializationSummary.media?.folders?.inserted || 0,
      robots: 0,
      categories: 0,
      tags: 0
    };
    res.json({
      success: true,
      message: "Tenant synced successfully",
      tenant_id: tenantId,
      initialization: {
        success: true,
        summary,
        message: summary.total > 0 ? `Created ${summary.total} missing field(s)` : "Tenant is already up to date"
      }
    });
  } catch (error) {
    debugError(" Error syncing tenant:", error);
    res.status(500).json({
      error: "Failed to sync tenant",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router2.put("/tenants/:id", async (req, res) => {
  try {
    const { name, theme_id } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Tenant name is required" });
    }
    const updatedTenant = await updateTenant(req.params.id, { name, theme_id });
    if (!updatedTenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }
    res.json(updatedTenant);
  } catch (error) {
    console.error(`[testing] Error updating tenant with ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to update tenant" });
  }
});
router2.delete("/tenants/:id", async (req, res) => {
  try {
    const result = await deleteTenant(req.params.id);
    if (!result.success) {
      return res.status(404).json({ error: result.message });
    }
    res.json({ message: "Tenant deleted successfully" });
  } catch (error) {
    console.error(`[testing] Error deleting tenant with ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to delete tenant" });
  }
});
router2.get("/tenants/:id/database", async (req, res) => {
  try {
    const dbDetails = await getTenantDatabaseDetails(req.params.id);
    if (!dbDetails) {
      return res.status(404).json({ error: "Database details not found for this tenant" });
    }
    res.json(dbDetails);
  } catch (error) {
    console.error(`[testing] Error getting database details for tenant ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to get database details" });
  }
});
router2.post("/tenants/:id/database", async (req, res) => {
  try {
    const { host, port, database_name, username, password, ssl } = req.body;
    if (!host || !database_name || !username || !password) {
      return res.status(400).json({ error: "Host, database name, username, and password are required" });
    }
    const result = await setTenantDatabaseDetails(req.params.id, {
      host,
      port: port || 5432,
      database_name,
      username,
      password,
      ssl: ssl !== void 0 ? ssl : true
    });
    if (!result.success) {
      return res.status(404).json({ error: result.message });
    }
    res.json(result.data);
  } catch (error) {
    console.error(`[testing] Error setting database details for tenant ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to set database details" });
  }
});
router2.post("/tenants/:id/api-keys", async (req, res) => {
  try {
    const { description } = req.body;
    const result = await generateTenantApiKey(req.params.id, description || "API Access Key");
    if (!result.success) {
      return res.status(404).json({ error: result.message });
    }
    res.json({ apiKey: result.apiKey });
  } catch (error) {
    console.error(`[testing] Error generating API key for tenant ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to generate API key" });
  }
});
router2.get("/tenants/:id/api-keys", async (req, res) => {
  try {
    const apiKeys = await getTenantApiKeys(req.params.id);
    res.json(apiKeys);
  } catch (error) {
    console.error(`[testing] Error getting API keys for tenant ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to get API keys" });
  }
});
router2.delete("/tenants/:id/api-keys/:keyId", async (req, res) => {
  try {
    await deleteTenantApiKey(req.params.keyId);
    res.json({ message: "API key deleted successfully" });
  } catch (error) {
    console.error(`[testing] Error deleting API key with ID ${req.params.keyId}:`, error);
    res.status(500).json({ error: "Failed to delete API key" });
  }
});
router2.post("/tenants/validate-api-key", async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({ error: "API key is required" });
    }
    const result = await validateApiKey(apiKey);
    res.json(result);
  } catch (error) {
    console.error("Error validating API key:", error);
    res.status(500).json({ error: "Failed to validate API key" });
  }
});
var auth_default = router2;

// server/routes/content.js
init_db();
import express4 from "express";
init_themeSync();
init_db();

// server/config/multer.js
import multer from "multer";
import { fileURLToPath as fileURLToPath6 } from "url";
import { dirname as dirname4, join as join3 } from "path";
import { existsSync as existsSync2, mkdirSync as mkdirSync2 } from "fs";
var __filename6 = fileURLToPath6(import.meta.url);
var __dirname6 = dirname4(__filename6);
async function getTenantStoragePath(tenantId) {
  try {
    const envKey = `RAILWAY_STORAGE_${tenantId.toUpperCase().replace(/-/g, "_")}`;
    const envStorageName = process.env[envKey];
    let storageName = envStorageName;
    if (!storageName) {
      const { query: query2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const result = await query2(`
        SELECT storage_name FROM tenants WHERE id = $1
      `, [tenantId]);
      if (result.rows.length > 0 && result.rows[0].storage_name) {
        storageName = result.rows[0].storage_name;
      }
    }
    storageName = storageName || tenantId;
    const tenantUploadsDir = join3(__dirname6, "..", "..", "public", "uploads", storageName);
    if (!existsSync2(tenantUploadsDir)) {
      mkdirSync2(tenantUploadsDir, { recursive: true });
      console.log("[testing] Created tenant uploads directory:", tenantUploadsDir);
    }
    return tenantUploadsDir;
  } catch (error) {
    console.error(`[testing] Error getting storage path for tenant ${tenantId}:`, error);
    const defaultDir = join3(__dirname6, "..", "..", "public", "uploads");
    if (!existsSync2(defaultDir)) {
      mkdirSync2(defaultDir, { recursive: true });
    }
    return defaultDir;
  }
}
var storage = multer.diskStorage({
  destination: async function(req, file, cb) {
    try {
      const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || "tenant-gosg";
      const tenantUploadsDir = await getTenantStoragePath(tenantId);
      cb(null, tenantUploadsDir);
    } catch (error) {
      console.error("[testing] Error setting upload destination:", error);
      const defaultDir = join3(__dirname6, "..", "..", "public", "uploads");
      if (!existsSync2(defaultDir)) {
        mkdirSync2(defaultDir, { recursive: true });
      }
      cb(null, defaultDir);
    }
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split(".").pop();
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + ext);
  }
});
var simpleStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadsDir = join3(__dirname6, "..", "..", "public", "uploads");
    if (!existsSync2(uploadsDir)) {
      mkdirSync2(uploadsDir, { recursive: true });
      console.log("[testing] Created uploads directory:", uploadsDir);
    }
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split(".").pop();
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + ext);
  }
});
var upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024
    // 50MB limit (for WordPress import files)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg|ico|webp|mp4|mov|avi|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|xml|json/;
    const ext = allowedTypes.test(file.originalname.split(".").pop().toLowerCase());
    const mime = allowedTypes.test(file.mimetype) || file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/") || file.mimetype.startsWith("application/") || file.mimetype === "text/xml" || file.mimetype === "application/xml" || file.mimetype === "application/json" || file.mimetype === "text/json";
    if (ext || mime) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"));
    }
  }
});
var simpleUpload = multer({
  storage: simpleStorage,
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit for basic uploads
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg|ico|webp|pdf/;
    const ext = allowedTypes.test(file.originalname.split(".").pop().toLowerCase());
    const mime = allowedTypes.test(file.mimetype) || file.mimetype.startsWith("image/") || file.mimetype === "application/pdf";
    if (ext || mime) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed. Only images and PDFs are allowed."));
    }
  }
});

// server/routes/content.js
import { readFileSync } from "fs";

// node_modules/fast-xml-parser/src/util.js
var nameStartChar = ":A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
var nameChar = nameStartChar + "\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
var nameRegexp = "[" + nameStartChar + "][" + nameChar + "]*";
var regexName = new RegExp("^" + nameRegexp + "$");
function getAllMatches(string, regex) {
  const matches = [];
  let match = regex.exec(string);
  while (match) {
    const allmatches = [];
    allmatches.startIndex = regex.lastIndex - match[0].length;
    const len = match.length;
    for (let index = 0; index < len; index++) {
      allmatches.push(match[index]);
    }
    matches.push(allmatches);
    match = regex.exec(string);
  }
  return matches;
}
var isName = function(string) {
  const match = regexName.exec(string);
  return !(match === null || typeof match === "undefined");
};
function isExist(v) {
  return typeof v !== "undefined";
}

// node_modules/fast-xml-parser/src/validator.js
var defaultOptions = {
  allowBooleanAttributes: false,
  //A tag can have attributes without any value
  unpairedTags: []
};
function validate2(xmlData, options) {
  options = Object.assign({}, defaultOptions, options);
  const tags = [];
  let tagFound = false;
  let reachedRoot = false;
  if (xmlData[0] === "\uFEFF") {
    xmlData = xmlData.substr(1);
  }
  for (let i = 0; i < xmlData.length; i++) {
    if (xmlData[i] === "<" && xmlData[i + 1] === "?") {
      i += 2;
      i = readPI(xmlData, i);
      if (i.err) return i;
    } else if (xmlData[i] === "<") {
      let tagStartPos = i;
      i++;
      if (xmlData[i] === "!") {
        i = readCommentAndCDATA(xmlData, i);
        continue;
      } else {
        let closingTag = false;
        if (xmlData[i] === "/") {
          closingTag = true;
          i++;
        }
        let tagName = "";
        for (; i < xmlData.length && xmlData[i] !== ">" && xmlData[i] !== " " && xmlData[i] !== "	" && xmlData[i] !== "\n" && xmlData[i] !== "\r"; i++) {
          tagName += xmlData[i];
        }
        tagName = tagName.trim();
        if (tagName[tagName.length - 1] === "/") {
          tagName = tagName.substring(0, tagName.length - 1);
          i--;
        }
        if (!validateTagName(tagName)) {
          let msg;
          if (tagName.trim().length === 0) {
            msg = "Invalid space after '<'.";
          } else {
            msg = "Tag '" + tagName + "' is an invalid name.";
          }
          return getErrorObject("InvalidTag", msg, getLineNumberForPosition(xmlData, i));
        }
        const result = readAttributeStr(xmlData, i);
        if (result === false) {
          return getErrorObject("InvalidAttr", "Attributes for '" + tagName + "' have open quote.", getLineNumberForPosition(xmlData, i));
        }
        let attrStr = result.value;
        i = result.index;
        if (attrStr[attrStr.length - 1] === "/") {
          const attrStrStart = i - attrStr.length;
          attrStr = attrStr.substring(0, attrStr.length - 1);
          const isValid = validateAttributeString(attrStr, options);
          if (isValid === true) {
            tagFound = true;
          } else {
            return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, attrStrStart + isValid.err.line));
          }
        } else if (closingTag) {
          if (!result.tagClosed) {
            return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' doesn't have proper closing.", getLineNumberForPosition(xmlData, i));
          } else if (attrStr.trim().length > 0) {
            return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' can't have attributes or invalid starting.", getLineNumberForPosition(xmlData, tagStartPos));
          } else if (tags.length === 0) {
            return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' has not been opened.", getLineNumberForPosition(xmlData, tagStartPos));
          } else {
            const otg = tags.pop();
            if (tagName !== otg.tagName) {
              let openPos = getLineNumberForPosition(xmlData, otg.tagStartPos);
              return getErrorObject(
                "InvalidTag",
                "Expected closing tag '" + otg.tagName + "' (opened in line " + openPos.line + ", col " + openPos.col + ") instead of closing tag '" + tagName + "'.",
                getLineNumberForPosition(xmlData, tagStartPos)
              );
            }
            if (tags.length == 0) {
              reachedRoot = true;
            }
          }
        } else {
          const isValid = validateAttributeString(attrStr, options);
          if (isValid !== true) {
            return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, i - attrStr.length + isValid.err.line));
          }
          if (reachedRoot === true) {
            return getErrorObject("InvalidXml", "Multiple possible root nodes found.", getLineNumberForPosition(xmlData, i));
          } else if (options.unpairedTags.indexOf(tagName) !== -1) {
          } else {
            tags.push({ tagName, tagStartPos });
          }
          tagFound = true;
        }
        for (i++; i < xmlData.length; i++) {
          if (xmlData[i] === "<") {
            if (xmlData[i + 1] === "!") {
              i++;
              i = readCommentAndCDATA(xmlData, i);
              continue;
            } else if (xmlData[i + 1] === "?") {
              i = readPI(xmlData, ++i);
              if (i.err) return i;
            } else {
              break;
            }
          } else if (xmlData[i] === "&") {
            const afterAmp = validateAmpersand(xmlData, i);
            if (afterAmp == -1)
              return getErrorObject("InvalidChar", "char '&' is not expected.", getLineNumberForPosition(xmlData, i));
            i = afterAmp;
          } else {
            if (reachedRoot === true && !isWhiteSpace(xmlData[i])) {
              return getErrorObject("InvalidXml", "Extra text at the end", getLineNumberForPosition(xmlData, i));
            }
          }
        }
        if (xmlData[i] === "<") {
          i--;
        }
      }
    } else {
      if (isWhiteSpace(xmlData[i])) {
        continue;
      }
      return getErrorObject("InvalidChar", "char '" + xmlData[i] + "' is not expected.", getLineNumberForPosition(xmlData, i));
    }
  }
  if (!tagFound) {
    return getErrorObject("InvalidXml", "Start tag expected.", 1);
  } else if (tags.length == 1) {
    return getErrorObject("InvalidTag", "Unclosed tag '" + tags[0].tagName + "'.", getLineNumberForPosition(xmlData, tags[0].tagStartPos));
  } else if (tags.length > 0) {
    return getErrorObject("InvalidXml", "Invalid '" + JSON.stringify(tags.map((t) => t.tagName), null, 4).replace(/\r?\n/g, "") + "' found.", { line: 1, col: 1 });
  }
  return true;
}
function isWhiteSpace(char) {
  return char === " " || char === "	" || char === "\n" || char === "\r";
}
function readPI(xmlData, i) {
  const start = i;
  for (; i < xmlData.length; i++) {
    if (xmlData[i] == "?" || xmlData[i] == " ") {
      const tagname = xmlData.substr(start, i - start);
      if (i > 5 && tagname === "xml") {
        return getErrorObject("InvalidXml", "XML declaration allowed only at the start of the document.", getLineNumberForPosition(xmlData, i));
      } else if (xmlData[i] == "?" && xmlData[i + 1] == ">") {
        i++;
        break;
      } else {
        continue;
      }
    }
  }
  return i;
}
function readCommentAndCDATA(xmlData, i) {
  if (xmlData.length > i + 5 && xmlData[i + 1] === "-" && xmlData[i + 2] === "-") {
    for (i += 3; i < xmlData.length; i++) {
      if (xmlData[i] === "-" && xmlData[i + 1] === "-" && xmlData[i + 2] === ">") {
        i += 2;
        break;
      }
    }
  } else if (xmlData.length > i + 8 && xmlData[i + 1] === "D" && xmlData[i + 2] === "O" && xmlData[i + 3] === "C" && xmlData[i + 4] === "T" && xmlData[i + 5] === "Y" && xmlData[i + 6] === "P" && xmlData[i + 7] === "E") {
    let angleBracketsCount = 1;
    for (i += 8; i < xmlData.length; i++) {
      if (xmlData[i] === "<") {
        angleBracketsCount++;
      } else if (xmlData[i] === ">") {
        angleBracketsCount--;
        if (angleBracketsCount === 0) {
          break;
        }
      }
    }
  } else if (xmlData.length > i + 9 && xmlData[i + 1] === "[" && xmlData[i + 2] === "C" && xmlData[i + 3] === "D" && xmlData[i + 4] === "A" && xmlData[i + 5] === "T" && xmlData[i + 6] === "A" && xmlData[i + 7] === "[") {
    for (i += 8; i < xmlData.length; i++) {
      if (xmlData[i] === "]" && xmlData[i + 1] === "]" && xmlData[i + 2] === ">") {
        i += 2;
        break;
      }
    }
  }
  return i;
}
var doubleQuote = '"';
var singleQuote = "'";
function readAttributeStr(xmlData, i) {
  let attrStr = "";
  let startChar = "";
  let tagClosed = false;
  for (; i < xmlData.length; i++) {
    if (xmlData[i] === doubleQuote || xmlData[i] === singleQuote) {
      if (startChar === "") {
        startChar = xmlData[i];
      } else if (startChar !== xmlData[i]) {
      } else {
        startChar = "";
      }
    } else if (xmlData[i] === ">") {
      if (startChar === "") {
        tagClosed = true;
        break;
      }
    }
    attrStr += xmlData[i];
  }
  if (startChar !== "") {
    return false;
  }
  return {
    value: attrStr,
    index: i,
    tagClosed
  };
}
var validAttrStrRegxp = new RegExp(`(\\s*)([^\\s=]+)(\\s*=)?(\\s*(['"])(([\\s\\S])*?)\\5)?`, "g");
function validateAttributeString(attrStr, options) {
  const matches = getAllMatches(attrStr, validAttrStrRegxp);
  const attrNames = {};
  for (let i = 0; i < matches.length; i++) {
    if (matches[i][1].length === 0) {
      return getErrorObject("InvalidAttr", "Attribute '" + matches[i][2] + "' has no space in starting.", getPositionFromMatch(matches[i]));
    } else if (matches[i][3] !== void 0 && matches[i][4] === void 0) {
      return getErrorObject("InvalidAttr", "Attribute '" + matches[i][2] + "' is without value.", getPositionFromMatch(matches[i]));
    } else if (matches[i][3] === void 0 && !options.allowBooleanAttributes) {
      return getErrorObject("InvalidAttr", "boolean attribute '" + matches[i][2] + "' is not allowed.", getPositionFromMatch(matches[i]));
    }
    const attrName = matches[i][2];
    if (!validateAttrName(attrName)) {
      return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is an invalid name.", getPositionFromMatch(matches[i]));
    }
    if (!attrNames.hasOwnProperty(attrName)) {
      attrNames[attrName] = 1;
    } else {
      return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is repeated.", getPositionFromMatch(matches[i]));
    }
  }
  return true;
}
function validateNumberAmpersand(xmlData, i) {
  let re = /\d/;
  if (xmlData[i] === "x") {
    i++;
    re = /[\da-fA-F]/;
  }
  for (; i < xmlData.length; i++) {
    if (xmlData[i] === ";")
      return i;
    if (!xmlData[i].match(re))
      break;
  }
  return -1;
}
function validateAmpersand(xmlData, i) {
  i++;
  if (xmlData[i] === ";")
    return -1;
  if (xmlData[i] === "#") {
    i++;
    return validateNumberAmpersand(xmlData, i);
  }
  let count = 0;
  for (; i < xmlData.length; i++, count++) {
    if (xmlData[i].match(/\w/) && count < 20)
      continue;
    if (xmlData[i] === ";")
      break;
    return -1;
  }
  return i;
}
function getErrorObject(code, message, lineNumber) {
  return {
    err: {
      code,
      msg: message,
      line: lineNumber.line || lineNumber,
      col: lineNumber.col
    }
  };
}
function validateAttrName(attrName) {
  return isName(attrName);
}
function validateTagName(tagname) {
  return isName(tagname);
}
function getLineNumberForPosition(xmlData, index) {
  const lines = xmlData.substring(0, index).split(/\r?\n/);
  return {
    line: lines.length,
    // column number is last line's length + 1, because column numbering starts at 1:
    col: lines[lines.length - 1].length + 1
  };
}
function getPositionFromMatch(match) {
  return match.startIndex + match[1].length;
}

// node_modules/fast-xml-parser/src/xmlparser/OptionsBuilder.js
var defaultOptions2 = {
  preserveOrder: false,
  attributeNamePrefix: "@_",
  attributesGroupName: false,
  textNodeName: "#text",
  ignoreAttributes: true,
  removeNSPrefix: false,
  // remove NS from tag name or attribute name if true
  allowBooleanAttributes: false,
  //a tag can have attributes without any value
  //ignoreRootElement : false,
  parseTagValue: true,
  parseAttributeValue: false,
  trimValues: true,
  //Trim string values of tag and attributes
  cdataPropName: false,
  numberParseOptions: {
    hex: true,
    leadingZeros: true,
    eNotation: true
  },
  tagValueProcessor: function(tagName, val) {
    return val;
  },
  attributeValueProcessor: function(attrName, val) {
    return val;
  },
  stopNodes: [],
  //nested tags will not be parsed even for errors
  alwaysCreateTextNode: false,
  isArray: () => false,
  commentPropName: false,
  unpairedTags: [],
  processEntities: true,
  htmlEntities: false,
  ignoreDeclaration: false,
  ignorePiTags: false,
  transformTagName: false,
  transformAttributeName: false,
  updateTag: function(tagName, jPath, attrs) {
    return tagName;
  },
  // skipEmptyListItem: false
  captureMetaData: false
};
var buildOptions = function(options) {
  return Object.assign({}, defaultOptions2, options);
};

// node_modules/fast-xml-parser/src/xmlparser/xmlNode.js
var METADATA_SYMBOL;
if (typeof Symbol !== "function") {
  METADATA_SYMBOL = "@@xmlMetadata";
} else {
  METADATA_SYMBOL = Symbol("XML Node Metadata");
}
var XmlNode = class {
  constructor(tagname) {
    this.tagname = tagname;
    this.child = [];
    this[":@"] = {};
  }
  add(key, val) {
    if (key === "__proto__") key = "#__proto__";
    this.child.push({ [key]: val });
  }
  addChild(node, startIndex) {
    if (node.tagname === "__proto__") node.tagname = "#__proto__";
    if (node[":@"] && Object.keys(node[":@"]).length > 0) {
      this.child.push({ [node.tagname]: node.child, [":@"]: node[":@"] });
    } else {
      this.child.push({ [node.tagname]: node.child });
    }
    if (startIndex !== void 0) {
      this.child[this.child.length - 1][METADATA_SYMBOL] = { startIndex };
    }
  }
  /** symbol used for metadata */
  static getMetaDataSymbol() {
    return METADATA_SYMBOL;
  }
};

// node_modules/fast-xml-parser/src/xmlparser/DocTypeReader.js
var DocTypeReader = class {
  constructor(processEntities) {
    this.suppressValidationErr = !processEntities;
  }
  readDocType(xmlData, i) {
    const entities = {};
    if (xmlData[i + 3] === "O" && xmlData[i + 4] === "C" && xmlData[i + 5] === "T" && xmlData[i + 6] === "Y" && xmlData[i + 7] === "P" && xmlData[i + 8] === "E") {
      i = i + 9;
      let angleBracketsCount = 1;
      let hasBody = false, comment = false;
      let exp = "";
      for (; i < xmlData.length; i++) {
        if (xmlData[i] === "<" && !comment) {
          if (hasBody && hasSeq(xmlData, "!ENTITY", i)) {
            i += 7;
            let entityName, val;
            [entityName, val, i] = this.readEntityExp(xmlData, i + 1, this.suppressValidationErr);
            if (val.indexOf("&") === -1)
              entities[entityName] = {
                regx: RegExp(`&${entityName};`, "g"),
                val
              };
          } else if (hasBody && hasSeq(xmlData, "!ELEMENT", i)) {
            i += 8;
            const { index } = this.readElementExp(xmlData, i + 1);
            i = index;
          } else if (hasBody && hasSeq(xmlData, "!ATTLIST", i)) {
            i += 8;
          } else if (hasBody && hasSeq(xmlData, "!NOTATION", i)) {
            i += 9;
            const { index } = this.readNotationExp(xmlData, i + 1, this.suppressValidationErr);
            i = index;
          } else if (hasSeq(xmlData, "!--", i)) comment = true;
          else throw new Error(`Invalid DOCTYPE`);
          angleBracketsCount++;
          exp = "";
        } else if (xmlData[i] === ">") {
          if (comment) {
            if (xmlData[i - 1] === "-" && xmlData[i - 2] === "-") {
              comment = false;
              angleBracketsCount--;
            }
          } else {
            angleBracketsCount--;
          }
          if (angleBracketsCount === 0) {
            break;
          }
        } else if (xmlData[i] === "[") {
          hasBody = true;
        } else {
          exp += xmlData[i];
        }
      }
      if (angleBracketsCount !== 0) {
        throw new Error(`Unclosed DOCTYPE`);
      }
    } else {
      throw new Error(`Invalid Tag instead of DOCTYPE`);
    }
    return { entities, i };
  }
  readEntityExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    let entityName = "";
    while (i < xmlData.length && !/\s/.test(xmlData[i]) && xmlData[i] !== '"' && xmlData[i] !== "'") {
      entityName += xmlData[i];
      i++;
    }
    validateEntityName(entityName);
    i = skipWhitespace(xmlData, i);
    if (!this.suppressValidationErr) {
      if (xmlData.substring(i, i + 6).toUpperCase() === "SYSTEM") {
        throw new Error("External entities are not supported");
      } else if (xmlData[i] === "%") {
        throw new Error("Parameter entities are not supported");
      }
    }
    let entityValue = "";
    [i, entityValue] = this.readIdentifierVal(xmlData, i, "entity");
    i--;
    return [entityName, entityValue, i];
  }
  readNotationExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    let notationName = "";
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      notationName += xmlData[i];
      i++;
    }
    !this.suppressValidationErr && validateEntityName(notationName);
    i = skipWhitespace(xmlData, i);
    const identifierType = xmlData.substring(i, i + 6).toUpperCase();
    if (!this.suppressValidationErr && identifierType !== "SYSTEM" && identifierType !== "PUBLIC") {
      throw new Error(`Expected SYSTEM or PUBLIC, found "${identifierType}"`);
    }
    i += identifierType.length;
    i = skipWhitespace(xmlData, i);
    let publicIdentifier = null;
    let systemIdentifier = null;
    if (identifierType === "PUBLIC") {
      [i, publicIdentifier] = this.readIdentifierVal(xmlData, i, "publicIdentifier");
      i = skipWhitespace(xmlData, i);
      if (xmlData[i] === '"' || xmlData[i] === "'") {
        [i, systemIdentifier] = this.readIdentifierVal(xmlData, i, "systemIdentifier");
      }
    } else if (identifierType === "SYSTEM") {
      [i, systemIdentifier] = this.readIdentifierVal(xmlData, i, "systemIdentifier");
      if (!this.suppressValidationErr && !systemIdentifier) {
        throw new Error("Missing mandatory system identifier for SYSTEM notation");
      }
    }
    return { notationName, publicIdentifier, systemIdentifier, index: --i };
  }
  readIdentifierVal(xmlData, i, type) {
    let identifierVal = "";
    const startChar = xmlData[i];
    if (startChar !== '"' && startChar !== "'") {
      throw new Error(`Expected quoted string, found "${startChar}"`);
    }
    i++;
    while (i < xmlData.length && xmlData[i] !== startChar) {
      identifierVal += xmlData[i];
      i++;
    }
    if (xmlData[i] !== startChar) {
      throw new Error(`Unterminated ${type} value`);
    }
    i++;
    return [i, identifierVal];
  }
  readElementExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    let elementName = "";
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      elementName += xmlData[i];
      i++;
    }
    if (!this.suppressValidationErr && !isName(elementName)) {
      throw new Error(`Invalid element name: "${elementName}"`);
    }
    i = skipWhitespace(xmlData, i);
    let contentModel = "";
    if (xmlData[i] === "E" && hasSeq(xmlData, "MPTY", i)) i += 4;
    else if (xmlData[i] === "A" && hasSeq(xmlData, "NY", i)) i += 2;
    else if (xmlData[i] === "(") {
      i++;
      while (i < xmlData.length && xmlData[i] !== ")") {
        contentModel += xmlData[i];
        i++;
      }
      if (xmlData[i] !== ")") {
        throw new Error("Unterminated content model");
      }
    } else if (!this.suppressValidationErr) {
      throw new Error(`Invalid Element Expression, found "${xmlData[i]}"`);
    }
    return {
      elementName,
      contentModel: contentModel.trim(),
      index: i
    };
  }
  readAttlistExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    let elementName = "";
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      elementName += xmlData[i];
      i++;
    }
    validateEntityName(elementName);
    i = skipWhitespace(xmlData, i);
    let attributeName = "";
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      attributeName += xmlData[i];
      i++;
    }
    if (!validateEntityName(attributeName)) {
      throw new Error(`Invalid attribute name: "${attributeName}"`);
    }
    i = skipWhitespace(xmlData, i);
    let attributeType = "";
    if (xmlData.substring(i, i + 8).toUpperCase() === "NOTATION") {
      attributeType = "NOTATION";
      i += 8;
      i = skipWhitespace(xmlData, i);
      if (xmlData[i] !== "(") {
        throw new Error(`Expected '(', found "${xmlData[i]}"`);
      }
      i++;
      let allowedNotations = [];
      while (i < xmlData.length && xmlData[i] !== ")") {
        let notation = "";
        while (i < xmlData.length && xmlData[i] !== "|" && xmlData[i] !== ")") {
          notation += xmlData[i];
          i++;
        }
        notation = notation.trim();
        if (!validateEntityName(notation)) {
          throw new Error(`Invalid notation name: "${notation}"`);
        }
        allowedNotations.push(notation);
        if (xmlData[i] === "|") {
          i++;
          i = skipWhitespace(xmlData, i);
        }
      }
      if (xmlData[i] !== ")") {
        throw new Error("Unterminated list of notations");
      }
      i++;
      attributeType += " (" + allowedNotations.join("|") + ")";
    } else {
      while (i < xmlData.length && !/\s/.test(xmlData[i])) {
        attributeType += xmlData[i];
        i++;
      }
      const validTypes = ["CDATA", "ID", "IDREF", "IDREFS", "ENTITY", "ENTITIES", "NMTOKEN", "NMTOKENS"];
      if (!this.suppressValidationErr && !validTypes.includes(attributeType.toUpperCase())) {
        throw new Error(`Invalid attribute type: "${attributeType}"`);
      }
    }
    i = skipWhitespace(xmlData, i);
    let defaultValue = "";
    if (xmlData.substring(i, i + 8).toUpperCase() === "#REQUIRED") {
      defaultValue = "#REQUIRED";
      i += 8;
    } else if (xmlData.substring(i, i + 7).toUpperCase() === "#IMPLIED") {
      defaultValue = "#IMPLIED";
      i += 7;
    } else {
      [i, defaultValue] = this.readIdentifierVal(xmlData, i, "ATTLIST");
    }
    return {
      elementName,
      attributeName,
      attributeType,
      defaultValue,
      index: i
    };
  }
};
var skipWhitespace = (data, index) => {
  while (index < data.length && /\s/.test(data[index])) {
    index++;
  }
  return index;
};
function hasSeq(data, seq, i) {
  for (let j = 0; j < seq.length; j++) {
    if (seq[j] !== data[i + j + 1]) return false;
  }
  return true;
}
function validateEntityName(name) {
  if (isName(name))
    return name;
  else
    throw new Error(`Invalid entity name ${name}`);
}

// node_modules/strnum/strnum.js
var hexRegex = /^[-+]?0x[a-fA-F0-9]+$/;
var numRegex = /^([\-\+])?(0*)([0-9]*(\.[0-9]*)?)$/;
var consider = {
  hex: true,
  // oct: false,
  leadingZeros: true,
  decimalPoint: ".",
  eNotation: true
  //skipLike: /regex/
};
function toNumber(str, options = {}) {
  options = Object.assign({}, consider, options);
  if (!str || typeof str !== "string") return str;
  let trimmedStr = str.trim();
  if (options.skipLike !== void 0 && options.skipLike.test(trimmedStr)) return str;
  else if (str === "0") return 0;
  else if (options.hex && hexRegex.test(trimmedStr)) {
    return parse_int(trimmedStr, 16);
  } else if (trimmedStr.includes("e") || trimmedStr.includes("E")) {
    return resolveEnotation(str, trimmedStr, options);
  } else {
    const match = numRegex.exec(trimmedStr);
    if (match) {
      const sign = match[1] || "";
      const leadingZeros = match[2];
      let numTrimmedByZeros = trimZeros(match[3]);
      const decimalAdjacentToLeadingZeros = sign ? (
        // 0., -00., 000.
        str[leadingZeros.length + 1] === "."
      ) : str[leadingZeros.length] === ".";
      if (!options.leadingZeros && (leadingZeros.length > 1 || leadingZeros.length === 1 && !decimalAdjacentToLeadingZeros)) {
        return str;
      } else {
        const num = Number(trimmedStr);
        const parsedStr = String(num);
        if (num === 0) return num;
        if (parsedStr.search(/[eE]/) !== -1) {
          if (options.eNotation) return num;
          else return str;
        } else if (trimmedStr.indexOf(".") !== -1) {
          if (parsedStr === "0") return num;
          else if (parsedStr === numTrimmedByZeros) return num;
          else if (parsedStr === `${sign}${numTrimmedByZeros}`) return num;
          else return str;
        }
        let n = leadingZeros ? numTrimmedByZeros : trimmedStr;
        if (leadingZeros) {
          return n === parsedStr || sign + n === parsedStr ? num : str;
        } else {
          return n === parsedStr || n === sign + parsedStr ? num : str;
        }
      }
    } else {
      return str;
    }
  }
}
var eNotationRegx = /^([-+])?(0*)(\d*(\.\d*)?[eE][-\+]?\d+)$/;
function resolveEnotation(str, trimmedStr, options) {
  if (!options.eNotation) return str;
  const notation = trimmedStr.match(eNotationRegx);
  if (notation) {
    let sign = notation[1] || "";
    const eChar = notation[3].indexOf("e") === -1 ? "E" : "e";
    const leadingZeros = notation[2];
    const eAdjacentToLeadingZeros = sign ? (
      // 0E.
      str[leadingZeros.length + 1] === eChar
    ) : str[leadingZeros.length] === eChar;
    if (leadingZeros.length > 1 && eAdjacentToLeadingZeros) return str;
    else if (leadingZeros.length === 1 && (notation[3].startsWith(`.${eChar}`) || notation[3][0] === eChar)) {
      return Number(trimmedStr);
    } else if (options.leadingZeros && !eAdjacentToLeadingZeros) {
      trimmedStr = (notation[1] || "") + notation[3];
      return Number(trimmedStr);
    } else return str;
  } else {
    return str;
  }
}
function trimZeros(numStr) {
  if (numStr && numStr.indexOf(".") !== -1) {
    numStr = numStr.replace(/0+$/, "");
    if (numStr === ".") numStr = "0";
    else if (numStr[0] === ".") numStr = "0" + numStr;
    else if (numStr[numStr.length - 1] === ".") numStr = numStr.substring(0, numStr.length - 1);
    return numStr;
  }
  return numStr;
}
function parse_int(numStr, base) {
  if (parseInt) return parseInt(numStr, base);
  else if (Number.parseInt) return Number.parseInt(numStr, base);
  else if (window && window.parseInt) return window.parseInt(numStr, base);
  else throw new Error("parseInt, Number.parseInt, window.parseInt are not supported");
}

// node_modules/fast-xml-parser/src/ignoreAttributes.js
function getIgnoreAttributesFn(ignoreAttributes) {
  if (typeof ignoreAttributes === "function") {
    return ignoreAttributes;
  }
  if (Array.isArray(ignoreAttributes)) {
    return (attrName) => {
      for (const pattern of ignoreAttributes) {
        if (typeof pattern === "string" && attrName === pattern) {
          return true;
        }
        if (pattern instanceof RegExp && pattern.test(attrName)) {
          return true;
        }
      }
    };
  }
  return () => false;
}

// node_modules/fast-xml-parser/src/xmlparser/OrderedObjParser.js
var OrderedObjParser = class {
  constructor(options) {
    this.options = options;
    this.currentNode = null;
    this.tagsNodeStack = [];
    this.docTypeEntities = {};
    this.lastEntities = {
      "apos": { regex: /&(apos|#39|#x27);/g, val: "'" },
      "gt": { regex: /&(gt|#62|#x3E);/g, val: ">" },
      "lt": { regex: /&(lt|#60|#x3C);/g, val: "<" },
      "quot": { regex: /&(quot|#34|#x22);/g, val: '"' }
    };
    this.ampEntity = { regex: /&(amp|#38|#x26);/g, val: "&" };
    this.htmlEntities = {
      "space": { regex: /&(nbsp|#160);/g, val: " " },
      // "lt" : { regex: /&(lt|#60);/g, val: "<" },
      // "gt" : { regex: /&(gt|#62);/g, val: ">" },
      // "amp" : { regex: /&(amp|#38);/g, val: "&" },
      // "quot" : { regex: /&(quot|#34);/g, val: "\"" },
      // "apos" : { regex: /&(apos|#39);/g, val: "'" },
      "cent": { regex: /&(cent|#162);/g, val: "\xA2" },
      "pound": { regex: /&(pound|#163);/g, val: "\xA3" },
      "yen": { regex: /&(yen|#165);/g, val: "\xA5" },
      "euro": { regex: /&(euro|#8364);/g, val: "\u20AC" },
      "copyright": { regex: /&(copy|#169);/g, val: "\xA9" },
      "reg": { regex: /&(reg|#174);/g, val: "\xAE" },
      "inr": { regex: /&(inr|#8377);/g, val: "\u20B9" },
      "num_dec": { regex: /&#([0-9]{1,7});/g, val: (_, str) => String.fromCodePoint(Number.parseInt(str, 10)) },
      "num_hex": { regex: /&#x([0-9a-fA-F]{1,6});/g, val: (_, str) => String.fromCodePoint(Number.parseInt(str, 16)) }
    };
    this.addExternalEntities = addExternalEntities;
    this.parseXml = parseXml;
    this.parseTextData = parseTextData;
    this.resolveNameSpace = resolveNameSpace;
    this.buildAttributesMap = buildAttributesMap;
    this.isItStopNode = isItStopNode;
    this.replaceEntitiesValue = replaceEntitiesValue;
    this.readStopNodeData = readStopNodeData;
    this.saveTextToParentTag = saveTextToParentTag;
    this.addChild = addChild;
    this.ignoreAttributesFn = getIgnoreAttributesFn(this.options.ignoreAttributes);
    if (this.options.stopNodes && this.options.stopNodes.length > 0) {
      this.stopNodesExact = /* @__PURE__ */ new Set();
      this.stopNodesWildcard = /* @__PURE__ */ new Set();
      for (let i = 0; i < this.options.stopNodes.length; i++) {
        const stopNodeExp = this.options.stopNodes[i];
        if (typeof stopNodeExp !== "string") continue;
        if (stopNodeExp.startsWith("*.")) {
          this.stopNodesWildcard.add(stopNodeExp.substring(2));
        } else {
          this.stopNodesExact.add(stopNodeExp);
        }
      }
    }
  }
};
function addExternalEntities(externalEntities) {
  const entKeys = Object.keys(externalEntities);
  for (let i = 0; i < entKeys.length; i++) {
    const ent = entKeys[i];
    this.lastEntities[ent] = {
      regex: new RegExp("&" + ent + ";", "g"),
      val: externalEntities[ent]
    };
  }
}
function parseTextData(val, tagName, jPath, dontTrim, hasAttributes, isLeafNode, escapeEntities) {
  if (val !== void 0) {
    if (this.options.trimValues && !dontTrim) {
      val = val.trim();
    }
    if (val.length > 0) {
      if (!escapeEntities) val = this.replaceEntitiesValue(val);
      const newval = this.options.tagValueProcessor(tagName, val, jPath, hasAttributes, isLeafNode);
      if (newval === null || newval === void 0) {
        return val;
      } else if (typeof newval !== typeof val || newval !== val) {
        return newval;
      } else if (this.options.trimValues) {
        return parseValue(val, this.options.parseTagValue, this.options.numberParseOptions);
      } else {
        const trimmedVal = val.trim();
        if (trimmedVal === val) {
          return parseValue(val, this.options.parseTagValue, this.options.numberParseOptions);
        } else {
          return val;
        }
      }
    }
  }
}
function resolveNameSpace(tagname) {
  if (this.options.removeNSPrefix) {
    const tags = tagname.split(":");
    const prefix = tagname.charAt(0) === "/" ? "/" : "";
    if (tags[0] === "xmlns") {
      return "";
    }
    if (tags.length === 2) {
      tagname = prefix + tags[1];
    }
  }
  return tagname;
}
var attrsRegx = new RegExp(`([^\\s=]+)\\s*(=\\s*(['"])([\\s\\S]*?)\\3)?`, "gm");
function buildAttributesMap(attrStr, jPath) {
  if (this.options.ignoreAttributes !== true && typeof attrStr === "string") {
    const matches = getAllMatches(attrStr, attrsRegx);
    const len = matches.length;
    const attrs = {};
    for (let i = 0; i < len; i++) {
      const attrName = this.resolveNameSpace(matches[i][1]);
      if (this.ignoreAttributesFn(attrName, jPath)) {
        continue;
      }
      let oldVal = matches[i][4];
      let aName = this.options.attributeNamePrefix + attrName;
      if (attrName.length) {
        if (this.options.transformAttributeName) {
          aName = this.options.transformAttributeName(aName);
        }
        if (aName === "__proto__") aName = "#__proto__";
        if (oldVal !== void 0) {
          if (this.options.trimValues) {
            oldVal = oldVal.trim();
          }
          oldVal = this.replaceEntitiesValue(oldVal);
          const newVal = this.options.attributeValueProcessor(attrName, oldVal, jPath);
          if (newVal === null || newVal === void 0) {
            attrs[aName] = oldVal;
          } else if (typeof newVal !== typeof oldVal || newVal !== oldVal) {
            attrs[aName] = newVal;
          } else {
            attrs[aName] = parseValue(
              oldVal,
              this.options.parseAttributeValue,
              this.options.numberParseOptions
            );
          }
        } else if (this.options.allowBooleanAttributes) {
          attrs[aName] = true;
        }
      }
    }
    if (!Object.keys(attrs).length) {
      return;
    }
    if (this.options.attributesGroupName) {
      const attrCollection = {};
      attrCollection[this.options.attributesGroupName] = attrs;
      return attrCollection;
    }
    return attrs;
  }
}
var parseXml = function(xmlData) {
  xmlData = xmlData.replace(/\r\n?/g, "\n");
  const xmlObj = new XmlNode("!xml");
  let currentNode = xmlObj;
  let textData = "";
  let jPath = "";
  const docTypeReader = new DocTypeReader(this.options.processEntities);
  for (let i = 0; i < xmlData.length; i++) {
    const ch = xmlData[i];
    if (ch === "<") {
      if (xmlData[i + 1] === "/") {
        const closeIndex = findClosingIndex(xmlData, ">", i, "Closing Tag is not closed.");
        let tagName = xmlData.substring(i + 2, closeIndex).trim();
        if (this.options.removeNSPrefix) {
          const colonIndex = tagName.indexOf(":");
          if (colonIndex !== -1) {
            tagName = tagName.substr(colonIndex + 1);
          }
        }
        if (this.options.transformTagName) {
          tagName = this.options.transformTagName(tagName);
        }
        if (currentNode) {
          textData = this.saveTextToParentTag(textData, currentNode, jPath);
        }
        const lastTagName = jPath.substring(jPath.lastIndexOf(".") + 1);
        if (tagName && this.options.unpairedTags.indexOf(tagName) !== -1) {
          throw new Error(`Unpaired tag can not be used as closing tag: </${tagName}>`);
        }
        let propIndex = 0;
        if (lastTagName && this.options.unpairedTags.indexOf(lastTagName) !== -1) {
          propIndex = jPath.lastIndexOf(".", jPath.lastIndexOf(".") - 1);
          this.tagsNodeStack.pop();
        } else {
          propIndex = jPath.lastIndexOf(".");
        }
        jPath = jPath.substring(0, propIndex);
        currentNode = this.tagsNodeStack.pop();
        textData = "";
        i = closeIndex;
      } else if (xmlData[i + 1] === "?") {
        let tagData = readTagExp(xmlData, i, false, "?>");
        if (!tagData) throw new Error("Pi Tag is not closed.");
        textData = this.saveTextToParentTag(textData, currentNode, jPath);
        if (this.options.ignoreDeclaration && tagData.tagName === "?xml" || this.options.ignorePiTags) {
        } else {
          const childNode = new XmlNode(tagData.tagName);
          childNode.add(this.options.textNodeName, "");
          if (tagData.tagName !== tagData.tagExp && tagData.attrExpPresent) {
            childNode[":@"] = this.buildAttributesMap(tagData.tagExp, jPath);
          }
          this.addChild(currentNode, childNode, jPath, i);
        }
        i = tagData.closeIndex + 1;
      } else if (xmlData.substr(i + 1, 3) === "!--") {
        const endIndex = findClosingIndex(xmlData, "-->", i + 4, "Comment is not closed.");
        if (this.options.commentPropName) {
          const comment = xmlData.substring(i + 4, endIndex - 2);
          textData = this.saveTextToParentTag(textData, currentNode, jPath);
          currentNode.add(this.options.commentPropName, [{ [this.options.textNodeName]: comment }]);
        }
        i = endIndex;
      } else if (xmlData.substr(i + 1, 2) === "!D") {
        const result = docTypeReader.readDocType(xmlData, i);
        this.docTypeEntities = result.entities;
        i = result.i;
      } else if (xmlData.substr(i + 1, 2) === "![") {
        const closeIndex = findClosingIndex(xmlData, "]]>", i, "CDATA is not closed.") - 2;
        const tagExp = xmlData.substring(i + 9, closeIndex);
        textData = this.saveTextToParentTag(textData, currentNode, jPath);
        let val = this.parseTextData(tagExp, currentNode.tagname, jPath, true, false, true, true);
        if (val == void 0) val = "";
        if (this.options.cdataPropName) {
          currentNode.add(this.options.cdataPropName, [{ [this.options.textNodeName]: tagExp }]);
        } else {
          currentNode.add(this.options.textNodeName, val);
        }
        i = closeIndex + 2;
      } else {
        let result = readTagExp(xmlData, i, this.options.removeNSPrefix);
        let tagName = result.tagName;
        const rawTagName = result.rawTagName;
        let tagExp = result.tagExp;
        let attrExpPresent = result.attrExpPresent;
        let closeIndex = result.closeIndex;
        if (this.options.transformTagName) {
          const newTagName = this.options.transformTagName(tagName);
          if (tagExp === tagName) {
            tagExp = newTagName;
          }
          tagName = newTagName;
        }
        if (currentNode && textData) {
          if (currentNode.tagname !== "!xml") {
            textData = this.saveTextToParentTag(textData, currentNode, jPath, false);
          }
        }
        const lastTag = currentNode;
        if (lastTag && this.options.unpairedTags.indexOf(lastTag.tagname) !== -1) {
          currentNode = this.tagsNodeStack.pop();
          jPath = jPath.substring(0, jPath.lastIndexOf("."));
        }
        if (tagName !== xmlObj.tagname) {
          jPath += jPath ? "." + tagName : tagName;
        }
        const startIndex = i;
        if (this.isItStopNode(this.stopNodesExact, this.stopNodesWildcard, jPath, tagName)) {
          let tagContent = "";
          if (tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
            if (tagName[tagName.length - 1] === "/") {
              tagName = tagName.substr(0, tagName.length - 1);
              jPath = jPath.substr(0, jPath.length - 1);
              tagExp = tagName;
            } else {
              tagExp = tagExp.substr(0, tagExp.length - 1);
            }
            i = result.closeIndex;
          } else if (this.options.unpairedTags.indexOf(tagName) !== -1) {
            i = result.closeIndex;
          } else {
            const result2 = this.readStopNodeData(xmlData, rawTagName, closeIndex + 1);
            if (!result2) throw new Error(`Unexpected end of ${rawTagName}`);
            i = result2.i;
            tagContent = result2.tagContent;
          }
          const childNode = new XmlNode(tagName);
          if (tagName !== tagExp && attrExpPresent) {
            childNode[":@"] = this.buildAttributesMap(
              tagExp,
              jPath
            );
          }
          if (tagContent) {
            tagContent = this.parseTextData(tagContent, tagName, jPath, true, attrExpPresent, true, true);
          }
          jPath = jPath.substr(0, jPath.lastIndexOf("."));
          childNode.add(this.options.textNodeName, tagContent);
          this.addChild(currentNode, childNode, jPath, startIndex);
        } else {
          if (tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
            if (tagName[tagName.length - 1] === "/") {
              tagName = tagName.substr(0, tagName.length - 1);
              jPath = jPath.substr(0, jPath.length - 1);
              tagExp = tagName;
            } else {
              tagExp = tagExp.substr(0, tagExp.length - 1);
            }
            if (this.options.transformTagName) {
              const newTagName = this.options.transformTagName(tagName);
              if (tagExp === tagName) {
                tagExp = newTagName;
              }
              tagName = newTagName;
            }
            const childNode = new XmlNode(tagName);
            if (tagName !== tagExp && attrExpPresent) {
              childNode[":@"] = this.buildAttributesMap(tagExp, jPath);
            }
            this.addChild(currentNode, childNode, jPath, startIndex);
            jPath = jPath.substr(0, jPath.lastIndexOf("."));
          } else {
            const childNode = new XmlNode(tagName);
            this.tagsNodeStack.push(currentNode);
            if (tagName !== tagExp && attrExpPresent) {
              childNode[":@"] = this.buildAttributesMap(tagExp, jPath);
            }
            this.addChild(currentNode, childNode, jPath, startIndex);
            currentNode = childNode;
          }
          textData = "";
          i = closeIndex;
        }
      }
    } else {
      textData += xmlData[i];
    }
  }
  return xmlObj.child;
};
function addChild(currentNode, childNode, jPath, startIndex) {
  if (!this.options.captureMetaData) startIndex = void 0;
  const result = this.options.updateTag(childNode.tagname, jPath, childNode[":@"]);
  if (result === false) {
  } else if (typeof result === "string") {
    childNode.tagname = result;
    currentNode.addChild(childNode, startIndex);
  } else {
    currentNode.addChild(childNode, startIndex);
  }
}
var replaceEntitiesValue = function(val) {
  if (this.options.processEntities) {
    for (let entityName in this.docTypeEntities) {
      const entity = this.docTypeEntities[entityName];
      val = val.replace(entity.regx, entity.val);
    }
    for (let entityName in this.lastEntities) {
      const entity = this.lastEntities[entityName];
      val = val.replace(entity.regex, entity.val);
    }
    if (this.options.htmlEntities) {
      for (let entityName in this.htmlEntities) {
        const entity = this.htmlEntities[entityName];
        val = val.replace(entity.regex, entity.val);
      }
    }
    val = val.replace(this.ampEntity.regex, this.ampEntity.val);
  }
  return val;
};
function saveTextToParentTag(textData, currentNode, jPath, isLeafNode) {
  if (textData) {
    if (isLeafNode === void 0) isLeafNode = currentNode.child.length === 0;
    textData = this.parseTextData(
      textData,
      currentNode.tagname,
      jPath,
      false,
      currentNode[":@"] ? Object.keys(currentNode[":@"]).length !== 0 : false,
      isLeafNode
    );
    if (textData !== void 0 && textData !== "")
      currentNode.add(this.options.textNodeName, textData);
    textData = "";
  }
  return textData;
}
function isItStopNode(stopNodesExact, stopNodesWildcard, jPath, currentTagName) {
  if (stopNodesWildcard && stopNodesWildcard.has(currentTagName)) return true;
  if (stopNodesExact && stopNodesExact.has(jPath)) return true;
  return false;
}
function tagExpWithClosingIndex(xmlData, i, closingChar = ">") {
  let attrBoundary;
  let tagExp = "";
  for (let index = i; index < xmlData.length; index++) {
    let ch = xmlData[index];
    if (attrBoundary) {
      if (ch === attrBoundary) attrBoundary = "";
    } else if (ch === '"' || ch === "'") {
      attrBoundary = ch;
    } else if (ch === closingChar[0]) {
      if (closingChar[1]) {
        if (xmlData[index + 1] === closingChar[1]) {
          return {
            data: tagExp,
            index
          };
        }
      } else {
        return {
          data: tagExp,
          index
        };
      }
    } else if (ch === "	") {
      ch = " ";
    }
    tagExp += ch;
  }
}
function findClosingIndex(xmlData, str, i, errMsg) {
  const closingIndex = xmlData.indexOf(str, i);
  if (closingIndex === -1) {
    throw new Error(errMsg);
  } else {
    return closingIndex + str.length - 1;
  }
}
function readTagExp(xmlData, i, removeNSPrefix, closingChar = ">") {
  const result = tagExpWithClosingIndex(xmlData, i + 1, closingChar);
  if (!result) return;
  let tagExp = result.data;
  const closeIndex = result.index;
  const separatorIndex = tagExp.search(/\s/);
  let tagName = tagExp;
  let attrExpPresent = true;
  if (separatorIndex !== -1) {
    tagName = tagExp.substring(0, separatorIndex);
    tagExp = tagExp.substring(separatorIndex + 1).trimStart();
  }
  const rawTagName = tagName;
  if (removeNSPrefix) {
    const colonIndex = tagName.indexOf(":");
    if (colonIndex !== -1) {
      tagName = tagName.substr(colonIndex + 1);
      attrExpPresent = tagName !== result.data.substr(colonIndex + 1);
    }
  }
  return {
    tagName,
    tagExp,
    closeIndex,
    attrExpPresent,
    rawTagName
  };
}
function readStopNodeData(xmlData, tagName, i) {
  const startIndex = i;
  let openTagCount = 1;
  for (; i < xmlData.length; i++) {
    if (xmlData[i] === "<") {
      if (xmlData[i + 1] === "/") {
        const closeIndex = findClosingIndex(xmlData, ">", i, `${tagName} is not closed`);
        let closeTagName = xmlData.substring(i + 2, closeIndex).trim();
        if (closeTagName === tagName) {
          openTagCount--;
          if (openTagCount === 0) {
            return {
              tagContent: xmlData.substring(startIndex, i),
              i: closeIndex
            };
          }
        }
        i = closeIndex;
      } else if (xmlData[i + 1] === "?") {
        const closeIndex = findClosingIndex(xmlData, "?>", i + 1, "StopNode is not closed.");
        i = closeIndex;
      } else if (xmlData.substr(i + 1, 3) === "!--") {
        const closeIndex = findClosingIndex(xmlData, "-->", i + 3, "StopNode is not closed.");
        i = closeIndex;
      } else if (xmlData.substr(i + 1, 2) === "![") {
        const closeIndex = findClosingIndex(xmlData, "]]>", i, "StopNode is not closed.") - 2;
        i = closeIndex;
      } else {
        const tagData = readTagExp(xmlData, i, ">");
        if (tagData) {
          const openTagName = tagData && tagData.tagName;
          if (openTagName === tagName && tagData.tagExp[tagData.tagExp.length - 1] !== "/") {
            openTagCount++;
          }
          i = tagData.closeIndex;
        }
      }
    }
  }
}
function parseValue(val, shouldParse, options) {
  if (shouldParse && typeof val === "string") {
    const newval = val.trim();
    if (newval === "true") return true;
    else if (newval === "false") return false;
    else return toNumber(val, options);
  } else {
    if (isExist(val)) {
      return val;
    } else {
      return "";
    }
  }
}

// node_modules/fast-xml-parser/src/xmlparser/node2json.js
var METADATA_SYMBOL2 = XmlNode.getMetaDataSymbol();
function prettify(node, options) {
  return compress(node, options);
}
function compress(arr, options, jPath) {
  let text;
  const compressedObj = {};
  for (let i = 0; i < arr.length; i++) {
    const tagObj = arr[i];
    const property = propName(tagObj);
    let newJpath = "";
    if (jPath === void 0) newJpath = property;
    else newJpath = jPath + "." + property;
    if (property === options.textNodeName) {
      if (text === void 0) text = tagObj[property];
      else text += "" + tagObj[property];
    } else if (property === void 0) {
      continue;
    } else if (tagObj[property]) {
      let val = compress(tagObj[property], options, newJpath);
      const isLeaf = isLeafTag(val, options);
      if (tagObj[METADATA_SYMBOL2] !== void 0) {
        val[METADATA_SYMBOL2] = tagObj[METADATA_SYMBOL2];
      }
      if (tagObj[":@"]) {
        assignAttributes(val, tagObj[":@"], newJpath, options);
      } else if (Object.keys(val).length === 1 && val[options.textNodeName] !== void 0 && !options.alwaysCreateTextNode) {
        val = val[options.textNodeName];
      } else if (Object.keys(val).length === 0) {
        if (options.alwaysCreateTextNode) val[options.textNodeName] = "";
        else val = "";
      }
      if (compressedObj[property] !== void 0 && compressedObj.hasOwnProperty(property)) {
        if (!Array.isArray(compressedObj[property])) {
          compressedObj[property] = [compressedObj[property]];
        }
        compressedObj[property].push(val);
      } else {
        if (options.isArray(property, newJpath, isLeaf)) {
          compressedObj[property] = [val];
        } else {
          compressedObj[property] = val;
        }
      }
    }
  }
  if (typeof text === "string") {
    if (text.length > 0) compressedObj[options.textNodeName] = text;
  } else if (text !== void 0) compressedObj[options.textNodeName] = text;
  return compressedObj;
}
function propName(obj) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key !== ":@") return key;
  }
}
function assignAttributes(obj, attrMap, jpath, options) {
  if (attrMap) {
    const keys = Object.keys(attrMap);
    const len = keys.length;
    for (let i = 0; i < len; i++) {
      const atrrName = keys[i];
      if (options.isArray(atrrName, jpath + "." + atrrName, true, true)) {
        obj[atrrName] = [attrMap[atrrName]];
      } else {
        obj[atrrName] = attrMap[atrrName];
      }
    }
  }
}
function isLeafTag(obj, options) {
  const { textNodeName } = options;
  const propCount = Object.keys(obj).length;
  if (propCount === 0) {
    return true;
  }
  if (propCount === 1 && (obj[textNodeName] || typeof obj[textNodeName] === "boolean" || obj[textNodeName] === 0)) {
    return true;
  }
  return false;
}

// node_modules/fast-xml-parser/src/xmlparser/XMLParser.js
var XMLParser = class {
  constructor(options) {
    this.externalEntities = {};
    this.options = buildOptions(options);
  }
  /**
   * Parse XML dats to JS object 
   * @param {string|Uint8Array} xmlData 
   * @param {boolean|Object} validationOption 
   */
  parse(xmlData, validationOption) {
    if (typeof xmlData !== "string" && xmlData.toString) {
      xmlData = xmlData.toString();
    } else if (typeof xmlData !== "string") {
      throw new Error("XML data is accepted in String or Bytes[] form.");
    }
    if (validationOption) {
      if (validationOption === true) validationOption = {};
      const result = validate2(xmlData, validationOption);
      if (result !== true) {
        throw Error(`${result.err.msg}:${result.err.line}:${result.err.col}`);
      }
    }
    const orderedObjParser = new OrderedObjParser(this.options);
    orderedObjParser.addExternalEntities(this.externalEntities);
    const orderedResult = orderedObjParser.parseXml(xmlData);
    if (this.options.preserveOrder || orderedResult === void 0) return orderedResult;
    else return prettify(orderedResult, this.options);
  }
  /**
   * Add Entity which is not by default supported by this library
   * @param {string} key 
   * @param {string} value 
   */
  addEntity(key, value) {
    if (value.indexOf("&") !== -1) {
      throw new Error("Entity value can't have '&'");
    } else if (key.indexOf("&") !== -1 || key.indexOf(";") !== -1) {
      throw new Error("An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'");
    } else if (value === "&") {
      throw new Error("An entity with value '&' is not permitted");
    } else {
      this.externalEntities[key] = value;
    }
  }
  /**
   * Returns a Symbol that can be used to access the metadata
   * property on a node.
   * 
   * If Symbol is not available in the environment, an ordinary property is used
   * and the name of the property is here returned.
   * 
   * The XMLMetaData property is only present when `captureMetaData`
   * is true in the options.
   */
  static getMetaDataSymbol() {
    return XmlNode.getMetaDataSymbol();
  }
};

// sparti-cms/services/wordpressImport.js
function parseWordPressXML(xmlContent) {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      parseAttributeValue: true,
      trimValues: true,
      parseTrueNumberOnly: false,
      arrayMode: false
    });
    const result = parser.parse(xmlContent);
    const channel = result.rss?.channel || result.rss?.["wp:channel"] || {};
    const items = Array.isArray(channel.item) ? channel.item : channel.item ? [channel.item] : [];
    return {
      title: channel.title || "",
      description: channel.description || "",
      link: channel.link || "",
      items
    };
  } catch (error) {
    console.error("[testing] Error parsing WordPress XML:", error);
    throw new Error(`Failed to parse WordPress XML: ${error.message}`);
  }
}
function parseWordPressJSON(jsonContent) {
  try {
    const data = JSON.parse(jsonContent);
    if (data.posts && Array.isArray(data.posts)) {
      return {
        title: data.title || "",
        description: data.description || "",
        link: data.link || "",
        items: data.posts
      };
    } else if (Array.isArray(data)) {
      return {
        title: "",
        description: "",
        link: "",
        items: data
      };
    } else {
      throw new Error("Invalid WordPress JSON format");
    }
  } catch (error) {
    console.error("[testing] Error parsing WordPress JSON:", error);
    throw new Error(`Failed to parse WordPress JSON: ${error.message}`);
  }
}
function extractPosts(data) {
  const items = data.items || [];
  return items.map((item, index) => {
    if (item["content:encoded"] || item["wp:post_content"]) {
      return {
        title: item.title?.["#text"] || item.title || `Post ${index + 1}`,
        content: item["content:encoded"]?.["#text"] || item["content:encoded"] || item["wp:post_content"]?.["#text"] || item["wp:post_content"] || "",
        excerpt: item["excerpt:encoded"]?.["#text"] || item["excerpt:encoded"] || item["wp:post_excerpt"]?.["#text"] || item["wp:post_excerpt"] || "",
        slug: extractSlug(item),
        status: item["wp:status"]?.["#text"] || item["wp:status"] || item.status || "draft",
        postType: item["wp:post_type"]?.["#text"] || item["wp:post_type"] || item.post_type || "post",
        publishedAt: extractDate(item),
        categories: extractItemCategories(item),
        tags: extractItemTags(item),
        featuredImage: extractFeaturedImage(item),
        meta: extractMeta(item)
      };
    }
    return {
      title: item.title || item.post_title || `Post ${index + 1}`,
      content: item.content || item.post_content || "",
      excerpt: item.excerpt || item.post_excerpt || "",
      slug: item.slug || item.post_name || generateSlug(item.title || item.post_title || `Post ${index + 1}`),
      status: item.status || item.post_status || "draft",
      postType: item.post_type || "post",
      publishedAt: item.date || item.post_date || item.published_at || null,
      categories: item.categories || [],
      tags: item.tags || [],
      featuredImage: item.featured_image || item.thumbnail || null,
      meta: item.meta || {}
    };
  }).filter((post) => post.postType === "post");
}
function extractCategories(data) {
  const categories = /* @__PURE__ */ new Map();
  const items = data.items || [];
  items.forEach((item) => {
    if (item.category) {
      const cats = Array.isArray(item.category) ? item.category : [item.category];
      cats.forEach((cat) => {
        if (cat["@_domain"] === "category" || cat["@_domain"] === "post_category") {
          const name = cat["#text"] || cat;
          const slug = cat["@_nicename"] || generateSlug(name);
          if (name && !categories.has(slug)) {
            categories.set(slug, {
              name,
              slug,
              description: cat["@_description"] || ""
            });
          }
        }
      });
    }
  });
  return Array.from(categories.values());
}
function extractTags(data) {
  const tags = /* @__PURE__ */ new Map();
  const items = data.items || [];
  items.forEach((item) => {
    if (item.category) {
      const cats = Array.isArray(item.category) ? item.category : [item.category];
      cats.forEach((cat) => {
        if (cat["@_domain"] === "post_tag" || cat["@_domain"] === "tag") {
          const name = cat["#text"] || cat;
          const slug = cat["@_nicename"] || generateSlug(name);
          if (name && !tags.has(slug)) {
            tags.set(slug, {
              name,
              slug,
              description: ""
            });
          }
        }
      });
    }
  });
  return Array.from(tags.values());
}
function extractItemCategories(item) {
  const categories = [];
  if (item.category) {
    const cats = Array.isArray(item.category) ? item.category : [item.category];
    cats.forEach((cat) => {
      if (cat["@_domain"] === "category" || cat["@_domain"] === "post_category") {
        categories.push(cat["#text"] || cat);
      }
    });
  }
  return categories;
}
function extractItemTags(item) {
  const tags = [];
  if (item.category) {
    const cats = Array.isArray(item.category) ? item.category : [item.category];
    cats.forEach((cat) => {
      if (cat["@_domain"] === "post_tag" || cat["@_domain"] === "tag") {
        tags.push(cat["#text"] || cat);
      }
    });
  }
  return tags;
}
function extractSlug(item) {
  if (item["wp:post_name"]?.["#text"]) return item["wp:post_name"]["#text"];
  if (item["wp:post_name"]) return item["wp:post_name"];
  if (item.link) {
    const url = new URL(item.link);
    const pathParts = url.pathname.split("/").filter((p) => p);
    return pathParts[pathParts.length - 1] || generateSlug(item.title?.["#text"] || item.title || "");
  }
  return generateSlug(item.title?.["#text"] || item.title || "");
}
function extractDate(item) {
  const dateStr = item["wp:post_date"]?.["#text"] || item["wp:post_date"] || item.pubDate?.["#text"] || item.pubDate || item.date || item.post_date;
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date.toISOString();
  } catch {
    return null;
  }
}
function extractFeaturedImage(item) {
  return item["wp:attachment_url"]?.["#text"] || item["wp:attachment_url"] || item.featured_image || item.thumbnail || null;
}
function extractMeta(item) {
  const meta = {};
  if (item["wp:postmeta"]) {
    const metas = Array.isArray(item["wp:postmeta"]) ? item["wp:postmeta"] : [item["wp:postmeta"]];
    metas.forEach((m) => {
      const key = m["wp:meta_key"]?.["#text"] || m["wp:meta_key"];
      const value = m["wp:meta_value"]?.["#text"] || m["wp:meta_value"];
      if (key) {
        meta[key] = value;
      }
    });
  }
  return meta;
}
function extractImages(content) {
  if (!content) return [];
  const imageUrls = [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const urlRegex = /https?:\/\/[^\s<>"']+\.(jpg|jpeg|png|gif|webp|svg)/gi;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    if (match[1] && !imageUrls.includes(match[1])) {
      imageUrls.push(match[1]);
    }
  }
  while ((match = urlRegex.exec(content)) !== null) {
    if (match[0] && !imageUrls.includes(match[0])) {
      imageUrls.push(match[0]);
    }
  }
  return imageUrls;
}
function updateImageReferences(content, imageMap) {
  if (!content || !imageMap) return content;
  let updatedContent = content;
  imageMap.forEach((localUrl, originalUrl) => {
    updatedContent = updatedContent.replace(
      new RegExp(`src=["']${escapeRegex(originalUrl)}["']`, "gi"),
      `src="${localUrl}"`
    );
    updatedContent = updatedContent.replace(
      new RegExp(escapeRegex(originalUrl), "g"),
      localUrl
    );
  });
  return updatedContent;
}
function generateSlug(text) {
  if (!text) return "";
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// sparti-cms/services/imageDownloader.js
init_media();
init_media();
import https from "https";
import http from "http";
import { fileURLToPath as fileURLToPath7 } from "url";
import { dirname as dirname5, join as join4, extname } from "path";
import { createWriteStream, mkdirSync as mkdirSync3, existsSync as existsSync3 } from "fs";
var __filename7 = fileURLToPath7(import.meta.url);
var __dirname7 = dirname5(__filename7);
async function downloadImageFromUrl(imageUrl, tenantId) {
  try {
    if (!imageUrl || !tenantId) {
      throw new Error("Image URL and tenant ID are required");
    }
    if (imageUrl.startsWith("/uploads/") || imageUrl.startsWith("/api/")) {
      console.log("[testing] Image is already local:", imageUrl);
      return imageUrl;
    }
    const storageName = await getTenantStorageName(tenantId);
    const tenantUploadsDir = join4(__dirname7, "..", "..", "public", "uploads", storageName);
    if (!existsSync3(tenantUploadsDir)) {
      mkdirSync3(tenantUploadsDir, { recursive: true });
    }
    const urlObj = new URL(imageUrl);
    const urlPath = urlObj.pathname;
    const originalFilename = urlPath.split("/").pop() || "image";
    let fileExtension = extname(originalFilename).slice(1).toLowerCase();
    if (!fileExtension || !["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fileExtension)) {
      fileExtension = "jpg";
    }
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1e9);
    const filename = `wordpress-import-${timestamp}-${randomSuffix}.${fileExtension}`;
    const filePath = join4(tenantUploadsDir, filename);
    return new Promise((resolve, reject) => {
      const protocol = imageUrl.startsWith("https:") ? https : http;
      const request = protocol.get(imageUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode} ${response.statusMessage}`));
          return;
        }
        const contentType = response.headers["content-type"];
        if (contentType && !contentType.startsWith("image/")) {
          reject(new Error(`URL does not point to an image: ${contentType}`));
          return;
        }
        const fileStream = createWriteStream(filePath);
        let fileSize = 0;
        response.on("data", (chunk) => {
          fileSize += chunk.length;
        });
        fileStream.on("error", (err) => {
          reject(new Error(`Failed to save image: ${err.message}`));
        });
        fileStream.on("finish", async () => {
          try {
            const relativePath = `/uploads/${storageName}/${filename}`;
            await createMediaFile({
              filename,
              original_filename: originalFilename,
              slug: `wordpress-import-${timestamp}-${randomSuffix}`,
              alt_text: "",
              title: originalFilename,
              description: `Imported from WordPress: ${imageUrl}`,
              url: relativePath,
              relative_path: relativePath,
              mime_type: contentType || `image/${fileExtension}`,
              file_extension: fileExtension,
              file_size: fileSize,
              media_type: "image",
              metadata: { source_url: imageUrl, imported_from: "wordpress" }
            }, tenantId);
            console.log("[testing] Image downloaded and saved:", relativePath);
            resolve(relativePath);
          } catch (err) {
            console.error("[testing] Error creating media file record:", err);
            const relativePath = `/uploads/${storageName}/${filename}`;
            resolve(relativePath);
          }
        });
        response.pipe(fileStream);
      });
      request.on("error", (err) => {
        reject(new Error(`Failed to download image: ${err.message}`));
      });
      request.setTimeout(3e4, () => {
        request.destroy();
        reject(new Error("Image download timeout"));
      });
    });
  } catch (error) {
    console.error("[testing] Error downloading image:", imageUrl, error);
    throw error;
  }
}
async function downloadImages(imageUrls, tenantId) {
  const imageMap = /* @__PURE__ */ new Map();
  const errors = [];
  for (const imageUrl of imageUrls) {
    try {
      const localUrl = await downloadImageFromUrl(imageUrl, tenantId);
      imageMap.set(imageUrl, localUrl);
    } catch (error) {
      console.error("[testing] Failed to download image:", imageUrl, error.message);
      errors.push(`Failed to download ${imageUrl}: ${error.message}`);
      imageMap.set(imageUrl, imageUrl);
    }
  }
  return { imageMap, errors };
}

// server/routes/content.js
init_models();
import { Op as Op4 } from "sequelize";

// server/services/wordpressClient.js
var WordPressClient = class {
  constructor(config) {
    if (!config.wordpress_url || !config.username || !config.application_password) {
      throw new Error("WordPress configuration requires wordpress_url, username, and application_password");
    }
    this.wordpressUrl = config.wordpress_url.replace(/\/$/, "");
    this.username = config.username;
    this.applicationPassword = config.application_password;
    this.timeout = config.timeout || 3e4;
    this.baseUrl = `${this.wordpressUrl}/wp-json/wp/v2`;
  }
  /**
   * Create Basic Auth header for WordPress REST API
   * WordPress uses HTTP Basic Authentication with username and application password
   */
  getAuthHeader() {
    const credentials = `${this.username}:${this.applicationPassword}`;
    return `Basic ${Buffer.from(credentials).toString("base64")}`;
  }
  /**
   * Make HTTP request to WordPress API
   */
  async request(method, endpoint, params = {}, options = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (method === "GET" && Object.keys(params).length > 0) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== void 0 && value !== null) {
          if (Array.isArray(value)) {
            url.searchParams.append(key, value.join(","));
          } else {
            url.searchParams.append(key, value);
          }
        }
      });
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    const requestOptions = {
      method,
      headers: {
        "Authorization": this.getAuthHeader(),
        "Content-Type": "application/json",
        ...options.headers
      },
      signal: controller.signal
    };
    if (["POST", "PUT", "PATCH"].includes(method) && Object.keys(params).length > 0) {
      requestOptions.body = JSON.stringify(params);
    }
    try {
      const response = await fetch(url.toString(), requestOptions);
      clearTimeout(timeoutId);
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") || 60;
        console.warn(`[testing] WordPress rate limit hit. Retry after ${retryAfter} seconds`);
        throw new Error(`Rate limit exceeded. Please retry after ${retryAfter} seconds`);
      }
      if (response.status === 401) {
        throw new Error("Invalid WordPress credentials. Please check your username and application password.");
      }
      if (response.status === 403) {
        throw new Error("Access forbidden. Please check your API permissions.");
      }
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `WordPress API error: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
          if (errorData.code) {
            errorMessage = `${errorMessage} (code: ${errorData.code})`;
          }
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }
  /**
   * Test WordPress connection
   */
  async testConnection() {
    try {
      const response = await this.request("GET", "/users/me");
      return {
        success: true,
        user: response
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  /**
   * Get posts from WordPress
   */
  async getPosts(options = {}) {
    const {
      page = 1,
      per_page = 10,
      status = "publish",
      orderby = "date",
      order = "desc",
      search,
      categories,
      tags,
      _embed = true
    } = options;
    const params = {
      page,
      per_page,
      status,
      orderby,
      order,
      ...search && { search },
      ...categories && { categories },
      ...tags && { tags },
      ..._embed && { _embed: "1" }
    };
    return this.request("GET", "/posts", params);
  }
  /**
   * Get a single post by ID
   */
  async getPostById(id) {
    return this.request("GET", `/posts/${id}`, { _embed: "1" });
  }
  /**
   * Get a single post by slug
   */
  async getPostBySlug(slug) {
    const posts = await this.request("GET", "/posts", { slug, _embed: "1" });
    return posts && posts.length > 0 ? posts[0] : null;
  }
  /**
   * Create a new post in WordPress
   */
  async createPost(postData) {
    const {
      title,
      content,
      excerpt,
      slug,
      status = "publish",
      date,
      categories = [],
      tags = [],
      featured_media
    } = postData;
    const params = {
      title,
      content,
      excerpt,
      slug,
      status,
      ...date && { date },
      ...categories.length > 0 && { categories },
      ...tags.length > 0 && { tags },
      ...featured_media && { featured_media }
    };
    return this.request("POST", "/posts", params);
  }
  /**
   * Update an existing post in WordPress
   */
  async updatePost(id, postData) {
    const {
      title,
      content,
      excerpt,
      slug,
      status,
      date,
      categories,
      tags,
      featured_media
    } = postData;
    const params = {};
    if (title !== void 0) params.title = title;
    if (content !== void 0) params.content = content;
    if (excerpt !== void 0) params.excerpt = excerpt;
    if (slug !== void 0) params.slug = slug;
    if (status !== void 0) params.status = status;
    if (date !== void 0) params.date = date;
    if (categories !== void 0) params.categories = categories;
    if (tags !== void 0) params.tags = tags;
    if (featured_media !== void 0) params.featured_media = featured_media;
    return this.request("POST", `/posts/${id}`, params);
  }
  /**
   * Delete a post in WordPress
   */
  async deletePost(id, force = false) {
    const params = force ? { force: true } : {};
    return this.request("DELETE", `/posts/${id}`, params);
  }
  /**
   * Get categories
   */
  async getCategories(options = {}) {
    const { per_page = 100, search, hide_empty = false } = options;
    const params = {
      per_page,
      hide_empty,
      ...search && { search }
    };
    return this.request("GET", "/categories", params);
  }
  /**
   * Get tags
   */
  async getTags(options = {}) {
    const { per_page = 100, search, hide_empty = false } = options;
    const params = {
      per_page,
      hide_empty,
      ...search && { search }
    };
    return this.request("GET", "/tags", params);
  }
  /**
   * Get media by ID
   */
  async getMediaById(id) {
    return this.request("GET", `/media/${id}`);
  }
  /**
   * Upload media to WordPress
   */
  async uploadMedia(fileUrl, filename, title) {
    throw new Error("Media upload not yet implemented. Use featured_media ID instead.");
  }
};
function createWordPressClientFromConfig(config) {
  if (!config || !config.wordpress_url || !config.username || !config.application_password) {
    throw new Error("Invalid WordPress configuration. Missing required fields.");
  }
  return new WordPressClient({
    wordpress_url: config.wordpress_url,
    username: config.username,
    application_password: config.application_password,
    timeout: config.timeout || 3e4
  });
}

// server/routes/content.js
var { Post: Post5, Category: Category4, Tag: Tag4 } = models_default;
var router3 = express4.Router();
async function syncPostToWordPress(post, tenantId) {
  try {
    const integrationResult = await query(`
      SELECT config, is_active
      FROM tenant_integrations
      WHERE tenant_id = $1 AND integration_type = 'wordpress' AND is_active = true
      LIMIT 1
    `, [tenantId]);
    if (integrationResult.rows.length === 0) {
      return null;
    }
    const config = integrationResult.rows[0].config;
    if (!config || !config.auto_sync_enabled) {
      return null;
    }
    if (!post.wordpress_sync_enabled) {
      return null;
    }
    const client = createWordPressClientFromConfig(config);
    const statusMap = {
      "published": "publish",
      "draft": "draft",
      "private": "private",
      "trash": "trash"
    };
    const wpStatus = statusMap[post.status] || "draft";
    const postWithRelations = await Post5.findByPk(post.id, {
      include: [
        { model: Category4, as: "categories", through: { attributes: [] } },
        { model: Tag4, as: "tags", through: { attributes: [] } }
      ]
    });
    const categoryIds = postWithRelations?.categories?.map((c) => c.id) || [];
    const tagIds = postWithRelations?.tags?.map((t) => t.id) || [];
    const wpPostData = {
      title: post.title,
      content: post.content || "",
      excerpt: post.excerpt || "",
      slug: post.slug,
      status: wpStatus,
      date: post.published_at ? new Date(post.published_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      categories: categoryIds,
      tags: tagIds
    };
    let wpPost;
    if (post.wordpress_id) {
      wpPost = await client.updatePost(post.wordpress_id, wpPostData);
    } else {
      wpPost = await client.createPost(wpPostData);
      await post.update({
        wordpress_id: wpPost.id,
        wordpress_last_synced_at: /* @__PURE__ */ new Date()
      });
    }
    await post.update({
      wordpress_last_synced_at: /* @__PURE__ */ new Date()
    });
    return { success: true, wordpress_id: wpPost.id };
  } catch (error) {
    console.error("[testing] Error syncing post to WordPress:", error);
    return { success: false, error: error.message };
  }
}
router3.get("/pages/all", authenticateUser, async (req, res) => {
  try {
    const themeId = req.themeSlug || req.query.themeId || null;
    const tenantId = req.tenantId || req.query.tenantId || req.headers["x-tenant-id"] || req.user?.tenant_id;
    console.log(`[testing] API: ========== /pages/all Request ==========`);
    console.log(`[testing] API: req.tenantId: ${req.tenantId}`);
    console.log(`[testing] API: req.query.tenantId: ${req.query.tenantId}`);
    console.log(`[testing] API: req.headers['x-tenant-id']: ${req.headers["x-tenant-id"]}`);
    console.log(`[testing] API: req.user?.tenant_id: ${req.user?.tenant_id}`);
    console.log(`[testing] API: Final tenantId: ${tenantId}`);
    console.log(`[testing] API: themeId from query: ${themeId || "custom"}`);
    console.log(`[testing] API: User is_super_admin: ${req.user?.is_super_admin || false}`);
    let pages = [];
    let fromFilesystem = false;
    try {
      pages = await getAllPagesWithTypes(tenantId, themeId || null);
      console.log(`[testing] API: getAllPagesWithTypes returned ${pages.length} page(s)`);
      if (pages.length > 0 && pages[0].from_filesystem) {
        fromFilesystem = true;
        console.log(`[testing] API: Pages came from file system`);
      } else if (pages.length > 0) {
        console.log(`[testing] API: Pages came from database`);
      }
      if (pages.length > 0) {
        const pageTypes = pages.map((p) => p.page_type).filter((v, i, a) => a.indexOf(v) === i);
        console.log(`[testing] API: Page types found: ${pageTypes.join(", ")}`);
        console.log(`[testing] API: Sample page:`, {
          id: pages[0].id,
          page_name: pages[0].page_name,
          slug: pages[0].slug,
          page_type: pages[0].page_type,
          theme_id: pages[0].theme_id,
          tenant_id: pages[0].tenant_id,
          from_filesystem: pages[0].from_filesystem
        });
      }
    } catch (error) {
      console.error("[testing] API: Error fetching pages:", error);
      console.error("[testing] API: Error stack:", error.stack);
      throw error;
    }
    const validatedPages = (pages || []).map((page, index) => {
      if (!page.id) {
        console.warn(`[testing] API: Page at index ${index} missing id, generating one`);
        const slugId = (page.slug || "").replace(/^\/+|\/+$/g, "").replace(/\//g, "-") || "page";
        page.id = page.id || `page-${tenantId}-${slugId}-${index}`;
      }
      if (!page.page_name) {
        console.warn(`[testing] API: Page at index ${index} missing page_name`);
        page.page_name = page.page_name || "Untitled Page";
      }
      if (!page.slug) {
        console.warn(`[testing] API: Page at index ${index} missing slug`);
        page.slug = page.slug || "/";
      }
      if (!page.page_type) {
        console.warn(`[testing] API: Page at index ${index} missing page_type, defaulting to 'page'`);
        page.page_type = page.page_type || "page";
      }
      if (!page.tenant_id) {
        page.tenant_id = tenantId;
      }
      if (themeId && themeId !== "custom" && !page.theme_id) {
        page.theme_id = themeId;
      }
      return page;
    });
    const response = {
      success: true,
      pages: validatedPages,
      total: validatedPages.length,
      tenantId,
      themeId: themeId || "custom",
      from_filesystem: fromFilesystem
    };
    console.log(`[testing] API: Sending response with ${validatedPages.length} validated page(s)`);
    console.log(`[testing] API: ==========================================`);
    res.json(response);
  } catch (error) {
    console.error("[testing] API: Error fetching pages:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch pages",
      message: error.message
    });
  }
});
router3.get("/pages/theme/:themeId", async (req, res) => {
  try {
    const { themeId } = req.params;
    console.log(`[testing] API: Fetching pages for theme: ${themeId}`);
    let pages = [];
    let fromFilesystem = false;
    try {
      const result = await query(`
        SELECT 
          id,
          page_name,
          slug,
          meta_title,
          meta_description,
          seo_index,
          status,
          page_type,
          theme_id,
          created_at,
          updated_at
        FROM pages
        WHERE theme_id = $1
        ORDER BY page_name ASC
      `, [themeId]);
      pages = result.rows;
    } catch (dbError) {
      console.log("[testing] Database query failed, using file system pages:", dbError.message);
      pages = getThemePagesFromFileSystem(themeId);
      fromFilesystem = true;
    }
    if (pages.length === 0) {
      console.log("[testing] No pages in database, checking file system...");
      const fsPages = getThemePagesFromFileSystem(themeId);
      if (fsPages.length > 0) {
        pages = fsPages;
        fromFilesystem = true;
      }
    }
    res.json({
      success: true,
      pages,
      total: pages.length,
      themeId,
      from_filesystem: fromFilesystem
    });
  } catch (error) {
    console.error("[testing] API: Error fetching theme pages:", error);
    try {
      const { themeId } = req.params;
      const fsPages = getThemePagesFromFileSystem(themeId);
      res.json({
        success: true,
        pages: fsPages,
        total: fsPages.length,
        themeId,
        from_filesystem: true
      });
    } catch (fsError) {
      res.status(500).json({
        success: false,
        error: "Failed to fetch theme pages",
        message: error.message
      });
    }
  }
});
router3.get("/pages/:pageId", async (req, res) => {
  try {
    const { pageId } = req.params;
    const { tenantId, themeId } = req.query;
    const isThemePage = pageId.startsWith("theme-");
    const isThemeMode = themeId && !tenantId;
    if ((isThemePage || isThemeMode) && themeId) {
      console.log(`[testing] API: Fetching theme page ${pageId} for theme: ${themeId}`);
      let pageResult = await query(`
        SELECT 
          id,
          page_name,
          slug,
          meta_title,
          meta_description,
          seo_index,
          status,
          page_type,
          theme_id,
          created_at,
          updated_at
        FROM pages
        WHERE id::text = $1 AND theme_id = $2
        LIMIT 1
      `, [pageId, themeId]);
      if (pageResult.rows.length === 0 && /^\d+$/.test(pageId)) {
        pageResult = await query(`
          SELECT 
            id,
            page_name,
            slug,
            meta_title,
            meta_description,
            seo_index,
            status,
            page_type,
            theme_id,
            created_at,
            updated_at
          FROM pages
          WHERE id = $1 AND theme_id = $2
          LIMIT 1
        `, [parseInt(pageId), themeId]);
      }
      if (pageResult.rows.length === 0) {
        const prefix = `theme-${themeId}-`;
        if (pageId.startsWith(prefix)) {
          const pageSlugPart = pageId.substring(prefix.length);
          const pageSlug = "/" + pageSlugPart.replace(/-/g, "/");
          pageResult = await query(`
            SELECT 
              id,
              page_name,
              slug,
              meta_title,
              meta_description,
              seo_index,
              status,
              page_type,
              theme_id,
              created_at,
              updated_at
            FROM pages
            WHERE slug = $1 AND theme_id = $2
            LIMIT 1
          `, [pageSlug, themeId]);
        }
      }
      if (pageResult.rows.length === 0) {
        const fsPages = getThemePagesFromFileSystem(themeId);
        const fsPage = fsPages.find((p) => p.id === pageId);
        if (fsPage) {
          return res.json({
            success: true,
            page: {
              ...fsPage,
              layout: { components: [] }
            }
          });
        }
        return res.status(404).json({
          success: false,
          error: "Page not found"
        });
      }
      const page = pageResult.rows[0];
      const layoutResult = await query(`
        SELECT layout_json, version, updated_at
        FROM page_layouts
        WHERE page_id = $1 AND language = 'default'
        ORDER BY version DESC
        LIMIT 1
      `, [page.id]);
      if (layoutResult.rows.length > 0) {
        let layout = layoutResult.rows[0].layout_json;
        try {
          const { convertLayoutTestimonialsToItems: convertLayoutTestimonialsToItems2 } = await Promise.resolve().then(() => (init_convertTestimonialsToItems(), convertTestimonialsToItems_exports));
          layout = convertLayoutTestimonialsToItems2(layout);
        } catch (error) {
          console.log("[testing] Note: Could not convert testimonials structure:", error.message);
        }
        page.layout = layout;
      } else {
        page.layout = { components: [] };
      }
      return res.json({
        success: true,
        page
      });
    } else {
      console.log(`[testing] API: Fetching page ${pageId} for tenant: ${tenantId || "default"}`);
      const page = await getPageWithLayout(pageId, tenantId);
      if (!page) {
        return res.status(404).json({
          success: false,
          error: "Page not found"
        });
      }
      if (page.layout && page.layout.components) {
        try {
          const { convertLayoutTestimonialsToItems: convertLayoutTestimonialsToItems2 } = await Promise.resolve().then(() => (init_convertTestimonialsToItems(), convertTestimonialsToItems_exports));
          page.layout = convertLayoutTestimonialsToItems2(page.layout);
        } catch (error) {
          console.log("[testing] Note: Could not convert testimonials structure:", error.message);
        }
      }
      res.json({
        success: true,
        page
      });
    }
  } catch (error) {
    console.error("[testing] API: Error fetching page:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch page",
      message: error.message
    });
  }
});
router3.put("/pages/:pageId", async (req, res) => {
  try {
    const { pageId } = req.params;
    const { page_name, meta_title, meta_description, seo_index, tenantId } = req.body;
    console.log(`[testing] API: Updating page ${pageId} for tenant: ${tenantId}`);
    const success = await updatePageData(pageId, page_name, meta_title, meta_description, seo_index, tenantId);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: "Page not found or update failed"
      });
    }
    res.json({
      success: true,
      message: "Page updated successfully"
    });
  } catch (error) {
    console.error("[testing] API: Error updating page:", error);
    if (error.message && error.message.includes("master page")) {
      return res.status(403).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to update page",
      message: error.message
    });
  }
});
router3.put("/pages/:pageId/layout", authenticateUser, async (req, res) => {
  console.log("[testing] ========== API: PUT /pages/:pageId/layout ==========");
  console.log("[testing] Request received:", {
    pageId: req.params.pageId,
    pageIdType: typeof req.params.pageId,
    method: req.method,
    url: req.url,
    user: req.user ? {
      id: req.user.id,
      email: req.user.email,
      tenant_id: req.user.tenant_id,
      is_super_admin: req.user.is_super_admin
    } : "no user",
    bodyKeys: Object.keys(req.body || {})
  });
  try {
    const { pageId } = req.params;
    const { layout_json, tenantId, themeId } = req.body;
    console.log("[testing] Step 1: Extracted parameters:", {
      pageId,
      pageIdType: typeof pageId,
      tenantId,
      themeId,
      hasLayoutJson: !!layout_json,
      layoutJsonType: typeof layout_json,
      layoutJsonKeys: layout_json ? Object.keys(layout_json) : [],
      componentsCount: layout_json?.components ? Array.isArray(layout_json.components) ? layout_json.components.length : "not array" : "no components"
    });
    console.log("[testing] Step 2: Validating tenant access...");
    if (!req.user.is_super_admin && tenantId !== req.user.tenant_id) {
      console.error("[testing] Step 2: Tenant access denied:", {
        userTenantId: req.user.tenant_id,
        requestTenantId: tenantId,
        isSuperAdmin: req.user.is_super_admin
      });
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "You can only update layouts for your own tenant"
      });
    }
    console.log("[testing] Step 2: Tenant access validated");
    console.log("[testing] Step 3: Calling updatePageLayout...");
    const success = await updatePageLayout(pageId, layout_json, tenantId, "default", themeId);
    console.log("[testing] Step 3: updatePageLayout result:", {
      success,
      pageId,
      tenantId,
      themeId
    });
    if (!success) {
      console.error("[testing] Step 3: updatePageLayout returned false - page not found or update failed");
      return res.status(404).json({
        success: false,
        error: "Page not found or layout update failed"
      });
    }
    console.log("[testing] ========== API: Layout update successful ==========");
    res.json({
      success: true,
      message: "Page layout updated successfully"
    });
  } catch (error) {
    console.error("[testing] ========== API: Error updating page layout ==========");
    console.error("[testing] Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
      name: error.name
    });
    if (error.code === "VALIDATION_ERROR") {
      console.error("[testing] Validation error detected");
      return res.status(400).json({
        success: false,
        error: "Validation error",
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to update page layout",
      message: error.message
    });
  }
});
router3.post("/pages/:pageId/versions", authenticateUser, async (req, res) => {
  try {
    const { pageId } = req.params;
    const { pageData, layoutJson, comment, tenantId } = req.body;
    console.log(`[testing] API: Saving page version ${pageId} for tenant: ${tenantId}`);
    if (!req.user.is_super_admin && tenantId !== req.user.tenant_id) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "You can only save versions for your own tenant"
      });
    }
    if (!pageData || !layoutJson) {
      return res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "pageData and layoutJson are required"
      });
    }
    const version2 = await savePageVersion(
      parseInt(pageId),
      tenantId,
      pageData,
      layoutJson,
      req.user.id,
      comment || null
    );
    res.json({
      success: true,
      version: version2,
      message: "Page version saved successfully"
    });
  } catch (error) {
    console.error("[testing] API: Error saving page version:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save page version",
      message: error.message
    });
  }
});
router3.post("/pages/update-slug", async (req, res) => {
  try {
    const { pageId, pageType, newSlug, oldSlug, tenantId } = req.body;
    console.log(`[testing] API: Updating slug for tenant: ${tenantId || "default"}`);
    console.log("[testing] API: Updating page slug:", { pageId, pageType, newSlug, oldSlug });
    if (!pageId || !pageType || !newSlug || !oldSlug) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        message: "pageId, pageType, newSlug, and oldSlug are required"
      });
    }
    if (!["page", "landing", "legal"].includes(pageType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid page type",
        message: "pageType must be one of: page, landing, legal"
      });
    }
    try {
      const validatedSlug = validateSlug(newSlug);
      console.log("[testing] API: Slug validated:", validatedSlug);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        error: "Invalid slug format",
        message: validationError.message
      });
    }
    if (oldSlug === "/" && newSlug !== "/") {
      return res.status(400).json({
        success: false,
        error: "Cannot change homepage slug",
        message: "The homepage slug cannot be modified"
      });
    }
    const updatedPage = await updatePageSlug(pageId, pageType, newSlug, oldSlug, tenantId);
    console.log("[testing] API: Page slug updated successfully:", updatedPage.id);
    res.json({
      success: true,
      message: "Slug updated successfully",
      page: updatedPage,
      oldSlug,
      newSlug
    });
  } catch (error) {
    console.error("[testing] API: Error updating page slug:", error);
    if (error.message.includes("already exists")) {
      return res.status(409).json({
        success: false,
        error: "Slug already exists",
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to update slug",
      message: error.message
    });
  }
});
router3.post("/pages/update-name", async (req, res) => {
  try {
    const { pageId, pageType, newName, tenantId } = req.body;
    console.log(`[testing] API: Updating page name for tenant: ${tenantId || "default"}`);
    console.log("[testing] API: Updating page name:", { pageId, pageType, newName });
    if (!pageId || !pageType || !newName) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        message: "pageId, pageType, and newName are required"
      });
    }
    if (!["page", "landing", "legal"].includes(pageType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid page type",
        message: "pageType must be one of: page, landing, legal"
      });
    }
    const success = await updatePageName(pageId, pageType, newName, tenantId);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: "Page not found",
        message: "The specified page could not be found"
      });
    }
    console.log("[testing] API: Page name updated successfully");
    res.json({
      success: true,
      message: "Page name updated successfully",
      pageId,
      newName
    });
  } catch (error) {
    console.error("[testing] API: Error updating page name:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update page name",
      message: error.message
    });
  }
});
router3.post("/pages/toggle-seo-index", async (req, res) => {
  try {
    const { pageId, pageType, currentIndex, tenantId } = req.body;
    console.log(`[testing] API: Toggling SEO index for tenant: ${tenantId || "default"}`);
    console.log("[testing] API: Toggling SEO index:", { pageId, pageType, currentIndex });
    if (!pageId || !pageType || currentIndex === void 0) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        message: "pageId, pageType, and currentIndex are required"
      });
    }
    if (!["page", "landing", "legal"].includes(pageType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid page type",
        message: "pageType must be one of: page, landing, legal"
      });
    }
    const newIndex = await toggleSEOIndex(pageId, pageType, currentIndex, tenantId);
    console.log("[testing] API: SEO index toggled successfully");
    res.json({
      success: true,
      message: "SEO index toggled successfully",
      pageId,
      newIndex
    });
  } catch (error) {
    console.error("[testing] API: Error toggling SEO index:", error);
    res.status(500).json({
      success: false,
      error: "Failed to toggle SEO index",
      message: error.message
    });
  }
});
router3.get("/pages/:slug/layout", async (req, res) => {
  try {
    const layout = await getLayoutBySlug("/" + req.params.slug.replace(/^\//, ""));
    if (!layout) return res.status(404).json({ error: "Page not found" });
    res.json(layout.layout_json || { components: [] });
  } catch (error) {
    console.error("[testing] Error getting layout:", error);
    res.status(500).json({ error: "Failed to get layout" });
  }
});
router3.put("/pages/:slug/layout", async (req, res) => {
  try {
    const slug = "/" + req.params.slug.replace(/^\//, "");
    const layoutJson = req.body?.components ? req.body : { components: [] };
    const updated = await upsertLayoutBySlug(slug, layoutJson);
    invalidateBySlug(slug);
    res.json({ ok: true, version: updated.version });
  } catch (error) {
    console.error("[testing] Error updating layout:", error);
    res.status(500).json({ error: "Failed to update layout" });
  }
});
router3.get("/layout", async (req, res) => {
  try {
    const slug = typeof req.query.slug === "string" ? req.query.slug : "/";
    const layout = await getLayoutBySlug(slug);
    if (!layout) return res.status(404).json({ error: "Page not found" });
    res.json(layout.layout_json || { components: [] });
  } catch (error) {
    console.error("[testing] Error getting layout (query):", error);
    res.status(500).json({ error: "Failed to get layout" });
  }
});
router3.put("/layout", async (req, res) => {
  try {
    const slug = typeof req.query.slug === "string" ? req.query.slug : "/";
    const layoutJson = req.body && req.body.components ? req.body : { components: [] };
    const updated = await upsertLayoutBySlug(slug, layoutJson);
    invalidateBySlug(slug);
    res.json({ ok: true, version: updated.version });
  } catch (error) {
    console.error("[testing] Error updating layout (query):", error);
    res.status(500).json({ error: "Failed to update layout" });
  }
});
router3.get("/terms/taxonomy/:taxonomy", async (req, res) => {
  try {
    const { taxonomy } = req.params;
    const allTerms = await getTerms();
    const filteredTerms = allTerms.filter((term) => term.taxonomy === taxonomy);
    res.json(filteredTerms);
  } catch (error) {
    console.error("[testing] Error fetching terms by taxonomy:", error);
    res.status(500).json({ error: "Failed to fetch terms" });
  }
});
router3.get("/terms", async (req, res) => {
  try {
    const { taxonomy } = req.query;
    const terms = await getTerms(taxonomy || null);
    res.json(terms);
  } catch (error) {
    console.error("[testing] Error fetching terms:", error);
    res.status(500).json({ error: "Failed to fetch terms" });
  }
});
router3.get("/categories", async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;
    const whereClause = {};
    if (tenantId) {
      whereClause[Op4.or] = [
        { tenant_id: tenantId },
        { tenant_id: null }
      ];
    }
    const categories = await Category4.findAll({
      where: whereClause,
      order: [["created_at", "DESC"]]
    });
    res.json(categories.map((cat) => cat.toJSON()));
  } catch (error) {
    console.error("[testing] Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});
router3.get("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;
    const whereClause = { id: parseInt(id) };
    if (tenantId) {
      whereClause[Op4.or] = [
        { tenant_id: tenantId },
        { tenant_id: null }
      ];
    }
    const category = await Category4.findOne({ where: whereClause });
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(category.toJSON());
  } catch (error) {
    console.error("[testing] Error fetching category:", error);
    res.status(500).json({ error: "Failed to fetch category" });
  }
});
router3.post("/categories", async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenant_id || req.body.tenantId;
    if (!tenantId) {
      return res.status(400).json({
        error: "Tenant ID is required",
        message: "Please provide tenant ID via authentication or request body"
      });
    }
    const category = await Category4.create({
      ...req.body,
      tenant_id: tenantId
    });
    res.status(201).json(category.toJSON());
  } catch (error) {
    console.error("[testing] Error creating category:", error);
    if (error.code === "23505" || error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "A category with this slug already exists for this tenant" });
    }
    res.status(500).json({ error: "Failed to create category" });
  }
});
router3.put("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || req.user?.tenant_id || req.body.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required to update categories" });
    }
    const whereClause = {
      id: parseInt(id),
      tenant_id: tenantId
      // Only tenant-specific categories can be updated
    };
    const category = await Category4.findOne({ where: whereClause });
    if (!category) {
      const masterCategory = await Category4.findOne({
        where: { id: parseInt(id), tenant_id: null }
      });
      if (masterCategory) {
        return res.status(403).json({
          error: "Cannot update master category. Master data (tenant_id = NULL) is shared across all tenants. Create a tenant-specific category instead."
        });
      }
      return res.status(404).json({ error: "Category not found" });
    }
    const updateData = { ...req.body };
    delete updateData.tenant_id;
    await category.update(updateData);
    res.json(category.toJSON());
  } catch (error) {
    console.error("[testing] Error updating category:", error);
    if (error.code === "23505" || error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "A category with this slug already exists for this tenant" });
    }
    res.status(500).json({ error: "Failed to update category" });
  }
});
router3.delete("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;
    const whereClause = { id: parseInt(id) };
    if (tenantId) {
      whereClause.tenant_id = tenantId;
    } else {
      return res.status(400).json({ error: "Tenant ID is required to delete categories" });
    }
    const category = await Category4.findOne({ where: whereClause });
    if (!category) {
      return res.status(404).json({ error: "Category not found or is a master category (cannot delete master data)" });
    }
    if (!category.tenant_id) {
      return res.status(403).json({ error: "Cannot delete master category. Master data (tenant_id = NULL) is shared across all tenants." });
    }
    await category.destroy();
    res.json({ success: true, message: "Category deleted successfully", category: category.toJSON() });
  } catch (error) {
    console.error("[testing] Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
});
router3.get("/tags", async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;
    const whereClause = {};
    if (tenantId) {
      whereClause[Op4.or] = [
        { tenant_id: tenantId },
        { tenant_id: null }
      ];
    }
    const tags = await Tag4.findAll({
      where: whereClause,
      order: [["created_at", "DESC"]]
    });
    res.json(tags.map((tag) => tag.toJSON()));
  } catch (error) {
    console.error("[testing] Error fetching tags:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});
router3.get("/tags/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;
    const whereClause = { id: parseInt(id) };
    if (tenantId) {
      whereClause[Op4.or] = [
        { tenant_id: tenantId },
        { tenant_id: null }
      ];
    }
    const tag = await Tag4.findOne({ where: whereClause });
    if (!tag) {
      return res.status(404).json({ error: "Tag not found" });
    }
    res.json(tag.toJSON());
  } catch (error) {
    console.error("[testing] Error fetching tag:", error);
    res.status(500).json({ error: "Failed to fetch tag" });
  }
});
router3.post("/tags", async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenant_id || req.body.tenantId;
    if (!tenantId) {
      return res.status(400).json({
        error: "Tenant ID is required",
        message: "Please provide tenant ID via authentication or request body"
      });
    }
    const tag = await Tag4.create({
      ...req.body,
      tenant_id: tenantId
    });
    res.status(201).json(tag.toJSON());
  } catch (error) {
    console.error("[testing] Error creating tag:", error);
    if (error.code === "23505" || error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "A tag with this slug already exists for this tenant" });
    }
    res.status(500).json({ error: "Failed to create tag" });
  }
});
router3.put("/tags/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || req.user?.tenant_id || req.body.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required to update tags" });
    }
    const whereClause = {
      id: parseInt(id),
      tenant_id: tenantId
      // Only tenant-specific tags can be updated
    };
    const tag = await Tag4.findOne({ where: whereClause });
    if (!tag) {
      const masterTag = await Tag4.findOne({
        where: { id: parseInt(id), tenant_id: null }
      });
      if (masterTag) {
        return res.status(403).json({
          error: "Cannot update master tag. Master data (tenant_id = NULL) is shared across all tenants. Create a tenant-specific tag instead."
        });
      }
      return res.status(404).json({ error: "Tag not found" });
    }
    const updateData = { ...req.body };
    delete updateData.tenant_id;
    await tag.update(updateData);
    res.json(tag.toJSON());
  } catch (error) {
    console.error("[testing] Error updating tag:", error);
    if (error.code === "23505" || error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "A tag with this slug already exists for this tenant" });
    }
    res.status(500).json({ error: "Failed to update tag" });
  }
});
router3.delete("/tags/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;
    const whereClause = { id: parseInt(id) };
    if (tenantId) {
      whereClause.tenant_id = tenantId;
    } else {
      return res.status(400).json({ error: "Tenant ID is required to delete tags" });
    }
    const tag = await Tag4.findOne({ where: whereClause });
    if (!tag) {
      return res.status(404).json({ error: "Tag not found or is a master tag (cannot delete master data)" });
    }
    if (!tag.tenant_id) {
      return res.status(403).json({ error: "Cannot delete master tag. Master data (tenant_id = NULL) is shared across all tenants." });
    }
    await tag.destroy();
    res.json({ success: true, message: "Tag deleted successfully", tag: tag.toJSON() });
  } catch (error) {
    console.error("[testing] Error deleting tag:", error);
    res.status(500).json({ error: "Failed to delete tag" });
  }
});
router3.get("/posts", async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = getDatabaseState();
    if (!dbInitialized2) {
      if (dbInitializationError2) {
        return res.status(503).json({
          error: "Database initialization failed",
          message: "Please try again later"
        });
      }
      return res.status(503).json({
        error: "Database is initializing",
        message: "Please try again in a moment"
      });
    }
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;
    if (!tenantId) {
      return res.status(400).json({
        error: "Tenant ID is required",
        message: "Please provide tenant ID via authentication or query parameter"
      });
    }
    console.log("[testing] Fetching all posts for tenant:", tenantId);
    const posts = await Post5.findAll({
      where: {
        [Op4.or]: [
          { tenant_id: tenantId },
          { tenant_id: null }
        ]
      },
      include: [
        {
          model: models_default.Category,
          as: "categories",
          through: { attributes: [] }
        },
        {
          model: models_default.Tag,
          as: "tags",
          through: { attributes: [] }
        }
      ],
      order: [["created_at", "DESC"]]
    });
    const postsWithTerms = posts.map((post) => {
      const postJson = post.toJSON();
      const terms = [
        ...(postJson.categories || []).map((cat) => ({
          id: cat.id,
          name: cat.name,
          taxonomy: "category"
        })),
        ...(postJson.tags || []).map((tag) => ({
          id: tag.id,
          name: tag.name,
          taxonomy: "post_tag"
        }))
      ];
      return {
        ...postJson,
        terms
      };
    });
    res.json(postsWithTerms);
  } catch (error) {
    console.error("[testing] Error fetching posts:", error);
    const { dbInitialized: dbInitialized2 } = getDatabaseState();
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      if (!dbInitialized2) {
        return res.status(503).json({
          error: "Database is initializing",
          message: "Please try again in a moment"
        });
      }
    }
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});
router3.get("/posts/:id", async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = getDatabaseState();
    if (!dbInitialized2) {
      if (dbInitializationError2) {
        return res.status(503).json({
          error: "Database initialization failed",
          message: "Please try again later"
        });
      }
      return res.status(503).json({
        error: "Database is initializing",
        message: "Please try again in a moment"
      });
    }
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;
    if (!tenantId) {
      return res.status(400).json({
        error: "Tenant ID is required",
        message: "Please provide tenant ID via authentication or query parameter"
      });
    }
    const { id } = req.params;
    console.log("[testing] Fetching post:", id, "for tenant:", tenantId);
    const post = await Post5.findOne({
      where: {
        id: parseInt(id),
        [Op4.or]: [
          { tenant_id: tenantId },
          { tenant_id: null }
        ]
      },
      include: [
        {
          model: models_default.Category,
          as: "categories",
          through: { attributes: [] }
        },
        {
          model: models_default.Tag,
          as: "tags",
          through: { attributes: [] }
        }
      ]
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post.toJSON());
  } catch (error) {
    console.error("[testing] Error fetching post:", error);
    const { dbInitialized: dbInitialized2 } = getDatabaseState();
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      if (!dbInitialized2) {
        return res.status(503).json({
          error: "Database is initializing",
          message: "Please try again in a moment"
        });
      }
    }
    res.status(500).json({ error: "Failed to fetch post" });
  }
});
router3.post("/posts", async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = getDatabaseState();
    if (!dbInitialized2) {
      if (dbInitializationError2) {
        return res.status(503).json({
          error: "Database initialization failed",
          message: "Please try again later"
        });
      }
      return res.status(503).json({
        error: "Database is initializing",
        message: "Please try again in a moment"
      });
    }
    let tenantId;
    if (req.user?.is_super_admin && req.body.tenantId) {
      tenantId = req.body.tenantId;
    } else {
      tenantId = req.tenantId || req.user?.tenant_id || req.body.tenantId;
    }
    if (!tenantId) {
      return res.status(400).json({
        error: "Tenant ID is required",
        message: "Please provide tenant ID via authentication or request body"
      });
    }
    console.log("[testing] Creating new post for tenant:", tenantId, "is_super_admin:", req.user?.is_super_admin);
    const {
      title,
      slug,
      content,
      excerpt,
      status,
      author_id,
      published_at,
      categories = [],
      tags = [],
      meta_title,
      meta_description,
      meta_keywords,
      og_title,
      og_description,
      twitter_title,
      twitter_description,
      featured_image_id
    } = req.body;
    if (!title || !slug) {
      return res.status(400).json({
        error: "Title and slug are required"
      });
    }
    const post = await Post5.create({
      title,
      slug,
      content: content || "",
      excerpt: excerpt || "",
      status: status || "draft",
      post_type: "post",
      author_id: author_id || req.user?.id || 1,
      meta_title: meta_title || "",
      meta_description: meta_description || "",
      meta_keywords: meta_keywords || "",
      canonical_url: "",
      og_title: og_title || "",
      og_description: og_description || "",
      og_image: "",
      twitter_title: twitter_title || "",
      twitter_description: twitter_description || "",
      twitter_image: "",
      published_at: published_at || null,
      tenant_id: tenantId || null,
      featured_image_id: featured_image_id || null
    });
    const categoryIds = Array.isArray(categories) ? categories : [];
    try {
      await setPostCategories(post.id, categoryIds);
    } catch (err) {
      console.log("[testing] Note setting post categories:", err.message);
      if (categoryIds.length > 0) {
        for (const categoryId of categoryIds) {
          const taxonomyResult = await query(`
            SELECT id FROM term_taxonomy WHERE term_id = $1 AND taxonomy = 'category'
          `, [categoryId]);
          if (taxonomyResult.rows.length > 0) {
            await query(`
              INSERT INTO term_relationships (object_id, term_taxonomy_id)
              VALUES ($1, $2)
              ON CONFLICT DO NOTHING
            `, [post.id, taxonomyResult.rows[0].id]);
          }
        }
      }
    }
    const tagIds = Array.isArray(tags) ? tags : [];
    try {
      await setPostTags(post.id, tagIds);
    } catch (err) {
      console.log("[testing] Note setting post tags:", err.message);
      if (tagIds.length > 0) {
        for (const tagId of tagIds) {
          const taxonomyResult = await query(`
            SELECT id FROM term_taxonomy WHERE term_id = $1 AND taxonomy = 'post_tag'
          `, [tagId]);
          if (taxonomyResult.rows.length > 0) {
            await query(`
              INSERT INTO term_relationships (object_id, term_taxonomy_id)
              VALUES ($1, $2)
              ON CONFLICT DO NOTHING
            `, [post.id, taxonomyResult.rows[0].id]);
          }
        }
      }
    }
    const newPost = await Post5.findByPk(post.id, {
      include: [
        {
          model: models_default.Category,
          as: "categories",
          through: { attributes: [] }
          // Exclude junction table attributes
        },
        {
          model: models_default.Tag,
          as: "tags",
          through: { attributes: [] }
          // Exclude junction table attributes
        }
      ]
    });
    const postData = newPost ? newPost.toJSON() : post.toJSON();
    if (req.body.wordpress_sync_enabled !== false) {
      if (post.wordpress_sync_enabled === void 0 || post.wordpress_sync_enabled === null) {
        await post.update({ wordpress_sync_enabled: true });
      }
      syncPostToWordPress(post, tenantId).catch((err) => {
        console.error("[testing] WordPress sync error (non-blocking):", err);
      });
    }
    res.status(201).json(postData);
  } catch (error) {
    console.error("[testing] Error creating post:", error);
    const { dbInitialized: dbInitialized2 } = getDatabaseState();
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      if (!dbInitialized2) {
        return res.status(503).json({
          error: "Database is initializing",
          message: "Please try again in a moment"
        });
      }
    }
    if (error.code === "23505" || error.message.includes("unique")) {
      return res.status(409).json({
        error: "A post with this slug already exists"
      });
    }
    res.status(500).json({
      error: "Failed to create post",
      message: error.message
    });
  }
});
router3.put("/posts/:id", async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = getDatabaseState();
    if (!dbInitialized2) {
      if (dbInitializationError2) {
        return res.status(503).json({
          error: "Database initialization failed",
          message: "Please try again later"
        });
      }
      return res.status(503).json({
        error: "Database is initializing",
        message: "Please try again in a moment"
      });
    }
    let tenantId;
    if (req.user?.is_super_admin && req.body.tenantId) {
      tenantId = req.body.tenantId;
    } else {
      tenantId = req.tenantId || req.user?.tenant_id || req.body.tenantId;
    }
    if (!tenantId) {
      return res.status(400).json({
        error: "Tenant ID is required",
        message: "Please provide tenant ID via authentication or request body"
      });
    }
    const { id } = req.params;
    console.log("[testing] Updating post:", id, "for tenant:", tenantId, "is_super_admin:", req.user?.is_super_admin);
    const {
      title,
      slug,
      content,
      excerpt,
      status,
      author_id,
      published_at,
      categories = [],
      tags = [],
      meta_title,
      meta_description,
      meta_keywords,
      og_title,
      og_description,
      twitter_title,
      twitter_description,
      featured_image_id
    } = req.body;
    if (!title || !slug) {
      return res.status(400).json({
        error: "Title and slug are required"
      });
    }
    const whereClause = req.user?.is_super_admin ? { id: parseInt(id) } : {
      id: parseInt(id),
      [Op4.or]: [
        { tenant_id: tenantId },
        { tenant_id: null }
      ]
    };
    const post = await Post5.findOne({ where: whereClause });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const updateData = {
      title,
      slug,
      content: content || "",
      excerpt: excerpt || "",
      status: status || "draft",
      author_id: author_id || req.user?.id || 1,
      meta_title: meta_title || "",
      meta_description: meta_description || "",
      meta_keywords: meta_keywords || "",
      og_title: og_title || "",
      og_description: og_description || "",
      twitter_title: twitter_title || "",
      twitter_description: twitter_description || "",
      featured_image_id: featured_image_id !== void 0 ? featured_image_id : post.featured_image_id,
      published_at: published_at || null
    };
    if (req.user?.is_super_admin && req.body.tenantId) {
      updateData.tenant_id = req.body.tenantId;
    }
    await post.update(updateData);
    await query(`DELETE FROM term_relationships WHERE object_id = $1`, [parseInt(id)]);
    const categoryIds = Array.isArray(categories) ? categories : [];
    try {
      await setPostCategories(parseInt(id), categoryIds);
    } catch (err) {
      console.log("[testing] Note setting post categories:", err.message);
      if (categoryIds.length > 0) {
        for (const categoryId of categoryIds) {
          const taxonomyResult = await query(`
            SELECT id FROM term_taxonomy WHERE term_id = $1 AND taxonomy = 'category'
          `, [categoryId]);
          if (taxonomyResult.rows.length > 0) {
            await query(`
              INSERT INTO term_relationships (object_id, term_taxonomy_id)
              VALUES ($1, $2)
              ON CONFLICT DO NOTHING
            `, [parseInt(id), taxonomyResult.rows[0].id]);
          }
        }
      }
    }
    const tagIds = Array.isArray(tags) ? tags : [];
    try {
      await setPostTags(parseInt(id), tagIds);
    } catch (err) {
      console.log("[testing] Note setting post tags:", err.message);
      if (tagIds.length > 0) {
        for (const tagId of tagIds) {
          const taxonomyResult = await query(`
            SELECT id FROM term_taxonomy WHERE term_id = $1 AND taxonomy = 'post_tag'
          `, [tagId]);
          if (taxonomyResult.rows.length > 0) {
            await query(`
              INSERT INTO term_relationships (object_id, term_taxonomy_id)
              VALUES ($1, $2)
              ON CONFLICT DO NOTHING
            `, [parseInt(id), taxonomyResult.rows[0].id]);
          }
        }
      }
    }
    const updatedPost = await Post5.findByPk(post.id, {
      include: [
        {
          model: models_default.Category,
          as: "categories",
          through: { attributes: [] }
        },
        {
          model: models_default.Tag,
          as: "tags",
          through: { attributes: [] }
        }
      ]
    });
    const finalPost = updatedPost || post;
    if (finalPost.wordpress_sync_enabled) {
      syncPostToWordPress(finalPost, tenantId).catch((err) => {
        console.error("[testing] WordPress sync error (non-blocking):", err);
      });
    }
    res.json(finalPost ? finalPost.toJSON() : post.toJSON());
  } catch (error) {
    console.error("[testing] Error updating post:", error);
    const { dbInitialized: dbInitialized2 } = getDatabaseState();
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      if (!dbInitialized2) {
        return res.status(503).json({
          error: "Database is initializing",
          message: "Please try again in a moment"
        });
      }
    }
    if (error.message === "Post not found") {
      return res.status(404).json({ error: "Post not found" });
    }
    if (error.code === "23505" || error.message.includes("unique")) {
      return res.status(409).json({
        error: "A post with this slug already exists"
      });
    }
    res.status(500).json({
      error: "Failed to update post",
      message: error.message
    });
  }
});
router3.delete("/posts/:id", async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = getDatabaseState();
    if (!dbInitialized2) {
      if (dbInitializationError2) {
        return res.status(503).json({
          error: "Database initialization failed",
          message: "Please try again later"
        });
      }
      return res.status(503).json({
        error: "Database is initializing",
        message: "Please try again in a moment"
      });
    }
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;
    if (!tenantId) {
      return res.status(400).json({
        error: "Tenant ID is required",
        message: "Please provide tenant ID via authentication or query parameter"
      });
    }
    const { id } = req.params;
    console.log("[testing] Deleting post:", id, "for tenant:", tenantId);
    await query(`DELETE FROM term_relationships WHERE object_id = $1`, [parseInt(id)]);
    const post = await Post5.findOne({
      where: {
        id: parseInt(id),
        [Op4.or]: [
          { tenant_id: tenantId },
          { tenant_id: null }
        ]
      }
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    await post.destroy();
    res.json({
      success: true,
      message: "Post deleted successfully"
    });
  } catch (error) {
    console.error("[testing] Error deleting post:", error);
    const { dbInitialized: dbInitialized2 } = getDatabaseState();
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      if (!dbInitialized2) {
        return res.status(503).json({
          error: "Database is initializing",
          message: "Please try again in a moment"
        });
      }
    }
    if (error.message === "Post not found") {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(500).json({
      error: "Failed to delete post",
      message: error.message
    });
  }
});
router3.get("/blog/posts", async (req, res) => {
  try {
    const tenantId = req.query.tenant || "tenant-gosg";
    const queryText = `
      SELECT 
        p.id, 
        p.title, 
        p.slug, 
        p.excerpt, 
        p.content,
        p.featured_image as image,
        p.created_at as date,
        '5 min read' as "readTime",
        COALESCE(
          (SELECT t.name FROM post_terms pt 
           JOIN terms t ON pt.term_id = t.id 
           WHERE pt.post_id = p.id AND t.taxonomy = 'category' 
           LIMIT 1),
          'Uncategorized'
        ) as category
      FROM posts p
      WHERE p.status = 'published'
      ORDER BY p.created_at DESC
      LIMIT 20
    `;
    const result = await query(queryText);
    const posts = result.rows.map((post) => ({
      ...post,
      date: post.date ? new Date(post.date).toISOString().split("T")[0] : (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    }));
    res.json(posts);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});
router3.get("/blog/posts/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const tenantId = req.query.tenant || "tenant-gosg";
    const queryText = `
      SELECT 
        p.id, 
        p.title, 
        p.slug, 
        p.excerpt, 
        p.content,
        p.featured_image as image,
        p.created_at as date,
        '5 min read' as "readTime",
        COALESCE(
          (SELECT t.name FROM post_terms pt 
           JOIN terms t ON pt.term_id = t.id 
           WHERE pt.post_id = p.id AND t.taxonomy = 'category' 
           LIMIT 1),
          'Uncategorized'
        ) as category
      FROM posts p
      WHERE p.slug = $1 AND p.status = 'published'
      LIMIT 1
    `;
    const result = await query(queryText, [slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }
    const tagsQuery = `
      SELECT t.name
      FROM post_terms pt
      JOIN terms t ON pt.term_id = t.id
      WHERE pt.post_id = $1 AND t.taxonomy = 'post_tag'
    `;
    const tagsResult = await query(tagsQuery, [result.rows[0].id]);
    const tags = tagsResult.rows.map((row) => row.name);
    const post = {
      ...result.rows[0],
      date: result.rows[0].date ? new Date(result.rows[0].date).toISOString().split("T")[0] : (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      tags
    };
    res.json(post);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    res.status(500).json({ error: "Failed to fetch blog post" });
  }
});
router3.post("/pages/:pageId/migrate-schema", async (req, res) => {
  try {
    const { pageId } = req.params;
    const { tenantId } = req.body;
    console.log(`[testing] API: Migrating schema for page ${pageId} (tenant: ${tenantId})`);
    const page = await getPageWithLayout(pageId, tenantId);
    if (!page) {
      return res.status(404).json({
        success: false,
        error: "Page not found"
      });
    }
    const { migrateOldSchemaToNew, needsMigration } = await import("../../sparti-cms/utils/schema-migration.ts");
    if (!needsMigration(page.layout)) {
      return res.json({
        success: true,
        message: "Schema already in new format",
        migrated: false
      });
    }
    const newSchema = migrateOldSchemaToNew(page.layout);
    const schemaWithVersion = {
      ...newSchema,
      _version: {
        version: "2.0",
        migratedAt: (/* @__PURE__ */ new Date()).toISOString(),
        migratedFrom: "1.0"
      }
    };
    const success = await updatePageLayout(pageId, schemaWithVersion, tenantId);
    if (!success) {
      return res.status(500).json({
        success: false,
        error: "Failed to update page layout"
      });
    }
    res.json({
      success: true,
      message: "Schema migrated successfully",
      migrated: true,
      newSchema
    });
  } catch (error) {
    console.error("[testing] API: Error migrating schema:", error);
    res.status(500).json({
      success: false,
      error: "Failed to migrate schema",
      message: error.message
    });
  }
});
router3.post("/pages/:pageId/validate-schema", async (req, res) => {
  try {
    const { pageId } = req.params;
    const { tenantId } = req.body;
    console.log(`[testing] API: Validating schema for page ${pageId} (tenant: ${tenantId})`);
    const page = await getPageWithLayout(pageId, tenantId);
    if (!page) {
      return res.status(404).json({
        success: false,
        error: "Page not found"
      });
    }
    const { validatePageSchema: validatePageSchema2, getValidationSummary: getValidationSummary2 } = await Promise.resolve().then(() => (init_schema_validator(), schema_validator_exports));
    const validation = validatePageSchema2(page.layout);
    const summary = getValidationSummary2(page.layout);
    res.json({
      success: true,
      validation: {
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings
      },
      summary: {
        totalComponents: summary.totalComponents,
        totalItems: summary.totalItems,
        itemTypeCounts: summary.itemTypeCounts,
        hasErrors: summary.hasErrors,
        hasWarnings: summary.hasWarnings
      }
    });
  } catch (error) {
    console.error("[testing] API: Error validating schema:", error);
    res.status(500).json({
      success: false,
      error: "Failed to validate schema",
      message: error.message
    });
  }
});
router3.post("/import/wordpress", authenticateUser, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const tenantId = req.tenantId || req.user?.tenant_id || req.body.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required" });
    }
    const fileContent = readFileSync(req.file.path, "utf8");
    const fileExtension = req.file.originalname.toLowerCase().split(".").pop();
    let parsedData;
    try {
      if (fileExtension === "xml") {
        parsedData = parseWordPressXML(fileContent);
      } else if (fileExtension === "json") {
        parsedData = parseWordPressJSON(fileContent);
      } else {
        return res.status(400).json({ error: "Unsupported file format. Please upload .xml or .json file" });
      }
    } catch (parseError) {
      console.error("[testing] Error parsing WordPress file:", parseError);
      return res.status(400).json({ error: `Failed to parse file: ${parseError.message}` });
    }
    const summary = {
      postsCreated: 0,
      postsUpdated: 0,
      categoriesCreated: 0,
      tagsCreated: 0,
      imagesDownloaded: 0,
      errors: []
    };
    const categoriesData = extractCategories(parsedData);
    const categoryMap = /* @__PURE__ */ new Map();
    for (const catData of categoriesData) {
      try {
        const slug = catData.slug || catData.name.toLowerCase().replace(/\s+/g, "-");
        const category = await findOrCreateCategory(slug, {
          name: catData.name,
          description: catData.description || ""
        });
        categoryMap.set(catData.name, category.id);
        categoryMap.set(slug, category.id);
        if (category.id && !categoryMap.has(category.id)) {
          summary.categoriesCreated++;
        }
      } catch (error) {
        console.error("[testing] Error processing category:", catData.name, error);
        summary.errors.push(`Failed to process category "${catData.name}": ${error.message}`);
      }
    }
    const tagsData = extractTags(parsedData);
    const tagMap = /* @__PURE__ */ new Map();
    for (const tagData of tagsData) {
      try {
        const slug = tagData.slug || tagData.name.toLowerCase().replace(/\s+/g, "-");
        const tag = await findOrCreateTag(slug, {
          name: tagData.name,
          description: tagData.description || ""
        });
        tagMap.set(tagData.name, tag.id);
        tagMap.set(slug, tag.id);
        if (tag.id && !tagMap.has(tag.id)) {
          summary.tagsCreated++;
        }
      } catch (error) {
        console.error("[testing] Error processing tag:", tagData.name, error);
        summary.errors.push(`Failed to process tag "${tagData.name}": ${error.message}`);
      }
    }
    const postsData = extractPosts(parsedData);
    const getOrCreateCategory = async (name) => {
      if (!name) return null;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      if (categoryMap.has(name) || categoryMap.has(slug)) {
        return categoryMap.get(name) || categoryMap.get(slug);
      }
      try {
        const category = await findOrCreateCategory(slug, { name, description: "" });
        categoryMap.set(name, category.id);
        categoryMap.set(slug, category.id);
        summary.categoriesCreated++;
        return category.id;
      } catch (error) {
        console.error("[testing] Error creating category from post:", name, error);
        return null;
      }
    };
    const getOrCreateTag = async (name) => {
      if (!name) return null;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      if (tagMap.has(name) || tagMap.has(slug)) {
        return tagMap.get(name) || tagMap.get(slug);
      }
      try {
        const tag = await findOrCreateTag(slug, { name, description: "" });
        tagMap.set(name, tag.id);
        tagMap.set(slug, tag.id);
        summary.tagsCreated++;
        return tag.id;
      } catch (error) {
        console.error("[testing] Error creating tag from post:", name, error);
        return null;
      }
    };
    for (const postData of postsData) {
      try {
        const existingPost = await Post5.findOne({
          where: {
            slug: postData.slug,
            tenant_id: tenantId
          }
        });
        const imageUrls = extractImages(postData.content);
        let updatedContent = postData.content;
        let imagesDownloaded = 0;
        if (imageUrls.length > 0) {
          try {
            const { imageMap, errors: imageErrors } = await downloadImages(imageUrls, tenantId);
            imagesDownloaded = Array.from(imageMap.values()).filter((url) => url.startsWith("/uploads/")).length;
            summary.imagesDownloaded += imagesDownloaded;
            updatedContent = updateImageReferences(postData.content, imageMap);
            imageErrors.forEach((err) => summary.errors.push(err));
          } catch (imageError) {
            console.error("[testing] Error downloading images for post:", postData.title, imageError);
            summary.errors.push(`Failed to download some images for post "${postData.title}"`);
          }
        }
        const postPayload = {
          title: postData.title,
          slug: postData.slug,
          content: updatedContent,
          excerpt: postData.excerpt || "",
          status: postData.status === "publish" ? "published" : postData.status || "draft",
          post_type: "post",
          author_id: req.user?.id || 1,
          published_at: postData.publishedAt || null,
          tenant_id: tenantId
        };
        let post;
        if (existingPost) {
          await existingPost.update(postPayload);
          post = existingPost;
          summary.postsUpdated++;
        } else {
          post = await Post5.create(postPayload);
          summary.postsCreated++;
        }
        const categoryIds = [];
        if (Array.isArray(postData.categories)) {
          for (const catName of postData.categories) {
            let catId = categoryMap.get(catName) || categoryMap.get(catName.toLowerCase().replace(/\s+/g, "-"));
            if (!catId) {
              catId = await getOrCreateCategory(catName);
            }
            if (catId && !categoryIds.includes(catId)) {
              categoryIds.push(catId);
            }
          }
        }
        if (categoryIds.length > 0) {
          await setPostCategories(post.id, categoryIds);
        }
        const tagIds = [];
        if (Array.isArray(postData.tags)) {
          for (const tagName of postData.tags) {
            let tagId = tagMap.get(tagName) || tagMap.get(tagName.toLowerCase().replace(/\s+/g, "-"));
            if (!tagId) {
              tagId = await getOrCreateTag(tagName);
            }
            if (tagId && !tagIds.includes(tagId)) {
              tagIds.push(tagId);
            }
          }
        }
        if (tagIds.length > 0) {
          await setPostTags(post.id, tagIds);
        }
      } catch (error) {
        console.error("[testing] Error processing post:", postData.title, error);
        summary.errors.push(`Failed to process post "${postData.title}": ${error.message}`);
      }
    }
    try {
      const { unlinkSync } = await import("fs");
      unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.error("[testing] Error cleaning up uploaded file:", cleanupError);
    }
    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error("[testing] Error importing WordPress file:", error);
    res.status(500).json({
      error: "Failed to import WordPress file",
      message: error.message
    });
  }
});
var content_default = router3;

// server/routes/forms.js
init_db();
import express5 from "express";
init_db();

// server/utils/emailService.js
init_constants();
function replaceTemplatePlaceholders(template, data) {
  if (!template) return "";
  let result = template;
  Object.keys(data).forEach((key) => {
    const value = data[key] || "";
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    result = result.replace(regex, value);
  });
  return result;
}
async function sendEmailViaResend(emailData) {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  const { to, subject, html, text, reply_to, from } = emailData;
  if (!to || !subject || !html && !text) {
    throw new Error("Missing required fields: to, subject, and html or text");
  }
  const payload = {
    from: from || SMTP_FROM_EMAIL,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text,
    reply_to
  };
  Object.keys(payload).forEach((key) => {
    if (payload[key] === void 0) {
      delete payload[key];
    }
  });
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }
  const result = await response.json();
  return result;
}
function textToHtml(text) {
  if (!text) return "";
  return text.replace(/\n/g, "<br>").replace(/\r/g, "");
}
async function sendFormNotificationEmails(formSubmission, emailSettings) {
  if (!emailSettings || !emailSettings.notification_enabled) {
    console.log("[testing] Notification emails disabled for form");
    return null;
  }
  if (!emailSettings.notification_emails || emailSettings.notification_emails.length === 0) {
    console.log("[testing] No notification email addresses configured");
    return null;
  }
  try {
    const templateData = {
      name: formSubmission.name || "",
      email: formSubmission.email || "",
      phone: formSubmission.phone || "",
      company: formSubmission.company || "",
      message: formSubmission.message || "",
      form_name: formSubmission.form_name || formSubmission.form_id || "Form"
    };
    const subject = replaceTemplatePlaceholders(
      emailSettings.notification_subject || "New Form Submission",
      templateData
    );
    const template = emailSettings.notification_template || "You have received a new form submission.";
    const textContent = replaceTemplatePlaceholders(template, templateData);
    const htmlContent = textToHtml(textContent);
    const fromEmail = emailSettings.notification_from_email || SMTP_FROM_EMAIL;
    console.log("[testing] Sending notification email from:", fromEmail, "(notification_from_email:", emailSettings.notification_from_email || "not set, using SMTP_FROM_EMAIL:", SMTP_FROM_EMAIL, ")");
    const emailData = {
      from: fromEmail,
      to: emailSettings.notification_emails,
      subject,
      html: htmlContent,
      text: textContent,
      reply_to: formSubmission.email || void 0
    };
    const result = await sendEmailViaResend(emailData);
    console.log("[testing] Form notification emails sent successfully:", result.id);
    return result;
  } catch (error) {
    console.error("[testing] Error sending form notification emails:", error);
    throw error;
  }
}
async function sendFormAutoReply(formSubmission, emailSettings) {
  if (!emailSettings || !emailSettings.auto_reply_enabled) {
    console.log("[testing] Auto-reply emails disabled for form");
    return null;
  }
  if (!formSubmission.email) {
    console.log("[testing] No email address provided, skipping auto-reply");
    return null;
  }
  try {
    const templateData = {
      name: formSubmission.name || "",
      email: formSubmission.email || "",
      phone: formSubmission.phone || "",
      company: formSubmission.company || "",
      message: formSubmission.message || "",
      form_name: formSubmission.form_name || formSubmission.form_id || "Form"
    };
    const subject = replaceTemplatePlaceholders(
      emailSettings.auto_reply_subject || "Thank you for your submission",
      templateData
    );
    const template = emailSettings.auto_reply_template || "Thank you for contacting us. We will get back to you soon.";
    const textContent = replaceTemplatePlaceholders(template, templateData);
    const htmlContent = textToHtml(textContent);
    const fromEmail = emailSettings.from_email || SMTP_FROM_EMAIL;
    const fromName = emailSettings.from_name || "Team";
    const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;
    const emailData = {
      from,
      to: formSubmission.email,
      subject,
      html: htmlContent,
      text: textContent
    };
    const result = await sendEmailViaResend(emailData);
    console.log("[testing] Form auto-reply email sent successfully:", result.id);
    return result;
  } catch (error) {
    console.error("[testing] Error sending form auto-reply email:", error);
    throw error;
  }
}
async function processFormSubmissionEmails(formSubmission, formId) {
  try {
    const { getEmailSettingsByFormId: getEmailSettingsByFormId2 } = await Promise.resolve().then(() => (init_forms(), forms_exports));
    const emailSettings = await getEmailSettingsByFormId2(formId);
    if (!emailSettings) {
      console.log("[testing] No email settings found for form:", formId);
      return { notifications: null, autoReply: null };
    }
    const results = {
      notifications: null,
      autoReply: null
    };
    try {
      results.notifications = await sendFormNotificationEmails(formSubmission, emailSettings);
    } catch (error) {
      console.error("[testing] Failed to send notification emails (non-fatal):", error);
    }
    try {
      results.autoReply = await sendFormAutoReply(formSubmission, emailSettings);
    } catch (error) {
      console.error("[testing] Failed to send auto-reply email (non-fatal):", error);
    }
    return results;
  } catch (error) {
    console.error("[testing] Error processing form submission emails:", error);
    return { notifications: null, autoReply: null };
  }
}

// server/routes/forms.js
init_debugLogger();
var router4 = express5.Router();
router4.post("/form-submissions", async (req, res) => {
  try {
    const { form_id, form_name, name, email, phone, company, message, tenant_id } = req.body;
    const extractedTenantId = tenant_id || req.query.tenantId || req.headers["x-tenant-id"] || req.headers["X-Tenant-Id"] || req.tenantId;
    debugLog("Form submission received:", {
      form_id,
      name,
      email,
      tenant_id: extractedTenantId,
      tenant_id_sources: {
        body: tenant_id,
        query: req.query.tenantId,
        header: req.headers["x-tenant-id"] || req.headers["X-Tenant-Id"],
        middleware: req.tenantId
      }
    });
    const result = await saveFormSubmission({
      form_id,
      form_name,
      name,
      email,
      phone,
      company,
      message,
      tenant_id: extractedTenantId,
      ip_address: req.ip,
      user_agent: req.get("User-Agent")
    });
    const submission = result.submission;
    const extendedResult = result.extended;
    try {
      const nameParts = name.split(" ");
      const first_name = nameParts[0] || name;
      const last_name = nameParts.slice(1).join(" ") || null;
      await createContact({
        first_name,
        last_name,
        email,
        phone,
        company,
        source: form_name || form_id || "form",
        status: "new",
        notes: message ? `Form message: ${message}` : null
      }, extractedTenantId);
      debugLog("Contact created from form submission for tenant:", extractedTenantId);
    } catch (contactError) {
      debugError("Error creating contact from form:", contactError);
    }
    try {
      let formId = null;
      if (extendedResult && extendedResult.form) {
        formId = extendedResult.form.id;
        debugLog("Using form from extended result for email notifications:", {
          form_id,
          formId: extendedResult.form.id,
          form_name: extendedResult.form.name
        });
      } else if (form_id) {
        const form = await getFormById(form_id, extractedTenantId);
        if (form) {
          formId = form.id;
          debugLog("Found form for email notifications (fallback lookup):", {
            form_id,
            formId: form.id,
            form_name: form.name
          });
        } else {
          debugLog("Form not found by ID/name:", form_id);
        }
      }
      if (formId) {
        const formSubmission = {
          form_id,
          form_name,
          name,
          email,
          phone: phone || "",
          company: company || "",
          message: message || ""
        };
        processFormSubmissionEmails(formSubmission, formId).then((results) => {
          debugLog("Form submission emails processed:", {
            formId,
            notifications: results.notifications ? "sent" : "skipped",
            autoReply: results.autoReply ? "sent" : "skipped"
          });
        }).catch((error) => {
          debugError("Error processing form submission emails (non-fatal):", error);
        });
      } else {
        debugLog("No form ID found, skipping email notifications. form_id was:", form_id);
      }
    } catch (emailError) {
      debugError("Error setting up form submission emails (non-fatal):", emailError);
    }
    res.json({
      success: true,
      message: "Form submission saved successfully",
      id: submission.id
    });
  } catch (error) {
    debugError("Error saving form submission:", error);
    res.status(500).json({ error: "Failed to save form submission" });
  }
});
router4.get("/form-submissions/all", async (req, res) => {
  try {
    debugLog("Fetching all form submissions");
    const result = await query(`
      SELECT * FROM form_submissions 
      ORDER BY submitted_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    debugError("Error fetching all form submissions:", error);
    res.status(500).json({ error: "Failed to fetch form submissions" });
  }
});
router4.get("/form-submissions/:formId", async (req, res) => {
  try {
    const { formId } = req.params;
    debugLog("Fetching submissions for form:", formId);
    const submissions = await getFormSubmissions(formId);
    res.json(submissions);
  } catch (error) {
    debugError("Error fetching form submissions:", error);
    res.status(500).json({ error: "Failed to fetch form submissions" });
  }
});
router4.get("/forms", authenticateUser, async (req, res) => {
  try {
    let tenantId;
    if (req.user && !req.user.is_super_admin) {
      tenantId = req.user.tenant_id;
      if (!tenantId) {
        return res.status(403).json({ error: "Your account is not associated with a tenant" });
      }
    } else {
      tenantId = req.query.tenantId || req.headers["x-tenant-id"] || req.headers["X-Tenant-Id"] || req.tenantId || req.user?.tenant_id;
    }
    if (!tenantId) {
      debugError("No tenant ID found. req.tenantId:", req.tenantId, "req.user?.tenant_id:", req.user?.tenant_id, "headers:", req.headers["x-tenant-id"] || req.headers["X-Tenant-Id"], "query:", req.query.tenantId);
      return res.status(400).json({ error: "Tenant ID is required" });
    }
    debugLog("Fetching forms for tenant:", tenantId, "User is super admin:", req.user?.is_super_admin);
    const result = await query(
      `SELECT * FROM forms 
       WHERE LOWER(TRIM(tenant_id)) = LOWER(TRIM($1::text)) 
       ORDER BY created_at DESC`,
      [String(tenantId)]
    );
    const seenForms = /* @__PURE__ */ new Map();
    const deduplicatedForms = [];
    for (const form of result.rows) {
      const key = `${form.name.toLowerCase().trim()}_${form.tenant_id}`;
      if (!seenForms.has(key)) {
        seenForms.set(key, form);
        deduplicatedForms.push(form);
      } else {
        const existing = seenForms.get(key);
        const existingDate = new Date(existing.created_at);
        const currentDate = new Date(form.created_at);
        if (currentDate > existingDate) {
          const index = deduplicatedForms.indexOf(existing);
          if (index > -1) {
            deduplicatedForms[index] = form;
          }
          seenForms.set(key, form);
        }
      }
    }
    debugLog("Found", result.rows.length, "forms for tenant", tenantId, "- after deduplication:", deduplicatedForms.length);
    res.json(deduplicatedForms);
  } catch (error) {
    debugError("Error fetching forms:", error);
    res.status(500).json({ error: "Failed to fetch forms" });
  }
});
router4.get("/forms/:id", authenticateUser, async (req, res) => {
  try {
    const form = await getFormById(req.params.id);
    if (form) {
      res.json(form);
    } else {
      res.status(404).json({ error: "Form not found" });
    }
  } catch (error) {
    debugError("Error fetching form:", error);
    res.status(500).json({ error: "Failed to fetch form" });
  }
});
router4.post("/forms", authenticateUser, async (req, res) => {
  try {
    const { name, description, fields, settings, is_active } = req.body;
    let tenantId;
    if (req.user && !req.user.is_super_admin) {
      tenantId = req.user.tenant_id;
      if (!tenantId) {
        return res.status(403).json({ error: "Your account is not associated with a tenant" });
      }
    } else {
      tenantId = req.tenantId || req.user?.tenant_id || req.headers["x-tenant-id"] || req.body.tenantId;
    }
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required" });
    }
    const existingForm = await query(`
      SELECT * FROM forms 
      WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) 
      AND LOWER(TRIM(tenant_id)) = LOWER(TRIM($2))
      LIMIT 1
    `, [name, String(tenantId)]);
    if (existingForm.rows.length > 0) {
      return res.status(409).json({
        error: "A form with this name already exists for this tenant",
        existingForm: existingForm.rows[0]
      });
    }
    const result = await query(`
      INSERT INTO forms (name, description, fields, settings, is_active, tenant_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, description, JSON.stringify(fields || []), JSON.stringify(settings || {}), is_active ?? true, tenantId]);
    const newForm = result.rows[0];
    await query(`
      INSERT INTO email_settings (
        form_id, notification_enabled, notification_emails, notification_subject, 
        notification_template, auto_reply_enabled, auto_reply_subject, auto_reply_template, from_name
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      newForm.id,
      true,
      ["admin@gosg.com.sg"],
      `New ${newForm.name} Submission`,
      "You have received a new form submission.",
      false,
      "Thank you for your submission",
      "Thank you for contacting us. We will get back to you soon.",
      "GOSG Team"
    ]);
    res.json(newForm);
  } catch (error) {
    debugError("Error creating form:", error);
    res.status(500).json({ error: "Failed to create form" });
  }
});
router4.put("/forms/:id", authenticateUser, async (req, res) => {
  try {
    const { name, description, fields, settings, is_active } = req.body;
    let tenantId;
    if (req.user && !req.user.is_super_admin) {
      tenantId = req.user.tenant_id;
      if (!tenantId) {
        return res.status(403).json({ error: "Your account is not associated with a tenant" });
      }
    } else {
      tenantId = req.tenantId || req.user?.tenant_id || req.headers["x-tenant-id"] || req.body.tenantId;
    }
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required" });
    }
    const result = await query(`
      UPDATE forms 
      SET name = $1, description = $2, fields = $3, settings = $4, is_active = $5, updated_at = NOW()
      WHERE id = $6 AND LOWER(TRIM(tenant_id)) = LOWER(TRIM($7::text))
      RETURNING *
    `, [name, description, JSON.stringify(fields), JSON.stringify(settings), is_active, req.params.id, String(tenantId)]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Form not found" });
    }
  } catch (error) {
    debugError("Error updating form:", error);
    res.status(500).json({ error: "Failed to update form" });
  }
});
router4.delete("/forms/:id", authenticateUser, async (req, res) => {
  try {
    let tenantId;
    if (req.user && !req.user.is_super_admin) {
      tenantId = req.user.tenant_id;
      if (!tenantId) {
        return res.status(403).json({ error: "Your account is not associated with a tenant" });
      }
    } else {
      tenantId = req.tenantId || req.user?.tenant_id || req.headers["x-tenant-id"] || req.query.tenantId;
    }
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required" });
    }
    const result = await query(
      "DELETE FROM forms WHERE id = $1 AND LOWER(TRIM(tenant_id)) = LOWER(TRIM($2::text)) RETURNING *",
      [req.params.id, String(tenantId)]
    );
    if (result.rows.length > 0) {
      res.json({ success: true, message: "Form deleted successfully" });
    } else {
      res.status(404).json({ error: "Form not found" });
    }
  } catch (error) {
    debugError("Error deleting form:", error);
    res.status(500).json({ error: "Failed to delete form" });
  }
});
router4.get("/forms/:id/email-settings", async (req, res) => {
  try {
    const settings = await getEmailSettingsByFormId(req.params.id);
    if (settings) {
      res.json(settings);
    } else {
      res.status(404).json({ error: "Email settings not found" });
    }
  } catch (error) {
    debugError("Error fetching email settings:", error);
    res.status(500).json({ error: "Failed to fetch email settings" });
  }
});
router4.put("/forms/:id/email-settings", async (req, res) => {
  try {
    const {
      notification_enabled,
      notification_emails,
      notification_subject,
      notification_template,
      notification_from_email,
      auto_reply_enabled,
      auto_reply_subject,
      auto_reply_template,
      from_email,
      from_name
    } = req.body;
    const existing = await getEmailSettingsByFormId(req.params.id);
    let result;
    if (existing) {
      result = await query(`
        UPDATE email_settings 
        SET notification_enabled = $1, notification_emails = $2, notification_subject = $3,
            notification_template = $4, notification_from_email = $5, auto_reply_enabled = $6, 
            auto_reply_subject = $7, auto_reply_template = $8, from_email = $9, from_name = $10, updated_at = NOW()
        WHERE form_id = $11
        RETURNING *
      `, [
        notification_enabled,
        notification_emails,
        notification_subject,
        notification_template,
        notification_from_email,
        auto_reply_enabled,
        auto_reply_subject,
        auto_reply_template,
        from_email,
        from_name,
        req.params.id
      ]);
    } else {
      result = await query(`
        INSERT INTO email_settings (
          form_id, notification_enabled, notification_emails, notification_subject,
          notification_template, notification_from_email, auto_reply_enabled, auto_reply_subject, 
          auto_reply_template, from_email, from_name
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        req.params.id,
        notification_enabled,
        notification_emails,
        notification_subject,
        notification_template,
        notification_from_email,
        auto_reply_enabled,
        auto_reply_subject,
        auto_reply_template,
        from_email,
        from_name
      ]);
    }
    res.json(result.rows[0]);
  } catch (error) {
    debugError("Error updating email settings:", error);
    res.status(500).json({ error: "Failed to update email settings" });
  }
});
router4.get("/forms/:id/submissions", async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM form_submissions_extended 
      WHERE form_id = $1 
      ORDER BY submitted_at DESC 
      LIMIT 100
    `, [req.params.id]);
    res.json(result.rows);
  } catch (error) {
    debugError("Error fetching submissions:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});
router4.post("/forms/cleanup-duplicates", authenticateUser, async (req, res) => {
  try {
    let tenantId;
    if (req.user && !req.user.is_super_admin) {
      tenantId = req.user.tenant_id;
      if (!tenantId) {
        return res.status(403).json({ error: "Your account is not associated with a tenant" });
      }
    } else {
      tenantId = req.query.tenantId || req.headers["x-tenant-id"] || req.headers["X-Tenant-Id"] || req.tenantId || req.user?.tenant_id;
    }
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required" });
    }
    debugLog("Cleaning up duplicate forms for tenant:", tenantId);
    const duplicatesResult = await query(`
      SELECT 
        name,
        tenant_id,
        COUNT(*) as count,
        array_agg(id ORDER BY created_at DESC) as form_ids,
        array_agg(created_at ORDER BY created_at DESC) as created_dates
      FROM forms
      WHERE LOWER(TRIM(tenant_id)) = LOWER(TRIM($1::text))
      GROUP BY name, tenant_id
      HAVING COUNT(*) > 1
    `, [String(tenantId)]);
    let deletedCount = 0;
    const deletedFormIds = [];
    for (const duplicate of duplicatesResult.rows) {
      const formIds = duplicate.form_ids;
      const createdDates = duplicate.created_dates;
      const formToKeep = formIds[0];
      const formsToDelete = formIds.slice(1);
      debugLog(`Found ${formIds.length} duplicates for form "${duplicate.name}". Keeping form ${formToKeep}, deleting:`, formsToDelete);
      for (const formIdToDelete of formsToDelete) {
        await query(`
          UPDATE form_submissions_extended
          SET form_id = $1
          WHERE form_id = $2
        `, [formToKeep, formIdToDelete]);
        await query(`
          UPDATE form_submissions
          SET form_id = $1
          WHERE form_id = $2
        `, [formToKeep, formIdToDelete]);
        await query(`
          DELETE FROM email_settings
          WHERE form_id = $1
        `, [formIdToDelete]);
        await query(`
          DELETE FROM forms
          WHERE id = $1
        `, [formIdToDelete]);
        deletedFormIds.push(formIdToDelete);
        deletedCount++;
      }
    }
    debugLog("Cleanup complete. Deleted", deletedCount, "duplicate forms");
    res.json({
      success: true,
      message: `Cleaned up ${deletedCount} duplicate forms`,
      deletedCount,
      deletedFormIds
    });
  } catch (error) {
    debugError("Error cleaning up duplicate forms:", error);
    res.status(500).json({ error: "Failed to clean up duplicate forms" });
  }
});
var forms_default = router4;

// server/routes/crm.js
import express6 from "express";
init_db();
var router5 = express6.Router();
router5.get("/contacts", authenticateUser, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search || "";
    const tenantId = req.tenantId || req.user.tenant_id;
    console.log("[testing] API: Getting contacts", { limit, offset, search, tenantId });
    const result = await getContacts(limit, offset, search, tenantId);
    res.json(result);
  } catch (error) {
    console.error("[testing] API: Error getting contacts:", error);
    res.status(500).json({ error: "Failed to get contacts" });
  }
});
router5.get("/contacts/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || req.user.tenant_id;
    console.log("[testing] API: Getting contact:", id, "for tenant:", tenantId);
    const contact = await getContact(id, tenantId);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.json(contact);
  } catch (error) {
    console.error("[testing] API: Error getting contact:", error);
    res.status(500).json({ error: "Failed to get contact" });
  }
});
router5.post("/contacts", authenticateUser, async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user.tenant_id;
    console.log("[testing] API: Creating contact:", req.body, "for tenant:", tenantId);
    const contact = await createContact(req.body, tenantId);
    res.json({ success: true, contact });
  } catch (error) {
    console.error("[testing] API: Error creating contact:", error);
    res.status(500).json({ error: "Failed to create contact" });
  }
});
router5.put("/contacts/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || req.user.tenant_id;
    const existingContact = await getContact(id, tenantId);
    if (!existingContact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    console.log("[testing] API: Updating contact:", id, req.body, "for tenant:", tenantId);
    const contact = await updateContact(id, req.body);
    res.json({ success: true, contact });
  } catch (error) {
    console.error("[testing] API: Error updating contact:", error);
    res.status(500).json({ error: "Failed to update contact" });
  }
});
router5.delete("/contacts/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || req.user.tenant_id;
    const existingContact = await getContact(id, tenantId);
    if (!existingContact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    console.log("[testing] API: Deleting contact:", id, "for tenant:", tenantId);
    await deleteContact(id);
    res.json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    console.error("[testing] API: Error deleting contact:", error);
    res.status(500).json({ error: "Failed to delete contact" });
  }
});
var crm_default = router5;

// server/routes/settings.js
import express7 from "express";
init_db();

// sparti-cms/services/languageManagementService.js
init_db();
init_googleTranslationService();
var addLanguage = async (languageCode, tenantId) => {
  console.log(`[testing] Adding language ${languageCode} for tenant ${tenantId}`);
  try {
    const currentLanguagesResult = await query(`
      SELECT setting_value 
      FROM site_settings 
      WHERE setting_key = 'site_content_languages' 
      AND tenant_id = $1
    `, [tenantId]);
    let currentLanguages = [];
    if (currentLanguagesResult.rows.length > 0 && currentLanguagesResult.rows[0].setting_value) {
      const rawValue = currentLanguagesResult.rows[0].setting_value;
      console.log(`[testing] Raw site_content_languages value: "${rawValue}"`);
      if (rawValue.includes(",")) {
        currentLanguages = rawValue.split(",").filter((lang) => lang.trim() !== "");
      } else if (rawValue.trim() !== "") {
        currentLanguages = [rawValue.trim()];
      }
      if (currentLanguages.length === 0 || currentLanguages.some((lang) => !lang)) {
        currentLanguages = [];
      }
      console.log(`[testing] Parsed currentLanguages array:`, currentLanguages);
    }
    if (currentLanguages.includes(languageCode)) {
      console.log(`[testing] Language ${languageCode} already exists for tenant ${tenantId}`);
      return { success: false, message: `Language ${languageCode} already exists` };
    }
    const defaultLanguageResult = await query(`
      SELECT setting_value 
      FROM site_settings 
      WHERE setting_key = 'site_language' 
      AND tenant_id = $1
    `, [tenantId]);
    const defaultLanguage = defaultLanguageResult.rows.length > 0 ? defaultLanguageResult.rows[0].setting_value : "en";
    console.log(`[testing] Default language: ${defaultLanguage}`);
    if (languageCode === defaultLanguage) {
      console.log(`[testing] Cannot add default language ${languageCode} as an additional language`);
      return { success: false, message: `Cannot add default language as an additional language` };
    }
    if (!currentLanguages.includes(defaultLanguage)) {
      console.log(`[testing] Adding default language ${defaultLanguage} to currentLanguages`);
      currentLanguages.push(defaultLanguage);
    }
    if (!currentLanguages.includes(defaultLanguage)) {
      console.log(`[testing] CRITICAL: Default language ${defaultLanguage} still not in array, forcing it in`);
      currentLanguages = [defaultLanguage, ...currentLanguages];
    }
    console.log(`[testing] Before adding new language, currentLanguages:`, currentLanguages);
    currentLanguages.push(languageCode);
    console.log(`[testing] After adding new language, currentLanguages:`, currentLanguages);
    const newLanguages = currentLanguages.join(",");
    console.log(`[testing] New languages string to save: "${newLanguages}"`);
    await query(`
      INSERT INTO site_settings (setting_key, setting_value, setting_type, setting_category, is_public, tenant_id)
      VALUES ('site_content_languages', $1, 'text', 'localization', true, $2)
      ON CONFLICT (setting_key, tenant_id) 
      DO UPDATE SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
    `, [newLanguages, tenantId]);
    console.log(`[testing] Updated site_content_languages to ${newLanguages} for tenant ${tenantId}`);
    await processPageTranslations(languageCode, tenantId);
    return { success: true, message: `Language ${languageCode} added successfully` };
  } catch (error) {
    console.error(`[testing] Error adding language ${languageCode} for tenant ${tenantId}:`, error);
    return { success: false, message: error.message };
  }
};
var removeLanguage = async (languageCode, tenantId) => {
  console.log(`[testing] Removing language ${languageCode} for tenant ${tenantId}`);
  try {
    const currentLanguagesResult = await query(`
      SELECT setting_value 
      FROM site_settings 
      WHERE setting_key = 'site_content_languages' 
      AND tenant_id = $1
    `, [tenantId]);
    let currentLanguages = [];
    if (currentLanguagesResult.rows.length > 0 && currentLanguagesResult.rows[0].setting_value) {
      const rawValue = currentLanguagesResult.rows[0].setting_value;
      console.log(`[testing] Raw site_content_languages value: "${rawValue}"`);
      if (rawValue.includes(",")) {
        currentLanguages = rawValue.split(",").filter((lang) => lang.trim() !== "");
      } else if (rawValue.trim() !== "") {
        currentLanguages = [rawValue.trim()];
      }
      if (currentLanguages.length === 0 || currentLanguages.some((lang) => !lang)) {
        currentLanguages = [];
      }
      console.log(`[testing] Parsed currentLanguages array:`, currentLanguages);
    }
    if (!currentLanguages.includes(languageCode)) {
      console.log(`[testing] Language ${languageCode} does not exist for tenant ${tenantId}`);
      return { success: false, message: `Language ${languageCode} does not exist` };
    }
    const defaultLanguageResult = await query(`
      SELECT setting_value 
      FROM site_settings 
      WHERE setting_key = 'site_language' 
      AND tenant_id = $1
    `, [tenantId]);
    const defaultLanguage = defaultLanguageResult.rows.length > 0 ? defaultLanguageResult.rows[0].setting_value : "en";
    if (languageCode === defaultLanguage) {
      console.log(`[testing] Cannot remove default language ${languageCode}`);
      return { success: false, message: `Cannot remove default language` };
    }
    console.log(`[testing] Before removing language, currentLanguages:`, currentLanguages);
    const newLanguages = currentLanguages.filter((lang) => lang !== languageCode).join(",");
    console.log(`[testing] New languages string to save: "${newLanguages}"`);
    await query(`
      UPDATE site_settings 
      SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
      WHERE setting_key = 'site_content_languages' 
      AND tenant_id = $2
    `, [newLanguages, tenantId]);
    console.log(`[testing] Updated site_content_languages to ${newLanguages} for tenant ${tenantId}`);
    const deleteResult = await query(`
      DELETE FROM page_layouts
      WHERE language = $1
      AND page_id IN (
        SELECT id FROM pages WHERE tenant_id = $2
      )
    `, [languageCode, tenantId]);
    console.log(`[testing] Deleted ${deleteResult.rowCount} page layouts for language ${languageCode}`);
    return { success: true, message: `Language ${languageCode} removed successfully` };
  } catch (error) {
    console.error(`[testing] Error removing language ${languageCode} for tenant ${tenantId}:`, error);
    return { success: false, message: error.message };
  }
};
var setDefaultLanguage = async (languageCode, tenantId, fromAdditionalLanguages) => {
  console.log(`[testing] Setting default language to ${languageCode} for tenant ${tenantId} (from additional languages: ${fromAdditionalLanguages})`);
  try {
    const currentDefaultResult = await query(`
      SELECT setting_value 
      FROM site_settings 
      WHERE setting_key = 'site_language' 
      AND tenant_id = $1
    `, [tenantId]);
    const currentDefault = currentDefaultResult.rows.length > 0 ? currentDefaultResult.rows[0].setting_value : "en";
    if (currentDefault === languageCode) {
      console.log(`[testing] Language ${languageCode} is already the default for tenant ${tenantId}`);
      return { success: true, message: `Language ${languageCode} is already the default` };
    }
    if (fromAdditionalLanguages) {
      await setDefaultFromAdditionalLanguages(languageCode, tenantId, currentDefault);
    } else {
      await setDefaultFromChangeDefault(languageCode, tenantId, currentDefault);
    }
    return { success: true, message: `Default language set to ${languageCode} successfully` };
  } catch (error) {
    console.error(`[testing] Error setting default language to ${languageCode} for tenant ${tenantId}:`, error);
    return { success: false, message: error.message };
  }
};
var setDefaultFromAdditionalLanguages = async (languageCode, tenantId, currentDefault) => {
  console.log(`[testing] Setting default from additional languages: ${languageCode} for tenant ${tenantId}`);
  await query(`
    INSERT INTO site_settings (setting_key, setting_value, setting_type, setting_category, is_public, tenant_id)
    VALUES ('site_language', $1, 'text', 'localization', true, $2)
    ON CONFLICT (setting_key, tenant_id) 
    DO UPDATE SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
  `, [languageCode, tenantId]);
  console.log(`[testing] Updated site_language to ${languageCode} for tenant ${tenantId}`);
  const currentLanguagesResult = await query(`
    SELECT setting_value 
    FROM site_settings 
    WHERE setting_key = 'site_content_languages' 
    AND tenant_id = $1
  `, [tenantId]);
  let currentLanguages = [];
  if (currentLanguagesResult.rows.length > 0 && currentLanguagesResult.rows[0].setting_value) {
    const rawValue = currentLanguagesResult.rows[0].setting_value;
    console.log(`[testing] Raw site_content_languages value: "${rawValue}"`);
    if (rawValue.includes(",")) {
      currentLanguages = rawValue.split(",").filter((lang) => lang.trim() !== "");
    } else if (rawValue.trim() !== "") {
      currentLanguages = [rawValue.trim()];
    }
    console.log(`[testing] Parsed currentLanguages array:`, currentLanguages);
  }
  const filteredLanguages = currentLanguages.filter((lang) => lang !== languageCode);
  console.log(`[testing] After removing new default, filteredLanguages:`, filteredLanguages);
  if (!filteredLanguages.includes(currentDefault)) {
    console.log(`[testing] Adding old default language ${currentDefault} to filteredLanguages`);
    filteredLanguages.push(currentDefault);
  }
  const newAdditionalLanguages = filteredLanguages.join(",");
  console.log(`[testing] New additional languages string to save: "${newAdditionalLanguages}"`);
  await query(`
    UPDATE site_settings 
    SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
    WHERE setting_key = 'site_content_languages' 
    AND tenant_id = $2
  `, [newAdditionalLanguages, tenantId]);
  console.log(`[testing] Updated site_content_languages to ${newAdditionalLanguages} for tenant ${tenantId}`);
  const pagesResult = await query(`
    SELECT id FROM pages WHERE tenant_id = $1
  `, [tenantId]);
  for (const page of pagesResult.rows) {
    const pageId = page.id;
    await query(`
      UPDATE page_layouts
      SET is_default = false
      WHERE page_id = $1
      AND is_default = true
    `, [pageId]);
    await query(`
      UPDATE page_layouts
      SET is_default = true
      WHERE page_id = $1
      AND language = $2
    `, [pageId, languageCode]);
    console.log(`[testing] Updated is_default flags for page ${pageId}`);
  }
};
var setDefaultFromChangeDefault = async (languageCode, tenantId, currentDefault) => {
  console.log(`[testing] Setting default from change default: ${languageCode} for tenant ${tenantId}`);
  const pagesResult = await query(`
    SELECT id FROM pages WHERE tenant_id = $1
  `, [tenantId]);
  let allTranslationsExist = true;
  const pagesToTranslate = [];
  for (const page of pagesResult.rows) {
    const pageId = page.id;
    const translationResult = await query(`
      SELECT id FROM page_layouts
      WHERE page_id = $1
      AND language = $2
    `, [pageId, languageCode]);
    if (translationResult.rows.length === 0) {
      allTranslationsExist = false;
      pagesToTranslate.push(pageId);
    }
  }
  if (allTranslationsExist) {
    await setDefaultFromAdditionalLanguages(languageCode, tenantId, currentDefault);
  } else {
    await query(`
      INSERT INTO site_settings (setting_key, setting_value, setting_type, setting_category, is_public, tenant_id)
      VALUES ('site_language', $1, 'text', 'localization', true, $2)
      ON CONFLICT (setting_key, tenant_id) 
      DO UPDATE SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
    `, [languageCode, tenantId]);
    console.log(`[testing] Updated site_language to ${languageCode} for tenant ${tenantId}`);
    const currentLanguagesResult = await query(`
      SELECT setting_value 
      FROM site_settings 
      WHERE setting_key = 'site_content_languages' 
      AND tenant_id = $1
    `, [tenantId]);
    let currentLanguages = [];
    if (currentLanguagesResult.rows.length > 0 && currentLanguagesResult.rows[0].setting_value) {
      const rawValue = currentLanguagesResult.rows[0].setting_value;
      console.log(`[testing] Raw site_content_languages value: "${rawValue}"`);
      if (rawValue.includes(",")) {
        currentLanguages = rawValue.split(",").filter((lang) => lang.trim() !== "");
      } else if (rawValue.trim() !== "") {
        currentLanguages = [rawValue.trim()];
      }
      if (currentLanguages.length === 0 || currentLanguages.some((lang) => !lang)) {
        currentLanguages = [];
      }
      console.log(`[testing] Parsed currentLanguages array:`, currentLanguages);
    }
    if (!currentLanguages.includes(currentDefault)) {
      console.log(`[testing] Adding old default language ${currentDefault} to currentLanguages`);
      currentLanguages.push(currentDefault);
    }
    const filteredLanguages = currentLanguages.filter((lang) => lang !== languageCode);
    console.log(`[testing] After removing new default, filteredLanguages:`, filteredLanguages);
    const newAdditionalLanguages = filteredLanguages.join(",");
    console.log(`[testing] New additional languages string to save: "${newAdditionalLanguages}"`);
    await query(`
      UPDATE site_settings 
      SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
      WHERE setting_key = 'site_content_languages' 
      AND tenant_id = $2
    `, [newAdditionalLanguages, tenantId]);
    console.log(`[testing] Updated site_content_languages to ${newAdditionalLanguages} for tenant ${tenantId}`);
    for (const pageId of pagesToTranslate) {
      const defaultLayoutResult = await query(`
        SELECT layout_json, version
        FROM page_layouts
        WHERE page_id = $1
        AND is_default = true
      `, [pageId]);
      if (defaultLayoutResult.rows.length === 0) {
        console.log(`[testing] No default layout found for page ${pageId}, skipping`);
        continue;
      }
      const defaultLayout = defaultLayoutResult.rows[0];
      const layoutJson = defaultLayout.layout_json;
      const version2 = defaultLayout.version;
      await query(`
        UPDATE page_layouts
        SET is_default = false
        WHERE page_id = $1
        AND is_default = true
      `, [pageId]);
      await query(`
        INSERT INTO page_layouts (page_id, language, layout_json, version, is_default)
        VALUES ($1, $2, $3, $4, true)
      `, [pageId, languageCode, layoutJson, version2]);
      console.log(`[testing] Created new layout for page ${pageId} with language ${languageCode}`);
    }
  }
};
var processPageTranslations = async (languageCode, tenantId) => {
  console.log(`[testing] Processing page translations for language ${languageCode} and tenant ${tenantId}`);
  try {
    const pagesResult = await query(`
      SELECT id FROM pages WHERE tenant_id = $1
    `, [tenantId]);
    console.log(`[testing] Found ${pagesResult.rows.length} pages for tenant ${tenantId}`);
    for (const page of pagesResult.rows) {
      const pageId = page.id;
      const defaultLayoutResult = await query(`
        SELECT layout_json, version
        FROM page_layouts
        WHERE page_id = $1
        AND is_default = true
      `, [pageId]);
      if (defaultLayoutResult.rows.length === 0) {
        console.log(`[testing] No default layout found for page ${pageId}, skipping`);
        continue;
      }
      const defaultLayout = defaultLayoutResult.rows[0];
      const layoutJson = defaultLayout.layout_json;
      const version2 = defaultLayout.version;
      const existingTranslationResult = await query(`
        SELECT id FROM page_layouts
        WHERE page_id = $1
        AND language = $2
      `, [pageId, languageCode]);
      if (existingTranslationResult.rows.length > 0) {
        console.log(`[testing] Translation already exists for page ${pageId} and language ${languageCode}, skipping`);
        continue;
      }
      await query(`
        INSERT INTO page_layouts (page_id, language, layout_json, version, is_default)
        VALUES ($1, $2, $3, $4, false)
      `, [pageId, languageCode, layoutJson, version2]);
      console.log(`[testing] Created new layout for page ${pageId} with language ${languageCode}`);
    }
  } catch (error) {
    console.error(`[testing] Error processing page translations:`, error);
    throw error;
  }
};
var languageManagementService_default = {
  addLanguage,
  removeLanguage,
  setDefaultLanguage
};

// server/routes/settings.js
var router6 = express7.Router();
router6.get("/branding", authenticateUser, async (req, res) => {
  try {
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || "tenant-gosg";
    const themeId = req.themeSlug || req.query.themeId || null;
    console.log(`[testing] API: Getting branding settings for tenant: ${tenantId}, theme: ${themeId}`);
    const settings = await getBrandingSettings(tenantId, themeId);
    res.json(settings);
  } catch (error) {
    console.error("[testing] API: Error getting branding settings:", error);
    res.status(500).json({ error: "Failed to get branding settings" });
  }
});
router6.post("/branding", authenticateUser, async (req, res) => {
  try {
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || "tenant-gosg";
    const themeId = req.themeSlug || req.query.themeId || req.body.themeId || null;
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required to update branding settings" });
    }
    console.log(`[testing] API: Updating branding settings for tenant: ${tenantId}, theme: ${themeId}`, req.body);
    const { query: query2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const tenantCheck = await query2(`
      SELECT id FROM tenants WHERE id = $1
    `, [tenantId]);
    if (tenantCheck.rows.length === 0) {
      return res.status(404).json({ error: `Tenant '${tenantId}' not found` });
    }
    await updateMultipleBrandingSettings(req.body, tenantId, themeId);
    try {
      invalidateAll();
    } catch (e) {
    }
    res.json({ success: true, message: "Branding settings updated successfully" });
  } catch (error) {
    console.error("[testing] API: Error updating branding settings:", error);
    console.error("[testing] Error details:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
      stack: error.stack
    });
    if (error.message && (error.message.includes("master") || error.message.includes("Tenant ID is required"))) {
      return res.status(403).json({ error: error.message });
    }
    let errorMessage = error.message || "Failed to update branding settings";
    if (error.code === "23505" || error.constraint) {
      errorMessage = `Database constraint violation: ${error.detail || errorMessage}. This may indicate a duplicate setting.`;
    }
    res.status(500).json({
      error: errorMessage,
      code: error.code,
      constraint: error.constraint
    });
  }
});
router6.post("/language/add", authenticateUser, async (req, res) => {
  try {
    const { languageCode } = req.body;
    if (!languageCode) {
      return res.status(400).json({ success: false, message: "Language code is required" });
    }
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || "tenant-gosg";
    console.log(`[testing] API: Adding language ${languageCode} for tenant: ${tenantId}`);
    const result = await languageManagementService_default.addLanguage(languageCode, tenantId);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("[testing] API: Error adding language:", error);
    res.status(500).json({ success: false, message: "Failed to add language" });
  }
});
router6.post("/language/remove", authenticateUser, async (req, res) => {
  try {
    const { languageCode } = req.body;
    if (!languageCode) {
      return res.status(400).json({ success: false, message: "Language code is required" });
    }
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || "tenant-gosg";
    console.log(`[testing] API: Removing language ${languageCode} for tenant: ${tenantId}`);
    const result = await languageManagementService_default.removeLanguage(languageCode, tenantId);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("[testing] API: Error removing language:", error);
    res.status(500).json({ success: false, message: "Failed to remove language" });
  }
});
router6.post("/language/set-default", authenticateUser, async (req, res) => {
  try {
    const { languageCode, fromAdditionalLanguages } = req.body;
    if (!languageCode) {
      return res.status(400).json({ success: false, message: "Language code is required" });
    }
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || "tenant-gosg";
    console.log(`[testing] API: Setting default language ${languageCode} for tenant: ${tenantId}`);
    const result = await languageManagementService_default.setDefaultLanguage(
      languageCode,
      tenantId,
      fromAdditionalLanguages === true
    );
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("[testing] API: Error setting default language:", error);
    res.status(500).json({ success: false, message: "Failed to set default language" });
  }
});
router6.get("/site-settings/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || "tenant-gosg";
    const themeId = req.query.themeId || null;
    console.log(`[testing] API: Getting site setting for key: ${key}, tenant: ${tenantId}, theme: ${themeId}`);
    const setting = await getSiteSettingByKey(key, tenantId, themeId);
    if (!setting) {
      return res.status(404).json({ error: "Setting not found" });
    }
    console.log(`[testing] Found site setting:`, setting);
    res.json(setting);
  } catch (error) {
    console.error(`[testing] API: Error getting site setting for key ${req.params.key}:`, error);
    res.status(500).json({ error: "Failed to get site setting" });
  }
});
router6.get("/site-settings-by-tenant/:tenantId", async (req, res) => {
  try {
    const { tenantId } = req.params;
    console.log(`[testing] API: Getting all site settings for tenant: ${tenantId}`);
    const settings = await getsitesettingsbytenant(tenantId);
    console.log(`[testing] Found ${settings.length} site settings for tenant ${tenantId}`);
    res.json(settings);
  } catch (error) {
    console.error(`[testing] API: Error getting site settings for tenant ${req.params.tenantId}:`, error);
    res.status(500).json({ error: "Failed to get site settings for tenant" });
  }
});
router6.get("/tenant-gosg-settings", async (req, res) => {
  try {
    console.log("[testing] API: Getting all site settings for tenant-gosg");
    const settings = await getsitesettingsbytenant("tenant-gosg");
    console.log(`[testing] Found ${settings.length} site settings for tenant-gosg`);
    res.json(settings);
  } catch (error) {
    console.error("[testing] API: Error getting site settings for tenant-gosg:", error);
    res.status(500).json({ error: "Failed to get site settings for tenant-gosg" });
  }
});
router6.put("/site-settings/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { setting_value, setting_type, setting_category, themeId } = req.body;
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || "tenant-gosg";
    const theme_id = themeId || req.query.themeId || null;
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required to update settings" });
    }
    console.log(`[testing] API: Updating site setting for key: ${key}, tenant: ${tenantId}, theme: ${theme_id}`, req.body);
    const result = await updateSiteSettingByKey(
      key,
      setting_value,
      setting_type || "text",
      setting_category || "general",
      tenantId,
      theme_id
    );
    res.json(result);
  } catch (error) {
    console.error(`[testing] API: Error updating site setting for key ${req.params.key}:`, error);
    if (error.message && (error.message.includes("master") || error.message.includes("Tenant ID is required"))) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || "Failed to update site setting" });
  }
});
router6.get("/theme/:themeId", authenticateUser, async (req, res) => {
  try {
    const { themeId } = req.params;
    const tenantId = req.query.tenantId || req.user?.tenant_id || "tenant-gosg";
    console.log(`[testing] API: Getting all settings for tenant: ${tenantId}, theme: ${themeId}`);
    const settings = await getThemeSettings(tenantId, themeId);
    res.json(settings);
  } catch (error) {
    console.error(`[testing] API: Error getting theme settings:`, error);
    res.status(500).json({ error: "Failed to get theme settings" });
  }
});
router6.get("/theme/:themeId/branding", authenticateUser, async (req, res) => {
  try {
    const { themeId } = req.params;
    const tenantId = req.query.tenantId || req.user?.tenant_id || "tenant-gosg";
    console.log(`[testing] API: Getting branding settings for tenant: ${tenantId}, theme: ${themeId}`);
    const settings = await getBrandingSettings(tenantId, themeId);
    res.json(settings.branding || {});
  } catch (error) {
    console.error(`[testing] API: Error getting theme branding:`, error);
    res.status(500).json({ error: "Failed to get theme branding" });
  }
});
router6.get("/theme/:themeId/localization", authenticateUser, async (req, res) => {
  try {
    const { themeId } = req.params;
    const tenantId = req.query.tenantId || req.user?.tenant_id || "tenant-gosg";
    console.log(`[testing] API: Getting localization settings for tenant: ${tenantId}, theme: ${themeId}`);
    const settings = await getBrandingSettings(tenantId, themeId);
    res.json(settings.localization || {});
  } catch (error) {
    console.error(`[testing] API: Error getting theme localization:`, error);
    res.status(500).json({ error: "Failed to get theme localization" });
  }
});
router6.get("/theme/:themeId/styles", authenticateUser, async (req, res) => {
  try {
    const { themeId } = req.params;
    const tenantId = req.query.tenantId || req.user?.tenant_id || "tenant-gosg";
    console.log(`[testing] API: Getting style settings for tenant: ${tenantId}, theme: ${themeId}`);
    const setting = await getSiteSettingByKey("theme_styles", tenantId, themeId);
    if (setting && setting.setting_value) {
      try {
        const styles = typeof setting.setting_value === "string" ? JSON.parse(setting.setting_value) : setting.setting_value;
        res.json(styles);
      } catch (e) {
        res.json({});
      }
    } else {
      res.json({});
    }
  } catch (error) {
    console.error(`[testing] API: Error getting theme styles:`, error);
    res.status(500).json({ error: "Failed to get theme styles" });
  }
});
router6.put("/theme/:themeId/:key", authenticateUser, async (req, res) => {
  try {
    const { themeId, key } = req.params;
    const { setting_value, setting_type, setting_category } = req.body;
    const tenantId = req.query.tenantId || req.user?.tenant_id || "tenant-gosg";
    console.log(`[testing] API: Updating setting ${key} for tenant: ${tenantId}, theme: ${themeId}`, {
      setting_type,
      setting_category,
      valueLength: setting_value?.length
    });
    try {
      const result = await updateSiteSettingByKey(
        key,
        setting_value,
        setting_type || "text",
        setting_category || "general",
        tenantId,
        themeId
      );
      console.log(`[testing] API: Successfully updated setting ${key}`, {
        id: result?.id,
        hasValue: !!result?.setting_value
      });
      res.json(result);
    } catch (dbError) {
      console.error(`[testing] API: Database error updating setting ${key}:`, dbError);
      if (dbError.message?.includes("column") || dbError.message?.includes("does not exist")) {
        res.status(500).json({
          error: "Database schema error",
          message: "The site_settings table is missing required columns. Please run the migration: sparti-cms/db/migrations/create-site-settings-schema.sql",
          details: dbError.message,
          migrationFile: "sparti-cms/db/migrations/create-site-settings-schema.sql"
        });
      } else {
        res.status(500).json({
          error: "Failed to update theme setting",
          message: dbError.message || "Unknown database error",
          details: process.env.NODE_ENV === "development" ? dbError.stack : void 0
        });
      }
    }
  } catch (error) {
    console.error(`[testing] API: Error updating theme setting:`, error);
    res.status(500).json({
      error: "Failed to update theme setting",
      message: error.message || "Unknown error",
      details: process.env.NODE_ENV === "development" ? error.stack : void 0
    });
  }
});
router6.post("/theme/:themeId/sync", authenticateUser, async (req, res) => {
  try {
    const { themeId } = req.params;
    const tenantId = req.query.tenantId || req.user?.tenant_id || "tenant-gosg";
    console.log(`[testing] API: Syncing settings for tenant: ${tenantId}, theme: ${themeId}`);
    res.json({
      success: true,
      message: "Settings sync initiated (database integration complete, file sync coming soon)",
      tenantId,
      themeId
    });
  } catch (error) {
    console.error(`[testing] API: Error syncing theme settings:`, error);
    res.status(500).json({ error: "Failed to sync theme settings" });
  }
});
router6.get("/custom-code", async (req, res) => {
  try {
    const tenantId = req.query.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: "tenantId query parameter is required" });
    }
    console.log(`[testing] API: Getting custom code settings for tenant: ${tenantId}`);
    const settings = await getCustomCodeSettings(tenantId);
    res.json(settings);
  } catch (error) {
    console.error("[testing] API: Error getting custom code settings:", error);
    res.status(500).json({ error: "Failed to get custom code settings" });
  }
});
router6.get("/custom-code/auth", authenticateUser, async (req, res) => {
  try {
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || "tenant-gosg";
    console.log(`[testing] API: Getting custom code settings for tenant: ${tenantId}`);
    const settings = await getCustomCodeSettings(tenantId);
    res.json(settings);
  } catch (error) {
    console.error("[testing] API: Error getting custom code settings:", error);
    res.status(500).json({ error: "Failed to get custom code settings" });
  }
});
router6.post("/custom-code", authenticateUser, async (req, res) => {
  try {
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || "tenant-gosg";
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required to update custom code settings" });
    }
    console.log(`[testing] API: Updating custom code settings for tenant: ${tenantId}`, req.body);
    const { query: query2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const tenantCheck = await query2(`
      SELECT id FROM tenants WHERE id = $1
    `, [tenantId]);
    if (tenantCheck.rows.length === 0) {
      return res.status(404).json({ error: `Tenant '${tenantId}' not found` });
    }
    await updateCustomCodeSettings(req.body, tenantId);
    try {
      invalidateAll();
    } catch (e) {
    }
    res.json({ success: true, message: "Custom code settings updated successfully" });
  } catch (error) {
    console.error("[testing] API: Error updating custom code settings:", error);
    console.error("[testing] Error details:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
      stack: error.stack
    });
    if (error.message && error.message.includes("Tenant ID is required")) {
      return res.status(403).json({ error: error.message });
    }
    let errorMessage = error.message || "Failed to update custom code settings";
    if (error.code === "23505" || error.constraint) {
      errorMessage = `Database constraint violation: ${error.detail || errorMessage}. This may indicate a duplicate setting.`;
    }
    res.status(500).json({
      error: errorMessage,
      code: error.code,
      constraint: error.constraint
    });
  }
});
router6.get("/site-schemas/:schemaKey", authenticateUser, async (req, res) => {
  try {
    const { schemaKey } = req.params;
    const tenantId = req.headers["x-tenant-id"];
    const language = req.query.language || "default";
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required" });
    }
    const { getSiteSchema: getSiteSchema2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const schema = await getSiteSchema2(schemaKey, tenantId, language);
    if (!schema) {
      return res.status(404).json({ error: "Schema not found" });
    }
    res.json({ success: true, schema, language });
  } catch (error) {
    console.error("[testing] Error fetching site schema:", error);
    res.status(500).json({ error: "Failed to fetch site schema" });
  }
});
router6.put("/site-schemas/:schemaKey", authenticateUser, async (req, res) => {
  try {
    const { schemaKey } = req.params;
    const { schema, language } = req.body;
    const tenantId = req.headers["x-tenant-id"];
    const schemaLanguage = language || "default";
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required" });
    }
    if (!schema) {
      return res.status(400).json({ error: "Schema data is required" });
    }
    const { updateSiteSchema: updateSiteSchema2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    await updateSiteSchema2(schemaKey, schema, tenantId, schemaLanguage);
    res.json({ success: true, message: "Schema updated successfully", language: schemaLanguage });
  } catch (error) {
    console.error("[testing] Error updating site schema:", error);
    res.status(500).json({ error: "Failed to update site schema" });
  }
});
var settings_default = router6;

// server/routes/seo.js
init_db();
import express8 from "express";

// sparti-cms/db/seo-management.js
init_db();
init_branding();
async function createRedirect(redirectData, tenantId = null) {
  try {
    if (!tenantId && !redirectData.tenant_id) {
      throw new Error("Tenant ID is required to create redirects. Master redirects (tenant_id = NULL) should be created via admin interface.");
    }
    const finalTenantId = redirectData.tenant_id || tenantId;
    const result = await query(`
      INSERT INTO redirects (old_url, new_url, redirect_type, status, notes, created_by, tenant_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      redirectData.old_url,
      redirectData.new_url,
      redirectData.redirect_type || 301,
      redirectData.status || "active",
      redirectData.notes || "",
      redirectData.created_by || "admin",
      finalTenantId
    ]);
    console.log("[testing] Redirect created:", result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error("[testing] Error creating redirect:", error);
    throw error;
  }
}
async function getRedirects(filters = {}, tenantId = null) {
  try {
    let whereClause = "WHERE 1=1";
    let params = [];
    let paramCount = 0;
    if (tenantId) {
      whereClause += ` AND (tenant_id = $${++paramCount} OR tenant_id IS NULL)`;
      params.push(tenantId);
    }
    if (filters.status) {
      whereClause += ` AND status = $${++paramCount}`;
      params.push(filters.status);
    }
    if (filters.search) {
      whereClause += ` AND (old_url ILIKE $${++paramCount} OR new_url ILIKE $${++paramCount})`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
      paramCount++;
    }
    if (tenantId) {
      whereClause += ` ORDER BY CASE WHEN tenant_id = $${++paramCount} THEN 0 ELSE 1 END, hits DESC, created_at DESC`;
      params.push(tenantId);
    } else {
      whereClause += ` ORDER BY hits DESC, created_at DESC`;
    }
    const result = await query(`
      SELECT * FROM redirects
      ${whereClause}
    `, params);
    return result.rows;
  } catch (error) {
    console.error("[testing] Error fetching redirects:", error);
    throw error;
  }
}
async function updateRedirect(redirectId, redirectData, tenantId = null) {
  try {
    let whereClause = "WHERE id = $1";
    let params = [redirectId];
    if (tenantId) {
      whereClause += ` AND tenant_id = $2`;
      params.push(tenantId);
    } else {
      const checkResult = await query(`SELECT tenant_id FROM redirects WHERE id = $1`, [redirectId]);
      if (checkResult.rows.length === 0) {
        throw new Error("Redirect not found");
      }
      if (!checkResult.rows[0].tenant_id) {
        throw new Error("Cannot update master redirect. Master data (tenant_id = NULL) is shared across all tenants.");
      }
    }
    const result = await query(`
      UPDATE redirects 
      SET old_url = $1, new_url = $2, redirect_type = $3, status = $4, 
          notes = $5, updated_at = NOW()
      ${whereClause}
      RETURNING *
    `, [
      redirectData.old_url,
      redirectData.new_url,
      redirectData.redirect_type,
      redirectData.status,
      redirectData.notes,
      ...params
    ]);
    if (result.rows.length === 0) {
      throw new Error("Redirect not found or is a master redirect (cannot update master data)");
    }
    return result.rows[0];
  } catch (error) {
    console.error("[testing] Error updating redirect:", error);
    throw error;
  }
}
async function deleteRedirect(redirectId, tenantId = null) {
  try {
    let whereClause = "WHERE id = $1";
    let params = [redirectId];
    if (tenantId) {
      whereClause += ` AND tenant_id = $2`;
      params.push(tenantId);
    } else {
      const checkResult = await query(`SELECT tenant_id FROM redirects WHERE id = $1`, [redirectId]);
      if (checkResult.rows.length === 0) {
        throw new Error("Redirect not found");
      }
      if (!checkResult.rows[0].tenant_id) {
        throw new Error("Cannot delete master redirect. Master data (tenant_id = NULL) is shared across all tenants.");
      }
    }
    const result = await query(`
      DELETE FROM redirects ${whereClause} RETURNING *
    `, params);
    if (result.rows.length === 0) {
      throw new Error("Redirect not found or is a master redirect (cannot delete master data)");
    }
    return result.rows[0];
  } catch (error) {
    console.error("[testing] Error deleting redirect:", error);
    throw error;
  }
}
async function getRobotsConfig(tenantId = null) {
  try {
    let whereClause = "WHERE is_active = true";
    let params = [];
    let orderClause = "ORDER BY user_agent, directive, path";
    if (tenantId) {
      whereClause += ` AND (tenant_id = $1 OR tenant_id IS NULL)`;
      params.push(tenantId);
      orderClause = `ORDER BY CASE WHEN tenant_id = $1 THEN 0 ELSE 1 END, user_agent, directive, path`;
    }
    const result = await query(`
      SELECT * FROM robots_config
      ${whereClause}
      ${orderClause}
    `, params);
    return result.rows;
  } catch (error) {
    console.error("[testing] Error fetching robots config:", error);
    throw error;
  }
}
async function updateRobotsConfig(rules, tenantId = null) {
  try {
    if (!tenantId) {
      throw new Error("Tenant ID is required to update robots config. Master config (tenant_id = NULL) should be updated via admin interface.");
    }
    await query(`UPDATE robots_config SET is_active = false WHERE tenant_id = $1`, [tenantId]);
    for (const rule of rules) {
      await query(`
        INSERT INTO robots_config (user_agent, directive, path, notes, is_active, tenant_id)
        VALUES ($1, $2, $3, $4, true, $5)
        ON CONFLICT DO NOTHING
      `, [rule.user_agent, rule.directive, rule.path, rule.notes || "", tenantId]);
    }
    console.log("[testing] Robots.txt configuration updated for tenant:", tenantId);
    return true;
  } catch (error) {
    console.error("[testing] Error updating robots config:", error);
    throw error;
  }
}
async function generateRobotsTxt(tenantId = "tenant-gosg") {
  try {
    const rules = await getRobotsConfig(tenantId);
    let robotsTxt = "";
    let currentUserAgent = "";
    for (const rule of rules) {
      if (rule.user_agent !== currentUserAgent) {
        robotsTxt += `User-agent: ${rule.user_agent}
`;
        currentUserAgent = rule.user_agent;
      }
      robotsTxt += `${rule.directive}: ${rule.path}
`;
    }
    let siteUrl = "https://cms.sparti.ai";
    try {
      const siteUrlSetting = await getSiteSettingByKey("site_url", tenantId);
      if (siteUrlSetting && siteUrlSetting.setting_value) {
        siteUrl = siteUrlSetting.setting_value.replace(/\/$/, "");
      }
    } catch (err) {
      console.warn("[testing] Could not load site_url setting, using default:", err);
    }
    robotsTxt += "\n# Sitemap\n";
    robotsTxt += `Sitemap: ${siteUrl}/sitemap.xml
`;
    return robotsTxt;
  } catch (error) {
    console.error("[testing] Error generating robots.txt:", error);
    throw error;
  }
}
async function getSitemapEntries(type = null, tenantId = null) {
  try {
    let whereClause = "WHERE is_active = true";
    let params = [];
    let paramCount = 0;
    if (tenantId) {
      whereClause += ` AND tenant_id = $${++paramCount}`;
      params.push(tenantId);
    } else {
      whereClause += ` AND tenant_id IS NULL`;
    }
    if (type) {
      whereClause += ` AND sitemap_type = $${++paramCount}`;
      params.push(type);
    }
    whereClause += ` ORDER BY priority DESC, lastmod DESC`;
    const result = await query(`
      SELECT * FROM sitemap_entries
      ${whereClause}
    `, params);
    return result.rows;
  } catch (error) {
    console.error("[testing] Error fetching sitemap entries:", error);
    throw error;
  }
}
async function createSitemapEntry(entryData, tenantId = null) {
  try {
    if (!tenantId && !entryData.tenant_id) {
      throw new Error("Tenant ID is required to create sitemap entries. Master entries (tenant_id = NULL) should be created via admin interface.");
    }
    const finalTenantId = entryData.tenant_id || tenantId;
    const result = await query(`
      INSERT INTO sitemap_entries 
        (url, changefreq, priority, sitemap_type, title, description, object_id, object_type, tenant_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (url, COALESCE(tenant_id, '')) DO UPDATE SET
        changefreq = EXCLUDED.changefreq,
        priority = EXCLUDED.priority,
        lastmod = NOW(),
        updated_at = NOW()
      RETURNING *
    `, [
      entryData.url,
      entryData.changefreq || "weekly",
      entryData.priority || 0.5,
      entryData.sitemap_type || "main",
      entryData.title || "",
      entryData.description || "",
      entryData.object_id || null,
      entryData.object_type || null,
      finalTenantId
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("[testing] Error creating sitemap entry:", error);
    throw error;
  }
}
async function generateSitemapXML(tenantId = "tenant-gosg") {
  try {
    const entries = await getSitemapEntries(null, tenantId);
    let siteUrl = "https://cms.sparti.ai";
    try {
      const siteUrlSetting = await getSiteSettingByKey("site_url", tenantId);
      if (siteUrlSetting && siteUrlSetting.setting_value) {
        siteUrl = siteUrlSetting.setting_value.replace(/\/$/, "");
      }
    } catch (err) {
      console.warn("[testing] Could not load site_url setting, using default:", err);
    }
    let sitemapXML = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemapXML += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    sitemapXML += '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"\n';
    sitemapXML += '        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n';
    sitemapXML += '        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"\n';
    sitemapXML += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n';
    sitemapXML += '        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n\n';
    for (const entry of entries) {
      sitemapXML += "  <url>\n";
      sitemapXML += `    <loc>${siteUrl}${entry.url}</loc>
`;
      let lastmodDate;
      if (entry.lastmod instanceof Date) {
        lastmodDate = entry.lastmod.toISOString().split("T")[0];
      } else if (typeof entry.lastmod === "string") {
        const date = new Date(entry.lastmod);
        lastmodDate = date.toISOString().split("T")[0];
      } else {
        lastmodDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      }
      sitemapXML += `    <lastmod>${lastmodDate}</lastmod>
`;
      sitemapXML += `    <changefreq>${entry.changefreq}</changefreq>
`;
      sitemapXML += `    <priority>${entry.priority}</priority>
`;
      sitemapXML += "  </url>\n";
    }
    sitemapXML += "</urlset>";
    return sitemapXML;
  } catch (error) {
    console.error("[testing] Error generating sitemap XML:", error);
    throw error;
  }
}
async function createSEOMeta(metaData) {
  try {
    const result = await query(`
      INSERT INTO seo_meta 
        (object_id, object_type, focus_keyword, secondary_keywords, readability_score, 
         content_length, facebook_title, facebook_description, twitter_title, twitter_description,
         noindex, nofollow, schema_type, schema_data)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (object_id, object_type) DO UPDATE SET
        focus_keyword = EXCLUDED.focus_keyword,
        secondary_keywords = EXCLUDED.secondary_keywords,
        readability_score = EXCLUDED.readability_score,
        content_length = EXCLUDED.content_length,
        facebook_title = EXCLUDED.facebook_title,
        facebook_description = EXCLUDED.facebook_description,
        twitter_title = EXCLUDED.twitter_title,
        twitter_description = EXCLUDED.twitter_description,
        noindex = EXCLUDED.noindex,
        nofollow = EXCLUDED.nofollow,
        schema_type = EXCLUDED.schema_type,
        schema_data = EXCLUDED.schema_data,
        updated_at = NOW()
      RETURNING *
    `, [
      metaData.object_id,
      metaData.object_type,
      metaData.focus_keyword || null,
      metaData.secondary_keywords || [],
      metaData.readability_score || null,
      metaData.content_length || null,
      metaData.facebook_title || null,
      metaData.facebook_description || null,
      metaData.twitter_title || null,
      metaData.twitter_description || null,
      metaData.noindex || false,
      metaData.nofollow || false,
      metaData.schema_type || null,
      metaData.schema_data || null
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("[testing] Error creating SEO meta:", error);
    throw error;
  }
}
async function getSEOMeta(objectId, objectType) {
  try {
    const result = await query(`
      SELECT * FROM seo_meta
      WHERE object_id = $1 AND object_type = $2
    `, [objectId, objectType]);
    return result.rows[0];
  } catch (error) {
    console.error("[testing] Error fetching SEO meta:", error);
    throw error;
  }
}

// server/routes/seo.js
init_db();
var router7 = express8.Router();
var DEFAULT_SEO = {
  site_name: "GO SG",
  site_tagline: "Digital Marketing Agency",
  meta_title: "GO SG - Digital Marketing Agency",
  meta_description: "GO SG - We grow your revenue at the highest ROI through integrated digital marketing solutions.",
  meta_keywords: "SEO, digital marketing, Singapore, organic traffic, search rankings",
  meta_author: "GO SG",
  og_title: "GO SG - Digital Marketing Agency",
  og_description: "Integrated marketing solutions for SMEs and high-performing brands.",
  og_type: "website",
  twitter_card: "summary_large_image",
  twitter_site: "@gosgconsulting"
};
router7.get("/seo", async (req, res) => {
  try {
    if (isMockDatabaseEnabled()) {
      return res.status(200).json(DEFAULT_SEO);
    }
    const { dbInitialized: dbInitialized2 } = getDatabaseState();
    if (!dbInitialized2) {
      console.log("[testing] Database not initialized, returning default SEO settings");
      return res.status(200).json(DEFAULT_SEO);
    }
    const tenantId = req.query.tenantId || "tenant-gosg";
    try {
      const seoSettings = await getPublicSEOSettings(tenantId);
      const mergedSettings = { ...DEFAULT_SEO, ...seoSettings };
      return res.status(200).json(mergedSettings);
    } catch (seoError) {
      console.error("[testing] Error in getPublicSEOSettings:", seoError);
      return res.status(200).json(DEFAULT_SEO);
    }
  } catch (error) {
    console.error("[testing] Unexpected error fetching SEO settings:", error);
    return res.status(200).json(DEFAULT_SEO);
  }
});
router7.get("/redirects", async (req, res) => {
  try {
    const tenantId = req.query.tenantId || req.user?.tenant_id || null;
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.search) filters.search = req.query.search;
    const redirects = await getRedirects(filters, tenantId);
    res.json(redirects);
  } catch (error) {
    console.error("[testing] Error fetching redirects:", error);
    res.status(500).json({ error: "Failed to fetch redirects" });
  }
});
router7.post("/redirects", async (req, res) => {
  try {
    const tenantId = req.query.tenantId || req.user?.tenant_id || req.body.tenantId || null;
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required to create redirects" });
    }
    const redirect = await createRedirect(req.body, tenantId);
    res.status(201).json(redirect);
  } catch (error) {
    console.error("[testing] Error creating redirect:", error);
    res.status(500).json({ error: error.message || "Failed to create redirect" });
  }
});
router7.put("/redirects/:id", async (req, res) => {
  try {
    const redirectId = parseInt(req.params.id);
    const tenantId = req.query.tenantId || req.user?.tenant_id || req.body.tenantId || null;
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required to update redirects" });
    }
    const redirect = await updateRedirect(redirectId, req.body, tenantId);
    res.json(redirect);
  } catch (error) {
    console.error("[testing] Error updating redirect:", error);
    if (error.message && error.message.includes("master")) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || "Failed to update redirect" });
  }
});
router7.delete("/redirects/:id", async (req, res) => {
  try {
    const redirectId = parseInt(req.params.id);
    const tenantId = req.query.tenantId || req.user?.tenant_id || null;
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required to delete redirects" });
    }
    const redirect = await deleteRedirect(redirectId, tenantId);
    res.json({ message: "Redirect deleted successfully" });
  } catch (error) {
    console.error("[testing] Error deleting redirect:", error);
    if (error.message && error.message.includes("master")) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || "Failed to delete redirect" });
  }
});
router7.get("/robots-config", async (req, res) => {
  try {
    const tenantId = req.query.tenantId || req.user?.tenant_id || null;
    const config = await getRobotsConfig(tenantId);
    res.json(config);
  } catch (error) {
    console.error("[testing] Error fetching robots config:", error);
    res.status(500).json({ error: "Failed to fetch robots config" });
  }
});
router7.put("/robots-config", async (req, res) => {
  try {
    const tenantId = req.query.tenantId || req.user?.tenant_id || req.body.tenantId || null;
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required to update robots config" });
    }
    await updateRobotsConfig(req.body.rules, tenantId);
    res.json({ message: "Robots config updated successfully" });
  } catch (error) {
    console.error("[testing] Error updating robots config:", error);
    res.status(500).json({ error: error.message || "Failed to update robots config" });
  }
});
router7.post("/robots-txt/generate", async (req, res) => {
  try {
    const tenantId = req.query.tenantId || req.user?.tenant_id || "tenant-gosg";
    const robotsTxt = await generateRobotsTxt(tenantId);
    res.setHeader("Content-Type", "text/plain");
    res.send(robotsTxt);
  } catch (error) {
    console.error("[testing] Error generating robots.txt:", error);
    res.status(500).json({ error: "Failed to generate robots.txt" });
  }
});
router7.post("/robots-txt/update", async (req, res) => {
  try {
    const tenantId = req.query.tenantId || req.user?.tenant_id || "tenant-gosg";
    const robotsTxt = await generateRobotsTxt(tenantId);
    const fs4 = await import("fs");
    const path6 = await import("path");
    const robotsPath = path6.join(process.cwd(), "public", "robots.txt");
    fs4.writeFileSync(robotsPath, robotsTxt);
    res.json({ message: "robots.txt file updated successfully" });
  } catch (error) {
    console.error("[testing] Error updating robots.txt file:", error);
    res.status(500).json({ error: "Failed to update robots.txt file" });
  }
});
router7.get("/sitemap-entries", async (req, res) => {
  try {
    const type = req.query.type || null;
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || null;
    const entries = await getSitemapEntries(type, tenantId);
    res.json(entries);
  } catch (error) {
    console.error("[testing] Error fetching sitemap entries:", error);
    res.status(500).json({ error: "Failed to fetch sitemap entries" });
  }
});
router7.post("/sitemap-entries", async (req, res) => {
  try {
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || req.body.tenantId || null;
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required to create sitemap entries" });
    }
    const entry = await createSitemapEntry(req.body, tenantId);
    res.status(201).json(entry);
  } catch (error) {
    console.error("[testing] Error creating sitemap entry:", error);
    res.status(500).json({ error: error.message || "Failed to create sitemap entry" });
  }
});
router7.put("/sitemap-entries/:id", async (req, res) => {
  try {
    const entryId = parseInt(req.params.id);
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || req.body.tenantId || null;
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required to update sitemap entries" });
    }
    const checkResult = await query(`SELECT tenant_id FROM sitemap_entries WHERE id = $1`, [entryId]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Sitemap entry not found" });
    }
    if (!checkResult.rows[0].tenant_id) {
      return res.status(403).json({
        error: "Cannot update master sitemap entry. Master data (tenant_id = NULL) is shared across all tenants."
      });
    }
    const result = await query(`
      UPDATE sitemap_entries 
      SET url = $1, changefreq = $2, priority = $3, sitemap_type = $4, 
          title = $5, description = $6, lastmod = NOW(), updated_at = NOW()
      WHERE id = $7 AND tenant_id = $8
      RETURNING *
    `, [
      req.body.url,
      req.body.changefreq,
      req.body.priority,
      req.body.sitemap_type,
      req.body.title,
      req.body.description,
      entryId,
      tenantId
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Sitemap entry not found or is a master entry" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("[testing] Error updating sitemap entry:", error);
    res.status(500).json({ error: "Failed to update sitemap entry" });
  }
});
router7.delete("/sitemap-entries/:id", async (req, res) => {
  try {
    const entryId = parseInt(req.params.id);
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || null;
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required to delete sitemap entries" });
    }
    const checkResult = await query(`SELECT tenant_id FROM sitemap_entries WHERE id = $1`, [entryId]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Sitemap entry not found" });
    }
    if (!checkResult.rows[0].tenant_id) {
      return res.status(403).json({
        error: "Cannot delete master sitemap entry. Master data (tenant_id = NULL) is shared across all tenants."
      });
    }
    const result = await query("DELETE FROM sitemap_entries WHERE id = $1 AND tenant_id = $2 RETURNING id", [entryId, tenantId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Sitemap entry not found or is a master entry" });
    }
    res.json({ message: "Sitemap entry deleted successfully" });
  } catch (error) {
    console.error("[testing] Error deleting sitemap entry:", error);
    res.status(500).json({ error: "Failed to delete sitemap entry" });
  }
});
router7.post("/sitemap/generate", async (req, res) => {
  try {
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || "tenant-gosg";
    const sitemapXML = await generateSitemapXML(tenantId);
    const fs4 = await import("fs");
    const path6 = await import("path");
    const sitemapPath = path6.join(process.cwd(), "public", "sitemap.xml");
    fs4.writeFileSync(sitemapPath, sitemapXML);
    res.setHeader("Content-Type", "application/xml");
    res.send(sitemapXML);
  } catch (error) {
    console.error("[testing] Error generating sitemap:", error);
    res.status(500).json({ error: "Failed to generate sitemap" });
  }
});
router7.get("/seo-meta/:objectType/:objectId", async (req, res) => {
  try {
    const { objectType, objectId } = req.params;
    const seoMeta = await getSEOMeta(parseInt(objectId), objectType);
    res.json(seoMeta || {});
  } catch (error) {
    console.error("[testing] Error fetching SEO meta:", error);
    res.status(500).json({ error: "Failed to fetch SEO meta" });
  }
});
router7.post("/seo-meta", async (req, res) => {
  try {
    const seoMeta = await createSEOMeta(req.body);
    res.status(201).json(seoMeta);
  } catch (error) {
    console.error("[testing] Error creating SEO meta:", error);
    res.status(500).json({ error: "Failed to create SEO meta" });
  }
});
var seo_default = router7;

// server/routes/system.js
init_db();
init_db();
import express9 from "express";
init_constants();
var router8 = express9.Router();
router8.get("/database/tables", async (req, res) => {
  try {
    console.log("[testing] API: Getting database tables");
    const queryText = `
      SELECT 
        table_name,
        table_schema,
        table_type,
        (
          SELECT COUNT(*) 
          FROM information_schema.columns 
          WHERE table_name = t.table_name 
          AND table_schema = t.table_schema
        ) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    const result = await connection_default.query(queryText);
    const tablesWithCounts = await Promise.all(
      result.rows.map(async (table) => {
        try {
          const countQuery = `SELECT COUNT(*) as row_count FROM "${table.table_name}"`;
          const countResult = await connection_default.query(countQuery);
          return {
            ...table,
            row_count: parseInt(countResult.rows[0].row_count)
          };
        } catch (error) {
          console.warn(`[testing] Could not get row count for ${table.table_name}:`, error.message);
          return {
            ...table,
            row_count: 0
          };
        }
      })
    );
    console.log("[testing] Database tables loaded:", tablesWithCounts.length);
    res.json(tablesWithCounts);
  } catch (error) {
    console.error("[testing] Database tables error:", error);
    res.status(500).json({ error: "Failed to fetch database tables" });
  }
});
router8.get("/database/tables/:tableName/columns", async (req, res) => {
  try {
    const { tableName } = req.params;
    console.log("[testing] API: Getting columns for table:", tableName);
    const queryText = `
      SELECT 
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        CASE 
          WHEN pk.column_name IS NOT NULL THEN true 
          ELSE false 
        END as is_primary_key
      FROM information_schema.columns c
      LEFT JOIN (
        SELECT ku.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku
          ON tc.constraint_name = ku.constraint_name
        WHERE tc.table_name = $1
          AND tc.constraint_type = 'PRIMARY KEY'
      ) pk ON c.column_name = pk.column_name
      WHERE c.table_name = $1
        AND c.table_schema = 'public'
      ORDER BY c.ordinal_position;
    `;
    const result = await connection_default.query(queryText, [tableName]);
    console.log("[testing] Table columns loaded:", result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error("[testing] Table columns error:", error);
    res.status(500).json({ error: "Failed to fetch table columns" });
  }
});
router8.get("/database/tables/:tableName/data", async (req, res) => {
  try {
    const { tableName } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    console.log("[testing] API: Getting data for table:", tableName, "limit:", limit);
    const tableExistsQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = $1 AND table_schema = 'public'
    `;
    const tableExists = await connection_default.query(tableExistsQuery, [tableName]);
    if (tableExists.rows.length === 0) {
      return res.status(404).json({ error: "Table not found" });
    }
    const queryText = `SELECT * FROM "${tableName}" LIMIT $1 OFFSET $2`;
    const result = await connection_default.query(queryText, [limit, offset]);
    console.log("[testing] Table data loaded:", result.rows.length, "rows");
    res.json(result.rows);
  } catch (error) {
    console.error("[testing] Table data error:", error);
    res.status(500).json({ error: "Failed to fetch table data" });
  }
});
router8.post("/upload", simpleUpload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    console.log("[testing] File uploaded:", {
      filename: req.file.filename,
      url: fileUrl,
      size: req.file.size
    });
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error("[testing] Error uploading file:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});
router8.post("/send-email", async (req, res) => {
  try {
    const { to, subject, html, text, reply_to } = req.body;
    if (!RESEND_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "SMTP not configured - missing RESEND_API_KEY"
      });
    }
    if (!to || !subject || !html && !text) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: to, subject, and html or text"
      });
    }
    const emailData = {
      from: SMTP_FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      reply_to
    };
    Object.keys(emailData).forEach((key) => {
      if (emailData[key] === void 0) {
        delete emailData[key];
      }
    });
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(emailData)
    });
    if (!response.ok) {
      const error = await response.text();
      console.error("[testing] SMTP Error:", error);
      return res.status(response.status).json({
        success: false,
        error: `Email sending failed: ${error}`
      });
    }
    const result = await response.json();
    console.log("[testing] Email sent successfully:", result.id);
    res.json({
      success: true,
      message: "Email sent successfully",
      id: result.id
    });
  } catch (error) {
    console.error("[testing] SMTP Error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router8.post("/send-contact-email", async (req, res) => {
  try {
    const { name, email, subject, message, phone, company } = req.body;
    if (!RESEND_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "SMTP not configured - missing RESEND_API_KEY"
      });
    }
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, email, subject, message"
      });
    }
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Contact Information</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
          ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
        </div>

        <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px;">
          <h3 style="color: #007bff; margin-top: 0;">Message</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
        </div>

        <div style="margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 5px; font-size: 12px; color: #6c757d;">
          <p>This email was sent from the GO SG website contact form.</p>
          <p>Timestamp: ${(/* @__PURE__ */ new Date()).toLocaleString()}</p>
        </div>
      </div>
    `;
    const text = `
New Contact Form Submission

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ""}
${company ? `Company: ${company}` : ""}

Message:
${message}

---
This email was sent from the GO SG website contact form.
Timestamp: ${(/* @__PURE__ */ new Date()).toLocaleString()}
    `;
    const emailData = {
      from: SMTP_FROM_EMAIL,
      to: ["contact@gosg.com"],
      subject: `Contact Form: ${subject}`,
      html,
      text,
      reply_to: email
    };
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(emailData)
    });
    if (!response.ok) {
      const error = await response.text();
      console.error("[testing] Contact form email error:", error);
      return res.status(response.status).json({
        success: false,
        error: `Failed to send contact email: ${error}`
      });
    }
    const result = await response.json();
    console.log("[testing] Contact form email sent successfully:", result.id);
    res.json({
      success: true,
      message: "Contact form email sent successfully",
      id: result.id
    });
  } catch (error) {
    console.error("[testing] Contact form email error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router8.get("/smtp-config", async (req, res) => {
  try {
    console.log("[testing] Loading SMTP configuration...");
    const result = await query(`
      SELECT * FROM smtp_config 
      WHERE id = 1
      ORDER BY updated_at DESC 
      LIMIT 1
    `);
    if (result.rows.length > 0) {
      const config = result.rows[0];
      const safeConfig = {
        ...config,
        password: config.password ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : ""
      };
      console.log("[testing] SMTP configuration loaded");
      res.json(safeConfig);
    } else {
      console.log("[testing] No SMTP configuration found");
      res.json({
        host: "",
        port: 587,
        username: "",
        password: "",
        fromEmail: "",
        fromName: "",
        security: "tls",
        enabled: false
      });
    }
  } catch (error) {
    console.error("[testing] Error loading SMTP configuration:", error);
    if (error.message.includes('relation "smtp_config" does not exist')) {
      try {
        await query(`
          CREATE TABLE IF NOT EXISTS smtp_config (
            id SERIAL PRIMARY KEY,
            host VARCHAR(255) NOT NULL,
            port INTEGER NOT NULL DEFAULT 587,
            username VARCHAR(255) NOT NULL,
            password TEXT NOT NULL,
            from_email VARCHAR(255) NOT NULL,
            from_name VARCHAR(255),
            security VARCHAR(10) NOT NULL DEFAULT 'tls',
            enabled BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `);
        console.log("[testing] SMTP config table created");
        res.json({
          host: "",
          port: 587,
          username: "",
          password: "",
          fromEmail: "",
          fromName: "",
          security: "tls",
          enabled: false
        });
      } catch (createError) {
        console.error("[testing] Error creating SMTP config table:", createError);
        res.status(500).json({ error: "Failed to initialize SMTP configuration" });
      }
    } else {
      res.status(500).json({ error: "Failed to load SMTP configuration" });
    }
  }
});
router8.post("/smtp-config", async (req, res) => {
  try {
    const { host, port, username, password, fromEmail, fromName, security, enabled } = req.body;
    console.log("[testing] Saving SMTP configuration...");
    if (enabled && (!host || !port || !username || !password || !fromEmail)) {
      return res.status(400).json({
        error: "Missing required fields: host, port, username, password, fromEmail"
      });
    }
    const existing = await query("SELECT id FROM smtp_config WHERE id = 1");
    let result;
    if (existing.rows.length > 0) {
      result = await query(`
        UPDATE smtp_config 
        SET host = $1, port = $2, username = $3, password = $4, 
            from_email = $5, from_name = $6, security = $7, enabled = $8, 
            updated_at = NOW()
        WHERE id = 1
        RETURNING *
      `, [host, port, username, password, fromEmail, fromName, security, enabled]);
    } else {
      result = await query(`
        INSERT INTO smtp_config (host, port, username, password, from_email, from_name, security, enabled)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [host, port, username, password, fromEmail, fromName, security, enabled]);
    }
    const savedConfig = result.rows[0];
    const safeConfig = {
      ...savedConfig,
      password: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
    };
    console.log("[testing] SMTP configuration saved successfully");
    res.json(safeConfig);
  } catch (error) {
    console.error("[testing] Error saving SMTP configuration:", error);
    res.status(500).json({ error: "Failed to save SMTP configuration" });
  }
});
router8.post("/smtp-test", async (req, res) => {
  try {
    const { host, port, username, password, fromEmail, fromName, security } = req.body;
    console.log("[testing] Testing SMTP connection...");
    if (!host || !port || !username || !password || !fromEmail) {
      return res.status(400).json({
        error: "Missing required fields for SMTP test"
      });
    }
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransporter({
      host,
      port: parseInt(port),
      secure: security === "ssl",
      auth: {
        user: username,
        pass: password
      },
      tls: security === "tls" ? {
        rejectUnauthorized: false
      } : void 0
    });
    await transporter.verify();
    const testEmail = {
      from: fromName ? `"${fromName}" <${fromEmail}>` : fromEmail,
      to: fromEmail,
      subject: "SMTP Configuration Test",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">SMTP Test Successful!</h2>
          <p>Your SMTP configuration is working correctly.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="margin-top: 0;">Configuration Details:</h3>
            <p><strong>Host:</strong> ${host}</p>
            <p><strong>Port:</strong> ${port}</p>
            <p><strong>Security:</strong> ${security.toUpperCase()}</p>
            <p><strong>Username:</strong> ${username}</p>
          </div>
          <p style="color: #666; font-size: 12px;">
            This is an automated test email sent at ${(/* @__PURE__ */ new Date()).toLocaleString()}
          </p>
        </div>
      `,
      text: `SMTP Test Successful!

Your SMTP configuration is working correctly.

Host: ${host}
Port: ${port}
Security: ${security.toUpperCase()}
Username: ${username}

This is an automated test email sent at ${(/* @__PURE__ */ new Date()).toLocaleString()}`
    };
    const info = await transporter.sendMail(testEmail);
    console.log("[testing] SMTP test email sent successfully:", info.messageId);
    res.json({
      success: true,
      message: "SMTP connection successful! Test email sent.",
      messageId: info.messageId
    });
  } catch (error) {
    console.error("[testing] SMTP test failed:", error);
    let errorMessage = "SMTP connection failed";
    if (error.code === "EAUTH") {
      errorMessage = "Authentication failed. Check your username and password.";
    } else if (error.code === "ECONNECTION") {
      errorMessage = "Connection failed. Check your host and port settings.";
    } else if (error.code === "ESOCKET") {
      errorMessage = "Socket error. Check your network connection and firewall settings.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    res.status(400).json({
      success: false,
      error: errorMessage
    });
  }
});
router8.post("/cache/invalidate", async (req, res) => {
  try {
    const { slug, all } = req.body || {};
    if (all) {
      invalidateAll();
      return res.json({ ok: true, cleared: "all" });
    }
    if (slug) {
      invalidateBySlug(slug);
      return res.json({ ok: true, cleared: slug });
    }
    return res.status(400).json({ error: "Provide slug or all=true" });
  } catch (error) {
    console.error("[testing] Cache invalidation error:", error);
    res.status(500).json({ error: "Failed to invalidate cache" });
  }
});
var system_default = router8;

// server/routes/public.js
init_db();
import express10 from "express";
var loadSequelizeModels = async () => {
  const modelsModule = await Promise.resolve().then(() => (init_models(), models_exports));
  const sequelizeModule = await Promise.resolve().then(() => (init_models(), models_exports));
  const sequelizeInstance2 = (await Promise.resolve().then(() => (init_models(), models_exports))).sequelize;
  const { Op: Op6 } = await import("sequelize");
  return {
    models: modelsModule.default,
    sequelize: sequelizeInstance2,
    Op: Op6
  };
};
var router9 = express10.Router();
var successResponse = (data, tenantId) => {
  return {
    success: true,
    data,
    meta: {
      tenant_id: tenantId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }
  };
};
var errorResponse = (error, code, status = 500) => {
  return {
    success: false,
    error: error.message || error,
    code: code || "ERROR"
  };
};
router9.get("/pages", async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { sequelize: sequelize2 } = await loadSequelizeModels();
    const { status, page_type, limit, offset } = req.query;
    const queryOptions = {
      replacements: { tenantId },
      type: sequelize2.QueryTypes.SELECT
    };
    let queryText = `
      SELECT 
        id,
        page_name,
        slug,
        meta_title,
        meta_description,
        seo_index,
        status,
        page_type,
        created_at,
        updated_at,
        campaign_source,
        conversion_goal,
        legal_type,
        last_reviewed_date,
        version
      FROM pages
      WHERE tenant_id = :tenantId
    `;
    if (status) {
      queryText += ` AND status = :status`;
      queryOptions.replacements.status = status;
    }
    if (page_type) {
      queryText += ` AND page_type = :page_type`;
      queryOptions.replacements.page_type = page_type;
    }
    queryText += ` ORDER BY created_at DESC`;
    const limitNum = limit ? parseInt(limit, 10) : 100;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    queryText += ` LIMIT :limit OFFSET :offset`;
    queryOptions.replacements.limit = limitNum;
    queryOptions.replacements.offset = offsetNum;
    const result = await sequelize2.query(queryText, queryOptions);
    res.json(successResponse(result, tenantId));
  } catch (error) {
    console.error("[testing] Error fetching pages:", error);
    res.status(500).json(errorResponse(error, "FETCH_PAGES_ERROR"));
  }
});
router9.get("/pages/:slug", async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { sequelize: sequelize2 } = await loadSequelizeModels();
    const { language } = req.query;
    let slug = req.params.slug;
    if (!slug.startsWith("/")) {
      slug = "/" + slug;
    }
    const pageResult = await sequelize2.query(`
      SELECT 
        id,
        page_name,
        slug,
        meta_title,
        meta_description,
        seo_index,
        status,
        page_type,
        created_at,
        updated_at
      FROM pages
      WHERE slug = :slug AND tenant_id = :tenantId
      LIMIT 1
    `, {
      replacements: { slug, tenantId },
      type: sequelize2.QueryTypes.SELECT
    });
    if (pageResult.length === 0) {
      return res.status(404).json(errorResponse("Page not found", "PAGE_NOT_FOUND", 404));
    }
    const page = pageResult[0];
    const pageId = page.id;
    const requestedLanguage = language || "default";
    let layoutResult = await sequelize2.query(`
      SELECT layout_json, version, updated_at, language
      FROM page_layouts
      WHERE page_id = :pageId AND language = :language
      ORDER BY version DESC
      LIMIT 1
    `, {
      replacements: { pageId, language: requestedLanguage },
      type: sequelize2.QueryTypes.SELECT
    });
    if (layoutResult.length === 0 && requestedLanguage !== "default") {
      console.log(`[testing] Layout for language '${requestedLanguage}' not found, falling back to 'default'`);
      layoutResult = await sequelize2.query(`
        SELECT layout_json, version, updated_at, language
        FROM page_layouts
        WHERE page_id = :pageId AND language = 'default'
        ORDER BY version DESC
        LIMIT 1
      `, {
        replacements: { pageId },
        type: sequelize2.QueryTypes.SELECT
      });
    }
    if (layoutResult.length > 0) {
      page.layout = layoutResult[0].layout_json;
      page.layout_language = layoutResult[0].language;
    } else {
      page.layout = { components: [] };
      page.layout_language = "default";
    }
    res.json(successResponse(page, tenantId));
  } catch (error) {
    console.error("[testing] Error fetching page:", error);
    res.status(500).json(errorResponse(error, "FETCH_PAGE_ERROR"));
  }
});
router9.get("/header", async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const schema = await getSiteSchema("header", tenantId);
    if (!schema) {
      return res.status(404).json(errorResponse("Header schema not found", "HEADER_NOT_FOUND", 404));
    }
    res.json(successResponse(schema, tenantId));
  } catch (error) {
    console.error("[testing] Error fetching header schema:", error);
    res.status(500).json(errorResponse(error, "FETCH_HEADER_ERROR"));
  }
});
router9.get("/footer", async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const schema = await getSiteSchema("footer", tenantId);
    if (!schema) {
      return res.status(404).json(errorResponse("Footer schema not found", "FOOTER_NOT_FOUND", 404));
    }
    res.json(successResponse(schema, tenantId));
  } catch (error) {
    console.error("[testing] Error fetching footer schema:", error);
    res.status(500).json(errorResponse(error, "FETCH_FOOTER_ERROR"));
  }
});
router9.get("/global-schema", async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { language } = req.query;
    const [headerSchema, footerSchema] = await Promise.all([
      getSiteSchema("header", tenantId, language),
      getSiteSchema("footer", tenantId, language)
    ]);
    const globalSchema = {
      header: headerSchema || null,
      footer: footerSchema || null
    };
    res.json(successResponse(globalSchema, tenantId));
  } catch (error) {
    console.error("[testing] Error fetching global schema:", error);
    res.status(500).json(errorResponse(error, "FETCH_GLOBAL_SCHEMA_ERROR"));
  }
});
router9.get("/blog/posts", async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { sequelize: sequelize2, models: models2, Op: Op6 } = await loadSequelizeModels();
    const { Post: Post7, Category: Category6, Tag: Tag6 } = models2;
    const { status, limit, offset } = req.query;
    const whereClause = {};
    if (tenantId) {
      whereClause[Op6.or] = [
        { tenant_id: tenantId },
        { tenant_id: null }
      ];
    }
    whereClause.status = status || "published";
    const queryOptions = {
      where: whereClause,
      include: [
        {
          model: Category6,
          as: "categories",
          through: { attributes: [] },
          attributes: ["id", "name", "slug"]
        },
        {
          model: Tag6,
          as: "tags",
          through: { attributes: [] },
          attributes: ["id", "name", "slug"]
        }
      ],
      order: [["created_at", "DESC"]],
      attributes: [
        "id",
        "title",
        "slug",
        "excerpt",
        "content",
        "status",
        "post_type",
        "created_at",
        "updated_at",
        "published_at",
        "view_count"
      ]
    };
    if (limit) {
      queryOptions.limit = parseInt(limit, 10) || 20;
      if (offset) {
        queryOptions.offset = parseInt(offset, 10) || 0;
      }
    } else {
      queryOptions.limit = 20;
    }
    const posts = await Post7.findAll(queryOptions);
    const postsWithTerms = posts.map((post) => {
      const postJson = post.toJSON();
      const terms = [
        ...(postJson.categories || []).map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          taxonomy: "category"
        })),
        ...(postJson.tags || []).map((tag) => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          taxonomy: "post_tag"
        }))
      ];
      return {
        ...postJson,
        terms
      };
    });
    res.json(successResponse(postsWithTerms, tenantId));
  } catch (error) {
    console.error("[testing] Error fetching blog posts:", error);
    res.status(500).json(errorResponse(error, "FETCH_POSTS_ERROR"));
  }
});
router9.get("/blog/posts/:slug", async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const slug = req.params.slug;
    const { models: models2 } = await loadSequelizeModels();
    const { Post: Post7, Category: Category6, Tag: Tag6 } = models2;
    const whereClause = { slug };
    if (tenantId) {
      whereClause[Op.or] = [
        { tenant_id: tenantId },
        { tenant_id: null }
      ];
    }
    const post = await Post7.findOne({
      where: whereClause,
      include: [
        {
          model: Category6,
          as: "categories",
          through: { attributes: [] },
          attributes: ["id", "name", "slug"]
        },
        {
          model: Tag6,
          as: "tags",
          through: { attributes: [] },
          attributes: ["id", "name", "slug"]
        }
      ],
      attributes: [
        "id",
        "title",
        "slug",
        "excerpt",
        "content",
        "status",
        "post_type",
        "created_at",
        "updated_at",
        "published_at",
        "view_count"
      ]
    });
    if (!post) {
      return res.status(404).json(errorResponse("Post not found", "POST_NOT_FOUND", 404));
    }
    const postJson = post.toJSON();
    const terms = [
      ...(postJson.categories || []).map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        taxonomy: "category"
      })),
      ...(postJson.tags || []).map((tag) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        taxonomy: "post_tag"
      }))
    ];
    const postWithTerms = {
      ...postJson,
      terms
    };
    res.json(successResponse(postWithTerms, tenantId));
  } catch (error) {
    console.error("[testing] Error fetching blog post:", error);
    res.status(500).json(errorResponse(error, "FETCH_POST_ERROR"));
  }
});
router9.get("/settings", async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const settings = await getsitesettingsbytenant(tenantId);
    const publicSettings = settings.filter((setting) => setting.is_public === true).reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {});
    res.json(successResponse(publicSettings, tenantId));
  } catch (error) {
    console.error("[testing] Error fetching settings:", error);
    res.status(500).json(errorResponse(error, "FETCH_SETTINGS_ERROR"));
  }
});
router9.get("/settings/:key", async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const key = req.params.key;
    const setting = await getSiteSettingByKey(key, tenantId);
    if (!setting) {
      return res.status(404).json(errorResponse("Setting not found", "SETTING_NOT_FOUND", 404));
    }
    if (!setting.is_public) {
      return res.status(403).json(errorResponse("Setting is not public", "SETTING_NOT_PUBLIC", 403));
    }
    res.json(successResponse({
      key: setting.setting_key,
      value: setting.setting_value,
      type: setting.setting_type,
      category: setting.setting_category
    }, tenantId));
  } catch (error) {
    console.error("[testing] Error fetching setting:", error);
    res.status(500).json(errorResponse(error, "FETCH_SETTING_ERROR"));
  }
});
router9.get("/theme/:themeSlug/settings", async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { themeSlug } = req.params;
    if (!tenantId) {
      return res.status(400).json(errorResponse("Tenant ID is required", "TENANT_ID_REQUIRED", 400));
    }
    const settings = await getThemeSettings(tenantId, themeSlug);
    const publicSettings = {};
    Object.keys(settings).forEach((category) => {
      publicSettings[category] = {};
      Object.assign(publicSettings[category], settings[category]);
    });
    res.json(successResponse(publicSettings, tenantId));
  } catch (error) {
    console.error("[testing] Error fetching theme settings:", error);
    res.status(500).json(errorResponse(error, "FETCH_THEME_SETTINGS_ERROR"));
  }
});
router9.get("/theme/:themeSlug/branding", async (req, res) => {
  try {
    const tenantId = req.tenantId || req.query.tenantId || "tenant-gosg";
    const { themeSlug } = req.params;
    console.log(`[testing] Fetching branding for theme: ${themeSlug}, tenant: ${tenantId}`);
    console.log(`[testing] Request headers:`, {
      "x-tenant-id": req.headers["x-tenant-id"],
      "x-api-key": req.headers["x-api-key"] ? "***" : void 0,
      query: req.query
    });
    const settings = await getBrandingSettings(tenantId, themeSlug);
    console.log(`[testing] Branding settings retrieved:`, {
      brandingKeys: Object.keys(settings.branding || {}),
      seoKeys: Object.keys(settings.seo || {}),
      localizationKeys: Object.keys(settings.localization || {}),
      themeKeys: Object.keys(settings.theme || {})
    });
    res.json(successResponse(settings.branding || {}, tenantId));
  } catch (error) {
    console.error("[testing] Error fetching theme branding:", error);
    console.error("[testing] Error stack:", error.stack);
    res.status(500).json(errorResponse(error, "FETCH_THEME_BRANDING_ERROR"));
  }
});
router9.get("/theme/:themeSlug/styles", async (req, res) => {
  try {
    const tenantId = req.tenantId || req.query.tenantId || "tenant-gosg";
    const { themeSlug } = req.params;
    console.log(`[testing] Fetching styles for theme: ${themeSlug}, tenant: ${tenantId}`);
    const setting = await getSiteSettingByKey("theme_styles", tenantId, themeSlug);
    if (!setting) {
      console.log(`[testing] No styles found for theme: ${themeSlug}, tenant: ${tenantId}`);
      return res.json(successResponse({}, tenantId));
    }
    let styles = {};
    if (setting.setting_value) {
      try {
        styles = typeof setting.setting_value === "string" ? JSON.parse(setting.setting_value) : setting.setting_value;
        console.log(`[testing] Styles retrieved for theme: ${themeSlug}`, Object.keys(styles));
      } catch (e) {
        console.error("[testing] Error parsing theme styles:", e);
      }
    }
    res.json(successResponse(styles, tenantId));
  } catch (error) {
    console.error("[testing] Error fetching theme styles:", error);
    res.status(500).json(errorResponse(error, "FETCH_THEME_STYLES_ERROR"));
  }
});
var public_default = router9;

// server/routes/users.js
import express11 from "express";
init_db();
var loadSequelize = async () => {
  const modelsModule = await Promise.resolve().then(() => (init_models(), models_exports));
  const sequelizePkg = await import("sequelize");
  return { models: modelsModule.default, Op: sequelizePkg.Op };
};
var router10 = express11.Router();
router10.get("/users", authenticateUser, async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = getDatabaseState();
    if (!dbInitialized2) {
      if (dbInitializationError2) {
        return res.status(503).json({
          success: false,
          error: "Database initialization failed",
          message: "Please try again later"
        });
      }
      return res.status(503).json({
        success: false,
        error: "Database is initializing",
        message: "Please try again in a moment"
      });
    }
    console.log(`[testing] API: Fetching all users for tenant: ${req.tenantId}`);
    console.log(`[testing] API: User is_super_admin: ${req.user.is_super_admin}`);
    let usersQuery;
    let queryParams = [];
    if (!req.user.is_super_admin) {
      const tenantId = req.tenantId || req.user.tenant_id;
      usersQuery = `
        SELECT 
          id, first_name, last_name, email, role, status, 
          is_active, tenant_id, 
          COALESCE(is_super_admin, false) as is_super_admin,
          created_at, updated_at
        FROM users
        WHERE tenant_id = $1
        ORDER BY created_at DESC
      `;
      queryParams = [tenantId];
    } else {
      usersQuery = `
        SELECT 
          id, first_name, last_name, email, role, status, 
          is_active, tenant_id, 
          COALESCE(is_super_admin, false) as is_super_admin,
          created_at, updated_at
        FROM users
        ORDER BY created_at DESC
      `;
    }
    const result = await query(usersQuery, queryParams);
    const users = result.rows;
    console.log(`[testing] API: Found ${users.length} user(s)`);
    res.json({
      success: true,
      users,
      total: users.length,
      tenantId: req.tenantId || req.user.tenant_id
    });
  } catch (error) {
    console.error("[testing] API: Error fetching users:", error);
    console.error("[testing] API: Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    const { dbInitialized: dbInitialized2 } = getDatabaseState();
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      if (!dbInitialized2) {
        return res.status(503).json({
          success: false,
          error: "Database is initializing",
          message: "Please try again in a moment"
        });
      }
    }
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
      message: error.message
    });
  }
});
router10.get("/users/:id", authenticateUser, async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = getDatabaseState();
    if (!dbInitialized2) {
      if (dbInitializationError2) {
        return res.status(503).json({
          success: false,
          error: "Database initialization failed",
          message: "Please try again later"
        });
      }
      return res.status(503).json({
        success: false,
        error: "Database is initializing",
        message: "Please try again in a moment"
      });
    }
    const { id } = req.params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID"
      });
    }
    console.log(`[testing] API: Fetching user ${userId} for tenant: ${req.tenantId}`);
    let userQuery;
    let queryParams = [userId];
    if (!req.user.is_super_admin) {
      const tenantId = req.tenantId || req.user.tenant_id;
      userQuery = `
        SELECT 
          id, first_name, last_name, email, role, status, 
          is_active, tenant_id, 
          COALESCE(is_super_admin, false) as is_super_admin,
          created_at, updated_at
        FROM users
        WHERE id = $1 AND tenant_id = $2
      `;
      queryParams = [userId, tenantId];
    } else {
      userQuery = `
        SELECT 
          id, first_name, last_name, email, role, status, 
          is_active, tenant_id, 
          COALESCE(is_super_admin, false) as is_super_admin,
          created_at, updated_at
        FROM users
        WHERE id = $1
      `;
    }
    const result = await query(userQuery, queryParams);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }
    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error("[testing] API: Error fetching user:", error);
    const { dbInitialized: dbInitialized2 } = getDatabaseState();
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      if (!dbInitialized2) {
        return res.status(503).json({
          success: false,
          error: "Database is initializing",
          message: "Please try again in a moment"
        });
      }
    }
    res.status(500).json({
      success: false,
      error: "Failed to fetch user",
      message: error.message
    });
  }
});
router10.post("/users", authenticateUser, async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = getDatabaseState();
    if (!dbInitialized2) {
      if (dbInitializationError2) {
        return res.status(503).json({
          success: false,
          error: "Database initialization failed",
          message: "Please try again later"
        });
      }
      return res.status(503).json({
        success: false,
        error: "Database is initializing",
        message: "Please try again in a moment"
      });
    }
    const {
      first_name,
      last_name,
      email,
      password,
      role,
      status,
      tenant_id,
      is_super_admin,
      is_active
    } = req.body;
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        message: "first_name, last_name, email, and password are required"
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format"
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters long"
      });
    }
    console.log(`[testing] API: Creating user for tenant: ${req.tenantId || req.user.tenant_id}`);
    const bcrypt4 = await import("bcrypt");
    const password_hash = await bcrypt4.hash(password, 10);
    let finalTenantId = tenant_id;
    if (!req.user.is_super_admin) {
      finalTenantId = req.tenantId || req.user.tenant_id;
    }
    const { models: models2 } = await loadSequelize();
    const user = await models2.User.create({
      first_name,
      last_name,
      email,
      password_hash,
      role: role || "user",
      status: status || "active",
      tenant_id: finalTenantId,
      is_super_admin: is_super_admin || false,
      is_active: is_active !== void 0 ? is_active : true
    });
    const createdUser = await models2.User.findByPk(user.id, {
      attributes: {
        exclude: ["password_hash"]
      }
    });
    res.status(201).json({
      success: true,
      user: createdUser.toJSON()
    });
  } catch (error) {
    console.error("[testing] API: Error creating user:", error);
    if (error.name === "SequelizeUniqueConstraintError" || error.message?.includes("unique") || error.message?.includes("duplicate")) {
      return res.status(409).json({
        success: false,
        error: "Email already exists",
        message: "A user with this email already exists"
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to create user",
      message: error.message
    });
  }
});
router10.put("/users/:id", authenticateUser, async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = getDatabaseState();
    if (!dbInitialized2) {
      if (dbInitializationError2) {
        return res.status(503).json({
          success: false,
          error: "Database initialization failed",
          message: "Please try again later"
        });
      }
      return res.status(503).json({
        success: false,
        error: "Database is initializing",
        message: "Please try again in a moment"
      });
    }
    const { id } = req.params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID"
      });
    }
    const {
      first_name,
      last_name,
      email,
      password,
      role,
      status,
      tenant_id,
      is_super_admin,
      is_active
    } = req.body;
    console.log(`[testing] API: Updating user ${userId} for tenant: ${req.tenantId || req.user.tenant_id}`);
    const whereClause = { id: userId };
    if (!req.user.is_super_admin) {
      whereClause.tenant_id = req.tenantId || req.user.tenant_id;
    }
    const { models: models2 } = await loadSequelize();
    const user = await models2.User.findOne({ where: whereClause });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }
    const updateData = {};
    if (first_name !== void 0) updateData.first_name = first_name;
    if (last_name !== void 0) updateData.last_name = last_name;
    if (email !== void 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: "Invalid email format"
        });
      }
      updateData.email = email;
    }
    if (role !== void 0) updateData.role = role;
    if (status !== void 0) updateData.status = status;
    if (is_active !== void 0) updateData.is_active = is_active;
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          error: "Password must be at least 8 characters long"
        });
      }
      const bcrypt4 = await import("bcrypt");
      updateData.password_hash = await bcrypt4.hash(password, 10);
    }
    if (req.user.is_super_admin) {
      if (tenant_id !== void 0) updateData.tenant_id = tenant_id;
      if (is_super_admin !== void 0) updateData.is_super_admin = is_super_admin;
    } else {
    }
    await user.update(updateData);
    const updatedUser = await models2.User.findByPk(user.id, {
      attributes: {
        exclude: ["password_hash"]
      }
    });
    res.json({
      success: true,
      user: updatedUser.toJSON()
    });
  } catch (error) {
    console.error("[testing] API: Error updating user:", error);
    if (error.name === "SequelizeUniqueConstraintError" || error.message?.includes("unique") || error.message?.includes("duplicate")) {
      return res.status(409).json({
        success: false,
        error: "Email already exists",
        message: "A user with this email already exists"
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to update user",
      message: error.message
    });
  }
});
router10.put("/users/:id/password", authenticateUser, async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = getDatabaseState();
    if (!dbInitialized2) {
      if (dbInitializationError2) {
        return res.status(503).json({
          success: false,
          error: "Database initialization failed",
          message: "Please try again later"
        });
      }
      return res.status(503).json({
        success: false,
        error: "Database is initializing",
        message: "Please try again in a moment"
      });
    }
    const { id } = req.params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID"
      });
    }
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        message: "current_password and new_password are required"
      });
    }
    if (new_password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters long"
      });
    }
    console.log(`[testing] API: Changing password for user ${userId}`);
    const whereClause = { id: userId };
    if (!req.user.is_super_admin && userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "You can only change your own password"
      });
    }
    const { models: models2 } = await loadSequelize();
    const user = await models2.User.findOne({ where: whereClause });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }
    const bcrypt4 = await import("bcrypt");
    const isValidPassword = await bcrypt4.compare(current_password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid current password",
        message: "The current password is incorrect"
      });
    }
    const password_hash = await bcrypt4.hash(new_password, 10);
    await user.update({ password_hash });
    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("[testing] API: Error changing password:", error);
    res.status(500).json({
      success: false,
      error: "Failed to change password",
      message: error.message
    });
  }
});
router10.delete("/users/:id", authenticateUser, async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = getDatabaseState();
    if (!dbInitialized2) {
      if (dbInitializationError2) {
        return res.status(503).json({
          success: false,
          error: "Database initialization failed",
          message: "Please try again later"
        });
      }
      return res.status(503).json({
        success: false,
        error: "Database is initializing",
        message: "Please try again in a moment"
      });
    }
    const { id } = req.params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID"
      });
    }
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete own account",
        message: "You cannot delete your own account"
      });
    }
    console.log(`[testing] API: Deleting user ${userId} for tenant: ${req.tenantId || req.user.tenant_id}`);
    const whereClause = { id: userId };
    if (!req.user.is_super_admin) {
      whereClause.tenant_id = req.tenantId || req.user.tenant_id;
    }
    const { models: models2 } = await loadSequelize();
    const user = await models2.User.findOne({ where: whereClause });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }
    await user.destroy();
    res.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("[testing] API: Error deleting user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete user",
      message: error.message
    });
  }
});
var users_default = router10;

// server/routes/theme.js
import express12 from "express";
import { fileURLToPath as fileURLToPath8 } from "url";
import { dirname as dirname6, join as join5 } from "path";
import { existsSync as existsSync4 } from "fs";
var router11 = express12.Router();
var __filename8 = fileURLToPath8(import.meta.url);
var __dirname8 = dirname6(__filename8);
var serveThemeIndex = (req, res, next) => {
  const path6 = req.path;
  if (path6 && path6.includes("/assets/")) {
    return next();
  }
  if (path6 && /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|map)$/i.test(path6)) {
    return next();
  }
  const indexPath = join5(__dirname8, "..", "..", "dist", "index.html");
  if (existsSync4(indexPath)) {
    try {
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error("[testing] Error sending index.html:", err);
          if (!res.headersSent) {
            res.status(500).json({
              status: "error",
              message: "Failed to serve application",
              error: process.env.NODE_ENV === "development" ? err.message : void 0
            });
          }
        }
      });
    } catch (error) {
      console.error("[testing] Error in theme route:", error);
      if (!res.headersSent) {
        res.status(500).json({
          status: "error",
          message: "Failed to serve application",
          error: process.env.NODE_ENV === "development" ? error.message : void 0
        });
      }
    }
  } else {
    res.status(200).json({
      status: "error",
      message: "React app not built. Please build the app first.",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
};
router11.get("/:tenantSlug/:pageSlug", serveThemeIndex);
router11.get("/:tenantSlug", (req, res, next) => {
  const path6 = req.path;
  if (path6 && (path6.includes("/assets/") || /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|map)$/i.test(path6))) {
    return next();
  }
  const indexPath = join5(__dirname8, "..", "..", "dist", "index.html");
  if (existsSync4(indexPath)) {
    try {
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error("[testing] Error sending index.html:", err);
          if (!res.headersSent) {
            res.status(500).json({
              status: "error",
              message: "Failed to serve application",
              error: process.env.NODE_ENV === "development" ? err.message : void 0
            });
          }
        }
      });
    } catch (error) {
      console.error("[testing] Error in theme route:", error);
      if (!res.headersSent) {
        res.status(500).json({
          status: "error",
          message: "Failed to serve application",
          error: process.env.NODE_ENV === "development" ? error.message : void 0
        });
      }
    }
  } else {
    res.status(200).json({
      status: "error",
      message: "React app not built. Please build the app first.",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
var theme_default = router11;

// server/routes/theme-admin.js
import express13 from "express";

// server/middleware/themeUrl.js
init_db();
var extractThemeFromUrl = async (req, res, next) => {
  try {
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = getDatabaseState();
    if (!dbInitialized2) {
      if (dbInitializationError2) {
        return res.status(503).json({
          success: false,
          error: "Database initialization failed",
          message: "Please try again later"
        });
      }
      return res.status(503).json({
        success: false,
        error: "Database is initializing",
        message: "Please try again in a moment"
      });
    }
    const themeSlug = req.params.themeSlug;
    if (!themeSlug) {
      return res.status(400).json({
        success: false,
        error: "Theme slug is required",
        code: "MISSING_THEME_SLUG"
      });
    }
    const tenantsResult = await query(`
      SELECT id, name, slug, theme_id, created_at, updated_at
      FROM tenants
      WHERE theme_id = $1
      ORDER BY created_at DESC
    `, [themeSlug]);
    req.themeSlug = themeSlug;
    req.themeTenants = tenantsResult.rows || [];
    if (req.user && !req.user.is_super_admin) {
      if (req.user.tenant_id) {
        const userTenantUsesTheme = req.themeTenants.some(
          (tenant) => tenant.id === req.user.tenant_id
        );
        if (!userTenantUsesTheme) {
          return res.status(403).json({
            success: false,
            error: "Access denied",
            message: "Your tenant does not use this theme. You can only access themes assigned to your tenant.",
            code: "TENANT_THEME_MISMATCH"
          });
        }
        const userTenant = req.themeTenants.find(
          (tenant) => tenant.id === req.user.tenant_id
        );
        req.tenantId = req.user.tenant_id;
        req.tenant = userTenant;
        req.themeTenants = [userTenant];
      } else {
        return res.status(403).json({
          success: false,
          error: "Access denied",
          message: "Your account is not associated with a tenant.",
          code: "NO_TENANT_ASSOCIATED"
        });
      }
    } else if (req.themeTenants.length > 0) {
      req.tenantId = req.themeTenants[0].id;
      req.tenant = req.themeTenants[0];
    }
    next();
  } catch (error) {
    console.error("[testing] Error in theme URL extraction:", error);
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      const { dbInitialized: dbInitialized2 } = getDatabaseState();
      if (!dbInitialized2) {
        return res.status(503).json({
          success: false,
          error: "Database is initializing",
          message: "Please try again in a moment"
        });
      }
    }
    return res.status(500).json({
      success: false,
      error: "Error extracting theme from URL",
      code: "THEME_EXTRACTION_ERROR"
    });
  }
};

// server/routes/theme-admin.js
import { fileURLToPath as fileURLToPath9 } from "url";
import { dirname as dirname7, join as join6 } from "path";
import { existsSync as existsSync5 } from "fs";
var router12 = express13.Router();
var __filename9 = fileURLToPath9(import.meta.url);
var __dirname9 = dirname7(__filename9);
router12.get("/:themeSlug/auth", extractThemeFromUrl, (req, res) => {
  const indexPath = join6(__dirname9, "..", "..", "dist", "index.html");
  if (existsSync5(indexPath)) {
    return res.sendFile(indexPath, (err) => {
      if (err && !res.headersSent) {
        res.status(500).json({
          status: "error",
          message: "Failed to serve application"
        });
      }
    });
  }
  return res.status(200).json({
    status: "error",
    message: "React app not built. Please build the app first.",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
var theme_admin_default = router12;

// server/routes/themes.js
import express14 from "express";
import fs3 from "fs";
import path4 from "path";
import { fileURLToPath as fileURLToPath10 } from "url";
import { dirname as dirname8 } from "path";
import multer2 from "multer";
init_themeSync();
init_db();
var router13 = express14.Router();
var __filename10 = fileURLToPath10(import.meta.url);
var __dirname10 = dirname8(__filename10);
function ensureDir2(dirPath) {
  if (!fs3.existsSync(dirPath)) {
    fs3.mkdirSync(dirPath, { recursive: true });
  }
}
function getThemeAssetsDirs(themeSlug) {
  const projectRoot = path4.join(__dirname10, "..", "..");
  const themeAssetsDir = path4.join(projectRoot, "sparti-cms", "theme", themeSlug, "assets");
  const publicAssetsDir = path4.join(projectRoot, "public", "theme", themeSlug, "assets");
  return { themeAssetsDir, publicAssetsDir };
}
function listFilesRecursive(baseDir) {
  const results = [];
  if (!fs3.existsSync(baseDir)) return results;
  const walk = (dir, prefix = "") => {
    const entries = fs3.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const abs = path4.join(dir, entry.name);
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(abs, rel);
      } else {
        results.push(rel);
      }
    }
  };
  walk(baseDir);
  return results;
}
var themeAssetsUpload = multer2({
  storage: multer2.diskStorage({
    destination: (req, file, cb) => {
      try {
        const themeSlug = req.params.themeSlug;
        const { themeAssetsDir, publicAssetsDir } = getThemeAssetsDirs(themeSlug);
        ensureDir2(themeAssetsDir);
        ensureDir2(publicAssetsDir);
        cb(null, themeAssetsDir);
      } catch (e) {
        cb(e);
      }
    },
    filename: (req, file, cb) => {
      const original = file.originalname || "file";
      const ext = path4.extname(original);
      const base = path4.basename(original, ext).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      cb(null, `${base || "asset"}-${unique}${ext.toLowerCase()}`);
    }
  }),
  limits: {
    fileSize: 15 * 1024 * 1024
  }
});
router13.get("/:themeSlug/assets", authenticateUser, async (req, res) => {
  try {
    if (!req.user?.is_super_admin) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }
    const themeSlug = req.params.themeSlug;
    const { themeAssetsDir, publicAssetsDir } = getThemeAssetsDirs(themeSlug);
    const baseDir = fs3.existsSync(themeAssetsDir) ? themeAssetsDir : publicAssetsDir;
    const files = listFilesRecursive(baseDir);
    const assets = files.map((filePath) => ({
      path: filePath,
      url: `/theme/${themeSlug}/assets/${filePath}`
    }));
    return res.json({ success: true, theme: themeSlug, assets });
  } catch (error) {
    console.error("[testing] Error listing theme assets:", error);
    return res.status(500).json({ success: false, error: "Failed to list theme assets" });
  }
});
router13.post(
  "/:themeSlug/assets/upload",
  authenticateUser,
  (req, res, next) => {
    if (!req.user?.is_super_admin) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }
    return next();
  },
  themeAssetsUpload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "No file uploaded" });
      }
      const themeSlug = req.params.themeSlug;
      const { themeAssetsDir, publicAssetsDir } = getThemeAssetsDirs(themeSlug);
      ensureDir2(themeAssetsDir);
      ensureDir2(publicAssetsDir);
      const srcPath = path4.join(themeAssetsDir, req.file.filename);
      const destPath = path4.join(publicAssetsDir, req.file.filename);
      try {
        fs3.copyFileSync(srcPath, destPath);
      } catch (copyErr) {
        console.warn("[testing] Could not copy uploaded theme asset into public folder:", copyErr);
      }
      const url = `/theme/${themeSlug}/assets/${req.file.filename}`;
      return res.status(201).json({
        success: true,
        theme: themeSlug,
        filename: req.file.filename,
        originalName: req.file.originalname,
        url
      });
    } catch (error) {
      console.error("[testing] Error uploading theme asset:", error);
      return res.status(500).json({ success: false, error: "Failed to upload theme asset" });
    }
  }
);
router13.get("/", async (req, res) => {
  try {
    let themes = [];
    let fromFilesystem = false;
    try {
      themes = await getAllThemes();
    } catch (dbError) {
      console.log("[testing] Database query failed, using file system themes:", dbError.message);
      themes = getThemesFromFileSystem();
      fromFilesystem = true;
    }
    if (themes.length === 0) {
      console.log("[testing] No themes in database, checking file system...");
      const fsThemes = getThemesFromFileSystem();
      if (fsThemes.length > 0) {
        themes = fsThemes;
        fromFilesystem = true;
      }
    }
    res.json({
      success: true,
      themes,
      total: themes.length,
      from_filesystem: fromFilesystem
    });
  } catch (error) {
    console.error("[testing] Error fetching themes:", error);
    try {
      const fsThemes = getThemesFromFileSystem();
      res.json({
        success: true,
        themes: fsThemes,
        total: fsThemes.length,
        from_filesystem: true
      });
    } catch (fsError) {
      res.status(500).json({
        success: false,
        error: "Failed to fetch themes",
        message: error.message
      });
    }
  }
});
router13.post("/:themeId/migrate-layouts", authenticateUser, async (req, res) => {
  try {
    const { themeId } = req.params;
    console.log(`[testing] Migrating layouts for theme: ${themeId}`);
    const allPages = await query(`
      SELECT id, page_name, slug, theme_id
      FROM pages
      WHERE theme_id = $1
    `, [themeId]);
    console.log(`[testing] Found ${allPages.rows.length} page(s) for theme ${themeId}`);
    if (allPages.rows.length === 0) {
      console.log(`[testing] No pages found in database, attempting to sync from file system...`);
      try {
        const { syncThemePages: syncThemePages2 } = await Promise.resolve().then(() => (init_themeSync(), themeSync_exports));
        const syncResult = await syncThemePages2(themeId);
        if (syncResult.success && syncResult.synced > 0) {
          console.log(`[testing] Synced ${syncResult.synced} page(s) from file system`);
          const recheckPages = await query(`
            SELECT id, page_name, slug, theme_id
            FROM pages
            WHERE theme_id = $1
          `, [themeId]);
          if (recheckPages.rows.length > 0) {
            console.log(`[testing] Found ${recheckPages.rows.length} page(s) after sync, proceeding with migration`);
            const pagesWithLayoutsAfterSync = await query(`
              SELECT p.id, p.page_name, p.slug, pl.id as layout_id, pl.layout_json
              FROM pages p
              LEFT JOIN page_layouts pl ON p.id = pl.page_id AND pl.language = 'default'
              WHERE p.theme_id = $1
            `, [themeId]);
            pagesWithoutLayouts.rows = pagesWithLayoutsAfterSync.rows;
          } else {
            return res.json({
              success: true,
              message: `No pages found for theme ${themeId} even after sync. Please check if pages.json exists in the theme folder.`,
              migrated: 0,
              total: 0,
              results: []
            });
          }
        } else {
          return res.json({
            success: true,
            message: `No pages found for theme ${themeId}. Please ensure pages.json exists in sparti-cms/theme/${themeId}/pages.json`,
            migrated: 0,
            total: 0,
            results: []
          });
        }
      } catch (syncError) {
        console.error(`[testing] Error syncing pages:`, syncError);
        return res.json({
          success: false,
          message: `No pages found and failed to sync: ${syncError.message}`,
          migrated: 0,
          total: 0,
          results: []
        });
      }
    }
    let pagesWithoutLayouts = await query(`
      SELECT p.id, p.page_name, p.slug, pl.id as layout_id, pl.layout_json
      FROM pages p
      LEFT JOIN page_layouts pl ON p.id = pl.page_id AND pl.language = 'default'
      WHERE p.theme_id = $1
    `, [themeId]);
    console.log(`[testing] Checking ${pagesWithoutLayouts.rows.length} page(s) for empty layouts`);
    const pagesToMigrate = pagesWithoutLayouts.rows.filter((page) => {
      if (!page.layout_id) {
        console.log(`[testing] Page ${page.page_name} (${page.id}) has no layout - will create`);
        return true;
      }
      let layoutJson = page.layout_json;
      if (typeof layoutJson === "string") {
        try {
          layoutJson = JSON.parse(layoutJson);
        } catch (e) {
          console.log(`[testing] Page ${page.page_name} (${page.id}) has invalid layout JSON - will update`);
          return true;
        }
      }
      if (!layoutJson || !layoutJson.components || Array.isArray(layoutJson.components) && layoutJson.components.length === 0 || typeof layoutJson.components === "string" && layoutJson.components === "[]") {
        console.log(`[testing] Page ${page.page_name} (${page.id}) has empty layout - will update`);
        return true;
      }
      const hasContent = Array.isArray(layoutJson.components) && layoutJson.components.some((comp) => {
        return comp.props && Object.keys(comp.props).length > 0;
      });
      if (!hasContent) {
        console.log(`[testing] Page ${page.page_name} (${page.id}) has components but no props - will update`);
        return true;
      }
      console.log(`[testing] Page ${page.page_name} (${page.id}) already has ${layoutJson.components.length} component(s) with content, skipping`);
      return false;
    });
    console.log(`[testing] Found ${pagesToMigrate.length} page(s) that need migration`);
    let migratedCount = 0;
    const results = [];
    for (const page of pagesToMigrate) {
      try {
        let defaultLayout;
        if (page.slug === "/" || page.slug === "/home" || page.slug === "/index") {
          defaultLayout = getDefaultLayoutForTheme(themeId);
          console.log(`[testing] Creating default theme layout for homepage: ${themeId}`);
        } else {
          defaultLayout = { components: [] };
          console.log(`[testing] Creating empty layout for page: ${page.page_name}`);
        }
        if (page.layout_id) {
          await query(`
            UPDATE page_layouts
            SET layout_json = $1, version = version + 1, updated_at = NOW()
            WHERE id = $2
          `, [JSON.stringify(defaultLayout), page.layout_id]);
        } else {
          await query(`
            INSERT INTO page_layouts (page_id, language, layout_json, version, updated_at)
            VALUES ($1, 'default', $2, 1, NOW())
            ON CONFLICT (page_id, language) DO UPDATE
            SET layout_json = EXCLUDED.layout_json, version = page_layouts.version + 1, updated_at = NOW()
          `, [page.id, JSON.stringify(defaultLayout)]);
        }
        migratedCount++;
        results.push({
          pageId: page.id,
          pageName: page.page_name,
          slug: page.slug,
          status: "migrated",
          componentsCount: defaultLayout.components?.length || 0
        });
      } catch (error) {
        console.error(`[testing] Error migrating layout for page ${page.id}:`, error);
        results.push({
          pageId: page.id,
          pageName: page.page_name,
          slug: page.slug,
          status: "error",
          error: error.message
        });
      }
    }
    res.json({
      success: true,
      message: `Migrated ${migratedCount} layout(s) for theme ${themeId}`,
      migrated: migratedCount,
      total: pagesWithoutLayouts.rows.length,
      results
    });
  } catch (error) {
    console.error(`[testing] Error migrating layouts for theme ${req.params.themeId}:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to migrate layouts",
      message: error.message
    });
  }
});
router13.post("/:themeId/api-keys", authenticateUser, async (req, res) => {
  try {
    const { themeId } = req.params;
    const { description } = req.body;
    console.log(`[testing] Generating API key for theme: ${themeId}`);
    const result = await generateThemeApiKey(themeId, description || "API Key from Developer Section");
    if (!result.success) {
      console.error(`[testing] Failed to generate API key for theme ${themeId}:`, result.message);
      return res.status(404).json({ error: result.message });
    }
    console.log(`[testing] Successfully generated API key for theme: ${themeId}`);
    res.json({ apiKey: result.apiKey });
  } catch (error) {
    console.error(`[testing] Error generating API key for theme ${req.params.themeId}:`, error);
    res.status(500).json({
      error: "Failed to generate API key",
      message: error.message || "Unknown error occurred"
    });
  }
});
router13.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const theme = await getThemeBySlug(slug);
    if (!theme) {
      return res.status(404).json({
        success: false,
        error: "Theme not found",
        code: "THEME_NOT_FOUND"
      });
    }
    res.json({
      success: true,
      theme
    });
  } catch (error) {
    console.error("[testing] Error fetching theme:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch theme",
      message: error.message
    });
  }
});
router13.post("/sync", authenticateUser, async (req, res) => {
  try {
    if (!req.user || !req.user.is_super_admin) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Only super admins can sync themes"
      });
    }
    const syncResult = await syncThemesFromFileSystem();
    let pagesSynced = 0;
    const pageSyncResults = [];
    let settingsSynced = 0;
    if (syncResult.success && syncResult.results) {
      for (const themeResult of syncResult.results) {
        if (themeResult.action === "created" || themeResult.action === "updated") {
          try {
            const pageSyncResult = await syncThemePages(themeResult.slug);
            if (pageSyncResult.success) {
              pagesSynced += pageSyncResult.synced;
              pageSyncResults.push({
                theme: themeResult.slug,
                themeId: themeResult.id,
                pages: pageSyncResult
              });
            }
            try {
              const { ensureDemoTenantHasThemePages: ensureDemoTenantHasThemePages2 } = await Promise.resolve().then(() => (init_themeSync(), themeSync_exports));
              const themePages = readThemePages(themeResult.slug);
              if (themePages && themePages.length > 0) {
                await ensureDemoTenantHasThemePages2(themeResult.slug, themePages);
              }
            } catch (demoError) {
              console.log(`[testing] Note: Could not ensure demo tenant pages for theme ${themeResult.slug}:`, demoError.message);
            }
          } catch (error) {
            console.error(`[testing] Error syncing pages for theme ${themeResult.slug}:`, error);
          }
          try {
            const themeDbId = themeResult.id || themeResult.slug;
            const settingsUpdated = await query(`
              UPDATE site_settings
              SET theme_id = $1, updated_at = CURRENT_TIMESTAMP
              WHERE (theme_id = $2 OR theme_id IS NULL)
                AND setting_key IN ('theme_styles', 'site_name', 'site_tagline', 'site_description', 'site_logo', 'site_favicon')
                AND theme_id != $1
              RETURNING id, setting_key
            `, [themeDbId, themeResult.slug]);
            if (settingsUpdated.rows.length > 0) {
              settingsSynced += settingsUpdated.rows.length;
              console.log(`[testing] Synced ${settingsUpdated.rows.length} setting(s) for theme ${themeResult.slug} (ID: ${themeDbId})`);
            }
          } catch (settingsError) {
            console.log(`[testing] Note: Could not sync settings for theme ${themeResult.slug}:`, settingsError.message);
          }
        }
      }
    }
    if (syncResult.success) {
      res.json({
        success: true,
        message: `${syncResult.message}. Synced ${pagesSynced} page(s) and ${settingsSynced} setting(s).`,
        synced: syncResult.synced,
        total: syncResult.total,
        results: syncResult.results,
        pagesSynced,
        settingsSynced,
        pageSyncResults
      });
    } else {
      res.status(500).json({
        success: false,
        error: syncResult.error,
        message: syncResult.message
      });
    }
  } catch (error) {
    console.error("[testing] Error syncing themes:", error);
    res.status(500).json({
      success: false,
      error: "Failed to sync themes",
      message: error.message
    });
  }
});
router13.post("/", authenticateUser, async (req, res) => {
  try {
    if (!req.user || !req.user.is_super_admin) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Only super admins can create themes"
      });
    }
    const { slug, name, description } = req.body;
    if (!slug) {
      return res.status(400).json({
        success: false,
        error: "Slug is required",
        message: "Theme slug (folder name) is required"
      });
    }
    const theme = await createTheme(slug, name, description);
    res.status(201).json({
      success: true,
      theme,
      message: "Theme created successfully"
    });
  } catch (error) {
    console.error("[testing] Error creating theme:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create theme",
      message: error.message
    });
  }
});
router13.put("/:id", authenticateUser, async (req, res) => {
  try {
    if (!req.user || !req.user.is_super_admin) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Only super admins can update themes"
      });
    }
    const { id } = req.params;
    const { name, description, is_active, tags } = req.body;
    const updates = [];
    const values = [];
    let paramIndex = 1;
    if (name !== void 0) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (description !== void 0) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (is_active !== void 0) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(is_active);
    }
    if (tags !== void 0) {
      updates.push(`tags = $${paramIndex++}`);
      values.push(Array.isArray(tags) ? tags : [tags]);
    }
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update"
      });
    }
    updates.push(`updated_at = NOW()`);
    values.push(id);
    let result;
    try {
      result = await query(`
        UPDATE themes
        SET ${updates.join(", ")}
        WHERE id = $${paramIndex} OR slug = $${paramIndex}
        RETURNING id, name, slug, description, created_at, updated_at, is_active, tags
      `, values);
    } catch (tagsError) {
      if (tagsError.message?.includes('column "tags"') || tagsError.code === "42703") {
        result = await query(`
          UPDATE themes
          SET ${updates.join(", ")}
          WHERE id = $${paramIndex} OR slug = $${paramIndex}
          RETURNING id, name, slug, description, created_at, updated_at, is_active
        `, values);
      } else {
        throw tagsError;
      }
    }
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Theme not found"
      });
    }
    res.json({
      success: true,
      theme: result.rows[0],
      message: "Theme updated successfully"
    });
  } catch (error) {
    console.error("[testing] Error updating theme:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update theme",
      message: error.message
    });
  }
});
var themes_default = router13;

// server/routes/tenants-api.js
init_db();
import express15 from "express";
var router14 = express15.Router();
var successResponse2 = (data, tenantId = null) => ({
  success: true,
  data,
  meta: {
    tenant_id: tenantId,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  }
});
var errorResponse2 = (error, code = "ERROR", status = 500) => ({
  success: false,
  error: error instanceof Error ? error.message : error,
  code: code || "ERROR"
});
router14.get("/by-slug/:slug", async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = getDatabaseState();
    if (!dbInitialized2) {
      if (dbInitializationError2) {
        return res.status(503).json({
          success: false,
          error: "Database initialization failed",
          message: "Please try again later"
        });
      }
      return res.status(503).json({
        success: false,
        error: "Database is initializing",
        message: "Please try again in a moment"
      });
    }
    const slug = req.params.slug;
    if (!slug) {
      return res.status(400).json(errorResponse2("Slug is required", "MISSING_SLUG", 400));
    }
    const tenantResult = await query(`
      SELECT id, name, slug, created_at, updated_at, theme_id
      FROM tenants
      WHERE slug = $1
      LIMIT 1
    `, [slug]);
    if (tenantResult.rows.length === 0) {
      return res.status(404).json(errorResponse2("Tenant not found", "TENANT_NOT_FOUND", 404));
    }
    const tenant = tenantResult.rows[0];
    res.json(successResponse2(tenant));
  } catch (error) {
    console.error("[testing] Error fetching tenant by slug:", error);
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      const { dbInitialized: dbInitialized2 } = getDatabaseState();
      if (!dbInitialized2) {
        return res.status(503).json({
          success: false,
          error: "Database is initializing",
          message: "Please try again in a moment"
        });
      }
    }
    res.status(500).json(errorResponse2(error, "FETCH_TENANT_ERROR"));
  }
});
router14.get("/by-theme/:themeId", async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = getDatabaseState();
    if (!dbInitialized2) {
      if (dbInitializationError2) {
        return res.status(503).json({
          success: false,
          error: "Database initialization failed",
          message: "Please try again later"
        });
      }
      return res.status(503).json({
        success: false,
        error: "Database is initializing",
        message: "Please try again in a moment"
      });
    }
    const themeId = req.params.themeId;
    if (!themeId) {
      return res.status(400).json(errorResponse2("Theme ID is required", "MISSING_THEME_ID", 400));
    }
    let queryText = `
      SELECT id, name, slug, theme_id, created_at, updated_at
      FROM tenants
      WHERE theme_id = $1
      ORDER BY created_at DESC
    `;
    let queryParams = [themeId];
    if (req.user && !req.user.is_super_admin && req.user.tenant_id) {
      queryText = `
        SELECT id, name, slug, theme_id, created_at, updated_at
        FROM tenants
        WHERE theme_id = $1 AND id = $2
        ORDER BY created_at DESC
      `;
      queryParams = [themeId, req.user.tenant_id];
    }
    const tenantsResult = await query(queryText, queryParams);
    res.json(successResponse2({ tenants: tenantsResult.rows }));
  } catch (error) {
    console.error("[testing] Error fetching tenants by template:", error);
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      const { dbInitialized: dbInitialized2 } = getDatabaseState();
      if (!dbInitialized2) {
        return res.status(503).json({
          success: false,
          error: "Database is initializing",
          message: "Please try again in a moment"
        });
      }
    }
    res.status(500).json(errorResponse2(error, "FETCH_TENANTS_BY_THEME_ERROR"));
  }
});
router14.get("/:id/integrations/:type", authenticateUser, async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = getDatabaseState();
    if (!dbInitialized2) {
      if (dbInitializationError2) {
        return res.status(503).json({
          success: false,
          error: "Database initialization failed",
          message: "Please try again later"
        });
      }
      return res.status(503).json({
        success: false,
        error: "Database is initializing",
        message: "Please try again in a moment"
      });
    }
    const tenantId = req.params.id;
    const integrationType = req.params.type.toLowerCase();
    if (!["woocommerce", "wordpress"].includes(integrationType)) {
      return res.status(400).json(errorResponse2("Invalid integration type. Must be woocommerce or wordpress", "INVALID_INTEGRATION_TYPE", 400));
    }
    if (!req.user.is_super_admin && req.user.tenant_id !== tenantId) {
      return res.status(403).json(errorResponse2("Access denied", "ACCESS_DENIED", 403));
    }
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tenant_integrations'
      );
    `);
    if (!tableExists.rows[0].exists) {
      return res.json({
        is_active: false,
        integration_type: integrationType,
        tenant_id: tenantId
      });
    }
    const result = await query(`
      SELECT is_active, config, created_at, updated_at
      FROM tenant_integrations
      WHERE tenant_id = $1 AND integration_type = $2
      LIMIT 1
    `, [tenantId, integrationType]);
    if (result.rows.length === 0) {
      return res.json({
        is_active: false,
        integration_type: integrationType,
        tenant_id: tenantId
      });
    }
    res.json({
      is_active: result.rows[0].is_active,
      integration_type: integrationType,
      tenant_id: tenantId,
      config: result.rows[0].config,
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at
    });
  } catch (error) {
    console.error("[testing] Error fetching integration status:", error);
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      return res.json({
        is_active: false,
        integration_type: req.params.type.toLowerCase(),
        tenant_id: req.params.id
      });
    }
    res.status(500).json(errorResponse2(error, "FETCH_INTEGRATION_ERROR"));
  }
});
router14.put("/:id/integrations/:type", authenticateUser, async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = getDatabaseState();
    if (!dbInitialized2) {
      if (dbInitializationError2) {
        return res.status(503).json({
          success: false,
          error: "Database initialization failed",
          message: "Please try again later"
        });
      }
      return res.status(503).json({
        success: false,
        error: "Database is initializing",
        message: "Please try again in a moment"
      });
    }
    const tenantId = req.params.id;
    const integrationType = req.params.type.toLowerCase();
    const { is_active, config } = req.body;
    if (!["woocommerce", "wordpress"].includes(integrationType)) {
      return res.status(400).json(errorResponse2("Invalid integration type. Must be woocommerce or wordpress", "INVALID_INTEGRATION_TYPE", 400));
    }
    if (!req.user.is_super_admin && req.user.tenant_id !== tenantId) {
      return res.status(403).json(errorResponse2("Access denied", "ACCESS_DENIED", 403));
    }
    const tenantCheck = await query(`
      SELECT id FROM tenants WHERE id = $1
    `, [tenantId]);
    if (tenantCheck.rows.length === 0) {
      return res.status(404).json(errorResponse2("Tenant not found", "TENANT_NOT_FOUND", 404));
    }
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tenant_integrations'
      );
    `);
    if (!tableExists.rows[0].exists) {
      return res.status(503).json({
        success: false,
        error: "Integration table not initialized",
        message: "Please run database migrations to create tenant_integrations table"
      });
    }
    const result = await query(`
      INSERT INTO tenant_integrations (tenant_id, integration_type, is_active, config)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (tenant_id, integration_type)
      DO UPDATE SET
        is_active = EXCLUDED.is_active,
        config = EXCLUDED.config,
        updated_at = NOW()
      RETURNING is_active, config, created_at, updated_at
    `, [tenantId, integrationType, is_active || false, config || null]);
    res.json({
      success: true,
      is_active: result.rows[0].is_active,
      integration_type: integrationType,
      tenant_id: tenantId,
      config: result.rows[0].config,
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at
    });
  } catch (error) {
    console.error("[testing] Error updating integration status:", error);
    res.status(500).json(errorResponse2(error, "UPDATE_INTEGRATION_ERROR"));
  }
});
var tenants_api_default = router14;

// server/routes/ai-assistant.js
import express16 from "express";
import Anthropic from "@anthropic-ai/sdk";
init_pages();
init_db();
var componentRegistry2;
async function getComponentRegistry() {
  if (!componentRegistry2) {
    try {
      const registryModule = await Promise.resolve().then(() => (init_registry(), registry_exports));
      componentRegistry2 = registryModule.componentRegistry || registryModule.ComponentRegistry?.getInstance();
    } catch (error) {
      console.error("[testing] Error importing component registry:", error);
      return { getAll: () => [] };
    }
  }
  return componentRegistry2;
}
var router15 = express16.Router();
var getAnthropicClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set in environment variables");
  }
  return new Anthropic({ apiKey });
};
var buildSystemPrompt = (pageContext, activeTools, selectedComponents) => {
  let systemPrompt = `You are an AI Assistant for a CMS (Content Management System) Visual Editor. Help users with content creation, editing, and provide guidance on using the CMS features. Be concise, helpful, and professional.

IMPORTANT: Even if page context is not available or there are errors with JSON data, you should still provide helpful responses as a general AI assistant. You can help with general questions, content creation, and CMS guidance.

`;
  if (pageContext && pageContext.slug) {
    const componentCount = pageContext.layout?.components?.length || 0;
    systemPrompt += `CURRENT PAGE CONTEXT:
- Page: ${pageContext.pageName || "Unknown"} (${pageContext.slug})
- Tenant: ${pageContext.tenantId || "Unknown"}
- Components: ${componentCount} component(s) in this page

IMPORTANT: You are ONLY working with this specific page. Do NOT reference other pages or the entire website. Focus exclusively on the current page's structure and components.

`;
    try {
      if (pageContext.layout && pageContext.layout.components && pageContext.layout.components.length > 0) {
        systemPrompt += `CURRENT PAGE STRUCTURE (COMPLETE JSON):
The page contains the following complete component structure:
${JSON.stringify(pageContext.layout.components, null, 2)}

This is the FULL page layout JSON. All components are included above. Use this complete structure when:
- Answering questions about the page content
- Modifying or updating components
- Creating new components that should match the existing structure
- Understanding the page's complete structure

`;
      } else if (pageContext.layout) {
        systemPrompt += `CURRENT PAGE STRUCTURE (COMPLETE JSON):
The page layout structure:
${JSON.stringify(pageContext.layout, null, 2)}

`;
      }
    } catch (jsonError) {
      console.warn("[testing] Error stringifying page layout in system prompt:", jsonError);
    }
    if (pageContext.focusedComponent) {
      const getComponentHierarchy = (component) => {
        if (component.parentType || component.parent) {
          const parentName = component.parentType || component.parent?.type || component.parent?.name || "Parent Component";
          const currentName = component.type || component.name || component.key || "Component";
          return `${parentName} > ${currentName}`;
        }
        return component.type || component.name || component.key || "Component";
      };
      const componentPath = getComponentHierarchy(pageContext.focusedComponent);
      systemPrompt += `FOCUSED COMPONENT (USER SELECTED FROM LEFT PANEL):
The user has specifically selected this component: ${componentPath}
Focus your response on THIS component:

${JSON.stringify(pageContext.focusedComponent, null, 2)}

IMPORTANT: When answering questions or making modifications, prioritize this focused component. The user wants to work specifically with this component's JSON structure and its place in the component hierarchy.

`;
    }
  } else {
    systemPrompt += `\u{1F3E0} **Current Context**: No specific page is selected in the Visual Editor.

This means I can help you with:
- General CMS questions and guidance
- Content creation and strategy
- Technical questions about web development
- Any other topics or questions you have

Feel free to ask me anything! I'm here to help whether it's CMS-related or any other topic.

`;
  }
  systemPrompt += `JSON STRUCTURE RULES FOR EDITABLE SECTIONS:

1. DATABASE STORAGE:
   - Pages store editable sections in the 'page_layouts' table
   - Field: 'layout_json' (JSONB type in PostgreSQL)
   - Format: { "components": [...] }
   - Each page has a unique layout per language (default language: 'default')
   - Components are tenant-isolated via 'tenant_id' in the 'pages' table

2. COMPONENT JSON FORMAT:
   Each component in the layout_json.components array follows this structure:
   {
     "id": "unique-component-id",
     "type": "component-type-id",  // Must match a component from registry
     "props": {
       "propertyName": "value",
       // All properties defined in component registry
     }
   }

3. COMPONENT REGISTRY:
   - Component definitions stored in: sparti-cms/registry/components/*.json
   - Each component has: id, name, type, category, properties, editor, version, tenant_scope
   - Properties define what can be edited: type, description, editable, required, default
   - Example component structure:
     {
       "id": "hero-main",
       "name": "Hero Section",
       "type": "container",
       "category": "content",
       "properties": {
         "headingLine1": {
           "type": "string",
           "description": "First line of heading",
           "editable": true,
           "required": true
         }
       },
       "editor": "ContainerEditor",
       "version": "1.0.0",
       "tenant_scope": "tenant"
     }

4. TENANT ISOLATION:
   - All pages are scoped to a specific tenant_id
   - Components are tenant-specific when tenant_scope is "tenant"
   - Global components (tenant_scope: "global") can be used across tenants
   - Always respect tenant boundaries when suggesting changes

`;
  if (activeTools && activeTools.length > 0) {
    systemPrompt += `\u{1F6E0}\uFE0F ACTIVE TOOLS: ${activeTools.join(", ")}

`;
    activeTools.forEach((tool) => {
      switch (tool) {
        case "searchWeb":
          systemPrompt += `\u{1F310} SEARCH WEB TOOL ACTIVE:
- Provide current, up-to-date information from the web
- Verify facts and provide recent data when possible
- Include relevant links and sources when helpful
- Focus on accurate, real-time information

`;
          break;
        case "editText":
          systemPrompt += `\u{1F4DD} EDIT TEXT TOOL ACTIVE:
- Focus on editing and improving text content, copies, and written material
- Help with schema text properties, component content, and page copy
- Provide suggestions for better wording, clarity, and engagement
- Focus on content optimization and text-based improvements
- When working with JSON schemas, prioritize text-related properties like titles, descriptions, content, etc.

`;
          break;
        case "editImage":
          systemPrompt += `\u{1F5BC}\uFE0F EDIT IMAGE TOOL ACTIVE:
- Focus on image-related content and visual elements
- Help with image properties in schemas (src, alt, dimensions, etc.)
- Provide guidance on image optimization and visual content
- Suggest improvements for visual components and image-based elements
- When working with JSON schemas, prioritize image-related properties and visual components

`;
          break;
        case "createImage":
          systemPrompt += `\u{1F3A8} CREATE IMAGE TOOL ACTIVE:
- Generate and create new images and visual content
- Provide detailed image descriptions and specifications
- Help with visual design concepts and image creation
- Focus on creating new visual elements for the page

`;
          break;
        case "writeCode":
          systemPrompt += `\u{1F4BB} WRITE CODE TOOL ACTIVE:
- Focus on code generation, development, and technical implementation
- Provide code examples, snippets, and technical solutions
- Help with component development and technical aspects
- Generate valid JSON schemas and code structures

`;
          break;
        case "deepResearch":
          systemPrompt += `\u{1F50D} DEEP RESEARCH TOOL ACTIVE:
- Perform comprehensive analysis and research
- Provide detailed, well-researched responses
- Include multiple perspectives and thorough explanations
- Focus on in-depth analysis and comprehensive solutions

`;
          break;
        case "thinkLonger":
          systemPrompt += `\u{1F914} THINK LONGER TOOL ACTIVE:
- Take more time for complex reasoning and analysis
- Provide detailed, thoughtful responses
- Consider multiple approaches and solutions
- Focus on comprehensive problem-solving

`;
          break;
      }
    });
  }
  if (selectedComponents && selectedComponents.length > 0) {
    systemPrompt += `SELECTED COMPONENTS:
The user has selected the following components from the page:
${selectedComponents.map((comp, idx) => {
      let info = `${idx + 1}. ${comp.tagName} (selector: ${comp.selector})`;
      if (comp.filePath) {
        info += `
   File: ${comp.filePath}`;
        if (comp.lineNumber) info += `:${comp.lineNumber}`;
      }
      return info;
    }).join("\n")}

When the user asks about modifications or changes, they are referring to these selected components. Focus your responses on these specific elements.

`;
  }
  systemPrompt += `GENERAL GUIDELINES:
- Be specific to the current page when page context is available
- Reference component IDs and types accurately
- When components are selected, focus on those specific elements
- Suggest changes that maintain JSON structure validity
- Explain JSON structure when helping users understand the system
- When creating JSON, always validate against component registry schemas`;
  return systemPrompt;
};
var optionalAuth = (req, res, next) => {
  if (req.user) {
    if (req.user.is_super_admin) {
      req.tenantId = req.query.tenantId || req.headers["x-tenant-id"] || req.user.tenant_id;
    } else {
      req.tenantId = req.user.tenant_id;
    }
    return next();
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const jwt2 = __require("jsonwebtoken");
      const { JWT_SECRET: JWT_SECRET2 } = (init_constants(), __toCommonJS(constants_exports));
      const decoded = jwt2.verify(token, JWT_SECRET2);
      req.user = decoded;
      if (req.user.is_super_admin) {
        req.tenantId = req.query.tenantId || req.headers["x-tenant-id"] || req.user.tenant_id;
      } else {
        req.tenantId = req.user.tenant_id;
      }
    } catch (error) {
      console.log("[testing] Invalid token provided, continuing as anonymous user");
    }
  }
  next();
};
router15.post("/ai-assistant/chat", optionalAuth, async (req, res) => {
  try {
    const { message, conversationHistory = [], pageContext, activeTools, selectedComponents, model } = req.body;
    if (pageContext) {
      const componentCount = pageContext.layout?.components?.length || 0;
      console.log(`[testing] AI Assistant chat - Page: ${pageContext.slug}, Tenant: ${pageContext.tenantId}, Components: ${componentCount}`);
    }
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Message is required and must be a non-empty string"
      });
    }
    const anthropic = getAnthropicClient();
    const messages = conversationHistory.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content
    }));
    messages.push({
      role: "user",
      content: message
    });
    let systemPrompt;
    try {
      systemPrompt = buildSystemPrompt(pageContext, activeTools, selectedComponents);
    } catch (promptError) {
      console.warn("[testing] Error building system prompt, using fallback:", promptError);
      systemPrompt = `You are Claude, an AI Assistant integrated into a CMS (Content Management System) Visual Editor. You're designed to be helpful, harmless, and honest.

\u{1F3AF} **Primary Functions:**
- **General AI Assistant**: Answer questions on any topic with accuracy and depth
- **CMS & Web Development**: Provide expert guidance on content management, web development, and digital marketing
- **Content Creation**: Help write, edit, and improve content of all types
- **Technical Support**: Assist with coding, troubleshooting, and best practices

\u{1F4A1} **Capabilities:**
- Answer questions across all domains of knowledge
- Help with writing, editing, and content strategy
- Provide coding assistance and technical guidance
- Offer creative ideas and problem-solving approaches
- Explain complex concepts in simple terms

\u{1F527} **CMS-Specific Help:**
- Page structure and component organization
- SEO optimization and best practices  
- Content strategy and user experience
- Technical implementation guidance
- Troubleshooting and debugging

**Communication Style:**
- Be conversational yet professional
- Provide clear, actionable advice
- Ask clarifying questions when needed
- Offer multiple approaches when appropriate
- Always be helpful and encouraging

Whether you need help with the CMS, general questions, or creative tasks, I'm here to assist! What can I help you with today?`;
    }
    const selectedModel = model || "claude-3-5-haiku-20241022";
    const allowedModels = [
      // Claude 4.x models (latest)
      "claude-3-5-haiku-20241022",
      // Claude Haiku 4.x
      "claude-3-5-sonnet-20241022",
      // Claude Sonnet 4
      "claude-3-5-sonnet-20250115",
      // Claude Sonnet 4.5 (if available)
      "claude-3-5-opus-20241022",
      // Claude Opus 4
      "claude-3-5-opus-20250115",
      // Claude Opus 4.1/4.5 (if available)
      // Claude 3.x models (legacy support)
      "claude-3-7-sonnet-20250219",
      // Claude Sonnet 3.7
      "claude-3-haiku-20240307",
      // Claude Haiku 3
      "claude-3-opus-20240229"
      // Claude Opus 3
    ];
    const modelToUse = allowedModels.includes(selectedModel) ? selectedModel : "claude-3-5-haiku-20241022";
    const response = await anthropic.messages.create({
      model: modelToUse,
      max_tokens: 2048,
      // Increased for JSON generation
      messages,
      system: systemPrompt
    });
    const assistantMessage = response.content[0].text;
    res.json({
      success: true,
      message: assistantMessage,
      usage: response.usage
    });
  } catch (error) {
    console.error("[testing] AI Assistant API Error:", error);
    if (error.status === 401) {
      return res.status(401).json({
        success: false,
        error: "Invalid Anthropic API key"
      });
    }
    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        error: "Rate limit exceeded. Please try again later."
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to get AI response",
      message: error.message || "An unexpected error occurred"
    });
  }
});
router15.get("/ai-assistant/page-context", authenticateUser, async (req, res) => {
  try {
    const slug = req.query.slug || "";
    const tenantId = req.tenantId || req.query.tenantId || "tenant-gosg";
    if (!slug) {
      return res.status(400).json({
        success: false,
        error: "Slug parameter is required"
      });
    }
    const normalizedSlug = slug.startsWith("/") ? slug : `/${slug}`;
    const pageResult = await query(`
      SELECT 
        id,
        page_name,
        slug,
        tenant_id,
        page_type,
        status
      FROM pages
      WHERE slug = $1 AND tenant_id = $2
      LIMIT 1
    `, [normalizedSlug, tenantId]);
    if (pageResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Page not found"
      });
    }
    const page = pageResult.rows[0];
    const pageId = page.id;
    const layoutResult = await query(`
      SELECT layout_json, version, updated_at
      FROM page_layouts
      WHERE page_id = $1 AND language = 'default'
      ORDER BY version DESC
      LIMIT 1
    `, [pageId]);
    const layout = layoutResult.rows[0]?.layout_json || { components: [] };
    const pageContext = {
      slug: page.slug,
      pageName: page.page_name,
      pageId: page.id,
      tenantId: page.tenant_id,
      layout
    };
    res.json({
      success: true,
      pageContext
    });
  } catch (error) {
    console.error("[testing] Error fetching page context:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch page context",
      message: error.message || "An unexpected error occurred"
    });
  }
});
router15.post("/ai-assistant/generate-schema", authenticateUser, async (req, res) => {
  try {
    const { pageSlug, pageName, tenantId, model, analyzePageCode, currentSchema } = req.body;
    if (!pageSlug || !tenantId) {
      return res.status(400).json({
        success: false,
        error: "pageSlug and tenantId are required"
      });
    }
    const normalizedSlug = pageSlug.startsWith("/") ? pageSlug : `/${pageSlug}`;
    const pageResult = await query(`
      SELECT 
        id,
        page_name,
        slug,
        tenant_id,
        page_type,
        status
      FROM pages
      WHERE slug = $1 AND tenant_id = $2
      LIMIT 1
    `, [normalizedSlug, tenantId]);
    if (pageResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Page not found"
      });
    }
    const page = pageResult.rows[0];
    const pageId = page.id;
    const layoutResult = await query(`
      SELECT layout_json, version, updated_at
      FROM page_layouts
      WHERE page_id = $1 AND language = 'default'
      ORDER BY version DESC
      LIMIT 1
    `, [pageId]);
    const currentLayout = layoutResult.rows[0]?.layout_json || { components: [] };
    const registry = await getComponentRegistry();
    const allComponents = registry.getAll();
    const anthropic = getAnthropicClient();
    const systemPrompt = `You are an AI Assistant specialized in analyzing web pages and generating JSON schemas for a CMS (Content Management System).

Your task is to analyze the page structure and generate a valid page schema JSON that follows this exact format:
{
  "components": [
    {
      "id": "unique-component-id",
      "type": "component-type-id",
      "props": {
        // All properties matching the component definition
      }
    }
  ]
}

COMPONENT REGISTRY (Available Components):
${JSON.stringify(allComponents.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      category: c.category,
      description: c.description,
      properties: c.properties,
      tenant_scope: c.tenant_scope
    })), null, 2)}

ANALYSIS RULES:
1. **Deep Page Analysis**: Carefully examine the page structure, content, and purpose
2. **Component Matching**: Identify which components from the registry best represent the page content
3. **Schema Validation**: Ensure all generated JSON matches component definitions exactly
4. **Property Completeness**: Include ALL required properties and appropriate optional ones
5. **Unique Identifiers**: Use descriptive, unique IDs (e.g., "hero-section-1", "services-grid-1")
6. **Type Accuracy**: The "type" field must match an existing component ID from the registry
7. **Content Structure**: Generate a logical, hierarchical component structure
8. **Improvement Focus**: When analyzing existing schemas, suggest structural improvements
9. **Registry Compliance**: Only use components that exist in the provided registry
10. **Default Values**: Use sensible default values for optional properties

CURRENT PAGE INFO:
- Page Name: ${pageName || page.page_name}
- Page Slug: ${normalizedSlug}
- Tenant ID: ${tenantId}
- Current Layout: ${JSON.stringify(currentLayout, null, 2)}
- Analysis Mode: ${analyzePageCode ? "Enhanced Code Analysis" : "Standard Generation"}

${analyzePageCode ? "ENHANCED ANALYSIS MODE: Perform deep analysis of the existing page structure and provide comprehensive improvements." : ""}

Generate a complete, optimized page schema JSON. Return ONLY valid JSON, no explanations or markdown.`;
    let userPrompt = `Analyze the page "${pageName || page.page_name}" (${normalizedSlug}) and generate a complete page schema JSON based on the component registry.`;
    if (analyzePageCode && currentSchema) {
      userPrompt += `

CURRENT SCHEMA ANALYSIS:
The page currently has this schema: ${JSON.stringify(currentSchema, null, 2)}

Please analyze this existing schema and:
1. Identify any missing or incomplete components
2. Suggest improvements to the component structure
3. Ensure all components follow the registry definitions
4. Generate an enhanced version that maintains existing content but improves the structure`;
    } else if (currentLayout.components.length > 0) {
      userPrompt += `

The page currently has a layout - analyze it and generate an improved or complete schema.`;
    } else {
      userPrompt += `

The page has no layout yet - create a complete schema based on typical page structure.`;
    }
    const selectedModel = model || "claude-3-5-haiku-20241022";
    console.log("[testing] Schema generation using model:", selectedModel);
    const allowedModels = [
      // Claude 4.x models (latest)
      "claude-3-5-haiku-20241022",
      // Claude Haiku 4.x
      "claude-3-5-sonnet-20241022",
      // Claude Sonnet 4
      "claude-3-5-sonnet-20250115",
      // Claude Sonnet 4.5 (if available)
      "claude-3-5-opus-20241022",
      // Claude Opus 4
      "claude-3-5-opus-20250115",
      // Claude Opus 4.1/4.5 (if available)
      // Claude 3.x models (legacy support)
      "claude-3-7-sonnet-20250219",
      // Claude Sonnet 3.7
      "claude-3-haiku-20240307",
      // Claude Haiku 3
      "claude-3-opus-20240229"
      // Claude Opus 3
    ];
    const modelToUse = allowedModels.includes(selectedModel) ? selectedModel : "claude-3-5-haiku-20241022";
    const response = await anthropic.messages.create({
      model: modelToUse,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: userPrompt
        }
      ],
      system: systemPrompt
    });
    let assistantResponse = response.content[0].text;
    let schemaJson = assistantResponse;
    const jsonMatch = assistantResponse.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      schemaJson = jsonMatch[1];
    } else {
      const directJsonMatch = assistantResponse.match(/\{[\s\S]*\}/);
      if (directJsonMatch) {
        schemaJson = directJsonMatch[0];
      }
    }
    let schema;
    try {
      schema = JSON.parse(schemaJson);
      if (!schema.components || !Array.isArray(schema.components)) {
        schema = { components: schema.components || [] };
      }
    } catch (parseError) {
      console.error("[testing] Error parsing AI-generated schema:", parseError);
      return res.status(500).json({
        success: false,
        error: "Failed to parse AI-generated schema",
        message: parseError.message,
        rawResponse: assistantResponse
      });
    }
    res.json({
      success: true,
      schema,
      usage: response.usage
    });
  } catch (error) {
    console.error("[testing] Error generating schema:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate schema",
      message: error.message || "An unexpected error occurred"
    });
  }
});
var ai_assistant_default = router15;

// server/routes/shop.js
init_db();
init_ecommerce();
import express17 from "express";

// server/services/woocommerceClient.js
var WooCommerceClient = class {
  constructor(config) {
    if (!config.store_url || !config.consumer_key || !config.consumer_secret) {
      throw new Error("WooCommerce configuration requires store_url, consumer_key, and consumer_secret");
    }
    this.storeUrl = config.store_url.replace(/\/$/, "");
    this.consumerKey = config.consumer_key;
    this.consumerSecret = config.consumer_secret;
    this.apiVersion = config.api_version || "wc/v3";
    this.timeout = config.timeout || 3e4;
    this.baseUrl = `${this.storeUrl}/wp-json/${this.apiVersion}`;
  }
  /**
   * Create Basic Auth header for WooCommerce REST API
   * WooCommerce uses HTTP Basic Authentication with Consumer Key and Secret
   */
  getAuthHeader() {
    const credentials = `${this.consumerKey}:${this.consumerSecret}`;
    return `Basic ${Buffer.from(credentials).toString("base64")}`;
  }
  /**
   * Make HTTP request to WooCommerce API
   */
  async request(method, endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (method === "GET" && Object.keys(params).length > 0) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== void 0 && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    const options = {
      method,
      headers: {
        "Authorization": this.getAuthHeader(),
        "Content-Type": "application/json"
      },
      signal: controller.signal
    };
    if (["POST", "PUT", "PATCH"].includes(method) && Object.keys(params).length > 0) {
      options.body = JSON.stringify(params);
    }
    try {
      const response = await fetch(url.toString(), options);
      clearTimeout(timeoutId);
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") || 60;
        console.warn(`[testing] WooCommerce rate limit hit. Retry after ${retryAfter} seconds`);
        throw new Error(`Rate limit exceeded. Please retry after ${retryAfter} seconds`);
      }
      if (response.status === 401) {
        throw new Error("Invalid WooCommerce credentials. Please check your Consumer Key and Consumer Secret.");
      }
      if (response.status === 403) {
        throw new Error("Access forbidden. Please check your API permissions.");
      }
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `WooCommerce API error: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error("Request timeout. The WooCommerce store may be slow or unreachable.");
      }
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error("Network error. Please check the store URL and your internet connection.");
      }
      throw error;
    }
  }
  /**
   * Test connection to WooCommerce API
   */
  async testConnection() {
    try {
      const data = await this.request("GET", "/system_status");
      return {
        success: true,
        store_name: data.environment?.site_url || this.storeUrl,
        api_version: this.apiVersion
      };
    } catch (error) {
      try {
        await this.request("GET", "/products", { per_page: 1 });
        return {
          success: true,
          store_name: this.storeUrl,
          api_version: this.apiVersion
        };
      } catch (fallbackError) {
        return {
          success: false,
          error: error.message || "Failed to connect to WooCommerce store"
        };
      }
    }
  }
  /**
   * Get products with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} perPage - Items per page (default: 10, max: 100)
   * @param {object} filters - Additional filters (status, search, etc.)
   */
  async getProducts(page = 1, perPage = 10, filters = {}) {
    const params = {
      page: Math.max(1, page),
      per_page: Math.min(100, Math.max(1, perPage)),
      ...filters
    };
    const data = await this.request("GET", "/products", params);
    return data;
  }
  /**
   * Get single product by ID
   */
  async getProduct(id) {
    const data = await this.request("GET", `/products/${id}`);
    return data;
  }
  /**
   * Create a new product in WooCommerce
   * @param {object} productData - Product data following WooCommerce API format
   * @returns {Promise<object>} Created product
   */
  async createProduct(productData) {
    const data = await this.request("POST", "/products", productData);
    return data;
  }
  /**
   * Update an existing product
   * @param {number} id - Product ID
   * @param {object} productData - Updated product data
   * @returns {Promise<object>} Updated product
   */
  async updateProduct(id, productData) {
    const data = await this.request("PUT", `/products/${id}`, productData);
    return data;
  }
  /**
   * Create product variations
   * @param {number} productId - Parent product ID
   * @param {array} variations - Array of variation objects
   * @returns {Promise<array>} Created variations
   */
  async createVariations(productId, variations) {
    const results = [];
    for (const variation of variations) {
      const data = await this.request("POST", `/products/${productId}/variations`, variation);
      results.push(data);
    }
    return results;
  }
  /**
   * Get orders with pagination and filters
   * @param {number} page - Page number (default: 1)
   * @param {number} perPage - Items per page (default: 10, max: 100)
   * @param {object} filters - Additional filters (status, customer, after, before, etc.)
   */
  async getOrders(page = 1, perPage = 10, filters = {}) {
    const params = {
      page: Math.max(1, page),
      per_page: Math.min(100, Math.max(1, perPage)),
      ...filters
    };
    const data = await this.request("GET", "/orders", params);
    return data;
  }
  /**
   * Get single order by ID
   */
  async getOrder(id) {
    const data = await this.request("GET", `/orders/${id}`);
    return data;
  }
  /**
   * Get customers with pagination and filters
   * @param {number} page - Page number (default: 1)
   * @param {number} perPage - Items per page (default: 10, max: 100)
   * @param {object} filters - Additional filters (email, role, etc.)
   */
  async getCustomers(page = 1, perPage = 10, filters = {}) {
    const params = {
      page: Math.max(1, page),
      per_page: Math.min(100, Math.max(1, perPage)),
      ...filters
    };
    const data = await this.request("GET", "/customers", params);
    return data;
  }
  /**
   * Get total count of products (for sync planning)
   */
  async getProductsCount(filters = {}) {
    const params = {
      per_page: 1,
      ...filters
    };
    const response = await this.request("GET", "/products", params);
    return response.length || 0;
  }
  /**
   * Get total count of orders (for sync planning)
   */
  async getOrdersCount(filters = {}) {
    const params = {
      per_page: 1,
      ...filters
    };
    const response = await this.request("GET", "/orders", params);
    return response.length || 0;
  }
};
async function createWooCommerceClient(tenantId, query2) {
  const result = await query2(`
    SELECT config, is_active
    FROM tenant_integrations
    WHERE tenant_id = $1 AND integration_type = 'woocommerce'
    LIMIT 1
  `, [tenantId]);
  if (result.rows.length === 0) {
    throw new Error("WooCommerce integration not configured for this tenant");
  }
  const integration = result.rows[0];
  if (!integration.is_active) {
    throw new Error("WooCommerce integration is not active for this tenant");
  }
  const config = integration.config;
  if (!config || !config.store_url || !config.consumer_key || !config.consumer_secret) {
    throw new Error("WooCommerce credentials are incomplete. Please configure store_url, consumer_key, and consumer_secret.");
  }
  return new WooCommerceClient(config);
}

// server/routes/shop.js
import Stripe from "stripe";
var router16 = express17.Router();
var stripeInstances = /* @__PURE__ */ new Map();
async function getTenantStripe(tenantId) {
  if (!tenantId) {
    return null;
  }
  if (stripeInstances.has(tenantId)) {
    return stripeInstances.get(tenantId);
  }
  try {
    const tenantResult = await query(`
      SELECT stripe_secret_key
      FROM tenants
      WHERE id = $1
    `, [tenantId]);
    const stripeSecretKey = tenantResult.rows[0]?.stripe_secret_key;
    const secretKey = stripeSecretKey || process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return null;
    }
    const stripe2 = new Stripe(secretKey, {
      apiVersion: "2024-11-20.acacia"
    });
    stripeInstances.set(tenantId, stripe2);
    return stripe2;
  } catch (error) {
    console.error(`[testing] Error getting Stripe instance for tenant ${tenantId}:`, error);
    return null;
  }
}
async function getTenantWebhookSecret(tenantId) {
  if (!tenantId) {
    return process.env.STRIPE_WEBHOOK_SECRET || null;
  }
  try {
    const tenantResult = await query(`
      SELECT stripe_webhook_secret
      FROM tenants
      WHERE id = $1
    `, [tenantId]);
    const webhookSecret = tenantResult.rows[0]?.stripe_webhook_secret;
    return webhookSecret || process.env.STRIPE_WEBHOOK_SECRET || null;
  } catch (error) {
    console.error(`[testing] Error getting webhook secret for tenant ${tenantId}:`, error);
    return process.env.STRIPE_WEBHOOK_SECRET || null;
  }
}
var stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia"
}) : null;
function generateOrderNumber() {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}
async function getEshopProvider(tenantId) {
  try {
    const result = await query(`
      SELECT setting_value
      FROM site_settings
      WHERE setting_key = 'shop_eshop_provider'
        AND tenant_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [tenantId]);
    return result.rows.length > 0 ? result.rows[0].setting_value : "sparti";
  } catch (error) {
    console.error("[testing] Error getting e-shop provider:", error);
    return "sparti";
  }
}
router16.get("/products", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { search, limit, page = 1, per_page = 10, status, with_details } = req.query;
    const eshopProvider = await getEshopProvider(tenantId);
    if (eshopProvider === "woocommerce") {
      try {
        const syncedProducts = await query(`
          SELECT COUNT(*) as count
          FROM products
          WHERE tenant_id = $1 AND external_source = 'woocommerce'
        `, [tenantId]);
        const hasSyncedProducts = parseInt(syncedProducts.rows[0]?.count || 0) > 0;
        if (hasSyncedProducts) {
          let sql = `
            SELECT 
              p.id,
              p.name,
              p.handle as slug,
              p.description,
              p.featured_image as image_url,
              p.status,
              p.external_id,
              p.external_source,
              p.created_at,
              p.updated_at,
              COALESCE(
                (SELECT MIN(pv.price) FROM product_variants pv WHERE pv.product_id = p.id),
                (SELECT price FROM product_variants pv WHERE pv.product_id = p.id LIMIT 1),
                0
              ) as price
            FROM products p
            WHERE p.tenant_id = $1 AND p.external_source = 'woocommerce'
          `;
          const params = [tenantId];
          let paramIndex = 2;
          if (search) {
            sql += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
          }
          sql += ` ORDER BY p.created_at DESC`;
          if (limit) {
            sql += ` LIMIT $${paramIndex}`;
            params.push(parseInt(limit));
          }
          const result = await query(sql, params);
          const transformedProducts = result.rows.map((row) => ({
            product_id: row.id,
            name: row.name,
            slug: row.slug,
            price: parseFloat(row.price || 0),
            description: row.description || "",
            image_url: row.image_url,
            created_at: row.created_at,
            updated_at: row.updated_at,
            external_id: row.external_id,
            external_source: row.external_source,
            status: row.status
          }));
          res.json({
            success: true,
            data: transformedProducts,
            provider: "woocommerce-synced"
          });
          return;
        } else {
          const client = await createWooCommerceClient(tenantId, query);
          const filters2 = {};
          if (search) filters2.search = search;
          const wcProducts = await client.getProducts(
            parseInt(page) || 1,
            parseInt(per_page) || parseInt(limit) || 100,
            filters2
          );
          const transformedProducts = Array.isArray(wcProducts) ? wcProducts.map((wcProduct) => ({
            product_id: wcProduct.id,
            name: wcProduct.name || "Unnamed Product",
            slug: wcProduct.slug || wcProduct.name?.toLowerCase().replace(/\s+/g, "-") || "",
            price: parseFloat(wcProduct.price || 0),
            description: wcProduct.description || wcProduct.short_description || "",
            image_url: wcProduct.images && wcProduct.images.length > 0 ? wcProduct.images[0].src : null,
            created_at: wcProduct.date_created || (/* @__PURE__ */ new Date()).toISOString(),
            updated_at: wcProduct.date_modified || wcProduct.date_created || (/* @__PURE__ */ new Date()).toISOString(),
            // Additional WooCommerce fields
            external_id: String(wcProduct.id),
            external_source: "woocommerce",
            status: wcProduct.status,
            stock_status: wcProduct.stock_status,
            stock_quantity: wcProduct.stock_quantity
          })) : [];
          res.json({
            success: true,
            data: transformedProducts,
            provider: "woocommerce-api"
          });
          return;
        }
      } catch (wcError) {
        console.error("[testing] WooCommerce API error, falling back to Sparti:", wcError);
      }
    }
    const filters = {};
    if (search) filters.search = search;
    if (limit) filters.limit = parseInt(limit);
    if (status) filters.status = status;
    const products = with_details === "true" ? await getProductsWithDetails(tenantId, filters) : await getProducts(tenantId, filters);
    res.json({
      success: true,
      data: products,
      provider: "sparti"
    });
  } catch (error) {
    console.error("[testing] Error fetching products:", error);
    console.error("[testing] Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    if (error.code === "42P01" || error.message?.includes("does not exist") || error.message?.includes("Ecommerce tables not found")) {
      return res.status(503).json({
        success: false,
        error: "Ecommerce tables not found",
        message: "Please run database migrations: npm run sequelize:migrate",
        code: "TABLES_NOT_FOUND"
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch products",
      code: error.code
    });
  }
});
router16.get("/products/:id", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const productId = parseInt(req.params.id);
    const eshopProvider = await getEshopProvider(tenantId);
    if (eshopProvider === "woocommerce") {
      try {
        const client = await createWooCommerceClient(tenantId, query);
        const wcProduct = await client.getProduct(productId);
        if (wcProduct) {
          res.json({
            success: true,
            data: wcProduct,
            source: "woocommerce"
          });
          return;
        }
      } catch (wcError) {
        console.warn("[testing] Could not fetch product from WooCommerce, falling back to local:", wcError.message);
      }
    }
    let product = await getProductFromProductsTable(productId, tenantId);
    if (!product) {
      product = await getProduct(productId, tenantId);
    }
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }
    res.json({
      success: true,
      data: product,
      source: "local"
    });
  } catch (error) {
    console.error("[testing] Error fetching product:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.get("/products/slug/:slug", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const slug = req.params.slug;
    const product = await getProductBySlug(slug, tenantId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error("[testing] Error fetching product by slug:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.get("/products/:id/variants", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const idParam = req.params.id;
    let productId;
    const parsedId = parseInt(idParam);
    if (!isNaN(parsedId)) {
      productId = parsedId;
    } else {
      const productBySlug = await query(`
        SELECT id FROM products WHERE handle = $1 AND tenant_id = $2
        LIMIT 1
      `, [idParam, tenantId]);
      if (productBySlug.rows.length === 0) {
        const pernProduct = await query(`
          SELECT p.id 
          FROM products p
          JOIN pern_products pp ON p.handle = pp.slug
          WHERE pp.slug = $1 AND p.tenant_id = $2
          LIMIT 1
        `, [idParam, tenantId]);
        if (pernProduct.rows.length > 0) {
          productId = pernProduct.rows[0].id;
        } else {
          return res.status(404).json({
            success: false,
            error: "Product not found"
          });
        }
      } else {
        productId = productBySlug.rows[0].id;
      }
    }
    const productCheck = await query(`
      SELECT id FROM products WHERE id = $1 AND tenant_id = $2
    `, [productId, tenantId]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }
    const variantsResult = await query(`
      SELECT 
        id,
        sku,
        title,
        price,
        compare_at_price,
        inventory_quantity,
        inventory_management
      FROM product_variants
      WHERE product_id = $1 AND tenant_id = $2
      ORDER BY title ASC, price ASC
    `, [productId, tenantId]);
    res.json({
      success: true,
      data: variantsResult.rows
    });
  } catch (error) {
    console.error("[testing] Error fetching product variants:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.put("/products/:id/variants", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const idParam = req.params.id;
    const { variants } = req.body;
    if (!Array.isArray(variants)) {
      return res.status(400).json({
        success: false,
        error: "Variants must be an array"
      });
    }
    let productId;
    const parsedId = parseInt(idParam);
    if (!isNaN(parsedId)) {
      productId = parsedId;
    } else {
      const productBySlug = await query(`
        SELECT id FROM products WHERE handle = $1 AND tenant_id = $2
        LIMIT 1
      `, [idParam, tenantId]);
      if (productBySlug.rows.length === 0) {
        const pernProduct = await query(`
          SELECT p.id 
          FROM products p
          JOIN pern_products pp ON p.handle = pp.slug
          WHERE pp.slug = $1 AND p.tenant_id = $2
          LIMIT 1
        `, [idParam, tenantId]);
        if (pernProduct.rows.length > 0) {
          productId = pernProduct.rows[0].id;
        } else {
          return res.status(404).json({
            success: false,
            error: "Product not found"
          });
        }
      } else {
        productId = productBySlug.rows[0].id;
      }
    }
    const productCheck = await query(`
      SELECT id FROM products WHERE id = $1 AND tenant_id = $2
    `, [productId, tenantId]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }
    await query("BEGIN");
    try {
      const existingVariantsResult = await query(`
        SELECT id FROM product_variants
        WHERE product_id = $1 AND tenant_id = $2
      `, [productId, tenantId]);
      const existingIds = new Set(existingVariantsResult.rows.map((row) => row.id));
      const newIds = new Set(variants.filter((v) => v.id).map((v) => v.id));
      const idsToDelete = Array.from(existingIds).filter((id) => !newIds.has(id));
      if (idsToDelete.length > 0) {
        await query(`
          DELETE FROM product_variants
          WHERE id = ANY($1::int[]) AND product_id = $2 AND tenant_id = $3
        `, [idsToDelete, productId, tenantId]);
      }
      for (const variant of variants) {
        const {
          id,
          sku,
          title,
          price,
          compare_at_price,
          inventory_quantity,
          inventory_management
        } = variant;
        if (!title || title.trim() === "") {
          continue;
        }
        const priceNum = typeof price === "string" ? parseFloat(price) : price;
        const comparePriceNum = compare_at_price ? typeof compare_at_price === "string" ? parseFloat(compare_at_price) : compare_at_price : null;
        const inventoryQty = typeof inventory_quantity === "string" ? parseInt(inventory_quantity) : inventory_quantity || 0;
        const manageStock = inventory_management !== false && inventory_management !== "false";
        if (id && existingIds.has(id)) {
          await query(`
            UPDATE product_variants
            SET sku = $1,
                title = $2,
                price = $3,
                compare_at_price = $4,
                inventory_quantity = $5,
                inventory_management = $6,
                updated_at = NOW()
            WHERE id = $7 AND product_id = $8 AND tenant_id = $9
          `, [
            sku || null,
            title,
            priceNum || 0,
            comparePriceNum,
            inventoryQty,
            manageStock,
            id,
            productId,
            tenantId
          ]);
        } else {
          await query(`
            INSERT INTO product_variants (
              product_id, sku, title, price, compare_at_price,
              inventory_quantity, inventory_management, tenant_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
          `, [
            productId,
            sku || null,
            title,
            priceNum || 0,
            comparePriceNum,
            inventoryQty,
            manageStock,
            tenantId
          ]);
        }
      }
      await query("COMMIT");
      const updatedVariantsResult = await query(`
        SELECT 
          id,
          sku,
          title,
          price,
          compare_at_price,
          inventory_quantity,
          inventory_management
        FROM product_variants
        WHERE product_id = $1 AND tenant_id = $2
        ORDER BY title ASC, price ASC
      `, [productId, tenantId]);
      res.json({
        success: true,
        data: updatedVariantsResult.rows
      });
    } catch (error) {
      await query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("[testing] Error updating product variants:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.post("/products", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const {
      name,
      slug,
      price,
      sale_price,
      description,
      short_description,
      image_url,
      gallery_images,
      sku,
      manage_stock,
      stock_quantity,
      backorders,
      categories,
      tags,
      meta_title,
      meta_description,
      weight,
      length,
      width,
      height,
      shipping_class,
      status,
      featured,
      product_type,
      is_subscription,
      subscription_frequency,
      attributes,
      variations
    } = req.body;
    if (!name || !slug || price === void 0) {
      return res.status(400).json({
        success: false,
        error: "Name, slug, and price are required"
      });
    }
    await query("BEGIN");
    try {
      const product = await createProduct({
        name,
        slug,
        price: parseFloat(price),
        description: description || "",
        image_url: image_url || null
      }, tenantId);
      const productId = product.product_id;
      let mainProductId = null;
      try {
        const handle = slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        const productStatus = status === "publish" ? "active" : "draft";
        const mainProductResult = await query(`
          INSERT INTO products (
            name, description, handle, status, featured_image,
            tenant_id, external_source, is_subscription, subscription_frequency
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id
        `, [
          name,
          description || "",
          handle,
          productStatus,
          image_url || null,
          tenantId,
          "local",
          is_subscription || false,
          subscription_frequency || null
        ]);
        mainProductId = mainProductResult.rows[0]?.id;
      } catch (err) {
        console.warn("[testing] Could not create product in products table:", err.message);
      }
      if (variations && Array.isArray(variations) && variations.length > 0) {
        for (const variation of variations) {
          if (!variation.enabled) continue;
          const variantTitle = Object.entries(variation.attributes || {}).map(([key, value]) => `${key}: ${value}`).join(", ") || "Default";
          const variantProductId = mainProductId || productId;
          try {
            await query(`
              INSERT INTO product_variants (
                product_id, sku, title, price, compare_at_price,
                inventory_quantity, inventory_management, tenant_id
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
              variantProductId,
              variation.sku || null,
              variantTitle,
              parseFloat(variation.price || variation.regular_price || price),
              variation.sale_price ? parseFloat(variation.sale_price) : null,
              variation.stock_quantity || stock_quantity || 0,
              manage_stock !== false,
              tenantId
            ]);
          } catch (err) {
            console.warn("[testing] Could not create variant:", err.message);
          }
        }
      } else {
        const variantProductId = mainProductId || productId;
        try {
          await query(`
            INSERT INTO product_variants (
              product_id, sku, title, price, compare_at_price,
              inventory_quantity, inventory_management, tenant_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            variantProductId,
            sku || null,
            "Default",
            parseFloat(price),
            sale_price ? parseFloat(sale_price) : null,
            stock_quantity || 0,
            manage_stock !== false,
            tenantId
          ]);
        } catch (err) {
          console.warn("[testing] Could not create default variant:", err.message);
        }
      }
      if (categories && Array.isArray(categories) && categories.length > 0 && mainProductId) {
        for (const categoryId of categories) {
          try {
            await query(`
              INSERT INTO product_category_relations (product_id, category_id)
              VALUES ($1, $2)
              ON CONFLICT (product_id, category_id) DO NOTHING
            `, [mainProductId, categoryId]);
          } catch (err) {
            console.warn("[testing] Could not link category:", err.message);
          }
        }
      }
      let wooCommerceProductId = null;
      try {
        const integrationResult = await query(`
          SELECT config, is_active
          FROM tenant_integrations
          WHERE tenant_id = $1 AND integration_type = 'woocommerce' AND is_active = true
          LIMIT 1
        `, [tenantId]);
        if (integrationResult.rows.length > 0) {
          const client = await createWooCommerceClient(tenantId, query);
          const wcProductData = {
            name,
            type: product_type || "simple",
            regular_price: price.toString(),
            description: description || "",
            short_description: short_description || "",
            status: status || "draft",
            featured: featured || false,
            sku: sku || "",
            manage_stock: manage_stock !== false,
            stock_quantity: stock_quantity || 0,
            backorders: backorders || "no",
            weight: weight || "",
            dimensions: {
              length: length || "",
              width: width || "",
              height: height || ""
            },
            shipping_class: shipping_class || "",
            images: [],
            categories: categories || [],
            tags: tags || [],
            meta_data: []
          };
          if (image_url) {
            wcProductData.images.push({ src: image_url });
          }
          if (gallery_images && Array.isArray(gallery_images)) {
            gallery_images.forEach((url) => {
              if (url && url !== image_url) {
                wcProductData.images.push({ src: url });
              }
            });
          }
          if (product_type === "variable" && attributes && Array.isArray(attributes)) {
            wcProductData.attributes = attributes.map((attr) => ({
              name: attr.name,
              options: attr.options || [],
              variation: attr.variation !== false
            }));
          }
          const wcProduct = await client.createProduct(wcProductData);
          wooCommerceProductId = wcProduct.id;
          if (product_type === "variable" && variations && Array.isArray(variations) && variations.length > 0) {
            const wcVariations = variations.filter((v) => v.enabled).map((variation) => ({
              regular_price: (variation.price || variation.regular_price || price).toString(),
              sale_price: variation.sale_price ? variation.sale_price.toString() : "",
              sku: variation.sku || "",
              stock_quantity: variation.stock_quantity || stock_quantity || 0,
              attributes: Object.entries(variation.attributes || {}).map(([name2, value]) => ({
                name: name2,
                option: value
              })),
              image: variation.image ? [{ src: variation.image }] : []
            }));
            if (wcVariations.length > 0) {
              await client.createVariations(wooCommerceProductId, wcVariations);
            }
          }
          if (mainProductId) {
            await query(`
              UPDATE products
              SET external_id = $1, external_source = 'woocommerce'
              WHERE id = $2
            `, [String(wooCommerceProductId), mainProductId]);
          }
        }
      } catch (wcError) {
        console.error("[testing] Error creating product in WooCommerce:", wcError);
      }
      await query("COMMIT");
      res.json({
        success: true,
        data: {
          ...product,
          wooCommerceId: wooCommerceProductId
        }
      });
    } catch (error) {
      await query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("[testing] Error creating product:", error);
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        error: "Product with this slug already exists for this tenant"
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.put("/products/:id", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const productId = parseInt(req.params.id);
    const { name, slug, price, description, image_url } = req.body;
    const productData = {};
    if (name !== void 0) productData.name = name;
    if (slug !== void 0) productData.slug = slug;
    if (price !== void 0) productData.price = parseFloat(price);
    if (description !== void 0) productData.description = description;
    if (image_url !== void 0) productData.image_url = image_url;
    const product = await updateProduct(productId, productData, tenantId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error("[testing] Error updating product:", error);
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        error: "Product with this slug already exists for this tenant"
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.delete("/products/:id", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const productId = parseInt(req.params.id);
    const deleted = await deleteProduct(productId, tenantId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }
    res.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("[testing] Error deleting product:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.get("/cart/guest", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const cart = await getOrCreateGuestCart(tenantId);
    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error("[testing] Error fetching guest cart:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.get("/cart/:cartId", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const cartId = parseInt(req.params.cartId);
    if (isNaN(cartId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid cart ID"
      });
    }
    const cart = await getCartById(cartId, tenantId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: "Cart not found"
      });
    }
    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error("[testing] Error fetching cart by ID:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.post("/cart/:cartId/associate", authenticateUser, authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.id;
    const cartId = parseInt(req.params.cartId);
    if (isNaN(cartId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid cart ID"
      });
    }
    const result = await associateCartWithUser(cartId, userId, tenantId);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: "Cart not found or already associated with a user"
      });
    }
    res.json({
      success: true,
      data: result,
      message: "Cart associated with user account"
    });
  } catch (error) {
    console.error("[testing] Error associating cart with user:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.post("/cart/guest/:cartId", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const cartId = parseInt(req.params.cartId);
    const { product_id, quantity } = req.body;
    if (isNaN(cartId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid cart ID"
      });
    }
    if (!product_id || !quantity) {
      return res.status(400).json({
        success: false,
        error: "Product ID and quantity are required"
      });
    }
    const cartItem = await addToCartById(cartId, parseInt(product_id), parseInt(quantity), tenantId);
    res.json({
      success: true,
      data: cartItem
    });
  } catch (error) {
    console.error("[testing] Error adding to guest cart:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.put("/cart/guest/:itemId", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const cartItemId = parseInt(req.params.itemId);
    const { quantity } = req.body;
    if (quantity === void 0) {
      return res.status(400).json({
        success: false,
        error: "Quantity is required"
      });
    }
    const cartItem = await updateCartItem(cartItemId, parseInt(quantity), tenantId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: "Cart item not found"
      });
    }
    res.json({
      success: true,
      data: cartItem
    });
  } catch (error) {
    console.error("[testing] Error updating guest cart item:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.delete("/cart/guest/:itemId", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const cartItemId = parseInt(req.params.itemId);
    const deleted = await removeFromCart(cartItemId, tenantId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Cart item not found"
      });
    }
    res.json({
      success: true,
      message: "Item removed from cart"
    });
  } catch (error) {
    console.error("[testing] Error removing from guest cart:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.get("/cart", authenticateUser, authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.id;
    const cart = await getCart(userId, tenantId);
    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error("[testing] Error fetching cart:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.post("/cart", authenticateUser, authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.id;
    const { product_id, quantity } = req.body;
    if (!product_id || !quantity) {
      return res.status(400).json({
        success: false,
        error: "Product ID and quantity are required"
      });
    }
    const cartItem = await addToCart(userId, parseInt(product_id), parseInt(quantity), tenantId);
    res.json({
      success: true,
      data: cartItem
    });
  } catch (error) {
    console.error("[testing] Error adding to cart:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.put("/cart/:itemId", authenticateUser, authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const cartItemId = parseInt(req.params.itemId);
    const { quantity } = req.body;
    if (quantity === void 0) {
      return res.status(400).json({
        success: false,
        error: "Quantity is required"
      });
    }
    const cartItem = await updateCartItem(cartItemId, parseInt(quantity), tenantId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: "Cart item not found"
      });
    }
    res.json({
      success: true,
      data: cartItem
    });
  } catch (error) {
    console.error("[testing] Error updating cart item:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.delete("/cart/:itemId", authenticateUser, authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const cartItemId = parseInt(req.params.itemId);
    const deleted = await removeFromCart(cartItemId, tenantId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Cart item not found"
      });
    }
    res.json({
      success: true,
      message: "Item removed from cart"
    });
  } catch (error) {
    console.error("[testing] Error removing from cart:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.get("/categories", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const result = await query(`
      SELECT 
        id,
        name,
        slug,
        description,
        parent_id,
        created_at,
        updated_at
      FROM product_categories
      WHERE tenant_id = $1
      ORDER BY parent_id NULLS FIRST, name ASC
    `, [tenantId]);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error("[testing] Error fetching categories:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.post("/categories", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { name, slug, description, parent_id } = req.body;
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        error: "Name and slug are required"
      });
    }
    const result = await query(`
      INSERT INTO product_categories (name, slug, description, parent_id, tenant_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, slug, description || null, parent_id || null, tenantId]);
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error("[testing] Error creating category:", error);
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        error: "Category with this slug already exists for this tenant"
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.put("/categories/:id", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const categoryId = req.params.id;
    const { name, slug, description, parent_id } = req.body;
    const result = await query(`
      UPDATE product_categories 
      SET name = COALESCE($1, name),
          slug = COALESCE($2, slug),
          description = COALESCE($3, description),
          parent_id = COALESCE($4, parent_id)
      WHERE id = $5 AND tenant_id = $6
      RETURNING *
    `, [name, slug, description, parent_id, categoryId, tenantId]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Category not found"
      });
    }
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error("[testing] Error updating category:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.delete("/categories/:id", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const categoryId = req.params.id;
    const result = await query(`
      DELETE FROM product_categories 
      WHERE id = $1 AND tenant_id = $2
      RETURNING id
    `, [categoryId, tenantId]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Category not found"
      });
    }
    res.json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    console.error("[testing] Error deleting category:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.get("/orders", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { status, userId, dateFrom, dateTo, limit, page = 1, per_page = 10 } = req.query;
    const eshopProvider = await getEshopProvider(tenantId);
    if (eshopProvider === "woocommerce") {
      try {
        const client = await createWooCommerceClient(tenantId, query);
        const filters2 = {};
        if (status) filters2.status = status;
        if (dateFrom) filters2.after = dateFrom;
        if (dateTo) filters2.before = dateTo;
        const wcOrders = await client.getOrders(
          parseInt(page) || 1,
          parseInt(per_page) || parseInt(limit) || 10,
          filters2
        );
        const transformedOrders = Array.isArray(wcOrders) ? wcOrders.map((wcOrder) => {
          const billing = wcOrder.billing || {};
          const paymentMethod = wcOrder.payment_method ? wcOrder.payment_method.toUpperCase() : null;
          const statusMap = {
            "pending": "pending",
            "processing": "processing",
            "on-hold": "pending",
            "completed": "completed",
            "cancelled": "cancelled",
            "refunded": "refunded",
            "failed": "failed"
          };
          const wcStatus = wcOrder.status?.toLowerCase() || "pending";
          const mappedStatus = statusMap[wcStatus] || wcStatus;
          const totalAmount = parseFloat(String(wcOrder.total || 0));
          return {
            order_id: parseInt(String(wcOrder.id || 0)),
            user_id: parseInt(String(wcOrder.customer_id || 0)),
            user_email: billing.email || null,
            user_name: billing.first_name && billing.last_name ? `${billing.first_name} ${billing.last_name}`.trim() : billing.first_name || billing.last_name || null,
            status: mappedStatus,
            date: wcOrder.date_created || wcOrder.date_modified || (/* @__PURE__ */ new Date()).toISOString(),
            amount: totalAmount,
            total: totalAmount,
            ref: wcOrder.number || `WC-${wcOrder.id}`,
            payment_method: paymentMethod === "STRIPE" || paymentMethod === "PAYSTACK" ? paymentMethod : paymentMethod ? paymentMethod : null,
            // Additional WooCommerce fields
            external_id: String(wcOrder.id),
            external_source: "woocommerce",
            line_items: wcOrder.line_items || [],
            billing_address: billing,
            shipping_address: wcOrder.shipping || {}
          };
        }) : [];
        res.json({
          success: true,
          data: transformedOrders || [],
          provider: "woocommerce"
        });
        return;
      } catch (wcError) {
        console.error("[testing] WooCommerce API error, falling back to Sparti:", wcError);
      }
    }
    const filters = {};
    if (status) filters.status = status;
    if (userId) filters.userId = parseInt(userId);
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (limit) filters.limit = parseInt(limit);
    const orders = await getOrders(tenantId, filters);
    res.json({
      success: true,
      data: orders,
      provider: "sparti"
    });
  } catch (error) {
    console.error("[testing] Error fetching orders:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.get("/orders/:id", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const orderId = parseInt(req.params.id);
    const eshopProvider = await getEshopProvider(tenantId);
    if (eshopProvider === "woocommerce") {
      try {
        const client = await createWooCommerceClient(tenantId, query);
        const wcOrder = await client.getOrder(orderId);
        if (!wcOrder) {
          return res.status(404).json({
            success: false,
            error: "Order not found"
          });
        }
        const billing = wcOrder.billing || {};
        const shipping = wcOrder.shipping || {};
        const statusMap = {
          "pending": "pending",
          "processing": "processing",
          "on-hold": "pending",
          "completed": "completed",
          "cancelled": "cancelled",
          "refunded": "refunded",
          "failed": "failed"
        };
        const wcStatus = wcOrder.status?.toLowerCase() || "pending";
        const mappedStatus = statusMap[wcStatus] || wcStatus;
        const paymentMethod = wcOrder.payment_method ? wcOrder.payment_method.toUpperCase() : null;
        const transformedOrder = {
          order_id: parseInt(String(wcOrder.id || 0)),
          order_number: wcOrder.number || `WC-${wcOrder.id}`,
          user_id: parseInt(String(wcOrder.customer_id || 0)),
          user_email: billing.email || null,
          user_name: billing.first_name && billing.last_name ? `${billing.first_name} ${billing.last_name}`.trim() : billing.first_name || billing.last_name || null,
          customer_email: billing.email || null,
          customer_first_name: billing.first_name || null,
          customer_last_name: billing.last_name || null,
          status: mappedStatus,
          date: wcOrder.date_created || wcOrder.date_modified || (/* @__PURE__ */ new Date()).toISOString(),
          amount: parseFloat(String(wcOrder.total || 0)),
          total: parseFloat(String(wcOrder.total || 0)),
          total_amount: parseFloat(String(wcOrder.total || 0)),
          subtotal: parseFloat(String(wcOrder.subtotal || 0)),
          tax_amount: parseFloat(String(wcOrder.total_tax || 0)),
          shipping_amount: parseFloat(String(wcOrder.shipping_total || 0)),
          ref: wcOrder.number || `WC-${wcOrder.id}`,
          payment_method: paymentMethod === "STRIPE" || paymentMethod === "PAYSTACK" ? paymentMethod : paymentMethod ? paymentMethod : null,
          external_id: String(wcOrder.id),
          external_source: "woocommerce",
          billing_address: billing.address_1 ? {
            first_name: billing.first_name || null,
            last_name: billing.last_name || null,
            company: billing.company || null,
            address_1: billing.address_1 || null,
            address_2: billing.address_2 || null,
            city: billing.city || null,
            state: billing.state || null,
            postcode: billing.postcode || null,
            country: billing.country || null,
            email: billing.email || null,
            phone: billing.phone || null
          } : null,
          shipping_address: shipping.address_1 ? {
            first_name: shipping.first_name || null,
            last_name: shipping.last_name || null,
            company: shipping.company || null,
            address_1: shipping.address_1 || null,
            address_2: shipping.address_2 || null,
            city: shipping.city || null,
            state: shipping.state || null,
            postcode: shipping.postcode || null,
            country: shipping.country || null
          } : null,
          line_items: wcOrder.line_items || []
        };
        res.json({
          success: true,
          data: transformedOrder
        });
        return;
      } catch (wcError) {
        console.error("[testing] Error fetching order from WooCommerce:", wcError);
      }
    }
    const order = await getOrder(orderId, tenantId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found"
      });
    }
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error("[testing] Error fetching order:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.post("/orders", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    let userId = null;
    if (req.user) {
      userId = req.body.user_id && (req.user.is_super_admin || req.user.role === "admin") ? parseInt(req.body.user_id) : req.user.id;
    } else if (req.body.user_id) {
      userId = parseInt(req.body.user_id);
    }
    const {
      items,
      amount,
      total,
      ref,
      payment_method,
      status,
      guest_email,
      guest_name
    } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Order must have at least one item"
      });
    }
    if (payment_method && !["PAYSTACK", "STRIPE"].includes(payment_method)) {
      return res.status(400).json({
        success: false,
        error: "Payment method must be PAYSTACK or STRIPE"
      });
    }
    let stripePaymentIntentId = null;
    let stripeClientSecret = null;
    let orderRef = ref || generateOrderNumber();
    if (payment_method === "STRIPE") {
      const stripe2 = await getTenantStripe(tenantId);
      if (!stripe2) {
        return res.status(400).json({
          success: false,
          error: "Stripe is not configured for this tenant. Please configure your Stripe secret key in Shop Settings."
        });
      }
      try {
        const tenantResult = await query(`
          SELECT stripe_connect_account_id, stripe_connect_onboarding_completed
          FROM tenants
          WHERE id = $1
        `, [tenantId]);
        const tenant = tenantResult.rows[0];
        const hasStripeConnect = tenant?.stripe_connect_account_id && tenant?.stripe_connect_onboarding_completed;
        if (hasStripeConnect) {
          const paymentIntent = await stripe2.paymentIntents.create({
            amount: Math.round((total || amount || 0) * 100),
            // Convert to cents
            currency: "usd",
            metadata: {
              tenant_id: tenantId,
              user_id: userId ? userId.toString() : "guest",
              order_ref: orderRef,
              guest_email: guest_email || "",
              guest_name: guest_name || ""
            }
          }, {
            stripeAccount: tenant.stripe_connect_account_id
            // Use connected account
          });
          stripePaymentIntentId = paymentIntent.id;
          stripeClientSecret = paymentIntent.client_secret;
          orderRef = paymentIntent.id;
          console.log(`[testing] Created Stripe Payment Intent ${stripePaymentIntentId} for order ${orderRef} on Connect account ${tenant.stripe_connect_account_id}`);
        } else {
          const paymentIntent = await stripe2.paymentIntents.create({
            amount: Math.round((total || amount || 0) * 100),
            // Convert to cents
            currency: "usd",
            metadata: {
              tenant_id: tenantId,
              user_id: userId ? userId.toString() : "guest",
              order_ref: orderRef,
              guest_email: guest_email || "",
              guest_name: guest_name || ""
            }
          });
          stripePaymentIntentId = paymentIntent.id;
          stripeClientSecret = paymentIntent.client_secret;
          orderRef = paymentIntent.id;
          console.log(`[testing] Created Stripe Payment Intent ${stripePaymentIntentId} for order ${orderRef} (direct payment, no Connect required)`);
        }
      } catch (stripeError) {
        console.error("[testing] Error creating Stripe Payment Intent:", stripeError);
        return res.status(500).json({
          success: false,
          error: `Failed to create Stripe payment intent: ${stripeError.message || "Unknown error"}`
        });
      }
    }
    const order = await createOrder({
      user_id: userId,
      // Can be null for guest orders
      status: status || "pending",
      // Allow status to be set for manual orders
      amount: amount || null,
      total: total || null,
      ref: orderRef,
      // Use Payment Intent ID if Stripe, otherwise use provided ref or generated
      payment_method: payment_method || null,
      guest_email: guest_email || null,
      guest_name: guest_name || null,
      items: items.map((item) => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity)
      }))
    }, tenantId);
    res.json({
      success: true,
      data: {
        ...order,
        stripe_payment_intent_id: stripePaymentIntentId,
        // Include in response
        stripe_client_secret: stripeClientSecret
        // Include client_secret for frontend payment confirmation
      }
    });
  } catch (error) {
    console.error("[testing] Error creating order:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.put("/orders/:id/status", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const orderId = parseInt(req.params.id);
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Status is required"
      });
    }
    const order = await updateOrderStatus(orderId, status, tenantId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found"
      });
    }
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error("[testing] Error updating order status:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.get("/products/:productId/reviews", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const productId = parseInt(req.params.productId);
    const reviews = await getReviews(productId, tenantId);
    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error("[testing] Error fetching reviews:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.post("/products/:productId/reviews", authenticateUser, authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const productId = parseInt(req.params.productId);
    const userId = req.user.id;
    const { content, rating } = req.body;
    if (!content || !rating) {
      return res.status(400).json({
        success: false,
        error: "Content and rating are required"
      });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: "Rating must be between 1 and 5"
      });
    }
    const review = await createReview({
      product_id: productId,
      user_id: userId,
      content,
      rating: parseInt(rating)
    }, tenantId);
    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error("[testing] Error creating review:", error);
    if (error.message.includes("already reviewed")) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.delete("/reviews/:id", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const reviewId = parseInt(req.params.id);
    const deleted = await deleteReview(reviewId, tenantId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Review not found"
      });
    }
    res.json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    console.error("[testing] Error deleting review:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.put("/stripe/config", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { stripe_secret_key, stripe_publishable_key, stripe_webhook_secret } = req.body;
    const hasSecret = stripe_secret_key !== void 0;
    const hasPublishable = stripe_publishable_key !== void 0;
    const hasWebhook = stripe_webhook_secret !== void 0;
    if (!hasSecret && !hasPublishable && !hasWebhook) {
      return res.status(400).json({
        success: false,
        error: "At least one of stripe_secret_key, stripe_publishable_key, or stripe_webhook_secret must be provided"
      });
    }
    const updates = [];
    const values = [];
    let paramIndex = 1;
    if (stripe_secret_key !== void 0) {
      updates.push(`stripe_secret_key = $${paramIndex}`);
      values.push(stripe_secret_key === "" ? null : stripe_secret_key);
      paramIndex++;
      stripeInstances.delete(tenantId);
    }
    if (stripe_publishable_key !== void 0) {
      updates.push(`stripe_publishable_key = $${paramIndex}`);
      values.push(stripe_publishable_key === "" ? null : stripe_publishable_key);
      paramIndex++;
    }
    if (stripe_webhook_secret !== void 0) {
      updates.push(`stripe_webhook_secret = $${paramIndex}`);
      values.push(stripe_webhook_secret === "" ? null : stripe_webhook_secret);
      paramIndex++;
    }
    values.push(tenantId);
    await query(`
      UPDATE tenants 
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
    `, values);
    res.json({
      success: true,
      message: "Stripe configuration updated successfully"
    });
  } catch (error) {
    console.error("[testing] Error updating Stripe configuration:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.get("/stripe/config", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const result = await query(`
      SELECT 
        stripe_secret_key,
        stripe_publishable_key,
        stripe_webhook_secret,
        stripe_connect_account_id,
        stripe_connect_onboarding_completed
      FROM tenants
      WHERE id = $1
    `, [tenantId]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Tenant not found"
      });
    }
    const row = result.rows[0];
    const safeConfig = {
      has_stripe_secret_key: !!row.stripe_secret_key,
      stripe_secret_key_last4: row.stripe_secret_key ? String(row.stripe_secret_key).slice(-4) : null,
      has_stripe_publishable_key: !!row.stripe_publishable_key,
      stripe_publishable_key_last4: row.stripe_publishable_key ? String(row.stripe_publishable_key).slice(-4) : null,
      has_stripe_webhook_secret: !!row.stripe_webhook_secret,
      stripe_webhook_secret_last4: row.stripe_webhook_secret ? String(row.stripe_webhook_secret).slice(-4) : null,
      stripe_connect_account_id: row.stripe_connect_account_id,
      stripe_connect_onboarding_completed: row.stripe_connect_onboarding_completed
    };
    res.json({
      success: true,
      data: safeConfig
    });
  } catch (error) {
    console.error("[testing] Error fetching Stripe configuration:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.get("/stripe/publishable-key", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const tenantResult = await query(`
      SELECT stripe_publishable_key, stripe_secret_key
      FROM tenants
      WHERE id = $1
    `, [tenantId]);
    let publishableKey = tenantResult.rows[0]?.stripe_publishable_key;
    if (!publishableKey) {
      const stripeSecretKey = tenantResult.rows[0]?.stripe_secret_key || process.env.STRIPE_SECRET_KEY;
      if (!stripeSecretKey) {
        return res.status(404).json({
          success: false,
          error: "Stripe is not configured for this tenant. Please set both stripe_secret_key and stripe_publishable_key in tenant settings."
        });
      }
      try {
        const stripe2 = new Stripe(stripeSecretKey, {
          apiVersion: "2024-11-20.acacia"
        });
        const account = await stripe2.accounts.retrieve();
        publishableKey = account.settings?.publishable_key || null;
        if (publishableKey) {
          await query(`
            UPDATE tenants
            SET stripe_publishable_key = $1
            WHERE id = $2
          `, [publishableKey, tenantId]);
          console.log("[testing] Retrieved and stored publishable key from Stripe API");
        }
      } catch (stripeError) {
        console.error("[testing] Error retrieving publishable key from Stripe:", stripeError);
        return res.status(404).json({
          success: false,
          error: "Stripe publishable key is not configured. Please set stripe_publishable_key in tenant settings. You can find it in your Stripe Dashboard under API keys."
        });
      }
    }
    if (!publishableKey) {
      return res.status(404).json({
        success: false,
        error: "Stripe publishable key is not configured. Please set stripe_publishable_key in tenant settings."
      });
    }
    res.json({
      success: true,
      data: {
        publishable_key: publishableKey
      }
    });
  } catch (error) {
    console.error("[testing] Error getting Stripe publishable key:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.post("/stripe/connect", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const stripe2 = await getTenantStripe(tenantId);
    if (!stripe2) {
      return res.status(500).json({
        success: false,
        error: "Stripe is not configured for this tenant. Please set stripe_secret_key in tenant settings or STRIPE_SECRET_KEY environment variable."
      });
    }
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const tenantResult = await query(`
      SELECT stripe_connect_account_id, stripe_connect_onboarding_completed
      FROM tenants
      WHERE id = $1
    `, [tenantId]);
    let accountId = tenantResult.rows[0]?.stripe_connect_account_id;
    let onboardingCompleted = tenantResult.rows[0]?.stripe_connect_onboarding_completed || false;
    if (accountId && stripe2) {
      try {
        const account = await stripe2.accounts.retrieve(accountId);
        const isActuallyReady = account.details_submitted && account.charges_enabled;
        if (isActuallyReady !== onboardingCompleted) {
          await query(`
            UPDATE tenants 
            SET stripe_connect_onboarding_completed = $1
            WHERE id = $2
          `, [isActuallyReady, tenantId]);
          onboardingCompleted = isActuallyReady;
        }
        if (onboardingCompleted) {
          return res.json({
            success: true,
            data: {
              accountId,
              onboardingCompleted: true,
              message: "Stripe account is already connected"
            }
          });
        }
      } catch (stripeError) {
        if (stripeError.code === "resource_missing") {
          await query(`
            UPDATE tenants 
            SET stripe_connect_account_id = NULL,
                stripe_connect_onboarding_completed = false
            WHERE id = $1
          `, [tenantId]);
          accountId = null;
        } else {
          throw stripeError;
        }
      }
    }
    if (!accountId) {
      const account = await stripe2.accounts.create({
        type: "express",
        country: "US",
        // Make this configurable
        email: req.user?.email
      });
      accountId = account.id;
      await query(`
        UPDATE tenants 
        SET stripe_connect_account_id = $1,
            stripe_connect_onboarding_completed = false
        WHERE id = $2
      `, [accountId, tenantId]);
    }
    const accountLink = await stripe2.accountLinks.create({
      account: accountId,
      refresh_url: `${frontendUrl}/admin?tab=shop-settings&stripe=refresh`,
      return_url: `${frontendUrl}/admin?tab=shop-settings&stripe=success`,
      type: "account_onboarding"
    });
    res.json({
      success: true,
      data: {
        url: accountLink.url,
        accountId,
        onboardingCompleted: false
      }
    });
  } catch (error) {
    console.error("[testing] Error creating Stripe Connect:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.get("/stripe/status", authenticateTenantApiKey, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const result = await query(`
      SELECT 
        stripe_connect_account_id,
        stripe_connect_onboarding_completed
      FROM tenants
      WHERE id = $1
    `, [tenantId]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Tenant not found"
      });
    }
    const tenant = result.rows[0];
    let accountDetails = null;
    let onboardingCompleted = tenant.stripe_connect_onboarding_completed || false;
    const stripe2 = await getTenantStripe(tenantId);
    if (tenant.stripe_connect_account_id && stripe2) {
      try {
        const account = await stripe2.accounts.retrieve(tenant.stripe_connect_account_id);
        accountDetails = {
          id: account.id,
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          details_submitted: account.details_submitted,
          email: account.email,
          country: account.country
        };
        const isActuallyReady = account.details_submitted && account.charges_enabled;
        if (isActuallyReady && !onboardingCompleted) {
          await query(`
            UPDATE tenants 
            SET stripe_connect_onboarding_completed = true
            WHERE id = $1
          `, [tenantId]);
          onboardingCompleted = true;
          console.log(`[testing] Updated onboarding status for tenant ${tenantId} based on Stripe account status`);
        }
        if (!isActuallyReady && onboardingCompleted) {
          await query(`
            UPDATE tenants 
            SET stripe_connect_onboarding_completed = false
            WHERE id = $1
          `, [tenantId]);
          onboardingCompleted = false;
          console.log(`[testing] Reset onboarding status for tenant ${tenantId} - account not ready in Stripe`);
        }
      } catch (stripeError) {
        console.error("[testing] Error fetching Stripe account:", stripeError);
        if (stripeError.code === "resource_missing") {
          await query(`
            UPDATE tenants 
            SET stripe_connect_account_id = NULL,
                stripe_connect_onboarding_completed = false
            WHERE id = $1
          `, [tenantId]);
          onboardingCompleted = false;
        }
      }
    }
    res.json({
      success: true,
      data: {
        accountId: tenant.stripe_connect_account_id,
        onboardingCompleted,
        accountDetails
      }
    });
  } catch (error) {
    console.error("[testing] Error checking Stripe status:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.post("/stripe/webhook", async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    let event = null;
    let verifiedTenantId = null;
    let accountId = null;
    try {
      const globalWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (globalWebhookSecret) {
        const globalStripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-11-20.acacia" }) : null;
        if (globalStripe) {
          try {
            event = globalStripe.webhooks.constructEvent(req.body, sig, globalWebhookSecret);
            if (event?.data?.object?.id) {
              accountId = event.data.object.id;
            }
          } catch (err) {
          }
        }
      }
    } catch (err) {
    }
    if (accountId && !event) {
      const tenantResult = await query(`
        SELECT id, stripe_webhook_secret
        FROM tenants
        WHERE stripe_connect_account_id = $1
      `, [accountId]);
      if (tenantResult.rows.length > 0) {
        const tenant = tenantResult.rows[0];
        verifiedTenantId = tenant.id;
        const tenantStripe = await getTenantStripe(tenant.id);
        const tenantWebhookSecret = await getTenantWebhookSecret(tenant.id);
        if (tenantStripe && tenantWebhookSecret) {
          try {
            event = tenantStripe.webhooks.constructEvent(req.body, sig, tenantWebhookSecret);
          } catch (err) {
            console.error(`[testing] Webhook signature verification failed for tenant ${tenant.id}:`, err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
          }
        }
      }
    }
    if (!event) {
      const globalWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!globalWebhookSecret) {
        console.warn("[testing] No webhook secret configured, skipping webhook verification");
        return res.json({ received: true });
      }
      const globalStripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-11-20.acacia" }) : null;
      if (!globalStripe) {
        return res.status(500).json({
          success: false,
          error: "Stripe is not configured"
        });
      }
      try {
        event = globalStripe.webhooks.constructEvent(req.body, sig, globalWebhookSecret);
      } catch (err) {
        console.error("[testing] Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    }
    if (event && event.type === "account.updated") {
      const account = event.data.object;
      if (!verifiedTenantId && account.id) {
        const tenantResult = await query(`
          SELECT id
          FROM tenants
          WHERE stripe_connect_account_id = $1
        `, [account.id]);
        if (tenantResult.rows.length > 0) {
          verifiedTenantId = tenantResult.rows[0].id;
        }
      }
      if (verifiedTenantId) {
        await query(`
          UPDATE tenants 
          SET stripe_connect_onboarding_completed = $1
          WHERE id = $2
        `, [account.details_submitted && account.charges_enabled, verifiedTenantId]);
      } else if (account.id) {
        await query(`
          UPDATE tenants 
          SET stripe_connect_onboarding_completed = $1
          WHERE stripe_connect_account_id = $2
        `, [account.details_submitted && account.charges_enabled, account.id]);
      }
    }
    if (event && event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      const orderResult = await query(`
        SELECT id, tenant_id
        FROM orders
        WHERE ref = $1 OR stripe_payment_intent_id = $1
      `, [paymentIntentId]);
      if (orderResult.rows.length > 0) {
        const order = orderResult.rows[0];
        await query(`
          UPDATE orders
          SET status = 'paid'
          WHERE id = $1
        `, [order.id]);
        console.log(`[testing] Updated order ${order.id} status to 'paid' after successful payment intent ${paymentIntentId}`);
      } else {
        console.warn(`[testing] Could not find order for payment intent ${paymentIntentId}`);
      }
    }
    res.json({ received: true });
  } catch (error) {
    console.error("[testing] Error processing Stripe webhook:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router16.get("/clients", authenticateUser, async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user.tenant_id;
    const eshopProvider = await getEshopProvider(tenantId);
    if (eshopProvider === "woocommerce") {
      try {
        const client = await createWooCommerceClient(tenantId, query);
        const wcCustomers = await client.getCustomers(1, 100, {
          orderby: "registered_date",
          order: "desc"
        });
        const customers = wcCustomers.map((wcCustomer) => ({
          id: `wc-${wcCustomer.id}`,
          email: wcCustomer.email || null,
          first_name: wcCustomer.first_name || null,
          last_name: wcCustomer.last_name || null,
          phone: wcCustomer.billing?.phone || null,
          company: wcCustomer.billing?.company || null,
          address: wcCustomer.billing ? {
            address_1: wcCustomer.billing.address_1 || null,
            address_2: wcCustomer.billing.address_2 || null,
            city: wcCustomer.billing.city || null,
            state: wcCustomer.billing.state || null,
            postcode: wcCustomer.billing.postcode || null,
            country: wcCustomer.billing.country || null
          } : null,
          orders_count: wcCustomer.orders_count || 0,
          total_spent: parseFloat(wcCustomer.total_spent || 0),
          date_created: wcCustomer.date_created || null,
          external_id: String(wcCustomer.id),
          external_source: "woocommerce"
        }));
        return res.json(customers);
      } catch (wcError) {
        console.error("[testing] Error fetching WooCommerce customers:", wcError);
      }
    }
    const result = await query(`
      SELECT DISTINCT ON (COALESCE(customer_email, ''))
        customer_email as email,
        customer_first_name as first_name,
        customer_last_name as last_name,
        billing_address->>'phone' as phone,
        billing_address->>'company' as company,
        billing_address as address,
        COUNT(*) OVER (PARTITION BY COALESCE(customer_email, '')) as orders_count,
        SUM(total_amount) OVER (PARTITION BY COALESCE(customer_email, '')) as total_spent,
        MIN(created_at) OVER (PARTITION BY COALESCE(customer_email, '')) as date_created
      FROM orders
      WHERE tenant_id = $1 
        AND customer_email IS NOT NULL 
        AND customer_email != ''
      ORDER BY COALESCE(customer_email, ''), created_at DESC
    `, [tenantId]);
    const clients = result.rows.map((row) => ({
      id: `sparti-${row.email}`,
      email: row.email,
      first_name: row.first_name,
      last_name: row.last_name,
      phone: row.phone || null,
      company: row.company || null,
      address: row.address || null,
      orders_count: parseInt(row.orders_count || 0),
      total_spent: parseFloat(row.total_spent || 0),
      date_created: row.date_created,
      external_source: "sparti"
    }));
    res.json(clients);
  } catch (error) {
    console.error("[testing] Error getting clients:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
var shop_default = router16;

// server/routes/media.js
import express18 from "express";
init_media();
import path5 from "path";
import { fileURLToPath as fileURLToPath11 } from "url";
import { dirname as dirname9 } from "path";
var __filename11 = fileURLToPath11(import.meta.url);
var __dirname11 = dirname9(__filename11);
var router17 = express18.Router();
router17.get("/folders", authenticateUser, async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required" });
    }
    const parentFolderId = req.query.parent_folder_id ? parseInt(req.query.parent_folder_id) : null;
    const folders = await getMediaFolders(tenantId, parentFolderId);
    res.json(folders);
  } catch (error) {
    console.error("[testing] Error fetching media folders:", error);
    res.status(500).json({ error: "Failed to fetch media folders" });
  }
});
router17.post("/folders", authenticateUser, async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenant_id || req.body.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required" });
    }
    const folder = await createMediaFolder(req.body, tenantId);
    res.status(201).json(folder);
  } catch (error) {
    console.error("[testing] Error creating media folder:", error);
    if (error.message && error.message.includes("already exists")) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to create media folder" });
  }
});
router17.put("/folders/:id", authenticateUser, async (req, res) => {
  try {
    const folderId = parseInt(req.params.id);
    const tenantId = req.tenantId || req.user?.tenant_id || req.body.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required" });
    }
    const folder = await updateMediaFolder(folderId, req.body, tenantId);
    res.json(folder);
  } catch (error) {
    console.error("[testing] Error updating media folder:", error);
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to update media folder" });
  }
});
router17.delete("/folders/:id", authenticateUser, async (req, res) => {
  try {
    const folderId = parseInt(req.params.id);
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required" });
    }
    await deleteMediaFolder(folderId, tenantId);
    res.json({ success: true, message: "Folder deleted successfully" });
  } catch (error) {
    console.error("[testing] Error deleting media folder:", error);
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to delete media folder" });
  }
});
router17.get("/files", authenticateUser, async (req, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required" });
    }
    const filters = {
      folder_id: req.query.folder_id ? parseInt(req.query.folder_id) : void 0,
      media_type: req.query.media_type,
      search: req.query.search,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };
    const result = await getMediaFiles(tenantId, filters);
    res.json(result);
  } catch (error) {
    console.error("[testing] Error fetching media files:", error);
    res.status(500).json({ error: "Failed to fetch media files" });
  }
});
router17.get("/files/:id", authenticateUser, async (req, res) => {
  try {
    const mediaId = parseInt(req.params.id);
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required" });
    }
    const file = await getMediaFile(mediaId, tenantId);
    if (!file) {
      return res.status(404).json({ error: "Media file not found" });
    }
    res.json(file);
  } catch (error) {
    console.error("[testing] Error fetching media file:", error);
    res.status(500).json({ error: "Failed to fetch media file" });
  }
});
router17.post("/upload", authenticateUser, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const tenantId = req.tenantId || req.user?.tenant_id || req.body.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required" });
    }
    const storageName = await getTenantStorageName(tenantId);
    const slug = req.file.originalname.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + "-" + Date.now();
    let mediaType = "other";
    if (req.file.mimetype.startsWith("image/")) mediaType = "image";
    else if (req.file.mimetype.startsWith("video/")) mediaType = "video";
    else if (req.file.mimetype.startsWith("audio/")) mediaType = "audio";
    else if (req.file.mimetype.includes("pdf") || req.file.mimetype.includes("document") || req.file.mimetype.includes("text")) mediaType = "document";
    const fileExtension = path5.extname(req.file.originalname).slice(1).toLowerCase();
    const relativePath = `/uploads/${storageName}/${req.file.filename}`;
    const url = relativePath;
    const mediaData = {
      filename: req.file.filename,
      original_filename: req.file.originalname,
      slug,
      alt_text: req.body.alt_text || "",
      title: req.body.title || req.file.originalname,
      description: req.body.description || "",
      url,
      relative_path: relativePath,
      mime_type: req.file.mimetype,
      file_extension: fileExtension,
      file_size: req.file.size,
      width: req.body.width ? parseInt(req.body.width) : null,
      height: req.body.height ? parseInt(req.body.height) : null,
      duration: req.body.duration ? parseInt(req.body.duration) : null,
      folder_id: req.body.folder_id ? parseInt(req.body.folder_id) : null,
      media_type: mediaType,
      metadata: req.body.metadata ? JSON.parse(req.body.metadata) : null
    };
    const mediaFile = await createMediaFile(mediaData, tenantId);
    res.status(201).json({
      success: true,
      file: mediaFile,
      url
    });
  } catch (error) {
    console.error("[testing] Error uploading media file:", error);
    if (error.message && error.message.includes("already exists")) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to upload media file" });
  }
});
router17.put("/files/:id", authenticateUser, async (req, res) => {
  try {
    const mediaId = parseInt(req.params.id);
    const tenantId = req.tenantId || req.user?.tenant_id || req.body.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required" });
    }
    const file = await updateMediaFile(mediaId, req.body, tenantId);
    res.json(file);
  } catch (error) {
    console.error("[testing] Error updating media file:", error);
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to update media file" });
  }
});
router17.delete("/files/:id", authenticateUser, async (req, res) => {
  try {
    const mediaId = parseInt(req.params.id);
    const tenantId = req.tenantId || req.user?.tenant_id || req.query.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required" });
    }
    await deleteMediaFile(mediaId, tenantId);
    res.json({ success: true, message: "Media file deleted successfully" });
  } catch (error) {
    console.error("[testing] Error deleting media file:", error);
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to delete media file" });
  }
});
var media_default = router17;

// server/routes/docs.js
import express19 from "express";
import { promises as fsp } from "fs";
import { join as join7, relative } from "path";
var router18 = express19.Router();
var DOC_DIRS = [
  join7(process.cwd(), "docs"),
  join7(process.cwd(), "sparti-cms", "docs")
];
var isMarkdownOrText = (filename) => {
  return filename.endsWith(".md") || filename.endsWith(".markdown") || filename.endsWith(".txt");
};
async function walkDir(root) {
  const entries = await fsp.readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join7(root, entry.name);
    if (entry.isDirectory()) {
      const sub = await walkDir(full);
      files.push(...sub);
    } else {
      files.push(full);
    }
  }
  return files;
}
function extractFirstHeading(content) {
  const lines = content.split("\n");
  for (const line of lines) {
    const h1 = line.match(/^#\s+(.*)/);
    if (h1) return h1[1].trim();
  }
  const firstNonEmpty = lines.find((l) => l.trim().length > 0);
  return firstNonEmpty ? firstNonEmpty.trim().replace(/^#+\s*/, "") : "Untitled";
}
function extractActions(content, filePath) {
  const lines = content.split("\n");
  const actions = [];
  let currentTask = null;
  const pushCurrent = () => {
    if (currentTask) {
      if (!currentTask.status) currentTask.status = "todo";
      actions.push(currentTask);
      currentTask = null;
    }
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h2 = line.match(/^##\s+(.*)/);
    const h3 = line.match(/^###\s+(.*)/);
    if (h2 || h3) {
      pushCurrent();
      currentTask = {
        task: (h2 ? h2[1] : h3[1]).trim(),
        description: "",
        status: "todo",
        filesTouched: [filePath]
      };
      continue;
    }
    const statusMatch = line.match(/\b(status|state)\s*:\s*(todo|in[-\s]?progress|done)\b/i);
    if (statusMatch && currentTask) {
      currentTask.status = statusMatch[2].toLowerCase().replace(/\s+/, "-");
      continue;
    }
    if (currentTask && currentTask.description === "") {
      const trimmed = line.trim();
      if (trimmed.length > 0) {
        currentTask.description = trimmed;
      }
    }
  }
  pushCurrent();
  if (actions.length === 0) {
    actions.push({
      task: "Review Document",
      description: "Open and audit this document; create actionable steps if needed.",
      status: "todo",
      filesTouched: [filePath]
    });
  }
  return actions;
}
function extractSummary(content) {
  const lines = content.split("\n");
  const summaryLines = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l) continue;
    if (l.startsWith("#")) continue;
    summaryLines.push(lines[i]);
    if (summaryLines.length >= 5) break;
  }
  return summaryLines.join("\n").trim();
}
async function listDocs() {
  const items = [];
  for (const dir of DOC_DIRS) {
    try {
      const all = await walkDir(dir);
      const mdFiles = all.filter((f) => isMarkdownOrText(f));
      for (const file of mdFiles) {
        try {
          const content = await fsp.readFile(file, "utf-8");
          const title = extractFirstHeading(content);
          items.push({
            id: `doc:${encodeURIComponent(file)}`,
            title,
            path: file,
            relPath: relative(process.cwd(), file)
          });
        } catch {
        }
      }
    } catch {
    }
  }
  items.unshift({
    id: `doc:${encodeURIComponent("database:overview")}`,
    title: "Database Overview",
    path: "database:overview",
    relPath: "database:overview"
  });
  items.sort((a, b) => a.title.localeCompare(b.title));
  return items;
}
async function buildDatabaseOverviewActions() {
  const candidates = [
    join7(process.cwd(), "docs", "features", "DATABASE.md"),
    join7(process.cwd(), "sparti-cms", "docs", "database-rules.md"),
    join7(process.cwd(), "docs", "development", "database-audit-implementation-plan.md"),
    join7(process.cwd(), "docs", "setup", "POSTGRES_MCP_SETUP.md"),
    join7(process.cwd(), "docs", "setup", "POSTGRES_MCP_SETUP_RAILWAY.md")
  ];
  const actions = [];
  for (const file of candidates) {
    try {
      const content = await fsp.readFile(file, "utf-8");
      const extracted = extractActions(content, relative(process.cwd(), file));
      extracted.forEach((a) => {
        actions.push({
          task: a.task,
          description: a.description,
          status: a.status,
          filesTouched: a.filesTouched
        });
      });
    } catch {
    }
  }
  if (actions.length === 0) {
    actions.push({
      task: "Document DB Architecture",
      description: "Create an overview of core modules, relationships, tenancy, and workflows.",
      status: "todo",
      filesTouched: ["database:overview"]
    });
  }
  return actions;
}
router18.get("/api/docs/list", async (req, res) => {
  try {
    const items = await listDocs();
    res.json({ success: true, items });
  } catch (error) {
    console.error("[docs] list error:", error);
    res.status(500).json({ success: false, error: "Failed to list docs" });
  }
});
router18.get("/api/docs/actions", async (req, res) => {
  try {
    const rawPath = req.query.path;
    if (!rawPath || typeof rawPath !== "string") {
      return res.status(400).json({ success: false, error: "path is required" });
    }
    const decoded = decodeURIComponent(rawPath);
    if (decoded === "database:overview") {
      const actions2 = await buildDatabaseOverviewActions();
      return res.json({ success: true, actions: actions2 });
    }
    const content = await fsp.readFile(decoded, "utf-8");
    const actions = extractActions(content, relative(process.cwd(), decoded));
    res.json({ success: true, actions });
  } catch (error) {
    console.error("[docs] actions error:", error);
    res.status(500).json({ success: false, error: "Failed to read document actions" });
  }
});
router18.get("/api/docs/brief", async (req, res) => {
  try {
    const rawPath = req.query.path;
    if (!rawPath || typeof rawPath !== "string") {
      return res.status(400).json({ success: false, error: "path is required" });
    }
    const decoded = decodeURIComponent(rawPath);
    if (decoded === "database:overview") {
      const candidates = [
        join7(process.cwd(), "docs", "features", "DATABASE.md"),
        join7(process.cwd(), "sparti-cms", "docs", "database-rules.md"),
        join7(process.cwd(), "docs", "implementation", "DATABASE_VIEWER_FIX.md"),
        join7(process.cwd(), "docs", "implementation", "DATABASE_TABLES_SYNC_FIX.md"),
        join7(process.cwd(), "docs", "setup", "POSTGRES_MCP_SETUP.md"),
        join7(process.cwd(), "docs", "setup", "POSTGRES_MCP_SETUP_RAILWAY.md")
      ];
      let combined = "";
      for (const file of candidates) {
        try {
          const c = await fsp.readFile(file, "utf-8");
          combined += `

# Source: ${relative(process.cwd(), file)}

` + c;
        } catch {
        }
      }
      if (!combined) {
        combined = "Database overview is pending. Please add documentation under docs/features/DATABASE.md or sparti-cms/docs.";
      }
      const summary2 = extractSummary(combined);
      return res.json({ success: true, title: "Database Overview", summary: summary2, content: combined, filesTouched: ["database:overview"] });
    }
    const content = await fsp.readFile(decoded, "utf-8");
    const summary = extractSummary(content);
    res.json({
      success: true,
      title: extractFirstHeading(content),
      summary,
      content,
      filesTouched: [relative(process.cwd(), decoded)]
    });
  } catch (error) {
    console.error("[docs] brief error:", error);
    res.status(500).json({ success: false, error: "Failed to read document brief" });
  }
});
var docs_default = router18;

// server/routes/woocommerce-sync.js
init_db();
import express20 from "express";

// server/services/woocommerceMapper.js
function mapProductStatus(wcStatus) {
  const statusMap = {
    "publish": "active",
    "draft": "draft",
    "pending": "draft",
    "private": "draft",
    "trash": "draft"
  };
  return statusMap[wcStatus] || "draft";
}
function mapOrderStatus(wcStatus) {
  const statusMap = {
    "pending": "pending",
    "processing": "processing",
    "on-hold": "pending",
    "completed": "completed",
    "cancelled": "cancelled",
    "refunded": "refunded",
    "failed": "failed"
  };
  return statusMap[wcStatus] || "pending";
}
function generateHandle(slug, name, tenantId) {
  if (slug) {
    return slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
  }
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 255);
}
function mapWooCommerceProduct(wcProduct, tenantId) {
  const product = {
    name: wcProduct.name || "Unnamed Product",
    description: wcProduct.description || wcProduct.short_description || null,
    handle: generateHandle(wcProduct.slug, wcProduct.name, tenantId),
    status: mapProductStatus(wcProduct.status),
    featured_image: wcProduct.images && wcProduct.images.length > 0 ? wcProduct.images[0].src : null,
    tenant_id: tenantId,
    external_id: String(wcProduct.id),
    external_source: "woocommerce"
  };
  return product;
}
function mapWooCommerceVariants(wcProduct, productId, tenantId) {
  const variants = [];
  if (wcProduct.type === "variable" && wcProduct.variations && wcProduct.variations.length > 0) {
    console.warn("[testing] Variable products require separate variation API calls");
  }
  const defaultVariant = {
    product_id: productId,
    sku: wcProduct.sku || null,
    title: "Default",
    price: parseFloat(wcProduct.price || 0),
    compare_at_price: wcProduct.regular_price && wcProduct.regular_price !== wcProduct.price ? parseFloat(wcProduct.regular_price) : null,
    inventory_quantity: wcProduct.stock_quantity || 0,
    inventory_management: wcProduct.manage_stock !== false,
    tenant_id: tenantId
  };
  variants.push(defaultVariant);
  return variants;
}
function mapWooCommerceCategories(wcCategories, tenantId) {
  if (!Array.isArray(wcCategories)) {
    return [];
  }
  return wcCategories.map((cat) => ({
    name: cat.name || "Unnamed Category",
    slug: cat.slug || generateHandle(null, cat.name, tenantId),
    description: cat.description || null,
    parent_id: null,
    // We'll handle parent relationships separately if needed
    tenant_id: tenantId,
    external_id: String(cat.id),
    external_source: "woocommerce"
  }));
}
function mapWooCommerceOrder(wcOrder, tenantId) {
  const billing = wcOrder.billing || {};
  const shipping = wcOrder.shipping || {};
  const order = {
    order_number: wcOrder.number || `WC-${wcOrder.id}`,
    customer_email: billing.email || null,
    customer_first_name: billing.first_name || null,
    customer_last_name: billing.last_name || null,
    status: mapOrderStatus(wcOrder.status),
    subtotal: parseFloat(wcOrder.subtotal || 0),
    tax_amount: parseFloat(wcOrder.total_tax || 0),
    shipping_amount: parseFloat(wcOrder.shipping_total || 0),
    total_amount: parseFloat(wcOrder.total || 0),
    shipping_address: shipping.address_1 ? {
      first_name: shipping.first_name || null,
      last_name: shipping.last_name || null,
      company: shipping.company || null,
      address_1: shipping.address_1 || null,
      address_2: shipping.address_2 || null,
      city: shipping.city || null,
      state: shipping.state || null,
      postcode: shipping.postcode || null,
      country: shipping.country || null
    } : null,
    billing_address: billing.address_1 ? {
      first_name: billing.first_name || null,
      last_name: billing.last_name || null,
      company: billing.company || null,
      address_1: billing.address_1 || null,
      address_2: billing.address_2 || null,
      city: billing.city || null,
      state: billing.state || null,
      postcode: billing.postcode || null,
      country: billing.country || null,
      email: billing.email || null,
      phone: billing.phone || null
    } : null,
    tenant_id: tenantId,
    external_id: String(wcOrder.id),
    external_source: "woocommerce"
  };
  return order;
}
function mapWooCommerceOrderItems(wcOrder, orderId, productMap = {}) {
  const items = [];
  if (!Array.isArray(wcOrder.line_items)) {
    return items;
  }
  for (const lineItem of wcOrder.line_items) {
    const productId = productMap[lineItem.product_id] || null;
    const variantId = lineItem.variation_id ? productMap[lineItem.variation_id] : null;
    const item = {
      order_id: orderId,
      product_id: productId,
      variant_id: variantId,
      quantity: parseInt(lineItem.quantity || 1),
      unit_price: parseFloat(lineItem.price || 0),
      total_price: parseFloat(lineItem.total || 0)
    };
    items.push(item);
  }
  return items;
}
async function createProductMap(wcProductIds, tenantId, query2) {
  if (!Array.isArray(wcProductIds) || wcProductIds.length === 0) {
    return {};
  }
  const productMap = {};
  const externalIds = wcProductIds.map((id) => String(id));
  const result = await query2(`
    SELECT id, external_id
    FROM products
    WHERE tenant_id = $1 
      AND external_source = 'woocommerce'
      AND external_id = ANY($2::text[])
  `, [tenantId, externalIds]);
  for (const row of result.rows) {
    productMap[row.external_id] = row.id;
  }
  return productMap;
}

// server/routes/woocommerce-sync.js
var router19 = express20.Router();
async function getWooCommerceClientForTenant(tenantId) {
  return await createWooCommerceClient(tenantId, query);
}
router19.post("/test-connection", authenticateTenantApiKey, async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = getDatabaseState();
    if (!dbInitialized2) {
      if (dbInitializationError2) {
        return res.status(503).json({
          success: false,
          error: "Database initialization failed",
          message: "Please try again later"
        });
      }
      return res.status(503).json({
        success: false,
        error: "Database is initializing",
        message: "Please try again in a moment"
      });
    }
    const tenantId = req.tenantId;
    const client = await getWooCommerceClientForTenant(tenantId);
    const result = await client.testConnection();
    if (result.success) {
      res.json({
        success: true,
        message: "Connection successful",
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || "Connection failed",
        data: result
      });
    }
  } catch (error) {
    console.error("[testing] Error testing WooCommerce connection:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to test connection"
    });
  }
});
router19.get("/sync/status", authenticateTenantApiKey, async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2 } = getDatabaseState();
    if (!dbInitialized2) {
      return res.status(503).json({
        success: false,
        error: "Database is initializing"
      });
    }
    const tenantId = req.tenantId;
    const integrationResult = await query(`
      SELECT config, is_active, updated_at
      FROM tenant_integrations
      WHERE tenant_id = $1 AND integration_type = 'woocommerce'
      LIMIT 1
    `, [tenantId]);
    if (integrationResult.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          is_configured: false,
          is_active: false,
          last_sync_at: null
        }
      });
    }
    const integration = integrationResult.rows[0];
    const config = integration.config || {};
    const lastSyncAt = config.last_sync_at || null;
    const productsCount = await query(`
      SELECT COUNT(*) as count
      FROM products
      WHERE tenant_id = $1 AND external_source = 'woocommerce'
    `, [tenantId]);
    const ordersCount = await query(`
      SELECT COUNT(*) as count
      FROM orders
      WHERE tenant_id = $1 AND external_source = 'woocommerce'
    `, [tenantId]);
    res.json({
      success: true,
      data: {
        is_configured: true,
        is_active: integration.is_active,
        last_sync_at: lastSyncAt,
        synced_products: parseInt(productsCount.rows[0].count),
        synced_orders: parseInt(ordersCount.rows[0].count),
        store_url: config.store_url || null
      }
    });
  } catch (error) {
    console.error("[testing] Error getting sync status:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get sync status"
    });
  }
});
router19.post("/sync/products", authenticateTenantApiKey, async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2 } = getDatabaseState();
    if (!dbInitialized2) {
      return res.status(503).json({
        success: false,
        error: "Database is initializing"
      });
    }
    const tenantId = req.tenantId;
    const { page = 1, per_page = 10, status = "publish" } = req.body;
    const client = await getWooCommerceClientForTenant(tenantId);
    const wcProducts = await client.getProducts(page, per_page, { status });
    if (!Array.isArray(wcProducts)) {
      return res.status(500).json({
        success: false,
        error: "Invalid response from WooCommerce API"
      });
    }
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };
    for (const wcProduct of wcProducts) {
      try {
        const mappedProduct = mapWooCommerceProduct(wcProduct, tenantId);
        const existingProduct = await query(`
          SELECT id FROM products
          WHERE tenant_id = $1 AND external_id = $2 AND external_source = 'woocommerce'
          LIMIT 1
        `, [tenantId, mappedProduct.external_id]);
        let productId;
        if (existingProduct.rows.length > 0) {
          productId = existingProduct.rows[0].id;
          await query(`
            UPDATE products
            SET name = $1,
                description = $2,
                handle = $3,
                status = $4,
                featured_image = $5,
                updated_at = NOW()
            WHERE id = $6
          `, [
            mappedProduct.name,
            mappedProduct.description,
            mappedProduct.handle,
            mappedProduct.status,
            mappedProduct.featured_image,
            productId
          ]);
          results.updated++;
        } else {
          const insertResult = await query(`
            INSERT INTO products (
              name, description, handle, status, featured_image,
              tenant_id, external_id, external_source
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
          `, [
            mappedProduct.name,
            mappedProduct.description,
            mappedProduct.handle,
            mappedProduct.status,
            mappedProduct.featured_image,
            mappedProduct.tenant_id,
            mappedProduct.external_id,
            mappedProduct.external_source
          ]);
          productId = insertResult.rows[0].id;
          results.created++;
        }
        const variants = mapWooCommerceVariants(wcProduct, productId, tenantId);
        for (const variant of variants) {
          if (variant.sku) {
            const existingVariant = await query(`
              SELECT id FROM product_variants
              WHERE product_id = $1 AND sku = $2
              LIMIT 1
            `, [productId, variant.sku]);
            if (existingVariant.rows.length > 0) {
              await query(`
                UPDATE product_variants
                SET title = $1,
                    price = $2,
                    compare_at_price = $3,
                    inventory_quantity = $4,
                    inventory_management = $5,
                    updated_at = NOW()
                WHERE id = $6
              `, [
                variant.title,
                variant.price,
                variant.compare_at_price,
                variant.inventory_quantity,
                variant.inventory_management,
                existingVariant.rows[0].id
              ]);
            } else {
              await query(`
                INSERT INTO product_variants (
                  product_id, sku, title, price, compare_at_price,
                  inventory_quantity, inventory_management, tenant_id
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
              `, [
                variant.product_id,
                variant.sku,
                variant.title,
                variant.price,
                variant.compare_at_price,
                variant.inventory_quantity,
                variant.inventory_management,
                variant.tenant_id
              ]);
            }
          }
        }
        try {
          const pernProductCheck = await query(`
            SELECT product_id FROM pern_products
            WHERE slug = $1 AND tenant_id = $2
            LIMIT 1
          `, [mappedProduct.handle, tenantId]);
          const variantPrice = variants.length > 0 ? variants[0].price : parseFloat(wcProduct.price || 0);
          if (pernProductCheck.rows.length === 0) {
            await query(`
              INSERT INTO pern_products (name, slug, price, description, image_url, tenant_id)
              VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT (slug, tenant_id) DO UPDATE SET
                name = EXCLUDED.name,
                price = EXCLUDED.price,
                description = EXCLUDED.description,
                image_url = EXCLUDED.image_url,
                updated_at = NOW()
            `, [
              mappedProduct.name,
              mappedProduct.handle,
              variantPrice,
              mappedProduct.description || "",
              mappedProduct.featured_image,
              tenantId
            ]);
          } else {
            await query(`
              UPDATE pern_products
              SET name = $1,
                  price = $2,
                  description = $3,
                  image_url = $4,
                  updated_at = NOW()
              WHERE product_id = $5
            `, [
              mappedProduct.name,
              variantPrice,
              mappedProduct.description || "",
              mappedProduct.featured_image,
              pernProductCheck.rows[0].product_id
            ]);
          }
        } catch (pernError) {
          console.warn("[testing] Could not sync to pern_products table:", pernError.message);
        }
        if (wcProduct.categories && Array.isArray(wcProduct.categories)) {
          const categories = mapWooCommerceCategories(wcProduct.categories, tenantId);
          for (const category of categories) {
            const existingCategory = await query(`
              SELECT id FROM product_categories
              WHERE tenant_id = $1 AND slug = $2
              LIMIT 1
            `, [tenantId, category.slug]);
            let categoryId;
            if (existingCategory.rows.length > 0) {
              categoryId = existingCategory.rows[0].id;
            } else {
              const catResult = await query(`
                INSERT INTO product_categories (name, slug, description, tenant_id)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (slug, tenant_id) DO NOTHING
                RETURNING id
              `, [category.name, category.slug, category.description, category.tenant_id]);
              categoryId = catResult.rows.length > 0 ? catResult.rows[0].id : null;
            }
            if (categoryId) {
              await query(`
                INSERT INTO product_category_relations (product_id, category_id)
                VALUES ($1, $2)
                ON CONFLICT (product_id, category_id) DO NOTHING
              `, [productId, categoryId]);
            }
          }
        }
      } catch (error) {
        console.error(`[testing] Error syncing product ${wcProduct.id}:`, error);
        results.errors.push({
          product_id: wcProduct.id,
          error: error.message
        });
        results.skipped++;
      }
    }
    await query(`
      UPDATE tenant_integrations
      SET config = jsonb_set(
        COALESCE(config, '{}'::jsonb),
        '{last_sync_at}',
        to_jsonb(NOW()::text)
      ),
      updated_at = NOW()
      WHERE tenant_id = $1 AND integration_type = 'woocommerce'
    `, [tenantId]);
    res.json({
      success: true,
      message: `Synced ${wcProducts.length} products`,
      data: results
    });
  } catch (error) {
    console.error("[testing] Error syncing products:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to sync products"
    });
  }
});
router19.post("/sync/orders", authenticateTenantApiKey, async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2 } = getDatabaseState();
    if (!dbInitialized2) {
      return res.status(503).json({
        success: false,
        error: "Database is initializing"
      });
    }
    const tenantId = req.tenantId;
    const { page = 1, per_page = 10, status, after, before } = req.body;
    const client = await getWooCommerceClientForTenant(tenantId);
    const filters = {};
    if (status) filters.status = status;
    if (after) filters.after = after;
    if (before) filters.before = before;
    const wcOrders = await client.getOrders(page, per_page, filters);
    if (!Array.isArray(wcOrders)) {
      return res.status(500).json({
        success: false,
        error: "Invalid response from WooCommerce API"
      });
    }
    const wcProductIds = [];
    wcOrders.forEach((order) => {
      if (order.line_items) {
        order.line_items.forEach((item) => {
          if (item.product_id) wcProductIds.push(item.product_id);
          if (item.variation_id) wcProductIds.push(item.variation_id);
        });
      }
    });
    const productMap = await createProductMap(wcProductIds, tenantId, query);
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };
    for (const wcOrder of wcOrders) {
      try {
        const mappedOrder = mapWooCommerceOrder(wcOrder, tenantId);
        const existingOrder = await query(`
          SELECT id FROM orders
          WHERE tenant_id = $1 AND external_id = $2 AND external_source = 'woocommerce'
          LIMIT 1
        `, [tenantId, mappedOrder.external_id]);
        let orderId;
        if (existingOrder.rows.length > 0) {
          orderId = existingOrder.rows[0].id;
          await query(`
            UPDATE orders
            SET order_number = $1,
                customer_email = $2,
                customer_first_name = $3,
                customer_last_name = $4,
                status = $5,
                subtotal = $6,
                tax_amount = $7,
                shipping_amount = $8,
                total_amount = $9,
                shipping_address = $10,
                billing_address = $11,
                updated_at = NOW()
            WHERE id = $12
          `, [
            mappedOrder.order_number,
            mappedOrder.customer_email,
            mappedOrder.customer_first_name,
            mappedOrder.customer_last_name,
            mappedOrder.status,
            mappedOrder.subtotal,
            mappedOrder.tax_amount,
            mappedOrder.shipping_amount,
            mappedOrder.total_amount,
            mappedOrder.shipping_address ? JSON.stringify(mappedOrder.shipping_address) : null,
            mappedOrder.billing_address ? JSON.stringify(mappedOrder.billing_address) : null,
            orderId
          ]);
          results.updated++;
          await query(`
            DELETE FROM order_items WHERE order_id = $1
          `, [orderId]);
        } else {
          const insertResult = await query(`
            INSERT INTO orders (
              order_number, customer_email, customer_first_name, customer_last_name,
              status, subtotal, tax_amount, shipping_amount, total_amount,
              shipping_address, billing_address, tenant_id, external_id, external_source
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING id
          `, [
            mappedOrder.order_number,
            mappedOrder.customer_email,
            mappedOrder.customer_first_name,
            mappedOrder.customer_last_name,
            mappedOrder.status,
            mappedOrder.subtotal,
            mappedOrder.tax_amount,
            mappedOrder.shipping_amount,
            mappedOrder.total_amount,
            mappedOrder.shipping_address ? JSON.stringify(mappedOrder.shipping_address) : null,
            mappedOrder.billing_address ? JSON.stringify(mappedOrder.billing_address) : null,
            mappedOrder.tenant_id,
            mappedOrder.external_id,
            mappedOrder.external_source
          ]);
          orderId = insertResult.rows[0].id;
          results.created++;
        }
        const orderItems = mapWooCommerceOrderItems(wcOrder, orderId, productMap);
        for (const item of orderItems) {
          if (!item.product_id) {
            console.warn(`[testing] Skipping order item for WooCommerce product ${wcOrder.line_items?.find((li) => li.product_id && !productMap[li.product_id])?.product_id} - product not found in database`);
            continue;
          }
          await query(`
            INSERT INTO order_items (
              order_id, product_id, variant_id, quantity, unit_price, total_price
            )
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            item.order_id,
            item.product_id,
            item.variant_id,
            item.quantity,
            item.unit_price,
            item.total_price
          ]);
        }
      } catch (error) {
        console.error(`[testing] Error syncing order ${wcOrder.id}:`, error);
        results.errors.push({
          order_id: wcOrder.id,
          error: error.message
        });
        results.skipped++;
      }
    }
    await query(`
      UPDATE tenant_integrations
      SET config = jsonb_set(
        COALESCE(config, '{}'::jsonb),
        '{last_sync_at}',
        to_jsonb(NOW()::text)
      ),
      updated_at = NOW()
      WHERE tenant_id = $1 AND integration_type = 'woocommerce'
    `, [tenantId]);
    res.json({
      success: true,
      message: `Synced ${wcOrders.length} orders`,
      data: results
    });
  } catch (error) {
    console.error("[testing] Error syncing orders:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to sync orders"
    });
  }
});
var woocommerce_sync_default = router19;

// server/routes/wordpress-sync.js
init_db();
import express21 from "express";
init_models();
init_categories();
init_tags();
import { Op as Op5 } from "sequelize";
import crypto from "crypto";
var { Post: Post6, Category: Category5, Tag: Tag5 } = models_default;
var router20 = express21.Router();
async function getWordPressClientForTenant(tenantId) {
  const integrationResult = await query(`
    SELECT config, is_active
    FROM tenant_integrations
    WHERE tenant_id = $1 AND integration_type = 'wordpress'
    LIMIT 1
  `, [tenantId]);
  if (integrationResult.rows.length === 0 || !integrationResult.rows[0].is_active) {
    throw new Error("WordPress integration not configured or not active for this tenant");
  }
  const config = integrationResult.rows[0].config;
  if (!config || !config.wordpress_url || !config.username || !config.application_password) {
    throw new Error("WordPress configuration is incomplete");
  }
  return createWordPressClientFromConfig(config);
}
function verifyTenantAccess(user, tenantId) {
  if (user.is_super_admin) {
    return true;
  }
  return user.tenant_id === tenantId;
}
function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}
function getFeaturedImageUrl(wpPost) {
  if (!wpPost._embedded || !wpPost._embedded["wp:featuredmedia"] || !wpPost._embedded["wp:featuredmedia"][0]) {
    return null;
  }
  const media = wpPost._embedded["wp:featuredmedia"][0];
  if (media.media_details && media.media_details.sizes) {
    if (media.media_details.sizes.large) {
      return media.media_details.sizes.large.source_url;
    }
    if (media.media_details.sizes.medium_large) {
      return media.media_details.sizes.medium_large.source_url;
    }
  }
  return media.source_url || null;
}
function generateSyncHash(postData) {
  const hashContent = `${postData.title}|${postData.content}|${postData.excerpt}|${postData.status}`;
  return crypto.createHash("md5").update(hashContent).digest("hex");
}
function mapWordPressStatus(wpStatus) {
  const statusMap = {
    "publish": "published",
    "draft": "draft",
    "private": "private",
    "trash": "trash",
    "pending": "draft",
    "future": "draft"
  };
  return statusMap[wpStatus] || "draft";
}
router20.get("/config/:tenantId", authenticateUser, async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = getDatabaseState();
    if (!dbInitialized2) {
      if (dbInitializationError2) {
        return res.status(503).json({
          success: false,
          error: "Database initialization failed",
          message: "Please try again later"
        });
      }
      return res.status(503).json({
        success: false,
        error: "Database is initializing",
        message: "Please try again in a moment"
      });
    }
    const tenantId = req.params.tenantId;
    if (!verifyTenantAccess(req.user, tenantId)) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
        message: "You do not have access to this tenant"
      });
    }
    const integrationResult = await query(`
      SELECT config, is_active, created_at, updated_at
      FROM tenant_integrations
      WHERE tenant_id = $1 AND integration_type = 'wordpress'
      LIMIT 1
    `, [tenantId]);
    if (integrationResult.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          is_configured: false,
          is_active: false,
          config: null
        }
      });
    }
    const integration = integrationResult.rows[0];
    const config = integration.config || {};
    const safeConfig = {
      ...config,
      application_password: config.application_password ? "***" : null
    };
    res.json({
      success: true,
      data: {
        is_configured: true,
        is_active: integration.is_active,
        config: safeConfig,
        created_at: integration.created_at,
        updated_at: integration.updated_at
      }
    });
  } catch (error) {
    console.error("[testing] Error getting WordPress config:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get WordPress configuration"
    });
  }
});
router20.put("/config/:tenantId", authenticateUser, async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = getDatabaseState();
    if (!dbInitialized2) {
      if (dbInitializationError2) {
        return res.status(503).json({
          success: false,
          error: "Database initialization failed",
          message: "Please try again later"
        });
      }
      return res.status(503).json({
        success: false,
        error: "Database is initializing",
        message: "Please try again in a moment"
      });
    }
    const tenantId = req.params.tenantId;
    const { wordpress_url, username, application_password, auto_sync_enabled, sync_interval } = req.body;
    if (!verifyTenantAccess(req.user, tenantId)) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
        message: "You do not have access to this tenant"
      });
    }
    if (!wordpress_url || !username || !application_password) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        message: "wordpress_url, username, and application_password are required"
      });
    }
    const tenantCheck = await query(`
      SELECT id FROM tenants WHERE id = $1
    `, [tenantId]);
    if (tenantCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Tenant not found"
      });
    }
    const config = {
      wordpress_url: wordpress_url.replace(/\/$/, ""),
      // Remove trailing slash
      username,
      application_password,
      auto_sync_enabled: auto_sync_enabled !== void 0 ? auto_sync_enabled : true,
      sync_interval: sync_interval || "realtime",
      last_sync_at: null,
      sync_errors: []
    };
    try {
      const testClient = createWordPressClientFromConfig(config);
      const testResult = await testClient.testConnection();
      if (!testResult.success) {
        return res.status(400).json({
          success: false,
          error: "Connection test failed",
          message: testResult.error || "Unable to connect to WordPress"
        });
      }
    } catch (testError) {
      return res.status(400).json({
        success: false,
        error: "Connection test failed",
        message: testError.message || "Unable to connect to WordPress"
      });
    }
    const result = await query(`
      INSERT INTO tenant_integrations (tenant_id, integration_type, is_active, config)
      VALUES ($1, 'wordpress', true, $2)
      ON CONFLICT (tenant_id, integration_type)
      DO UPDATE SET
        is_active = true,
        config = EXCLUDED.config,
        updated_at = NOW()
      RETURNING is_active, config, created_at, updated_at
    `, [tenantId, JSON.stringify(config)]);
    const safeConfig = {
      ...config,
      application_password: "***"
    };
    res.json({
      success: true,
      message: "WordPress configuration saved successfully",
      data: {
        is_active: result.rows[0].is_active,
        config: safeConfig,
        created_at: result.rows[0].created_at,
        updated_at: result.rows[0].updated_at
      }
    });
  } catch (error) {
    console.error("[testing] Error updating WordPress config:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update WordPress configuration"
    });
  }
});
router20.post("/test-connection/:tenantId", authenticateUser, async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = getDatabaseState();
    if (!dbInitialized2) {
      if (dbInitializationError2) {
        return res.status(503).json({
          success: false,
          error: "Database initialization failed",
          message: "Please try again later"
        });
      }
      return res.status(503).json({
        success: false,
        error: "Database is initializing",
        message: "Please try again in a moment"
      });
    }
    const tenantId = req.params.tenantId;
    if (!verifyTenantAccess(req.user, tenantId)) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
        message: "You do not have access to this tenant"
      });
    }
    const client = await getWordPressClientForTenant(tenantId);
    const result = await client.testConnection();
    if (result.success) {
      res.json({
        success: true,
        message: "Connection successful",
        data: {
          user: result.user,
          connected: true
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || "Connection failed",
        data: {
          connected: false
        }
      });
    }
  } catch (error) {
    console.error("[testing] Error testing WordPress connection:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to test connection"
    });
  }
});
router20.get("/sync-status/:tenantId", authenticateUser, async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2 } = getDatabaseState();
    if (!dbInitialized2) {
      return res.status(503).json({
        success: false,
        error: "Database is initializing"
      });
    }
    const tenantId = req.params.tenantId;
    if (!verifyTenantAccess(req.user, tenantId)) {
      return res.status(403).json({
        success: false,
        error: "Access denied"
      });
    }
    const integrationResult = await query(`
      SELECT config, is_active, updated_at
      FROM tenant_integrations
      WHERE tenant_id = $1 AND integration_type = 'wordpress'
      LIMIT 1
    `, [tenantId]);
    if (integrationResult.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          is_configured: false,
          is_active: false,
          last_sync_at: null,
          synced_posts: 0,
          total_posts: 0
        }
      });
    }
    const integration = integrationResult.rows[0];
    const config = integration.config || {};
    const lastSyncAt = config.last_sync_at || null;
    const syncedCount = await query(`
      SELECT COUNT(*) as count
      FROM posts
      WHERE tenant_id = $1 AND wordpress_sync_enabled = true AND wordpress_id IS NOT NULL
    `, [tenantId]);
    const totalCount = await query(`
      SELECT COUNT(*) as count
      FROM posts
      WHERE tenant_id = $1
    `, [tenantId]);
    res.json({
      success: true,
      data: {
        is_configured: true,
        is_active: integration.is_active,
        last_sync_at: lastSyncAt,
        synced_posts: parseInt(syncedCount.rows[0].count),
        total_posts: parseInt(totalCount.rows[0].count),
        wordpress_url: config.wordpress_url || null,
        auto_sync_enabled: config.auto_sync_enabled !== false,
        sync_interval: config.sync_interval || "realtime",
        sync_errors: config.sync_errors || []
      }
    });
  } catch (error) {
    console.error("[testing] Error getting sync status:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get sync status"
    });
  }
});
router20.post("/import/:tenantId", authenticateUser, async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2, dbInitializationError: dbInitializationError2 } = getDatabaseState();
    if (!dbInitialized2) {
      if (dbInitializationError2) {
        return res.status(503).json({
          success: false,
          error: "Database initialization failed",
          message: "Please try again later"
        });
      }
      return res.status(503).json({
        success: false,
        error: "Database is initializing",
        message: "Please try again in a moment"
      });
    }
    const tenantId = req.params.tenantId;
    const { page = 1, per_page = 100 } = req.body;
    if (!verifyTenantAccess(req.user, tenantId)) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
        message: "You do not have access to this tenant"
      });
    }
    const client = await getWordPressClientForTenant(tenantId);
    const wpPosts = await client.getPosts({
      page,
      per_page,
      status: "publish",
      orderby: "date",
      order: "desc",
      _embed: true
    });
    if (!Array.isArray(wpPosts)) {
      return res.status(500).json({
        success: false,
        error: "Invalid response from WordPress API"
      });
    }
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };
    for (const wpPost of wpPosts) {
      try {
        const existingPost = await Post6.findOne({
          where: {
            [Op5.or]: [
              { wordpress_id: wpPost.id, tenant_id: tenantId },
              { slug: wpPost.slug, tenant_id: tenantId }
            ]
          }
        });
        const postData = {
          title: stripHtml(wpPost.title?.rendered || wpPost.title || ""),
          slug: wpPost.slug,
          content: wpPost.content?.rendered || wpPost.content || "",
          excerpt: stripHtml(wpPost.excerpt?.rendered || wpPost.excerpt || ""),
          status: mapWordPressStatus(wpPost.status),
          published_at: wpPost.date ? new Date(wpPost.date) : null,
          wordpress_id: wpPost.id,
          wordpress_sync_enabled: true,
          wordpress_last_synced_at: /* @__PURE__ */ new Date(),
          tenant_id: tenantId,
          author_id: req.user?.id || null
        };
        postData.wordpress_sync_hash = generateSyncHash(postData);
        const featuredImageUrl = getFeaturedImageUrl(wpPost);
        if (featuredImageUrl) {
          postData.og_image = featuredImageUrl;
        }
        let post;
        if (existingPost) {
          await existingPost.update(postData);
          post = existingPost;
          results.updated++;
        } else {
          post = await Post6.create(postData);
          results.created++;
        }
        if (wpPost._embedded && wpPost._embedded["wp:term"] && wpPost._embedded["wp:term"][0]) {
          const categories = wpPost._embedded["wp:term"][0].filter((term) => term.taxonomy === "category");
          const categoryIds = [];
          for (const wpCategory of categories) {
            try {
              const category = await findOrCreateCategory(wpCategory.slug, {
                name: wpCategory.name,
                slug: wpCategory.slug,
                description: "",
                tenant_id: tenantId
              });
              categoryIds.push(category.id);
            } catch (catError) {
              console.error(`[testing] Error creating category ${wpCategory.slug}:`, catError);
            }
          }
          if (categoryIds.length > 0) {
            await setPostCategories(post.id, categoryIds);
          }
        }
        if (wpPost._embedded && wpPost._embedded["wp:term"] && wpPost._embedded["wp:term"][1]) {
          const tags = wpPost._embedded["wp:term"][1].filter((term) => term.taxonomy === "post_tag");
          const tagIds = [];
          for (const wpTag of tags) {
            try {
              const tag = await findOrCreateTag(wpTag.slug, {
                name: wpTag.name,
                slug: wpTag.slug,
                description: "",
                tenant_id: tenantId
              });
              tagIds.push(tag.id);
            } catch (tagError) {
              console.error(`[testing] Error creating tag ${wpTag.slug}:`, tagError);
            }
          }
          if (tagIds.length > 0) {
            await setPostTags(post.id, tagIds);
          }
        }
      } catch (postError) {
        console.error(`[testing] Error processing WordPress post ${wpPost.id}:`, postError);
        results.errors.push({
          wordpress_id: wpPost.id,
          slug: wpPost.slug,
          error: postError.message
        });
        results.skipped++;
      }
    }
    await query(`
      UPDATE tenant_integrations
      SET config = jsonb_set(
        COALESCE(config, '{}'::jsonb),
        '{last_sync_at}',
        to_jsonb($1::text)
      ),
      updated_at = NOW()
      WHERE tenant_id = $2 AND integration_type = 'wordpress'
    `, [(/* @__PURE__ */ new Date()).toISOString(), tenantId]);
    res.json({
      success: true,
      message: `Import completed: ${results.created} created, ${results.updated} updated, ${results.skipped} skipped`,
      data: results
    });
  } catch (error) {
    console.error("[testing] Error importing WordPress posts:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to import WordPress posts"
    });
  }
});
router20.post("/webhook", async (req, res) => {
  try {
    const { dbInitialized: dbInitialized2 } = getDatabaseState();
    if (!dbInitialized2) {
      return res.status(503).json({
        success: false,
        error: "Database is initializing"
      });
    }
    const { event, data, tenant_id } = req.body;
    if (!event || !data || !tenant_id) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: event, data, tenant_id"
      });
    }
    const integrationResult = await query(`
      SELECT config, is_active
      FROM tenant_integrations
      WHERE tenant_id = $1 AND integration_type = 'wordpress' AND is_active = true
      LIMIT 1
    `, [tenant_id]);
    if (integrationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "WordPress integration not found or not active for this tenant"
      });
    }
    const integration = integrationResult.rows[0];
    const config = integration.config || {};
    if (config.webhook_secret) {
      const signature = req.headers["x-wordpress-signature"];
      if (!signature) {
        return res.status(401).json({
          success: false,
          error: "Missing webhook signature"
        });
      }
      const expectedSignature = crypto.createHmac("sha256", config.webhook_secret).update(JSON.stringify(req.body)).digest("hex");
      if (signature !== expectedSignature) {
        return res.status(401).json({
          success: false,
          error: "Invalid webhook signature"
        });
      }
    }
    let result;
    switch (event) {
      case "post.created":
        result = await handlePostCreated(data, tenant_id, config);
        break;
      case "post.updated":
        result = await handlePostUpdated(data, tenant_id, config);
        break;
      case "post.deleted":
        result = await handlePostDeleted(data, tenant_id, config);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: `Unknown event type: ${event}`
        });
    }
    res.json({
      success: true,
      event,
      result
    });
  } catch (error) {
    console.error("[testing] Error processing WordPress webhook:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process webhook"
    });
  }
});
async function handlePostCreated(wpPost, tenantId, config) {
  try {
    const existingPost = await Post6.findOne({
      where: {
        [Op5.or]: [
          { wordpress_id: wpPost.id, tenant_id: tenantId },
          { slug: wpPost.slug, tenant_id: tenantId }
        ]
      }
    });
    if (existingPost) {
      return { action: "skipped", reason: "Post already exists" };
    }
    const postData = {
      title: stripHtml(wpPost.title?.rendered || wpPost.title || ""),
      slug: wpPost.slug,
      content: wpPost.content?.rendered || wpPost.content || "",
      excerpt: stripHtml(wpPost.excerpt?.rendered || wpPost.excerpt || ""),
      status: mapWordPressStatus(wpPost.status),
      published_at: wpPost.date ? new Date(wpPost.date) : null,
      wordpress_id: wpPost.id,
      wordpress_sync_enabled: true,
      wordpress_last_synced_at: /* @__PURE__ */ new Date(),
      tenant_id: tenantId
    };
    postData.wordpress_sync_hash = generateSyncHash(postData);
    const featuredImageUrl = getFeaturedImageUrl(wpPost);
    if (featuredImageUrl) {
      postData.og_image = featuredImageUrl;
    }
    const post = await Post6.create(postData);
    if (wpPost.categories && Array.isArray(wpPost.categories)) {
    }
    return { action: "created", post_id: post.id };
  } catch (error) {
    console.error("[testing] Error handling post.created:", error);
    throw error;
  }
}
async function handlePostUpdated(wpPost, tenantId, config) {
  try {
    const existingPost = await Post6.findOne({
      where: {
        wordpress_id: wpPost.id,
        tenant_id: tenantId,
        wordpress_sync_enabled: true
      }
    });
    if (!existingPost) {
      return { action: "skipped", reason: "Post not found or sync disabled" };
    }
    const postData = {
      title: stripHtml(wpPost.title?.rendered || wpPost.title || ""),
      slug: wpPost.slug,
      content: wpPost.content?.rendered || wpPost.content || "",
      excerpt: stripHtml(wpPost.excerpt?.rendered || wpPost.excerpt || ""),
      status: mapWordPressStatus(wpPost.status),
      published_at: wpPost.date ? new Date(wpPost.date) : null,
      wordpress_last_synced_at: /* @__PURE__ */ new Date()
    };
    postData.wordpress_sync_hash = generateSyncHash(postData);
    const featuredImageUrl = getFeaturedImageUrl(wpPost);
    if (featuredImageUrl) {
      postData.og_image = featuredImageUrl;
    }
    await existingPost.update(postData);
    return { action: "updated", post_id: existingPost.id };
  } catch (error) {
    console.error("[testing] Error handling post.updated:", error);
    throw error;
  }
}
async function handlePostDeleted(wpPost, tenantId, config) {
  try {
    const existingPost = await Post6.findOne({
      where: {
        wordpress_id: wpPost.id,
        tenant_id: tenantId
      }
    });
    if (!existingPost) {
      return { action: "skipped", reason: "Post not found" };
    }
    await existingPost.update({
      status: "trash",
      wordpress_sync_enabled: false
    });
    return { action: "deleted", post_id: existingPost.id };
  } catch (error) {
    console.error("[testing] Error handling post.deleted:", error);
    throw error;
  }
}
var wordpress_sync_default = router20;

// server/routes/index.js
var router21 = express22.Router();
router21.use("/api", (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  if (req.path === "/auth/verify-access-key") {
    return next();
  }
  if (req.path === "/auth/login" || req.path === "/auth/register" || req.path === "/auth/me") {
    return next();
  }
  if (req.path.startsWith("/v1")) {
    return next();
  }
  return authenticateWithAccessKey(req, res, next);
});
router21.use("/", health_default);
router21.use("/api/v1", authenticateTenantApiKey, public_default);
router21.use("/api/tenants", tenants_api_default);
router21.use("/api/themes", themes_default);
router21.use("/api", auth_default);
router21.use("/api", content_default);
router21.use("/api", forms_default);
router21.use("/api", crm_default);
router21.use("/api", settings_default);
router21.use("/api", seo_default);
router21.use("/api", system_default);
router21.use("/api", users_default);
router21.use("/api", ai_assistant_default);
router21.use("/api/shop", shop_default);
router21.use("/api/media", media_default);
router21.use("/api/woocommerce", woocommerce_sync_default);
router21.use("/api/wordpress", wordpress_sync_default);
router21.use("/api", docs_default);
router21.use("/theme", theme_admin_default);
router21.use("/theme/template", (req, res, next) => {
  if (req.path === "" || req.path === "/") {
    return res.status(404).send("Not Found");
  }
  return next();
});
router21.use("/theme", theme_default);
router21.get("/robots.txt", (req, res) => {
  const deployThemeSlug = process.env.VITE_DEPLOY_THEME_SLUG;
  const cmsTenant = process.env.CMS_TENANT;
  const isThemeDeployment = deployThemeSlug && cmsTenant;
  res.setHeader("Content-Type", "text/plain");
  if (isThemeDeployment) {
    res.send(`User-agent: *
Allow: /

# Sitemap
Sitemap: ${req.protocol}://${req.get("host")}/sitemap.xml
`);
    console.log("[testing] Serving robots.txt for theme deployment - allowing indexing");
  } else {
    res.send(`User-agent: *
Disallow: /

# CMS Admin Interface - Not for public indexing
`);
    console.log("[testing] Serving robots.txt for CMS admin - preventing indexing");
  }
});
router21.get("/r/:slug", async (req, res) => {
  try {
    const slug = "/" + req.params.slug;
    const cached = getPageCache(slug);
    if (cached) {
      res.setHeader("ETag", cached.etag);
      res.setHeader("Cache-Control", "public, max-age=30");
      return res.status(200).send(cached.html);
    }
    const result = await renderPageBySlug(slug);
    if (result.status === 404) {
      return res.status(404).send("<h1>Not Found</h1>");
    }
    const etag = 'W/"' + Buffer.from(String(result.html.length)).toString("hex") + '"';
    setPageCache(slug, { html: result.html, etag, renderedAt: Date.now() });
    res.setHeader("ETag", etag);
    res.setHeader("Cache-Control", "public, max-age=30");
    res.status(200).send(result.html);
  } catch (error) {
    console.error("[testing] Error rendering page:", error);
    res.status(500).send("<h1>Internal Server Error</h1>");
  }
});
var routes_default = router21;

// server/app.js
var __filename12 = fileURLToPath12(import.meta.url);
var __dirname12 = dirname10(__filename12);
ensureUploadsDir();
app.use(routes_default);
app.use("/theme", (req, res, next) => {
  const path6 = req.path;
  if (!path6 || path6.endsWith("/") || !/\.([a-zA-Z0-9]+)$/.test(path6)) {
    return next();
  }
  const normalizedPath = path6.startsWith("/") ? path6.slice(1) : path6;
  const spartiThemePath = join8(__dirname12, "..", "sparti-cms", "theme", normalizedPath);
  const publicThemePath = join8(__dirname12, "..", "public", "theme", normalizedPath);
  let filePath = null;
  if (existsSync6(spartiThemePath)) {
    try {
      const stats = statSync(spartiThemePath);
      if (stats.isFile()) {
        filePath = spartiThemePath;
      }
    } catch (err) {
    }
  }
  if (!filePath && existsSync6(publicThemePath)) {
    try {
      const stats = statSync(publicThemePath);
      if (stats.isFile()) {
        filePath = publicThemePath;
      }
    } catch (err) {
    }
  }
  if (filePath) {
    return res.sendFile(filePath, (err) => {
      if (err && !res.headersSent) {
        console.error("[testing] Error serving theme asset:", err);
        return res.status(err.status || 500).send("Error serving file");
      }
    });
  }
  return res.status(404).send("Not Found");
});
app.use(express23.static(join8(__dirname12, "..", "public")));
app.use("/assets", express23.static(join8(__dirname12, "..", "dist", "assets")));
app.use(express23.static(join8(__dirname12, "..", "dist"), {
  // Don't serve index.html as a static file - let route handlers deal with it
  index: false
}));
app.use((req, res) => {
  const indexPath = join8(__dirname12, "..", "dist", "index.html");
  if (existsSync6(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).json({
      status: "healthy",
      message: "Server is running but app not built",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
var app_default = app;

// api/index.source.js
function handler(req, res) {
  return app_default(req, res);
}
export {
  handler as default
};
