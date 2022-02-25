import { readFile } from 'fs/promises';
import pg from 'pg';
import dotenv from 'dotenv';

const SCHEMAFILE = './sql/schema.sql';
const DROPFILE = './sql/drop.sql';
// const INSERT = './sql/insert.sql';

dotenv.config();

dotenv.config();

const {
  HOST: hostname = '127.0.0.1',
  PORT: port = 6969,
  NODE_ENV: nodeEnv = 'development',
  SESSION_SECRET: sessionSecret,
  DATABASE_URL: connectionString,
} = process.env;

if (!connectionString || !sessionSecret) {
  console.error("Vantar gögn í env");
  process.exit(1);
}

const ssl = nodeEnv === 'production' ? { rejectUnauthorized: false } : false;
const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
	console.error('Villa kom upp við tengingu', err);
	process.exit(-1);
});

export async function query(q, values = []) {
	let client;
	try {
		client = await pool.connect();
	} catch (e) {
		console.error('cannot get client from pool', e);
		return null;
	}

	try {
		const result = await client.query(q, values);
		return result;
	} catch (e) {
		if (nodeEnv !== 'test') {
			console.error('unable to query', e);
		}
		return null;
	} finally {
		client.release();
	}
}

export async function insert({ name, description } = {}) {
	let success = true;

	const slug = name.replaceAll(' ', '-');

	const now = new Date();
	const q = `
	  INSERT INTO events
		(name, slug, description, created, modified)
	  VALUES
		($1, $2, $3, $4, $5);
	`;
	const values = [name, slug, description, now, now];

	try {
		await query(q, values);
	} catch (e) {
		console.error('Error inserting signature', e);
		success = false;
	}

	return success;
}

export async function getResponses(slug) {
	let responses = [];
	try {
		const idResult = await query('SELECT id FROM events WHERE slug = $1', [
			slug,
		]);
		const { id } = idResult.rows[0];
		responses = await query(
			'SELECT * FROM registration WHERE eventid = $1',
			[id]
		);
	} catch (error) {
		console.error('could not get id or comments', error);
	}
	return responses;
}

export async function respond({ id, name, comment }) {
	let success = true;

	const now = new Date();
	const q = `
	  INSERT INTO registration
		(name, comment, eventid, created)
	  VALUES
		($1, $2, $3, $4);
	`;
	const values = [name, comment, id, now];

	try {
		await query(q, values);
	} catch (e) {
		console.error('Error inserting signature', e);
		success = false;
	}

	return success;
}

export async function deleteRow(id) {
	let result = [];
	try {
		const checkIfComments = await query(
			'SELECT id FROM registration WHERE eventid = $1',
			[id]
		)
		if (checkIfComments.rowCount !== 0) {
			
			checkIfComments.rows.forEach(async element => {
				await query(
					'DELETE FROM registration WHERE id = $1',
					[element.id]
				);
			});
		}
	} catch (error) {
		
	}
	try {
		const queryResult = await query(
			'DELETE FROM events WHERE id = $1 RETURNING *',
			[id]
		);
		console.info(
			'deleted from tables, id:',
			queryResult.rows[0].id,
			', name:',
			queryResult.rows[0].name
		);

		if (queryResult && queryResult.rows) {
			result = queryResult.rows;
		}
	} catch (e) {
		console.error('Error selecting event', e);
	}

	return result;
}

export async function update({ id, name, description }) {
	let success = true;

	const slug = name.replaceAll(' ', '-');

	const now = new Date();
	const q = `UPDATE events SET 
  (name, slug, description, modified) = 
  ($1, $2, $3, $4) 
  WHERE id = $5 RETURNING *;`;
	const values = [name, slug, description, now, id];

	try {
		await query(q, values);
	} catch (e) {
		console.error('Error inserting signature', e);
		success = false;
	}

	return success;
}

export async function createSchema(schemaFile = SCHEMAFILE) {
	const data = await readFile(schemaFile);

	return query(data.toString('utf-8'));
}

export async function dropSchema(dropFile = DROPFILE) {
	const data = await readFile(dropFile);

	return query(data.toString('utf-8'));
}

export async function end() {
	await pool.end();
}
