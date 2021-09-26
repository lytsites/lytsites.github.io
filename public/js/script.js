function generation () {

	$('.game-box span').text('');

	// Получение рандомного числа

	function randomInteger(min, max) {
		let rand = min - 0.5 + Math.random() * (max - min + 1);
		return Math.round(rand);
	}

	// Выборка рандомных элементов

	root = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
	square = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400];
	array = [];

	for (var i = 0 ; (i < $('.game-row').length) && (i < square.length) ; i++) {
		var r = Math.floor(Math.random() * (square.length - i)) + i;
		var number = square[r];
		square[r] = square[i];
		square[i] = number;

		array.push(number);
	}

	// Расстановка элементов

	for (i = 1; i <= array.length; i++) {
		item = randomInteger(1, $('.row-1 .game-box').length);
		$('.row-' + i + ' .box-' + item + ' span').text(array[i - 1]);
	}

	// Выбор главное числа

	number = Math.sqrt(array[randomInteger(0, array.length - 1)]);
	$('.main-number span').text(number);
}

$(document).ready(function () {

	$('body').css({
		'visibility': 'visible',
	})

	bool = false;

	for (i = 1; i <= 8; i++) {
		$('.game-area').append($('<div>', {
			'class': 'game-row row-' + i
		})
		.append(function () {
			for (j = 1; j <= 10; j++) {
				$(this).append($('<div>', {
					'class': 'game-box box-' + j
				})
				.append($('<span>', {

				})))
			}
		}))
	}

	aHeight = $(window).outerHeight();
	aWidth = aHeight;

	$('.game-area').css({
		'width': aWidth,
		'height': aHeight,
	});

	$('.game-options').css({
		'height': aWidth / 5,
	})

	bHeight = aHeight / 10;
	bWidth = bHeight;

	$('.game-box').css({
		'width': bWidth,
		'height': bHeight,
	});

	// Проверка ответа

	score = 0;

	$('.game-row .game-box').on('click', function () {
		if (bool) {
			number = $(this, 'span').text();
			mainNumber = $('.main-number span').text();
			if (Math.sqrt(number) == mainNumber) {
				score += 1;
				if (score < 10 && score >= 0) {
					$('.game-score span').text('0' + score);
				}
				else {
					$('.game-score span').text(score);
				}
				generation();
			}
			else {
				score -= 1;
				if (score < 10 && score >= 0) {
					$('.game-score span').text('0' + score);
				}
				else {
					$('.game-score span').text(score);
				}
				generation();
			}
		}
	})

	$('.start-game').on('click', function () {
		bool = true;
		generation();

		timeMinut = 30;

		timer = setInterval(function () {
			seconds = timeMinut%60
			minutes = timeMinut/60%60
			hour = timeMinut/60/60%60
			if (timeMinut <= 0) {
				clearInterval(timer);
				$('.game-score span').text('00')
				$('.game-box span').text('');
				$('.game-time span').text('00');

				$('.result span').text(score)

			} else {
				let strTimer = `${seconds}`;
				if (strTimer < 10) {
					$('.game-time span').text('0' + strTimer);
				}
				else {
					$('.game-time span').text(strTimer);
				}
			}
			--timeMinut;
		}, 1000)

	})

})