// docs/admin.js
const CONFIG = {
  owner: "M-Tarantino",
  repo: "Annies-Animal-Tales",
  branch: "main"
};

let authToken = null;

function authenticateWithPAT() {
  const pat = document.getElementById("patInput").value.trim();
  if (!pat) {
    showAuthStatus("Bitte Token eintragen", "error");
    return;
  }
  authToken = pat;
  testAuth();
}

function testAuth() {
  const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}`;
  fetch(url, {
    headers: { "Authorization": `Bearer ${authToken}`, "Accept": "application/vnd.github.v3+json" }
  })
    .then(r => r.json())
    .then(data => {
      if (data.id) {
        showAuthStatus("✓ Authentifiziert", "success");
        document.getElementById("editorSection").classList.add("active");
        document.getElementById("patInput").disabled = true;
        document.querySelector(".auth-form button").disabled = true;
        initializePublishDate();
      } else {
        showAuthStatus("Ungültiger Token", "error");
        authToken = null;
      }
    })
    .catch(() => {
      showAuthStatus("Netzwerkfehler", "error");
      authToken = null;
    });
}

function showAuthStatus(msg, type) {
  const el = document.getElementById("authStatus");
  el.textContent = msg;
  el.className = type;
  el.style.display = "block";
}

function initializePublishDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  document.getElementById("publishDate").value = `${yyyy}-${mm}-${dd}`;
}

function updatePostType() {
  const type = document.getElementById("postType").value;
  if (type === "story") {
    document.getElementById("description").placeholder = "Kurze Geschichte-Zusammenfassung...";
  } else if (type === "blog") {
    document.getElementById("description").placeholder = "Blog-Vorschau...";
  }
}

function formatText(cmd) {
  const textarea = document.getElementById("content");
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end) || "Text";
  const before = textarea.value.substring(0, start);
  const after = textarea.value.substring(end);

  let formatted = selected;
  switch (cmd) {
    case "bold":
      formatted = `**${selected}**`;
      break;
    case "italic":
      formatted = `*${selected}*`;
      break;
    case "underline":
      formatted = `__${selected}__`;
      break;
    case "heading1":
      formatted = `\n# ${selected}\n`;
      break;
    case "heading2":
      formatted = `\n## ${selected}\n`;
      break;
    case "unorderedList":
      formatted = `\n- ${selected}\n`;
      break;
  }

  textarea.value = before + formatted + after;
  textarea.focus();
  textarea.selectionStart = start + formatted.length;
}

function insertLink() {
  const url = prompt("Link-URL eingeben:");
  if (!url) return;
  const text = prompt("Link-Text eingeben:", "Hier klicken") || "Hier klicken";
  const textarea = document.getElementById("content");
  const start = textarea.selectionStart;
  const before = textarea.value.substring(0, start);
  const after = textarea.value.substring(start);
  textarea.value = before + `[${text}](${url})` + after;
  textarea.focus();
}

function clearText() {
  if (confirm("Wirklich alles löschen?")) {
    document.getElementById("content").value = "";
  }
}

function submitPost(event) {
  event.preventDefault();

  if (!authToken) {
    showSubmitStatus("Nicht authentifiziert", "error");
    return;
  }

  const postType = document.getElementById("postType").value;
  if (!postType) {
    showSubmitStatus("Bitte Beitragstyp wählen", "error");
    return;
  }

  const title = document.getElementById("title").value.trim();
  const publishDate = document.getElementById("publishDate").value;
  const description = document.getElementById("description").value.trim();
  const imagePath = document.getElementById("image").value.trim();
  const content = document.getElementById("content").value.trim();
  const tags = document.getElementById("tags").value.split(",").map(t => t.trim()).filter(Boolean);

  if (!title || !publishDate || !description || !content) {
    showSubmitStatus("Alle Pflichtfelder ausfüllen", "error");
    return;
  }

  showSubmitStatus("Wird veröffentlicht...", "loading");

  const frontmatter = {
    title,
    date: publishDate,
    author: "Annie",
    description,
    ...(imagePath && { image: imagePath }),
    tags,
    lang: "de"
  };

  const markdown = `---\n${Object.entries(frontmatter).map(([key, val]) => {
    if (Array.isArray(val)) return `${key}: [${val.map(v => `"${v}"`).join(", ")}]`;
    if (typeof val === "string") return `${key}: "${val}"`;
    return `${key}: ${val}`;
  }).join("\n")}\n---\n\n${content}`;

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const filename = `${publishDate}-${slug}.md`;
  const folder = postType === "blog" ? "_posts" : "_kindergeschichten";
  const path = `docs/${folder}/${filename}`;

  commitFile(path, markdown)
    .then(() => showSubmitStatus("✓ Veröffentlicht!", "success"))
    .catch(err => showSubmitStatus(`Fehler: ${err}`, "error"));
}

function commitFile(path, content) {
  const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`;
  const encodedContent = btoa(unescape(encodeURIComponent(content)));

  return fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${authToken}`,
      "Accept": "application/vnd.github.v3+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: `Neue Veröffentlichung: ${path.split("/").pop()}`,
      content: encodedContent,
      branch: CONFIG.branch
    })
  }).then(r => {
    if (!r.ok) throw new Error(`GitHub API: ${r.status}`);
    return r.json();
  });
}

function showSubmitStatus(msg, type) {
  const el = document.getElementById("submitStatus");
  el.textContent = msg;
  el.className = `status-message show ${type}`;
}