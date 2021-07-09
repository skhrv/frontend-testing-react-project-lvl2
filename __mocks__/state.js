import { remove } from 'lodash';

export const getInitialState = () => ({
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
});

let state = getInitialState();

export const createTask = (text, listId) => {
  const task = {
    text,
    listId: Number(listId),
    id: Date.now(),
    completed: false,
    touched: Date.now(),
  };
  state.tasks.push(task);
  return task;
};

export const deleteTask = (id) => {
  remove(state.tasks, (task) => task.id === id);
};

export const updateTask = (taskId, completed) => {
  const task = state.tasks.find((item) => item.id === Number(taskId));
  task.completed = completed;
  task.touched = Date.now();
  return task;
};

export const createList = (name) => {
  const list = {
    name,
    removable: true,
    id: Date.now(),
  };
  return list;
};

export const deleteList = (id) => {
  remove(state.lists, (list) => list.id === id);
};

export const resetState = () => {
  state = getInitialState();
};
