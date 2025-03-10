let canvas_w = 800;
let canvas_h = 450;

let config = {
	width:canvas_w,
	height:canvas_h,
	scene: {
		preload: precarga,
		create: crea,
		update: actualiza
	}
};

let game = new Phaser.Game(config);

let game_over = false;
let game_over_txt;

let points = 0;
let points_txt;
let points_txt_y = 50;
let points_txt_size = '25px';

let bg_music, game_over_music;
let good_sfx, bad_sfx, pickup_sfx;

let white = Phaser.Display.Color.GetColor(255,255,255,255);
let brown = Phaser.Display.Color.GetColor(205,133,63,255);
let gold = Phaser.Display.Color.GetColor(255,215,0,255);
let black = Phaser.Display.Color.GetColor(0,0,0,127);
let red = Phaser.Display.Color.GetColor(255,0,0,255);

let bg_z = -2;
let huevera_bg_rotation = 90;
let huevo_bg_x = canvas_w / 2 + 100;
let huevo_bg_scale = [0.75, 1];

let huevera_white, huevera_brown, huevera_gold;
let huevera_x = 100, huevera_y = canvas_h / 2 - 100, huevera_y_dif=100;
let huevera_scale = 0.5;

let huevos = []; //huevos_moving = [];
let huevo_shadow;
let huevo_x_min = 325, huevo_x_max = 675;
let huevo_y_start = -50, huevo_y_end = canvas_h + 50;
let huevo_drag_z = 5; huevo_shadow_z = 4;
let huevo_hidden_x = -1000, huevo_hidden_y = -1000;
let huevo_scale = 0.75, huevo_drag_scale = huevo_scale * 1.5;
let huevo_time = 2000;
let huevo_offset = 8;

let huevo_type = [
	{color: white, percent: 35,
	time_up: 5, time_down: 3,
	points: 10, speed: 1.25},

	{color: brown, percent: 50, 
	time_up: 3, time_down: 3,
	points: 5, speed: 1},

	{color: gold, percent: 15, 
	time_up: 10, time_down: 5,
	points: 25, speed: 2}
];
let total_percent = 100;
class Huevo {
	image;
	time_up;
	time_down;
	points;
	speed;
	constructor(scene, posX, posY, image_name){
		//Select a random type
		let random = Phaser.Math.Between(0, total_percent - 1);
		let acumulated_percent = 0;
		let index_type = null;
		huevo_type.map(function(type, index){
			this.percent += type.percent;
			if(this.random < this.percent && index_type == null){
				index_type = index;
			}
		},
		{random: random, percent: acumulated_percent});
		//Define huevo
		this.image = scene.add.image(posX, posY, image_name);
		this.image.setScale(huevo_scale);
		this.image.setInteractive({draggable:true});
		this.image.setTint(huevo_type[index_type].color);
		
		this.points = huevo_type[index_type].points;
		this.speed = huevo_type[index_type].speed;
		this.time_up = huevo_type[index_type].time_up;
		this.time_down = huevo_type[index_type].time_down;
	}
	move(){
		if(this.image.scale == huevo_drag_scale){
			return;
		}

		this.image.y += this.speed;
	}
	checkY(){
		return this.image.y >= huevo_y_end;
	}
	destroy(){
		this.image.destroy();
	}
}

let text_timer;
let timer = 60;
let timer_y = 50;
let timer_size = '50px';
let danger_time = 10;
let normal_rate = 1.0, danger_rate = 2.0;

let interval_timer, interval_huevo;

function gameOver(){
	game_over = true;
	//Set points and game_over text visible
	game_over_txt.setVisible(true);
	points_txt.setText(points_txt.text + points);
	points_txt.setVisible(true);
	//Change music
	bg_music.stop();
	game_over_music.play();
	//Set timer = 0
	timer = 0;	
	text_timer.setText(timer);
	/*
	if(huevos.length > 0){
		for(let i = 0; i < huevos.length; i++){
			huevos[i].destroy();
			huevos.splice(i, 1);
		}
	}
	*/
}
function updateTimer(){
	if(timer <= 0){
		text_timer.setTint(red);
		if(!game_over)
			gameOver();
		clearInterval(interval_timer);
		return;
	}

	timer--;
	text_timer.setText(timer);

	if(timer <= danger_time){
		bg_music.setRate(danger_rate);
		text_timer.setTint(red);
	}
	else{
		bg_music.setRate(normal_rate);
		text_timer.setTint(white);
	}
}
function createHuevera(scene, color){
	huevera = scene.add.image(huevera_x, huevera_y, 'huevera');
	huevera.setScale(huevera_scale);
	huevera.setTint(color);
	huevera_y += huevera_y_dif;
	return huevera;
}
function createHuevo(scene){
	if(game_over){
		clearInterval(interval_huevo);
		return;
	}
	huevo_x = Phaser.Math.Between(huevo_x_min, huevo_x_max);
	let huevo = new Huevo(scene, huevo_x, huevo_y_start, 'huevo');
	huevos.push(huevo);
}
function precarga (){
	this.load.image('huevera', 'imgs/huevera.png');
	this.load.image('huevo', 'imgs/huevo_blanco.png');
	this.load.image('bg', 'imgs/grass_bg.png');
	this.load.image('huevera_bg', 'imgs/straw_bg.png');
	this.load.image('huevo_bg', 'imgs/cinta.png');

	this.load.audio('bg_music', 'audio/background.mp3', {stream: true});
	this.load.audio('game_over_music', 'audio/game_over.mp3', {stream: true});
	this.load.audio('pickupHuevo_sfx', 'audio/pickupHuevo.wav', {stream: true});
	this.load.audio('goodHuevera_sfx', 'audio/goodHuevera.wav', {stream: true});
	this.load.audio('badHuevera_sfx', 'audio/badHuevera.wav', {stream: true});
}

function crea (){
	//Audio
	bg_music = this.sound.add('bg_music', {loop: true});
	bg_music.play();
	game_over_music = this.sound.add('game_over_music', {volume: 0.5});
	pickup_sfx = this.sound.add('pickupHuevo_sfx');
	good_sfx = this.sound.add('goodHuevera_sfx');
	bad_sfx = this.sound.add('badHuevera_sfx');


	//Backgrounds
	let bg_image = this.add.image(canvas_w / 2, canvas_h / 2, 'bg');
	bg_image.setOrigin(0.5, 0.5);
	bg_image.setDepth(bg_z);

	let huevera_bg = this.add.image(huevera_x, canvas_h / 2, 'huevera_bg');
	huevera_bg.setAngle(huevera_bg_rotation);
	huevera_bg.setScale(huevera_scale);

	let huevo_bg = this.add.image(huevo_bg_x, canvas_h / 2, 'huevo_bg');
	huevo_bg.setScale(huevo_bg_scale[0],huevo_bg_scale[1]);
	
	//Texts
	text_timer = this.add.text(canvas_w / 2, timer_y, timer, {fontSize: timer_size});
	text_timer.setOrigin(0.5, 0.5);

	game_over_txt = this.add.text(canvas_w / 2, canvas_h / 2, "GAME OVER", {fontSize: '75px'});
	game_over_txt.setOrigin(0.5, 0.5);
	game_over_txt.setVisible(false);

	points_txt_y = game_over_txt.y + points_txt_y;

	points_txt = this.add.text(game_over_txt.x, points_txt_y, "points: ", {fontSize: points_txt_size});
	points_txt.setOrigin(0.5, 0.5);
	points_txt.setVisible(false);

	//Hueveras
	huevera_white = createHuevera(this, white);
	huevera_brown = createHuevera(this, brown);
	huevera_gold = createHuevera(this, gold);
	
	//Huevos
	huevo_shadow = this.add.image(huevo_hidden_x, huevo_hidden_y, 'huevo');
	huevo_shadow.setScale(huevo_drag_scale);
	huevo_shadow.setTint(black);
	huevo_shadow.setDepth(huevo_shadow_z);
	
	//Inputs
	this.cursors = this.input.keyboard.createCursorKeys();
	this.input.on("pointerdown", function(pointer, object, x, y){
		if(game_over)
			return;
		if(object[0] == null)
			return;
		object.x = x;
		object.y = y;
		huevo_shadow.x = x + huevo_offset;
		huevo_shadow.y = y + huevo_offset;
		object[0].setScale(huevo_drag_scale);
		object[0].setDepth(huevo_drag_z);
		pickup_sfx.play();
	});
	this.input.on("drag", function(pointer, object, x, y){
		if(game_over)
			return;
		//Put object on the cursor position
		object.x = x;
		object.y = y;
		huevo_shadow.x = x + huevo_offset;
		huevo_shadow.y = y + huevo_offset;

		//Check if the object collided with a huevera
		let hueveras = [huevera_white, huevera_brown, huevera_gold];
		let check_colision = [];
		let touch = false;
		let correct_touch = false;
		for(let i = 0; i < hueveras.length; i++){
			if(Phaser.Geom.Intersects.RectangleToRectangle(hueveras[i].getBounds(), object.getBounds())){
				touch = true;
				let dif_y = hueveras[i].y - object.y;
				if(dif_y < 0)
					dif_y *= -1

				if(object.tintTopLeft == hueveras[i].tintTopLeft){
					check_colision.push({good: true, dif_y: dif_y});
				}
				else{
					check_colision.push({good: false, dif_y: dif_y});
				}
			}
		}
		//If there is no touch return
		if(check_colision.length <= 0)
			return

		//Check if object only collided with good huevera
		let good_huevera = false;
		if(check_colision.length == 1){
			good_huevera = check_colision[0].good;
		} //Else check what huevera has the lower diference to the object
		else{
			let closest_huevera = check_colision[0];
			check_colision.map(function(colision){
				if(colision.dif_y < closest_huevera.dif_y){
					closest_huevera = colision;
				}
			});
			good_huevera = closest_huevera.good;
		}

		//Check if good_huevera
		huevo_type.map(function(type){
			if(object.tintTopLeft == type.color){
				if(good_huevera){
					good_sfx.play();
					timer += type.time_up;
					text_timer.setText(timer);
					points += type.points;
				}
				else{
					bad_sfx.play();
					timer -= type.time_down;
					text_timer.setText(timer);
					if(timer < 0 && !game_over)
						gameOver();
				}
			}
		});

		//Check timer
		if(timer <= danger_time){
			bg_music.setRate(danger_rate);
			text_timer.setTint(red);
		}
		else{
			bg_music.setRate(normal_rate);
			text_timer.setTint(white);
		}
		object.destroy();
		huevo_shadow.x = huevo_hidden_x;
		huevo_shadow.y = huevo_hidden_y;
	});				
	this.input.on("dragend", function(pointer, object, x, y){
		if(game_over)
			return;
		object.setScale(huevo_scale);
		huevo_shadow.x = huevo_hidden_x;
		huevo_shadow.y = huevo_hidden_y;
	});
	interval_timer = setInterval(updateTimer, 1000);
	interval_huevo = setInterval(createHuevo, huevo_time, this);
}
function actualiza (){
	if(game_over){
		return;
	}

	for(let i = 0; i < huevos.length; i++){
		huevos[i].move();
		if(huevos[i].checkY()){
			huevos[i].destroy();
			huevos.splice(i, 1);
		}
	}
}

