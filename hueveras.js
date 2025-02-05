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

let bg_z = -2;
let huevera_bg_rotation = 90;
let huevo_bg_x = canvas_w / 2 + 100;
let huevo_bg_scale = [0.75, 1];

let huevera_white, huevera_brown, huevera_gold;
let huevera_x = 100, huevera_y = canvas_h / 2 - 100, huevera_y_dif=100;
let huevera_scale = 0.5;

let huevos = [], huevos_moving = [];
let huevo_shadow;
let huevos_num = 10; 
let huevo_x_min = 325, huevo_x_max = 675;
let huevo_y_start = -50, huevo_y_end = canvas_h + 50;
let huevo_drag_z = 5;
let huevo_hidden_x = -1000, huevo_hidden_y = -1000;
let huevo_scale = 0.75, huevo_drag_scale = huevo_scale * 1.5;
let egg_generating = false;
let huevo_time = 2000;
let huevo_offset = 8;

let white = Phaser.Display.Color.GetColor(255,255,255,255);
let brown = Phaser.Display.Color.GetColor(205,133,63,255);
let gold = Phaser.Display.Color.GetColor(255,215,0,255);
let black = Phaser.Display.Color.GetColor(0,0,0,127);

let huevo_type = [
	{color: white, percent: 35, points: 10, name: "white"},
	{color: brown, percent: 50, points: 5, name: "brown"},
	{color: gold, percent: 15, points: 25, name: "gold"}
];
let new_total_percent = 100;
class Huevo {
	constructor(scene, posX, posY, image_name){
		//Select a random type
		let random = Phaser.Math.Between(0, new_total_percent - 1);
		let acumulated_percent = 0;
		let index_type = null;
		huevo_type.map(function(type, index){
			this.percent += type.percent;
			if(this.random < this.percent && index_type == null){
				console.log(type.name);
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
		this.isDragging = false;
	}
}
//Crear clase huevo?
//let isDragging
//let image;
let egg_percentages = [35, 50, 15];
let egg_colors = [white, brown, gold];
let egg_points = [10, 5, 25];
//construct
//function dragEgg(){}

let text_timer
let interval_timer;
let timer = 10;
let timer_y = 50;
let timer_size = '50px';
function updateTimer(){
	timer--;
	text_timer.setText(timer);
	if(timer <= 0){
		clearInterval(interval_timer);
		return;
	}
}
function createHuevo(){

}
function precarga (){
	this.load.image('huevera', 'imgs/huevera.png');
	this.load.image('huevo', 'imgs/huevo_blanco.png');
	this.load.image('bg', 'imgs/grass_bg.png');
	this.load.image('huevera_bg', 'imgs/straw_bg.png');
	this.load.image('huevo_bg', 'imgs/cinta.png');
}

function crea (){
	//Backgrounds
	let bg_image = this.add.image(canvas_w / 2, canvas_h / 2, 'bg');
	bg_image.setOrigin(0.5, 0.5);
	bg_image.setDepth(bg_z);

	let huevera_bg = this.add.image(huevera_x, canvas_h / 2, 'huevera_bg');
	huevera_bg.setAngle(huevera_bg_rotation);
	huevera_bg.setScale(huevera_scale);

	let huevo_bg = this.add.image(huevo_bg_x, canvas_h / 2, 'huevo_bg');
	huevo_bg.setScale(huevo_bg_scale[0],huevo_bg_scale[1]);

	text_timer = this.add.text(canvas_w / 2, timer_y, timer, {fontSize: timer_size});
	text_timer.setOrigin(0.5, 0.5);
	//Hueveras
	huevera_white = this.add.image(huevera_x, huevera_y, 'huevera');
	huevera_white.setScale(huevera_scale);
	huevera_white.setTint(white);
	huevera_y += huevera_y_dif;

	huevera_brown = this.add.image(huevera_x, huevera_y, 'huevera');
	huevera_brown.setScale(huevera_scale);
	huevera_brown.setTint(brown);
	huevera_y += huevera_y_dif;

	huevera_gold = this.add.image(huevera_x, huevera_y, 'huevera');
	huevera_gold.setScale(huevera_scale);
	huevera_gold.setTint(gold);

	//Huevos
	huevo_shadow = this.add.image(huevo_hidden_x, huevo_hidden_y, 'huevo');
	huevo_shadow.setScale(huevo_drag_scale);
	huevo_shadow.setTint(black);
	
	let total_percent = egg_percentages.reduce(function(total, current){ 
		return total + current;
	}, 0);
	for(let i = 0; i < huevos_num; i++){
		huevos[i] = this.add.image(huevo_hidden_x, huevo_hidden_y, 'huevo');
		huevos[i].setScale(huevo_scale);
		huevos[i].setInteractive({draggable:true});
		//Select a random percent
		let random = Phaser.Math.Between(0, total_percent - 1);
		let color = egg_colors[0];
		let acumulate_percent = 0;
		for(let j = 0; j < egg_percentages.length; j++){
			acumulate_percent += egg_percentages[j];
			if(random < acumulate_percent){
				color = egg_colors[j];
				random = total_percent;
			}
		}
		huevos[i].setTint(color);
	}

	//Inputs
	this.cursors = this.input.keyboard.createCursorKeys();
	this.input.on("pointerdown", function(pointer, object, x, y){
		object.x = x;
		object.y = y;
		huevo_shadow.x = x + huevo_offset;
		huevo_shadow.y = y + huevo_offset;
		object[0].setScale(huevo_drag_scale);
		object[0].setDepth(huevo_drag_z);
		huevo_shadow.setDepth(huevo_drag_z);
	});
	this.input.on("drag", function(pointer, object, x, y){
		object.x = x;
		object.y = y;
		huevo_shadow.x = x + huevo_offset;
		huevo_shadow.y = y + huevo_offset;

		if(Phaser.Geom.Intersects.RectangleToRectangle(huevera_white.getBounds(), object.getBounds())){
			console.log("huevo en huevera blanca");
		}
		if(Phaser.Geom.Intersects.RectangleToRectangle(huevera_brown.getBounds(), object.getBounds())){
			console.log("huevo en huevera marron");
		}
		if(Phaser.Geom.Intersects.RectangleToRectangle(huevera_gold.getBounds(), object.getBounds())){
			console.log("huevo en huevera dorada");
		}
	});				
	this.input.on("dragend", function(pointer, object, x, y){
		object[0].setScale(huevo_scale);
		huevo_shadow.x = huevo_hidden_x;
		huevo_shadow.y = huevo_hidden_y;
	});
	interval_timer = setInterval(updateTimer, 1000);
	let huevon = new Huevo(this, canvas_w / 2, canvas_h / 2, 'huevo');
}
function moveEgg(){
	if(huevos.length <= 0)
		return;
	//Put the last egg in the huevos_moving
	huevos_moving.push(huevos.shift());
	//Put the egg in a random x and the corresponent y position
	random = Phaser.Math.Between(huevo_x_min, huevo_x_max);
	let last_element = huevos_moving.length - 1;
	huevos_moving[last_element].setPosition(random, huevo_y_start);

	egg_generating = false;
}

function actualiza (){
	if(!egg_generating){
		setTimeout(moveEgg, huevo_time);
		egg_generating = true;
	}
	if(huevos_moving.length <= 0)
		return;
	for(let i = 0; i<huevos_moving.length; i++){
		if(huevos_moving[i].scale == huevo_drag_scale){
			huevos_moving.splice(i, 1);
			break;
		}
		huevos_moving[i].y += 1;
		if(huevos_moving[i].y >= huevo_y_end){
			let huevo = huevos_moving.splice(i, 1);
			huevos.push(huevo[0]);
		}
	}
}

