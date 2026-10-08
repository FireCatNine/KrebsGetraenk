const photoInput = document.getElementById('photoInput');
const preview = document.getElementById('preview');
const uploadBtn = document.getElementById('uploadBtn');
const tokenEle = document.getElementById("token");

let base64Image = '';
let fileName = '';

if (localStorage.getItem("token")) {
  tokenEle.value = localStorage.getItem("token");
}

const padding = n => String(n).padStart(2, "0");
const format = d => `${d.getFullYear()}-${padding(d.getMonth() + 1)}-${padding(d.getDate())}`;

photoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  fileName = `${format(new Date())}.png`;

  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target.result;
    preview.src = result;
    preview.style.display = 'block';

    base64Image = result.split(',')[1];
    uploadBtn.disabled = false;
  };
  reader.readAsDataURL(file);
});

tokenEle.hidden = localStorage.getItem("token") !== null;
tokenEle.addEventListener("keydown", (e) => {
    if (e.key !== 'Enter') return;
    localStorage.setItem("token", tokenEle.value.trim());
    tokenEle.hidden = true;
});

async function uploadToGitHub() {
  const token = tokenEle.value.trim();
  if (!token) {
    alert("Please enter Token");
    return;
  }

  uploadBtn.disabled = true;

  const url = `https://api.github.com/repos/FireCatNine/KrebsGetraenk/contents/imgs/${fileName}`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github+json'
      },
      body: JSON.stringify({
        message: `Image-Upload: ${fileName}`,
        content: base64Image
      })
    });

    if (response.ok) {
      alert("Success!");
    } else {
      const errorData = await response.json();
      alert(`Upload-Error: ${errorData.message}`);
      uploadBtn.disabled = false;
    }
  } catch (err) {
    alert("Network-Error!");
    uploadBtn.disabled = false;
  }
}