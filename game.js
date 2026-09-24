const upgrades = [
  {id:"monkey", name:"Keyboard Monkey", base:25, cps:0.2,
   desc:"A monkey to help you press space. It doesn't really know what a spacebar is, so it just bashes the whole keyboard and eventually hits it."},
  {id:"boomer", name:"Boomer Mom", base:120, cps:1,
   desc:"A boomer mom who can barely open a Word document to help you press it. Every mom can press it once a second!"},
  {id:"genz", name:"Gen Z Kid", base:500, cps:20,
   desc:"A generation Z kid will help you press it. They're good at scrolling short vertical videos online, so they do it 20x a second!"},
  {id:"gamer", name:"Sweaty Gamer", base:2500, cps:85,
   desc:"Years of keyboard practice finally pay off. This gamer absolutely destroys the spacebar."},
  {id:"robot", name:"Space Robot", base:15000, cps:500,
   desc:"A purpose-built robot with one job: press SPACE. Efficient, tireless, and slightly concerning."},
  {id:"factory", name:"Spacebar Factory", base:90000, cps:3000,
   desc:"An entire factory devoted to industrial-scale spacebar pressing."}
];

let state = {score:0, total:0, owned:{}};
let last = performance.now();
const scoreEl=document.querySelector("#score"), rateEl=document.querySelector("#perSecond");
const shopEl=document.querySelector("#shop"), btn=document.querySelector("#spaceButton"), floatEl=document.querySelector("#floating");

function fmt(n){
  if(n<1000) return Math.floor(n).toLocaleString();
  const units=["K","M","B","T","Qa","Qi"]; let u=-1;
  while(n>=1000&&u<units.length-1){n/=1000;u++}
  return n.toFixed(n>=100?0:n>=10?1:2)+units[u];
}
function cps(){return upgrades.reduce((s,u)=>s+(state.owned[u.id]||0)*u.cps,0)}
function cost(u){return Math.floor(u.base*Math.pow(1.16,state.owned[u.id]||0))}
function render(){
  scoreEl.textContent=fmt(state.score);
  rateEl.textContent=cps().toFixed(3);
  shopEl.innerHTML=upgrades.map((u,i)=>{
    const c=cost(u), own=state.owned[u.id]||0, can=state.score>=c;
    return `<article class="item ${can?"":"locked"}">
      <h2>${u.name}</h2><div class="count">x${own}</div>
      <p>${u.desc}</p>
      <button class="buy" data-id="${u.id}" ${can?"":"disabled"}>▰ <span class="cost">${fmt(c)}</span></button>
    </article>`
  }).join("");
}
function press(){
  state.score+=1; state.total+=1;
  floatEl.textContent="+1"; floatEl.classList.remove("pop"); void floatEl.offsetWidth; floatEl.classList.add("pop");
  btn.classList.add("pressed"); setTimeout(()=>btn.classList.remove("pressed"),70);
  render();
}
function buy(id){
  const u=upgrades.find(x=>x.id===id), c=cost(u);
  if(state.score<c)return;
  state.score-=c; state.owned[id]=(state.owned[id]||0)+1; render(); save();
}
function save(){localStorage.setItem("spacebarClickerSave",JSON.stringify(state))}
function load(){
  try{const s=JSON.parse(localStorage.getItem("spacebarClickerSave"));if(s)state={...state,...s}}catch{}
}
let spaceHeld = false;
let holdTimer = null;

function startSpaceHold(){
  if(spaceHeld) return;
  spaceHeld = true;
  press(); // immediate press
  // After a short delay, holding Space repeatedly presses it.
  holdTimer = setTimeout(function repeat(){
    if(!spaceHeld) return;
    press();
    holdTimer = setTimeout(repeat, 200); // 5 presses/second
  }, 250);
}

function stopSpaceHold(){
  spaceHeld = false;
  if(holdTimer){
    clearTimeout(holdTimer);
    holdTimer = null;
  }
  btn.classList.remove("pressed");
}

document.addEventListener("keydown",e=>{
  if(e.code==="Space"){
    e.preventDefault();
    startSpaceHold();
  }
});
document.addEventListener("keyup",e=>{
  if(e.code==="Space"){
    e.preventDefault();
    stopSpaceHold();
  }
});
window.addEventListener("blur", stopSpaceHold);

btn.addEventListener("click",press);
shopEl.addEventListener("click",e=>{const b=e.target.closest(".buy");if(b)buy(b.dataset.id)});
document.querySelector("#saveBtn").onclick=save;
document.querySelector("#resetBtn").onclick=()=>{
  if(confirm("Reset all progress?")){localStorage.removeItem("spacebarClickerSave");state={score:0,total:0,owned:{}};render()}
};
function loop(now){
  const dt=Math.min((now-last)/1000,.25); last=now;
  const gain=cps()*dt; state.score+=gain; state.total+=gain;
  render(); requestAnimationFrame(loop);
}
load();render();setInterval(save,5000);requestAnimationFrame(loop);
