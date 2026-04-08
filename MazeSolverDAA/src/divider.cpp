#include "../include/divider.h"
#include "../include/solver.h"
#include "../include/merger.h"

// main divide and conquer function
// we keep splitting the maze into two halves until we cant split anymore
// then we try to connect the two halves through a crossing point
bool solveRegion(vector<vector<int>> &maze,
                 int top, int bottom,
                 int left, int right,
                 pair<int,int> start,
                 pair<int,int> end,
                 vector<pair<int,int>> &path,
                 bool splitByCol) {

    // if start and end are same cell we are already done
    if (start == end) {
        if (isFree(maze, start.first, start.second)) {
            path.push_back(start);
            return true;
        }
        return false;
    }

    // check if we can still split in either direction
    bool canSplitCol = (right - left >= 1);
    bool canSplitRow = (bottom - top >= 1);

    // if region is too small to split just solve it directly
    if (!canSplitCol && !canSplitRow) {
        return directSolve(maze, start, end, top, bottom, left, right, path);
    }

    // decide which direction to split
    bool doColSplit;
    if      (!canSplitCol) doColSplit = false;  // cant split col so split row
    else if (!canSplitRow) doColSplit = true;   // cant split row so split col
    else                   doColSplit = splitByCol; // alternate each time

    if (doColSplit) {

        // splitting left and right
        int mid = (left + right) / 2;

        // if start is already on right side no need to cross
        if (start.second > mid) {
            return solveRegion(maze, top, bottom, mid+1, right,
                               start, end, path, false);
        }

        // if end is already on left side no need to cross
        if (end.second <= mid) {
            return solveRegion(maze, top, bottom, left, mid,
                               start, end, path, false);
        }

        // try each row as a possible crossing point between left and right
        for (int row = top; row <= bottom; row++) {

            // last cell of left half
            pair<int,int> leftExit   = {row, mid};
            // first cell of right half
            pair<int,int> rightEntry = {row, mid + 1};

            // both cells must be free to cross here
            if (!isFree(maze, leftExit.first,   leftExit.second))   continue;
            if (!isFree(maze, rightEntry.first, rightEntry.second))  continue;

            vector<pair<int,int>> leftPath, rightPath;

            // try to solve left half from start to crossing point
            bool leftOk = solveRegion(maze,
                                      top, bottom, left, mid,
                                      start, leftExit,
                                      leftPath, false);

            // if left half has no path try next crossing point
            if (!leftOk) continue;

            // try to solve right half from crossing point to end
            bool rightOk = solveRegion(maze,
                                       top, bottom, mid+1, right,
                                       rightEntry, end,
                                       rightPath, false);

            // if both halves solved merge and return
            if (rightOk) {
                mergePaths(path, leftPath, rightPath);
                return true;
            }

            // right half failed so backtrack and try next crossing point
        }

    } else {

        // splitting top and bottom
        int mid = (top + bottom) / 2;

        // if start is already in bottom half no need to cross
        if (start.first > mid) {
            return solveRegion(maze, mid+1, bottom, left, right,
                               start, end, path, true);
        }

        // if end is already in top half no need to cross
        if (end.first <= mid) {
            return solveRegion(maze, top, mid, left, right,
                               start, end, path, true);
        }

        // try each column as a possible crossing point between top and bottom
        for (int col = left; col <= right; col++) {

            // last cell of top half
            pair<int,int> topExit     = {mid,     col};
            // first cell of bottom half
            pair<int,int> bottomEntry = {mid + 1, col};

            // both cells must be free to cross here
            if (!isFree(maze, topExit.first,     topExit.second))    continue;
            if (!isFree(maze, bottomEntry.first, bottomEntry.second)) continue;

            vector<pair<int,int>> topPath, bottomPath;

            // try to solve top half from start to crossing point
            bool topOk = solveRegion(maze,
                                     top, mid, left, right,
                                     start, topExit,
                                     topPath, true);

            // if top half has no path try next crossing point
            if (!topOk) continue;

            // try to solve bottom half from crossing point to end
            bool bottomOk = solveRegion(maze,
                                        mid+1, bottom, left, right,
                                        bottomEntry, end,
                                        bottomPath, true);

            // if both halves solved merge and return
            if (bottomOk) {
                mergePaths(path, topPath, bottomPath);
                return true;
            }

            // bottom half failed so backtrack and try next crossing point
        }
    }

    // no crossing point worked so this region has no path
    return false;
}