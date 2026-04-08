#include "../include/utils.h"
#include <iostream>
#include <fstream>

// opens the file and reads all mazes one by one
vector<vector<vector<int>>> readAllMazes(string filename) {

    ifstream file(filename);

    if (!file.is_open()) {
        cout << "ERROR: Cannot open file\n";
        exit(1);
    }

    // first line is number of mazes
    int t;
    file >> t;

    vector<vector<vector<int>>> mazes;

    while (t--) {
        int n, m;
        file >> n >> m;

        // read the grid row by row
        vector<vector<int>> maze(n, vector<int>(m));
        for (int i = 0; i < n; i++)
            for (int j = 0; j < m; j++)
                file >> maze[i][j];

        mazes.push_back(maze);
    }

    return mazes;
}

// print maze row by row
void printMaze(vector<vector<int>> &maze) {
    for (auto &row : maze) {
        for (auto val : row)
            cout << val << " ";
        cout << endl;
    }
}