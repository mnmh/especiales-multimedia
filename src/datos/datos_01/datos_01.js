import { TimelineMax } from "gsap";
import * as d3 from "d3";
const $ = require('jquery');


console.log('cargando datos datos_01');

d3.xml( 'datos/datos_01/datos_01.svg', function(xml) {
	// svg importado
	var svg_importado = document.importNode(xml.documentElement, true);
	$('#video-placeholder').append(svg_importado);
});
