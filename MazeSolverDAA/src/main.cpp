#include <iostream>
#include <ctime>
#include <cstdlib>
#include "../include/utils.h"
#include "../include/divider.h"

using namespace std;

int main() {

    // so that we get different maze each time
    srand(time(0));

    // read all mazes from file
    auto mazes = readAllMazes("data/maze.txt");

    // pick a random maze
    int index = rand() % mazes.size();
    auto maze = mazes[index];

    int n = maze.size();
    int m = maze[0].size();

    // start is always top left, end is always bottom right
    pair<int,int> start = {0, 0};
    pair<int,int> end   = {n-1, m-1};

    cout << "Selected Maze (index " << index << "):\n";
    printMaze(maze);

    vector<pair<int,int>> path;

    // try to solve using divide and conquer
    if (solveRegion(maze, 0, n-1, 0, m-1, start, end, path)) {
        cout << "\nPath Found:\n";
        for (auto &p : path)
            cout << "(" << p.first << "," << p.second << ") ";
        cout << "\n";
    } else {
        cout << "\nMaze is UNSOLVABLE\n";
    }

    return 0;
}