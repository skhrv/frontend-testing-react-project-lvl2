import app from '@hexlet/react-todo-app-with-backend';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

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

describe('todo app', () => {
  it('main page', () => {
    const vdom = app(PRELOAD_STATE);

    render(vdom);
    expect(screen.getByTestId('list-form')).toBeInTheDocument();
    expect(screen.getByTestId('lists')).toBeInTheDocument();
    expect(screen.getByTestId('task-form')).toBeInTheDocument();
  });
});
