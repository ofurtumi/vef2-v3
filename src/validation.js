import { validationResult, body, query, param } from 'express-validator';
import { findByUsername, comparePasswords } from './users.js';

export function LoginError(message) {
	this.message = message;
	this.stack = Error().stack;
}
LoginError.prototype = Object.create(Error.prototype);
LoginError.prototype.name = 'LoginError';

export function validationCheck(req, res, next) {
	const validation = validationResult(req);

	if (!validation.isEmpty()) {
		const notFoundError = validation.errors.find(
			(error) => error.msg === 'not found'
		);
		const serverError = validation.errors.find(
			(error) => error.msg === 'server error'
		);

		// We loose the actual error object of LoginError, match with error message
		// TODO brittle, better way?
		const loginError = validation.errors.find(
			(error) => error.msg === 'username or password incorrect'
		);

		let status = 400;

		if (serverError) {
			status = 500;
		} else if (notFoundError) {
			status = 404;
		} else if (loginError) {
			status = 401;
		}

		// Strecthing the express-validator library...
		// @see auth/api.js
		const validationErrorsWithoutSkip = validation.errors.filter(
			(error) => error.msg !== 'skip'
		);

		return res.status(status).json({ errors: validationErrorsWithoutSkip });
	}

	return next();
}

const isPatchingAllowAsOptional = (value, { req }) => {
	if (!value && req.method === 'PATCH') {
		return false;
	}

	return true;
};

export const usernameValidator = body('username')
	.isLength({ min: 1, max: 256 })
	.withMessage('username is required, max 256 characters');

export const passwordValidator = body('password')
	.if(isPatchingAllowAsOptional)
	.isLength({ min: 3, max: 256 })
	.withMessage('password is required, min 10 characters, max 256 characters');

export const usernameAndPaswordValidValidator = body('username').custom(
	async (username, { req: { body: reqBody } = {} }) => {
		// Can't bail after username and password validators, so some duplication
		// of validation here
		// TODO use schema validation instead?
		const { password } = reqBody;

		if (!username || !password) {
			return Promise.reject(new Error('skip'));
		}

		let valid = false;
		try {
			const user = await findByUsername(username);
			valid = await comparePasswords(password, user.password);
		} catch (e) {
			// Here we would track login attempts for monitoring purposes
			console.error(`invalid login attempt for ${username}`);
		}

		if (!valid) {
			return Promise.reject(
				new LoginError('username or password incorrect')
			);
		}
		return Promise.resolve();
	}
);
