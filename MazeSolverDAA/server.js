const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

app.get('/solve', (req, res) => {

    // BULLETPROOF PATH
    const solver = spawn(
        path.join(__dirname, 'solver.exe')
    );

    let output = '';

    solver.stdout.on('data', (data) => {
        output += data.toString();
    });

    solver.stderr.on('data', (data) => {
        console.error("C++ Error:", data.toString());
    });

    solver.on('error', (err) => {
        console.error("Spawn failed:", err);
        res.status(500).json({ error: "Solver failed" });
    });

    solver.on('close', () => {
        try {
            const lines = output.trim().split('\n');

            // SAFETY CHECK
            if (lines.length < 2) {
                return res.json({ maze: [], path: [] });
            }

            const [n, m] = lines[0].split(' ').map(Number);

            let maze = [];
            let i = 1;

            for (let r = 0; r < n; r++) {
                maze.push(lines[i++].trim().split(' ').map(Number));
            }

            i++; // skip PATH

            let pathData = [];
            for (; i < lines.length; i++) {
                pathData.push(lines[i].split(' ').map(Number));
            }

            res.json({ maze, path: pathData });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Parsing failed" });
        }
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));