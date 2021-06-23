import { rest } from 'msw';

const prefix = 'api/v1';

const routes = {
  lists: () => [prefix, 'lists'].join('/'),
  tasks: () => [prefix, 'tasks'].join('/'),
  listTasks: () => [prefix, 'lists', ':listId', 'tasks'].join('/'),
  list: () => [prefix, 'lists', ':listId'].join('/'),
  task: () => [prefix, 'tasks', ':taskId'].join('/'),
};

export const handlers = [
  rest.post(routes.listTasks(), (req, res, ctx) => {
    const { text } = req.body;
    const { listId } = req.params;

    return res(
      ctx.json({
        text,
        listId: Number(listId),
        id: 1,
        completed: false,
        touched: Date.now(),
      }),
    );
  }),
  rest.patch(routes.task(), (req, res, ctx) => {
    const { completed } = req.body;
    const { taskId } = req.params;

    return res(
      ctx.json({
        id: Number(taskId),
        text: 'text',
        listId: 1,
        completed,
        touched: Date.now(),
      }),
    );
  }),
  rest.delete(routes.task(), (_, res) => res()),
];

export const errorCreateTaskHandler = rest.post('/api/v1/lists/:listId/tasks', (req, res, ctx) => res(ctx.status(500)));