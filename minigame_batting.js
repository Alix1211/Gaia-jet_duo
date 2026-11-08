// 컨베이어 배팅 판정 원본 유지. 제트 듀오의 분홍/보라 대기·비행 이미지가 라운드마다 교대한다.
// 게임 본체는 assets/gaia-detective/minigame/batting_police/game.html (단일 빌드에서는 GAIA_DOC 로 들어감). 규칙 수치는 그 문서 안 RULES 에 있음.
// 그림 배정: images = [배경(경찰서 장소 배경), 대기(숙인 뒷모습), 비행, 타자 스윙 6컷]. 시작 화면은 탭 시작(tapStart)으로 최소화.
(function () {
  const G = window.GAIA;
  const MINI=p=>(window.MINI_ASSETS&&window.MINI_ASSETS[p])||('assets/'+p);
  const img = k => MINI('minigame/batting_police/' + k);
  const place = () => MINI('screens/training.webp');
  const tierOf = wl => Math.max(1, Math.min(3, 1 + Math.floor((wl || 0) / 2))); // 난이도: 월드 레벨에 따라 쉬움→보통→어려움 [임시]
  G.minigame.register('batting', {
    // APK에 고정된 mini-assets 대신 자동 업데이트되는 원본 문서를 읽는다.
    docUrl: 'assets/minigame/batting_police/game.html',
    transformDoc: doc => doc
      // Enlarge only the painted game board around the floor line; timing and HUD stay unchanged.
      .replace('ctx.clearRect(0,0,W,H);drawBackground();ctx.save();',
        'ctx.clearRect(0,0,W,H);ctx.save();const boardZoom=1.12;ctx.translate(W*(1-boardZoom)/2,floorY()*(1-boardZoom)+H*.025);ctx.scale(boardZoom,boardZoom);drawBackground();ctx.save();')
      .replace("ctx.restore();\nif(phase==='miss')drawCheerSticker", "ctx.restore();ctx.restore();\nif(phase==='miss')drawCheerSticker")
      .replace('const im=images[key];ctx.save();', "const alt=CFG.heroVariants&&round%2===0&&key.startsWith('hero-'+CFG.location+'-')?images[key+'-alt']:null;const im=alt||images[key];ctx.save();")
      .replace('await Promise.all(a.slice(3,9).map(', "if(CFG.heroVariants){const [standby,flight]=CFG.heroVariants;if(standby)for(let i=0;i<4;i++)await loadImage('hero-'+CFG.location+'-back'+i+'-alt',standby);if(flight)for(const name of ['launch','air','air-front'])await loadImage('hero-'+CFG.location+'-'+name+'-alt',flight);}await Promise.all(a.slice(3,9).map(")
      .replace('let ac=null,master=null;', 'let ac=null,master=null,effectsBus=null;')
      .replace('master.connect(ac.destination);', 'master.connect(ac.destination);effectsBus=ac.createGain();effectsBus.gain.value=parent.GaiaSettings?.effects??1;effectsBus.connect(master);')
      .replace('node.connect(gain).connect(master);', 'node.connect(gain).connect(effectsBus);')
      .replace('g.gain.value=1;', 'g.gain.value=parent.GaiaSettings?.music??1;')
      .replace("function makeHit(k){", "function makeHit(k){if(k==='swing'){const rate=ac.sampleRate,b=ac.createBuffer(1,Math.ceil(rate*.16),rate),a=b.getChannelData(0);let low=0;for(let i=0;i<a.length;i++){const t=i/a.length,n=Math.random()*2-1;low+=.12*(n-low);a[i]=(n-low)*Math.sin(Math.PI*t)*.24;}return b;}")
      .replace("(k==='hit_slap'||k==='hit_punch')", "(k==='hit_slap'||k==='hit_punch'||k==='swing')")
      .replace("function sfx(name){if(!solo)send('wellness-sfx',{name});}", "function sfx(name){if(name==='swing')Sound.play('swing');else if(!solo)send('wellness-sfx',{name});}"),
    cfg: opts => ({
      tapStart: true, difficulty: tierOf(opts.wl), location: 'center',
      images: [place(), img('standby_pink.webp'), img('flight_pink.webp'), img('batter_0.png'), img('batter_1.png'), img('batter_2.png'), img('batter_3.png'), img('batter_4.png'), img('batter_5.png')],
      heroVariants: [img('standby_purple.webp'), img('flight_purple.webp')]
    }),
    sounds: () => ({})
  });
})();
