import React from 'react';
import { templates } from '../lib/templates';

export function TemplatePicker({ onSelect }: { onSelect: (tpl: any) => void }) {
  return (
    <div className="template-picker">
      <h4>Choose a Template</h4>
      <ul>
        {templates.map((tpl, i) => (
          <li key={i}>
            <button onClick={() => onSelect(tpl)}>{tpl.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
