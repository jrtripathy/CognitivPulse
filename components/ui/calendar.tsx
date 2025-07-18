import React from 'react';
type CalendarProps = {
  mode?: string;
  selected?: Date;
  onSelect?: (date: Date) => void;
  initialFocus?: boolean;
};
export const Calendar: React.FC<CalendarProps> = ({ selected, onSelect }) => (
  <input type="date" value={selected?.toISOString().slice(0, 10)} onChange={e => onSelect?.(new Date(e.target.value))} />
);

export default Calendar;
