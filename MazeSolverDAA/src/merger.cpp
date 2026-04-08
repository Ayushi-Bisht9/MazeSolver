#include "../include/merger.h"

// combine left path and right path into one complete path
void mergePaths(vector<pair<int,int>> &finalPath,
                vector<pair<int,int>> &leftPath,
                vector<pair<int,int>> &rightPath) {

    // start with left path
    finalPath = leftPath;

    // append right path at the end
    finalPath.insert(finalPath.end(), rightPath.begin(), rightPath.end());
}