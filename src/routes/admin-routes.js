import express from 'express';
import passport from 'passport';

import { createEvent, getAllEvents, updateEvent } from '../events.js';
import { deleteRow } from '../lib/db.js';
import { ensureLoggedIn } from '../login.js';
import { catchErrors } from '../utils.js';

export const router = express.Router();

function login(req, res) {
  const validated = req.isAuthenticated();
  if (validated) {
    return res.redirect('/');
  }

  let message = '';

  // Athugum hvort einhver skilaboð séu til í session, ef svo er birtum þau
  // og hreinsum skilaboð
  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }

  return res.render('login', { message, title: 'Innskráning', validated });
}

async function index(req, res) {
  const title = 'Admin stjórnborð';
  const validated = req.isAuthenticated();
  const admin = req.isAuthenticated();
  const events = await getAllEvents();

  return res.render('index', {
    title,
    validated,
    events,
    admin,
  });
}

async function deleteRoute(req, res) {
  const { id } = req.params;

  const deleted = await deleteRow(id);

  if (deleted) {
    // Tæknilega böggur hér...
    return res.redirect('/admin');
  }

  return res.render('error', { title: 'Gat ekki eytt færslu' });
}

router.get('/', ensureLoggedIn, catchErrors(index));
router.get('/login', login);

router.post('/', ensureLoggedIn, catchErrors(createEvent));

router.post(
  '/login',

  // Þetta notar strat að ofan til að skrá notanda inn
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/admin/login',
  }),

  // Ef við komumst hingað var notandi skráður inn, senda á /admin
  (req, res) => {
    res.redirect('/admin');
  }
);

router.post('/:slug', updateEvent);
router.post('/delete-event/:id', ensureLoggedIn, catchErrors(deleteRoute));

router.get('/logout', (req, res) => {
  // logout hendir session cookie og session
  req.logout();
  res.redirect('/');
});
