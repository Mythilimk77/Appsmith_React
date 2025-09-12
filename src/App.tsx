import React from "react";
import GanttChart from "./components/GanttChart";
import { Task } from "./components/types";

const tasks: Task[] = [
  {
    id: 1,
    name: "Project A",
    start: new Date("2025-09-01"),
    end: new Date("2025-09-10"),
    color: "#4caf50",
    children: [
      {
        id: 2,
        name: "Task A1",
        start: new Date("2025-09-01"),
        end: new Date("2025-09-05"),
        color: "#2196f3",
      },
      {
        id: 3,
        name: "Task A2",
        start: new Date("2025-09-06"),
        end: new Date("2025-09-10"),
        color: "#ff9800",
      },
    ],
  },
  {
    id: 4,
    name: "Project B",
    start: new Date("2025-09-03"),
    end: new Date("2025-09-15"),
    color: "#9c27b0",
  },
];

function App() {
  return (
    <div style={{ height: "100vh", background: "#2c2f33", padding: "16px" }}>
      <GanttChart tasks={tasks} />
    </div>
  );
}

export default App;
