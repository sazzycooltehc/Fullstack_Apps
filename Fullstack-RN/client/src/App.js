import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TodoForm from './Todoform';

const App = () => {
  const [todos, setTodos] = useState([]);
  useEffect(() => {
    // Fetch data from the Express server
    axios.get('http://localhost:9000/todos')
      .then(response => setTodos(response.data))
      .catch(error => console.error(error));
  }, []);

  const addTodo = (newTodo) => {
    setTodos([...todos, newTodo]);
  };

  return (
    <div className='App'>
        <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {/* <p>
          Edit <code>src/App.js</code> and save to reload.
        </p> */}
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
        </a>
      </header>
      <h1>MERN Stack Todo App</h1>
      <TodoForm onAdd={addTodo} />
      <ul>
        {todos.map(todo => (
          <li key={todo._id}>{todo.task}</li>
        ))}
      </ul>
    </div>
  );
};
export default App;
