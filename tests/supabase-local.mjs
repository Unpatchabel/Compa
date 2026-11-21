// Integration tests against ONLY a disposable local Supabase stack; never a hosted URL.
import {createClient} from '@supabase/supabase-js';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const url=process.env.COMPA_TEST_URL||'http://127.0.0.1:54321';
const endpoint=new URL(url);
if(!['127.0.0.1','localhost'].includes(endpoint.hostname)||process.env.COMPA_DISPOSABLE_DB!=='YES')throw Error('Requires localhost and COMPA_DISPOSABLE_DB=YES');
const key=process.env.COMPA_TEST_ANON_KEY,secret=process.env.COMPA_TEST_SERVICE_KEY;
if(!key||!secret)throw Error('Set local-only COMPA_TEST_ANON_KEY and COMPA_TEST_SERVICE_KEY in the shell');
const opts={auth:{persistSession:false,autoRefreshToken:false}};
const admin=createClient(url,secret,opts),users=[];
async function ok(result){assert.ifError(result.error);return result.data}
async function fail(result){assert.ok(result.error,'request must fail')}
try{
 for(let i=0;i<3;i++){
  const email=`compa-${randomUUID()}@example.invalid`,password=randomUUID()+'Aa1!';
  const created=await ok(await admin.auth.admin.createUser({email,password,email_confirm:true}));
  users.push({id:created.user.id,client:createClient(url,key,opts)});
  const u=users.at(-1);await ok(await u.client.auth.signInWithPassword({email,password}));
  await ok(await u.client.from('profiles').insert({id:u.id,name:`Test ${i}`,area:'Test area',primary_interest:'music',secondary_interest:'gaming',answers:['a','b','c']}));
 }
 const [a,b,c]=users;
 assert.equal((await ok(await a.client.from('profiles').update({name:'Forged'}).eq('id',b.id).select())).length,0);
 await fail(await c.client.from('messages').insert({match_id:randomUUID(),sender:c.id,body:'forged'}));
 // Parallel HTTP calls use separate PostgREST transactions; exercises actual database locking.
 const responses=await Promise.all([a.client.rpc('send_hello',{p_target:b.id,p_category:'music'}),b.client.rpc('send_hello',{p_target:a.id,p_category:'music'})]);
 responses.forEach(r=>assert.ifError(r.error));
 const links=await ok(await a.client.from('matches').select('*').is('ended_at',null));assert.equal(links.length,1);
 const match=links[0].id;
 await ok(await a.client.rpc('send_message',{p_match:match,p_body:'private'}));
 assert.equal((await ok(await c.client.from('messages').select('*'))).length,0);
 await fail(await c.client.rpc('send_message',{p_match:match,p_body:'intruder'}));
 await fail(await c.client.rpc('end_match',{p_match:match}));
 const duplicates=await Promise.all([a.client.rpc('send_hello',{p_target:b.id,p_category:'music'}),a.client.rpc('send_hello',{p_target:b.id,p_category:'music'})]);
 assert.ok(duplicates.some(r=>r.error),'duplicate concurrent hello rejected');
 assert.equal((await ok(await a.client.from('matches').select('*').is('ended_at',null))).length,1);
 const reports=await Promise.all(Array.from({length:8},()=>a.client.rpc('report_user',{p_target:c.id,p_reason:'Isolated test report'})));
 assert.equal(reports.filter(r=>!r.error).length,5,'concurrent report quota');
 await ok(await a.client.rpc('block_user',{p_target:b.id}));
 for(const user of [a,b]){
  assert.equal((await ok(await user.client.from('messages').select('*').eq('match_id',match))).length,0);
  await fail(await user.client.rpc('send_message',{p_match:match,p_body:'blocked'}));
 }
 await fail(await b.client.rpc('send_hello',{p_target:a.id,p_category:'music'}));
 const anon=createClient(url,key,opts);await fail(await anon.rpc('delete_my_account'));
 await ok(await a.client.rpc('delete_my_account'));
 assert.ok((await admin.auth.admin.getUserById(a.id)).error,'self account deleted');
 console.log('PASS: local Supabase HTTP/Auth/RLS/concurrency integration. Realtime/email not tested.');
}finally{
 let failed=false;
 for(const u of users){await u.client.auth.signOut({scope:'local'});const result=await admin.auth.admin.deleteUser(u.id);if(result.error&&!/not found/i.test(result.error.message)){failed=true;console.error('Cleanup failed for test ID',u.id,result.error.message)}}
 if(failed)process.exitCode=1;
}
