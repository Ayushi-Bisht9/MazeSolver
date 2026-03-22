#include "../include/solver.h"

bool isValid(vector<vector<int>> &maze,
             vector<vector<int>> &visited,
             int x, int y) {

    int n = maze.size();
    int m = maze[0].size();

    return x >= 0 && y >= 0 && x < n && y < m &&
           maze[x][y] == 0 && visited[x][y] == 0;
}

bool dfs(vector<vector<int>> &maze,
         vector<vector<int>> &visited,
         int x, int y,
         int endX, int endY,
         vector<pair<int,int>> &path) {

    visited[x][y] = 1;
    path.push_back({x, y});

    if (x == endX && y == endY)
        return true;

    int dx[] = {0, 1, 0, -1};
    int dy[] = {1, 0, -1, 0};

    for (int i = 0; i < 4; i++) {
        int nx = x + dx[i];
        int ny = y + dy[i];

        if (isValid(maze, visited, nx, ny)) {
            if (dfs(maze, visited, nx, ny, endX, endY, path))
                return true;
        }
    }

    path.pop_back();
    return false;
}