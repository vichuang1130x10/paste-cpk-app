import { useState } from "react";

export function useSelect(initialValue) {
  const [value, setValue] = useState(initialValue);

  return [
    {
      value,
      onChange: (e) => setValue(e.target.value),
      onBlur: (e) => setValue(e.target.value),
    },
    () => setValue(initialValue),
  ];
}
