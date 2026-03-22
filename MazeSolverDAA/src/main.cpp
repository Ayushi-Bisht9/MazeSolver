#include <iostream>
#include <ctime>
#include <cstdlib>
#include "../include/utils.h"
#include "../include/solver.h"

using namespace std;

int main() {
    srand(time(0));

    // Read all mazes from file
    auto mazes = readAllMazes("data/maze.txt");

    // Pick random maze
    int index = rand() % mazes.size();
    auto maze = mazes[index];

    int n = maze.size();
    int m = maze[0].size();

    // Fixed start & end
    int startX = 0, startY = 0;
    int endX = n - 1, endY = m - 1;

    cout << "Selected Maze:\n";
    printMaze(maze);

    vector<vector<int>> visited(n, vector<int>(m, 0));
    vector<pair<int,int>> path;

    if (dfs(maze, visited, startX, startY, endX, endY, path)) {
        cout << "\nPath Found:\n";
        for (auto p : path)
            cout << "(" << p.first << "," << p.second << ") ";
    } else {
        cout << "\nMaze is UNSOLVABLE\n";
    }

    return 0;
}