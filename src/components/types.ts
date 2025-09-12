export type ID = string | number;

export interface Task {
  id: ID;
  name: string;
  start: Date;
  end: Date;
  progress?: number;  // 0–100
  color?: string;
  children?: Task[];
  expanded?: boolean;
  parentId?: ID | null;
}

export interface GanttChartProps {
  tasks: Task[];
}
