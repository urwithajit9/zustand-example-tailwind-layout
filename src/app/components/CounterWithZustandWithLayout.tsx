// CounterWithZustand.tsx
"use client";
import React from "react";
import useStore from "./store"; // Zustand store file
import CounterLayout from "./CounterLayout";

const CounterWithZustandWithLayout = () => {
  const { count, increment, decrement, text, setText } = useStore();

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setText(e.target.value);

  return (
    <CounterLayout
      count={count}
      increment={increment}
      decrement={decrement}
      text={text}
      handleTextChange={handleTextChange}
      bgColor="bg-green-100" // Background color for this component
      boxType="Zustand"
    />
  );
};

export default CounterWithZustandWithLayout;
