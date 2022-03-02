import express from 'express';
import stringTable from 'string-table';
import jwt from 'jsonwebtoken';
import { jwtOptions, requireAuthentication, tokenOptions } from '../passport.js';
import { ensureLoggedIn, isAdmin } from '../login.js';
import {
	findByUsername,
	listAllUsers,
	listSingleUser,
	newUser,
	userNotExists,
} from '../users.js';
import {
	passwordValidator,
	usernameAndPaswordValidValidator,
	usernameValidator,
	validationCheck,
} from '../validation.js';
import jsonwebtoken from 'jsonwebtoken';

export const router = express.Router();

async function listUsers(req, res) {
	// console.log('lu() --> ' + lu())
	const u = await listAllUsers();

	let users = [];

	u.forEach((el) => {
		let single = el.row.replace('(', '');
		single = single.replace(')', '');
		const singleList = single.split(',');
		users.push({
			id: singleList[0],
			username: singleList[2],
			name: singleList[1],
			isAdmin: singleList[3],
		});
	});

	const userTable = stringTable.create(users);
	res.send(userTable + '\n');
}

async function singleUser(req, res) {
	const { id } = req.params;
	// console.log('id --> ' + id)

	try {
		const rows = await listSingleUser(id);
		if (!rows) res.send('Ekki tókst að sækja notenda með þetta id');
		const user = await rows[0].row
			.substring(1, rows[0].row.length - 1)
			.split(',');
		console.log('user --> ' + user);
		const output = `~~~\nid:       ${user[0]}\nname:     ${user[1]}\nusername: ${user[2]}\nisAdmin:  ${user[3]}\n~~~\n`;
		res.send(output);
	} catch (error) {
		console.error('ekki tókst að sækja notanda með þetta id');
	}
}

async function registerUser(req, res) {
	const { name, username, password = '' } = req.body;

	const NU = await newUser(name, username, password);
	delete NU.password;
	return res.status(201).json(NU);
}

async function mirror(req, res) {
	const output = `~~~\nid:       ${req.user.id}\nname:     ${req.user.name}\nusername: ${req.user.username}\nisAdmin:  ${req.user.admin}\n~~~\n`;
	res.send(output);
}

async function loginUser(req, res) {
	const { username } = req.body;

	const user = await findByUsername(username);

	if (!user) {
        console.error('Unable to find user', username);
        return res.status(500).json({});
	}

    const payload = { id: user.id };
	const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);
	delete user.password;

	return res.json({
		user,
		token,
		expiresIn: tokenOptions.expiresIn,
	});
}

async function loginRoute(req, res) {
	const { username } = req.body;

	const user = await findByUsername(username);

	if (!user) {
		logger.error('Unable to find user', username);
		return res.status(500).json({});
	}

	const payload = { id: user.id };
	const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);
	delete user.password;

	return res.json({
		user,
		token,
		expiresIn: tokenOptions.expiresIn,
	});
}

router.get('/', isAdmin, listUsers);
router.get('/me', ensureLoggedIn, mirror);
router.get('/:id', isAdmin, singleUser);
router.post('/register', userNotExists, registerUser);
router.post(
	'/login',
	usernameValidator,
	passwordValidator,
	usernameAndPaswordValidValidator,
	validationCheck,
	loginUser
);
// router.get('/', listUsers);
