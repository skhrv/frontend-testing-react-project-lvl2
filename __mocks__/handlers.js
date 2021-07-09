import { rest } from 'msw';
import {
  createList, createTask, deleteList, deleteTask, updateTask,
} from './state';

const prefix = '/api/v1';

const routes = {
  lists: () => [prefix, 'lists'].join('/'),
  listTasks: () => [prefix, 'lists', ':listId', 'tasks'].join('/'),
  list: () => [prefix, 'lists', ':listId'].join('/'),
  task: () => [prefix, 'tasks', ':taskId'].join('/'),
};

export const handlers = [
  // create task
  rest.post(routes.listTasks(), (req, res, ctx) => {
    const { text } = req.body;
    const { listId } = req.params;
    const task = createTask(text, listId);
    return res(
      ctx.json(task),
    );
  }),

  // update task
  rest.patch(routes.task(), (req, res, ctx) => {
    const { completed } = req.body;
    const { taskId } = req.params;
    const task = updateTask(taskId, completed);
    return res(
      ctx.json(task),
    );
  }),
  // delete task
  rest.delete(routes.task(), (req, res) => {
    const { taskId } = req.params;

    deleteTask(taskId);
    return res();
  }),

  // create list
  rest.post(routes.lists(), (req, res, ctx) => {
    const { name } = req.body;
    const createdList = createList(name);
    return res(
      ctx.json(createdList),
    );
  }),
  // delete list
  rest.delete(routes.list(), (req, res) => {
    const { listId } = req.params;

    deleteList(listId);
    return res();
  }),
];

export const errorCreateTaskHandler = rest.post('/api/v1/lists/:listId/tasks', (_, res, ctx) => res(ctx.status(500)));
