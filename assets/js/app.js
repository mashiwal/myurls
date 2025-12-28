// assets/js/app.js

// --- UI HELPERS ---
const getEl = (id) => document.getElementById(id);
const hide = (el) => el.classList.add('d-none');
const show = (el) => el.classList.remove('d-none');

// --- AUTH SYSTEM ---
function login() {
    auth.signInWithPopup(provider).catch(alert);
}

function logout() {
    auth.signOut().then(() => location.reload());
}

// Pantau Status Login
auth.onAuthStateChanged(user => {
    const loginBtn = getEl('login-area');
    const dashboard = getEl('dashboard-area');
    const userNav = getEl('user-nav');

    if (user) {
        hide(loginBtn);
        show(dashboard);
        show(userNav);
        getEl('user-name').innerText = user.displayName;
        getEl('user-pic').src = user.photoURL;
        loadData(user);
    } else {
        show(loginBtn);
        hide(dashboard);
        hide(userNav);
    }
});

// --- CORE: SHORTEN URL ---
async function createShortLink() {
    const longUrl = getEl('input-url').value.trim();
    let slug = getEl('input-slug').value.trim();
    const btn = getEl('btn-shorten');

    if (!longUrl.startsWith('http')) return alert("Gunakan https:// atau http://");

    // Loading State
    btn.innerHTML = '⏳ Memproses...';
    btn.disabled = true;

    // Generate Slug jika kosong
    if (!slug) slug = Math.random().toString(36).substring(2, 7);
    slug = slug.replace(/[^a-zA-Z0-9-_]/g, ''); // Bersihkan karakter aneh

    const user = auth.currentUser;
    const userId = user ? user.uid : "guest";

    try {
        const docRef = db.collection("links").doc(slug);
        const check = await docRef.get();

        if (check.exists) throw new Error("Nama link sudah dipakai!");

        await docRef.set({
            original: longUrl,
            owner: userId,
            ownerEmail: user ? user.email : "Guest",
            views: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Tampilkan Sukses
        getEl('result-card').classList.remove('d-none');
        // Deteksi path otomatis agar rapi
        const basePath = window.location.pathname.replace('index.html', ''); 
        const shortLink = window.location.origin + basePath + slug;
        
        getEl('result-link').value = shortLink;
        if(user) loadData(user); // Refresh tabel

    } catch (err) {
        alert(err.message);
    } finally {
        btn.innerHTML = '✨ Pendekkan';
        btn.disabled = false;
    }
}

// --- DATA: LOAD LINKS ---
async function loadData(user) {
    const tbody = getEl('table-body');
    const isAdmin = user.email === ADMIN_EMAIL;
    
    let query = db.collection("links");
    
    // Logic Admin vs User Biasa
    if (!isAdmin) {
        query = query.where("owner", "==", user.uid);
    } else {
        query = query.orderBy("createdAt", "desc").limit(50);
        getEl('admin-badge').classList.remove('d-none');
    }

    const snapshot = await query.get();
    tbody.innerHTML = '';

    snapshot.forEach(doc => {
        const d = doc.data();
        const shortUrl = window.location.origin + window.location.pathname.replace('index.html', '') + doc.id;
        
        tbody.innerHTML += `
            <tr>
                <td><a href="${shortUrl}" target="_blank" class="fw-bold text-decoration-none">${doc.id}</a></td>
                <td class="text-truncate" style="max-width: 150px;">${d.original}</td>
                <td class="text-center"><span class="badge bg-secondary">${d.views}</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-danger" onclick="hapusLink('${doc.id}')">&times;</button>
                </td>
            </tr>
        `;
    });
}

async function hapusLink(id) {
    if(confirm("Hapus link ini?")) {
        await db.collection("links").doc(id).delete();
        loadData(auth.currentUser);
    }
}

// Fungsi Copy
function copyLink() {
    const copyText = getEl("result-link");
    copyText.select();
    document.execCommand("copy");
    alert("Disalin!");
}