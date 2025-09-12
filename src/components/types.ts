export type ID = string | number;

export interface Task {
  id: ID;

  /** Machine name shown in left grid + bar label */
  machine: string;

  /** MPN (part number) shown in left grid */
  mpn: string;

  /** Start time of the task */
  start: Date;

  /** End time of the task */
  end: Date;

  /** Used hours inside the allocation (for usage coloring) */
  usedHours?: number;

  /** Total allocated hours (used for percentage calculation) */
  totalHours?: number;

  /** Bar color */
  color?: string;
}
