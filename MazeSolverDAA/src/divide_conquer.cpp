#include "../include/divide_conquer.h"

bool solveRegion(vector<vector<int>> &maze,
                 int top, int bottom,
                 int left, int right) {

    if (top > bottom || left > right)
        return false;

    if (top == bottom && left == right)
        return maze[top][left] == 0;

    int midRow = (top + bottom) / 2;
    int midCol = (left + right) / 2;

    bool a = solveRegion(maze, top, midRow, left, midCol);
    bool b = solveRegion(maze, top, midRow, midCol + 1, right);
    bool c = solveRegion(maze, midRow + 1, bottom, left, midCol);
    bool d = solveRegion(maze, midRow + 1, bottom, midCol + 1, right);

    return a || b || c || d;
}