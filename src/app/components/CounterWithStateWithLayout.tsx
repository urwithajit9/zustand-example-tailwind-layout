// CounterWithState.tsx
"use client";
import React, { useState } from "react";
import CounterLayout from "./CounterLayout";

const CounterWithStateWithLayout = () => {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  return (
    <CounterLayout
      count={count}
      increment={increment}
      decrement={decrement}
      text={text}
      handleTextChange={handleTextChange}
      bgColor="bg-blue-100" // Background color for this component
      boxType="State"
    />
  );
};

export default CounterWithStateWithLayout;
