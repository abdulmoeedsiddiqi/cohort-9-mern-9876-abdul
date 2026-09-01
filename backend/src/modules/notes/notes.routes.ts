import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate';
import * as notesController from './notes.controller';

export const notesRouter = Router();

notesRouter.use(authenticate);

notesRouter.get('/', notesController.list);
notesRouter.get('/trash', notesController.listTrash);
notesRouter.post('/', notesController.create);
notesRouter.get('/:id', notesController.getOne);
notesRouter.patch('/:id', notesController.update);
notesRouter.post('/:id/restore', notesController.restore);
notesRouter.delete('/:id/purge', notesController.purge);
notesRouter.delete('/:id', notesController.remove);
