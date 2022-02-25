import express from 'express';

import { addResponse, getAllEvents, getSingleEvent } from '../events.js';
import { getResponses } from '../lib/db.js';
import { catchErrors } from '../utils.js';

export const router = express.Router();

async function index(req, res) {
  const title = 'Viðburðayfirlit';
  const admin = false;
  const validated = req.isAuthenticated();
  const events = await getAllEvents();

  return res.render('index', {
    title,
    validated,
    events,
    admin,
  });
}

async function eventPage(req, res) {
  const { slug } = req.params;

  let data = false;

  try {
    const eventDetails = await getSingleEvent(slug);
    const responses = await getResponses(slug);
    const eventComments = responses.rows;
    const details = eventDetails[0];
    const desc = details.description;
    const validated = req.isAuthenticated();

    let cDate = new Date(details.created);
    cDate = cDate.toUTCString();

    let mDate = new Date(details.modified);
    mDate = mDate.toUTCString();

    data = true;

    res.render('single-event', {
      title: details.name,
      data,
      details,
      eventComments,
      desc,
      cDate,
      mDate,
      validated,
    });
  } catch (error) {
    console.error('Unable to get data corresponding to this slug,', error);
    res.render('error', { title: 'síða fannst ekki' });
  }
}

router.get('/', index);
router.get('/:slug', eventPage);
router.post('/:slug', catchErrors(addResponse));
