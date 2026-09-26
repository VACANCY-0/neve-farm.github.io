(() => {
 const scene=document.querySelector('#scene');
 const revealTargets=[...scene.children].filter(el=>!el.matches('.scene-background,.toolbar,.cv-entry,.study-entry,.folder,.contact-entry'));
 revealTargets.forEach(el=>el.classList.add('farm-reveal'));
 const panel=document.createElement('section');panel.className='music-window';panel.setAttribute('aria-label','音乐播放器');
 panel.innerHTML='<div class="music-titlebar"><button class="music-close" aria-label="关闭播放器，进入农场" title="进入农场"></button><i></i><i></i><span>Tiny Player</span></div><div class="music-main"><h2>小泉的音乐时间</h2><p class="music-track">音乐即将加入</p><img class="music-avatar" src="./assets/cv-icon.webp" alt="戴耳机的小泉"><div class="music-controls"><button data-action="previous" aria-label="上一首" disabled>⏮</button><button data-action="play" aria-label="播放音乐" disabled>▶</button><button data-action="next" aria-label="下一首" disabled>⏭</button></div><div class="music-times"><span class="music-current">0:00</span><span class="music-duration">0:00</span></div><input class="music-seek" aria-label="播放进度" type="range" min="0" max="100" value="0" disabled></div><footer class="music-footer"><span>默认暂停 · 由你选择播放</span><button class="music-enter">进入农场 ↗</button></footer>';
 scene.append(panel);
 const reopen=document.createElement('button');reopen.className='music-reopen';reopen.textContent='♫';reopen.setAttribute('aria-label','打开音乐播放器');document.querySelector('.desktop-menubar').append(reopen);
 const audio=new Audio();audio.preload='metadata';let tracks=[],index=0,entered=false;
 const play=panel.querySelector('[data-action="play"]'),seek=panel.querySelector('.music-seek');
 const format=n=>Number.isFinite(n)?Math.floor(n/60)+':'+String(Math.floor(n%60)).padStart(2,'0'):'0:00';
 function sync(){panel.querySelector('.music-current').textContent=format(audio.currentTime);panel.querySelector('.music-duration').textContent=format(audio.duration);seek.value=audio.duration?audio.currentTime/audio.duration*100:0;play.textContent=audio.paused?'▶':'Ⅱ';play.setAttribute('aria-label',audio.paused?'播放音乐':'暂停音乐')}
 function select(i){index=(i+tracks.length)%tracks.length;audio.src=tracks[index].src;panel.querySelector('.music-track').textContent=tracks[index].title;sync()}
 window.farmMusic={setTracks(list){tracks=list;if(!tracks.length)return;select(0);play.disabled=false;seek.disabled=false;panel.querySelectorAll('[data-action="previous"],[data-action="next"]').forEach(b=>b.disabled=tracks.length<2)}};
 play.onclick=async()=>{if(audio.paused){try{await audio.play()}catch{panel.querySelector('.music-track').textContent='暂时无法播放，请重试'}}else audio.pause();sync()};
 for(const action of ['previous','next'])panel.querySelector('[data-action="'+action+'"]').onclick=()=>{const playing=!audio.paused;select(index+(action==='next'?1:-1));if(playing)audio.play().catch(()=>{});};
 seek.oninput=()=>{if(Number.isFinite(audio.duration))audio.currentTime=seek.value/100*audio.duration};
 ['timeupdate','loadedmetadata','play','pause'].forEach(e=>audio.addEventListener(e,sync));audio.addEventListener('ended',()=>{if(tracks.length){select(index+1);audio.play().catch(()=>{})}});
 function close(){panel.hidden=true;if(entered)return;entered=true;document.body.classList.remove('intro-pending');revealTargets.forEach((el,i)=>{el.inert=false;el.style.setProperty('--arrival-delay',(el.matches('.sky-icon')?350+[...scene.querySelectorAll('.sky-icon')].indexOf(el)*145:i*45)+'ms');el.classList.add('farm-arriving')});setTimeout(()=>revealTargets.forEach(el=>el.classList.remove('farm-arriving')),1900)}
 panel.querySelector('.music-close').onclick=close;panel.querySelector('.music-enter').onclick=close;panel.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 reopen.onclick=()=>{location.hash='#/';panel.hidden=false;panel.querySelector('.music-close').focus()};
 function routeIntro(){if(location.hash&&location.hash!=='#/'){document.body.classList.remove('intro-pending');}else if(!entered){document.body.classList.add('intro-pending');revealTargets.forEach(el=>el.inert=true);panel.hidden=false}}
 window.farmMusic.setTracks([{src:'./assets/music/welcome.mp3',title:'欢迎来到小泉农场'}]);
 addEventListener('hashchange',routeIntro);routeIntro();
})();
