const categories=[
{id:'music',icon:'♫',title:'Music',sub:'Songs worth sharing'},{id:'gaming',icon:'✦',title:'Gaming',sub:'One more round'},{id:'food',icon:'◒',title:'Food',sub:'Always room for more'},{id:'books',icon:'▤',title:'Books',sub:'One more chapter'},{id:'outdoors',icon:'✳',title:'Outdoors',sub:'Take the long way'},{id:'film',icon:'▣',title:'Film',sub:'Stay for the credits'},{id:'fitness',icon:'◉',title:'Fitness',sub:'Show up together'},{id:'art',icon:'✿',title:'Art',sub:'Make something'},{id:'tech',icon:'⌘',title:'Tech',sub:'Build what if'}];
const sayings=[
'Some conversations feel like finding the right frequency.',
'The best stories start with “Wait, you like that too?”',
'Someone out there will understand your oddly specific obsession.',
'You do not need a crowd to feel less alone.',
'One shared thing can open a whole new world.',
'Your people are easier to find when you show what you love.',
'The good conversations rarely need an opening line.',
'A little curiosity can turn strangers into familiar faces.',
'Everyone deserves a friend they can send that song to.',
'Find someone who asks what happened in the next chapter.',
'There is room for more than one kind of friendship.',
'Sometimes the right person starts with the right question.',
'One good conversation can change the shape of a day.',
'Not every connection has to start with “What do you do?”',
'There is a person who will laugh at that very specific joke.',
'The best part of a hobby is having someone to tell.',
'Some people make even ordinary plans memorable.',
'A friend can be the person you call when a new song drops.',
'It is easier to be yourself around someone who gets your thing.',
'There is no perfect way to make a friend. Start with hello.',
'Good company makes the familiar feel new.',
'Find the person who wants the long version of your story.',
'Some of the best plans begin with “Are you free?”',
'It counts as a connection when the conversation keeps going.',
'A new friend can make a city feel smaller.',
'You can be quiet together and still feel understood.',
'The people worth knowing ask a second question.',
'Not everyone will get it. One person might.',
'Shared interests are a beginning, not the whole story.',
'There is always room at the table for another conversation.',
'The right person makes it easy to lose track of time.',
'An ordinary Tuesday can become a story you remember.',
'Your favorite things deserve an audience of one.',
'Some friendships start with a recommendation.',
'The world feels bigger when someone shows you their corner of it.',
'A good question can be better than a perfect introduction.'];
const questions=[
{title:'Your ideal free afternoon?',options:['Finding a new place','Staying in with a game','Making something','A long unplanned conversation']},
{title:'What gets you talking?',options:['Music and stories','Ideas and big questions','Food and places','The little things in life']},
{title:'What is your social energy?',options:['Quiet and thoughtful','A bit of both','Always up for plans','It depends on the person']}];
const themeLabels=[{id:'sunny',name:'Sunny',color:'#ff8d5b'},{id:'violet',name:'Violet',color:'#a995ff'},{id:'wave',name:'Wave',color:'#5bd3df'},{id:'cherry',name:'Cherry',color:'#fa8fa0'},{id:'neon-lime',name:'Neon Lime',color:'#b9ff39'},{id:'neon-pink',name:'Neon Pink',color:'#ff4cc3'},{id:'midnight',name:'Midnight',color:'#9e90ff'},{id:'black-gold',name:'Black & Gold',color:'#f6b854'}];
const pixelPresets=[
{id:'talk',name:'Talk bubbles',grid:['000000000000','001111111000','012222222100','012200022100','012222222100','012202202100','012222222100','001111111000','000011000000','000010000000','000000000000','000000000000']},
{id:'orbit',name:'Little universe',grid:['000001000000','000001000000','000001000000','000001000000','000111110000','111122211100','000122210000','000111110000','000001000000','000001000000','000001000000','000000000000']},
{id:'together',name:'Together',grid:['000000000000','001110011100','012210012210','012210012210','001110011100','000100001000','001111111100','001222222100','001200002100','001100001100','000000000000','000000000000']},
{id:'mixtape',name:'Mixtape',grid:['000000000000','001111111100','012222222100','012333332100','012333332100','012222222100','012122212100','012111112100','012211222100','001111111100','000000000000','000000000000']}
];
const expiryLines=['An unanswered hello says nothing about you. Your next conversation is still out there.','Some people miss a good thing because their timing is off. Keep showing up as yourself.','This one did not start. There are still people who would love to hear your story.','Their silence is not your verdict. Your people can still find you.','One unopened hello makes room for another beginning.','You put yourself out there. That is how good friendships get a chance to happen.','They missed a chance to know you. Another person may be right on time.'];
const people=[
['sam','Sam','Dubai','In a relationship','music','I will absolutely make you a playlist for a very specific mood.','Live gigs',92,true,15],
['maya','Maya','Sharjah','Single','music','Old-school R&B, tiny gigs, and talking about why an album works.','New music',87,false,3],
['jas','Jas','Fujairah','Single','music','I remember concerts by the people I went with.','Playlists',91,true,16],
['nia','Nia','Dubai','Prefer not to say','music','Send me a track and I will send you five back.','Indie music',85,false,4],
['noor','Noor','Dubai','Prefer not to say','gaming','Co-op over competition. Unless there is a Mario Kart trophy involved.','Co-op games',95,true,16],
['leo','Leo','Abu Dhabi','In a relationship','gaming','Some games feel like places you lived. I want to talk about those.','Story games',89,false,2],
['rory','Rory','Fujairah','Single','gaming','The side quests are usually the best part.','Co-op nights',91,true,17],
['min','Min','Dubai','Single','gaming','I am the teammate who remembers to revive you.','Strategy games',82,false,1],
['aya','Aya','Dubai','Single','food','Will travel embarrassingly far for a really good bowl of noodles.','New spots',96,true,18],
['omar','Omar','Fujairah','In a relationship','food','I cook to unwind and always make enough for someone else.','Cooking',84,false,5],
['rhea','Rhea','Sharjah','Single','food','A city makes sense once you know where to eat.','Food walks',91,true,12],
['adi','Adi','Dubai','Prefer not to say','food','I have strong opinions about breakfast.','Brunch',87,false,3],
['elle','Elle','Dubai','Prefer not to say','books','I annotate books like I am arguing with the author.','Bookshops',90,true,14],
['zain','Zain','Ajman','Single','books','Give me strange fiction and a long conversation about the ending.','Reading',94,false,4],
['ivy','Ivy','Fujairah','In a relationship','books','I keep buying books for people I have just met.','Fiction',88,true,20],
['tara','Tara','Dubai','Single','books','Some sentences make me stop and look out the window.','Poetry',85,false,2],
['rita','Rita','Fujairah','In a relationship','outdoors','Sunrise walks make the rest of the day feel possible.','Hiking',91,true,16],
['ali','Ali','Dubai','Single','outdoors','I know the best routes for a walk with no agenda.','Weekend walks',86,false,5],
['maya2','Maya','Dubai','Single','outdoors','I take the long way home on purpose.','Exploring',90,true,14],
['ben','Ben','Sharjah','Prefer not to say','outdoors','I would rather collect views than souvenirs.','Camping',82,false,4],
['bea','Bea','Dubai','In a relationship','film','The movie ends. The conversation about it does not.','Cinema',93,true,17],
['jay','Jay','Sharjah','Single','film','I love terrible films almost as much as great ones.','Movie nights',85,false,3],
['dina','Dina','Fujairah','Single','film','I can talk about a film score for longer than the film.','Film music',91,true,14],
['eli','Eli','Dubai','Prefer not to say','film','I always stay through the credits.','Indie film',88,false,1],
['nina','Nina','Dubai','Prefer not to say','fitness','The best workout is the one you can laugh through.','Gym',90,true,15],
['ray','Ray','Abu Dhabi','In a relationship','fitness','I am training for a half marathon and need people who understand.','Running',94,false,4],
['kai','Kai','Fujairah','Single','fitness','I love the feeling after the hard bit is done.','Training',87,true,18],
['sana','Sana','Dubai','Single','fitness','A walk and a good conversation counts as a workout.','Movement',84,false,2],
['lina','Lina','Dubai','Single','art','I make things with my hands because it slows the world down.','Making',96,true,16],
['max','Max','Fujairah','In a relationship','art','Bad sketchbook drawings are sometimes the best kind.','Sketching',83,false,3],
['eira','Eira','Sharjah','Single','art','Every museum has one piece I want to stand beside for an hour.','Galleries',91,true,15],
['paz','Paz','Dubai','Prefer not to say','art','Art is better when someone tells you what they see.','Painting',85,false,4],
['dana','Dana','Dubai','In a relationship','tech','I build tiny projects that solve problems nobody asked me to solve.','Side projects',95,true,17],
['ivan','Ivan','Sharjah','Single','tech','I could spend an afternoon figuring out how something works.','Building',88,false,2],
['sol','Sol','Fujairah','Single','tech','Show me the thing you are building before it is finished.','Experiments',90,true,14],
['milo','Milo','Dubai','Prefer not to say','tech','The most interesting ideas begin with “what if”.','Ideas',84,false,6]
].map(([id,name,area,status,category,quote,activity,score,reciprocal,peerOpens],index)=>({id,name,area,status,category,secondary:categories.find((c,k)=>k===(index+3)%categories.length&&c.id!==category)?.id||categories[(index+4)%categories.length].id,quote,activity,score,reciprocal,peerOpens,demoReply:!reciprocal&&index%3===1}));
const $=id=>document.getElementById(id),key='compa-prototype-v4',DAY=24*60*60*1000;
const initial=()=>({profile:null,matches:{},pending:{},offers:{},passed:{},blocked:[],messages:{},opens:{},bestEver:{},expiryNotice:null});
function read(){try{const value=JSON.parse(localStorage.getItem(key));if(!value||typeof value!=='object')return initial();const pending={};for(const [id,request] of Object.entries(value.pending||{})){if(typeof request==='string')pending[request]={at:Date.now(),opener:'',category:id};else if(request&&typeof request==='object'&&request.at)pending[id]=request}const profile=value.profile?{primary:'music',secondary:'gaming',...value.profile}:null;return {...initial(),...value,profile,pending,offers:value.offers||{},matches:value.matches||{},passed:value.passed||{},blocked:Array.isArray(value.blocked)?value.blocked:[],messages:value.messages||{},opens:value.opens||{},bestEver:value.bestEver||{}}}catch{return initial()}}
let state=read(),selected=state.profile?.primary||'music',activeView='discover',signupStep=0,signupData={name:'',area:'',theme:'sunny',art:'talk',primary:'music',secondary:'gaming',answers:[]},toastTimer,scrollQueued=false,onboardingComplete=false;
const person=id=>people.find(p=>p.id===id);
function save(){localStorage.setItem(key,JSON.stringify(state))}
function notify(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3000)}
function phrase(){let last=Number(sessionStorage.getItem('compa-phrase-index')??-1),next=(last+1+Math.floor(Math.random()*(sayings.length-1)))%sayings.length;sessionStorage.setItem('compa-phrase-index',String(next));$('daily-phrase').textContent=sayings[next]}
function theme(name){document.body.dataset.theme=themeLabels.some(t=>t.id===name)?name:'sunny'}
function setView(view){activeView=view;document.querySelectorAll('.view').forEach(el=>el.classList.toggle('hidden',el.id!==`${view}-view`));document.querySelectorAll('.nav').forEach(el=>el.classList.toggle('active',el.dataset.view===view));render();window.scrollTo({top:0,behavior:'instant'})}
function render(){theme(state.profile?.theme||'sunny');document.body.classList.toggle('onboarding-pending',!onboardingComplete);$('user-initial').textContent=(state.profile?.name||'Y').trim().charAt(0).toUpperCase();$('network-initial').textContent=$('user-initial').textContent;$('hero-title').replaceChildren(document.createTextNode(`Hey, ${state.profile?.name||'you'}.`));$('match-count').textContent=Object.keys(state.matches).filter(c=>person(state.matches[c])).length;renderCategories();renderCandidate();renderConnections();renderNetwork();renderPixelArt()}
function renderCategories(){const root=$('categories');root.replaceChildren();for(const cat of categories){const b=document.createElement('button');b.className=`category${selected===cat.id?' selected':''}`;b.type='button';b.setAttribute('aria-pressed',selected===cat.id);b.innerHTML=`<span class="category-icon">${cat.icon}</span><span class="category-title">${cat.title}</span><span class="category-sub">${cat.sub}</span>`;b.onclick=()=>{selected=cat.id;render();$('people').scrollIntoView({behavior:'instant'})};root.append(b)}}
function contentBox(title,copy,button,action){const d=document.createElement('div');d.className='message';const h=document.createElement('h3');h.textContent=title;const p=document.createElement('p');p.textContent=copy;d.append(h,p);if(button){const b=document.createElement('button');b.className='action light';b.textContent=button;b.onclick=action;d.append(b)}return d}
function pendingBoard(cat){
 const entries=Object.entries(state.pending).filter(([,request])=>request.category===cat);
 if(!entries.length)return null;
 const box=document.createElement('div');box.className='pending-board';const heading=document.createElement('strong');heading.textContent=`${entries.length} open ${entries.length===1?'hello':'hellos'} in ${cat}`;
 const note=document.createElement('p');note.textContent='They have up to 24 hours to like you back. You can still discover people here.';box.append(heading,note);
 for(const [id,request] of entries){const p=person(id);if(!p)continue;const row=document.createElement('div');row.className='pending-row';const description=document.createElement('span');const hours=Math.max(0,Math.ceil((DAY-(Date.now()-request.at))/3600000));description.textContent=`${p.name} · ${hours}h left${request.opener?' · opener sent':''}`;const cancel=document.createElement('button');cancel.textContent='Withdraw';cancel.onclick=()=>{delete state.pending[id];delete state.messages[id];save();renderCandidate();notify('That hello was withdrawn.')};row.append(description,cancel);box.append(row)}return box
}
function renderCandidate(){
 const root=$('candidate-area');root.replaceChildren();const cat=categories.find(c=>c.id===selected);
 $('category-heading').textContent=`People into ${cat.title.toLowerCase()}.`;
 const available=people.filter(p=>p.category===selected&&!state.passed[p.id]&&!state.pending[p.id]&&!state.blocked.includes(p.id));
 $('candidate-count').textContent=`${available.length} ${available.length===1?'person':'people'} to discover in this demo.`;
 if(state.expiryNotice){const line=document.createElement('div');line.className='expiry-note';line.textContent=state.expiryNotice;root.append(line)}
 const board=pendingBoard(selected);if(board)root.append(board);
 const matched=person(state.matches[selected]);const offers=state.offers[selected]||[];
 if(matched){root.append(contentBox(`Your ${cat.title.toLowerCase()} person is ${matched.name}.`,'One active chat for this interest. Other unanswered hellos can stay open until they expire.','Open chat',()=>openChat(matched.id,'discover')))}
 if(offers.length){const next=person(offers[0]);if(next){const box=document.createElement('div');box.className='queue-box candidate-wrap';const h=document.createElement('strong');h.textContent=`${next.name} liked you back.`;const explanation=document.createElement('p');explanation.textContent=matched?`You are already connected with ${matched.name} in ${cat.title}. You cannot open two chats in the same interest.`:'You have a mutual like ready for this interest.';const accept=document.createElement('button');accept.className='action dark';accept.textContent=matched?`End ${matched.name} and connect with ${next.name}`:`Connect with ${next.name}`;accept.onclick=()=>{if(matched){delete state.matches[selected];delete state.messages[matched.id]}state.matches[selected]=next.id;state.offers[selected].shift();save();render();notify(`You and ${next.name} can chat now.`)};const decline=document.createElement('button');decline.className='action outline';decline.textContent='Not this connection';decline.onclick=()=>{state.offers[selected].shift();delete state.messages[next.id];save();render();notify('You kept your current connection.')};box.append(h,explanation,accept,decline);root.append(box)}}
 if(matched||offers.length)return;
 if(!available.length){root.append(contentBox('You have seen the people in this demo.','A larger community will bring more primary-interest profiles. Blocked people never return.','Revisit passed cards',()=>{for(const p of people.filter(p=>p.category===selected))delete state.passed[p.id];save();render()}));return}
 const p=available[0],el=document.createElement('article');el.className='candidate-card candidate-wrap';el.innerHTML='<div class="candidate-top"><div class="person-avatar"></div><div><h3 class="person-name"></h3><p class="person-meta"></p></div><span class="person-status"></span></div><p class="person-quote"></p><div class="person-facts"></div><div class="person-meter"><span></span><div class="meter"><span></span></div><strong></strong></div><label class="opener-label">Start with words if you want<textarea maxlength="280" placeholder="What would you ask them about this interest?"></textarea></label><p class="opener-note">Your opener goes with your like. A full chat opens only after they like you back.</p><div class="card-actions"><button class="action outline pass">Not my person</button><button class="action light like">Send a hello ↗</button></div>';
 el.querySelector('.person-avatar').textContent=p.name[0];el.querySelector('.person-name').textContent=p.name;el.querySelector('.person-meta').textContent=`${p.area} · primary interest: ${cat.title}`;el.querySelector('.person-status').textContent=p.status;el.querySelector('.person-quote').textContent=`“${p.quote}”`;
 const facts=el.querySelector('.person-facts');for(const text of [p.activity,`Also into ${categories.find(c=>c.id===p.secondary)?.title||'more'}`,`${p.score}% into it`]){const chip=document.createElement('span');chip.textContent=text;facts.append(chip)}
 el.querySelector('.person-meter>span').textContent=p.activity;el.querySelector('.meter>span').style.width=`${p.score}%`;el.querySelector('.person-meter strong').textContent=`${p.score}%`;
 el.querySelector('.pass').onclick=()=>{state.passed[p.id]=true;save();renderCandidate();notify('Okay. On to the next person.')};el.querySelector('.like').onclick=()=>like(p,el.querySelector('textarea').value.trim());root.append(el)
}
function like(p,opener=''){
 if(state.matches[p.category]||state.pending[p.id])return;
 state.passed[p.id]=true;
 if(opener)(state.messages[p.id]??=[]).push({text:opener,mine:true});
 if(p.reciprocal){state.matches[p.category]=p.id;save();render();notify(`You and ${p.name} both said yes. Say hello!`);openChat(p.id,'match')}
 else{state.pending[p.id]={at:Date.now(),opener,category:p.category};save();renderCandidate();notify(`Your hello is on its way to ${p.name}.`)}
}
function settleRequests(){
 let changed=false,now=Date.now();
 for(const [id,request] of Object.entries(state.pending)){const p=person(id);if(!p){delete state.pending[id];changed=true;continue}
 if(now-request.at>=DAY){delete state.pending[id];delete state.messages[id];state.expiryNotice=expiryLines[Math.floor(now/DAY)%expiryLines.length];changed=true;continue}
 // Fictional demo response after a short delay. Real reply events must come from a server.
 if(p.demoReply&&now-request.at>=18000){delete state.pending[id];if(!state.matches[p.category]&&!(state.offers[p.category]||[]).length)state.matches[p.category]=id;else (state.offers[p.category]??=[]).push(id);changed=true;notify(`${p.name} liked you back.`)}
 }
 if(changed){save();render()}return changed
}
function titleFor(p){const count=state.opens[p.id]||0;if(state.bestEver[p.id])return 'Best friend';if(count>=7)return 'Favorite friend';if(count>=3)return 'Close friend';return 'Getting to know each other'}
function renderConnections(){const root=$('connection-area');root.replaceChildren();const entries=Object.keys(state.matches).map(cat=>({cat,p:person(state.matches[cat])})).filter(x=>x.p);if(!entries.length){root.append(contentBox('Your people will show up here.','Pick an interest and like someone who liked you too.','Explore interests',()=>setView('discover')));return}for(const {cat,p} of entries){const el=document.createElement('article');el.className='connection';el.innerHTML='<span class="topic"></span><h3></h3><p></p><span class="title-badge"></span><div class="card-actions"><button class="action light talk">Open chat ↗</button><button class="action outline manage">Manage</button></div>';el.querySelector('.topic').textContent=`${categories.find(x=>x.id===cat).icon}  ${cat}`;el.querySelector('h3').textContent=p.name;el.querySelector('p').textContent=`${p.area} · ${p.status} · ${p.activity}`;el.querySelector('.title-badge').textContent=titleFor(p);el.querySelector('.talk').onclick=()=>openChat(p.id,'people');el.querySelector('.manage').onclick=()=>manage(p);root.append(el)}}
function renderNetwork(){const root=$('network-nodes');root.replaceChildren();const matchIds=Object.keys(state.matches).map(cat=>({cat,p:person(state.matches[cat])})).filter(x=>x.p),total=Math.max(4,matchIds.length),rows=Math.ceil(total/2);$('network').style.minHeight=`${Math.max(535,rows*105+100)}px`;for(let i=0;i<total;i++){const item=matchIds[i],node=document.createElement('button');node.type='button';node.className=`node${item?'':' empty'}`;node.style.left=`${i%2===0?16:84}%`;node.style.top=`${(Math.floor(i/2)+1)/(rows+1)*100}%`;node.style.transform='translate(-50%,-50%)';const small=document.createElement('small'),strong=document.createElement('strong');small.textContent=item?.cat||'Open spot';strong.textContent=item?.p.name||'Find a friend +';node.append(small,strong);node.onclick=item?()=>openChat(item.p.id,'dashboard'):()=>{setView('discover');$('interests').scrollIntoView({behavior:'smooth'})};root.append(node)}requestAnimationFrame(drawWires)}
function drawWires(){const root=$('network-nodes'),stage=$('network');root.querySelectorAll('.wire').forEach(x=>x.remove());const center=$('network-initial').parentElement.getBoundingClientRect(),box=stage.getBoundingClientRect(),start={x:center.left+center.width/2-box.left,y:center.top+center.height/2-box.top};for(const node of root.querySelectorAll('.node')){const rect=node.getBoundingClientRect(),end={x:rect.left+rect.width/2-box.left,y:rect.top+rect.height/2-box.top},dx=end.x-start.x,dy=end.y-start.y,line=document.createElement('div');line.className='wire';line.style.left=`${start.x}px`;line.style.top=`${start.y}px`;line.style.width=`${Math.hypot(dx,dy)}px`;line.style.transform=`rotate(${Math.atan2(dy,dx)}rad)`;root.prepend(line)}}
function openChat(id,source){const p=person(id);if(!p||state.matches[p.category]!==id)return;if(source==='dashboard'){state.opens[id]=(state.opens[id]||0)+1;const count=state.opens[id];if(count>=12&&p.peerOpens>=12&&p.peerOpens>=Math.floor(count*.8))state.bestEver[id]=true;save();renderConnections()}const root=$('chat-content');root.replaceChildren();const close=document.createElement('button');close.className='close';close.textContent='×';close.setAttribute('aria-label','Close chat');close.onclick=()=>$('chat-dialog').close();const tag=document.createElement('div');tag.className='kicker';tag.textContent=`YOUR ${p.category.toUpperCase()} PERSON`;const h=document.createElement('h2');h.textContent=`You + ${p.name}`;const sub=document.createElement('p');sub.textContent=`${titleFor(p)} · Here for friendship, and the things you both care about.`;const history=document.createElement('div');history.className='chat-history';history.setAttribute('aria-label','Conversation');for(const m of [{text:`What got you into ${p.category}?`,mine:false},...(state.messages[id]||[])]){const bubble=document.createElement('div');bubble.className=`bubble${m.mine?' mine':''}`;bubble.textContent=m.text;history.append(bubble)}const form=document.createElement('form');form.className='chat-form';const input=document.createElement('input');input.required=true;input.maxLength=500;input.setAttribute('aria-label','Your message');input.placeholder='Say something real…';const send=document.createElement('button');send.className='action dark';send.textContent='Send';form.append(input,send);form.onsubmit=e=>{e.preventDefault();const text=input.value.trim();if(!text)return;(state.messages[id]??=[]).push({text,mine:true});save();const bubble=document.createElement('div');bubble.className='bubble mine';bubble.textContent=text;history.append(bubble);history.scrollTop=history.scrollHeight;form.reset()};root.append(close,tag,h,sub,history,form);$('chat-dialog').showModal();input.focus()}
function manage(p){const root=$('manage-content');root.replaceChildren();const close=document.createElement('button');close.className='close';close.textContent='×';close.setAttribute('aria-label','Close');close.onclick=()=>$('manage-dialog').close();const h=document.createElement('h2');h.textContent=`Your connection with ${p.name}`;const pText=document.createElement('p');pText.textContent='You can end this friendship any time. Blocking also removes the card from future discovery in this browser.';const end=document.createElement('button');end.className='action outline';end.textContent='End connection';end.onclick=()=>{delete state.matches[p.category];delete state.messages[p.id];save();$('manage-dialog').close();render();notify('Connection ended. Your spot is open again.')};const block=document.createElement('button');block.className='action dark';block.textContent='Block and never show again';block.onclick=()=>{state.blocked.push(p.id);delete state.matches[p.category];delete state.messages[p.id];save();$('manage-dialog').close();render();notify(`${p.name} was blocked and removed.`)};root.append(close,h,pText,end,block);$('manage-dialog').showModal()}
function showSignup(){signupStep=0;signupData={name:'',area:'',theme:'sunny',art:'talk',primary:'music',secondary:'gaming',answers:[]};theme(signupData.theme);$('signup-dialog').showModal();renderSignup()}
function progress(){const d=document.createElement('div');d.className='step-progress';for(let i=0;i<5;i++){const span=document.createElement('span');span.classList.toggle('done',i<=signupStep);d.append(span)}return d}
function interestSelect(name,chosen){
 const select=document.createElement('select');select.name=name;for(const c of categories){const o=document.createElement('option');o.value=c.id;o.textContent=`${c.icon} ${c.title}`;select.append(o)}select.value=chosen;return select
}
function themeChoices(current,onChoose){
 const root=document.createElement('div');root.className='theme-options';for(const t of themeLabels){const b=document.createElement('button');b.type='button';b.className=`choice${current===t.id?' selected':''}`;const swatch=document.createElement('span');swatch.className='theme-swatch';swatch.style.background=t.color;b.append(swatch,document.createTextNode(t.name));b.setAttribute('aria-pressed',current===t.id);b.onclick=()=>{theme(t.id);for(const item of root.querySelectorAll('.choice')){item.classList.remove('selected');item.setAttribute('aria-pressed','false')}b.classList.add('selected');b.setAttribute('aria-pressed','true');onChoose(t.id)};root.append(b)}return root
}
function pixelSvg(preset){
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 12 12');svg.setAttribute('aria-hidden','true');svg.setAttribute('shape-rendering','crispEdges');
 for(let y=0;y<preset.grid.length;y++)for(let x=0;x<preset.grid[y].length;x++){const code=preset.grid[y][x];if(code==='0')continue;const square=document.createElementNS('http://www.w3.org/2000/svg','rect');square.setAttribute('x',x);square.setAttribute('y',y);square.setAttribute('width',1);square.setAttribute('height',1);square.setAttribute('fill',code==='1'?'var(--ink)':code==='2'?'var(--accent)':'var(--pop)');svg.append(square)}return svg
}
function artChoices(current,onChoose){
 const root=document.createElement('div');root.className='art-options';for(const preset of pixelPresets){const button=document.createElement('button');button.type='button';button.className=`art-choice${preset.id===current?' selected':''}`;button.setAttribute('aria-pressed',preset.id===current);button.append(pixelSvg(preset),document.createTextNode(preset.name));button.onclick=()=>{for(const item of root.querySelectorAll('.art-choice')){item.classList.remove('selected');item.setAttribute('aria-pressed','false')}button.classList.add('selected');button.setAttribute('aria-pressed','true');onChoose(preset.id)};root.append(button)}return root
}
function renderPixelArt(){
 const selectedArt=pixelPresets.find(x=>x.id===state.profile?.art)||pixelPresets[0],star=pixelPresets[1];
 const placements={dashboard:[[37,9,88,.48],[4,70,95,.42],[43,79,65,.42],[17,3,43,.37]],interests:[[1,18,100,.52],[85,14,110,.55],[48,74,90,.33],[72,81,56,.43],[14,82,58,.39]],people:[[1,25,105,.54],[86,18,110,.51],[82,75,75,.43],[7,77,58,.39],[57,8,47,.35]],'circle-view':[[81,12,125,.54],[3,72,95,.43],[54,80,74,.36],[36,12,55,.35]]};
 for(const [id,positions] of Object.entries(placements)){const root=document.querySelector(`#${id} .pixel-scene`);if(!root||root.dataset.art===selectedArt.id)continue;root.replaceChildren();root.dataset.art=selectedArt.id;positions.forEach(([left,top,size,opacity],i)=>{const node=document.createElement('div');node.className='pixel-sprite';node.style.left=`${left}%`;node.style.top=`${top}%`;node.style.setProperty('--size',`${size}px`);node.style.setProperty('--opacity',opacity);node.style.setProperty('--tilt',`${i%2===0?-8:11}deg`);node.append(pixelSvg(i===1?star:selectedArt));root.append(node)})}
 const network=$('network');if(network.dataset.art!==selectedArt.id){network.querySelectorAll(':scope > .pixel-sprite').forEach(node=>node.remove());network.dataset.art=selectedArt.id;for(const [left,top,size] of [[6,14,70],[76,70,85]]){const node=document.createElement('div');node.className='pixel-sprite';node.style.left=`${left}%`;node.style.top=`${top}%`;node.style.setProperty('--size',`${size}px`);node.style.setProperty('--opacity','.3');node.append(pixelSvg(selectedArt));network.append(node)}}
}
function renderSignup(){
 const root=$('signup-content');root.replaceChildren();const tag=document.createElement('div');tag.className='kicker';tag.textContent=`GET TO KNOW YOU · ${signupStep+1} / 5`;root.append(tag,progress());
 if(signupStep===0){
  const h=document.createElement('h2');h.textContent='Start with you.';const p=document.createElement('p');p.textContent='Your name, a general area, and a color that feels like yours.';
  const form=document.createElement('form');form.innerHTML='<label>Username<input name="username" required maxlength="24" autocomplete="username" placeholder="What should people call you?"></label><label>Demo password (not saved)<input name="password" type="password" required minlength="8" autocomplete="new-password" placeholder="Use a made-up 8+ character password"></label><label>City / general area<input name="area" required maxlength="36" placeholder="e.g. Fujairah"></label><div class="kicker">PICK YOUR COLORS</div>';
  form.elements.namedItem('username').value=signupData.name;form.elements.namedItem('area').value=signupData.area;form.append(themeChoices(signupData.theme,t=>signupData.theme=t));
  const artLabel=document.createElement('div');artLabel.className='kicker';artLabel.textContent='PICK YOUR PIXEL ART';form.append(artLabel,artChoices(signupData.art,art=>signupData.art=art));
  const disclosure=document.createElement('p');disclosure.className='small-print';disclosure.textContent='Prototype only: the demo password is discarded. No real account is created.';
  const next=document.createElement('button');next.className='action dark';next.type='submit';next.textContent='Next: your interests ↗';form.append(disclosure,next);
  form.onsubmit=e=>{e.preventDefault();signupData.name=form.elements.namedItem('username').value.trim();signupData.area=form.elements.namedItem('area').value.trim();form.elements.namedItem('password').value='';signupStep=1;renderSignup()};root.append(h,p);if(state.profile){const resume=document.createElement('button');resume.className='preview-continue';resume.textContent=`Continue previous demo as ${state.profile.name} →`;resume.onclick=()=>{selected=state.profile.primary||'music';onboardingComplete=true;$('signup-dialog').close();render()};root.append(resume)}root.append(form);return
 }
 if(signupStep===1){
  const h=document.createElement('h2');h.textContent='What is your thing?';const p=document.createElement('p');p.textContent='Your primary interest puts you in that discovery feed. Your second one gives a new friend more to ask you about.';
  const form=document.createElement('form');const first=document.createElement('label');first.textContent='Primary interest';const primary=interestSelect('primary',signupData.primary);first.append(primary);const second=document.createElement('label');second.textContent='Secondary interest';const secondary=interestSelect('secondary',signupData.secondary);second.append(secondary);
  const next=document.createElement('button');next.type='submit';next.className='action dark';next.textContent='Next: tell us a bit more ↗';form.append(first,second,next);
  form.onsubmit=e=>{e.preventDefault();if(primary.value===secondary.value){notify('Pick a different secondary interest.');return}signupData.primary=primary.value;signupData.secondary=secondary.value;signupStep=2;renderSignup()};root.append(h,p,form);return
 }
 const index=signupStep-2,q=questions[index],h=document.createElement('h2');h.textContent=q.title;const p=document.createElement('p');p.textContent='Pick what feels closest, or add your own answer.';const options=document.createElement('div');options.className='question-options';const current=signupData.answers[index]||'';
 for(const value of q.options){const b=document.createElement('button');b.type='button';b.className=`choice${current===value?' selected':''}`;b.textContent=value;b.onclick=()=>{signupData.answers[index]=value;renderSignup()};options.append(b)}
 const other=document.createElement('button');other.type='button';other.className='choice other';other.textContent='Something else? Make it yours +';options.append(other);
 const custom=document.createElement('input');custom.id='own-answer';custom.className=current&&!q.options.includes(current)?'':'hidden';custom.maxLength=80;custom.placeholder='Write your own answer';custom.setAttribute('aria-label','Your own answer');if(!custom.classList.contains('hidden'))custom.value=current;
 other.onclick=()=>{signupData.answers[index]='';options.querySelectorAll('.choice').forEach(x=>x.classList.remove('selected'));custom.classList.remove('hidden');custom.focus()};custom.oninput=()=>signupData.answers[index]=custom.value.trim();
 const next=document.createElement('button');next.className='action dark';next.textContent=signupStep===4?'Enter Compa ↗':'Next question ↗';next.onclick=()=>{if(!signupData.answers[index]?.trim()){notify('Pick an answer, or write your own.');return}if(signupStep<4){signupStep++;renderSignup();return}state=initial();state.profile={name:signupData.name,area:signupData.area,theme:signupData.theme,art:signupData.art,primary:signupData.primary,secondary:signupData.secondary,answers:[...signupData.answers],status:'Prefer not to say'};selected=state.profile.primary;onboardingComplete=true;save();$('signup-dialog').close();render();notify(`Welcome, ${state.profile.name}!`)};
 root.append(h,p,options,custom,next)
}
function openProfile(){
 const root=$('profile-content');root.replaceChildren();const close=document.createElement('button');close.className='close';close.textContent='×';close.setAttribute('aria-label','Close profile');close.onclick=()=>$('profile-dialog').close();
 const h=document.createElement('h2');h.textContent='Your space, your rules.';const p=document.createElement('p');p.textContent='No photo needed. Change your interests, general area, or colors anytime.';
 const form=document.createElement('form');form.innerHTML='<label>Username<input name="name" required maxlength="24"></label><label>City / general area<input name="area" required maxlength="36"></label><label>Relationship status<select name="status"><option>Prefer not to say</option><option>Single</option><option>In a relationship</option></select></label>';
 form.elements.namedItem('name').value=state.profile.name;form.elements.namedItem('area').value=state.profile.area;form.elements.namedItem('status').value=state.profile.status;
 const first=document.createElement('label');first.textContent='Primary interest';const primary=interestSelect('primary',state.profile.primary);first.append(primary);const second=document.createElement('label');second.textContent='Secondary interest';const secondary=interestSelect('secondary',state.profile.secondary);second.append(secondary);form.append(first,second);
 const label=document.createElement('div');label.className='kicker';label.textContent='YOUR COLORS';form.append(label);let choice=state.profile.theme;form.append(themeChoices(choice,t=>choice=t));let art=state.profile.art||'talk';const artLabel=document.createElement('div');artLabel.className='kicker';artLabel.textContent='YOUR PIXEL ART';form.append(artLabel,artChoices(art,next=>art=next));
 const saveButton=document.createElement('button');saveButton.className='action dark';saveButton.type='submit';saveButton.textContent='Save changes ↗';form.append(saveButton);
 form.onsubmit=e=>{e.preventDefault();if(primary.value===secondary.value){notify('Pick a different secondary interest.');return}state.profile={...state.profile,name:form.elements.namedItem('name').value.trim(),area:form.elements.namedItem('area').value.trim(),status:form.elements.namedItem('status').value,primary:primary.value,secondary:secondary.value,theme:choice,art};selected=primary.value;save();$('profile-dialog').close();render();notify('Profile updated.')};root.append(close,h,p,form);$('profile-dialog').showModal()
}
function scrollEffects(){if(scrollQueued)return;scrollQueued=true;requestAnimationFrame(()=>{scrollQueued=false;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;for(const panel of document.querySelectorAll('#discover-view:not(.hidden) .scroll-panel')){if(reduced){panel.style.opacity='';panel.style.transform='';continue}const r=panel.getBoundingClientRect(),progress=Math.max(0,Math.min(1,-r.top/(r.height*.8)));panel.style.opacity=String(1-progress*.85);panel.style.transform=`translateY(${-progress*28}px)`}})}
for(const b of document.querySelectorAll('[data-view]'))b.onclick=()=>setView(b.dataset.view);
$('discover-button').onclick=()=>$('interests').scrollIntoView({behavior:'smooth'});
$('profile-button').onclick=()=>state.profile?openProfile():showSignup();
window.addEventListener('scroll',scrollEffects,{passive:true});window.addEventListener('resize',()=>{drawWires();scrollEffects()},{passive:true});new ResizeObserver(()=>requestAnimationFrame(drawWires)).observe($('network'));
phrase();if(state.expiryNotice){let last=Number(sessionStorage.getItem('compa-expiry-line')??-1),next=(last+1)%expiryLines.length;sessionStorage.setItem('compa-expiry-line',String(next));state.expiryNotice=expiryLines[next]}settleRequests();render();scrollEffects();$('signup-dialog').addEventListener('cancel',event=>{if(!onboardingComplete)event.preventDefault()});showSignup();setInterval(settleRequests,10000);
