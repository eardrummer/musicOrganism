
class Blob{
	constructor(x, y){
		//this.r = r;
		this.position = createVector(x,y);

		this.velocity = p5.Vector.random2D();
		this.velocity.setMag(0.5);
		this.acceleration = createVector();
		this.maxSpeed = 12;

		this.points = 100;
		this.step = TWO_PI / points;
		this.tN = new TileableNoise(.1, 0, TWO_PI);; // Initializing
		this.off = 0; // Initializing

		this.color = color(100,55,200, 200);

		this.state = 0; // 0 = on its own, 1 = shy mode, 2 = responsive mode
		this.frameAtStateChange;

		this.shyCounter = 0;
	}

	edges(){

		if(this.state != 1){

					if(this.position.x > width){
						//this.position.x = 0;
						this.position.x = width;
						this.velocity.x *= -1;
					} else if(this.position.x < 0){
						//this.position.x = width;
						this.position.x = 0;
						this.velocity.x *= -1;
					}

					if(this.position.y > height){
						//this.position.y = 0
						this.position.y = height;
						this.velocity.y *= -1;
					} else if(this.position.y < 0){
						//this.position.y = height;
						this.position.y = 0;
						this.velocity.y *= -1;
					}
		}
		else{


					if(this.position.x >= width){
						//this.velocity.x *= -1;
						this.velocity.setMag(0);

					} else if(this.position.x <= 0){
						//this.velocity.x *= -1;
						this.velocity.setMag(0);
					}

					if(this.position.y >= height){
						//this.velocity.y *= -1;
						this.velocity.setMag(0);

					} else if(this.position.y <= 0){
						//this.velocity.y *= -1;
						this.velocity.setMag(0);

					}

		}


	}

	show(){
		this.edges();
		fill(this.color);
		beginShape();
		for (var a = 0; a < TWO_PI; a += this.step) {
			var r = this.tN.eval1D(a, this.off);
			r = map(r, 0, 1, windowHeight * .1, windowHeight * .2);

			var x = cos(a) * r + this.position.x;
			var y = sin(a) * r + this.position.y;

			vertex(x, y);
		}
		endShape(CLOSE);
		// Animation
		this.off += .01;

		// Dinamically change the radius of the noise object
		//this.tN.r = map(mouseX, 0, width, .1, 1);
	}

	stateUpdate(){
		if(this.state == 1){
			if(frameCount > this.frameAtStateChange + 150){
				this.state = 0;
				this.velocity = createVector(random(0.5,2), random(0.5,2));
				this.velocity.setMag(2);
				this.color = color(100,55,200, 150);
			}
		}
	}

	update(){
		this.position.add(this.velocity);
		this.stateUpdate();
	}

	move(x,y){
		this.velocity = createVector(x,y).sub(this.position);
		this.velocity.setMag(10);
	}

	hide(){

		if(this.state == 1){
			this.frameAtStateChange = frameCount;
			return;
		}

		this.state = 1;
		this.shyCounter++;

		if(this.shyCounter > 2){

			this.state = 2;
			this.color = color(150,100,200,150);

			return;
		}
		this.color = color(150,100,0,150);
		this.frameAtStateChange = frameCount;


		if(this.position.x <= width - this.position.x){
			if(this.position.y <= height - this.position.y){
				// 1st quadrant
				if(this.position.x <= this.position.y){
					this.move(0,this.position.y);
				} else{
					this.move(this.position.x, 0);
				}

			} else {
				//3rd quadrant
				if(this.position.x <= height - this.position.y){
					this.move(0, this.position.y);
				}else{
					this.move(this.position.x, height);
				}

			}
		}
		else{
			if(this.position.y <= height - this.position.y){
				// 2nd quadrant
				if(width - this.position.x <= this.position.y){
					this.move(width,this.position.y);
				} else{
					this.move(this.position.x, 0);
				}

			} else {
				//4th quadrant
				if(width - this.position.x <= height - this.position.y){
					this.move(width, this.position.y);
				}else{
					this.move(this.position.x, height);
				}

			}
		}
	} // End of hide function


}

class TileableNoise {
	constructor(r, fromX, toX, fromY, toY) {

		this.fromX = fromX;
		this.toX = toX;

		if (arguments.length === 3) {

			// If fromY and toY are not passed in they get assigned the same as fromX and toX, respectevely...
			this.fromY = fromX;
			this.toY = toX;

			// r is the radius of the first circle from where the noise is taken. It represents the noise scale of the x axis.
			this.r = r;

			// Here r2 is equal to r because the x axis is "equal" to the y axis
			this.r2 = r;

		} else if (arguments.length === 5) {

			// ... else It's assigned as normal
			this.fromY = fromY;
			this.toY = toY;

			// r is the radius of the first circle from where the noise is taken. It represents the noise scale of the x axis.
			this.r = r;

			// r2 is the radius of the second circle . It represents the noise scale of the y axis.
			// It scales acording to the ratio of the absolute values of the difference in toA and fromA.
			// This is necessary for when the scale of the x and y axis are not equal
			this.r2 = r * abs(toY - fromY) / abs(toX - fromX);

		} else {

			// If arguments are passed in incorrectly the code simply won't run
			console.error("An invalid number of arguments was passed in (" + arguments.length + ", instead of 3 or 5)");

			// If error = true, the code is skipped
			this.error = true;

		}

		// Stores the noise function
		this.simplexNoise = new SimplexNoise();

	}



	/* eval1D(x, [t]): Evaluates the noise at values (x, t). The input t can be used to make animations. If undefined, t is set to 0. */

	eval1D(x, t) {

		// Only works if arguments are passed in correctly
		if (!this.error) {

			// If t is not passed in, it's set to 0
			if (arguments.length === 1) t = 0;

			// Calculates the angle according to the x value. If x=fromX => angle=0; If x=toX => angle=TWO_PI. Thus the position loops
			var angle = map(x, this.fromX, this.toX, 0, TWO_PI);

			// Calculates the position based on the angle and offsets the circle, so it's positive in its entirety
			var X = this.r * (cos(angle) + 1);
			var Y = this.r * (sin(angle) + 1);

			// Returns the noise of X, Y and t, but converts from range [-1, 1] to [0, 1]
			return (this.simplexNoise.noise3D(X, Y, t) + 1) / 2;

		}

	}



	/* eval2D(x, y, [t]): Evaluates the noise at values (x, y) according to the value t. The input t can be used to make animations,
	although not optimal (see description at the function location). If undefined, t is set to 0. */

	eval2D(x, y, t) {

		// Only works if arguments are passed in correctly
		if (!this.error) {

			if (arguments.length === 2) t = 0;

			// Calculates the angle1 according to the x value. If x=fromX => angle1=0; If x=toX => angle1=TWO_PI. Thus the position loops on the x axis
			// Calculates the angle2 according to the y value. If y=fromY => angle2=0; If y=toY => angle2=TWO_PI. Thus the position loops on the y axis
			var angle1 = map(x, this.fromX, this.toX, 0, TWO_PI);
			var angle2 = map(y, this.fromY, this.toY, 0, TWO_PI);

			// By having "t" always positive the inputs of the noise valuve can't be negative
			var T = abs(t);

			// Calculates the 4D position based on the angle and offsets the circle, so it's positive in its entirety
			var X = this.r * (cos(angle1) + 1 + T);
			var Y = this.r * (sin(angle1) + 1 + T);
			var Z = this.r2 * (cos(angle2) + 1 + T);
			var W = this.r2 * (sin(angle2) + 1 + T);

			// Returns the noise of X, Y, Z amd W, but converts from range [-1, 1] to [0, 1]
			return (this.simplexNoise.noise4D(X, Y, Z, W) + 1) / 2;

			/*
			Unfortunately the animation of the 2D tileable noise is not great because I wasn't able to find any 5D noise implementation, which was needed to make this work.
			Thus I had to animate the noise by moving the 2 circles through the noise space which gives some weird results that I wasn't able to solve.
			So I wouldn't recommend using animation on 2D tileable noise
			*/

		}
	}

	/* seed([value]): Sets the seed of the internal simplex noise function as value. If value in not passed in, a random seed is selected */

	seed(value) {

		// Only works if arguments are passed in correctly
		if (!this.error) {

			// Sets the seed of the internal simplex noise function as value. If value in not passed in, a random seed is selected
			this.simplexNoise = new SimplexNoise(value);

		}
	}
}





//
