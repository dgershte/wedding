var charTC;

var mIdx = 0;
var mountainTCs = [];

var cIdx = 0;
var cloudTCs = [];

var bIdx = 0;
var badCloudTCs = [];

var pIdx = 0;
var powerupTCs = [];

var screenw = 550;
var screenh = 650;

var rr = 0;
var charx = 100;
var chary = screenh;
var charw = 50;
var charh = 50;

var charspd = 0;
var characc = .5;

var charxspd = 8;
var charface = false;

var lines = [];

var linew = 100;
var hitline = false;

var powerups = [];
var powerupw = 10;
var poweruph = 5;
var ptimer = 0;
var boots = 0;

var currp = -1;

var jumpspd = -12;
var bootspd = -18;

var left = false;
var right = false;

var diffy = 0;

var score = 0;
var baseScore = 0;

var maxCharY = 0;
var maxScore = 0;

var pause = false;

function setup(){
	maxCharY = 0;
	maxScore = 0;
	score = 0;
	baseScore = 0;
	chary = screenh;
	charx = 100;

	charTC = new TileClip("goat");
	charTC.setPivot(19,30);
}

function getMountainTC(){
	if(mIdx < mountainTCs.length){
		mIdx ++;
		return mountainTCs[mIdx-1];
	} else {
		var mountainTC = new TileClip("mountain");
		mountainTC.setPivot(177,5);
		mountainTCs.push(mountainTC);
		mIdx++;
		return mountainTC;
	}
}

function getCloudTC(){
	if(cIdx < cloudTCs.length){
		cIdx ++;
		return cloudTCs[cIdx-1];
	} else {
		var cloudTC = new TileClip("goodCloud");
		cloudTC.setPivot(50,10);
		cloudTCs.push(cloudTC);
		cIdx++;
		return cloudTC;
	}
}

function getBadCloudTC(){
	if(bIdx < badCloudTCs.length){
		bIdx ++;
		return badCloudTCs[bIdx-1];
	} else {
		var badCloudTC = new TileClip("badCloud");
		badCloudTC.setPivot(50,10);
		badCloudTCs.push(badCloudTC);
		bIdx++;
		return badCloudTC;
	}
}

function getPowerupTC(){
	if(pIdx < powerupTCs.length){
		pIdx ++;
		return powerupTCs[pIdx-1];
	} else {
		var powerupTC = new TileClip("powerup");
		powerupTC.setPivot(10,10);
		powerupTCs.push(powerupTC);
		pIdx++;
		return powerupTC;
	}
}

function everyframe(dt){
	if(pause) return;
	
	// Calc shift amount
	diffy = 0;
	if(chary < screenh/2){
		diffy = Math.ceil(screenh/2 - chary);
	}

	createLines();
	calcInputs();
	updatePowerups();

	charspd+=characc;
	chary+=charspd;
	chary+=diffy;

	baseScore += diffy;
	if(diffy > 0){
		maxCharY = Math.ceil(screenh-chary);
	}
	
	if(Math.ceil(screenh - chary) > maxCharY){
		maxCharY = Math.ceil(screenh - chary);
	}
	
	score = Math.max(score, maxCharY + Math.ceil(baseScore));
	
	if(chary > screenh){
		if(baseScore == 0){
			chary = screenh;
			jump();
		}
	}
	
	if(chary > screenh + charh*2){
		if(baseScore != 0){
			pause = true;
		}
	}
	hitline = false;
	
	calcLineHits();
	calcPowerupHits();
	
	if(hitline) { jump(); }

	clearGraphics();

	tcs = [];
	drawLines();
	drawPowerups();
	drawChar();
}

function updatePowerups() {
	if(currp == 0 || currp == 1){
		rr+=5;
		if(rr > 360){
			rr = 0;
			currp = -1;
		}
	} else if(currp==2){
		rr = Math.random()*10-5;
		ptimer ++;
		if(ptimer>50){
			ptimer = 0;
			rr = 0;
			currp = -1;
		} else {
			charspd += -1.2;
		}
	}
}

function calcInputs(){

	if(keyLeft || keyRight){
		//key controls override touch
		left = keyLeft;
		right = keyRight;
		moveLeftRight();

	} else {
		//touch controls
		if(!mouseIsDown){
			left = right = false;
		}

		var targetX = 0;
		if(mouseIsDown){
			locX = canX[0];
			if(locX < charx){
				left = true;
				right = false;
			} else if(locX > charx){
				right = true;
				left = false;
			}
			if(Math.abs(charx-locX)<charxspd){
				targetX = locX;
				if(targetX > charx){
					charface = true;
				} else if(targetX < charx){
					charface = false;
				}
				charx = targetX;
			}
		}
		if(charx != targetX){
			moveLeftRight();
		}
	}
}

function moveLeftRight(){
	if(left && !right){
		charx -= charxspd;
		charface = false;
		if(charx<0){
			charx = 0;
		}
	}
	if(!left && right){
		charx += charxspd;
		if(charx>screenw){
			charx = screenw;
		}
		charface = true;
	}
}

function calcLineHits(){
	var i = 0;
	var hitchar = false;
	
	while(i < lines.length){
		var line = lines[i];
		line._y += diffy;
		
		if(line._y > screenh){
			lines.splice(i,1);
			continue;
		}

		var dishit = false;

		if(!hitchar){
			//overlapx
			if(line._x < charx+charw/2 && charx-charw/2 < line._x+linew){
				//overlapy
				if(chary<line._y && chary+charspd+characc >= line._y  && charspd>=0){
					chary = line._y;
					hitline = true;
					hitchar = true;
					dishit = true;
				}
			}
		}

		switch(line._ltype){
			case 0: break;// nothing 
			case 1: // breakable
				if(dishit){
					lines.splice(i,1);
					continue;
				}
				break;
			case 2: // moving
				if(line._dir){
					line._x += line._spd;
					if(line._x + linew > screenw){
						line._dir = false;
					}
				} else {
					line._x -= line._spd;
					if(line._x < 0){
						line._dir = true;
					}
				}
		}
		
		i++;
	}
}

function calcPowerupHits(){
	var i = 0;
					
	var hitchar = false;

	while(i<powerups.length){
		var powerup = powerups[i];
		powerup._y+=diffy;
		
		if(powerup._y>screenh){
			powerups.splice(i,1);
			continue;
		}

		if(!hitchar){
		
			//overlapx
			if(powerup._x <= charx+charw/2 && charx-charw/2 <= powerup._x){
				//overlapy
				if(chary >= powerup._y-poweruph/2 && chary-charh <= powerup._y-poweruph/2){
					if((powerup._ptype < 2 && charspd >=0) //trampoline
						|| powerup._ptype >=2){ // jetpack / boots
						switch(powerup._ptype){
							case 0:
								chary = powerup._y;
								jump(1.75);
								currp = 0;
								break;
							case 1:
								chary = powerup._y;
								jump(2.5);
								currp = 1;
								break;
							case 2://rocket
								if(charspd>0){
									charspd = 0;
								}
								boots = 0;
								currp = 2;
								break;
							case 3:
								setBoots();
								break;
						}
						powerups.splice(i,1);
						hitchar = true;
						continue;
					}
				}
			}
		}

		i++;
	}
}

function jump(mult = 1){
	if(boots == 0){
		charspd = jumpspd*mult;
	} else {
		boots --;
		charspd = bootspd*mult;
	}
	hitline = false;
}

function setBoots(){
	boots = 5;
}

function createLines(){
	var lasty = screenh;
	if(lines.length == 0){
		lasty = screenh;
	} else {
		lasty = lines[lines.length-1]._y;
	}
	
	while(lasty > -screenh/2){
		//create line
		var newx = Math.random()*(screenw-linew);
		if(lines.length <3){
			newx = Math.random()*(screenw/2-linew)+screenw/2
		}
		var newy = lasty-40-Math.random()*30;
		var newtype = Math.floor(Math.random()*3);
		lines.push(new Line(newx, newy, newtype));
		lasty = lines[lines.length-1]._y;
		
		if(newtype == 0){
			if(Math.random()>.5){
				// create powerup
				var newpx = newx + Math.random()*(linew-powerupw)+powerupw/2;
				var newpy = lasty;
				var newptype = Math.floor(Math.random()*4);
				var p_up = new Powerup(newpx,newpy,newptype);
				powerups.push(p_up);
			}
		}
	}
}

function drawLines(){
	var i = lines.length-1;
	while(i>=0){
		var line = lines[i];

		//drawLine(line._x, line._y, line._x+linew, line._y);

		var tc;
		if(line._ltype==0){
			tc = getMountainTC();
		} else if(line._ltype == 1){
			tc = getBadCloudTC();
		} else {
			tc = getCloudTC();
		}
		tc._x = line._x + linew/2;
		tc._y = line._y;
		tcs.push(tc);

		i--;
	}
}

function drawPowerups(){
	var i =0;
	while(i<powerups.length){
		var powerup = powerups[i];

		var tc = getPowerupTC();
		if(powerup._ptype==0){
			tc.setFrame(3);
		} else if(powerup._ptype == 1){
			tc.setFrame(4);
		} else if(powerup._ptype == 2){
			tc.setFrame(2);
		} else if(powerup._ptype == 3){
			tc.setFrame(1);
		}
		tc._x = powerup._x;
		tc._y = powerup._y;
		tcs.push(tc);
		//drawRect(powerup._x-powerupw/2,powerup._y-poweruph,powerupw,poweruph);
		i++;
	}
}

function drawChar(){
	var rot = rr*Math.PI/180;
	var sin = Math.sin(rot)*charw/2;
	var cos = Math.cos(rot)*charh/2;
	var p0 = new Point(charx+cos-sin, chary-charh/2+sin+cos);
	var p1 = new Point(charx-cos-sin, chary-charh/2-sin+cos);
	var p2 = new Point(charx-cos+sin, chary-charh/2-sin-cos);
	var p3 = new Point(charx+cos+sin, chary-charh/2+sin-cos);
	drawLine(p0.x,p0.y,p1.x,p1.y);
	drawLine(p1.x,p1.y,p2.x,p2.y);
	drawLine(p2.x,p2.y,p3.x,p3.y);
	drawLine(p3.x,p3.y,p0.x,p0.y);

	charTC._x = charx;
	charTC._y = chary;

	tcs.push(charTC);
}

function drawLine(x0,y0,x1,y1){
}

function drawRect(x,y,w,h){
}

function clearGraphics(){
//TODO
}

function Point(x,y){
	this.x = x;
	this.y = y;
}

function Line(x,y,t){
	this._x = x;
	this._y = y;
	this._ltype = t;
	this._dir = Math.random()>.5;
	this._spd = Math.random()*4+1;
}

function Powerup(x,y,t){
	this._x = x;
	this._y = y;
	this._ptype = t;
}
