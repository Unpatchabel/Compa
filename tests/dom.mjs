// Execute the real app in jsdom with a simulated Supabase client.
// No hosted network, layout engine, Auth provider, Realtime or RLS verification.
import {JSDOM} from 'jsdom';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'http://127.0.0.1:5173',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,owner='11111111-1111-4111-8111-111111111111',target='22222222-2222-4222-8222-222222222222';
const profile={id:owner,name:'Fixture user',area:'Test campus',primary_interest:'music',secondary_interest:'gaming',theme:'sunny',art:'talk',answers:['a','b','c'],academic_category:null};
const candidate={...profile,id:target,name:'<img src=x onerror=alert(1)>'};
let session=null,authChanged;const requests=[];
const client={
 auth:{getSession:async()=>({data:{session}}),onAuthStateChange:fn=>authChanged=fn,signInWithPassword:async()=>{session={user:{id:owner,email:'fixture@example.invalid'}};authChanged('SIGNED_IN');return {}},signOut:async()=>{session=null;authChanged('SIGNED_OUT');return {}}},
 from(table){const chain={select(){return chain},eq(column,value){chain.filter=[column,value];return chain},in(){return chain},gt(){return chain},or(){return chain},is(){return chain},order(){return chain},limit(){return chain},update(value){requests.push({table,value});Object.assign(profile,value);return chain},maybeSingle:async()=>({data:profile}),then(resolve,reject){return Promise.resolve({data:table==='profiles'?[profile,candidate]:[]}).then(resolve,reject)}};return chain},
 rpc:async(name,args)=>{requests.push({name,args});return {data:null}},removeChannel:async()=>{}
};
w.__createClient=()=>client;
w.matchMedia=()=>({matches:true});w.ResizeObserver=class{observe(){}};
w.HTMLElement.prototype.scrollIntoView=function(){};w.scrollTo=()=>{};
w.HTMLDialogElement.prototype.showModal=function(){this.open=true};
w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
const source=fs.readFileSync('app.js','utf8').replace("import { createClient } from '@supabase/supabase-js';","const createClient=window.__createClient;").replaceAll('import.meta.env.VITE_SUPABASE_URL',JSON.stringify('https://mock.supabase.co')).replaceAll('import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY',JSON.stringify('sb_publishable_fixture'));
w.eval(source);
async function until(fn){for(let i=0;i<100;i++){if(fn())return;await new Promise(r=>setTimeout(r,10))}throw Error('UI checkpoint timed out')}
const click=label=>{const b=[...w.document.querySelectorAll('button')].find(b=>b.textContent===label);assert.ok(b,label);b.click()};
try{
 await until(()=>w.document.querySelector('#auth-dialog').open);
 const form=w.document.querySelector('#auth-content form');form.querySelector('[type=email]').value='fixture@example.invalid';form.querySelector('[type=password]').value='FixturePassword123!';form.dispatchEvent(new w.Event('submit',{cancelable:true}));
 await until(()=>w.document.querySelector('.person-name'));
 assert.equal(w.document.querySelector('.person-name').textContent,candidate.name);assert.equal(w.document.querySelector('.person-name img'),null);
 click('Safety options');assert.equal([...w.document.querySelectorAll('#manage-content button')].some(b=>b.textContent==='End connection'),false);
 w.document.querySelector('#manage-dialog').close();
 click('Send a hello ↗');await until(()=>requests.some(r=>r.name==='send_hello'));
 assert.equal(requests.find(r=>r.name==='send_hello').args.p_target,target);
 w.document.querySelector('#profile-button').click();
 const edit=w.document.querySelector('#profile-content form');edit.querySelector('input').value='Updated fixture';edit.dispatchEvent(new w.Event('submit',{cancelable:true}));
 await until(()=>w.document.querySelector('#hero-title').textContent==='Hey, Updated fixture.');
 assert.ok(requests.some(r=>r.table==='profiles'&&r.value.name==='Updated fixture'));
 w.document.querySelector('#profile-button').click();click('Sign out / switch account');
 await until(()=>w.document.querySelector('#auth-dialog').open);
 assert.equal(w.document.querySelector('#hero-title').textContent,'Hey, you.');
 assert.equal(w.document.querySelector('#candidate-area').textContent,'');
 console.log('PASS: simulated DOM sign-in, discovery, XSS text rendering, pre-match safety, hello payload, profile edit and sign-out data clearing.');
}finally{w.close()}
