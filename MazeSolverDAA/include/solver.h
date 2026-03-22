#ifndef SOLVER_H
#define SOLVER_H

#include <vector>
using namespace std;

bool dfs(vector<vector<int>> &maze,
         vector<vector<int>> &visited,
         int x, int y,
         int endX, int endY,
         vector<pair<int,int>> &path);

#endif