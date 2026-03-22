#ifndef UTILS_H
#define UTILS_H

#include <vector>
#include <string>
using namespace std;

// Read multiple mazes
vector<vector<vector<int>>> readAllMazes(string filename);

// Print maze
void printMaze(vector<vector<int>> &maze);

#endif