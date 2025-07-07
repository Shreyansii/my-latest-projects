import { useState } from 'react';

export default function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = () => setValue((v) => !v); // invert true/false
  return [value, toggle];
}
