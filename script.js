const START = "2026-10-01"; // YYYY-MM-DD

const hero = document.getElementById("hero");

const padding = n => String(n).padStart(2, "0");
const format = d => `${d.getFullYear()}-${padding(d.getMonth()+ 1)}-${padding(d.getDate())}`;

function load(name) {
  return new Promise(res => {
    const img = new Image();
    img.alt = name;
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = "/imgs/" + name;
  });
}

(async function start() {
  const [y, m, d] = START.split("-").map(Number);
  const startDate = new Date(y, m - 1, d);
  let current = new Date();
  let foundImage = null;

  while (current >= startDate) {
    const name = format(current) + ".png";
    foundImage = await load(name);

    if (foundImage) {
      break;
    }

    current.setDate(current.getDate() - 1);
  }

  if (!foundImage) {
    hero.innerHTML = '<div class="empty">Keine Bilder vorhanden.</div>';
    return;
  }

  hero.innerHTML = "";
  hero.appendChild(foundImage);
})();