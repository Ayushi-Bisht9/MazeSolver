#ifndef DIVIDER_H
#define DIVIDER_H

#include <vector>
using namespace std;

// this function divides maze into parts and solves each part
bool solveRegion(vector<vector<int>> &maze,
                 int top, int bottom,
                 int left, int right,
                 pair<int,int> start,
                 pair<int,int> end,
                 vector<pair<int,int>> &path,
                 bool splitByCol = true);

#endif