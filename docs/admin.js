const CONFIG = {
  owner: "M-Tarantino",
  repo: "Annies-Animal-Tales",
  branch: "main"
};

let appState = { isAuthenticated: false, token: null, tags: [], selectedImage: null, selectedImagePath: null };

function authenticateWithPAT() {
  const patInput = document.getElementById("patInput");
  const token = patInput.value.trim();
  const authStatus = document.getElementById("authStatus");
  if (!token) { showAuthStatus("Bitte gib einen Token ein.", "error"); return; }
  sessionStorage.setItem("github_pat", token);
  appState.token = token;
  appState.isAuthenticated = true;
  document.getElementById("editorSection").classList.add("active");
  document.getElementById("patInput").disabled = true;
  showAuthStatus("✅ Authentifizierung erfolgreich!", "success");
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("publishDate").value = today;
}

function showAuthStatus(message, type) {
  const el = document.getElementById("authStatus");
  el.textContent = message;
  el.className = `${type}`;
  el.style.display = "block";
}

function handleImageSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  const validMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!validMimes.includes(file.type)) { showSubmitStatus("Nur JPEG, PNG, WebP und GIF sind erlaubt.", "error"); return; }
  if (file.size > 5 * 1024 * 1024) { showSubmitStatus("Datei ist zu groß (max. 5 MB).", "error"); return; }
  resizeImage(file, 2000).then((resizedBlob) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById("uploadPrompt").style.display = "none";
      const preview = document.getElementById("imagePreview");
      preview.src = e.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(resizedBlob);
    appState.selectedImage = resizedBlob;
    appState.selectedImagePath = `docs/assets/images/${Date.now()}-${sanitizeFilename(file.name)}`;
  });
}

async function resizeImage(file, maxDimension = 2000) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, "image/jpeg", 0.85);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function handleTagInput(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    const input = event.target;
    const tag = input.value.trim();
    if (tag && !appState.tags.includes(tag)) {
      appState.tags.push(tag);
      renderTags();
      input.value = "";
    }
  }
}

function removeTag(index) {
  appState.tags.splice(index, 1);
  renderTags();
}

function renderTags() {
  const container = document.getElementById("tagsInput");
  const tagInput = container.querySelector("input");
  container.querySelectorAll(".tag-badge").forEach(el => el.remove());
  appState.tags.forEach((tag, idx) => {
    const badge = document.createElement("div");
    badge.className = "tag-badge";
    badge.innerHTML = `${tag}<button type="button" onclick="removeTag(${idx})">×</button>`;
    container.insertBefore(badge, tagInput);
  });
}

async function submitPost(event) {
  event.preventDefault();
  if (!appState.isAuthenticated || !appState.token) { showSubmitStatus("❌ Nicht authentifiziert.", "error"); return; }
  const submitBtn = document.querySelector(".form-submit");
  submitBtn.disabled = true;
  showSubmitStatus("📤 Veröffentliche Beitrag...", "loading");
  try {
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const content = document.getElementById("content").value;
    const publishDate = document.getElementById("publishDate").value;
    const tags = appState.tags;
    const slug = sanitizeFilename(title.toLowerCase().replace(/\s+/g, "-"));
    const filename = `${publishDate}-${slug}.md`;
    let imagePath = appState.selectedImagePath || "";
    if (appState.selectedImage) {
      showSubmitStatus("📸 Lade Bild hoch...", "loading");
      await uploadFile(appState.selectedImagePath, appState.selectedImage, `Bild-Upload: ${title}`);
      imagePath = "/" + appState.selectedImagePath.replace("docs/", "");
    }
    const frontmatter = {
      title,
      date: publishDate,
      author: "Annie",
      description,
      ...(imagePath && { image: imagePath }),
      tags
    };
    const markdown = `---\n${Object.entries(frontmatter).map(([key, val]) => {
      if (key === "tags" && Array.isArray(val)) return `${key}: ${JSON.stringify(val)}`;
      return `${key}: "${val}"`;
    }).join("\n")}\n---\n\n${content}`;
    showSubmitStatus("✍️ Speichere Beitrag...", "loading");
    await uploadFile(`docs/_posts/${filename}`, new Blob([markdown], { type: "text/plain" }), `Neuer Beitrag: ${title}`);
    showSubmitStatus("✅ Beitrag veröffentlicht! Übersetzung folgt in wenigen Minuten.", "success");
    document.getElementById("postForm").reset();
    appState.tags = [];
    appState.selectedImage = null;
    appState.selectedImagePath = null;
    document.getElementById("uploadPrompt").style.display = "block";
    document.getElementById("imagePreview").style.display = "none";
    renderTags();
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("publishDate").value = today;
  } catch (error) {
    showSubmitStatus(`❌ Fehler: ${error.message}`, "error");
    console.error("Submission error:", error);
  } finally {
    submitBtn.disabled = false;
  }
}

async function uploadFile(path, content, message) {
  const base64Content = await blobToBase64(content);
  const response = await fetch(
    `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${appState.token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message,
        content: base64Content,
        branch: CONFIG.branch
      })
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `GitHub API Error: ${response.status}`);
  }
  return response.json();
}

function sanitizeFilename(name) {
  return name.toLowerCase().replace(/[^a-z0-9äöüß]+/g, "-").replace(/^-|-$/g, "");
}

async function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
}

function showSubmitStatus(message, type) {
  const el = document.getElementById("submitStatus");
  el.textContent = message;
  el.className = `status-message show ${type}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const savedToken = sessionStorage.getItem("github_pat");
  if (savedToken) {
    document.getElementById("patInput").value = savedToken;
    authenticateWithPAT();
  }
});
