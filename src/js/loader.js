var scketch_loader = function(p) {
	var w = 200;
	var rot = 0.000000001;
	var rot_mouse = 0.0001;
	var rot_counter = 2*p.PI;
	var rot_nueva = 2*p.PI;
	var acce = 0.005;
	var acce_mouse = 0.001;
	var vel = 0;
	var vel_mouse = 0;
	var inicio = false;
	var on = false;
	var freeze = false;
	var counter = false;
	var diam = 180;
	var color1 = '#333';
	var color2 = '#FFF';

	var pasos_counter = 1;
	var paso_actual = 0;

	p.setup = function() {
		p.createCanvas(w,w);
		p.smooth();
	};

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
		p.stroke(color1);
		p.dibujarArco(2,rot);
		
			
		if(on) {
			if(rot_mouse >= 2*p.PI - 0.0001){
				rot_mouse = 2*p.PI;
			} else {
				vel_mouse += acce_mouse;
				rot_mouse += vel_mouse;
				if(rot_mouse >= 2*p.PI - 0.0001){
					rot_mouse = 2*p.PI;
				}
			}
			p.stroke(color2);
			p.dibujarArco(4,rot_mouse);
		}

		if(freeze) {
			p.stroke(color2);
			p.dibujarArco(4,2*p.PI);
		}

		if(counter){
			p.stroke(color1);
			p.dibujarArco(2,rot_counter);

			if(rot_counter > rot_nueva){
				rot_counter-=0.04;
				if(rot_counter < rot_nueva)
					rot_counter = rot_nueva;
				if(rot_counter == 0){
					counter = false;
					p.clear();
				}
			}
		}
		
	}

	p.dibujarArco = function(ancho, punto) {
		p.strokeWeight(ancho);
		p.noFill();
		p.push();
		p.translate(w/2,w/2);
		p.rotate(-p.PI/2);
		p.arc(0,0,diam,diam,0,punto);
		p.pop();
	}

	p.inicio = function() {
		inicio = true;
	}

	p.inicioCounter = function(){
		inicio = false;
		counter = true;
		diam = 100;
		color1 = '#fff';
	}

	p.mouseOn = function() {
		on = true;
	}
	p.mouseOff = function() {
		on = false;
		vel_mouse = 0;
		rot_mouse = 0.0001;
	}
	p.freeze = function() {
		freeze = true;
	}
	p.menosUnPaso = function(){
		paso_actual++;
		rot_nueva = ((2*p.PI)/pasos_counter) * paso_actual;
		rot_nueva = (2*p.PI) - (rot_nueva);
	}
};

export default scketch_loader;