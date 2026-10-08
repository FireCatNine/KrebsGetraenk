const photoInput = document.getElementById('photoInput');
const preview = document.getElementById('preview');
const uploadBtn = document.getElementById('uploadBtn');
const tokenEle = document.getElementById("token");
const statusEle = document.getElementById("status");

let base64Image = '';
let fileName = '';

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

const setStatus = s => statusEle.innerText = s;

async function upload() {
  const token = localStorage.getItem("token")
  if (!token) {
    setStatus("Please enter a Token!");
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
      setStatus("Success!");
      uploadBtn.disabled = false;
    } else {
      const errorData = await response.json();
      if (response.status === 422 && errorData.message.includes("sha")) {
        setStatus("Error: An image has already been uploaded today!");
      } else setStatus(`Upload-Error: ${errorData.message}`);
      uploadBtn.disabled = false;
    }
  } catch (err) {
    setStatus("Network-Error!");
    uploadBtn.disabled = false;
  }
}