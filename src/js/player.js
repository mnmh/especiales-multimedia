import { TimelineMax } from "gsap";
import * as d3 from "d3";
import p5 from "p5";
import "p5/lib/addons/p5.sound";

import scketch_loader from '../../src/js/loader.js';
import scketch_audio from '../../src/js/audio.js';

const VIDEO = 'video';
const CABEZOTE = 'cabezote';
const AUDIO = 'audio';
const GALERIA = 'galeria';
const HISTORIA = 'historia';
const LINEA = 'linea del tiempo';
const DATOS = 'visualizaciones de datos';

const $ = require('jquery');
var YouTubeIframeLoader = require('youtube-iframe');
var jQueryBridget = require('jquery-bridget');
var Flickity = require('flickity');

jQueryBridget( 'flickity', Flickity, $ );

function Player(capitulos){
	// Arreglo con los capitulos cargados
	this.capitulos = capitulos;
	// Numero del capitulo actual
	this.cap_actual = -1;
	// Numero del subcapitulo actual
	this.sub_cap_actual = -1;
	// Numero del elemento del subcapitulo actual
	this.elemento_actual = -1;
	// elementos del subcapitulo actual
	this.elementos_sub_actual = null;

	this.container = $('#player .inside');
	this.nav_capitulos = $('#player .capitulos');
	this.nav_capitulo_actual = $('#player .capitulo_actual');

	var item_selected = 'item_0';
	var p5test = null;

	var timeBtm = 0;

	var video = null;

	var time_update_interval = 0;


	// SE ENCARGA DE INICIAR EL MENU DE LOS CASOS CON CADA CAPITULO
	this.iniciar_player = function(){
		var tl = new TimelineMax();
		var parent = this;


		for(var i = 0; i < this.capitulos.length; i++){
			var $item = $('<div class="item" id="item_'+i+'"></div>');
			var $nombre = $('<div class="nombre" data-txt="">'+this.capitulos[i].darNombre()+'</div>');
			var $img = $('<div class="img"></div>');
			var $notice = $('<div class="notice">Mantén presionado<br>para explorar</div>');
			$item.append($img);
			$item.append($nombre);
			$item.append($notice);
			$item.attr('data-id', i)
			$('#capitulos').append($item);
			
		}
		$('#capitulos').addClass('active');

		tl.add('start')
				.fromTo('#capitulos .item',0,{autoAlpha:1},{autoAlpha:0})
				.staggerFromTo('#capitulos .item',3,{y:200,autoAlpha:0},{ease: Elastic. easeOut.config( 1, 0.3),y:-200,autoAlpha:1},0.25,'+=1')
				;

		p5test = new p5(scketch_loader, item_selected);

		var $capitulos_ = $('#capitulos').flickity({
	        contain: false,
	        prevNextButtons: false,
	        pageDots: false,
	        wrapAround: true,
	        setGallerySize: false
	    });

	    tl.add('start')
		.fromTo('#capitulos .item.is-selected .notice',0.3,{autoAlpha:0},{autoAlpha:1},'-=2')
		.add(function(){
			p5test.inicio();
		}, '-=2')
		.fromTo('#capitulos .item.is-selected .nombre',0.4,{scale:1.15,autoAlpha:0},{scale:1,autoAlpha:1},'-=1.5')
		;

	    var flkty = $capitulos_.data('flickity');
	    //console.log(flkty.selectedIndex);

	    $capitulos_.on('click', function(){
	    	var id = $('#capitulos .item.is-selected').attr('id');
	    	if(id != item_selected){
	    		item_selected = id;
	    		tl = new TimelineMax();
		    	$('#defaultCanvas0').remove();
		    	// console.log(id);
		    	p5test = null;
		    	p5test = new p5(scketch_loader, id);
		    	p5test.inicio();
		    	tl.add('start')
					.fromTo('#capitulos .item .nombre',0,{scale:1,autoAlpha:1},{scale:1.15,autoAlpha:0})
					.fromTo('#capitulos .item .notice',0,{autoAlpha:1},{autoAlpha:0})
					.fromTo('#capitulos .item.is-selected .notice',1,{autoAlpha:0},{autoAlpha:1})
					.fromTo('#capitulos .item.is-selected .nombre',1,{scale:1.15,autoAlpha:0},{scale:1,autoAlpha:1},'-=1')
					;
	    	}
	    });

	    var timeoutId = 0;

	    $('#capitulos .item').on('mousedown touchstart', function(){
	    	var item_id = $(this).attr('data-id');
	    	timeoutId = setTimeout(function(){
	    		parent.abrirCaso(item_id);
	    	}, 1800);
	    	p5test.mouseOn();
	    }).on('mouseup mouseleave touchend', function(){
	    	clearTimeout(timeoutId);
	    	p5test.mouseOff();
	    });
	}

	// SE ENCARGA DE CARGAR LA BARRA INFERIOR EN FUNCION DEL CASO QUE SE HAYA ESCOGIDO AL INICIO
	this.abrirCaso = function(item_id) {
		//console.log('hola');
		var tl = new TimelineMax();
		p5test.freeze();
		var parent = this;

		/*Numero del capitulo actual*/
		this.cap_actual = item_id;
		/*Numero del subcapitulo actual*/
		this.sub_cap_actual = 0;
		/*Numero del elemento actual*/
		this.elemento_actual = 0;
		/*Elemento actual*/
		this.elementos_sub_actual = capitulos[this.cap_actual].darElementoNum(this.sub_cap_actual);
		// Numero de subcapitulos
		var num_sub_capitulos = capitulos[this.cap_actual].darNumElementos();

		// Iterar entre los subcapitulos del arreglo inicial y ponerlos en el body
		// esta funccion tambien debe devolver los elementos del subcapitulo y ponerlos en la linea del tiempo

		for(var i = 0; i< num_sub_capitulos; i++){
			var $item = $('<div class="sub_capitulo"></div>');
			$item.css({'width': (100/num_sub_capitulos) + '%'});
			// Titulo del elemento
			var titulo = capitulos[this.cap_actual].darElementoNum(i).darNombre();
			// Numero de elementos del subcapitulo
			var elementos_num = capitulos[this.cap_actual].darElementoNum(i).darElementos().length;
			// console.log(elementos_num);
			var $title = '<div class="title">'+titulo+'</div>';
			var $counter = '<div class="counter_block"></div>';

			// Variable que contiene los indicadores de los elementos del subcapitulo
			var $contenedor_elementos_indicador = $('<div class="sub_indicadores"></div>');
			// Iterar entre los elementos del subcapitulo y ponerlos en la linea del tiempo
			for(var t=0; t<elementos_num;t++){
				var $item_temp = $('<div class="elemento_sub_indicador"></div>');
				$item_temp.css({'width': 'calc('+(100/elementos_num) + '% - 1px)'});
				$contenedor_elementos_indicador.append($item_temp);
			}
			$item.append($contenedor_elementos_indicador);
			$item.append($counter);
			$item.append($title);
			$('.btm .items').append($item);
		}

		tl.add('start')
			.fromTo('#capitulos .item:not(.is-selected)',0.3,{autoAlpha:1},{autoAlpha:0})
			.add(function(){
				$('body').addClass('viewer');
			})
			.add(function(){
				$('#' + item_selected).addClass('active');
			},'+=0.2')
			.add(function(){
				$('#capitulos').removeClass('active');
			}, '+=0.5')
			.fromTo('#capitulos .item.is-selected .nombre',0.3,{y:0,autoAlpha:1},{y:-20,autoAlpha:0},'+=2')
			.add(function(){
				$('#capitulos').hide();
				$('.btm').addClass('show');
			})
			.fromTo('.btm .items .sub_capitulo', 0.25, {y:20, autoAlpha:0},{y:0, autoAlpha:1})
			.staggerFromTo('.btm .items .sub_capitulo .title', 0.3, {y:20, autoAlpha:0},{y:0, autoAlpha:1,ease: Back. easeOut.config( 2)},0.2)
			.add(function(){
				parent.timeOutBarra();
				$(window).on('mousemove touchstart', function(){
					parent.timeOutClearBarra();
					parent.timeOutBarra();
				});
				parent.actualizarElemento();
			})
			;

		$('#currentTime .next').on('click', function(){
			parent.siguienteElemento();
		});
	}

	// SE ENCARGA DE CARGAR EL CONTENIDO NECESARIO EN FUNCION DEL TIPO DEL ELEMENTO ESCOGIDO
	// SE CARGA DESPUES DE CAMBIAR EL NUMERO DEL ELEMENTO [ATRAS,SIGUIENTE]
	this.actualizarElemento = function(){
		var parent = this;
		var elemento = this.elementos_sub_actual.darElementoNum(this.elemento_actual);
		parent.actualizarTituloElemento(elemento);
		parent.actualizarClasesLineaTiempo();
		$('.sub_capitulo_played .counter_block').css({'width': '100%'});

		var tl = new TimelineMax();

		// Si el elemento es un video normal de youtube
		if(elemento.tipo == VIDEO){
			parent.cargarVideoYoutube(elemento.extra, 'video-placeholder', VIDEO);
		}
		// Si el elemento es el cabezote de un nuevo subcapitulo
		else if(elemento.tipo == CABEZOTE){
			parent.cargarCabezote(elemento);
		}
		// Si el elemento es un mapa de audios
		else if(elemento.tipo == AUDIO){
			parent.cargarAudio(elemento);
		}
		// Si el elemento es una galeria
		else if(elemento.tipo == GALERIA){
			parent.cargarGaleria(elemento);
		}
		else if(elemento.tipo == HISTORIA){
			parent.cargarHistoria(elemento);
		}
		else if(elemento.tipo == LINEA){
			parent.cargarLineaTiempo(elemento);
		}
		else if(elemento.tipo == DATOS){
			parent.cargarDatos(elemento);
		}
	}

	// SE ENCARGA DE ACTUALIZAR EL TIMER GRANDE DE LA BARRA
	// SU RESULTADO ES DISTINTO EN FUNCION DEL TIPO DEL CONTENIDO QUE SE ESTE REPRODUCIENDO
	this.calcularCounterBlock = function(tipo, param1, param2){
		var $sub_cap = $('.items .sub_capitulo:nth-child('+(this.sub_cap_actual + 1)+')');
		var currentNum = this.elemento_actual + 1;
		var numElementos = this.elementos_sub_actual.darNumElementos();
		var anchoSingle = 100 / numElementos;

		if(tipo == CABEZOTE){
			var anchoResp = anchoSingle * currentNum;

			var tl = new TimelineMax();
			tl.add('start')
			.fromTo($sub_cap.find('.counter_block'), param1,{css:{'width': '0%'}}, {css:{'width': anchoResp + '%'}})
			;
		}
		else if(tipo == VIDEO){
			var anchoVideo = (param1 * anchoSingle) / param2;

			var tl = new TimelineMax();
			tl.add('start')
			.to($sub_cap.find('.counter_block'), 1, {css:{'width': (anchoVideo + (this.elemento_actual * anchoSingle)) + '%'}})
			;
		}
		else if(tipo == GALERIA) {
			var anchoResp = (param1 * anchoSingle) / param2;

			var tl = new TimelineMax();
			tl.add('start')
			.to($sub_cap.find('.counter_block'), 1, {css:{'width': (anchoResp + (this.elemento_actual * anchoSingle)) + '%'}})
			;
		}
		else if(tipo == HISTORIA) {
			var anchoResp = (param1 * anchoSingle) / param2;

			var tl = new TimelineMax();
			tl.add('start')
			.to($sub_cap.find('.counter_block'), 1, {css:{'width': (anchoResp + (this.elemento_actual * anchoSingle)) + '%'}})
			;
		}

	}

	// CARGA EL SIGUIENTE ELEMENTO
	// SE ENCARGA DE CAMBIAR DE SUBCAPITULO SI EL ELEMENTO ES EL ULTIMO
	this.siguienteElemento = function(){
		// Limpia el loop para el video
		clearInterval(time_update_interval);
		// Numero de elementos en el supcapitulo actual
		var numElementos = this.elementos_sub_actual.darNumElementos();
		// Capitulo actual
		var capitulo = capitulos[this.cap_actual];

		// arreglo de subcapitulos
		var subcapitulo = capitulo.darElementos();
		// numero de subcapitulos
		var subcapitulo_num_elementos = subcapitulo.length;

		$('#video-placeholder').remove();
		var $video = $('<div id="video-placeholder"></div>');
		$('#player').append($video);

		$('#cortina').removeClass('transparent');
	    var tl = new TimelineMax();
	    tl.to('#cortina',0,{autoAlpha:1});


	    // si el elemento no es el ultimo, ve al siguiente elemento
		if(this.elemento_actual < numElementos - 1){
			this.elemento_actual++;
			this.actualizarElemento();
		}
		// si el elemento es el ultimo del arreglo
		else {
			// si el subcapitulo no es el ultimo ve al siguiente subcapitulo, primer elemento
			if(this.sub_cap_actual < subcapitulo_num_elementos - 1){
				this.sub_cap_actual++;
				this.elemento_actual = 0;
				this.elementos_sub_actual = capitulos[this.cap_actual].darElementoNum(this.sub_cap_actual);
				this.actualizarElemento();
			}
		}
	}

	// CARGAR UN VIDEO DE YOUTUBE EN EL PLAYER DEL INTERACTIVO
	this.cargarVideoYoutube = function(id, div, tipo) {
		var parent = this;
		clearInterval(time_update_interval);

		YouTubeIframeLoader.load(function(YT) {
			video = new YT.Player(div, {
					width: 600,
					height: 400,
					videoId: id,
					playerVars: {
					color: 'white',
					autoplay: true,
					controls: 0,
					modestbranding: 1,
					showinfo: 0,
					related: false
				},
				events: {
					onReady: initialize
				}
			});
		});

		function initialize(){
			updateProgressBar();

		    // Start interval to update elapsed time display and
		    // the elapsed part of the progress bar every second.
			$('#currentTime .current').show();

			
		    var tl = new TimelineMax();
		    tl.to('#cortina',0,{autoAlpha:1})
		    .add(function(){
		    	$('#cortina').addClass('transparent');
		    });
		    if(!$('.btm').hasClass('down')){
		    	tl = new TimelineMax();
		    	tl.fromTo('#currentTime .current_title', 0.35, {autoAlpha:0}, {autoAlpha:1})
				.fromTo('.time_num', 0.35, {y:10, autoAlpha:0}, {y:0,autoAlpha:1});
		    }
		    time_update_interval = setInterval(function () {
		        updateProgressBar();
		    }, 1000);
		}

		function updateProgressBar(){
			if(tipo == VIDEO)
				parent.calcularCounterBlock(VIDEO,video.getCurrentTime(),video.getDuration());
			$('#currentTime .time_num').html('-' + parent.secondsTimeSpanToHMS(video.getDuration()-video.getCurrentTime()));
		    $('#currentTime .current').css({'width' :((video.getCurrentTime() / video.getDuration()) * 100) + '%'});
		}
	}

	// CARGAR UN CABEZOTE DEL INTERACTIVO
	this.cargarCabezote = function(elemento){
		var parent = this;
		$('#cortina').show();
		$('#cortina .title').html(elemento.titulo);
		$('#cortina .txt').html(elemento.extra);
		
		var tl = new TimelineMax();
		tl.add('start')
		.fromTo('#cortina .title, #cortina .txt',0.3,{autoAlpha:0},{autoAlpha:1})
		;
		parent.calcularCounterBlock(CABEZOTE,3,0);
    	$('#defaultCanvas1').remove();
		p5test = new p5(scketch_loader, 'cortina_inside');
		p5test.inicioCounter();
		p5test.menosUnPaso();
		setTimeout(function(){
			var tl = new TimelineMax();
			tl.add('start')
			.fromTo('#cortina .title, #cortina .txt',0.3,{autoAlpha:1},{autoAlpha:0})
			.add(function(){
				parent.siguienteElemento();
			});
		},3000);
	}

	// CARGAR UN AUDIO DEL INTERACTIVO
	this.cargarAudio = function(elemento){
		var parent = this;
		var mapa = elemento.extra;
		var titulo = elemento.titulo;
		var tl = new TimelineMax();

		var forceStrength = 0.15;
		var width = 1366,
		height = 768;

		var audioPlayerActive = false;

		parent.actualizarTituloElemento(titulo);

		// Muestra el contenido del titulo de interactivo
		$('#currentTime .current').show();
		$('#cortina').hide();
		tl = new TimelineMax();
		tl.fromTo('#currentTime .current_title', 0.35, {autoAlpha:0}, {autoAlpha:1});

		d3.xml("/audios/" + mapa + '/' + mapa + '.svg', function(xml) {
			// svg importado
			var svg_importado = document.importNode(xml.documentElement, true);
			$('#video-placeholder').append(svg_importado);

			d3.csv('/audios/' + mapa + '/' + mapa + '.csv', function(data){
				console.log('data', data)
				var svg = d3.select('#Capa_1');
				var node = svg.selectAll("circle")
				.data(data)
				.enter()
				.append("circle")
				.attr("id",function(d,i) {
					return i;
				})
				.attr('r', 20)
				.attr('class', 'audio_bola')
				.attr('data-archivo', function(d,i) {
					return d['Archivo']
				})
				.attr('fill', 'url(#nestor)');
	
				function charge(d) {
					// return -Math.pow(total.map(0,1069,1,1), 2.0) * forceStrength;
					return -Math.pow(20, 2.0) * forceStrength;
				}
	
				function ticked(d) {
					node.attr("cx",function(d) {
						return d.x;
					})
					.attr("cy",function(d) {
						return d.y;
					});
				}
	
				var force_mapa_X = d3.forceX(function(d){
					var str = d['Coordenada X'];
					return str;
				});
				var force_mapa_Y = d3.forceY(function(d){
					var str = d['Coordenada Y'];
					return str;
				});
	
				var force_lectura_Y = d3.forceY(function(d){
					return 100;
				});
	
				var force_lectura_X = d3.forceX(function(d,i){
					return width - i*50 - 100;
				});
	
				var simulation = d3.forceSimulation(data)
				.force("charge", d3.forceManyBody().strength(charge))
				.force("x", force_mapa_X)
				.force("y", force_mapa_Y)
				.on("tick", ticked)
				.alphaTarget(1)
				.restart();
	
				
	
				$('.audio_bola').on('click', function(){
					if(!$(this).hasClass('selected')){
						simulation.force("x", force_lectura_X)
						.force("y", force_lectura_Y);
	
						$('.audio_bola').removeClass('hide').removeClass('selected');
						$('.audio_bola').addClass('hide');
						$(this).removeClass('hide').addClass('selected');
						cargarP5audio();
					}
					else {
						simulation.force("x", force_mapa_X)
						.force("y", force_mapa_Y);
	
						limpiarAudioPlayer();
	
						$('.audio_bola').removeClass('hide').removeClass('selected');
					}
				});
	
				function cargarP5audio() {
					if(!audioPlayerActive){
						var $audio_player = ('<div id="audio_player"></div>');
						$('#video-placeholder').append($audio_player);
						p5test = new p5(scketch_audio, 'audio_player');
						p5test.inicio();
						audioPlayerActive = true;
						p5test.loadTestimonioImage('../audios/audio_01/nestor.png');
						p5test.loadTestimonioAudio('../audios/audio_01/nestor.mp3');
					}
					else {
						p5test.stopAudio();
						p5test.loadTestimonioAudio('../audios/audio_01/nestor.mp3');
					}
	
	
					time_update_interval = setInterval(function () {
						updateProgressBar();
					}, 1000);
				}
	
				function updateProgressBar(){
					$('#currentTime .time_num').css({'opacity': 1, 'display': 'block'});
					$('#currentTime .current').css({'width' :'0%'});
					$('#currentTime .time_num').html('-' + parent.secondsTimeSpanToHMS(p5test.darDuracion()-p5test.darTiempo()));
					$('#currentTime .current').css({'width' :((p5test.darTiempo() / p5test.darDuracion()) * 100) + '%'});
				}
	
				function limpiarAudioPlayer() {
					$('#audio_player').remove();
					audioPlayerActive = false;
					p5test.stopAudio();
					clearInterval(time_update_interval);
					$('#currentTime .time_num').css({'opacity': 0, 'display': 'none'});
					$('#currentTime .current').css({'width' :'0%'});
				}
			});
		});

		
	}

	// CARGA UNA GALERIA DE IMAGENES CON FLICKITY
	this.cargarGaleria = function(elemento){
		var parent = this;
		var carpeta = elemento.extra;

		var titulo_galeria = elemento.titulo;

		parent.actualizarTituloElemento(elemento);
		actualizarStringTiempo('');

		$('#currentTime .current').show();
		$('#cortina').hide();
		var tl = new TimelineMax();
		tl.fromTo('#currentTime .current_title', 0.35, {autoAlpha:0}, {autoAlpha:1})
			.fromTo('#currentTime .time_num', 0.35, {autoAlpha:0}, {autoAlpha:1});

		d3.csv('/galerias/' + carpeta + '/' + carpeta + '.csv', function(data){
			$('#video-placeholder').append('<div class="galeria"></div>');
			for(var i = 0; i < data.length; i++){
				var $item_temp = $('<div class="item"></div>');
				var $img_temp = $('<img/>');
				var url = '/galerias/' + carpeta + '/' + data[i]['Archivo'] + '.jpg';
				// console.log(data[i]['Archivo']);
				$img_temp.attr('data-flickity-lazyload', url);
				$item_temp.append($img_temp);
				$('#video-placeholder .galeria').append($item_temp);
			}

			var $galeria_ = $('#video-placeholder .galeria').flickity({
		        contain: false,
		        prevNextButtons: false,
		        wrapAround: true,
		        lazyLoad: true,
		        lazyLoad: 2
		    });

			actualizarStringTiempo('1/' + data.length);
			parent.calcularCounterBlock(GALERIA, 1, data.length);
			$('#currentTime .current').css({'width' :(1 / data.length) * 100 + '%'});

		    $galeria_.on('click', function(){
		    	var index = $('.galeria .flickity-page-dots .dot.is-selected').index();
		    	actualizarStringTiempo((index + 1) + '/' + data.length);
				parent.calcularCounterBlock(GALERIA, (index + 1), data.length);
				$('#currentTime .current').css({'width' :((index + 1) / data.length) * 100 + '%'});
		    });
		});

		function actualizarStringTiempo(contenido) {
			$('#currentTime .time_num').html(contenido);
		}
	}

	// CARGA UNA HISTORIA CON SUS COMPONENTES
	this.cargarHistoria = function(elemento){
		var parent = this;
		var carpeta = elemento.extra;

		var titulo_historia = elemento.titulo;
		parent.actualizarTituloElemento(elemento);

		var arrayVid = [];
		var currentVid = -1;


		$('#currentTime .current').show();
		$('#cortina').hide();
		var tl = new TimelineMax();
		tl.fromTo('#currentTime .current_title', 0.35, {autoAlpha:0}, {autoAlpha:1})
			.fromTo('#currentTime .time_num', 0.35, {autoAlpha:0}, {autoAlpha:1});

		$('#video-placeholder').append($('<div id="video-historias-holder"></div>'));
		$('#video-placeholder').append($('<div class="background"></div>'));
		$('#video-placeholder .background').append($('<div class="explore"></div>'));

		d3.csv('/historias/' + carpeta + '/' + carpeta + '.csv', function(data){
			for(var i = 0; i < data.length; i++){
				var titulo = data[i]['Titulo'];
				var contenido = data[i]['Contenido'];
				var vid_id = data[i]['Youtube'];

				var resp = [
					titulo,
					contenido,
					vid_id
				]

				arrayVid[i] = resp;
			}

			$('#video-placeholder .explore').on('click', function(){
				$('#video-historias-holder').remove();
				$('#video-placeholder').prepend($('<div id="video-historias-holder"></div>'));
				
				if(currentVid < data.length - 1){
					$('#video-placeholder .background').addClass('transparent');
					$('#video-historias-holder').show();
					currentVid++;
					parent.cargarVideoYoutube(arrayVid[currentVid][2], 'video-historias-holder', HISTORIA);
					parent.calcularCounterBlock(HISTORIA,currentVid + 1,data.length);
				}
				else {
					$('#video-placeholder .background').removeClass('transparent');
					currentVid = -1;
					parent.calcularCounterBlock(HISTORIA,currentVid + 1,data.length);
				}
			});
		});
	}

	// CARGA UNA LINEA DEL TIEMPO CON VIDEOS
	this.cargarLineaTiempo = function(elemento){
		var parent = this;
		var carpeta = elemento.extra;

		var arrayVid = [];
		var currentLinea = 0;

		var titulo_historia = elemento.titulo;
		parent.actualizarTituloElemento(elemento);

		$('#currentTime .current').show();
		$('#cortina').hide();
		var tl = new TimelineMax();
		tl.fromTo('#currentTime .current_title', 0.35, {autoAlpha:0}, {autoAlpha:1})
			.fromTo('#currentTime .time_num', 0.35, {autoAlpha:0}, {autoAlpha:1});

		$('#video-placeholder').append($('<div class="background"></div>'));
		$('#video-placeholder').append($('<div id="linea_holder"></div>'));

		var $container_temp = $('<div class="container"></div>');

		d3.csv('/lineas/' + carpeta + '/' + carpeta + '.csv', function(data){
			for(var i = 0; i < data.length; i++){
				var titulo = data[i]['Titulo'];
				var contenido = data[i]['Contenido'];
				var vid_id = data[i]['Youtube'];

				var resp = [
					titulo,
					contenido,
					vid_id
				]

				arrayVid[i] = resp;
				var $item_temp = $('<div class="item_linea"></div>');
				var $vid_temp = $('<div class="video"></div>');

				var $titulo = $('<div class="titulo">'+titulo+'</div>');
				var $contenido = $('<div class="inside">'+contenido+'</div>');
				var $des_temp = $('<div class="descripcion"></div>');

				$des_temp.append($titulo);
				$des_temp.append($contenido);

				$item_temp.append($vid_temp);
				$item_temp.append($des_temp);

				$container_temp.append($item_temp);
			}

			$('#linea_holder').append($container_temp);
			$('#linea_holder').append($('<div class="explore"></div>'));

			$('#linea_holder .container .item_linea:first-child').addClass('active');

			actualizarStringTiempo(1 + '/' + data.length);
			parent.calcularCounterBlock(GALERIA, 1, data.length);
			$('#currentTime .current').css({'width' :(1 / data.length) * 100 + '%'});
			
			$('#video-placeholder .explore').on('click', function(){
				$('#linea_holder .item_linea.active').removeClass('active');
				var tl = new TimelineMax();

				if(currentLinea < data.length - 1)
					currentLinea++;
				else
					currentLinea = 0;

				$('#linea_holder .item_linea:nth-child('+(currentLinea + 1)+')').addClass('active');
				tl
					.add('start')
					.to('#linea_holder .container', 1, {css: {'top':  - (currentLinea * 60) + 'vh'},  ease: Elastic.easeOut.config( 1, 0.5)})
				;

				actualizarStringTiempo((currentLinea + 1) + '/' + data.length);
				parent.calcularCounterBlock(GALERIA, (currentLinea + 1), data.length);
				$('#currentTime .current').css({'width' :((currentLinea + 1) / data.length) * 100 + '%'});
			});
		});

		function actualizarStringTiempo(contenido) {
			$('#currentTime .time_num').html(contenido);
		}
	}

	// CARGA DATOS Y LOS CONVIERTE EN UNA VISUALIZACION
	this.cargarDatos = function(elemento){
		var parent = this;
		var carpeta = elemento.extra;
		var function_test = require('../../src/datos/' + carpeta + '/' + carpeta + '.js');

		var titulo_historia = elemento.titulo;
		parent.actualizarTituloElemento(elemento);

		$('#currentTime .current').show();
		$('#cortina').hide();
		var tl = new TimelineMax();
		tl.fromTo('#currentTime .current_title', 0.35, {autoAlpha:0}, {autoAlpha:1})
			.fromTo('#currentTime .time_num', 0.35, {autoAlpha:0}, {autoAlpha:1});
	}

	// ACTUALIZA EL TITULO EN EL VISOR DEL INTERACTIVO
	this.actualizarTituloElemento = function(elemento){
		$('#currentTime .current_title').html(elemento.titulo);
	}

	// INICIO EL TIMEOUT PARA LA BARRA INFERIOR DEL INTERACTIVO
	this.timeOutBarra = function(){
		timeBtm = setTimeout(function(){
			var btm_tl = new TimelineMax();
			btm_tl
			.add(function(){
				$('.btm').addClass('down');
			})
			.fromTo('.btm', 0.35, {y:0}, {y:70,ease: Back. easeOut.config( 2)})
			.fromTo('#currentTime .current_title', 0.35, {autoAlpha:1}, {autoAlpha:0})
			.fromTo('.time_num', 0.35, {autoAlpha:1}, {autoAlpha:0})
			;
		},6000);
	}

	// LIMPIA EL TIMEOUT PARA LA BARRA INFERIOR DEL INTERACTIVO
	this.timeOutClearBarra = function(){
		clearTimeout(timeBtm);
		if($('.btm').hasClass('down')){
			var btm_tl = new TimelineMax();
			btm_tl
			.add(function(){
				$('.btm').removeClass('down');
			})
			.fromTo('.btm', 0.35, {y:70}, {y:0})
			.fromTo('#currentTime .current_title', 0.35, {autoAlpha:0}, {autoAlpha:1})
			.fromTo('.time_num', 0.35, {y:10, autoAlpha:0}, {y:0,autoAlpha:1})
			;
		}
	}

	// ACTUALIZA LAS CLASES DE LOS ELEMENTOS DE LA BARRA INFERIOR SEGUN VA AVANZANDO
	this.actualizarClasesLineaTiempo = function(){
		// Numero del subCapitulo mas uno para CSS
		var num_elemento = this.sub_cap_actual + 1;
		var num_sub_elemento = this.elemento_actual;

		// variable con el subcapitulo actual en la linea del tiempo
		var $sub_actual = $('.items .sub_capitulo:nth-child('+num_elemento+')');

		// Limpiar la linea del tiempo de otras clases
		$('.items .sub_capitulo.sub_capitulo_play').removeClass('sub_capitulo_play');
		$('.items .sub_capitulo.sub_capitulo_played').removeClass('sub_capitulo_played');
		$('.elemento_sub_indicador').removeClass('played');

		// Asignar nuevas clases a los elementos de la linea del tiempo
		$sub_actual.addClass('sub_capitulo_play');
		if(num_elemento > 1){
			for(var t = 1; t < num_elemento; t++){
				$('.items .sub_capitulo:nth-child('+t+')').addClass('sub_capitulo_played');
			}
		}

		// variable con los sub elementos del capitulo actual
		var $sub_elementos_actuales = $sub_actual.find('.elemento_sub_indicador');

		// Asignar nuevas clases a los elementos de la linea del tiempo
		// console.log(num_sub_elemento);
		if(num_sub_elemento > 0){
			for(var t = 0; t < $sub_elementos_actuales.length - 2; t++){
				console.log(num_sub_elemento);
				$sub_elementos_actuales.eq(t).addClass('played');
			}
		}
	}

	// BIND LA NAVEGACION DEL INTERACTIVO
	// LOS BOTONES DEL MENU SUPERIOR
	this.bind_navegacion_primer_nivel = function(){
		var parent = this;

	}

	this.limpiar_player = function(){
		$('#player .capitulos .item.selected').removeClass('selected');
		$('#player .capitulo_actual').empty();
	}

	this.secondsTimeSpanToHMS = function(s) {
	    var h = Math.floor(s/3600); //Get whole hours
	    s -= h*3600;
	    var m = Math.floor(s/60); //Get remaining minutes
	    s -= m*60;

	    s = Math.floor(s);
	    return (m < 10 ? '0'+m : m)+":"+(s < 10 ? '0'+s : s); //zero padding on minutes and seconds
	}

	Number.prototype.map = function (in_min, in_max, out_min, out_max) {
		return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
	}
}

function Capitulo(titulo, elementos){
	// los elementos del capitulo no son elementos son subcapitulos
	this.titulo = titulo;
	this.elementos = elementos;
	this.elemento_actual = 0;

	this.darElementos = function(){
		return elementos;
	}

	this.darNumElementos = function(){
		return elementos.length;
	}

	this.darElementoActual = function(){
		return elementos[this.elemento_actual];
	}

	this.elementoSiguiente = function(){
		this.elemento_actual++;
	}

	this.elementoAnterior = function(){
		this.elemento_actual--;
	}

	this.darNombre = function(){
		return this.titulo;
	}

	this.darElementoNum = function(num) {
		return this.elementos[num];
	}
}

function SubCapitulo(titulo,descripcion, elementos){
	this.titulo = titulo;
	this.descripcion = descripcion;
	this.elementos = elementos;
	this.elemento_actual = 0;

	this.darElementos = function(){
		return elementos;
	}

	this.darNumElementos = function(){
		return elementos.length;
	}

	this.darElementoActual = function(){
		return elementos[elemento_actual];
	}

	this.darElementoNum = function(num) {
		return this.elementos[num];
	}

	this.elementoSiguiente = function(){
		this.elemento_actual++;
	}

	this.elementoAnterior = function(){
		this.elemento_actual--;
	}

	this.darNombre = function(){
		return this.titulo;
	}

	this.darDescripcion = function(){
		return this.descripcion;
	}
}

function Elemento(tipo, extra, titulo){
	// define el tipo del elemento
	this.tipo = tipo;
	// define el titulo del elemento
	this.titulo = titulo;

	// video: id del video en youtube
	// cabezote: descripcion del titulo
	// audio: nombre del archivo del mapa
	this.extra = extra;
}

var magdalena_elementos = [
	new SubCapitulo('Introducción','', [
			new Elemento(AUDIO, 'audio_01', 'Este es un mapa de audio'),
			new Elemento(GALERIA, 'galeria_01', 'Esta es una galeria'),
			new Elemento('cabezote', 'Esto es una descripción del SubCapitulo', 'Introducción'),
			new Elemento(VIDEO, 'wczdECcwRw0', 'Video Introducción'),
		]),
	new SubCapitulo('SubCapitulo 02','', [
			new Elemento('cabezote', 'Esto es una descripción del SubCapitulo', 'Segunda Parte'),
			new Elemento(VIDEO, 'r8BsuT0PWdI', 'Video Introducción 360'),
			new Elemento(VIDEO, 'r8BsuT0PWdI', 'Video Introducción 360'),
			new Elemento(VIDEO, 'TCaOPsxBABE', 'Titulo del video'),
		]),
	new SubCapitulo('SubCapitulo 03','', [
			new Elemento(VIDEO, '0bJQ2guNEsU', 'Titulo del video'),
		]),
	new SubCapitulo('SubCapitulo 04','', [
			new Elemento(VIDEO, 'XBBqc_JbdBs', 'Titulo del video'),
			new Elemento(VIDEO, '1hHSH9sJUEo', 'Titulo del video'),
		])
	];

var magdalena = new Capitulo('Rio Magdalena', magdalena_elementos);
var remanso_paz = new Capitulo('Remanso de paz', magdalena_elementos);
var huella_placer = new Capitulo('Tras las huellas<br>del placer', magdalena_elementos);


var capitulos = [
	magdalena,
	remanso_paz,
	huella_placer,
];

var player = new Player(capitulos);

export default player;