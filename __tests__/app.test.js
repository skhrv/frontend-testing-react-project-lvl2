import app from '@hexlet/react-todo-app-with-backend';
import {
  render, screen, getByText, getByLabelText, getByRole, waitFor, findByText, queryByText,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
// eslint-disable-next-line jest/no-mocks-import
import { server } from '../__mocks__/server';
// eslint-disable-next-line jest/no-mocks-import
import { errorCreateTaskHandler } from '../__mocks__/handlers';

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
  tasks: [{
    text: 'read book',
    listId: 2,
    id: 3,
    completed: false,
    touched: 1624720150224,
  }, {
    text: 'work',
    listId: 2,
    id: 4,
    completed: false,
    touched: 1624720160058,
  }],
  currentListId: 1,
};

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

describe('todo app positive cases', () => {
  it('main page', () => {
    const vdom = app(PRELOAD_STATE);

    render(vdom);
    expect(screen.getByTestId('list-form')).toBeInTheDocument();
    expect(screen.getByTestId('lists')).toBeInTheDocument();
    expect(screen.getByTestId('task-form')).toBeInTheDocument();
  });

  it('tasks: create, update and delete', async () => {
    const vdom = app(PRELOAD_STATE);

    render(vdom);
    const taskForm = screen.getByTestId('task-form');

    userEvent.type(getByLabelText(taskForm, /new task/i), 'first task');
    userEvent.click(getByText(taskForm, /add/i));

    const tasks = await screen.findByTestId('tasks');
    const task = getByText(tasks, /first task/i);
    expect(getByRole(task, 'checkbox')).not.toBeChecked();

    userEvent.click(task);
    await waitFor(() => expect(getByRole(task, 'checkbox')).toBeChecked());

    userEvent.click(getByText(tasks, /remove/i));
    await waitFor(() => expect(task).not.toBeInTheDocument());

    userEvent.click(screen.getByText(/secondary/i));
    const secondaryListTask1 = screen.getByText(/read book/i);
    const secondaryListTask2 = screen.getByText(/work/i);
    expect(secondaryListTask1).toBeInTheDocument();
    expect(getByRole(secondaryListTask1, 'checkbox')).not.toBeChecked();

    expect(secondaryListTask2).toBeInTheDocument();
    expect(getByRole(secondaryListTask2, 'checkbox')).not.toBeChecked();
  });

  it('lists: create, update and delete', async () => {
    const vdom = app(PRELOAD_STATE);

    render(vdom);
    const listForm = screen.getByTestId('list-form');

    userEvent.type(getByLabelText(listForm, /new list/i), 'unsorted');
    userEvent.click(getByText(listForm, /add/i));

    const lists = screen.getByTestId('lists');

    const createdListContainer = (await findByText(lists, /unsorted/i)).closest('li');

    expect(screen.getByText(/tasks list is empty/i)).toBeInTheDocument();
    const taskForm = screen.getByTestId('task-form');

    userEvent.type(getByLabelText(taskForm, /new task/i), 'first task');
    userEvent.click(getByText(taskForm, /add/i));
    await waitFor(() => {
      expect(screen.queryByText(/tasks list is empty/i)).not.toBeInTheDocument();
    });
    userEvent.click(getByText(createdListContainer, /remove/i));
    await waitFor(() => {
      expect(createdListContainer).not.toBeInTheDocument();
      expect(screen.queryByText(/tasks list is empty/i)).toBeInTheDocument();
    });
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

  it('duplicate list names', async () => {
    const vdom = app(PRELOAD_STATE);

    render(vdom);
    const listForm = screen.getByTestId('list-form');
    const listName = 'secondary';
    expect(screen.getByText(listName)).toBeInTheDocument();
    userEvent.type(getByLabelText(listForm, /new list/i), listName);
    userEvent.click(getByText(listForm, /add/i));
    await waitFor(() => {
      expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    });
  });

  it('duplicate task names', async () => {
    const vdom = app(PRELOAD_STATE);

    render(vdom);
    const listWithTasks = screen.getByText('secondary');
    expect(listWithTasks).toBeInTheDocument();
    userEvent.click(listWithTasks);

    const taskName = 'read book';

    const taskForm = screen.getByTestId('task-form');

    userEvent.type(getByLabelText(taskForm, /new task/i), taskName);
    userEvent.click(getByText(taskForm, /add/i));
    await waitFor(() => {
      expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    });
  });

  it('delete list with tasks and create new with same name', async () => {
    const vdom = app(PRELOAD_STATE);

    render(vdom);
    const listWithTasksName = 'secondary';

    const list = screen.getByText(listWithTasksName);
    expect(list).toBeInTheDocument();
    userEvent.click(list);

    expect(screen.queryByText(/tasks list is empty/i)).not.toBeInTheDocument();

    const listContainer = list.closest('li');
    userEvent.click(getByText(listContainer, /remove/i));

    await waitFor(() => {
      expect(screen.queryByText(/secondary/i)).not.toBeInTheDocument();
    });

    const listForm = screen.getByTestId('list-form');
    userEvent.type(getByLabelText(listForm, /new list/i), listWithTasksName);
    userEvent.click(getByText(listForm, /add/i));
    await waitFor(() => {
      expect(screen.queryByText(/secondary/i)).toBeInTheDocument();
      expect(screen.queryByText(/tasks list is empty/i)).toBeInTheDocument();
    });
  });

  it('non removable list', () => {
    const vdom = app(PRELOAD_STATE);

    render(vdom);
    const listContainer = screen.getByText(/primary/i).closest('li');
    expect(queryByText(listContainer, /remove/i)).not.toBeInTheDocument();
  });
});

afterAll(() => server.close());
