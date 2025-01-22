"use client";
import React, { useState } from "react";

const CounterWithState = () => {
  // Managing counter state with useState
  const [count, setCount] = useState(0);

  // Managing text input state with useState
  const [text, setText] = useState("");

  // Handlers for incrementing/decrementing counter
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);

  // Handler for updating text input
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  return (
    <div className="bg-blue-100 p-6 rounded-lg shadow-md">
      <div className="flex flex-col justify-center items-center mt-4 divide-y divide-solid divide-gray-400 ">
        <h1 className="text-4xl font-bold"> Counter with State</h1>
        <h1 className="text-2xl font-semibold mt-2">Counter: {count}</h1>
      </div>
      <div className="flex justify-center space-x-4 mt-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4 mr-2"
          onClick={increment}
        >
          Increment
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded mt-4"
          onClick={decrement}
        >
          Decrement
        </button>
      </div>
      <div className="mt-6">
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          className="border border-gray-300 p-2 rounded mt-2 w-full"
          placeholder="Type something"
        />
        <p className="mt-4 font-semibold">You typed: {text}</p>
      </div>
    </div>
  );
};

export default CounterWithState;
