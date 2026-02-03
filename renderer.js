// Renderer: player + SPA navigation + search
document.addEventListener('DOMContentLoaded', () => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';

    const playPauseBtn = document.getElementById('playPauseBtn');
    const playPauseIcon = document.getElementById('playPauseIcon');
    const footerSongName = document.getElementById('footerSongName');
    const footerSongArtist = document.getElementById('footerSongArtist');
    const progress = document.getElementById('progress');
    const currentTimeEl = document.getElementById('currentTime');
    const durationTimeEl = document.getElementById('durationTime');
    const volumeEl = document.getElementById('volume');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    let currentIndex = -1;
    let songRows = [];

    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function setActiveRow(index) {
        songRows.forEach((r, i) => r.classList.toggle('active', i === index));
    }

    function loadAndPlay(index) {
        const row = songRows[index];
        if (!row) return;
        const src = row.dataset.src;
        const title = row.querySelector('.song-name')?.textContent || 'Unknown';
        const artist = row.querySelector('.song-artist')?.textContent || '';
        if (!src) return;
        if (audio.src !== src) {
            audio.src = src;
        }
        footerSongName.textContent = title;
        footerSongArtist.textContent = artist;
        currentIndex = index;
        setActiveRow(index);
        audio.play();
    }

    function refreshSongRows() {
        // Find song rows inside playlist page
        songRows = Array.from(document.querySelectorAll('#page-playlist .song-row'));
        // remove previous listeners by cloning nodes (safe approach) and reattach
        songRows.forEach((row, i) => {
            row.onclick = () => loadAndPlay(i);
        });
    }

    // Navigation between pages
    const pageLinks = Array.from(document.querySelectorAll('.menu ul li a[data-page]'));
    const pages = Array.from(document.querySelectorAll('.page'));

    function showPage(id) {
        pages.forEach(p => p.style.display = 'none');
        const el = document.getElementById('page-' + id);
        if (el) el.style.display = 'block';
        if (id === 'playlist') refreshSongRows();
    }

    pageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            showPage(page);
        });
    });

    // Basic search implementation: filters playlist songs
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const q = e.target.value.trim().toLowerCase();
            refreshSongRows();
            if (!q) {
                searchResults.textContent = 'Type to filter the current playlist tracks.';
                return;
            }
            const matches = songRows.map((r, i) => {
                const title = r.querySelector('.song-name')?.textContent.toLowerCase() || '';
                const artist = r.querySelector('.song-artist')?.textContent.toLowerCase() || '';
                const album = r.querySelector('.song-album')?.textContent.toLowerCase() || '';
                if (title.includes(q) || artist.includes(q) || album.includes(q)) return {r, i, title, artist};
                return null;
            }).filter(Boolean);
            if (matches.length === 0) {
                searchResults.textContent = 'No results';
                return;
            }
            // render results
            searchResults.innerHTML = '';
            matches.forEach(m => {
                const item = document.createElement('div');
                item.style.padding = '8px 0';
                item.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
                item.style.cursor = 'pointer';
                item.textContent = `${m.r.querySelector('.song-name')?.textContent} — ${m.r.querySelector('.song-artist')?.textContent}`;
                item.addEventListener('click', () => {
                    // show playlist and play that track
                    showPage('playlist');
                    loadAndPlay(m.i);
                });
                searchResults.appendChild(item);
            });
        });
    }

    // Player controls
    playPauseBtn?.addEventListener('click', () => {
        if (audio.paused) audio.play(); else audio.pause();
    });

    audio.addEventListener('play', () => { if (playPauseIcon) playPauseIcon.src = 'assets/Pause.svg'; });
    audio.addEventListener('pause', () => { if (playPauseIcon) playPauseIcon.src = 'assets/Pause.svg'; });

    audio.addEventListener('timeupdate', () => {
        if (!isFinite(audio.duration)) return;
        const pct = (audio.currentTime / audio.duration) * 100;
        if (progress) progress.value = pct || 0;
        if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
        if (durationTimeEl) durationTimeEl.textContent = formatTime(audio.duration);
    });

    progress?.addEventListener('input', (e) => {
        if (!audio.duration) return;
        const p = Number(e.target.value) / 100;
        audio.currentTime = p * audio.duration;
    });

    volumeEl?.addEventListener('input', (e) => { audio.volume = Number(e.target.value); });

    prevBtn?.addEventListener('click', () => { if (currentIndex > 0) loadAndPlay(currentIndex - 1); });
    nextBtn?.addEventListener('click', () => { if (currentIndex < songRows.length - 1) loadAndPlay(currentIndex + 1); });

    // initialize
    refreshSongRows();
    // auto-play first song on load (optional)
    if (songRows.length > 0) loadAndPlay(0);
});
