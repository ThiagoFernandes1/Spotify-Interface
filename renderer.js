// Simple renderer for the mock Spotify UI
const songRows = Array.from(document.querySelectorAll('.song-row'));
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

songRows.forEach((row, i) => {
    row.addEventListener('click', () => {
        loadAndPlay(i);
    });
});

playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
});

audio.addEventListener('play', () => {
    playPauseIcon.src = 'assets/Pause.svg';
});
audio.addEventListener('pause', () => {
    // show the same icon but with reduced opacity when paused
    playPauseIcon.src = 'assets/Pause.svg';
});

audio.addEventListener('timeupdate', () => {
    if (!isFinite(audio.duration)) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progress.value = pct || 0;
    currentTimeEl.textContent = formatTime(audio.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
    durationTimeEl.textContent = formatTime(audio.duration);
});

progress.addEventListener('input', (e) => {
    if (!audio.duration) return;
    const p = Number(e.target.value) / 100;
    audio.currentTime = p * audio.duration;
});

volumeEl.addEventListener('input', (e) => {
    audio.volume = Number(e.target.value);
});

prevBtn?.addEventListener('click', () => {
    if (currentIndex > 0) {
        loadAndPlay(currentIndex - 1);
    }
});
nextBtn?.addEventListener('click', () => {
    if (currentIndex < songRows.length - 1) {
        loadAndPlay(currentIndex + 1);
    }
});

// auto-play first song on load (optional)
if (songRows.length > 0) {
    loadAndPlay(0);
}
