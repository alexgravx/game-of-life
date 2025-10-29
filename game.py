###########################################################################
#                                                                         #
#      "Game of life" test code, with simple graphical interface          #
#                     Created by Alexandre Gravereaux                     #
#                                                                         #
###########################################################################


# Modules importation

import sys
import os
import time
import random

# Starting grid: living cells are 1, dead cells are 0

GRID_SIZE = 15
grid = [[random.randint(0, 1) for _ in range(GRID_SIZE)] for _ in range(GRID_SIZE)]
positions = [(-1, -1), (-1, 0), (-1, +1), (0, -1), (0, +1), (+1, -1), (+1, 0), (+1, +1)]

# Evolution function. Make the grid evolve on n rounds

def display(grid):
    for i in range(GRID_SIZE - 1):
        sys.stdout.write(str(grid[i]) + '\n')
    time.sleep(0.3)
    os.system("clear")

def evolution(n):
    global grid
    
    for _ in range(n):
        new_grid = grid
        for i in range(1, GRID_SIZE - 1):
            for j in range(1, GRID_SIZE - 1):
                around_sum = sum([grid[i+k][j+l] for k,l in positions])
                # New cell is born
                if (around_sum == 3) and (grid[i][j] == 0):
                    new_grid[i][j] = 1
                    break
                # Cell dies
                if grid[i][j] == 1:
                    if (2 <= around_sum <= 3):
                        break
                    else:
                        new_grid[i][j] = 0
        
        display(new_grid)
        grid = new_grid


# Example: make the grid evolve on 10 rounds. Execute in terminal without debugging.
if __name__ == '__main__':
    evolution(30)

