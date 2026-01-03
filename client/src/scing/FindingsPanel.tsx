import React from 'react';

export const FindingsPanel: React.FC<{ findings: any[] }> = ({ findings }) => (
  <div>{findings.map((f) => <div key={f.findingId}>{f.title}</div>)}</div>
);
