(() => {
  const pet = document.querySelector('#pet'), egg = document.querySelector('#egg');
  const question = egg.querySelector('.egg-question'), image = pet.querySelector('.pet-image');
  const facing = pet.querySelector('.pet-facing'), speech = document.querySelector('#pet-speech');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const sprite=pet.querySelector('.pet-sheet');
  ['./assets/pet-stand.png','./assets/pet-jump-v3.png'].forEach(src=>{const im=new Image();im.src=src;});
  const skateTimes=[1050,450,450,450,450,450];
  const cycleMs=skateTimes.slice(1).reduce((a,b)=>a+b,0);
  let skateReady=false,skateDirection=1,skateSpeed=0;
  const atlas=new Image();atlas.src='./assets/skate-six-v1.png';atlas.decode().then(()=>skateReady=true).catch(()=>{});
  function drawSkate(index){const scale=pet.offsetHeight/600;sprite.style.width=500*scale+'px';sprite.style.height=pet.offsetHeight+'px';sprite.style.marginLeft='0';sprite.style.backgroundImage='url(./assets/skate-six-v1.png)';sprite.style.backgroundSize=3000*scale+'px '+600*scale+'px';sprite.style.backgroundPosition=-(index%6)*500*scale+'px '+-Math.floor(index/6)*600*scale+'px';sprite.dataset.frame=String(index+1);}
  function skate(){if(!skateReady){rest(1000);return;}skateDirection=position.x>innerWidth*.5?-1:1;facing.style.setProperty('--facing',skateDirection);skateSpeed=0;setState('skate');drawSkate(0);}
  let hatched=false, opening=false, state='idle', elapsed=0, duration=0, last=0;
  let position={x:innerWidth*.72,y:0}, start={...position}, dragging=null;
  let speechTimer, hideEggAt=0, actionIndex=0, frameIndex=-1;
  const actions=['hello','look'];
  function home(){return !document.querySelector('#home').hidden;}
  function floor(){return Math.max(0,innerHeight*(home()?.84:1)-(home()?0:24)-pet.offsetHeight);}
  function persist(){try{localStorage.setItem('xiaoquan-hatched',hatched?'yes':'no');localStorage.setItem('xiaoquan-position',JSON.stringify(position));}catch{}}
  function render(){position.x=Math.max(0,Math.min(innerWidth-pet.offsetWidth,position.x));position.y=Math.max(0,Math.min(innerHeight-pet.offsetHeight,position.y));pet.style.left=position.x+'px';pet.style.top=position.y+'px';}
  function say(text){clearTimeout(speechTimer);speech.textContent=text;speechTimer=setTimeout(()=>speech.textContent='',3200);}
  function setImage(src){if(image.getAttribute('src')!==src)image.src=src;}
  function setState(next,ms=0){const oldWidth=pet.offsetWidth,oldHeight=pet.offsetHeight;state=next;elapsed=0;duration=ms;pet.dataset.state=next;position.x+=(oldWidth-pet.offsetWidth)/2;position.y+=oldHeight-pet.offsetHeight;render();pet.classList.toggle('dragging',next==='drag');image.style.opacity='1';image.style.transform='';sprite.hidden=next!=='skate';image.hidden=next==='skate';setImage(next==='birth'||next==='drag'||next==='hop'?'./assets/pet-jump-v3.png':'./assets/pet-stand.png');frameIndex=-1;}
  function rest(ms=1500){setState('idle',ms);}
  function action(){const next=actions[actionIndex++%actions.length];setState(next,next==='hop'?850:2800);}
  function fall(){setState('fall',Math.min(1000,300+Math.abs(floor()-position.y)*1.3));start={...position};}
  function crack(){if(!hatched&&!opening)egg.classList.add('cracked');}
  question.addEventListener('pointerenter',crack);
  question.addEventListener('pointerleave',()=>{if(!opening)egg.classList.remove('cracked');});
  egg.addEventListener('focus',crack);
  egg.addEventListener('blur',()=>{if(!opening)egg.classList.remove('cracked');});
  egg.addEventListener('pointerdown',crack);
  egg.addEventListener('click',()=>{
    if(hatched||opening)return;
    opening=true;egg.disabled=true;egg.classList.add('cracked','open');
    const box=egg.getBoundingClientRect();pet.hidden=false;facing.style.setProperty('--facing',1);
    position={x:box.left+box.width/2-pet.offsetWidth/2,y:box.top+box.height*.57-pet.offsetHeight*.65};
    start={...position};setState('birth',reduced.matches?1:1900);image.style.opacity='0';hideEggAt=2100;render();
  });
  pet.addEventListener('pointerdown',event=>{
    if(event.button!==0||opening)return;event.preventDefault();
    dragging={id:event.pointerId,x:event.clientX,y:event.clientY,px:position.x,py:position.y,lastX:event.clientX,moved:false};
    pet.setPointerCapture(event.pointerId);facing.style.setProperty('--facing',1);setState('drag');dragging.px=position.x;dragging.py=position.y;say('呜哇～轻轻拎着我！');
  });
  pet.addEventListener('dragstart',event=>event.preventDefault());
  pet.addEventListener('pointermove',event=>{
    if(!dragging||event.pointerId!==dragging.id)return;
    const dx=event.clientX-dragging.x,dy=event.clientY-dragging.y;
    dragging.moved ||= Math.hypot(dx,dy)>5;
    pet.style.setProperty('--tilt',Math.max(-17,Math.min(17,(event.clientX-dragging.lastX)*.7))+'deg');dragging.lastX=event.clientX;
    position={x:dragging.px+dx,y:dragging.py+dy};render();
  });
  function release(event){if(!dragging||(event.pointerId!==undefined&&event.pointerId!==dragging.id))return;const moved=dragging.moved;dragging=null;pet.classList.remove('dragging');if(moved)fall();else{setState('hello',2000);say('我在这里陪你～');}persist();}
  ['pointerup','pointercancel','lostpointercapture'].forEach(name=>pet.addEventListener(name,release));
  pet.addEventListener('keydown',event=>{const d={ArrowLeft:[-15,0],ArrowRight:[15,0],ArrowUp:[0,-15],ArrowDown:[0,15]}[event.key];if(d){event.preventDefault();position.x+=d[0];position.y+=d[1];rest(4500);render();persist();}else if(event.key==='Enter'||event.key===' '){event.preventDefault();setState('hello',2400);say('今天也很开心见到你！');}});
  addEventListener('resize',()=>{if(!pet.hidden){render();if(!dragging&&!opening)fall();}});
  addEventListener('hashchange',()=>{if(hatched&&!dragging&&!opening)requestAnimationFrame(fall);});
  document.addEventListener('visibilitychange',()=>last=0);
  function animate(time){requestAnimationFrame(animate);if(document.hidden||pet.hidden){last=time;return;}const dt=last?Math.min(time-last,50):0;last=time;elapsed+=dt;
    if(state==='birth'){
      const t=Math.min(1,elapsed/duration),ease=1-Math.pow(1-t,3);
      position.y=start.y+(floor()-start.y)*ease-Math.sin(t*Math.PI)*105;
      image.style.opacity=String(Math.min(1,t*5));render();
      if(t>=1){hatched=true;opening=false;egg.hidden=true;position.y=floor();setState('landing',350);say('出来啦！很高兴见到你～');persist();}
    }else if(state==='fall'){
      const t=Math.min(1,elapsed/duration);position.y=start.y+(floor()-start.y)*t*t;render();if(t>=1){setState('landing',350);persist();}
    }else if(state==='landing'&&elapsed>=duration){rest(700);
    }else if(state==='skate'){
      if(reduced.matches){rest(5000);return;}
      let index=0;if(elapsed>=skateTimes[0]){let phase=(elapsed-skateTimes[0])%cycleMs;index=1;while(index<5&&phase>=skateTimes[index])phase-=skateTimes[index++];}
      if(index!==frameIndex){frameIndex=index;drawSkate(index);}
      const desired=(pet.offsetHeight/1.25)*(index===2||index===4?.36:.23);
      skateSpeed+=(desired-skateSpeed)*Math.min(1,dt/400);
      const edge=Math.max(0,innerWidth-pet.offsetWidth),distance=skateDirection>0?edge-position.x:position.x;
      position.x+=skateDirection*Math.min(distance,skateSpeed*dt/1000);position.y=floor();render();
      if(distance<1){persist();facing.style.setProperty('--facing',1);action();}
    }else if(state!=='drag'&&elapsed>=duration){if(reduced.matches){rest(5000);}else if(state==='idle'){skate();}else{rest(6000);}}
  }
  window.farmPet={reset(){hatched=false;opening=false;dragging=null;clearTimeout(speechTimer);speech.textContent='';pet.hidden=true;egg.hidden=false;egg.disabled=false;egg.classList.remove('cracked','open','hatching');pet.classList.remove('dragging');position={x:innerWidth*.72,y:0};setState('idle',1000);persist();},getState(){return {hatched,opening,state,frame:frameIndex+1,position:{...position}};}};
  // Every document visit starts with a closed egg; route changes retain this visit's state.
  window.farmPet.reset();
  requestAnimationFrame(animate);
})();
