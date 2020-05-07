import p5 from "p5";
import "p5/lib/addons/p5.sound";

var scketch_audio = function(p) {
	var w = 700;
	var diam = 250;
	var diam_segundo = 300;
	var diam_ori = 250;
	var opa = 255;
	var inicio = false;
	var acce = 0.005;
	var vel = 0;
	var rot = 0.00001;

	var img, showImage;

	var sonido, sonidoActivo, amplitude;

	var ring = new Ring(400, true, 300,0.25);

	p.setup = function() {
		p.soundFormats('mp3', 'ogg');
		amplitude = new p5.Amplitude();
		p.createCanvas(w,w);
		p.smooth();
	}

	p.draw = function() {
		p.clear();
		if(inicio){
			vel += acce;
			rot += vel;
			if(rot >= 2*p.PI){
				rot = 0;
				inicio = false;
			}
		}
		p.strokeWeight(2);
		var level = amplitude.getLevel();
		if(sonidoActivo){
			diam = diam_ori;
			diam += p.map(level, 0,0.25,0,10);
			
			p.strokeWeight()
			//console.log(level);
		}
		//p.stroke('#fff');

		p.fill('#fff');
		ring.dibujar(level);
		p.noFill();
		opa = 255 - p.map(level, 0,0.4,0,230);
		p.stroke(255,opa);
		p.dibujarArco(2,rot,p.map(level, 0,0.4,2,10),250);

		opa = 255 - p.map(level, 0,0.4,200,250);
		p.stroke(255,opa);
		p.dibujarArco(2,rot,p.map(level, 0,0.4,2,100),350);



		if(showImage && !inicio){
			img.resize(200,200);
			p.image(img, w/2 - 100, w/2 - 100);
		}
	}

	p.dibujarArco = function(ancho, punto, strokeW, diameter) {
		p.push();
		p.translate(w/2,w/2);
		p.rotate(-p.PI/2);
		p.strokeWeight(strokeW)
		p.arc(0,0,diameter,diameter,0,punto);
		p.pop();
	}

	p.inicio = function() {
		inicio = true;
	}

	p.loadTestimonioImage = function(url) {
		p.loadImage(url, function(imgTemp){
			showImage = true;
			img = imgTemp;
		})
	}

	p.loadTestimonioAudio = function(url) {
		p.loadSound(url, function(sonidoTemp){
			sonidoActivo = true;
			sonido = sonidoTemp;
			sonido.play();
		});
	}

	p.stopAudio = function() {
		if(sonido.isPlaying())
			sonido.stop();
	}

	p.darDuracion = function() {
		if(sonido.isPlaying())
			return sonido.duration();
		else
			return false;
	}

	p.darTiempo = function() {
		if(sonido.isPlaying())
			return sonido.currentTime();
		else
			return false
	}

	function Ring(diamTemp, sentido, amp, strokeWT){
		var diam, numPoints, diamNoise, diamNoiseOff;
		var rotX, rotZ;
		var rovXVel, rotZVel;

		var strokeW = strokeWT;

		var ampli = amp;

		diam = diamTemp;
		diamNoiseOff = [];
		diamNoise = [];
		numPoints = 20;
		for(var y = 0; y < numPoints; y++){
	    	diamNoiseOff[y] = p.random(1);
			console.log(diamNoiseOff[y]);
	    }

	    var rotX = rotZ = 0;
	    var rotZVel = 0.03;
	    if(!sentido)
	    	rotZVel *= -1;

	    this.dibujar = function(level){
	    	var step = (4*p.PI) / (numPoints - 2);
	    	var new_level = p.map(level, 0,0.4,0,ampli);
	    	for(var y = 0; y < numPoints; y++){
				diamNoise[y] = p.map(p.noise(diamNoiseOff[y]), 0,1,diam - new_level, diam + new_level);
				diamNoiseOff[y] = diamNoiseOff[y] + p.random(0.05);
			}
			rotZ += rotZVel;
			p.noFill();
			p.strokeWeight(strokeW);
			p.stroke(255);
			p.push();
			p.translate(w/2, w/2);
			p.rotate(rotZ);
			p.beginShape();
			for(var i = 0; i < numPoints + 1; i++){
				var x = 0;
				var y = 0;
				var z = 0;
				if(i < numPoints){
					x = (diamNoise[i]/2) * p.cos(step * i);
					y = (diamNoise[i]/2) * p.sin(step * i);
				}
				else if(i == numPoints){
					x = (diamNoise[0]/2) * p.cos(step * i);
					y = (diamNoise[0]/2) * p.sin(step * i);
				}
				else if(i == numPoints + 1){
					x = (diamNoise[numPoints - 1]/2) * p.cos(step * i);
					y = (diamNoise[numPoints - 1]/2) * p.sin(step * i);
				}
				p.curveVertex(x,y);
			}
			var x = (diamNoise[0]/2) * p.cos(step * 30);
			var y = (diamNoise[0]/2) * p.sin(step * 30);
			//p.curveVertex(x,y);
			p.endShape();
			p.pop();
	    }
	}
};

export default scketch_audio;