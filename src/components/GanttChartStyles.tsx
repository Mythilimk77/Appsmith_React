import styled from "styled-components";

/* Container */
export const GanttContainer = styled.div`
  display: flex;
  width: 100%;
  height: 720px;
  background: #f7f8fa;
  font-family: Inter, Roboto, Arial, sans-serif;
  color: #222;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
`;

/* Left grid (task table) */
export const LeftGrid = styled.div`
  position: sticky;
  left: 0;
  z-index: 3;
  width: 420px;
  background: white;
  border-right: 1px solid #e6e9ee;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* Handles vertical scrolling for rows */
`;

/* header */
export const GridHeader = styled.div`
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 12px;
  border-bottom: 1px solid #eef1f5;
  gap: 12px;
  font-weight: 600;
  color: #3b4752;
  position: sticky;
  top: 0;
  z-index: 4;
  background: white;
`;

/* columns */
export const GridCol = styled.div<{ width: string }>`
  flex: 0 0 ${p => p.width};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/* rows container */
export const GridBody = styled.div`
  flex: 1;
`;

/* single row */
export const GridRow = styled.div<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 12px;
  gap: 12px;
  border-bottom: 1px solid #f1f3f6;
  cursor: grab;
  background: ${p => (p.selected ? "#f0f6ff" : "white")};
  &:active {
    cursor: grabbing;
  }
`;

/* timeline area (right) */
export const TimelineArea = styled.div`
  flex: 1;
  position: relative;
  overflow: auto;
  background: #30343a;
`;

/* header area of timeline (sticky) */
export const TimelineHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 2;
  background: #30343a;
  border-bottom: 1px solid #e6e9ee;
  display: flex;
  height: 56px;
  align-items: flex-end;
  padding: 0;
`;

/* day / hour scale container */
export const ScaleRow = styled.div`
  display: flex;
  align-items: flex-end;
  height: 100%;
`;

/* cell */
export const ScaleCell = styled.div<{ w: number }>`
  min-width: ${p => p.w}px;
  flex-shrink: 0;
  text-align: center;
  font-size: 12px;
  color: #eee;
  padding: 6px 4px;
  box-sizing: border-box;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
`;

/* body for timeline rows */
export const TimelineBody = styled.div`
  position: relative;
`;

/* each track row (space for bar) */
export const TrackRow = styled.div<{ top: number; rowHeight: number }>`
  position: absolute;
  left: 0;
  right: 0;
  top: ${p => p.top}px;
  height: ${p => p.rowHeight}px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  box-sizing: border-box;
`;

/* bar container */
export const Bar = styled.div<{ left: number; width: number; color?: string }>`
  position: absolute;
  left: ${p => p.left}px;
  width: ${p => p.width}px;
  height: 36px;
  background: ${p => p.color || "#1e90ff"};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 13px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  user-select: none;
  cursor: grab;
  padding: 0 12px;
  overflow: hidden;
`;

/* usage fill: sits inside Bar, anchored left, narrower width */
export const UsageFill = styled.div<{ usedWidth: number }>`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: ${p => p.usedWidth}px;
  background: rgba(0, 0, 0, 0.12);
  border-radius: 6px 0 0 6px;
  pointer-events: none;
`;

/* little handle for dragging horizontally (right) */
export const Handle = styled.div`
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 18px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 2px;
`;

/* small helper for left gutter space alignment with header */
export const LeftGutter = styled.div`
  width: 12px;
  flex: 0 0 12px;
  z-index: 5;
`;

/* container for timeline & scale */
export const TimelineInner = styled.div<{ totalWidth: number }>`
  position: relative;
  min-width: ${p => p.totalWidth}px;
  min-height: 100%;
`;