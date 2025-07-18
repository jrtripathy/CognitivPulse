import React from 'react';
type ContactSelectorProps = {
  onSelectionChange?: (ids: string[]) => void;
  selectedIds?: string[];
};
export const ContactSelector: React.FC<ContactSelectorProps> = ({ onSelectionChange, selectedIds }) => (
  <div>Select contacts (stub) {selectedIds?.join(', ')}</div>
);
