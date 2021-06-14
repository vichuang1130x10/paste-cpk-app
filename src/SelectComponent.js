import React from "react";

const capitalize = (str) => {
  const lower = str.toLowerCase();
  return str.charAt(0).toUpperCase() + lower.slice(1);
};

export default function SelectComponent({ labelName, props, options }) {
  return (
    <label htmlFor={labelName}>
      {capitalize(labelName)}
      <select id={labelName} {...props}>
        <option />
        {options.map((animal) => (
          <option value={animal} key={animal}>
            {capitalize(animal)}
          </option>
        ))}
      </select>
    </label>
  );
}
