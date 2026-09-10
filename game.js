const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const startCard = document.querySelector('#startCard');
const endCard = document.querySelector('#endCard');
const hud = document.querySelector('#hud');
const coinText = document.querySelector('#coinCount');
const timeText = document.querySelector('#timeCount');
const W = canvas.width, H = canvas.height;
let active = false, ended = false, camera = 0, coins = 0, elapsed = 0, last = 0;
const keys = {};
const player = { x:80, y:385, w:54, h:62, vx:0, vy:0, grounded:false, face:1 };
const groundY = 455;
const platforms = [
  {x:310,y:363,w:126,h:20}, {x:460,y:307,w:70,h:20}, {x:570,y:365,w:94,h:20},
  {x:760,y:332,w:160,h:20}, {x:1050,y:368,w:80,h:20}, {x:1170,y:310,w:150,h:20},
  {x:1430,y:358,w:100,h:20}, {x:1600,y:285,w:210,h:20}, {x:1900,y:355,w:135,h:20},
  {x:2130,y:314,w:94,h:20}, {x:2310,y:360,w:180,h:20}
];
const coinData = [350,392,495,610,800,840,880,1088,1220,1270,1475,1650,1700,1750,1945,2175,2370].map((x,i)=>({x,y:(i%3===1?250:i%3===2?315:315),taken:false}));
const enemies = [{x:690,y:417,dir:1,min:675,max:735},{x:960,y:417,dir:-1,min:935,max:1015},{x:1360,y:417,dir:1,min:1335,max:1410},{x:1850,y:417,dir:-1,min:1825,max:1880},{x:2050,y:417,dir:1,min:2045,max:2105}];
function rr(x,y,w,h,r=8){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function cloud(x,y,s){ctx.fillStyle='#ffffffbb'; ctx.beginPath();ctx.arc(x,y,20*s,0,7);ctx.arc(x+25*s,y-15*s,28*s,0,7);ctx.arc(x+57*s,y-6*s,21*s,0,7);ctx.arc(x+31*s,y+8*s,25*s,0,7);ctx.fill();}
function hill(x,y,s,c){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+70*s,y-140*s,x+145*s,y);ctx.closePath();ctx.fill();ctx.fillStyle='#fff4b9';ctx.beginPath();ctx.arc(x+70*s,y-95*s,12*s,Math.PI*.9,Math.PI*1.8);ctx.fill();}
function block(p){const x=p.x-camera;ctx.fillStyle='#a76038';rr(x,p.y,p.w,p.h,4);ctx.fillStyle='#d58a4e';rr(x+4,p.y+3,p.w-8,p.h-7,3);ctx.strokeStyle='#8d482e';ctx.lineWidth=2;ctx.strokeRect(x+8,p.y+6,p.w-16,p.h-12);}
function drawPenguin(x,y,flip=1,walking=0){ctx.save();ctx.translate(x+27,y+31);ctx.scale(flip,1);ctx.fillStyle='#172d54';ctx.beginPath();ctx.ellipse(0,2,24,29,0,0,7);ctx.fill();ctx.fillStyle='#eaf6f7';ctx.beginPath();ctx.ellipse(2,9,15,19,0,0,7);ctx.fill();ctx.fillStyle='#172d54';ctx.beginPath();ctx.ellipse(0,-19,20,18,0,0,7);ctx.fill();ctx.fillStyle='#f6a84d';ctx.beginPath();ctx.moveTo(15,-18);ctx.lineTo(29,-13);ctx.lineTo(15,-8);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(6,-23,5,0,7);ctx.fill();ctx.fillStyle='#172d54';ctx.beginPath();ctx.arc(7,-23,2,0,7);ctx.fill();ctx.fillStyle='#f4a54b';ctx.beginPath();ctx.ellipse(-10+walking*2,31,12,4,0,0,7);ctx.ellipse(11-walking*2,31,12,4,0,0,7);ctx.fill();ctx.fillStyle='#24416f';ctx.beginPath();ctx.ellipse(-24,3,8,15,-.5,0,7);ctx.fill();ctx.restore();}
function drawEnemy(e){const x=e.x-camera;ctx.fillStyle='#7e4d43';rr(x,e.y,30,28,10);ctx.fillStyle='#d79766';rr(x+5,e.y+8,20,13,6);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x+10,e.y+9,3,0,7);ctx.arc(x+21,e.y+9,3,0,7);ctx.fill();ctx.fillStyle='#34304a';ctx.beginPath();ctx.arc(x+11,e.y+9,1,0,7);ctx.arc(x+20,e.y+9,1,0,7);ctx.fill();}
function drawFlag(){const x=2525-camera;ctx.strokeStyle='#f6f1dc';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(x,146);ctx.lineTo(x,455);ctx.stroke();ctx.fillStyle='#f45f57';ctx.beginPath();ctx.moveTo(x+3,152);ctx.lineTo(x+88,177);ctx.lineTo(x+3,205);ctx.fill();ctx.fillStyle='#fff1d2';ctx.font='900 18px Nunito';ctx.fillText('P',x+30,183);}
function paint(){ctx.clearRect(0,0,W,H);ctx.fillStyle='#82d9ed';ctx.fillRect(0,0,W,H);
  // scenery moves slowly
  cloud(120-camera*.12,90,1);cloud(570-camera*.1,125,.65);cloud(960-camera*.12,65,.9);cloud(1430-camera*.1,112,.7);cloud(1920-camera*.12,80,1);
  hill(-70-camera*.28,455,1.5,'#78c775');hill(370-camera*.28,455,1.15,'#60b56c');hill(900-camera*.28,455,1.65,'#78c775');hill(1520-camera*.28,455,1.25,'#61b871');hill(2050-camera*.28,455,1.5,'#75c975');
  ctx.fillStyle='#52a55d';ctx.fillRect(0,455,W,85);ctx.fillStyle='#9dcb59';ctx.fillRect(0,455,W,10); for(let i=-20;i<W+30;i+=38){ctx.fillStyle='#3e954f';ctx.fillRect(i,483,20,5)}
  platforms.forEach(block); drawFlag();
  coinData.forEach(c=>{if(!c.taken){const x=c.x-camera;ctx.fillStyle='#ffd65a';ctx.beginPath();ctx.arc(x,c.y,11,0,7);ctx.fill();ctx.strokeStyle='#eaa936';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#fff0a2';ctx.fillRect(x-2,c.y-6,4,12)}});
  enemies.forEach(drawEnemy);drawPenguin(player.x-camera,player.y,player.face,Math.sin(elapsed*.018)*2);
}
function collide(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function reset(){Object.assign(player,{x:80,y:385,vx:0,vy:0});camera=0;coins=0;elapsed=0;ended=false;coinData.forEach(c=>c.taken=false);enemies.forEach((e,i)=>e.x=[690,960,1360,1850,2050][i]);coinText.textContent='00';timeText.textContent='300';}
function tick(t){if(!active)return;const dt=Math.min(32,t-last||16);last=t;elapsed+=dt; const move=(keys.ArrowRight||keys.d?1:0)-(keys.ArrowLeft||keys.a?1:0);player.vx+=move*.45;player.vx*=.79;player.vx=Math.max(-5.5,Math.min(5.5,player.vx));if(move)player.face=move;player.vy+=.55;player.x+=player.vx;player.y+=player.vy;player.grounded=false;
  if(player.y+player.h>=groundY){player.y=groundY-player.h;player.vy=0;player.grounded=true}
  platforms.forEach(p=>{if(player.vy>=0&&player.x+player.w-8>p.x&&player.x+8<p.x+p.w&&player.y+player.h>=p.y&&player.y+player.h-player.vy<=p.y+8){player.y=p.y-player.h;player.vy=0;player.grounded=true}});
  coinData.forEach(c=>{if(!c.taken&&Math.hypot(player.x+27-c.x,player.y+30-c.y)<35){c.taken=true;coins++;coinText.textContent=String(coins).padStart(2,'0')}});
  enemies.forEach(e=>{e.x+=e.dir*1.2;if(e.x<e.min||e.x>e.max)e.dir*=-1;if(collide(player,{x:e.x,y:e.y,w:30,h:28})){if(player.vy>2){e.x=-9999;player.vy=-10}else {player.x=Math.max(80,player.x-70);player.vy=-8}}});
  camera=Math.max(0,Math.min(1670,player.x-170));timeText.textContent=String(Math.max(0,300-Math.floor(elapsed/1000))).padStart(3,'0');
  if(player.x>2505&&!ended){ended=true;active=false;endCard.classList.remove('hidden')}paint();requestAnimationFrame(tick)}
function begin(){reset();startCard.classList.add('hidden');endCard.classList.add('hidden');hud.classList.remove('hidden');active=true;last=performance.now();requestAnimationFrame(tick)}
document.querySelector('#startButton').onclick=begin;document.querySelector('#againButton').onclick=begin;
addEventListener('keydown',e=>{keys[e.key]=true;if((e.key===' '||e.key==='ArrowUp'||e.key==='w')&&player.grounded&&active){player.vy=-12;player.grounded=false} if([' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault()});addEventListener('keyup',e=>keys[e.key]=false);
document.querySelector('#soundButton').onclick=e=>{e.currentTarget.textContent=e.currentTarget.textContent==='♪'?'×':'♪'};paint();
