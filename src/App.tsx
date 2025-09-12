import React, { useState } from "react";
import GanttChart from "./components/GanttChart";
import { Task } from "./components/types";

const today = new Date();
today.setHours(0, 0, 0, 0);

const initial: Task[] = [
  {
    id: 1,
    machine: "Mach-01",
    mpn: "MPN-1001",
    start: new Date(today.getTime() + 8 * 60 * 60 * 1000),
    end: new Date(today.getTime() + 18 * 60 * 60 * 1000),
    usedHours: 4,
    totalHours: 10,
    color: "#16a34a",
  },
  {
    id: 2,
    machine: "Mach-02",
    mpn: "MPN-2002",
    start: new Date(today.getTime() + 9 * 60 * 60 * 1000),
    end: new Date(today.getTime() + 20 * 60 * 60 * 1000),
    usedHours: 6,
    totalHours: 11,
    color: "#7c3aed",
  },
  {
    id: 3,
    machine: "Mach-03",
    mpn: "MPN-3003",
    start: new Date(today.getTime() + 7 * 60 * 60 * 1000),
    end: new Date(today.getTime() + 16 * 60 * 60 * 1000),
    usedHours: 2,
    totalHours: 9,
    color: "#0ea5e9",
  },
];

function App() {
  const [tasks, setTasks] = useState<Task[]>(initial);

  return (
    <div style={{ padding: 24, background: "#f3f6fb", minHeight: "100vh" }}>
      <h2>Machine Dashboard — Gantt</h2>
      <div style={{ marginTop: 12 }}>
        <GanttChart
          tasks={tasks}
          onOrderChange={(order) => {
            const newList = order.map(id => tasks.find(t => t.id === id)!).filter(Boolean);
            setTasks(newList);
          }}
          onTaskChange={(updated) => {
            setTasks(prev => prev.map(p => p.id === updated.id ? updated : p));
          }}
        />
      </div>
    </div>
  );
}

export default App;