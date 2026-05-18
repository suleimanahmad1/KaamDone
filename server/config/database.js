const dns = require("dns");
const mongoose = require("mongoose");

// Fix Windows DNS blocking Atlas SRV lookups (querySrv ECONNREFUSED)
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

const DB_NAME = process.env.DB_NAME || "taskManagerDB";

function getMongoUri() {
  return process.env.MONGO_URI || process.env.MONGODB_URI;
}

/** Build replica-set URI when only cluster hostname is known (SRV broken). */
function buildShardUri(user, pass, clusterHost) {
  const prefix = clusterHost.split(".")[0].replace("cluster", "ac-");
  const shardHost = `${prefix}-shard-00-00.${clusterHost.replace(/^cluster\d+/, "mjpcufg")}`;
  const base = clusterHost.includes("mjpcufg")
    ? `ac-cp8gpdr-shard-00-00.mjpcufg.mongodb.net`
    : shardHost;
  return `mongodb://${user}:${pass}@${base}:27017/?ssl=true&authSource=admin&retryWrites=true&w=majority`;
}

function srvToStandardUri(srvUri) {
  const withoutScheme = srvUri.replace("mongodb+srv://", "");
  const [authAndHost, query = ""] = withoutScheme.split("?");
  const atIndex = authAndHost.lastIndexOf("@");
  const auth = authAndHost.slice(0, atIndex + 1);
  const host = authAndHost.slice(atIndex + 1).split("/")[0];
  const params = new URLSearchParams(query);
  params.set("ssl", "true");
  params.set("authSource", "admin");
  if (!params.has("retryWrites")) params.set("retryWrites", "true");
  if (!params.has("w")) params.set("w", "majority");
  return `mongodb://${auth}${host}:27017/?${params.toString()}`;
}

async function connectDatabase() {
  const uri = getMongoUri();
  if (!uri) {
    throw new Error("Set MONGO_URI in server/.env (MongoDB Atlas connection string)");
  }

  const connectOptions = {
    dbName: DB_NAME,
    serverSelectionTimeoutMS: 20000,
  };

  const urisToTry = [uri];

  if (uri.startsWith("mongodb+srv://")) {
    urisToTry.push(srvToStandardUri(uri));
  }

  if (uri.includes("cluster0.mjpcufg.mongodb.net") && !uri.includes("shard-00")) {
    const match = uri.match(/mongodb(?:\+srv)?:\/\/([^:]+):([^@]+)@/);
    if (match) {
      urisToTry.push(buildShardUri(match[1], match[2], "cluster0.mjpcufg.mongodb.net"));
    }
  }

  let lastError;
  for (const tryUri of [...new Set(urisToTry)]) {
    try {
      await mongoose.connect(tryUri, connectOptions);
      console.log(`MongoDB Atlas connected — database: "${DB_NAME}"`);
      return;
    } catch (err) {
      lastError = err;
      console.warn("Connection attempt failed:", err.message.split("\n")[0]);
    }
  }

  console.error(`
Could not connect to Atlas. Your IP list looks fine — common fixes:
  1. Atlas → Database Access → confirm user password matches .env
  2. Use connection string from Atlas → Connect → Drivers (Node.js)
  3. Or use direct shard host in MONGO_URI (see .env.example)
`);
  throw lastError;
}

module.exports = { connectDatabase, getMongoUri, DB_NAME };
