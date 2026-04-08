#ifndef UTILS_H
#define UTILS_H

#include <vector>
#include <string>
using namespace std;

// reads all mazes from the file
vector<vector<vector<int>>> readAllMazes(string filename);

// just prints the maze grid
void printMaze(vector<vector<int>> &maze);

#endif