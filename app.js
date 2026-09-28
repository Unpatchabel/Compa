import { createClient } from '@supabase/supabase-js';

const categories=[
{id:'music',icon:'♫',title:'Music',sub:'Songs worth sharing'},{id:'gaming',icon:'✦',title:'Gaming',sub:'One more round'},{id:'food',icon:'◒',title:'Food',sub:'Always room for more'},{id:'books',icon:'▤',title:'Books',sub:'One more chapter'},{id:'outdoors',icon:'✳',title:'Outdoors',sub:'Take the long way'},{id:'film',icon:'▣',title:'Film',sub:'Stay for the credits'},{id:'fitness',icon:'◉',title:'Fitness',sub:'Show up together'},{id:'art',icon:'✿',title:'Art',sub:'Make something'},{id:'tech',icon:'⌘',title:'Tech',sub:'Build what if'}];
const academicDegrees=[
 {id:'ai',title:'BSc (Hons) Artificial Intelligence'},
 {id:'ds',title:'BSc (Hons) Data Science'},
 {id:'acc',title:'BA Accounting and Finance'},
 {id:'cs',title:'BSc (Hons) Computer Science'},
 {id:'bus',title:'BA Business Studies'},
 {id:'cyber',title:'BSc (Hons) Cybersecurity'},
 {id:'mai',title:'MSc Artificial Intelligence',masters:true},
 {id:'mcyber',title:'MSc Cybersecurity',masters:true},
 {id:'mba',title:'MBA Business Administration',masters:true}
];
const academicCategories=academicDegrees.flatMap(d=>(d.masters?['masters']:['year1','year2','year3']).map(year=>({id:`acad_${year}_${d.id}`,title:d.title,year,sub:year==='masters'?'Masters':`${year.slice(-1)}${year==='year1'?'st':year==='year2'?'nd':'rd'} year`,icon:'▣'})));
const allCategories=[...categories,...academicCategories];
const interestPalette={music:'#ff8d5b',gaming:'#a995ff',food:'#5bd3df',books:'#fa8fa0',outdoors:'#b9ff39',film:'#ff4cc3',fitness:'#9e90ff',art:'#f6b854',tech:'#94dcb6'};
function colorFor(category){return interestPalette[category]||'#a995ff'}
function interestColor(el,category){el.style.setProperty('--interest-color',colorFor(category));return el}
const sayings=[
'Some conversations feel like finding the right frequency.',
'The best stories start with “Wait, you like that too?”',
'Someone out there will understand your oddly specific obsession.',
'You do not need a crowd to feel less alone.',
'One shared thing can open a whole new world.',
'Your people are easier to find when you share what you enjoy.',
'The good conversations rarely need an opening line.',
'A little curiosity can turn strangers into familiar faces.',
'Everyone deserves a friend they can send that song to.',
'Find someone who asks what happened in the next chapter.',
'There is room for more than one kind of friendship.',
'Sometimes a good friendship starts with a good question.',
'One good conversation can change the shape of a day.',
'Not every connection has to start with “What do you do?”',
'Someone will laugh at that very specific joke.',
'The best part of a hobby is having someone to tell.',
'Good company makes ordinary plans memorable.',
'A friend can be the person you call when a new song drops.',
'It is easier to be yourself around someone who gets your thing.',
'There is no perfect way to make a friend. Start with hello.',
'Good company makes the familiar feel new.',
'Find someone who wants the long version of your story.',
'Some of the best plans begin with “Are you free?”',
'It counts as a connection when the conversation keeps going.',
'A new friend can make a city feel smaller.',
'You can be quiet together and still feel understood.',
'The people worth knowing ask a second question.',
'Not everyone will get it. Someone might.',
'Shared interests are a beginning, not the whole story.',
'There is always room at the table for another conversation.',
'The right conversation makes it easy to lose track of time.',
'An ordinary Tuesday can become a story you remember.',
'Your favorite things are more fun to share.',
'Some friendships start with a recommendation.',
'The world feels bigger when someone shows you their corner of it.',
'A good question can be better than a perfect introduction.'];
const questions=[
{title:'Your ideal free afternoon?',options:['Finding a new place','Staying in with a game','Making something','A long unplanned conversation']},
{title:'What gets you talking?',options:['Music and stories','Ideas and big questions','Food and places','The little things in life']},
{title:'What is your social energy?',options:['Quiet and thoughtful','A bit of both','Always up for plans','It depends on the day']}];
const themeLabels=[{id:'sunny',name:'Sunny',color:'#ff8d5b'},{id:'violet',name:'Violet',color:'#a995ff'},{id:'wave',name:'Wave',color:'#5bd3df'},{id:'cherry',name:'Cherry',color:'#fa8fa0'},{id:'neon-lime',name:'Neon Lime',color:'#b9ff39'},{id:'neon-pink',name:'Neon Pink',color:'#ff4cc3'},{id:'midnight',name:'Midnight',color:'#9e90ff'},{id:'black-gold',name:'Black & Gold',color:'#f6b854'}];
const pixelPresets=[
{id:'talk',name:'Talk bubbles',grid:['000000000000','001111111000','012222222100','012200022100','012222222100','012202202100','012222222100','001111111000','000011000000','000010000000','000000000000','000000000000']},
{id:'orbit',name:'Little universe',grid:['000001000000','000001000000','000001000000','000001000000','000111110000','111122211100','000122210000','000111110000','000001000000','000001000000','000001000000','000000000000']},
{id:'together',name:'Together',grid:['000000000000','001110011100','012210012210','012210012210','001110011100','000100001000','001111111100','001222222100','001200002100','001100001100','000000000000','000000000000']},
{id:'mixtape',name:'Mixtape',grid:['000000000000','001111111100','012222222100','012333332100','012333332100','012222222100','012122212100','012111112100','012211222100','001111111100','000000000000','000000000000']}
];
const $ = id => document.getElementById(id);
const interests = new Set(categories.map(c => c.id));
const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const client = url && publishableKey ? createClient(url, publishableKey, {auth:{persistSession:true,autoRefreshToken:true}}) : null;
let me = null, profile = null, people = [], outgoing = [], incoming = [], matches = [], blocked = new Set(), passed = new Set();
let section = 'personal', academicLevel = 'bachelors', academicYear = 'year1';
let selected = 'music', activeView = 'discover', onboardingStep = 0, toastTimer, chatChannel = null, chatMatchId = null, chatMessages = new Map();
let draft = {name:'',area:'',theme:'sunny',art:'talk',primary:'music',secondary:'gaming',answers:[]};
let loading = false, lastSessionId = null;
const introStarted = performance.now();
let introReleased = false, introPendingDialog = null;
function openWhenReady(id){if(introReleased)$(id).showModal();else introPendingDialog=id}
async function finishIntro(){
 const wait=matchMedia('(prefers-reduced-motion: reduce)').matches?0:Math.max(0,3750-(performance.now()-introStarted));
 if(wait)await new Promise(resolve=>setTimeout(resolve,wait));
 const intro=$('intro');intro.classList.add('intro-exit');
 setTimeout(()=>{intro.remove();document.body.classList.remove('intro-running');introReleased=true;if(introPendingDialog){$(introPendingDialog).showModal();introPendingDialog=null}},matchMedia('(prefers-reduced-motion: reduce)').matches?0:570);
}
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),4200)}
function err(error){toast(error?.message || 'Something went wrong. Please try again.');console.error(error)}
function theme(name){document.body.dataset.theme=themeLabels.some(t=>t.id===name)?name:'sunny'}
function clearDialogs(){for(const d of document.querySelectorAll('dialog[open]'))d.close()}
function phrase(){const i=Math.floor(Math.random()*sayings.length);$('daily-phrase').textContent=sayings[i]}
function catName(id){return allCategories.find(c=>c.id===id)?.title||id}
function displayName(id){return id===me?.id?'You':people.find(p=>p.id===id)?.name||'Someone'}
function other(match){return match.person_a===me.id?match.person_b:match.person_a}
function activeMatch(category){return matches.find(m=>m.category===category&&!m.ended_at)}
function blockedPair(id){return blocked.has(id)}
function timeLeft(date){return Math.max(0,Math.ceil((new Date(date).getTime()-Date.now())/3600000))}
function node(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
function button(label,cls,fn){const b=node('button',cls,label);b.type='button';b.onclick=fn;return b}
function contentBox(title,copy,label,fn){const box=node('div','message');box.append(node('h3','',title),node('p','',copy));if(label)box.append(button(label,'action light',fn));return box}
function closeChat(){if(chatChannel){client.removeChannel(chatChannel);chatChannel=null}chatMatchId=null;chatMessages.clear();if($('chat-dialog').open)$('chat-dialog').close()}
async function reset(){me=null;profile=null;people=[];outgoing=[];incoming=[];matches=[];blocked=new Set();passed=new Set();lastSessionId=null;closeChat();clearDialogs();$('signup-content').replaceChildren();theme('sunny');document.body.classList.add('onboarding-pending');showAuth()}
async function loadSession(){if(!client)return;const {data:{session},error}=await client.auth.getSession();if(error){err(error);return}if(!session){await reset();return}const sessionId=session.user.id;if(lastSessionId===sessionId&&profile)return;me=session.user;lastSessionId=sessionId;await loadProfile()}
async function loadProfile(){const {data,error}=await client.from('profiles').select('*').eq('id',me.id).maybeSingle();if(error){err(error);return}profile=data;
 if(!profile){document.body.classList.add('onboarding-pending');if(!$('signup-dialog').open)showOnboarding();return}
 selected=interests.has(profile.primary_interest)?profile.primary_interest:'music';theme(profile.theme);clearDialogs();document.body.classList.remove('onboarding-pending');await refresh();render();
}
async function refresh(){if(!me||loading)return;loading=true;try{
 const [all,likesOut,likesIn,links,blocks,passes]=await Promise.all([
  client.from('profiles').select('id,name,area,primary_interest,secondary_interest,academic_category,answers,theme,art,created_at').order('created_at',{ascending:false}).limit(500),
  client.from('likes').select('*').eq('sender',me.id).gt('expires_at',new Date().toISOString()),
  client.from('likes').select('*').eq('target',me.id).gt('expires_at',new Date().toISOString()),
  client.from('matches').select('*').or(`person_a.eq.${me.id},person_b.eq.${me.id}`).is('ended_at',null),
  client.from('blocks').select('blocked').eq('blocker',me.id),
  client.from('passes').select('target').eq('viewer',me.id)
 ]);
 for(const q of [all,likesOut,likesIn,links,blocks,passes])if(q.error)throw q.error;
 people=all.data||[];outgoing=likesOut.data||[];incoming=likesIn.data||[];matches=links.data||[];blocked=new Set((blocks.data||[]).map(x=>x.blocked));passed=new Set((passes.data||[]).map(x=>x.target));
 }catch(e){err(e)}finally{loading=false}}
async function updated(){await refresh();if(profile)render()}
function showAuth(message=''){clearDialogs();const root=$('auth-content');root.replaceChildren();const title=node('h2','','Welcome to Compa.');const sub=node('p','',message||'Friendship only. Meet people through shared interests and compatible social energy.');
 const google=button('Continue with Google','action light',async()=>{google.disabled=true;const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname}});if(error){google.disabled=false;err(error)}});
 google.style.width='100%';google.style.margin='8px 0 18px';
 const form=node('form');const email=node('label','');email.textContent='Email';const emailInput=node('input');emailInput.type='email';emailInput.required=true;emailInput.autocomplete='email';emailInput.placeholder='you@example.com';email.append(emailInput);
 const password=node('label','');password.textContent='Password';const passInput=node('input');passInput.type='password';passInput.required=true;passInput.minLength=8;passInput.autocomplete='current-password';password.append(passInput);
 const submit=node('button','action dark','Sign in to existing account');submit.type='submit';const forgot=button('Forgot password?','preview-continue',async()=>{if(!emailInput.validity.valid){toast('Enter your email first.');return}const {error}=await client.auth.resetPasswordForEmail(emailInput.value.trim(),{redirectTo:location.origin+location.pathname});if(error)err(error);else toast('If that address has an account, check its inbox for a reset link.')});
 form.append(email,password,submit,forgot);form.onsubmit=async e=>{e.preventDefault();submit.disabled=true;try{const {data,error}=await client.auth.signInWithPassword({email:emailInput.value.trim(),password:passInput.value});if(error)throw error;passInput.value='';if(data.session)await loadSession()}catch(error){err(error)}finally{submit.disabled=false}};
 const notice=node('p','small-print','New to Compa? Continue with Google. Email and password sign-in is for existing accounts.');root.append(title,sub,google,node('p','small-print','Already have a Compa password?'),form,notice);openWhenReady('auth-dialog')}
function showPasswordRecovery(){clearDialogs();const root=$('auth-content');root.replaceChildren(node('h2','','Set a new password.'),node('p','','Choose a new password for your existing account.'));const form=node('form'),label=node('label','','New password'),input=node('input');input.type='password';input.required=true;input.minLength=8;input.autocomplete='new-password';label.append(input);const submit=node('button','action dark','Save new password');submit.type='submit';form.append(label,submit);form.onsubmit=async e=>{e.preventDefault();submit.disabled=true;const {error}=await client.auth.updateUser({password:input.value});input.value='';submit.disabled=false;if(error)err(error);else{$('auth-dialog').close();toast('Password updated.');await loadSession()}};root.append(form);openWhenReady('auth-dialog')}
function makeProgress(){const d=node('div','step-progress');for(let i=0;i<5;i++){const x=node('span');x.classList.toggle('done',i<=onboardingStep);d.append(x)}return d}
function interestSelect(name,value){const s=node('select');s.name=name;for(const c of categories){const o=node('option','',`${c.icon} ${c.title}`);o.value=c.id;s.append(o)}s.value=value;return s}
function pixelSvg(preset){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 12 12');svg.setAttribute('aria-hidden','true');svg.setAttribute('shape-rendering','crispEdges');for(let y=0;y<preset.grid.length;y++)for(let x=0;x<preset.grid[y].length;x++){const code=preset.grid[y][x];if(code==='0')continue;const rect=document.createElementNS('http://www.w3.org/2000/svg','rect');rect.setAttribute('x',x);rect.setAttribute('y',y);rect.setAttribute('width',1);rect.setAttribute('height',1);rect.setAttribute('fill',code==='1'?'var(--ink)':code==='2'?'var(--accent)':'var(--pop)');svg.append(rect)}return svg}
function choiceGroup(items,current,onChoose,art=false){const root=node('div',art?'art-options':'theme-options');for(const t of items){const b=button(t.name,`${art?'art-choice':'choice'}${current===t.id?' selected':''}`,()=>{root.querySelectorAll('button').forEach(x=>{x.classList.remove('selected');x.setAttribute('aria-pressed','false')});b.classList.add('selected');b.setAttribute('aria-pressed','true');onChoose(t.id)});b.setAttribute('aria-pressed',String(current===t.id));if(art)b.prepend(pixelSvg(t));else{const sw=node('span','theme-swatch');sw.style.background=t.color;b.prepend(sw)}root.append(b)}return root}
function showOnboarding(){clearDialogs();onboardingStep=0;draft={name:'',area:'',theme:'sunny',art:'talk',primary:'music',secondary:'gaming',answers:[],academic:null};renderOnboarding();openWhenReady('signup-dialog')}
function renderOnboarding(){const root=$('signup-content');root.replaceChildren(node('div','kicker',`YOUR PROFILE · ${onboardingStep+1} / 5`),makeProgress());
 if(onboardingStep===0){root.append(node('h2','','Start with you.'),node('p','','Your name and general area. Compa is for platonic friendship, and your email stays private.'));const form=node('form');
 const name=node('label','','Username');const nameInput=node('input');nameInput.required=true;nameInput.maxLength=24;nameInput.value=draft.name;nameInput.placeholder='What should people call you?';name.append(nameInput);
 const area=node('label','','City / general area');const areaInput=node('input');areaInput.required=true;areaInput.maxLength=36;areaInput.value=draft.area;areaInput.placeholder='e.g. Fujairah';area.append(areaInput);
 form.append(name,area,node('div','kicker','PICK YOUR COLORS'),choiceGroup(themeLabels,draft.theme,id=>{draft.theme=id;theme(id)}),node('div','kicker','PICK YOUR PIXEL ART'),choiceGroup(pixelPresets,draft.art,id=>draft.art=id,true));
 const next=node('button','action dark','Next: interests ↗');next.type='submit';form.append(next);form.onsubmit=e=>{e.preventDefault();draft.name=nameInput.value.trim();draft.area=areaInput.value.trim();if(!draft.name||!draft.area)return;onboardingStep++;renderOnboarding()};root.append(form);return}
 if(onboardingStep===1){root.append(node('h2','','What are you into?'),node('p','','Your primary interest determines where your card appears. You can browse every interest.'));const form=node('form');const first=node('label','','Primary interest');const primary=interestSelect('primary',draft.primary);first.append(primary);const second=node('label','','Secondary interest');const secondary=interestSelect('secondary',draft.secondary);second.append(secondary);const next=node('button','action dark','Next: about you ↗');next.type='submit';const academic=academicSelect(draft.academic);form.append(first,second,academic.label,next);form.onsubmit=e=>{e.preventDefault();if(primary.value===secondary.value){toast('Pick a different secondary interest.');return}draft.primary=primary.value;draft.secondary=secondary.value;draft.academic=academic.select.value||null;onboardingStep++;renderOnboarding()};root.append(form);return}
 const i=onboardingStep-2,q=questions[i];root.append(node('h2','',q.title),node('p','','Pick one or write your own answer.'));const group=node('div','question-options');for(const answer of q.options){const b=button(answer,`choice${draft.answers[i]===answer?' selected':''}`,()=>{draft.answers[i]=answer;renderOnboarding()});group.append(b)}const custom=node('input');custom.maxLength=80;custom.placeholder='Or write your own';custom.setAttribute('aria-label','Your own answer');if(draft.answers[i]&&!q.options.includes(draft.answers[i]))custom.value=draft.answers[i];custom.oninput=()=>draft.answers[i]=custom.value.trim();const next=button(onboardingStep===4?'Enter Compa ↗':'Next question ↗','action dark',async()=>{if(!draft.answers[i]?.trim()){toast('Choose or write an answer.');return}if(onboardingStep<4){onboardingStep++;renderOnboarding();return}next.disabled=true;const {error}=await client.from('profiles').insert({id:me.id,name:draft.name,area:draft.area,primary_interest:draft.primary,secondary_interest:draft.secondary,academic_category:draft.academic||null,theme:draft.theme,art:draft.art,answers:draft.answers});next.disabled=false;if(error)err(error);else await loadProfile()});root.append(group,custom,next)
}
function render(){if(!profile)return;theme(profile.theme);$('user-initial').textContent=profile.name.charAt(0).toUpperCase();$('network-initial').textContent=$('user-initial').textContent;$('hero-title').textContent=`Hey, ${profile.name}.`;$('match-count').textContent=matches.length;renderSections();renderCategories();renderCandidate();renderConnections();renderNetwork();renderPixelArt()}
function setView(view){activeView=view;document.querySelectorAll('.view').forEach(x=>x.classList.toggle('hidden',x.id!==`${view}-view`));document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.view===view));render();window.scrollTo({top:0,behavior:'instant'})}
function renderSections(){
 const root=$('dashboard-sections');root.replaceChildren();
 for(const [id,title,copy] of [['personal','Personal','Meet people through your interests'],['academic','Academic','Find a study friend in your course and year']]){
  const b=button('',`section-choice${section===id?' selected':''}`,()=>{section=id;selected=id==='personal'?profile.primary_interest:(profile.academic_category||'acad_year1_ai');if(id==='academic'){const found=academicCategories.find(c=>c.id===selected);academicYear=found?.year||'year1';academicLevel=academicYear==='masters'?'masters':'bachelors'}render();$('interests').scrollIntoView({behavior:'smooth'})});
  b.setAttribute('aria-pressed',String(section===id));b.append(node('strong','',title),node('span','',copy));root.append(b);
 }
 $('interest-title').textContent=section==='personal'?'What are you into?':'Find a friend in your programme.';
 $('interest-description').textContent=section==='personal'?'Pick a topic. Find someone who can talk about it as long as you can.':'Choose your degree level, year, and programme.';
 $('interest-rail').textContent=section==='personal'?'REAL PEOPLE ↗ REAL INTERESTS ↗ REAL FRIENDSHIP':'SAME COURSE ↗ SAME YEAR ↗ STUDY TOGETHER';
}
function renderCategories(){const root=$('categories');root.replaceChildren();
 if(section==='academic'){
  const level=node('div','academic-options');for(const [id,label] of [['bachelors','Bachelors'],['masters','Masters']])level.append(button(label,`academic-pill${academicLevel===id?' selected':''}`,()=>{academicLevel=id;academicYear=id==='masters'?'masters':'year1';selected=`acad_${academicYear}_${id==='masters'?'mai':'ai'}`;render()}));root.append(level);
  if(academicLevel==='bachelors'){const years=node('div','academic-options');for(const [id,label] of [['year1','1st Year'],['year2','2nd Year'],['year3','3rd Year']])years.append(button(label,`academic-pill${academicYear===id?' selected':''}`,()=>{academicYear=id;selected=`acad_${id}_ai`;render()}));root.append(years)}
 }
 const list=section==='personal'?categories:academicCategories.filter(c=>c.year===academicYear);
 const grid=node('div','category-grid');for(const c of list){const b=interestColor(button('','category'+(selected===c.id?' selected':''),()=>{selected=c.id;render();$('people').scrollIntoView({behavior:'smooth'})}),c.id);b.setAttribute('aria-pressed',String(selected===c.id));b.append(node('span','category-icon',c.icon),node('span','category-title',c.title),node('span','category-sub',c.sub));grid.append(b)}root.append(grid)
}
function academicSelect(value){const label=node('label','','Academic programme and year');const select=node('select');const blank=node('option','','Not set yet');blank.value='';select.append(blank);for(const c of academicCategories){const option=node('option','',`${c.sub} · ${c.title}`);option.value=c.id;select.append(option)}select.value=value||'';label.append(select);return {label,select}}
function renderPending(root){const entries=outgoing.filter(l=>l.category===selected&&l.expires_at>new Date().toISOString());if(!entries.length)return;const board=node('div','pending-board');board.append(node('strong','',`${entries.length} pending ${entries.length===1?'hello':'hellos'}`),node('p','','A hello expires after 24 hours. You can still look around.'));
 for(const like of entries){const row=node('div','pending-row');const target=displayName(like.target);row.append(node('span','',`${target} · ${timeLeft(like.expires_at)}h left`),button('Withdraw','',async()=>{const {error}=await client.rpc('withdraw_hello',{p_target:like.target,p_category:like.category});if(error)err(error);else await updated()}));board.append(row)}root.append(board)}
function renderCandidate(){const root=$('candidate-area');root.replaceChildren();interestColor(root,selected);$('category-heading').textContent=`People ${section==='academic'?'in':'into'} ${catName(selected).toLowerCase()}.`;
 const current=activeMatch(selected);const mutual=outgoing.filter(l=>l.category===selected&&incoming.some(i=>i.sender===l.target&&i.category===selected));
 const cards=people.filter(p=>p.id!==me.id&&((section==='academic'?p.academic_category===selected:p.primary_interest===selected)||incoming.some(l=>l.sender===p.id&&l.category===selected))&&!blockedPair(p.id)&&!passed.has(p.id)&&!outgoing.some(l=>l.target===p.id&&l.category===selected)&&!matches.some(m=>other(m)===p.id));
 cards.sort((a,b)=>Number(incoming.some(l=>l.sender===b.id&&l.category===selected))-Number(incoming.some(l=>l.sender===a.id&&l.category===selected)));
 $('candidate-count').textContent=`${cards.length} ${cards.length===1?'person':'people'} to discover here.`;
 renderPending(root);
 if(current){root.append(contentBox(`${displayName(other(current))} is your Compa friend for ${catName(selected)}.`,'One active friendship in this interest. You can keep exploring other interests.','Open chat',()=>openChat(current)))}
 if(mutual.length){const otherPerson=mutual[0].target;const box=node('div','queue-box candidate-wrap');box.append(node('strong','',`${displayName(otherPerson)} sent a hello too.`),node('p','',current?'End your current connection in My People before accepting another in this interest.':'You both said hello. Start a conversation if this interest feels like a good fit.'),button('Connect ↗','action dark',async()=>{const {error}=await client.rpc('accept_mutual',{p_target:otherPerson,p_category:selected});if(error)err(error);else{await updated();toast('You can chat now.')}}));root.append(box)}
 // A pending or active connection does not stop discovery. The database
 // creates another active match only after the existing slot is released.
 if(!cards.length){root.append(contentBox('No one else here yet.',section==='academic'?'Students who list this exact programme and year will appear here. Add yours in your profile to be discoverable.':'As more people join, their primary-interest cards will appear here.'));return}
 const p=cards[0];const el=interestColor(node('article','candidate-card candidate-wrap'),selected);const top=node('div','candidate-top');const avatar=node('div','person-avatar',p.name.charAt(0).toUpperCase());const meta=node('div');meta.append(node('h3','person-name',p.name),node('p','person-meta',`${p.area} · ${section==='academic'?catName(p.academic_category):`primary interest: ${catName(p.primary_interest)}`}`));top.append(avatar,meta,node('span','person-status',`Energy: ${p.answers?.[2]||'Open to conversation'}`));
 el.append(top,node('p','person-quote',`“${p.answers?.[1]||'Ask me about my favorite things.'}”`));const facts=node('div','person-facts');for(const text of [`Also into ${catName(p.secondary_interest)}`,p.answers?.[0]||'Up for a conversation'])facts.append(node('span','',text));el.append(facts);
 const request=incoming.find(l=>l.sender===p.id&&l.category===selected);if(request)el.append(node('p','opener-note',request.opener?`${p.name} sent a hello: “${request.opener}”`:`${p.name} has already said hello to you.`));
 const label=node('label','opener-label','Start with words if you want');const opener=node('textarea');opener.maxLength=280;opener.placeholder='What would you ask them about this interest?';label.append(opener);el.append(label,node('p','opener-note','Chat opens once you have both said hello. Your opener is visible to this person first.'));
 const actions=node('div','card-actions');actions.append(button('Pass on this card','action outline',async()=>{const {error}=await client.rpc('pass_profile',{p_target:p.id});if(error)err(error);else await updated()}),button(request?'Say hello back ↗':'Send a hello ↗','action light',async()=>{const {error}=await client.rpc('send_hello',{p_target:p.id,p_category:selected,p_opener:opener.value.trim()});if(error)err(error);else{await updated();toast(request?'You both said hello.':'Your hello is on its way.')}}));el.append(actions);root.append(el)
}
function renderConnections(){const root=$('connection-area');root.replaceChildren();if(!matches.length){root.append(contentBox('Your people will show up here.','Choose an interest and send someone a hello.','Explore interests',()=>setView('discover')));return}
 for(const m of matches){const p=people.find(x=>x.id===other(m));const el=interestColor(node('article','connection'),m.category);el.append(node('span','topic',`${allCategories.find(x=>x.id===m.category)?.icon||'✦'} Compa friend · ${catName(m.category)}`),node('h3','',p?.name||'Someone'),node('p','',`${p?.area||'Area unavailable'} · Energy: ${p?.answers?.[2]||'Open to conversation'}`));const actions=node('div','card-actions');actions.append(button('Open chat ↗','action light',()=>openChat(m)),button('Manage','action outline',()=>manage(m)));el.append(actions);root.append(el)}
}
function renderNetwork(){const root=$('network-nodes');root.replaceChildren();const total=Math.max(4,matches.length),rows=Math.ceil(total/2);$('network').style.minHeight=`${Math.max(535,rows*105+100)}px`;
 for(let i=0;i<total;i++){const m=matches[i];const b=button('','node'+(m?'':' empty'),m?()=>openChat(m):()=>{setView('discover');$('interests').scrollIntoView({behavior:'smooth'})});if(m)interestColor(b,m.category);b.style.left=`${i%2===0?16:84}%`;b.style.top=`${(Math.floor(i/2)+1)/(rows+1)*100}%`;b.style.transform='translate(-50%,-50%)';b.append(node('small','',m?catName(m.category):'Open spot'),node('strong','',m?displayName(other(m)):'Meet someone +'));root.append(b)}requestAnimationFrame(drawWires)}
function drawWires(){const root=$('network-nodes'),stage=$('network');root.querySelectorAll('.wire').forEach(x=>x.remove());const center=$('network-initial').parentElement.getBoundingClientRect(),box=stage.getBoundingClientRect(),start={x:center.left+center.width/2-box.left,y:center.top+center.height/2-box.top};for(const [matchIndex,n] of [...root.querySelectorAll('.node')].entries()){const rect=n.getBoundingClientRect(),dx=rect.left+rect.width/2-box.left-start.x,dy=rect.top+rect.height/2-box.top-start.y,line=node('div','wire');line.style.left=`${start.x}px`;line.style.top=`${start.y}px`;line.style.width=`${Math.hypot(dx,dy)}px`;line.style.transform=`rotate(${Math.atan2(dy,dx)}rad)`;if(matches[matchIndex])interestColor(line,matches[matchIndex].category);root.prepend(line)}}
function renderPixelArt(){const art=pixelPresets.find(x=>x.id===profile?.art)||pixelPresets[0];const placements={dashboard:[[37,9,88],[4,70,95],[43,79,65]],interests:[[1,18,100],[85,14,110],[48,74,90],[72,81,56]],people:[[1,25,105],[86,18,110],[82,75,75]],'circle-view':[[81,12,125],[3,72,95],[54,80,74]]};for(const [id,points] of Object.entries(placements)){const root=document.querySelector(`#${id} .pixel-scene`);if(!root||root.dataset.art===art.id)continue;root.dataset.art=art.id;root.replaceChildren();points.forEach(([left,top,size],i)=>{const n=node('div','pixel-sprite');n.style.left=`${left}%`;n.style.top=`${top}%`;n.style.setProperty('--size',`${size}px`);n.style.setProperty('--opacity','.43');n.append(pixelSvg(i===1?pixelPresets[1]:art));root.append(n)})}}
function addBubble(message){if(chatMessages.has(message.id))return;chatMessages.set(message.id,message);const history=$('chat-history');if(!history)return;history.replaceChildren();for(const item of [...chatMessages.values()].sort((a,b)=>a.id-b.id)){const bubble=node('div',`bubble${item.sender===me.id?' mine':''}`,item.body);bubble.dataset.id=item.id;history.append(bubble)}history.scrollTop=history.scrollHeight}
async function openChat(match){closeChat();chatMatchId=match.id;const root=$('chat-content');root.replaceChildren();interestColor($('chat-dialog'),match.category);root.append(button('×','close',closeChat),node('div','kicker',`YOUR ${catName(match.category).toUpperCase()} FRIEND`),node('h2','',`You + ${displayName(other(match))}`));const history=node('div','chat-history');history.id='chat-history';history.setAttribute('aria-label','Conversation');const form=node('form','chat-form');const input=node('input');input.required=true;input.maxLength=500;input.placeholder='Say something real…';input.setAttribute('aria-label','Your message');const send=node('button','action dark','Send');send.type='submit';form.append(input,send);
 form.onsubmit=async e=>{e.preventDefault();const body=input.value.trim();if(!body)return;send.disabled=true;const {error}=await client.rpc('send_message',{p_match:match.id,p_body:body});send.disabled=false;if(error)err(error);else{input.value='';await fetchChat(match.id)}};
 const older=button('Load earlier messages','preview-continue hidden',()=>{const first=Math.min(...chatMessages.keys());if(Number.isFinite(first))fetchChat(match.id,first)});older.id='chat-older';root.append(older,history,form);$('chat-dialog').showModal();
 chatChannel=client.channel(`chat-${match.id}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:`match_id=eq.${match.id}`},payload=>{if(chatMatchId===match.id)addBubble(payload.new)}).subscribe();await fetchChat(match.id);input.focus()
}
async function fetchChat(matchId,beforeId=null){let query=client.from('messages').select('id,match_id,sender,body,created_at').eq('match_id',matchId).order('id',{ascending:false}).limit(100);if(beforeId!==null)query=query.lt('id',beforeId);const {data,error}=await query;if(error){err(error);return}if(chatMatchId!==matchId)return;for(const msg of [...data].reverse())addBubble(msg);if(beforeId!==null||chatMessages.size<=100)$('chat-older').classList.toggle('hidden',data.length<100)}
function manage(match){const target=other(match),root=$('manage-content');root.replaceChildren();root.append(button('×','close',()=>$('manage-dialog').close()),node('h2','',`Your connection with ${displayName(target)}`),node('p','','You can end this connection, block contact, or report behavior that breaks community rules.'));
 const actions=node('div','manage-actions');actions.append(button('End connection','action outline',async()=>{const {error}=await client.rpc('end_match',{p_match:match.id});if(error)err(error);else{$('manage-dialog').close();closeChat();await updated()}}),button('Block this person','action dark',async()=>{const {error}=await client.rpc('block_user',{p_target:target});if(error)err(error);else{$('manage-dialog').close();closeChat();await updated();toast('Blocked. You will not see this person again.')}}),button('Report a concern','action outline',()=>{const reason=prompt('What happened? Give at least 10 characters.');if(!reason)return;client.rpc('report_user',{p_target:target,p_reason:reason.trim()}).then(({error})=>error?err(error):toast('Report received.'))}));root.append(actions);$('manage-dialog').showModal()}
function openProfile(){const root=$('profile-content');root.replaceChildren();root.append(button('×','close',()=>$('profile-dialog').close()),node('h2','','Your space, your rules.'),node('p','','Your email stays private. Your general area and interests appear on your card.'));
 const form=node('form');const name=node('label','','Username');const nameInput=node('input');nameInput.value=profile.name;nameInput.required=true;nameInput.maxLength=24;name.append(nameInput);const area=node('label','','City / general area');const areaInput=node('input');areaInput.value=profile.area;areaInput.maxLength=36;areaInput.required=true;area.append(areaInput);
 const first=node('label','','Primary interest');const primary=interestSelect('primary',profile.primary_interest);first.append(primary);const second=node('label','','Secondary interest');const secondary=interestSelect('secondary',profile.secondary_interest);second.append(secondary);const academic=academicSelect(profile.academic_category);
 let chosenTheme=profile.theme,chosenArt=profile.art;const submit=node('button','action dark','Save changes ↗');submit.type='submit';form.append(name,area,first,second,academic.label,node('div','kicker','YOUR COLORS'),choiceGroup(themeLabels,chosenTheme,t=>{chosenTheme=t;theme(t)}),node('div','kicker','YOUR PIXEL ART'),choiceGroup(pixelPresets,chosenArt,a=>chosenArt=a,true),submit);
 form.onsubmit=async e=>{e.preventDefault();if(primary.value===secondary.value){toast('Pick a different secondary interest.');return}submit.disabled=true;const {error}=await client.from('profiles').update({name:nameInput.value.trim(),area:areaInput.value.trim(),primary_interest:primary.value,secondary_interest:secondary.value,academic_category:academic.select.value||null,theme:chosenTheme,art:chosenArt}).eq('id',me.id);submit.disabled=false;if(error)err(error);else{profile={...profile,name:nameInput.value.trim(),area:areaInput.value.trim(),primary_interest:primary.value,secondary_interest:secondary.value,academic_category:academic.select.value||null,theme:chosenTheme,art:chosenArt};selected=primary.value;$('profile-dialog').close();await updated()}};
 root.append(form,button('Sign out','preview-continue',async()=>{const {error}=await client.auth.signOut();if(error)err(error);else await reset()}));$('profile-dialog').showModal()}
function scrollEffects(){const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;for(const p of document.querySelectorAll('#discover-view:not(.hidden) .scroll-panel')){if(reduced){p.style.opacity='';p.style.transform='';continue}const r=p.getBoundingClientRect(),progress=Math.max(0,Math.min(1,-r.top/(r.height*.8)));p.style.opacity=String(1-progress*.85);p.style.transform=`translateY(${-progress*28}px)`}}
for(const b of document.querySelectorAll('[data-view]'))b.onclick=()=>setView(b.dataset.view);
$('discover-button').onclick=()=>$('interests').scrollIntoView({behavior:'smooth'});
$('profile-button').onclick=()=>profile?openProfile():toast('Finish setting up your profile first.');
window.addEventListener('scroll',scrollEffects,{passive:true});window.addEventListener('resize',()=>{drawWires();scrollEffects()},{passive:true});new ResizeObserver(()=>requestAnimationFrame(drawWires)).observe($('network'));
for(const id of ['auth-dialog','signup-dialog'])$(id).addEventListener('cancel',e=>e.preventDefault());
phrase();if(client){client.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY')setTimeout(showPasswordRecovery,0);else if(event==='SIGNED_IN'||event==='SIGNED_OUT')setTimeout(loadSession,0)});loadSession().catch(err).finally(finishIntro);setInterval(async()=>{if(profile){await updated();if(chatMatchId)await fetchChat(chatMatchId)}},10000)}else{document.body.classList.add('onboarding-pending');$('auth-content').replaceChildren(node('h2','','Setup needed'),node('p','','Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY before running the live app. See README.md.'));openWhenReady('auth-dialog');finishIntro()}
