setTimeout(function () {
	$('.load-screen').closest('.screen-wrap').css('display', 'none');
	$('.set-lang-screen').closest('.screen-wrap').css('display', 'block');
}, 1000)

a = '';
i = 1;
setInterval(function () {
	if (i <= 7) {
		a += '.';
		i++;
	}
	if (i == 7) {
		a = '';
		i = 1;
	}
	$('.anim-load span.points').text(a);
}, 300)

$('.back').on('click', function () {
	$(this).closest('.screen-wrap').css('display', 'none');
})

$('.item').on('click', function () {
	localStorage.setItem('player', $(this).attr('data-id'));
	window.location.reload();
})

$('.set-lang-screen button').on('click', function () {
	localStorage.setItem('lang', $(this).attr('id'));
	if ($(this).attr('id') == 'kz') {
		$('.start').text('Бастау');
		$('.settings').text('Баптаулар');
		$('.servers').text('Серверлер');
		$('.servers-screen h2').text('Серверлер тізімі:');
		$('.servers-screen .anim-load span.text').text('Жүктеу');
		$('.workshop').text('Шеберхана');
		$('.about').text('Ойын туралы');
		$('input').attr('placeholder', 'Өз атыңызды енгізіңіз');
		$('.next').text('Әрі қарай');
		$('.back').text('Артқа');
		$('.set-lang-screen').closest('.screen-wrap').css('display', 'none');
		$('.set-name-screen').closest('.screen-wrap').css('display', 'block');
	}
	else if ($(this).attr('id') == 'en') {
		$('.start').text('Start');
		$('.settings').text('Setting');
		$('.servers').text('Servers');
		$('.servers-screen h2').text('List of servers:');
		$('.servers-screen .anim-load span.text').text('Loading');
		$('.workshop').text('Workshop');
		$('.about').text('About');
		$('input').attr('placeholder', 'Please enter your name');
		$('.next').text('Next');
		$('.back').text('Back');
		$('.set-lang-screen').closest('.screen-wrap').css('display', 'none');
		$('.set-name-screen').closest('.screen-wrap').css('display', 'block');
	}
	else {
		$('.set-lang-screen').closest('.screen-wrap').css('display', 'none');
		$('.set-name-screen').closest('.screen-wrap').css('display', 'block');
	}
})

$('.next').on('click', function () {
	localStorage.setItem('name', $('input').val());
	$('.set-name-screen').closest('.screen-wrap').css('display', 'none');
	$('.menu-screen').closest('.screen-wrap').css('display', 'block');
})

$('.servers').on('click', function () {
	$('.servers-screen').closest('.screen-wrap').css('display', 'block');
})

$('.workshop').on('click', function () {
	$('.workshop-screen').closest('.screen-wrap').css('display', 'block');
})

$('.start').on('click', function () {
	$('.container .screen-wrap').css('display', 'none');




	var objWidth = 40;
	var objHeight = 40;
	var arrowWidth = 15;
	var arrowHeight = 100;
	var screenWidth = $(document).width();
	var screenHeight = $(document).height();


	let gameScene = new Phaser.Scene('Game');

	let config = {
		type: Phaser.AUTO,
		width: 1366,
		height: 768,
		physics: {
			default: "arcade",
			arcade: {
				gravity: false
			},
		},
		scene: {
			preload: preload,
			create: create,
			update: update,
		}
	};

	var background, player, arrow, score;
	var a = 0;
	var move = false;

	if (localStorage.getItem('lang') == 'kz') {
		scoreString = localStorage.getItem('name') + ', Санауыш:';
	}
	else if (localStorage.getItem('lang') == 'en') {
		scoreString = localStorage.getItem('name') + ', Score:';
	}
	else {
		scoreString = localStorage.getItem('name') + ', Счёт:';
	}

	var game = new Phaser.Game(config);

	function preload() {
		this.load.setBaseURL('https://lytsites.github.io');

		this.load.image('background', 'img/background.png');
		this.load.image('player', 'img/player_' + localStorage.getItem('player') + '.png',);
		this.load.image('purpose', 'img/purpose.png');
		this.load.image('arrow', 'img/arrow.png');
	}

	function create() {


		// Background
		background = this.add.image(screenWidth / 2, screenHeight / 2, 'background');
		background.displayWidth = screenWidth;
		background.displayHeight = screenHeight;

		// Objects
		player = this.physics.add.sprite(screenWidth / 2, screenHeight - 150, 'player');
		player.displayWidth = objWidth;
		player.displayHeight = objHeight;

		purpose = this.physics.add.sprite(screenWidth / 2, (screenHeight / 2) - 100, 'purpose');
		purpose.displayWidth = objWidth;
		purpose.displayHeight = objHeight;
		purpose.setCollideWorldBounds(true);

		// Arrow
		arrow = this.add.image(screenWidth / 2 - arrowWidth / 2, screenHeight - 175, 'arrow').setOrigin(0.5,1);
		arrow.displayWidth = arrowWidth;
		arrow.displayHeight = arrowHeight;

		// Text
		score = 0;
		scoreboard = this.add.text(0, 0, scoreString, { font: '32px Bahnschrift' });
		this.input.keyboard.on('keydown', function (event) {
			if (event.code == 'Space') {
				player.rotation = arrow.rotation;
				player.setVelocityX(500 * player.rotation);
				player.setVelocityY(-500);
				move = true;
			}
		});

		this.physics.add.collider(player, purpose, stopMoveWithCollid, null, this);

	}

	function update() {

		if (player.x <= 0 || player.y <= 0 || player.x >= screenWidth || player.y >= screenHeight) {
			stopMove();
		}

		scoreboard.setText(scoreString + score);

		if (!move) {
			a += 0.035;
		}
		else {
			a += 0;
		}
		arrow.rotation = Math.cos(a);
	}

	function stopMoveWithCollid () {

		score += 1;

		player.setVelocityX(0);
		player.setVelocityY(0);

		setTimeout(function () {
			player.x = screenWidth / 2;
			player.y = screenHeight - 150;
			move = false;

			purpose.x = screenWidth / 2;
			purpose.y = (screenHeight / 2) - 100;
		}, 1000)

		purpose.rotation += 150;

	}

	function stopMove () {

		player.setVelocityX(0);
		player.setVelocityY(0);

		setTimeout(function () {
			player.x = screenWidth / 2;
			player.y = screenHeight - 150;
			move = false;

			purpose.x = screenWidth / 2;
			purpose.y = (screenHeight / 2) - 100;
		}, 1)

	}


})