// CounterLayout.tsx
"use client";
import React from "react";

interface CounterLayoutProps {
  count: number;
  increment: () => void;
  decrement: () => void;
  text: string;
  handleTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  bgColor: string; // Dynamic background color
  boxType: string;
}

const CounterLayout: React.FC<CounterLayoutProps> = ({
  count,
  increment,
  decrement,
  text,
  handleTextChange,
  bgColor,
  boxType,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg shadow-md ${bgColor}`}
    >
      <div className="p-6 mt-4">
        <h1 className="text-4xl font-bold"> {`Counter with ${boxType}`}</h1>
        <h1 className="text-2xl font-semibold">Counter: {count}</h1>
      </div>
      {/* Center the buttons */}
      <div className="flex justify-center space-x-4 mt-4">
        <button
          onClick={increment}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Increment
        </button>
        <button
          onClick={decrement}
          className="bg-orange-500 text-white px-4 py-2 rounded"
        >
          Decrement
        </button>
      </div>

      <div className="mt-6 w-full p-3">
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Type something"
          className="border border-gray-300 p-2 rounded mt-4 w-full"
        />
        <p className="mt-4 font-semibold p-3">You typed: {text}</p>
      </div>
    </div>
  );
};

export default CounterLayout;
