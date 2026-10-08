const START = "2026-01-01";//YYYY-MM-DD

const hero= document.getElementById("hero");
const grid= document.getElementById("grid");
const title= document.getElementById("archivHeader");

const padding= n=> String(n).padStart(2, "0");
const format= d=> `${d.getFullYear()}-${padding(d.getMonth()+ 1)}-${padding(d.getDate())}`;

function load(name){
  return new Promise(res=> {
    const img= new Image();
    img.alt= name;
    img.onload= ()=> res(img);
    img.onerror= ()=> res(null);
    img.src= "imgs/"+ name;
  });
}

async function start(){
  const [y, m, d]= START.split("-").map(Number);
  const today= new Date();
  const days= [];

  for (let t= new Date(y, m - 1, d); t <= today; t.setDate(t.getDate() + 1)) {
    days.push(format(t) + ".png");
  }

  const result= await Promise.all(days.map(load));
  const images= result.filter(Boolean).reverse(); 

  if (!images.length) {
    hero.innerHTML= '<div class="empty">Keine Bilder vorhanden. Lul</div>';
    grid.hidden= title.hidden= true;
    return;
  }

  hero.innerHTML= "";
  hero.appendChild(images[0]);

  grid.innerHTML= "";
  for (const img of images.slice(1)) grid.appendChild(img);
  grid.hidden= title.hidden= images.length=== 1;
}

start();