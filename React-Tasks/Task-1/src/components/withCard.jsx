import React from 'react';

export default function withCard(WrappedComponent) {
  return function CardedComponent(props) {
    return (
      <div style={{
        border: '1px solid #ccc',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '10px',
        background: '#f9f9f9'
      }}>
        <WrappedComponent {...props} />
      </div>
    );
  };
}
