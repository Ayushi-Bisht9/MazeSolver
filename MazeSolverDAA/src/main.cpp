#include <iostream>
#include <vector>
#include <ctime>
#include <cstdlib>
#include "../include/utils.h"
#include "../include/divider.h"

using namespace std;

int main() {

    srand(time(0));

    //  CORRECT PATH
    auto mazes = readAllMazes("data/maze.txt");

    //  HANDLE EMPTY SAFELY
    if (mazes.empty()) {
        cout << "0 0\n";
        cout << "PATH\n";
        return 0;
    }

    int index = rand() % mazes.size();
    auto maze = mazes[index];

    int n = maze.size();
    int m = maze[0].size();

    vector<pair<int,int>> path;

    bool ok = solveRegion(maze, 0, n-1, 0, m-1, {0,0}, {n-1,m-1}, path);

    //  ALWAYS PRINT
    cout << n << " " << m << "\n";

    for (auto &row : maze) {
        for (auto val : row)
            cout << val << " ";
        cout << "\n";
    }

    cout << "PATH\n";

    if (ok) {
        for (auto &p : path)
            cout << p.first << " " << p.second << "\n";
    }

    return 0;
}