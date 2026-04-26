const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/solve', (req, res) => {

    const solver = spawn('./MazeSolver/MazeSolverDAA/solver.exe');

    let output = '';

    solver.stdout.on('data', (data) => {
        output += data.toString();
    });

    solver.stderr.on('data', (data) => {
        console.error("C++ Error:", data.toString());
    });

    solver.on('close', () => {

        try {
            const lines = output.trim().split('\n');

            const [n, m] = lines[0].split(' ').map(Number);

            let maze = [];
            let i = 1;

            // read maze
            for (let r = 0; r < n; r++) {
                maze.push(lines[i++].trim().split(' ').map(Number));
            }

            i++; // skip "PATH"

            let path = [];
            for (; i < lines.length; i++) {
                path.push(lines[i].split(' ').map(Number));
            }

            res.json({ maze, path });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Parsing failed" });
        }
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));