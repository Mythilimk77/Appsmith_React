import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  GanttContainer,
  LeftGrid,
  GridHeader,
  GridCol,
  GridBody,
  GridRow,
  TimelineArea,
  TimelineHeader,
  ScaleRow,
  ScaleCell,
  TimelineBody,
  TrackRow,
  Bar,
  UsageFill,
  Handle,
  TimelineInner,
  LeftGutter
} from "./GanttChartStyles";
import { Task } from "./types";

const ROW_HEIGHT = 64;
const HEADER_HEIGHT = 56;
const DEFAULT_PX_PER_HOUR = 60;
const MS_PER_HOUR = 1000 * 60 * 60;

export interface GanttProps {
  tasks: Task[];
  onOrderChange?: (orderedIds: (string | number)[]) => void;
  onTaskChange?: (task: Task) => void;
}

export default function GanttChart({ tasks: initialTasks, onOrderChange, onTaskChange }: GanttProps) {
  const [tasks, setTasks] = useState<Task[]>(() => initialTasks.map(t => ({ ...t })));
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [pxPerHour, setPxPerHour] = useState<number>(DEFAULT_PX_PER_HOUR);
  const dragRowId = useRef<string | number | null>(null);
  const dragOverId = useRef<string | number | null>(null);
  const barDrag = useRef<{
    id: string | number;
    startOffsetMs: number;
    initialMouseX: number;
  } | null>(null);
  const leftBodyRef = useRef<HTMLDivElement | null>(null);
  const rightAreaRef = useRef<HTMLDivElement | null>(null);

  const { minTime, maxTime } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const min = now.getTime() + 6 * MS_PER_HOUR;
    const max = now.getTime() + 12 * MS_PER_HOUR;

    if (!tasks.length) {
      return { minTime: min, maxTime: max };
    }
    let minTaskTime = Math.min(...tasks.map(t => t.start.getTime()));
    let maxTaskTime = Math.max(...tasks.map(t => t.end.getTime()));

    return {
      minTime: Math.min(min, minTaskTime - MS_PER_HOUR),
      maxTime: Math.max(max, maxTaskTime + MS_PER_HOUR)
    };
  }, [tasks]);

  const totalHours = Math.ceil((maxTime - minTime) / MS_PER_HOUR);
  const totalWidth = totalHours * pxPerHour;

  const hoursArray = useMemo(() => {
    const arr: { t: number; date: Date }[] = [];
    for (let i = 0; i <= totalHours; i++) {
      const ms = minTime + i * MS_PER_HOUR;
      arr.push({ t: ms, date: new Date(ms) });
    }
    return arr;
  }, [minTime, totalHours]);

  useEffect(() => {
    setTasks(initialTasks.map(t => ({ ...t })));
  }, [initialTasks]);

  useEffect(() => {
    const left = leftBodyRef.current;
    const right = rightAreaRef.current;
    if (!left || !right) return;
    let syncing = false;
    const onLeft = () => {
      if (syncing) { syncing = false; return; }
      syncing = true; right.scrollTop = left.scrollTop;
    };
    const onRight = () => {
      if (syncing) { syncing = false; return; }
      syncing = true; left.scrollTop = right.scrollTop;
    };
    left.addEventListener("scroll", onLeft);
    right.addEventListener("scroll", onRight);
    return () => {
      left.removeEventListener("scroll", onLeft);
      right.removeEventListener("scroll", onRight);
    };
  }, []);

  function onRowDragStart(e: React.DragEvent, id: string | number) {
    dragRowId.current = id;
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", String(id)); } catch (err) {}
  }

  function onRowDragOver(e: React.DragEvent, id: string | number) {
    e.preventDefault();
    dragOverId.current = id;
  }

  function onRowDrop(e: React.DragEvent, id: string | number) {
    e.preventDefault();
    const fromId = dragRowId.current;
    const toId = id;
    if (fromId == null || fromId === toId) return;
    const fromIdx = tasks.findIndex(t => t.id === fromId);
    const toIdx = tasks.findIndex(t => t.id === toId);
    if (fromIdx < 0 || toIdx < 0) return;
    const arr = tasks.slice();
    const [item] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, item);
    setTasks(arr);
    if (onOrderChange) onOrderChange(arr.map(x => x.id));
    dragRowId.current = null;
    dragOverId.current = null;
  }

  function onBarMouseDown(e: React.MouseEvent, task: Task) {
    e.stopPropagation();
    const startOffsetMs = task.start.getTime() - minTime;
    barDrag.current = { id: task.id, startOffsetMs, initialMouseX: e.clientX };
    window.addEventListener("mousemove", onBarMouseMove);
    window.addEventListener("mouseup", onBarMouseUp, { once: true });
  }

  function onBarMouseMove(e: MouseEvent) {
    const state = barDrag.current;
    if (!state) return;
    const dx = e.clientX - state.initialMouseX;
    const deltaHours = Math.round(dx / pxPerHour);
    const task = tasks.find(t => t.id === state.id);
    if (!task) return;
    const newStart = new Date(minTime + state.startOffsetMs + deltaHours * MS_PER_HOUR);
    const durationMs = task.end.getTime() - task.start.getTime();
    const newEnd = new Date(newStart.getTime() + durationMs);
    const arr = tasks.map(t => t.id === task.id ? { ...t, start: newStart, end: newEnd } : t);
    setTasks(arr);
    if (onTaskChange) onTaskChange({ ...task, start: newStart, end: newEnd });
  }

  function onBarMouseUp() {
    barDrag.current = null;
    window.removeEventListener("mousemove", onBarMouseMove);
  }

  const fmtDate = (d: Date) => d.toLocaleString();

  return (
    <GanttContainer>
      <LeftGrid>
        <GridHeader>
          <GridCol width="100px">Machine</GridCol>
          <GridCol width="100px">MPN</GridCol>
          <GridCol width="140px">Start Time</GridCol>
          <GridCol width="140px">End Time</GridCol>
          <LeftGutter />
        </GridHeader>

        <GridBody ref={leftBodyRef}>
          {tasks.map((t) => (
            <GridRow
              key={t.id}
              selected={selectedId === t.id}
              draggable
              onDragStart={(e) => onRowDragStart(e, t.id)}
              onDragOver={(e) => onRowDragOver(e, t.id)}
              onDrop={(e) => onRowDrop(e, t.id)}
              onClick={() => setSelectedId(t.id)}
            >
              <GridCol width="100px">{t.machine}</GridCol>
              <GridCol width="100px">{t.mpn}</GridCol>
              <GridCol width="140px">{t.start ? t.start.toLocaleString() : ""}</GridCol>
              <GridCol width="140px">{t.end ? t.end.toLocaleString() : ""}</GridCol>
            </GridRow>
          ))}
        </GridBody>
      </LeftGrid>

      <TimelineArea ref={rightAreaRef}>
        <TimelineHeader>
          <ScaleRow>
            {hoursArray.map((h, i) => {
              const date = h.date;
              const isNewDay = i > 0 && hoursArray[i-1].date.getDate() !== date.getDate();

              return (
                <ScaleCell key={i} w={pxPerHour}>
                  <div style={{ fontSize: 11, fontWeight: 'bold' }}>
                    {isNewDay || i === 0 ? date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ''}
                  </div>
                  <div style={{ fontSize: 13, marginTop: '2px' }}>
                    {date.getHours()}:00
                  </div>
                </ScaleCell>
              );
            })}
          </ScaleRow>
        </TimelineHeader>

        <TimelineBody>
          <TimelineInner totalWidth={totalWidth}>
            {tasks.map((t, idx) => {
              const top = idx * ROW_HEIGHT + 8;
              const leftHours = (t.start.getTime() - minTime) / MS_PER_HOUR;
              const durHours = (t.end.getTime() - t.start.getTime()) / MS_PER_HOUR;
              const leftPx = leftHours * pxPerHour;
              const widthPx = durHours * pxPerHour;

              if (leftPx + widthPx < 0 || leftPx > totalWidth) {
                  return null;
              }

              const used = t.usedHours ?? 0;
              const total = t.totalHours ?? Math.max(1, durHours);
              const usedRatio = Math.max(0, Math.min(1, used / total));
              const usedPx = Math.round(widthPx * usedRatio);

              return (
                <React.Fragment key={String(t.id)}>
                  <TrackRow top={idx * ROW_HEIGHT} rowHeight={ROW_HEIGHT} />
                  <Bar
                    left={leftPx}
                    width={widthPx}
                    color={t.color}
                    style={{ top }}
                    onMouseDown={(e) => onBarMouseDown(e, t)}
                    title={`${t.machine} — ${t.mpn} (${fmtDate(t.start)} → ${fmtDate(t.end)})`}
                  >
                    <UsageFill usedWidth={usedPx} />
                    <div style={{ zIndex: 2, padding: "0 12px", pointerEvents: "none" }}>
                      {t.machine}
                    </div>
                    <Handle />
                  </Bar>
                </React.Fragment>
              );
            })}
          </TimelineInner>
        </TimelineBody>
      </TimelineArea>
    </GanttContainer>
  );
}