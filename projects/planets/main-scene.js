window.Assignment_Two_Test = window.classes.Assignment_Two_Test =
class Assignment_Two_Test extends Scene_Component
  { constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 

        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,10,20 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );
        this.initial_camera_location = Mat4.inverse( context.globals.graphics_state.camera_transform );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

        const shapes = { torus:  new Torus( 15, 15 ),
                         torus2: new ( Torus.prototype.make_flat_shaded_version() )( 15, 15 ),
                         sun: new Subdivision_Sphere( 4 ),
                         planet1: new ( Subdivision_Sphere.prototype.make_flat_shaded_version() )( 2 ),
                         planet2: new Subdivision_Sphere( 3 ),
                         planet3: new Subdivision_Sphere( 4 ), 
                         planet4: new Subdivision_Sphere( 4 ),
                         moon: new ( Subdivision_Sphere.prototype.make_flat_shaded_version() )( 1 ),
                         planet5: new ( Grid_Sphere.prototype.make_flat_shaded_version() )( 10, 10, 10 )

                                // TODO:  Fill in as many additional shape instances as needed in this key/value table.
                                //        (Requirement 1)
                       }
        this.submit_shapes( context, shapes );
                                     
                                     // Make some Material objects available to you:
        this.materials =
          { test:     context.get_instance( Phong_Shader ).material( Color.of( 1,1,1,1 ), { ambient: .2 } ),
            ring:     context.get_instance( Ring_Shader  ).material(),
            sun:      context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ), { ambient: 1 } ),
            planet1:  context.get_instance( Phong_Shader ).material( Color.of( 0.5,0.5,0.5,1 ), { diffusivity: 1 } ),
            planet2:  context.get_instance( Phong_Shader ).material( Color.of( 0,1,0.75,1 ), { diffusivity: .3, specularity: 1 } ),
            planet3:  context.get_instance( Phong_Shader ).material( Color.of( 0.75,0.5,0.25,1 ), { diffusivity: 1, specularity: 1 } ),
            planet4:  context.get_instance( Phong_Shader ).material( Color.of( 0.25,0.25,1,1 ), { specularity: .7 } ),
            moon:     context.get_instance( Phong_Shader ).material( Color.of( 0,0.1,0.25,1 ), { specularity: .7 } ),
            planet5:  context.get_instance( Phong_Shader ).material( Color.of( 0.75,0.75,0.75,1 ), { diffusivity: 1, specularity: 1 } )

                                // TODO:  Fill in as many additional material objects as needed in this key/value table.
                                //        (Requirement 1)
          }

        this.lights = [ new Light( Vec.of( 5,-10,5,1 ), Color.of( 0, 1, 1, 1 ), 1000 ) ];

        this.p2Gouraud = false;
        setInterval(() => {
          this.p2Gouraud = !this.p2Gouraud;
          if (this.p2Gouraud) {
            this.materials.planet2.override({gouraud: 1});
          } else {
            this.materials.planet2.override({gouraud: undefined});
          }
        }, 1000);
      }

    make_control_panel()            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
      { this.key_triggered_button( "View solar system",  [ "0" ], () => this.attached = () => this.initial_camera_location );
        this.new_line();
        this.key_triggered_button( "Attach to planet 1", [ "1" ], () => this.attached = () => this.planet_1 );
        this.key_triggered_button( "Attach to planet 2", [ "2" ], () => this.attached = () => this.planet_2 ); this.new_line();
        this.key_triggered_button( "Attach to planet 3", [ "3" ], () => this.attached = () => this.planet_3 );
        this.key_triggered_button( "Attach to planet 4", [ "4" ], () => this.attached = () => this.planet_4 ); this.new_line();
        this.key_triggered_button( "Attach to planet 5", [ "5" ], () => this.attached = () => this.planet_5 );
        this.key_triggered_button( "Attach to moon",     [ "m" ], () => this.attached = () => this.moon     );
      }

    drawSun( graphics_state ) {
       var s = Math.sin(graphics_state.animation_time/800)+2;
       var c = 0.5*Math.sin(graphics_state.animation_time/800);

       let model_transform = Mat4.identity();
       model_transform = model_transform.times( Mat4.scale([ s,s,s ]) );
       
       this.materials.sun = this.materials.sun.override({color: Color.of(0.5+c,0,0.5-c,1)});
       this.shapes.sun.draw ( graphics_state, model_transform, this.materials.sun );

       graphics_state.lights = [ new Light( Vec.of( 0,0,0,1 ), Color.of(0.5+c,0,0.5-c,1), 10**s ) ];
    }

    drawPlanet1( graphics_state ) {
        var x = Math.cos(graphics_state.animation_time/800);
        var y = Math.sin(graphics_state.animation_time/800);

        let model_transform = Mat4.identity();
        model_transform = model_transform.times( Mat4.translation([ 5*y,0,5*x ]) );
        model_transform = model_transform.times( Mat4.rotation( graphics_state.animation_time/400, Vec.of( 0,1,0 ) ) );
        
        this.shapes.planet1.draw ( graphics_state, model_transform, this.materials.planet1 );

        this.planet_1 = model_transform;
    }

    drawPlanet2( graphics_state ) {
        var x = Math.cos(graphics_state.animation_time/900);
        var y = Math.sin(graphics_state.animation_time/900);

        let model_transform = Mat4.identity();
        model_transform = model_transform.times( Mat4.translation([ 8*y,0,8*x ]) );
        model_transform = model_transform.times( Mat4.rotation( graphics_state.animation_time/500, Vec.of( 0,1,0 ) ) );

        this.shapes.planet2.draw ( graphics_state, model_transform, this.materials.planet2 );

        this.planet_2 = model_transform;
    }

    drawPlanet3( graphics_state ) {
        var x = Math.cos(graphics_state.animation_time/1000);
        var y = Math.sin(graphics_state.animation_time/1000);

        let model_transform = Mat4.identity();
        model_transform = model_transform.times( Mat4.translation([ 11*y,0,11*x ]) );
        model_transform = model_transform.times( Mat4.rotation( y, Vec.of( 1,0,0 ) ) )
        model_transform = model_transform.times( Mat4.rotation( graphics_state.animation_time/600, Vec.of( 0,1,0 ) ) );
        
        this.shapes.planet3.draw ( graphics_state, model_transform, this.materials.planet3 );

        this.planet_3 = model_transform;

        model_transform = model_transform.times( Mat4.scale([ 1,1,0.1 ]) );
        this.shapes.torus.draw ( graphics_state, model_transform, this.materials.ring );
    }

    drawPlanet4( graphics_state ) {
        var x = Math.cos(graphics_state.animation_time/1100);
        var y = Math.sin(graphics_state.animation_time/1100);

        var x2 = Math.cos(graphics_state.animation_time/500);
        var y2 = Math.sin(graphics_state.animation_time/500);

        let model_transform = Mat4.identity();
        model_transform = model_transform.times( Mat4.translation([ 14*y,0,14*x ]) );
        model_transform = model_transform.times( Mat4.rotation( graphics_state.animation_time/700, Vec.of( 0,1,0 ) ) );
        
        this.shapes.planet4.draw ( graphics_state, model_transform, this.materials.planet4 );

        this.planet_4 = model_transform;

        model_transform = model_transform.times( Mat4.translation([ 2*y2,0,2*x2 ]) );
        this.shapes.moon.draw ( graphics_state, model_transform, this.materials.moon );

        this.moon = model_transform;
    }

    drawPlanet5( graphics_state ) {
        var x = Math.cos(graphics_state.animation_time/1200);
        var y = Math.sin(graphics_state.animation_time/1200);

        let model_transform = Mat4.identity();
        model_transform = model_transform.times( Mat4.translation([ 17*y,0,17*x ]) );
        model_transform = model_transform.times( Mat4.rotation( graphics_state.animation_time/800, Vec.of( 0,1,0 ) ) );
        
        this.shapes.planet5.draw ( graphics_state, model_transform, this.materials.planet5 );

        this.planet_5 = model_transform;
    }

    display( graphics_state )
      { 
        // TODO:  Fill in matrix operations and drawing code to draw the solar system scene (Requirements 2 and 3)
        this.drawSun( graphics_state );
        this.drawPlanet1( graphics_state );
        this.drawPlanet2( graphics_state );
        this.drawPlanet3( graphics_state );
        this.drawPlanet4( graphics_state );
        this.drawPlanet5( graphics_state );

        if (this.attached != undefined) {
          let desired = this.attached();
          desired = desired.times( Mat4.translation([ 0,0,5 ] ));
          desired = Mat4.inverse(desired);
          desired = desired.map( (x,i) => Vec.from( graphics_state.camera_transform[i] ).mix( x, 0.1 ) );
          graphics_state.camera_transform = desired;
        }
      }
  }


// Extra credit begins here (See TODO comments below):

window.Ring_Shader = window.classes.Ring_Shader =
class Ring_Shader extends Shader              // Subclasses of Shader each store and manage a complete GPU program.
{ material() { return { shader: this } }      // Materials here are minimal, without any settings.
  map_attribute_name_to_buffer_name( name )       // The shader will pull single entries out of the vertex arrays, by their data fields'
    {                                             // names.  Map those names onto the arrays we'll pull them from.  This determines
                                                  // which kinds of Shapes this Shader is compatible with.  Thanks to this function, 
                                                  // Vertex buffers in the GPU can get their pointers matched up with pointers to 
                                                  // attribute names in the GPU.  Shapes and Shaders can still be compatible even
                                                  // if some vertex data feilds are unused. 
      return { object_space_pos: "positions" }[ name ];      // Use a simple lookup table.
    }
    // Define how to synchronize our JavaScript's variables to the GPU's:
  update_GPU( g_state, model_transform, material, gpu = this.g_addrs, gl = this.gl )
      { const proj_camera = g_state.projection_transform.times( g_state.camera_transform );
                                                                                        // Send our matrices to the shader programs:
        gl.uniformMatrix4fv( gpu.model_transform_loc,             false, Mat.flatten_2D_to_1D( model_transform.transposed() ) );
        gl.uniformMatrix4fv( gpu.projection_camera_transform_loc, false, Mat.flatten_2D_to_1D(     proj_camera.transposed() ) );
      }
  shared_glsl_code()            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    { return `precision mediump float;
              varying vec4 position;
              varying vec4 center;
      `;
    }
  vertex_glsl_code()           // ********* VERTEX SHADER *********
    { return `
        attribute vec3 object_space_pos;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_transform;

        void main()
        { 
          position = projection_camera_transform * model_transform * vec4(object_space_pos, 1.0);
          center = position - vec4(object_space_pos, 1.0);
          gl_Position = position;
        }`;           // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
    }
  fragment_glsl_code()           // ********* FRAGMENT SHADER *********
    { return `
        void main()
        {
          gl_FragColor = sin(distance(position, center)/0.029)*vec4( 0.75,0.5,0.25,1 );
        }`;           // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
    }
}

window.Grid_Sphere = window.classes.Grid_Sphere =
class Grid_Sphere extends Shape           // With lattitude / longitude divisions; this means singularities are at 
  { constructor( rows, columns, texture_range )             // the mesh's top and bottom.  Subdivision_Sphere is a better alternative.
      { super( "positions", "normals", "texture_coords" );

            const circle_points = Array( rows ).fill( Vec.of( 0,0,1 ) )
                         .map( (p,i,a) => Mat4.rotation( i/(a.length-1) * Math.PI, Vec.of( 0,-1,0 ) ).times( p.to4(1) ).to3() );

            Surface_Of_Revolution.insert_transformed_copy_into( this, [ rows, columns, circle_points ] );
            
                      // TODO:  Complete the specification of a sphere with lattitude and longitude lines
                      //        (Extra Credit Part III)
      } }
      