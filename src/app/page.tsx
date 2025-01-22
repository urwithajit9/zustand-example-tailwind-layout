import CounterWithState from "./components/CounterWithState";
import CounterWithZustand from "./components/CounterWithZustand";
import CounterWithStateWithLayout from "./components/CounterWithStateWithLayout";
import CounterWithZustandWithLayout from "./components/CounterWithZustandWithLayout";
export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center gap-6 mt-10">
      <div className="flex gap-6">
        <CounterWithState />
        <CounterWithZustand />
      </div>
      <div className="flex gap-6">
        <CounterWithStateWithLayout />
        <CounterWithZustandWithLayout />
      </div>
    </div>
  );
}
