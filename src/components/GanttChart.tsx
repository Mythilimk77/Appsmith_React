import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  GanttContainer,
  TaskGrid,
  GridRow,
  Timeline,
  TimelineHeader,
  ScaleRow,
  ScaleCell,
  TimelineBody,
  TaskRow,
  TaskBar,
} from "./GanttChartStyles";
import { Task as TaskType } from "./types"; // adapt import if your types path differs

const DAY_WIDTH_DEFAULT = 30;
const ROW_HEIGHT = 28;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetweenExclusive(a: Date, b: Date) {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / MS_PER_DAY);
}

function rangeDates(min: Date, max: Date) {
  const out: Date[] = [];
  const cur = startOfDay(new Date(min));
  const end = startOfDay(new Date(max));
  while (cur <= end) {
    out.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

interface GanttProps {
  tasks: TaskType[]; // tasks may have children[] (optional)
  dayWidth?: number;
}

export default function GanttChart({ tasks: rootTasks, dayWidth = DAY_WIDTH_DEFAULT }: GanttProps) {
  const [expanded, setExpanded] = useState<Set<string | number>>(new Set());
  const gridRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const isSyncing = useRef(false);

  // 1) compute min/max date across entire tree
  const { minDate, maxDate } = useMemo(() => {
    let min = Infinity, max = -Infinity;
    function walk(list?: TaskType[]) {
      if (!list) return;
      for (const t of list) {
        const s = startOfDay(t.start).getTime();
        const e = startOfDay(t.end).getTime();
        if (s < min) min = s;
        if (e > max) max = e;
        if (t.children) walk(t.children);
      }
    }
    walk(rootTasks);
    if (min === Infinity) min = startOfDay(new Date()).getTime();
    if (max === -Infinity) max = startOfDay(new Date()).getTime();
    return { minDate: startOfDay(new Date(min)), maxDate: startOfDay(new Date(max)) };
  }, [rootTasks]);

  const allDates = useMemo(() => rangeDates(minDate, maxDate), [minDate, maxDate]);

  // 2) flatten visible rows into a single array (canonical order)
  const flattened = useMemo(() => {
    const out: { task: TaskType; depth: number }[] = [];
    function walk(list: TaskType[] | undefined, depth = 0) {
      if (!list) return;
      for (const t of list) {
        out.push({ task: t, depth });
        const isExpanded = expanded.has(t.id);
        if (t.children && isExpanded) {
          walk(t.children, depth + 1);
        }
      }
    }
    walk(rootTasks, 0);
    return out;
  }, [rootTasks, expanded]);

  // 3) vertical scroll synchronization
  useEffect(() => {
    const grid = gridRef.current;
    const tl = timelineRef.current;
    if (!grid || !tl) return;

    const onGridScroll = () => {
      if (isSyncing.current) { isSyncing.current = false; return; }
      isSyncing.current = true;
      tl.scrollTop = grid.scrollTop;
    };
    const onTimelineScroll = () => {
      if (isSyncing.current) { isSyncing.current = false; return; }
      isSyncing.current = true;
      grid.scrollTop = tl.scrollTop;
    };

    grid.addEventListener("scroll", onGridScroll);
    tl.addEventListener("scroll", onTimelineScroll);
    return () => {
      grid.removeEventListener("scroll", onGridScroll);
      tl.removeEventListener("scroll", onTimelineScroll);
    };
  }, []);

  // helper to toggle expand
  const toggle = (id: string | number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <GanttContainer>
      {/* Left Task Grid */}
      <TaskGrid ref={gridRef}>
        {flattened.map(({ task, depth }, idx) => (
          <GridRow
            key={String(task.id)}
            level={depth}
            style={{ height: ROW_HEIGHT }}
            onClick={() => task.children && toggle(task.id)}
          >
            {task.children && (
              <span style={{ marginRight: 8 }}>{expanded.has(task.id) ? "▼" : "▶"}</span>
            )}
            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.name}</div>
          </GridRow>
        ))}
      </TaskGrid>

      {/* Right Timeline */}
      <Timeline>
        <TimelineHeader>
          {/* Day scale */}
          <ScaleRow>
            <div style={{ width: 0 /* left gutter taken by TaskGrid */ }} />
            {allDates.map(d => (
              <ScaleCell key={d.toISOString()} width={dayWidth}>
                {d.toLocaleString(undefined, { month: "short", day: "numeric" })}
              </ScaleCell>
            ))}
          </ScaleRow>
        </TimelineHeader>

        <TimelineBody ref={timelineRef} style={{ height: flattened.length * ROW_HEIGHT }}>
          {/* horizontal grid / background rows */}
          {flattened.map((_, rowIndex) => (
            <TaskRow key={"rowbg-" + rowIndex} style={{ top: rowIndex * ROW_HEIGHT, height: ROW_HEIGHT }} />
          ))}

          {/* Task bars placed using canonical index */}
          {flattened.map(({ task }, i) => {
            const leftDays = Math.round((startOfDay(task.start).getTime() - minDate.getTime()) / MS_PER_DAY);
            const durDays = Math.max(1, Math.round((startOfDay(task.end).getTime() - startOfDay(task.start).getTime()) / MS_PER_DAY) + 1);
            const leftPx = leftDays * dayWidth;
            const widthPx = durDays * dayWidth;
            return (
              <TaskBar
                key={String(task.id)}
                left={leftPx}
                width={widthPx}
                style={{ top: i * ROW_HEIGHT + (ROW_HEIGHT - 20) / 2 }} // vertically center inside row
                color={task.color}
                title={`${task.name} (${task.start.toDateString()} → ${task.end.toDateString()})`}
              >
                {task.progress != null ? `${task.progress}%` : ""}
              </TaskBar>
            );
          })}
        </TimelineBody>
      </Timeline>
    </GanttContainer>
  );
}
