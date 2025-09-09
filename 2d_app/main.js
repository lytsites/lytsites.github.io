currentLanguage = localStorage.getItem('selectedLanguage') || 'ru';

translations = {
	'.h2': {
		'ru': 'Поздравляем',
		'kk': 'Құттықтаймыз'
	},
	'.h1': {
		'ru': 'Главное меню',
		'kk': 'Негізгі мәзір'
	},
	'.start-button': {
		'ru': 'Начать игру',
		'kk': 'Ойынды бастаңыз'
	},
	'.history-button': {
		'ru': 'История',
		'kk': 'Тарих'
	},
	'.language-button': {
		'ru': 'Русский язык',
		'kk': 'Қазақ тілі'
	},
	'.title': {
		'ru': 'История и правила игры',
		'kk': 'Тарих және ойын ережелері'
	},
	'.history': {
		'ru': 'Асык ату – одна из древнейших игр кочевников. По мнению ученых-этнографов, она появилась на территории Казахстана еще в первом тысячелетии до нашей эры и связана с животноводством и охотой. Возрастного ценза для участия в игре нет: соревноваться на меткость могут и школьники, и пенсионеры. Два года назад национальная игра асык ату была включена в репрезентативный список нематериального культурного наследия человечества ЮНЕСКО.<br>Правила игры в асыки несложные. Косточки выставляются в ряд (на кон), задача игроков – с определенного расстояния выбить один или сразу несколько из них своим асыком (сака). Те косточки, которые удастся выбить, становятся добычей игрока.<br>Сака имеется у каждого, кто играет в асык ату. Обычно для него выбирается самый крупный и, соответственно, самый тяжелый асык из имеющихся в коллекции. Для большего утяжеления в биток заливают свинец и обматывают медной или алюминиевой проволокой. В древности у привилегированных ханских и султанских детей сака заливался даже золотом. В казахской народной сказке «Алтын сака» («золотой сака») хорошо передана ценность этого асыка. Ради нее мальчик чуть не погибает от рук злой колдуньи.',
		'kk': 'Асық ату-көшпенділердің ең көне ойындарының бірі. Ғалым-этнографтардың пікірінше, ол біздің дәуірімізге дейінгі бірінші мыңжылдықта Қазақстан аумағында пайда болған және мал шаруашылығымен және аңшылықпен байланысты. Ойынға қатысу үшін жас шегі жоқ: мектеп оқушылары да, зейнеткерлер де дәлме-дәл бәсекеге түсе алады. Екі жыл бұрын асық ату ұлттық ойыны ЮНЕСКО-ның Адамзаттың материалдық емес мәдени мұрасының өкілдік тізіміне енгізілді.<br>Асық ойнау ережесі күрделі емес. Сүйектер қатарға қойылады (кон), ойыншылардың міндеті-белгілі бір қашықтықтан олардың біреуін немесе бірнешеуін бірден асықпен (сақ) қағу. Нокаутқа түсетін сүйектер ойыншының олжасына айналады.<br>Асық ату ойынын ойнайтындардың барлығында сақа бар. Әдетте ол үшін коллекциядағы ең үлкен және сәйкесінше ең ауыр асық таңдалады. Үлкен салмақ үшін қорғасын допқа құйылады және мыс немесе алюминий сыммен оралады. Ежелгі уақытта артықшылықты хан және Сұлтан балаларының арасында сақа тіпті алтынға толған. Қазақ халық ертегісінде" Алтын сақа "("Алтын сақа") осы асықтың құндылығын жақсы жеткізген. Ол үшін бала зұлым сиқыршының қолынан өле жаздайды.'
	},
}

function translate(key, language) {
	translation = translations[key] ? translations[key][language] : translations[key]['ru'];
	return translation || key;
}

function changeLanguage() {
	currentLanguage = (currentLanguage === 'ru') ? 'kk' : 'ru';
	localStorage.setItem('selectedLanguage', currentLanguage);

	updateText();
}

function updateText() {
	const elementsToUpdate = ['.h2', '.h1', '.start-button', '.history-button', '.language-button', '.title', '.history'];

	elementsToUpdate.forEach(function(element) {
		$(element).text(translate(element, currentLanguage));
	});
}


function initializeGame () {
	var config = {
		type: Phaser.AUTO,
		parent: 'game-container',
		width: window.innerWidth,
		height: window.innerHeight,
		physics: {
			default: 'arcade',
			arcade: {
				gravity: { y: 0 },
				debug: false
			}
		},
		scene: {
			preload: preload,
			create: create,
			update: update
		},
		scale: {
			mode: Phaser.Scale.RESIZE, // режим изменения размеров
			autoCenter: Phaser.Scale.CENTER_BOTH // центрирование
		}
	};

	var game = new Phaser.Game(config);

	var player_1;
	var player_2;
	var bitkas;
	var arena;
	var row;
	var powerMeter;
	var currentPlayer;
	var spaceKey;
	var isShooting;
	var shootDirection = 0;
	var constSpeed = 15000;
	var gameWidth = game.config.width;
	var gameHeight = game.config.height;
	var arrowDuration = 1500;
	var powerMeterDuration = 1000;
	var throwsCount = 0;
	var maxThrows = 5;

	function preload () {
		this.load.image('background', 'assets/images/background.jpg');
		this.load.image('arena', 'assets/images/arena_background_1.png');
		this.load.image('player_1', 'assets/images/poses/1-red.png');
		this.load.image('player_2', 'assets/images/poses/1-yellow.png');
		this.load.image('bitka', 'assets/images/poses/1-white.png');
		this.load.image('arrow', 'assets/images/arrow.png');
		this.load.image('powerMeter', 'assets/images/power_meter.png');
	}

	function create () {
		// background
		background = this.add.image(0, 0, 'background').setOrigin(0, 0);


		// arena
		arena = this.add.image(gameWidth / 2, gameHeight / 2 - 100, 'arena');
		arena.setDisplaySize(400, 400);


		// players
		player_1 = this.physics.add.sprite(gameWidth / 2, gameHeight - 100, 'player_1');
		player_1.setDisplaySize(45, 45);
		this.physics.world.enable(player_1);


		player_2 = this.physics.add.sprite(gameWidth / 2, gameHeight - 100, 'player_2');
		player_2.setDisplaySize(45, 45);
		this.physics.world.enable(player_2);
		player_2.visible = false;


		currentPlayer = player_1;
		currentPlayer.body.setCollideWorldBounds(true);


		// bitkas
		bitkas = this.physics.add.group({
			key: 'bitka',
			repeat: 4,
			setXY: {x: gameWidth / 2 - 140, y: gameHeight / 2 - 100, stepX: 70}
		})
		bitkas.children.iterate(function (child) {
			child.setDisplaySize(45, 45);
			child.body.setCollideWorldBounds(true);
		})


		// arrow
		arrow = this.add.sprite(gameWidth / 2, gameHeight - 100, 'arrow').setOrigin(1, 0.5);
		arrow.setDisplaySize(120, 15);
		arrowTween = this.tweens.add({
			targets: arrow,
			angle: { from: 30, to: 150 },
			duration: arrowDuration,
			repeat: -1,
			yoyo: true
		});


		// power meter
		powerMeter = this.add.sprite(gameWidth - 30, gameHeight - 30, 'powerMeter').setOrigin(1, 0.5);
		powerMeter.setDisplaySize(100, 10);
		powerMeter.setVisible(false);
		meterScale = powerMeter.scaleX;


		// spacekey
		isFirstSpacePress = true;
		spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);


		var throwsLeft = 5;
		player_1_score = 0;
		player_2_score = 0;

		this.input.keyboard.on('keydown', function (event) {
			if (event.code === 'Space' && spaceKey._justDown) {
				if (isFirstSpacePress) {
					arrowTween.pause();

					powerMeter.setVisible(true);
					this.tweens.add({
						targets: powerMeter,
						scaleX: { from: meterScale * 0, to: meterScale * 2 },
						duration: powerMeterDuration,
						repeat: -1,
						yoyo: true
					});

					isFirstSpacePress = false;
				} else {
					this.tweens.killTweensOf(powerMeter);

					scaleXValue = powerMeter.scaleX;
					currentAngle = arrow.angle;
					radianAngle = Phaser.Math.DegToRad(currentAngle);

					isFirstSpacePress = true;

					speed = constSpeed * scaleXValue;

					var directionX = -Math.cos(radianAngle);
					var directionY = Math.sin(radianAngle);
					currentPlayer.setVelocity(speed * directionX, -speed * directionY);

					var stopTime = constSpeed * scaleXValue;

					this.tweens.add({
						targets: currentPlayer.body.velocity,
						x: 0,
						y: 0,
						duration: stopTime,
						ease: 'Ease',
					});

					throwsLeft -= 1;


					setTimeout(function () {
						if (throwsLeft == 0) {
							currentPlayer = player_2;
							player_1.visible = false;
							player_2.visible = true;
						}
						if (throwsLeft == -5) {
							if (currentLanguage == 'ru') {
								winner = player_1_score > player_2_score
								? "Победил Игрок 1 (Красный асык)"
								: player_1_score < player_2_score
								? "Победил Игрок 2 (Желтый асык)"
								: "Между игроками ничья";
							}
							else {
								winner = player_1_score > player_2_score
								? "1-ойыншы жеңді (Қызыл асық)"
								: player_1_score < player_2_score
								? "2-ойыншы жеңді (сары асық)"
								: "Ойыншылар арасында тең ойын";
							}
							$('.result-container p').text(`${winner}`)
							$('.result-container').addClass('show');
						}
						performThrow();
					}, constSpeed * scaleXValue);

				}
			}
		}, this);

		function collisionHandler(player, bitka) {
			const playerVelocity = player.body.velocity;
			const pushDirectionX = (playerVelocity.x < 0) ? -1 : 1;
			const pushDirectionY = (playerVelocity.y < 0) ? -1 : 1;
			const pushForce = 0.07;

			bitka.setVelocity(
				pushDirectionX * pushForce * 1000,
				pushDirectionY * pushForce * 1000
			);

			stopTime = constSpeed * scaleXValue

			this.tweens.add({
				targets: bitka.body.velocity,
				x: 0,
				y: 0,
				duration: stopTime,
				ease: 'Ease',
			});

			setTimeout(function () {
				bitka.setVelocity(0);
			}, constSpeed * scaleXValue);

			arenaCenterX = game.config.width / 2;
			arenaCenterY = game.config.height / 2 - 100;
			arenaRadius = 200;
			
			distance = Phaser.Math.Distance.Between(arenaCenterX, arenaCenterY, bitka.x, bitka.y);

			if (distance > arenaRadius) {
				bitka.destroy();
				if (currentPlayer == player_1) {
					player_1_score += 1;
					$('.player_1-score').text(player_1_score);
				}
				else {
					player_2_score += 1;
					$('.player_2-score').text(player_2_score);
				}
			}
		}

		function performThrow() {
			currentPlayer.x = gameWidth / 2;
			currentPlayer.y =gameHeight - 100;
			currentPlayer.setVelocity(0, 0);
			powerMeter.scaleX = 0;
			arrowTween.resume();
			isFirstSpacePress = true;
		}


		// collision		
		this.physics.world.setBounds(0, 0, gameWidth, gameHeight);
		this.physics.world.enable([player_1, bitkas]);
		this.physics.world.enable([player_2, bitkas]);
		this.physics.add.collider(player_1, bitkas, collisionHandler, null, this);
		this.physics.add.collider(player_2, bitkas, collisionHandler, null, this);

	}

	function update () {

	}

}

$(document).ready(function () {

	currentLanguage = localStorage.getItem('selectedLanguage') || 'ru';
	if (currentLanguage !== 'ru') {
		updateText();
	}

	$('.start-button').on('click', function () {
		$('.menu-container').hide();
		$('.game-container').show();
		initializeGame();
		$('.player_1-score').show();
		$('.player_2-score').show();
	})

	$('.language-button').on('click', function () {
		changeLanguage()
	})

	$('.history-button').on('click', function () {
		$('.history-container').show();
		setTimeout(function () {
			$('.history-container').addClass('show');
		}, 10)
	})
	$('.close').on('click', function () {
		$('.history-container').removeClass('show');
		setTimeout(function () {
			$('.history-container').hide();
		}, 500)
	})

})