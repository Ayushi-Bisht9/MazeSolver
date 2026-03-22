#include "../include/utils.h"
#include <iostream>
#include <fstream>

vector<vector<vector<int>>> readAllMazes(string filename) {
    ifstream file(filename);

    if (!file.is_open()) {
        cout << "ERROR: Cannot open file -> " << filename << endl;
        exit(1);
    }

    int t;
    file >> t;

    vector<vector<vector<int>>> mazes;

    while (t--) {
        int n, m;
        file >> n >> m;

        vector<vector<int>> maze(n, vector<int>(m));

        for (int i = 0; i < n; i++)
            for (int j = 0; j < m; j++)
                file >> maze[i][j];

        mazes.push_back(maze);
    }

    return mazes;
}

void printMaze(vector<vector<int>> &maze) {
    for (auto row : maze) {
        for (auto val : row)
            cout << val << " ";
        cout << endl;
    }
}