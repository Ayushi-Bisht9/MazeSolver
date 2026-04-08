#ifndef MERGER_H
#define MERGER_H

#include <vector>
using namespace std;

// just combines two paths into one final path
void mergePaths(vector<pair<int,int>> &finalPath,
                vector<pair<int,int>> &leftPath,
                vector<pair<int,int>> &rightPath);

#endif