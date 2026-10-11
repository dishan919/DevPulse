import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { expect, test } from 'vitest';
import { EmptyState } from './UI.jsx';
import { ResponseChart } from './ResponseChart.jsx';
test('empty state presents an explanation and a real navigation action', () => {
  const html = renderToStaticMarkup(<MemoryRouter><EmptyState title="No monitors" description="Create your first endpoint monitor." link="/app/monitors/new" label="Add monitor"/></MemoryRouter>);
  expect(html).toContain('No monitors');
  expect(html).toContain('Create your first endpoint monitor.');
  expect(html).toContain('href="/app/monitors/new"');
});
test('response chart with no checks shows an empty state instead of fabricated statistics', () => {
  const html = renderToStaticMarkup(<ResponseChart data={[]}/>);
  expect(html).toContain('Your performance story starts here');
  expect(html).not.toContain('99.98');
});
