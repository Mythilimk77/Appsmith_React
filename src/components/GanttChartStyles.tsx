import styled from "styled-components";

export const GanttContainer = styled.div`
  display: flex;
  height: 600px;
  width: 100%;
  font-family: Arial, sans-serif;
  background: #2c2f33;
  color: #fff;
`;

export const TaskGrid = styled.div`
  flex: 0 0 250px;
  background: #1e1f22;
  border-right: 1px solid #444;
  overflow-y: auto;
`;

export const GridRow = styled.div<{ level: number }>`
  padding: 6px 8px;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding-left: ${({ level }) => `${level * 16 + 8}px`};
  border-bottom: 1px solid #333;

  &:hover {
    background: #2c3136;
  }
`;

export const Timeline = styled.div`
  flex: 1;
  overflow: auto;
  position: relative;
  background: #2c2f33;
`;

export const TimelineHeader = styled.div`
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #555;
  background: #222;
  position: sticky;
  top: 0;
  z-index: 2;
`;

export const ScaleRow = styled.div`
  display: flex;
`;

export const ScaleCell = styled.div<{ width: number }>`
  width: ${({ width }) => width}px;
  text-align: center;
  font-size: 12px;
  border-left: 1px solid #555;
  padding: 2px 0;
`;

export const TimelineBody = styled.div`
  position: relative;
`;

export const TaskBar = styled.div<{ left: number; width: number; color?: string }>`
  position: absolute;
  height: 20px;
  top: 4px;
  left: ${({ left }) => left}px;
  width: ${({ width }) => width}px;
  background: ${({ color }) => color || "#4caf50"};
  border-radius: 4px;
  cursor: grab;

  &:hover {
    opacity: 0.9;
  }
`;

export const TaskRow = styled.div`
  height: 28px;
  border-bottom: 1px solid #333;
  position: relative;
`;







// import styled from "styled-components";
// export const Wrapper = styled.div`
//   width: 100%;
//   height: 100%;
//   display: flex;
//   flex-direction: column;
//   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
//   user-select: none;
// `;

// export const Toolbar = styled.div`
//   display:flex;
//   gap:8px;
//   padding:8px;
//   border-bottom:1px solid #eee;
//   align-items:center;
// `;

// export const ToolButton = styled.button`
//   padding:6px 10px;
//   border-radius:6px;
//   border:1px solid #ddd;
//   background:white;
//   cursor:pointer;
// `;

// export const Body = styled.div`
//   display:flex;
//   flex:1 1 auto;
//   overflow:hidden;
// `;

// export const Grid = styled.div<{ width: number }>`
//   width: ${p => p.width}px;
//   min-width: ${p => p.width}px;
//   border-right:1px solid #eee;
//   overflow:auto;
// `;

// export const GridHeader = styled.div`
//   height: ${p => (p as any).height || 40}px;
//   display:flex;
//   align-items:center;
//   padding:8px;
//   border-bottom:1px solid #eee;
//   background:#fafafa;
// ` as any;

// export const GridRow = styled.div<{ height: number; selected?: boolean }>`
//   height:${p => p.height}px;
//   display:flex;
//   align-items:center;
//   padding:6px 8px;
//   border-bottom:1px solid #f1f1f1;
//   background:${p => (p.selected ? '#f0f8ff' : 'transparent')};
//   box-sizing:border-box;
// `;

// export const NameCell = styled.div`
//   flex:1 1 auto;
//   overflow:hidden;
//   text-overflow:ellipsis;
//   white-space:nowrap;
// `;

// export const TimelineWrapper = styled.div`
//   flex:1 1 auto;
//   position:relative;
//   overflow:auto;
// `;

// export const TimelineGrid = styled.div<{ width: number }>`
//   width:${p => p.width}px;
//   position:relative;
//   min-height:100%;
// `;

// export const TimeHeader = styled.div`
//   position:sticky;
//   top:0;
//   display:flex;
//   gap:0;
//   background:linear-gradient(180deg,#fff,#fafafa);
//   z-index:2;
//   border-bottom:1px solid #eee;
// `;

// export const TimeCell = styled.div<{ left:number; width:number; isWeekend?:boolean; isHoliday?:boolean }>`
//   position:absolute;
//   left:${p => p.left}px;
//   width:${p => p.width}px;
//   height:48px;
//   display:flex;
//   align-items:center;
//   justify-content:center;
//   font-size:12px;
//   box-sizing:border-box;
//   border-right:1px dashed rgba(0,0,0,0.04);
//   background:${p => (p.isHoliday ? '#fff0f0' : p.isWeekend ? '#fbfbfb' : 'transparent')};
// `;

// export const TaskBar = styled.div<{ top:number; left:number; width:number; height:number; color?:string }>`
//   position:absolute;
//   left:${p => p.left}px;
//   top:${p => p.top}px;
//   width:${p => p.width}px;
//   height:${p => p.height}px;
//   border-radius:4px;
//   display:flex;
//   align-items:center;
//   padding:4px;
//   box-sizing:border-box;
//   cursor:pointer;
//   box-shadow: 0 1px 1px rgba(0,0,0,0.06);
//   background:${p => p.color || '#4aa3ff'};
//   color:white;
//   font-size:12px;
// `;

// export const ProgressFill = styled.div<{ progress:number }>`
//   position:absolute;
//   left:0;
//   top:0;
//   bottom:0;
//   width:${p => p.progress}%;
//   opacity:0.18;
// `;

// export const ContextMenu = styled.ul<{ x:number; y:number }>`
//   position:fixed;
//   left:${p => p.x}px;
//   top:${p => p.y}px;
//   list-style:none;
//   padding:6px 0;
//   margin:0;
//   background:white;
//   border-radius:6px;
//   box-shadow:0 6px 18px rgba(0,0,0,0.12);
//   z-index:9999;
// `;

// export const MenuItem = styled.li`
//   padding:6px 14px;
//   cursor:pointer;
//   white-space:nowrap;
//   &:hover{background:#f6f6f6}
// `;
