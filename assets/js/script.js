if (localStorage.getItem('language')) path = '/pages/' + localStorage.getItem('language') + '/';
else path = '/pages/ru/';


$('div.main').load(path + 'main.page.html');


$('body').on('click', 'button.start', function () {
	$('div.wrapper').load(path + 'game.page.html');
})


$('body').on('click', 'button.servers', function () {
	$('button.back').removeClass('hide');
	$('div.main').load(path + 'servers.page.html');
})

$('body').on('click', 'div.servers .server', function () {
	$('div.servers .server').css({
					'background': 'rgba(255, 255, 255, .5)',
					'color': 'black'
				});
	$(this).css({
					'background': '#4CAF50',
					'color': '#FFFFFF'
				});
})

$('body').on('click', 'button.connect', function () {
	$('div.servers .alert').css('opacity', '1');
	setTimeout(function () {
		$('div.servers .alert').css('opacity', '0');
	}, 2000)
})


$('body').on('click', 'button.settings', function () {
	$('button.back').removeClass('hide');
	$('div.main').load(path + 'settings.page.html', function () {
		if (localStorage.getItem('name')) {
			$('input.name').val(localStorage.getItem('name'));
		}
		if (localStorage.getItem('language')) {
			$('select').val(localStorage.getItem('language'));
		}
	});

})

$('body').on('click', 'button.save', function () {
	localStorage.setItem('name', $('input.name').val());
	localStorage.setItem('language', $('select').val());
	window.location.reload();
})


$('body').on('click', 'button.workshop', function () {
	$('button.back').removeClass('hide');
	$('div.main').load(path + 'workshop.page.html');
})

$('body').on('click', '.skins img', function () {
	localStorage.setItem('link', $(this).attr('data-link'));
	window.location.reload();
})


$('body').on('click', 'button.about', function () {
	$('button.back').removeClass('hide');
	$('div.main').load(path + 'about.page.html');
})


$('button.back').on('click', function () {
	$('button.back').addClass('hide');
	$('div.main').load(path + 'main.page.html');
})