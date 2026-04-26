const canvas = document.getElementById('maze-canvas');
const ctx = canvas.getContext('2d');
const solveBtn = document.getElementById('solve-btn');
const muteBtn = document.getElementById('mute-btn');
const mazeInput = document.getElementById('maze-input');
const statusText = document.getElementById('status-text');

let maze = [];
let cellSize = 30;
let isMuted = false;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

/* ================= SOUND ================= */

const playStepSound = () => {
    if (isMuted) return;
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.frequency.value = 600 + Math.random() * 200;
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.start(now);
    osc.stop(now + 0.08);
};

const playSuccessSound = () => {
    if (isMuted) return;
    const now = audioContext.currentTime;

    [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        osc.start(now + i * 0.05);
        osc.stop(now + 0.5 + i * 0.05);
    });
};

muteBtn.onclick = () => {
    isMuted = !isMuted;
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
};

/* ================= CANVAS ================= */

const initializeCanvas = () => {
    const n = maze.length;
    const m = maze[0].length;

    const maxSize = Math.min(700, window.innerWidth * 0.45);
    cellSize = Math.max(6, Math.floor(maxSize / Math.max(n, m)));

    canvas.width = m * cellSize;
    canvas.height = n * cellSize;
};

const drawMaze = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rows = maze.length;
    const cols = maze[0].length;

    // background (paths)
    ctx.fillStyle = "#FFFBF8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#f5a5ca"; // wall color

    ctx.beginPath();

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {

            if (maze[i][j] === 1) {
                const x = j * cellSize;
                const y = i * cellSize;

                // add rectangle to path (NOT drawing separately)
                ctx.rect(x, y, cellSize, cellSize);
            }
        }
    }

    // ONE SINGLE FILL (THIS IS THE MAGIC)
    ctx.fill();

    // START
    ctx.fillStyle = '#B8E6D5';
    ctx.fillRect(0, 0, cellSize, cellSize);

    // END
    ctx.fillStyle = '#FFD4B3';
    ctx.fillRect(
        (cols - 1) * cellSize,
        (rows - 1) * cellSize,
        cellSize,
        cellSize
    );
};

/* ================= ANIMATION ================= */

const animateSolver = (path) => {
    let i = 0;

    const step = () => {
        if (i >= path.length) {
            playSuccessSound();
            statusText.textContent = "Path found successfully!";
            statusText.className = "status-text status-success";
            solveBtn.disabled = false;
            return;
        }

        drawMaze();

        // glow effect
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#F9F6C4";

        // visited path
        ctx.fillStyle = 'rgba(184,230,213,0.3)';
        for (let k = 0; k < i; k++) {
            const [x, y] = path[k];
            ctx.fillRect(y * cellSize, x * cellSize, cellSize, cellSize);
        }

        // current step
        const [x, y] = path[i];
        ctx.fillStyle = '#744577';
        ctx.fillRect(y * cellSize, x * cellSize, cellSize, cellSize);

        playStepSound();
        i++;

        setTimeout(step, 80);
    };

    step();
};

/* ================= BACKEND ================= */

const getMazeFromBackend = async () => {
    const res = await fetch('http://127.0.0.1:3000/solve');
    return await res.json();
};

/* ================= BUTTON ================= */

solveBtn.onclick = async () => {
    try {
        solveBtn.disabled = true;

        statusText.textContent = "Generating and solving maze...";
        statusText.className = "status-text";

        const data = await getMazeFromBackend();

        if (!data.maze || data.maze.length === 0) {
            throw new Error("Empty maze");
        }

        maze = data.maze;

        // update textarea
        mazeInput.value = maze.map(row => row.join(' ')).join('\n');

        initializeCanvas();
        drawMaze();

        if (!data.path || data.path.length === 0) {
            statusText.textContent = "No path exists for this maze!";
            statusText.className = "status-text status-error";
            solveBtn.disabled = false;
            return;
        }

        statusText.textContent = " Solving...";
        animateSolver(data.path);

    } catch (err) {
        console.error(err);
        statusText.textContent = "Backend connection failed!";
        statusText.className = "status-text status-error";
        solveBtn.disabled = false;
    }
};

/* ================= RESIZE ================= */

window.onresize = () => {
    if (maze.length) {
        initializeCanvas();
        drawMaze();
    }
};