//app.js
const { useState, useRef, useEffect } = React;

function App() {
    const [maze, setMaze] = useState([]);
    const [status, setStatus] = useState('Enter a maze and click Solve to start.');
    const [isSolving, setIsSolving] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const mountRef = useRef(null);
    const mazeInputRef = useRef(null);
    const sceneRef = useRef(null);
    const pathObjects = useRef([]);

    let path = [];

    useEffect(() => {
        if (mountRef.current && !sceneRef.current) {
            initThreeJS();
        }
    }, []);

    const initThreeJS = () => {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);
        const camera = new THREE.PerspectiveCamera(60, 650 / 520, 0.1, 1000);
        camera.position.set(12, 14, 14);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(650, 520);
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setClearColor(0x000000, 0);
        mountRef.current.appendChild(renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
        directionalLight.position.set(15, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xffb347, 0.7, 60);
        pointLight.position.set(-10, 15, -10);
        scene.add(pointLight);

        const rimLight = new THREE.PointLight(0x5dade2, 0.4, 100);
        rimLight.position.set(10, 10, -10);
        scene.add(rimLight);

        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.35;
        controls.minDistance = 6;
        controls.maxDistance = 30;
        controls.target.set(0, 0, 0);
        controls.update();

        sceneRef.current = { scene, camera, renderer, controls };

        // Add ground
        const groundGeometry = new THREE.PlaneGeometry(30, 30);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x1f3946, roughness: 0.9, metalness: 0.05 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        const grid = new THREE.GridHelper(30, 30, 0x4c6ef5, 0x22303b);
        grid.position.y = 0.01;
        scene.add(grid);

        animate();
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
    };

    const parseMaze = (input) => {
        const rows = input.split('\n').map(row => row.trim().split(/\s+/).map(cell => parseInt(cell)));
        const width = rows[0].length;
        return rows.every(row => row.length === width) ? rows : null;
    };

    const renderMaze3D = (maze) => {
        const { scene } = sceneRef.current;
        // Clear previous maze
        scene.children.slice().forEach(child => {
            if (child.userData && child.userData.maze) {
                scene.remove(child);
            }
        });
        pathObjects.current = [];

        const n = maze.length;
        const m = maze[0].length;
        const cubeSize = 1;
        const wallHeight = 1.5;

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                if (maze[i][j] === 1) {
                    const geometry = new THREE.BoxGeometry(cubeSize, wallHeight, cubeSize);
                    const material = new THREE.MeshLambertMaterial({ color: 0x34495e });
                    const cube = new THREE.Mesh(geometry, material);
                    cube.position.set(j - m/2 + 0.5, wallHeight/2, i - n/2 + 0.5);
                    cube.castShadow = true;
                    cube.receiveShadow = true;
                    cube.userData = { maze: true, type: 'wall' };
                    scene.add(cube);
                } else {
                    // Open cell - add floor
                    const geometry = new THREE.PlaneGeometry(cubeSize, cubeSize);
                    const material = new THREE.MeshLambertMaterial({ color: 0x7f8c8d, transparent: true, opacity: 0.3 });
                    const floor = new THREE.Mesh(geometry, material);
                    floor.rotation.x = -Math.PI / 2;
                    floor.position.set(j - m/2 + 0.5, 0.01, i - n/2 + 0.5);
                    floor.receiveShadow = true;
                    floor.userData = { maze: true, type: 'floor', i, j };
                    scene.add(floor);
                }
            }
        }

        // Add start and end markers
        const startGeometry = new THREE.SphereGeometry(0.3);
        const startMaterial = new THREE.MeshLambertMaterial({ color: 0x27ae60, emissive: 0x27ae60, emissiveIntensity: 0.2 });
        const startSphere = new THREE.Mesh(startGeometry, startMaterial);
        startSphere.position.set(0 - m/2 + 0.5, 0.5, 0 - n/2 + 0.5);
        startSphere.userData = { maze: true, type: 'start' };
        scene.add(startSphere);

        const endGeometry = new THREE.SphereGeometry(0.3);
        const endMaterial = new THREE.MeshLambertMaterial({ color: 0xe74c3c, emissive: 0xe74c3c, emissiveIntensity: 0.2 });
        const endSphere = new THREE.Mesh(endGeometry, endMaterial);
        endSphere.position.set((m-1) - m/2 + 0.5, 0.5, (n-1) - n/2 + 0.5);
        endSphere.userData = { maze: true, type: 'end' };
        scene.add(endSphere);
    };

    const solveMaze = (maze) => {
        path = [];
        const n = maze.length;
        const m = maze[0].length;
        const start = [0, 0];
        const end = [n-1, m-1];
        const result = solveRegion(maze, 0, n-1, 0, m-1, start, end, path, true);
        setIsSolving(false);
        if (result) {
            setStatus('Path found! Animating solution...');
            setIsAnimating(true);
            animatePath3D();
        } else {
            setStatus('No solution found.');
        }
    };

    const animatePath3D = () => {
        if (path.length === 0) return;
        const { scene } = sceneRef.current;
        let animationIndex = 0;

        const markerGeometry = new THREE.SphereGeometry(0.18, 24, 24);
        const markerMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.8 });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.castShadow = true;
        scene.add(marker);

        const animateStep = () => {
            if (animationIndex < path.length) {
                const [x, y] = path[animationIndex];
                const n = maze.length;
                const m = maze[0].length;
                const targetX = y - m/2 + 0.5;
                const targetZ = x - n/2 + 0.5;

                marker.position.set(targetX, 0.35, targetZ);

                const floor = scene.children.find(child => 
                    child.userData && child.userData.type === 'floor' && 
                    child.userData.i === x && child.userData.j === y
                );
                if (floor) {
                    floor.material.color.setHex(0xf1c40f);
                    floor.material.emissive.setHex(0xf1c40f);
                    floor.material.emissiveIntensity = 0.7;
                    pathObjects.current.push(floor);
                }

                animationIndex++;
                setTimeout(animateStep, 200);
            } else {
                scene.remove(marker);
                setStatus('Path found!');
                setIsAnimating(false);
            }
        };
        animateStep();
    };

    const handleSolve = () => {
        const input = mazeInputRef.current.value.trim();
        if (!input) {
            alert('Please enter a maze.');
            return;
        }
        const parsedMaze = parseMaze(input);
        if (!parsedMaze || parsedMaze.length === 0) {
            alert('Invalid maze format.');
            return;
        }
        setMaze(parsedMaze);
        setIsSolving(true);
        setStatus('Rendering 3D maze...');
        renderMaze3D(parsedMaze);
        setTimeout(() => {
            setStatus('Solving maze...');
            solveMaze(parsedMaze);
        }, 1000);
    };

    // Solver functions
    function isFree(maze, x, y) {
        const n = maze.length;
        const m = maze[0].length;
        if (x < 0 || y < 0 || x >= n || y >= m) return false;
        return maze[x][y] === 0;
    }

    function directSolveUtil(maze, x, y, endX, endY, top, bottom, left, right, visited, path) {
        if (x < 0 || y < 0 || x >= maze.length || y >= maze[0].length) return false;
        if (x < top || x > bottom || y < left || y > right) return false;
        if (maze[x][y] === 1) return false;
        if (visited[x][y]) return false;
        visited[x][y] = true;
        path.push([x, y]);
        if (x === endX && y === endY) return true;
        if (directSolveUtil(maze, x, y+1, endX, endY, top, bottom, left, right, visited, path)) return true;
        if (directSolveUtil(maze, x+1, y, endX, endY, top, bottom, left, right, visited, path)) return true;
        if (directSolveUtil(maze, x, y-1, endX, endY, top, bottom, left, right, visited, path)) return true;
        if (directSolveUtil(maze, x-1, y, endX, endY, top, bottom, left, right, visited, path)) return true;
        path.pop();
        return false;
    }

    function directSolve(maze, start, end, top, bottom, left, right, path) {
        const n = maze.length;
        const m = maze[0].length;
        const visited = Array.from({length: n}, () => Array(m).fill(false));
        return directSolveUtil(maze, start[0], start[1], end[0], end[1], top, bottom, left, right, visited, path);
    }

    function mergePaths(finalPath, leftPath, rightPath) {
        finalPath.push(...leftPath);
        finalPath.push(...rightPath);
    }

    function solveRegion(maze, top, bottom, left, right, start, end, path, splitByCol) {
        if (start[0] === end[0] && start[1] === end[1]) {
            if (isFree(maze, start[0], start[1])) {
                path.push(start);
                return true;
            }
            return false;
        }

        const canSplitCol = (right - left >= 1);
        const canSplitRow = (bottom - top >= 1);

        if (!canSplitCol && !canSplitRow) {
            return directSolve(maze, start, end, top, bottom, left, right, path);
        }

        let doColSplit;
        if (!canSplitCol) doColSplit = false;
        else if (!canSplitRow) doColSplit = true;
        else doColSplit = splitByCol;

        if (doColSplit) {
            const mid = Math.floor((left + right) / 2);
            if (start[1] > mid) {
                return solveRegion(maze, top, bottom, mid+1, right, start, end, path, false);
            }
            if (end[1] <= mid) {
                return solveRegion(maze, top, bottom, left, mid, start, end, path, false);
            }
            for (let row = top; row <= bottom; row++) {
                const leftExit = [row, mid];
                const rightEntry = [row, mid + 1];
                if (!isFree(maze, row, mid) || !isFree(maze, row, mid+1)) continue;
                const leftPath = [];
                const rightPath = [];
                const leftOk = solveRegion(maze, top, bottom, left, mid, start, leftExit, leftPath, false);
                if (!leftOk) continue;
                const rightOk = solveRegion(maze, top, bottom, mid+1, right, rightEntry, end, rightPath, false);
                if (rightOk) {
                    mergePaths(path, leftPath, rightPath);
                    return true;
                }
            }
        } else {
            const mid = Math.floor((top + bottom) / 2);
            if (start[0] > mid) {
                return solveRegion(maze, mid+1, bottom, left, right, start, end, path, true);
            }
            if (end[0] <= mid) {
                return solveRegion(maze, top, mid, left, right, start, end, path, true);
            }
            for (let col = left; col <= right; col++) {
                const topExit = [mid, col];
                const bottomEntry = [mid + 1, col];
                if (!isFree(maze, mid, col) || !isFree(maze, mid+1, col)) continue;
                const topPath = [];
                const bottomPath = [];
                const topOk = solveRegion(maze, top, mid, left, right, start, topExit, topPath, true);
                if (!topOk) continue;
                const bottomOk = solveRegion(maze, mid+1, bottom, left, right, bottomEntry, end, bottomPath, true);
                if (bottomOk) {
                    mergePaths(path, topPath, bottomPath);
                    return true;
                }
            }
        }
        return false;
    }

    return (
        <div className="bg-white bg-opacity-95 rounded-3xl p-8 max-w-5xl w-full text-center shadow-2xl transform perspective-1000 rotate-x-2 hover:rotate-x-0 transition-all duration-500">
            <h1 className="text-5xl font-bold text-gray-800 mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
                3D Maze Solver
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="animate-slide-in-left">
                    <label className="block mb-4 text-lg font-semibold text-gray-700">Enter your maze:</label>
                    <textarea
                        ref={mazeInputRef}
                        className="w-full p-4 border-2 border-gray-300 rounded-xl font-mono text-sm resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 shadow-inner"
                        rows="10"
                        defaultValue="0 0 0 1 0
0 1 0 1 0
0 1 0 0 0
1 0 0 1 0
0 0 1 0 0"
                    ></textarea>
                    <button
                        onClick={handleSolve}
                        disabled={isSolving || isAnimating}
                        className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSolving ? 'Solving...' : 'Solve Maze'}
                    </button>
                </div>
                <div className="animate-slide-in-right">
                    <div ref={mountRef} className="w-full h-96 bg-gray-900 rounded-3xl shadow-2xl border-4 border-blue-800 maze-scene"></div>
                </div>
            </div>
            <div className="mt-8 animate-fade-in">
                <p className={`text-xl font-bold ${isSolving ? 'text-blue-600 animate-bounce' : 'text-gray-600'}`}>
                    {status}
                </p>
            </div>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));