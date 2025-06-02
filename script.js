$(document).ready(function()
{

	let stream = null;

	// lucide.createIcons();

	setTitle();

	// Переключение

	$('.indicator').css({
		'left': $('.nav-btn.active').offset().left + 'px'
	})

	$('.nav-btn').on('click', function()
	{
		$('.indicator').css({
			'left': $(this).offset().left + 'px'
		})

		$('.nav-btn').removeClass('active');
		$(this).addClass('active');

		$('.window').removeClass('active');
		$('#' + $(this).data('page')).addClass('active');

		// Задание заголовак 
		setTitle();

		// Обработка открытия сканера

		if ($(this).data('page') == 'scanner')
		{
			startCamera();
		}
		else
		{
			stopCamera();
		}

	})

	// Вкладки

	// Включение и отключение камеры

	function startCamera()
	{
		const video = $('#video')[0];

		navigator.mediaDevices.getUserMedia({ video:
		{ facingMode: 'environment' } })
		.then(function (mediaStream)
		{
			stream = mediaStream;
			video.srcObject = mediaStream;
			$('#scanner').show().addClass('active');
		})
		.catch(function (err)
		{
			console.error("Ошибка доступа к камере: ", err);
			alert("Не удалось открыть камеру.");
		});
	}

	function stopCamera()
	{
		if (stream)
		{
			stream.getTracks().forEach(track => track.stop());
			stream = null;
		}
		$('#video')[0].srcObject = null;
		$('#scanner').hide().removeClass('active');
	}

	// Задание заголовка

	function setTitle()
	{
		title = $('section.active').data('title');
		$('#window-title').text(title);
	}


})