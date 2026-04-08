#ifndef SOLVER_H
#define SOLVER_H

#include <vector>
using namespace std;

// check if a cell is valid and not a wall
bool isFree(vector<vector<int>> &maze, int x, int y);

// solve a small region directly when it cant be divided anymore
bool directSolve(vector<vector<int>> &maze,
                 pair<int,int> start,
                 pair<int,int> end,
                 int top, int bottom,
                 int left, int right,
                 vector<pair<int,int>> &path);

#endif