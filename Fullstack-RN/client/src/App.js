import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TodoForm from './Todoform';
import Header from './shared/header';

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
  
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:9000/todos/${id}`, );
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <div className='App'>
      <Header/>
      <h1>MERN Stack App</h1>
      <TodoForm onAdd={addTodo} />
      <ul>
        {todos.map(todo => (
          <li key={todo._id}>{todo.task}
          <button onClick={() => deleteTodo(todo._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default App;
