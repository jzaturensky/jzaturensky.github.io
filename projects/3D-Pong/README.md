# Group 21 - 3D Pong

## Description
For our term project, we decided to make a three dimensional version of the classic 2D Pong game.

## Advanced Topics

- Collisions 
    - Collision detection is used to determine whether the ball has made contact with the paddles and/or walls
- Shadows
    - The ball casts a shadow as its moving
- Transparency
    - The paddles are transparent so that you can see the ball in play
- Picking/Selection
    - Move paddle with mouse


## Contributions

### James

- Created initial Pong game setup (paddles, ball, walls etc)
- Added collisions
- Added scoring
- Added AI
- Added ability to adjust game settings

### Jonathan

- Created control for player paddle
- Added textures
- Added particles to wall collisions
- Debugged and fixed shadow scaling
- Adjusted collision physics and gameplay mechanics

### Vansh

- Created shadow for ball
- Added win/lose messages
- Added sound effects
- Debugged and fixed transparency issues
- Generic gameplay optimizations

## How to Play
1. Launch the webserver by running `host.command` or `host.bat` as appropriate for the operating system
1. Click in the game to start playing
1. Click again to pause the game
1. Move the paddle with your mouse
1. Refer to the panel beneath the game for more controls
    1. a - Increase size of arena
    1. d - Restore original arena size
    1. i - Reduce ball size
    1. r - Restore ball size
    1. s - Increase ball speed
    1. t - Restore ball speed
    1. k - Toggle Difficulty (Easy, Medium, Hard, Impossible)
