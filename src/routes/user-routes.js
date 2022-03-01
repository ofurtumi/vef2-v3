import express from 'express';
import stringTable from 'string-table';
import { ensureLoggedIn, isAdmin } from '../login.js';
import { listAllUsers, listSingleUser, newUser } from '../users.js';

export const router = express.Router();

async function listUsers(req, res) {
	// console.log('lu() --> ' + lu())
	const u = await listAllUsers();

    let users = [];

    u.forEach(el => {
        let single = el.row.replace("(","")
        single = single.replace(")","")
        const singleList = single.split(",")
        users.push({
            "id": singleList[0],
            "username": singleList[2],
            "name": singleList[1],
            "isAdmin": singleList[3]
        })
    });

    const userTable = stringTable.create(users)
	res.send(userTable+"\n");
}

async function singleUser(req, res) {
    const { id } = req.params;
    console.log('id --> ' + id)
    const rows = await listSingleUser(id);
    const user = await rows[0].row.substring(1,rows[0].row.length-1).split(",")
    console.log('user --> ' + user)
    const output = `~~~\nid:       ${user[0]}\nname:     ${user[1]}\nusername: ${user[2]}\nisAdmin:  ${user[3]}\n~~~\n`
    res.send(output)
}

async function registerUser(req, res) {
    const { name, username, password } = req.body;

    // console.log(req.body)
    // console.log('password --> ' + password)
	// console.log('name --> ' + name)
	// console.log('username --> ' + username)

    const NU = await newUser(name, username, password);
    return res.send(NU);
}

router.get('/', isAdmin, listUsers)
router.get('/:id', isAdmin, singleUser)
router.post('/register', registerUser)
// router.get('/', listUsers);
