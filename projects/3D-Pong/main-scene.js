window.PongScene = window.classes.PongScene = class PongScene extends Scene_Component {
    constructor(context, control_box) {
        super(context, control_box);

//         if (!context.globals.has_controls)
//            context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

        context.globals.graphics_state.camera_transform = Mat4.look_at(Vec.of(0, 0, 6), Vec.of(0, 0, 0), Vec.of(0, 1, 0)).times(Mat4.translation([0,0,-5]));

        const r = context.width / context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

        this.context = context;

        // *** Mouse controls: ***
        this.mouse = {"from_center": Vec.of(0, 0)};                           // Measure mouse steering, for rotating the flyaround camera:
        this.mouse_position = (e, rect = this.context.canvas.getBoundingClientRect()) =>
            Vec.of(e.clientX - (rect.left + rect.right) / 2, e.clientY - (rect.bottom + rect.top) / 2);

        this.context.canvas.addEventListener("mousemove", e => this.setMousePosition(e));
        this.context.canvas.addEventListener("click", e => this.onMouseClick(e));

        const shapes = {
            'box': new Cube(),                    // multiple cubes.  Don't define more than one blueprint for the
            'ball': new Subdivision_Sphere(8),
        };
        this.submit_shapes(context, shapes);
        //these determine the current movement
        //the current score
        this.playerScore = 0;
        this.opponentScore = 0;
        //the box is of size [Size x Size x Length]
        this.arenaSize = 5;
        this.arenaLength = 30;
        this.ballSize = .5;
        
        this.messageShowing = 3;
   

        this.difficultyName = ["Easy", "Medium", "Hard", "Impossible"];
        this.difficultySpeed = [.03, .075, .125, .3];
        this.difficulty = 1;

        this.paused = true;

        this.boing = new Audio('assets/pong.mp3');

        this.particles = [];

        this.materials = {
            plastic: context.get_instance(Phong_Shader).material(Color.of(.9, .5, .9, 1), {
                ambient: .4,
                diffusivity: .4,
                specularity: .6
            }),
            glass: context.get_instance(Phong_Shader).material(Color.of(.5, .5, 1, .7), {
                ambient: .4,
                specularity: .4
            }),
            lose: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), {
                ambient: 1,
                texture: context.get_instance("assets/lose.png")
            }),
            win: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), {
                ambient: 1,
                texture: context.get_instance("assets/win.gif")
            }),
            start: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), {
                ambient: 1,
                texture: context.get_instance("assets/start.gif")
            }),
            wood1: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), {
                ambient: 1,
                texture: context.get_instance("assets/wood1.jpg")
            }),
            wood2: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), {
                ambient: 1,
                texture: context.get_instance("assets/wood2.jpg")
            })
        };


        //The player racket
        this.player = Mat4.scale([1, 1, .02]);
        //opponenet racket
        this.opponent = Mat4.translation([0, 0, -this.arenaLength]).times(Mat4.scale([1, 1, .02]));
        this.puck = Mat4.translation([0, 0, -this.arenaLength/2]).times(Mat4.scale([this.ballSize, this.ballSize, this.ballSize]));
        //the current direction of the puck
        this.startingSpeed = 5;
        this.ballSpeed = this.startingSpeed;
        this.direction = [0, 0, .1];
        //the four walls
        this.downwall = Mat4.translation([0, -this.arenaSize, -this.arenaLength / 2]).times(Mat4.scale([this.arenaLength / 2, .01, this.arenaLength]));
        this.upwall = Mat4.translation([0, this.arenaSize, -this.arenaLength / 2]).times(Mat4.scale([this.arenaLength / 2, .01, this.arenaLength]));
        this.rightwall = Mat4.translation([this.arenaSize, 0, -this.arenaLength / 2]).times(Mat4.scale([.01, this.arenaLength / 2, this.arenaLength]));
        this.leftwall = Mat4.translation([-this.arenaSize, 0, -this.arenaLength / 2]).times(Mat4.scale([.01, this.arenaLength / 2, this.arenaLength]));
    }

    setMousePosition(e) {
        e.preventDefault();
        this.mouse.from_center = this.mouse_position(e);
    }

    onMouseClick(e) {
        e.preventDefault();
        this.paused = !this.paused;
        if (this.messageShowing !== 0) {
            this.messageShowing = 0;
        }
    }

    initialize() {
        this.puck = Mat4.translation([0, 0, -this.arenaLength/2]).times(Mat4.scale([this.ballSize, this.ballSize, this.ballSize]));
        this.opponent = Mat4.translation([0, 0, -this.arenaLength]).times(Mat4.scale([1, 1, .02]));
        this.downwall = Mat4.translation([0, -this.arenaSize, -this.arenaLength / 2]).times(Mat4.scale([this.arenaLength / 2, .01, this.arenaLength]));
        this.upwall = Mat4.translation([0, this.arenaSize, -this.arenaLength / 2]).times(Mat4.scale([this.arenaLength / 2, .01, this.arenaLength]));
        this.rightwall = Mat4.translation([this.arenaSize, 0, -this.arenaLength / 2]).times(Mat4.scale([.01, this.arenaLength / 2, this.arenaLength]));
        this.leftwall = Mat4.translation([-this.arenaSize, 0, -this.arenaLength / 2]).times(Mat4.scale([.01, this.arenaLength / 2, this.arenaLength]));
        this.direction = [0, 0, .1];
        this.playerScore = 0;
        this.opponentScore = 0;
        this.ballSpeed = this.startingSpeed;
        this.messageShowing = 3;
        this.paused = true;
    }

    make_control_panel() {
        this.key_triggered_button("Increase play depth", ["a"], () => {
            this.arenaLength += 2;
            this.initialize();
        });
        this.key_triggered_button("Restore original depth", ["d"], () => {
            this.arenaLength = 30;
            this.initialize();
        });
        this.new_line();
        this.live_string( box => box.textContent = "Depth: " + this.arenaLength.toFixed(2) );
        this.new_line(); this.new_line();
        this.key_triggered_button("Reduce ball size", ["i"], () => {
            this.ballSize /= 2;
            this.initialize();
        });
        this.key_triggered_button("Restore ball size", ["r"], () => {
            this.ballSize = .5;
            this.initialize();
        });
        this.new_line();
        this.live_string( box => box.textContent = "Ball size: " + this.ballSize.toFixed(2) );
        this.new_line(); this.new_line();
        this.key_triggered_button("Increase ball speed", ["s"], () => {
            this.startingSpeed++;
            this.initialize();
        });
        this.key_triggered_button("Restore ball speed", ["t"], () => {
            this.startingSpeed = 5;
            this.initialize();
        });
        this.new_line();
        this.live_string( box => box.textContent = "Initial ball speed: " + this.startingSpeed.toFixed(2) );
        this.new_line();
        this.live_string( box => box.textContent = "Current ball speed: " + this.ballSpeed.toFixed(2) );
        this.new_line(); this.new_line();
        this.key_triggered_button("Toggle difficulty (Easy, Medium, Hard, Impossible)", ["k"], () => {
            this.difficulty += 1;
            if (this.difficulty === 4)
                this.difficulty = 0;
            this.initialize();
        });
        this.new_line();
        this.live_string( box => box.textContent = "Difficulty: " + this.difficultyName[this.difficulty] );
    }


    draw_score(graphics_state) {
        //DRAWS Boxes representing the score
        //player score on left, opponent on right
        let model_transform = Mat4.translation([-this.arenaSize, this.arenaSize - 1, -this.arenaLength / 2]).times(Mat4.scale([.2, .2, .2]));
        for (let i = 0; i < this.playerScore; i++) {
            model_transform = model_transform.times(Mat4.translation([0, -4, 0]));
            this.shapes.box.draw(graphics_state, model_transform, this.materials.glass.override({color: Color.of(0, 0, 1, 1)}));
        }

        model_transform = Mat4.translation([this.arenaSize, this.arenaSize - 1, -this.arenaLength / 2]).times(Mat4.scale([.2, .2, .2]));
        for (let i = 0; i < this.opponentScore; i++) {
            model_transform = model_transform.times(Mat4.translation([0, -4, 0]));
            this.shapes.box.draw(graphics_state, model_transform, this.materials.glass.override({color: Color.of(1, 0, 0, 1)}));
        }
    }

    spawnParticles(graphics_state){
        for (var i = 0; i < 10; i++) {
            var particle = this.puck.times(Mat4.scale([.1, .1, .1]));
            this.particles.push({time: graphics_state.animation_time/1000, particle: particle});
        }
    }

    updateParticles(graphics_state){
        this.particles = this.particles.filter(function(value, index, arr){
            return graphics_state.animation_time/1000 < value.time + 0.2;
        })
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].particle = this.particles[i].particle.times(Mat4.translation([Math.floor(Math.random() * 2), Math.floor(Math.random() * 2), Math.floor(Math.random() * 2)]))
            this.shapes.box.draw(graphics_state, this.particles[i].particle, this.materials.glass.override({color: Color.of(0.1, 0.1, 0.1, .5)}));
        }
    }

    check_collision(racket) {
        //Determines if the player hits the puck and what angle it should return at
        let maxX = racket[0][3] + 1;
        let minX = racket[0][3] - 1;
        let maxY = racket[1][3] + 1;
        let minY = racket[1][3] - 1;
        let Ballx = this.puck[0][3];
        let Bally = this.puck[1][3];
        let pass = 1;

        if (Ballx - this.ballSize < maxX && Ballx + this.ballSize > minX) {
            this.direction[0] = .02 * (Ballx - racket[0][3]);
        }
        else {
            pass = 0;
        }

        if (Bally - this.ballSize < maxY && Bally + this.ballSize > minY) {
            this.direction[1] = .02 * (Bally - racket[1][3]);
        }
        else {
            pass = 0
        }
        return pass;
    }
    move_ball(){
        let adjustedSpeed = this.ballSpeed / (this.ballSize * 2);
        this.puck = this.puck.times(Mat4.translation([this.direction[0] * adjustedSpeed, this.direction[1]*adjustedSpeed, this.direction[2] *adjustedSpeed]));
    }
    display(graphics_state) {

        graphics_state.lights = [new Light(Vec.of(0, (this.upwall[1][3] - this.downwall[1][3]), -this.arenaLength/2, 1), Color.of(1, 1, 1, 1), 100000)];
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;
        let mouseScalar = 85;
        this.player = Mat4.scale([1, 1, .02]).times(Mat4.translation([this.mouse.from_center[0] / mouseScalar, -this.mouse.from_center[1] / mouseScalar, 0]));

        if(!this.paused){

            this.updateParticles(graphics_state);
        
            this.move_ball();
            //CHECK IF PLAYER HITS THE BALL
            if (this.puck[2][3] > -this.ballSize) {
                let pass = this.check_collision(this.player);

                if (pass) {
                    this.direction[2] = -.1;
                    this.ballSpeed *= 1.1;
                    this.move_ball();
                    this.boing.play();
                } else {
                    this.opponentScore += 1;
                    this.direction = [0, 0, .1];
                    this.opponent = Mat4.translation([0, 0, -this.arenaLength]).times(Mat4.scale([1, 1, .02]));
                    this.paused = true;
                    this.puck = Mat4.translation([0, 0, -this.arenaLength/2]).times(Mat4.scale([this.ballSize, this.ballSize, this.ballSize]));
                    this.ballSpeed = this.startingSpeed;
                }

            }

            //AI. Set the speed to ballSpeed for the perfect ai
            if (this.puck[0][3] - 1 > this.opponent[0][3]) {
                this.opponent = this.opponent.times(Mat4.translation([this.difficultySpeed[this.difficulty], 0, 0]))
            } else if (this.puck[0][3] + 1 < this.opponent[0][3]) {
                this.opponent = this.opponent.times(Mat4.translation([-this.difficultySpeed[this.difficulty], 0, 0]))
            }

            if (this.puck[1][3] - 1 > this.opponent[1][3]) {
                this.opponent = this.opponent.times(Mat4.translation([0, this.difficultySpeed[this.difficulty], 0]))
            } else if (this.puck[1][3] + 1 < this.opponent[1][3]) {
                this.opponent = this.opponent.times(Mat4.translation([0, -this.difficultySpeed[this.difficulty], 0]))
            }

            //CHECK IF OPPONENT HITS THE BALL
            if (this.puck[2][3] < this.ballSize + -this.arenaLength) {
                let pass = this.check_collision(this.opponent);

                if (pass) {

                    this.direction[2] = .1;
                    this.ballSpeed *= 1.1;
                    this.move_ball();
                    this.boing.play();
                } else {
                    this.playerScore += 1;
                    this.direction = [0, 0, -.1];
                    this.opponent = Mat4.translation([0, 0, -this.arenaLength]).times(Mat4.scale([1, 1, .02]));
                    this.paused = true;
                    this.puck = Mat4.translation([0, 0, -this.arenaLength/2]).times(Mat4.scale([this.ballSize, this.ballSize, this.ballSize]));
                    this.ballSpeed = this.startingSpeed;

                }


            }

            //CHECK IF BALL HITS THE WALL

            if (this.puck[0][3] + this.ballSize > this.arenaSize || this.puck[0][3] - this.ballSize < -this.arenaSize) {
                this.direction[0] = 0 - this.direction[0];
                //this is to stop the ball from sliding along the wall without moving
                if(Math.abs(this.direction[0]) < .05 ) {
                    this.puck[0][3] = -Math.sign(this.puck[0][3])* (this.ballSize - this.arenaSize+.03);
                }
                this.boing.play();
                this.spawnParticles(graphics_state);
            }
            if (this.puck[1][3] - this.ballSize < -this.arenaSize || this.puck[1][3] + this.ballSize > this.arenaSize) {
                this.direction[1] = 0 - this.direction[1];
                //this is to stop the ball from sliding along the wall without moving
                if(Math.abs(this.direction[1]) < .05 ) {
                    this.puck[1][3] = -Math.sign(this.puck[1][3])* (this.ballSize - this.arenaSize+.03);
                }
                this.boing.play();
                this.spawnParticles(graphics_state);
            }


        
        }


        if (this.opponentScore === 5) {
            this.messageShowing = 1;
            this.opponentScore = 0;
            this.playerScore = 0;
        } else if (this.playerScore === 5) {
            this.messageShowing = 2;
            this.opponentScore = 0;
            this.playerScore = 0;
        }

        if (this.messageShowing === 1) {
            this.shapes.box.draw(graphics_state, Mat4.identity().times(Mat4.translation([0,0,8])), this.materials.lose);
        } else if (this.messageShowing === 2) {
            this.shapes.box.draw(graphics_state, Mat4.identity().times(Mat4.translation([0,0,8])), this.materials.win);
        } else if(this.messageShowing === 3){
            this.shapes.box.draw(graphics_state, Mat4.identity().times(Mat4.translation([0,0,8])), this.materials.start);
        }


        //SHADOW
        var delta = this.puck[1][3];
        delta += ((this.upwall[1][3] - this.downwall[1][3])/2 - this.ballSize);
        delta /= 10;

        // let z = this.puck[2][3];
        // let depthScalar = z/(this.arenaLength/4);
        //
        // let y = this.puck[0][3];
        // let widthScalar = y/(this.arenaLength/4);
        let widthScalar = 0;
        let depthScalar = 0;

        this.shadow = this.puck.times(Mat4.scale([1+delta+Math.abs(2*widthScalar),(1/100),1+delta+Math.abs(2*depthScalar)])).times(Mat4.translation([widthScalar/4,0,depthScalar/4]));

        this.shadow[1][3] = -this.arenaLength + 5.1 + (this.arenaLength - 10);

        this.shapes.box.draw(graphics_state, this.opponent, this.materials.glass.override({color: Color.of(1, 0, 0, .5)}));
        this.shapes.ball.draw(graphics_state, this.puck, this.materials.plastic.override({color: Color.of(1, 1, 1, 1)}));
        if (!this.messageShowing) this.shapes.ball.draw(graphics_state, this.shadow, this.materials.plastic.override({color: Color.of(.5, .5, .5, 0.1)}));
        this.shapes.box.draw(graphics_state, this.player, this.materials.glass.override({color: Color.of(0, 0, 1, .5)}));
        this.shapes.box.draw(graphics_state, this.downwall, this.materials.wood2);
        this.shapes.box.draw(graphics_state, this.upwall, this.materials.wood2);
        this.shapes.box.draw(graphics_state, this.rightwall, this.materials.wood1);
        this.shapes.box.draw(graphics_state, this.leftwall, this.materials.wood1);

        this.draw_score(graphics_state);
    }
};
