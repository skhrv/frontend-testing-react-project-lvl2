import app from '@hexlet/react-todo-app-with-backend';
import {
  render, screen, getByText, getByLabelText, getByRole, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { handlers, errorCreateTaskHandler } from './handlers';

const PRELOAD_STATE = {
  lists: [{
    id: 1,
    name: 'primary',
    removable: false,
  }, {
    id: 2,
    name: 'secondary',
    removable: true,
  }],
  tasks: [],
  currentListId: 1,
};
const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

describe('todo app positive cases', () => {
  it('main page', () => {
    const vdom = app(PRELOAD_STATE);

    render(vdom);
    expect(screen.getByTestId('list-form')).toBeInTheDocument();
    expect(screen.getByTestId('lists')).toBeInTheDocument();
    expect(screen.getByTestId('task-form')).toBeInTheDocument();
  });

  it('tasks', async () => {
    const vdom = app(PRELOAD_STATE);

    render(vdom);
    const taskForm = screen.getByTestId('task-form');

    userEvent.type(getByLabelText(taskForm, /new task/i), 'first task');
    userEvent.click(getByText(taskForm, /add/i));

    const taskList = await screen.findByTestId('tasks');

    const task = getByText(taskList, /first task/i);
    expect(getByRole(task, 'checkbox')).not.toBeChecked();

    userEvent.click(task);
    await waitFor(() => expect(getByRole(task, 'checkbox')).toBeChecked());

    userEvent.click(getByText(taskList, /remove/i));
    await waitFor(() => expect(task).not.toBeInTheDocument());
  });
});

describe('todo app negative cases', () => {
  it('show alert when network problem', async () => {
    const vdom = app(PRELOAD_STATE);
    server.use(
      errorCreateTaskHandler,
    );
    render(vdom);
    const taskForm = screen.getByTestId('task-form');
    userEvent.type(getByLabelText(taskForm, /new task/i), 'first task');
    userEvent.click(getByText(taskForm, /add/i));
    await expect(screen.findByText(/network error/i)).resolves.toBeTruthy();
  });
});

afterAll(() => server.close());
