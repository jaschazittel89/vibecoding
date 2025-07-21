import { POST } from '../src/app/api/generate/route';
import { NextRequest } from 'next/server';

it('returns three recipes', async () => {
  const req = new NextRequest('http://localhost/api/generate', { method: 'POST' });
  const res = await POST(req);
  const data = await res.json();
  expect(data.recipes).toHaveLength(3);
});
