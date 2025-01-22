"use client";
import React from "react";
import useStore from "./store"; // Import the Zustand store

const CounterWithZustand = () => {
  // Access the global state and actions from the Zustand store
  const { count, text, increment, decrement, setText } = useStore();

  return (
    <div className="bg-green-100 p-6 rounded-lg shadow-md">
      <div className="flex flex-col justify-center items-center  mt-4 divide-y divide-solid divide-gray-400">
        <h1 className="text-4xl font-bold"> Counter with Zustand </h1>
        <h1 className="text-2xl font-semibold mt-2">Counter: {count}</h1>
      </div>
      <div className="flex justify-center space-x-4 mt-4">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded mt-4 mr-2"
          onClick={increment}
        >
          Increment
        </button>
        <button
          className="bg-orange-500 text-white px-4 py-2 rounded mt-4"
          onClick={decrement}
        >
          Decrement
        </button>
      </div>
      <div className="mt-6">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type something"
          className="border border-gray-300 p-2 rounded mt-2 w-full"
        />
        <p className="mt-4 font-semibold">You typed: {text}</p>
      </div>
    </div>
  );
};

export default CounterWithZustand;
