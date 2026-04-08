#include "../include/solver.h"

// check if cell is inside maze and not a wall
bool isFree(vector<vector<int>> &maze, int x, int y) {
    int n = maze.size();
    int m = maze[0].size();
    return x >= 0 && y >= 0 && x < n && y < m && maze[x][y] == 0;
}

// helper function that does the actual path finding inside a small region
bool directSolveUtil(vector<vector<int>> &maze,
                     int x, int y,
                     int endX, int endY,
                     int top, int bottom,
                     int left, int right,
                     vector<vector<int>> &visited,
                     vector<pair<int,int>> &path) {

    // out of maze boundary
    if (x < 0 || y < 0 || x >= (int)maze.size() || y >= (int)maze[0].size())
        return false;

    // out of the sub region we are allowed to explore
    if (x < top || x > bottom || y < left || y > right)
        return false;

    // wall or already visited this cell
    if (maze[x][y] == 1 || visited[x][y])
        return false;

    // mark as visited and add to path
    visited[x][y] = 1;
    path.push_back({x, y});

    // reached destination
    if (x == endX && y == endY) return true;

    // try all 4 directions : right, down, left, up
    int dx[] = {0, 1, 0, -1};
    int dy[] = {1, 0, -1, 0};

    for (int i = 0; i < 4; i++) {
        if (directSolveUtil(maze,
                            x + dx[i], y + dy[i],
                            endX, endY,
                            top, bottom, left, right,
                            visited, path))
            return true;
    }

    // this path didnt work so backtrack
    path.pop_back();
    visited[x][y] = 0;
    return false;
}

// called when region is too small to divide further
bool directSolve(vector<vector<int>> &maze,
                 pair<int,int> start,
                 pair<int,int> end,
                 int top, int bottom,
                 int left, int right,
                 vector<pair<int,int>> &path) {

    int n = maze.size();
    int m = maze[0].size();

    // fresh visited array for this region
    vector<vector<int>> visited(n, vector<int>(m, 0));

    return directSolveUtil(maze,
                           start.first, start.second,
                           end.first,   end.second,
                           top, bottom, left, right,
                           visited, path);
}