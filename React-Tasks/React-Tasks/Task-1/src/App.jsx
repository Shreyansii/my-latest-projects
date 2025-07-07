import React from 'react';
import TodoItem from './components/TodoItem';
import withCard from './components/withCard';

// Make a styled version of TodoItem using a Higher Order Component
const CardedTodo = withCard(TodoItem);

export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>📝 My Todo List</h1>

      {/* Props: text is passed to child */}
      <CardedTodo text="Buy milk" />
      <CardedTodo text="Study React" />
    </div>
  );
}
