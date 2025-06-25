import React from 'react';
import useToggle from './useToggle';

export default function TodoItem({ text }) {
  const [done, toggleDone] = useToggle(false);

  // When whole item is clicked
  const handleItemClick = () => {
    alert('Item clicked!');
  };

  // When checkbox is clicked
  const handleCheckboxClick = (e) => {
    e.stopPropagation(); // Prevents triggering handleItemClick
    toggleDone(); // Toggle checked/unchecked
  };

  return (
    <div onClick={handleItemClick} style={{ cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={done}
        onClick={handleCheckboxClick}
        readOnly
        style={{ marginRight: '10px' }}
      />
      <span style={{ textDecoration: done ? 'line-through' : 'none' }}>
        {text}
      </span>
    </div>
  );
}