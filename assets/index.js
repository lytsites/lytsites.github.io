$(document).ready(function () {

	$('body').css({
		'display': 'block',
	})
	if (window.location.pathname.split('.')[0] == '/data') {
		questions = [];
		$('select[name="obj"]').on('change', function () {
			tag = $(this).val();
			$.ajax({
				url: "/data/question.txt",
				async: false,
				cache: false,
				dataType: "text",
				success: function(data) {
					data = data.split(tag);
					$('.jumbotron').html(data[1]);
				}
			});
		})

		$('.form-group input').on('input', function () {
			v = $(this).val();
			if (v != '') {
				$(this).next().css({
					'top': '-50%',
				})
			}
			else {
				$(this).next().css({
					'top': '50%',
				})
			}
			var filter = $(this).val(), count = 0;

			$(".jumbotron p").each(function() {

				if ($(this).text().search(new RegExp(filter, "i")) < 0) {
					$(this).css('display', 'none');
				} else {
					$(this).css('display', 'block');
					count++;
				}
			});

		})
	}
	else if (window.location.pathname.split('.')[0] == '/test') {
		$('li').removeClass('active');

		count = 1;
		correct = 0;
		questions_obj = {};

		$.get('/testing/question.txt', function(data) {
			data = data.split('<' + window.location.pathname.split('.')[1] + '>');
			all = data[1].split('\n').filter(function (val) {
				if (val != '') {
					return val;
				}
			});
			questions = all.sort(() => 0.5 - Math.random()).slice(0, window.location.hash.replace('#', ''));
			for (i = 1; i <= questions.length; i++) {
				el = questions[i - 1].split('~');
				$('.blocks').append($('<div>', {
					'class': 'p-5 col-md-12 col-11 block block-' + i,
					'text': el[0].replaceAll('"', ''),
				})
				.prepend($('<pre>', {
					'text': 'Вопрос: ' + i
				}))
				.append($('<div>', {
					'class': 'b-question',
				})
				.append($('<h3>')))
				.append($('<ul>', {
					'class': 'b-answers',
				})
				.append(function () {
					html = '';
					answers = el.slice(1);
					answers = answers.sort(() => 0.5 - Math.random());
					for (j = 0; j < 5; j++) {
						if (answers[j].indexOf('<>') !== -1) {
							html += '<li class="li-' + j + 1 + ' active">' + answers[j].replaceAll('"', '').replace('<>', '') + '</li>'
						}
						else {
							html += '<li class="li-' + j + 1 + '">' + answers[j].replaceAll('"', '').replace('<>', '') + '</li>'
						}
					}
					return html;
				})))
			}
		});

		$('body').on('click', '.b-answers li', function () {
			if (count < window.location.hash.replace('#', '')) {
				count += 1;
			}

			$('.pre-1').text('Вопрос: ' + count);
			$(this).closest('.block').css({
				'display': 'none',
			})
			$('.block-' + count).css({
				'display': 'block',
			})

			if ($(this).hasClass('active')) {
				$(this).addClass('true');
				correct += 1;
				$('.pre-2').text('Правильных: ' + correct);
			}
			else {
				$(this).addClass('false');
			}
		})

		$('body').on('click', '.block-' + window.location.hash.replace('#', '') + ' li', function () {
			$('.block').css({
				'display': 'block',
				'pointer-events': 'none',
			})
			$('li.active').addClass('true');
			$('body').css({
				'overflow-y': 'scroll',
			})
		})

			setInterval(function () {
			if ($('input').prop('checked')) {
				$('li.active').addClass('on')
			}
			else {
				$('li.active').removeClass('on')
			}
		})
	}


})