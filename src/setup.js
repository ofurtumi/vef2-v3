import { promises } from "fs";

import { query, end } from "./lib/db.js";

const DROPFILE = "./sql/drop.sql";
const SCHEMAFILE = "./sql/schema.sql";
const INSERT = "./sql/insert.sql";

async function create() {
  const dropData = await promises.readFile(DROPFILE);
  await query(dropData.toString("utf-8"));

  const schemeData = await promises.readFile(SCHEMAFILE);
  await query(schemeData.toString("utf-8"));

  const insertData = await promises.readFile(INSERT);
  await query(insertData.toString('utf-8'));

  await end();

  console.info("Schema & fake data created");
}

create().catch((err) => {
  console.error("Error creating schema", err);
});
