import bcrypt from 'bcrypt';
import { query } from './lib/db.js';

export async function findByUsername(username) {
	const q = 'SELECT * FROM users WHERE username = $1';

	try {
		const result = await query(q, [username]);

		if (result.rowCount === 1) {
			return result.rows[0];
		}
	} catch (e) {
		console.error('Gat ekki fundið notanda eftir notendnafni');
		return null;
	}

	return false;
}

export async function comparePasswords(password, hash) {
	try {
		return await bcrypt.compare(password, hash);
	} catch (e) {
		console.error('Gat ekki borið saman lykilorð', e);
	}

	return false;
}

export async function findById(id) {
	const q = 'SELECT * FROM users WHERE id = $1';

	try {
		const result = await query(q, [id]);

		if (result.rowCount === 1) {
			return result.rows[0];
		}
	} catch (e) {
		console.error('Gat ekki fundið notanda eftir id');
	}

	return null;
}

export async function listAllUsers() {
	const q = 'SELECT (id, name, username, admin) FROM users';
	try {
		const queryResult = await query(q);
		if (queryResult.rowCount !== 0) {
			return queryResult.rows;
		}
	} catch (error) {
		console.error('Gat ekki náð í lista af notendum');
		return error;
	}
	return null;
}

export async function listSingleUser(id) {
	const q = 'SELECT (id, name, username, admin) FROM users WHERE id = $1';
	try {
		const queryResult = await query(q, [id]);
		// console.log(queryResult)
		if (queryResult.rowCount === 1) {
			// console.log(queryResult.rows[0].row)
			// const out = await JSON.parse(queryResult.rows[0])
			// console.log('out --> ' + out)
			return queryResult.rows;
		}
	} catch (error) {
		console.error('Enginn notandi með þetta id');
		return error;
	}
}

export async function newUser(name, username, password) {
	//   const salt = await bcrypt.genSalt(10);
	//   const encrypted = await bcrypt.hash(password,salt);

	const isUser = await query('select * from users where username = $1',[username]);
	if (await isUser.rowCount > 0) return "Notandi nú þegar til með þetta notendanafn vinsamlegast prófaðu annað\n"
	
	const hashedPassword = await bcrypt.hash(password, 11);

	const admin = false;

	const q =
		'INSERT INTO users (name, username, password, admin) VALUES ($1,$2,$3,$4) RETURNING (name, username)';
	const values = [name, username, hashedPassword, admin];

	try {
		const queryResult = await query(q, values);
		if (queryResult.rowCount !== 0) return queryResult.rows;
	} catch (error) {
		console.error('Ekki tókst að búa til notenda');
		return error;
	}
}
