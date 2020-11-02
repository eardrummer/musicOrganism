let theShader;
let shaderGraphics;
let mic, vol;

let player, shifter, loop, leadSampler;
let leadPart, leadPattern;

let startFlag = false;

let randomVar = 2;
let audioContextStartFrame = -1;

let backgroundMode = 0, bgImg;
let mlFont, font;


// Blob Stuff
const points = 100;
var step;
var tN; // Initializing
var off = 0; // Initializing

function preload(){
  // load the shader
  theShader = loadShader('shader.vert', 'shader.frag');
	shifter = new Tone.PitchShift(2).toMaster();
	player = new Tone.Player('data/lidSample.mp3').connect(shifter);
	//player = new Tone.Player('data/children_sample.wav').connect(shifter);

  mlFont = loadFont('data/mlFont.otf');
  font = loadFont('data/dancingFont.otf');

}

function setup() {
	createCanvas(w = windowWidth, h = windowHeight);
	//createCanvas(400,400);

	getAudioContext().suspend();

  textFont(mlFont);

	button = createButton("Enter");
	button.position(w/2, h/2);

	shaderGraphics = createGraphics(width/2.5, height/2.5, WEBGL);
	shaderGraphics.noStroke();
	//setAttributes('perPixelLighting', false);

	// Blob Stuff

	blob = new Blob(w/2, h/2);

	step = TWO_PI / points;
	fill(100,55,200, 150); // Color of Blob

	// The tileable noise object
	tN = new TileableNoise(.1, 0, TWO_PI);




	shifter.pitch = 0;



	loop = new Tone.Loop(() =>{
		if(random(10) > randomVar && blob.state != 1){

			blob.color = color(100,55,200, 200);
			player.start();
		}

		if(blob.state == 2){
			player.start();

		}
	}, 8).start();


	//Lead
	leadPattern = [
	]
	leadPart =  new Tone.Part((time, note) => {
			leadSampler.triggerAttackRelease(note, '2n', time);
	}, leadPattern).start();

}

function draw() {

	// shader() sets the active shader with our shader
  shaderGraphics.shader(theShader);

  theShader.setUniform("u_resolution", [width, height]);
  theShader.setUniform("u_time", millis() / 8000.0);
  //theShader.setUniform("u_mouse", [mouseX, map(mouseY, 0, height, height, 0)]);

	// rect gives us some geometry on the screen
  shaderGraphics.rect(0,0,width, height);

	image(shaderGraphics, 0, 0, width, height);

	button.mousePressed(start);

	if(startFlag == false){
    textSize(42);
    fill(200,200,0);
    text("Raise your AI Musical Pet repsonsibly.", width*0.32, height*0.4)
		return;
	}
	else{
    textFont(font);
		if(frameCount < audioContextStartFrame + 100){
			return;
		}
	}


	//console.log(frameRate());


	vol = mic.getLevel();

	if(vol < 0.008){
		blob.tN.r = 0.5;

		if(blob.state == 2){
				blob.color = color(100,55,200, 200);
				// Stop the Lead Part.

		}

		if(blob.state == 2){
			shifter.pitch = 12*sin((frameCount + 500)/100)*sin(frameCount/10) - 12*sin((frameCount + 1000)/2000);
		}



	}
	else if (vol > 0.02){
		blob.hide();
		blob.tN.r = vol*30;

		if(blob.state != 2){
			player.stop();
		}
		else{

				// Start the Lead Part
				randomVar = 0;
		}

	}


	if(backgroundMode == 0){

		//tint(100);
		//image(bgImg, 0, 0, width, height);

	}else if(backgroundMode == 1){

		fill(100,0,0,100);
		rect(0,0,width,height);

	}
	else if(backgroundMode == 2){

		fill(0,0,100,100);
		rect(0,0,width,height);
	}
	else{
		backgroundMode = 0;
	}

	// Blob Stuff:

	blob.update();
	blob.show();

  textSize(36);
  fill(255);
  if(blob.state == 0){
    text('Make a sound', width*0.1,height*0.1);
  }
  if(blob.state == 1){
    fill(255);
    text("You scared it!", width*0.1, height*0.1);
    fill(100,100,0);
    text("Don't be afraid, you can come out!", width*0.6, height*0.9);
  }

  if(blob.state == 2 && frameCount < blob.frameAtStateChange + 500){
    fill(0,200,0);
    text("You can have a conversation now", width * 0.1, height*0.1);

    fill(255);
    text("Press Space Bar to explore different sound worlds with your pet", width*0.1, height*0.9);
  }


}

function mousePressed(){
	//blob.hide();
	getAudioContext().resume();
	if(startFlag){
		//player.start();
	}
}


function keyPressed(){
	if(blob.state == 2){
		if(keyCode == 32){
			backgroundMode++;

			if (backgroundMode == 0) {
				player = new Tone.Player('data/lidSample.mp3').connect(shifter);
			}
			else if(backgroundMode == 1){
				player = new Tone.Player('data/children_sample.wav').connect(shifter);
			}
			else if(backgroundMode == 2){
				player = new Tone.Player('data/chennai_streetDrums_short.wav').connect(shifter);
			}
			else{
				player = new Tone.Player('data/lidSample.mp3').connect(shifter);
			}
		}
		else if(keyCode == 13){
			player.mute = true;
		}
	}
}

function start(){
	startFlag = true;
	button.hide();

	//mic Stuff
	mic = new p5.AudioIn();
	mic.start();

	audioContextStartFrame = frameCount;

	Tone.Transport.start();
}


function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}
