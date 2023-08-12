# Teeny Tiny Two Dee Engine

A teeny tiny 2d template written in TypeScript that uses Electron Forge for running on the desktop. I'm not sure this is particularly compelling, but it's a familiar way for me to quickly build simple projects for game jams and other ideas. If it helps someone else, that's cool. :-)

Example screen here: `./src/screens/mainGameScreen.ts` if you'd like to play around with the project this shows off setting up the ECS and rending using ray casting. The Teeny Tiny Two Dee Engine is the basis of another currently closed source game. The `lib` project from the game will slowly trickle back out into this project.

#### Features

- [x] GameLoop and Input management
- [x] Audio
- [x] Rendering
  - 2d Tiling
  - Ray Casting
- [x] Event Bus
- [x] Simple Random helpers utilities
- [x] Simple logger
- [x] Entity Component System (ECS) 

### To do / In progress
- [ ] UI Widgets
  - Window
  - Text Input
  - Label
  - Panels
  - Image Button
  - Button
  - Progress bar

### Screens

Everything is organized around the concept of a  `screen` a screen has the following functions:

1. init: A function called during initiation of the class 
2. onEnter: A function called every time you return to the screen from another screen
3. onExit: A function called every time to leave the screen for another screen
4. keyboad: A function for all your keyboard handling
5. mouseClick: A function for processing all mouse click events
6. mouseMove: A function for processing all mouse move events
7. logicLoop: A function for process all your game's logic
8. renderLoop: A function for process all your game's rendering


### Game Loop

1. Execute current game screen logicLoop
2. Execute an global logic
3. Clear screen
4. Execute current game screen renderLoop
5. Go to 1

### Building

1. Type: `npm run make`

### Running

1. Type: `npm run start`

### Credit

I ported the Javascript ray caster from https://github.com/almushel/raycast-demo to Typescript and cleaned up the code to make it more reusable. Ported code is here: 
src/lib/rendering/rayCaster