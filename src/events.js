import { insert, query, respond, update } from "./lib/db.js";

export async function createEvent(req, res) {
  const { name, description } = req.body;

  console.info("insert", { name, description }, "into events");
  let success = true;
  let m = ""

  try {
    if (description.length > 500) {
      success = false;
      m = "Lýsing má ekki vera lengri en 500 stafir, vinsamlegast styttu lýsinguna og reyndu aftur.\nNafn: " + name + "\nLýsing: "+description;
    }
    else if (name.length > 64) {
      success = false;
      m = "Nafn má ekki vera lengri en 64 stafir, vinsamlegast styttu nafnið og reyndu aftur.\nNafn: " + name + "\nLýsing: "+description
    }
    else if (name !== "") {
      success = await insert({ name, description });
    } else {
      success = false;
      m = "Allir viðburðir þurfa að hafa nafn, vinsamlegast bættu við nafni og reyndu aftur."
    }
  } catch (e) {
    console.error(e);
  }
  if (success) {
    return res.redirect("/admin");
  }

  return res.render("error", {
    title: "Gat ekki skráð!",
  });
}

export async function getAllEvents() {
  let events = [];

  try {
    const q = "SELECT id,name,slug,description FROM events;";
    const queryResult = await query(q);

    if (queryResult && queryResult.rows) {
      events = queryResult.rows;
    }
  } catch (error) {
    console.error("Error getting events", error);
  }

  // console.log(events);
  return events;
}

export async function getSingleEvent(slug) {
  let details = [];

  try {
    const queryResult = await query("SELECT * FROM events WHERE slug = $1", [
      slug,
    ]);

    if (queryResult && queryResult.rowCount === 1) {
      details = queryResult.rows;
    }
  } catch (e) {
    console.error("Error selecting signatures", e);
  }

  return details;
}

export async function addResponse(req, res) {
  const { slug } = req.params;
  const { name, comment } = req.body;

  let success = true;

  try {
    let q = "SELECT id FROM events WHERE slug = $1";
    let v = [slug];
    const qID = await query(q, v);
    const id = qID.rows[0].id;
    success = await respond({ id, name, comment });
  } catch (error) {
    console.error("Tókst ekki að skrá á viðburð ", error);
  }

  if (success) {
    return res.redirect("/" + slug);
  }

  return res.render("error", {
    title: "Gat ekki skráð á viðburð",
    validated: false,
  });
}

export async function updateEvent(req, res) {
  const { slug } = req.params;
  const { name, description } = req.body;

  console.log("slug --> " + slug);

  let success = true;

  let id;
  try {
    const idResult = await query("SELECT id FROM events WHERE slug = $1", [
      slug,
    ]);
    if (idResult && idResult.rowCount === 1) {
      id = idResult.rows[0]["id"];
    }
  } catch (error) {
    console.error("could not find corresponding id", error);
  }

  try {
    success = await update({ id, name, description });
  } catch (e) {
    console.error(e);
  }
  if (success) {
    return res.redirect("/admin");
  }
}
