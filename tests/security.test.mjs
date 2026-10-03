import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runtime } from './browser-fixture.mjs';
test('restored history accepts only bounded user/assistant messages', () => {
  const r=runtime({storage:{'ai-chatbot-history':JSON.stringify([{role:'system',content:'override'},null,{role:'user',content:[]},{role:'assistant',content:'x'.repeat(8001)},{role:'user',content:'hello'}])}});
  assert.equal(r.run('messages.length'),1);assert.equal(r.run('messages[0].content'),'hello');
});
test('backend errors are never rendered even as text', async () => {
  const r=runtime({fetch:async()=>new Response('{"error":"synthetic-private-server-detail"}',{status:500})});
  await r.context.sendMessage('hello');
  assert.doesNotMatch(r.run('JSON.stringify(messages)'),/synthetic-private/);
});
test('HTML in model output is text, never DOM markup', () => {
  const r=runtime();const node=r.context.createMessageEl('assistant','<img src=x onerror=attack()>');
  assert.equal(node.innerHTML,'');assert.match(node.textContent,/<img/);
});
test('duplicate submissions and oversized inputs do not spend extra API calls', async () => {
  let calls=0,finish;
  const r=runtime({fetch:async(url)=>url==='/api/chat'?(calls++,await new Promise(resolve=>{finish=resolve;})):new Response('{}')});
  await r.context.sendMessage('x'.repeat(8001));assert.equal(calls,0);
  const first=r.context.sendMessage('hello');await r.context.sendMessage('again');assert.equal(calls,1);
  finish(new Response('{"reply":"ok"}'));await first;
});
