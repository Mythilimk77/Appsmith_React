import React, { JSX, useState } from "react";
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
import { Task,GanttChartProps } from "./types";

const DAY_WIDTH = 30; // pixels per day

function daysBetween(start: Date, end: Date): number {
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function getAllDates(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks }) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string | number>>(new Set());

  const minDate = new Date(Math.min(...tasks.map((t) => t.start.getTime())));
  const maxDate = new Date(Math.max(...tasks.map((t) => t.end.getTime())));
  const allDates = getAllDates(minDate, maxDate);

  const toggleExpand = (taskId: string | number) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const renderTasks = (tasks: Task[], level: number = 0) => {
    return tasks.map((task) => {
      const isExpanded = expandedTasks.has(task.id);
      return (
        <React.Fragment key={task.id}>
          <GridRow level={level} onClick={() => toggleExpand(task.id)}>
            {task.children && (
              <span style={{ marginRight: 4 }}>{isExpanded ? "▼" : "▶"}</span>
            )}
            {task.name}
          </GridRow>
          {isExpanded && task.children && renderTasks(task.children, level + 1)}
        </React.Fragment>
      );
    });
  };

  const renderTimelineRows = (tasks: Task[], rowIndex: number = 0): JSX.Element[] => {
    const rows: JSX.Element[] = [];
    tasks.forEach((task) => {
      const startOffset = daysBetween(minDate, task.start) * DAY_WIDTH;
      const duration = daysBetween(task.start, task.end) * DAY_WIDTH;

      rows.push(
        <TaskRow key={task.id} style={{ top: `${rowIndex * 28}px` }}>
          <TaskBar left={startOffset} width={duration} color={task.color} />
        </TaskRow>
      );

      if (task.children && expandedTasks.has(task.id)) {
        rows.push(...renderTimelineRows(task.children, rowIndex + 1));
      } else {
        rowIndex++;
      }
    });
    return rows;
  };

  return (
    <GanttContainer>
      <TaskGrid>{renderTasks(tasks)}</TaskGrid>

      <Timeline>
        <TimelineHeader>
          <ScaleRow>
            {allDates.map((date) => (
              <ScaleCell key={date.toDateString()} width={DAY_WIDTH}>
                {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </ScaleCell>
            ))}
          </ScaleRow>
        </TimelineHeader>

        <TimelineBody>{renderTimelineRows(tasks)}</TimelineBody>
      </Timeline>
    </GanttContainer>
  );
};

export default GanttChart;



















// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { Wrapper, Toolbar, ToolButton, Body, Grid, GridHeader, GridRow, NameCell, TimelineWrapper, TimelineGrid, TimeHeader, TimeCell, TaskBar, ProgressFill, ContextMenu, MenuItem } from "./GanttChartStyles";

// type ID = string | number;

// export interface Task {
//   id: ID;
//   name: string;
//   start: string; // ISO date string
//   end: string; // ISO date string
//   progress?: number; // 0-100
//   parentId?: ID | null;
//   // lightweight metadata for styling or state
//   color?: string;
//   className?: string;
//   // optional flag whether subtasks already loaded
//   hasChildren?: boolean;
//   // collapsed state handled by parent container
// }

// export interface RESTDataProvider {
//   fetchTasks: (params?: { offset?: number; limit?: number }) => Promise<{ tasks: Task[]; total?: number }>;
//   loadSubtasks?: (parentId: ID) => Promise<Task[]>;
//   batchUpdate?: (changes: { id: ID; patch: Partial<Task> }[]) => Promise<void>;
// }

// export interface GanttProps {
//   initialTasks?: Task[];
//   restProvider?: RESTDataProvider;
//   // timeline configuration
//   start?: string; // ISO date for timeline left edge (optional auto-calc)
//   end?: string; // ISO date for timeline right edge (optional auto-calc)
//   // dimensions
//   rowHeight?: number;
//   headerHeight?: number;
//   timelineHeight?: number;
//   pixelsPerDay?: number;
//   minPixelsPerDay?: number;
//   maxPixelsPerDay?: number;
//   weekendFn?: (date: Date) => boolean; // default Saturday/Sunday
//   holidayFn?: (date: Date) => boolean; // optional
//   // callbacks
//   onTaskClick?: (task: Task) => void;
//   onTasksChange?: (changes: { id: ID; patch: Partial<Task> }[]) => void; // batch callback
//   // custom renderers
//   renderTooltip?: (task: Task) => React.ReactNode;
//   renderTaskBar?: (task: Task, defaultBar: React.ReactNode) => React.ReactNode;
//   // styles override
//   taskBarStyle?: React.CSSProperties;
//   taskBarClassName?: string;
//   // virtualization buffer rows
//   overscan?: number;
// }

// // -----------------------------
// // Helpers
// // -----------------------------

// const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

// const isoToDate = (iso: string) => new Date(iso);
// const dateToIso = (d: Date) => d.toISOString();

// const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86400000);

// const addDays = (d: Date, days: number) => {
//   const nd = new Date(d);
//   nd.setDate(nd.getDate() + days);
//   return nd;
// };

// // -----------------------------
// // Component
// // -----------------------------

// const defaultWeekendFn = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

// export default function GanttChart(props: GanttProps) {
//   const {
//     initialTasks = [],
//     restProvider,
//     rowHeight = 36,
//     headerHeight = 48,
//     timelineHeight = 48,
//     pixelsPerDay: initialPPD = 40,
//     minPixelsPerDay = 10,
//     maxPixelsPerDay = 200,
//     weekendFn = defaultWeekendFn,
//     holidayFn,
//     onTaskClick,
//     onTasksChange,
//     renderTooltip,
//     renderTaskBar,
//     taskBarStyle,
//     taskBarClassName,
//     start: propStart,
//     end: propEnd,
//     overscan = 5,
//   } = props;

//   // tasks state (flat list)
//   const [tasks, setTasks] = useState<Task[]>(initialTasks);
//   // selection
//   const [selectedId, setSelectedId] = useState<ID | null>(null);
//   // collapsed parents map
//   const [collapsed, setCollapsed] = useState<Record<ID, boolean>>({});

//   // timeline bounds
//   const computedStart = useMemo(() => {
//     if (propStart) return isoToDate(propStart);
//     if (tasks.length === 0) return startOfDay(new Date());
//     const min = tasks.reduce((acc, t) => (isoToDate(t.start) < acc ? isoToDate(t.start) : acc), isoToDate(tasks[0].start));
//     return startOfDay(min);
//   }, [propStart, tasks]);

//   const computedEnd = useMemo(() => {
//     if (propEnd) return isoToDate(propEnd);
//     if (tasks.length === 0) return addDays(new Date(), 30);
//     const max = tasks.reduce((acc, t) => (isoToDate(t.end) > acc ? isoToDate(t.end) : acc), isoToDate(tasks[0].end));
//     return addDays(max, 1);
//   }, [propEnd, tasks]);

//   const totalDays = useMemo(() => Math.max(1, daysBetween(computedStart, computedEnd) + 1), [computedStart, computedEnd]);

//   const [pixelsPerDay, setPixelsPerDay] = useState(() => clamp(initialPPD, minPixelsPerDay, maxPixelsPerDay));

//   // virtualization
//   const gridRef = useRef<HTMLDivElement | null>(null);
//   const timelineRef = useRef<HTMLDivElement | null>(null);
//   const [scrollTop, setScrollTop] = useState(0);
//   const [gridWidth, setGridWidth] = useState(280);

//   // batch changes queue
//   const pendingChanges = useRef<{ id: ID; patch: Partial<Task> }[]>([]);
//   const flushTimer = useRef<number | null>(null);

//   // Context menu
//   const [context, setContext] = useState<{ x:number; y:number; task?: Task } | null>(null);

//   // load tasks from rest provider if provided
//   useEffect(() => {
//     let mounted = true;
//     if (restProvider && restProvider.fetchTasks) {
//       restProvider.fetchTasks().then(res => {
//         if (mounted && res && res.tasks) setTasks(res.tasks);
//       }).catch(() => {});
//     }
//     return () => { mounted = false };
//   }, [restProvider]);

//   // helper: schedule batch update flush (debounced)
//   const scheduleFlush = useCallback(() => {
//     if (flushTimer.current) window.clearTimeout(flushTimer.current);
//     flushTimer.current = window.setTimeout(() => {
//       const toSend = pendingChanges.current.slice();
//       pendingChanges.current = [];
//       if (toSend.length && restProvider && restProvider.batchUpdate) {
//         restProvider.batchUpdate(toSend).then(() => {
//           // success
//         }).catch(() => {
//           // on error, you might want to requeue or show UI
//         });
//       }
//       if (toSend.length && onTasksChange) onTasksChange(toSend);
//     }, 600);
//   }, [restProvider, onTasksChange]);

//   const pushChange = useCallback((change: { id: ID; patch: Partial<Task> }) => {
//     pendingChanges.current.push(change);
//     // update local model quickly
//     setTasks(prev => prev.map(t => t.id === change.id ? { ...t, ...change.patch } : t));
//     scheduleFlush();
//   }, [scheduleFlush]);

//   // Virtualized rows calculations
//   const visibleRange = useMemo(() => {
//     const containerHeight = gridRef.current?.clientHeight ?? 400;
//     const startIndex = Math.floor(scrollTop / rowHeight);
//     const visibleCount = Math.ceil(containerHeight / rowHeight);
//     const from = Math.max(0, startIndex - overscan);
//     const to = Math.min(tasks.length - 1, startIndex + visibleCount + overscan);
//     return { from, to };
//   }, [scrollTop, rowHeight, tasks.length, overscan]);

//   // flattened visible list with collapse support
//   const flattened = useMemo(() => {
//     const map: Task[] = [];
//     const byParent = new Map<ID | null, Task[]>();
//     tasks.forEach(t => {
//       const p = (t.parentId ?? null) as ID | null;
//       if (!byParent.has(p)) byParent.set(p, []);
//       byParent.get(p)!.push(t);
//     });
//     const walk = (parent: ID | null, depth = 0) => {
//       const items = byParent.get(parent) || [];
//       items.sort((a,b)=> String(a.id).localeCompare(String(b.id)));
//       for (const it of items) {
//         (it as any)._depth = depth;
//         map.push(it);
//         if (it.hasChildren && !collapsed[it.id]) walk(it.id, depth+1);
//       }
//     };
//     walk(null,0);
//     return map;
//   }, [tasks, collapsed]);

//   // visible flattened slice
//   const visibleTasks = useMemo(() => flattened.slice(visibleRange.from, visibleRange.to + 1), [flattened, visibleRange]);

//   // timeline width in pixels
//   const timelineWidth = useMemo(() => Math.max(1200, totalDays * pixelsPerDay), [totalDays, pixelsPerDay]);

//   // event handlers
//   useEffect(() => {
//     const onWheel = (e: WheelEvent) => {
//       if (e.ctrlKey) {
//         // zoom
//         e.preventDefault();
//         const delta = -e.deltaY;
//         const factor = delta > 0 ? 1.12 : 0.9;
//         setPixelsPerDay(ppd => clamp(Math.round(ppd * factor), minPixelsPerDay, maxPixelsPerDay));
//       }
//     };
//     window.addEventListener('wheel', onWheel, { passive: false });
//     return () => window.removeEventListener('wheel', onWheel as any);
//   }, [minPixelsPerDay, maxPixelsPerDay]);

//   // grid scroll sync
//   useEffect(() => {
//     const g = gridRef.current;
//     if (!g) return;
//     const onScroll = () => setScrollTop(g.scrollTop);
//     g.addEventListener('scroll', onScroll);
//     return () => g.removeEventListener('scroll', onScroll);
//   }, []);

//   // timeline click mapping helpers
//   const dateToX = useCallback((d: Date) => daysBetween(computedStart, startOfDay(d)) * pixelsPerDay, [computedStart, pixelsPerDay]);
//   const isoToX = useCallback((iso: string) => dateToX(startOfDay(isoToDate(iso))), [dateToX]);
//   const xToDate = useCallback((x: number) => addDays(computedStart, Math.floor(x / pixelsPerDay)), [computedStart, pixelsPerDay]);

//   // drag & drop state
//   const dragState = useRef<null | {
//     id: ID;
//     startX: number;
//     origStart: Date;
//     origEnd: Date;
//     draggingType: 'move' | 'resize-start' | 'resize-end';
//   }>(null);

//   const onTaskMouseDown = (e: React.MouseEvent, task: Task, type: 'move' | 'resize-start' | 'resize-end') => {
//     e.stopPropagation();
//     const rect = timelineRef.current?.getBoundingClientRect();
//     if (!rect) return;
//     const pointerX = e.clientX - rect.left + (timelineRef.current?.scrollLeft || 0);
//     dragState.current = {
//       id: task.id,
//       startX: pointerX,
//       origStart: startOfDay(isoToDate(task.start)),
//       origEnd: startOfDay(isoToDate(task.end)),
//       draggingType: type,
//     };
//     window.addEventListener('mousemove', onMouseMove);
//     window.addEventListener('mouseup', onMouseUp, { once: true });
//   };

//   const onMouseMove = (e: MouseEvent) => {
//     const state = dragState.current;
//     if (!state) return;
//     const rect = timelineRef.current?.getBoundingClientRect();
//     if (!rect) return;
//     const pointerX = e.clientX - rect.left + (timelineRef.current?.scrollLeft || 0);
//     const dx = pointerX - state.startX;
//     const dayDelta = Math.round(dx / pixelsPerDay);
//     const task = tasks.find(t => t.id === state.id);
//     if (!task) return;
//     let newStart = new Date(state.origStart);
//     let newEnd = new Date(state.origEnd);
//     if (state.draggingType === 'move') {
//       newStart = addDays(state.origStart, dayDelta);
//       newEnd = addDays(state.origEnd, dayDelta);
//     } else if (state.draggingType === 'resize-start') {
//       newStart = addDays(state.origStart, dayDelta);
//       if (newStart >= newEnd) newStart = addDays(newEnd, -1);
//     } else {
//       newEnd = addDays(state.origEnd, dayDelta);
//       if (newEnd <= newStart) newEnd = addDays(newStart, 1);
//     }
//     pushChange({ id: task.id, patch: { start: dateToIso(startOfDay(newStart)), end: dateToIso(startOfDay(newEnd)) } });
//   };

//   const onMouseUp = (e: MouseEvent) => {
//     dragState.current = null;
//     window.removeEventListener('mousemove', onMouseMove);
//     // note: batch will flush via scheduleFlush
//   };

//   // context menu
//   const onContextMenu = (e: React.MouseEvent, task?: Task) => {
//     e.preventDefault();
//     setContext({ x: e.clientX, y: e.clientY, task });
//   };

//   // Grid reorder (basic): swap positions by index
//   const moveTask = (id: ID, toIndex: number) => {
//     setTasks(prev => {
//       const idx = prev.findIndex(t => t.id === id);
//       if (idx < 0) return prev;
//       const nxt = prev.slice();
//       const [item] = nxt.splice(idx, 1);
//       nxt.splice(toIndex, 0, item);
//       // send order as batch update with new indices (consumer can interpret)
//       const changes = nxt.map((t, i) => ({ id: t.id, patch: { /* optional ordering field */ } }));
//       if (onTasksChange) onTasksChange(changes);
//       return nxt;
//     });
//   };

//   // Loading subtasks on demand
//   const loadSubtasks = useCallback(async (task: Task) => {
//     if (!restProvider?.loadSubtasks) return;
//     const children = await restProvider.loadSubtasks(task.id);
//     if (!children?.length) return;
//     setTasks(prev => {
//       // naive merge - add children that aren't present
//       const existingIds = new Set(prev.map(t => t.id));
//       const toAdd = children.filter(c => !existingIds.has(c.id));
//       return [...prev, ...toAdd];
//     });
//   }, [restProvider]);

//   // renderers
//   const renderTimeHeader = () => {
//     const cells: React.ReactNode[] = [];
//     for (let d = 0; d < totalDays; d++) {
//       const day = addDays(computedStart, d);
//       const left = d * pixelsPerDay;
//       const width = pixelsPerDay;
//       const isWeekend = weekendFn?.(day);
//       const isHoliday = holidayFn ? holidayFn(day) : false;
//       cells.push(
//         <TimeCell key={d} left={left} width={width} isWeekend={isWeekend} isHoliday={isHoliday}>
//           {day.toISOString().slice(0,10)}
//         </TimeCell>
//       );
//     }
//     return <TimeHeader style={{ height: timelineHeight }}>{cells}</TimeHeader>;
//   };

//   const defaultTooltip = (t: Task) => (
//     <div style={{ padding:6 }}>
//       <div><strong>{t.name}</strong></div>
//       <div>{t.start} → {t.end}</div>
//       <div>Progress: {t.progress ?? 0}%</div>
//     </div>
//   );

//   // track timeline container resize to compute grid width
//   useEffect(() => {
//     const g = gridRef.current;
//     if (!g) return;
//     setGridWidth(280);
//   }, []);

//   // top-level click to dismiss context
//   useEffect(() => {
//     const onClick = () => setContext(null);
//     window.addEventListener('click', onClick);
//     return () => window.removeEventListener('click', onClick);
//   }, []);

//   // -----------------------------
//   // Render
//   // -----------------------------

//   return (
//     <Wrapper onContextMenu={(e)=>onContextMenu(e)}>
//       <Toolbar>
//         <ToolButton onClick={() => setPixelsPerDay(p => clamp(Math.round(p*1.2), minPixelsPerDay, maxPixelsPerDay))}>Zoom In</ToolButton>
//         <ToolButton onClick={() => setPixelsPerDay(p => clamp(Math.round(p/1.2), minPixelsPerDay, maxPixelsPerDay))}>Zoom Out</ToolButton>
//         <ToolButton onClick={() => { /* expand/collapse all */ setCollapsed({}); }}>Expand All</ToolButton>
//         <ToolButton onClick={() => { /* simple batch save trigger */ scheduleFlush(); }}>Save Changes</ToolButton>
//       </Toolbar>

//       <Body>
//         <Grid ref={gridRef} width={gridWidth} onContextMenu={(e)=>onContextMenu(e)}>
//           <GridHeader height={headerHeight}>Tasks</GridHeader>
//           <div style={{ height: flattened.length * rowHeight, position: 'relative' }}>
//             {/* spacer above visible */}
//             <div style={{ height: visibleRange.from * rowHeight }} />
//             {visibleTasks.map((t) => {
//               const i = flattened.indexOf(t);
//               const top = (visibleRange.from + visibleTasks.indexOf(t)) * rowHeight;
//               const depth = (t as any)._depth ?? 0;
//               return (
//                 <GridRow key={t.id} height={rowHeight} selected={selectedId===t.id} style={{ paddingLeft: 8 + depth*12 }}>
//                   <NameCell onClick={() => { setSelectedId(t.id); if (onTaskClick) onTaskClick(t); }}>{t.name}</NameCell>
//                   <div style={{ width:80, textAlign:'right', fontSize:12 }}>{t.progress ?? 0}%</div>
//                 </GridRow>
//               );
//             })}
//             {/* spacer below visible */}
//             <div style={{ height: Math.max(0, (flattened.length - visibleRange.to - 1) * rowHeight) }} />
//           </div>
//         </Grid>

//         <TimelineWrapper ref={timelineRef} onContextMenu={(e)=>onContextMenu(e)}>
//           {renderTimeHeader()}
//           <TimelineGrid width={timelineWidth} style={{ paddingTop: timelineHeight }}>
//             {/* render background day cells */}
//             {Array.from({ length: totalDays }).map((_, d) => {
//               const left = d * pixelsPerDay;
//               return (
//                 <div key={'bg-' + d} style={{ position:'absolute', left, top: timelineHeight, width: pixelsPerDay, height: flattened.length * rowHeight, boxSizing:'border-box', borderRight:'1px solid rgba(0,0,0,0.02)', background: (weekendFn(addDays(computedStart,d)) ? '#fafafa' : undefined) }} />
//               );
//             })}

//             {/* task bars */}
//             {flattened.map((t, idx) => {
//               const top = idx * rowHeight + timelineHeight + 6;
//               const left = isoToX(t.start);
//               const right = isoToX(t.end) + pixelsPerDay;
//               const width = Math.max(16, right - left);
//               const defaultBar = (
//                 <TaskBar key={String(t.id)} top={top} left={left} width={width} height={rowHeight-12} color={t.color} className={taskBarClassName} style={taskBarStyle as any}
//                   onMouseDown={(e)=>onTaskMouseDown(e,t,'move')}
//                   onContextMenu={(e)=>onContextMenu(e,t)}
//                   onClick={(e)=>{ e.stopPropagation(); setSelectedId(t.id); if (onTaskClick) onTaskClick(t); }}
//                 >
//                   <div style={{ position:'relative', width:'100%'}}> 
//                     <div style={{ zIndex:2, position:'relative' }}>{t.name}</div>
//                     <ProgressFill progress={t.progress ?? 0} />
//                     {/* resize handles */}
//                     <div style={{ position:'absolute', left:0, top:0, bottom:0, width:8, cursor:'ew-resize' }} onMouseDown={(e)=>onTaskMouseDown(e,t,'resize-start')} />
//                     <div style={{ position:'absolute', right:0, top:0, bottom:0, width:8, cursor:'ew-resize' }} onMouseDown={(e)=>onTaskMouseDown(e,t,'resize-end')} />
//                   </div>
//                 </TaskBar>
//               );
//               return renderTaskBar ? renderTaskBar(t, defaultBar) : defaultBar;
//             })}

//           </TimelineGrid>
//         </TimelineWrapper>
//       </Body>

//       {/* context menu */}
//       {context && (
//         <ContextMenu x={context.x} y={context.y}>
//           <MenuItem onClick={() => { if (context.task) { setSelectedId(context.task.id); /* open editor etc */ } setContext(null); }}>Edit Task</MenuItem>
//           <MenuItem onClick={() => { if (context.task) { pushChange({ id: context.task.id, patch: { progress: (context.task.progress ?? 0) + 10 } }); } setContext(null); }}>Increment Progress</MenuItem>
//           <MenuItem onClick={() => { setContext(null); }}>Cancel</MenuItem>
//         </ContextMenu>
//       )}

//     </Wrapper>
//   );
// }

