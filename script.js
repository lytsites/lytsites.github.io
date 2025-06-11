let stream = null;

$(document).ready(function()
{

	// lucide.createIcons();

	// Вывод вакансий

	renderSpecialties("#specialty-nav", "#specialty-content");
	renderAnalytics();

	// Прокрут до вакансии

	$(document).on('click', '#specialty-nav a', function(e) {
		e.preventDefault();

		const targetId = $(this).data('target');
		const $targetBlock = $('#' + targetId);

		if ($targetBlock.length) {
			const offsetTop = $targetBlock.offset().top - 60;

			$('html, body').animate({
				scrollTop: offsetTop
			}, 400);
		}
	});

	// Загрузка темы

	let theme = localStorage.getItem('theme') || 'light';
	if (theme == 'light') {
		$('#app').removeClass('dark');
		$('#app').addClass('light');
	}
	else
	{
		$('#app').removeClass('light');
		$('#app').addClass('dark');
	}
	$('.settings-btn.select-theme').removeClass('active');
	$('.select-theme[data-theme="' + theme + '"]').addClass('active');

	if ($('.window.active').attr('id') == 'scanner')
	{
		startCamera();
	}

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

	// Вкладка настроек

	// Выбор темы

	$('.settings-btn.select-theme').on('click', function ()
	{
		$('.settings-btn.select-theme').removeClass('active');
		$(this).addClass('active');

		$('#app').toggleClass('light dark');

		if ($(this).data('theme') == 'dark')
		{
			$('#app').removeClass('light');
			$('#app').addClass('dark');
		}
		else
		{
			$('#app').addClass('light');
			$('#app').removeClass('dark');
		}

		localStorage.setItem('theme', $(this).data('theme'));
	})

	$('body').css('visibility', 'visible');

})

















// Включение и отключение камеры

function startCamera()
{
	const video = $('#video')[0];
	// const height = $('#scanner').innerWidth() * 4;
	const height = 595 * 3;
	// const width = $('#scanner').innerHeight() * 4;
	const width = 842 * 3;

	navigator.mediaDevices.getUserMedia({
		video: {
			facingMode: { ideal: "environment" }, // Используй ideal, чтобы избежать ошибок
			width: { ideal: width, max: width },
			height: { ideal: height, max: height }
		}
	})
	.then(function (mediaStream)
	{
		stream = mediaStream;
		video.srcObject = mediaStream;
		$('#scanner').show().addClass('active');

		if (!window.scannerStarted) {
			startScannerLoop();
			window.scannerStarted = true;
		}
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

// Получение вакансий

function renderSpecialties(navSelector, contentSelector) {
	const today = new Date();
	const yyyy = today.getFullYear();
	const mm = String(today.getMonth() + 1).padStart(2, '0');
	const dd = String(today.getDate()).padStart(2, '0');
	const dateStr = `${yyyy}-${mm}-${dd}`;
	const url = `/boljam/json/grouped_by_specialty_${dateStr}.json`;

	$.getJSON(url)
		.done(function (data) {
			console.time("process");

			const $nav = $(navSelector).empty();     // e.g. ul
			const $content = $(contentSelector).empty(); // e.g. div

			$.each(data, function (specialty, info) {
				// 1. Добавляем в навигацию
				const $link = $('<a>')
					.attr('href', `#`)
					.attr('data-target', `spec-${specialty.replace(/\s+/g, '-').replace(/[^\w\u0400-\u04FF-]/g, '')}`)
					.text(`${specialty} (${info.count})`);

				$('<li>').append($link).appendTo($nav);

				// 2. Создаём блок вакансий
				const $block = $('<div>')
					.attr('id', `spec-${specialty.replace(/\s+/g, '-').replace(/[^\w\u0400-\u04FF-]/g, '')}`)
					.addClass('vacancy-block');

				$('<h2>').text(specialty).appendTo($block);

				const $ul = $('<ul>');
				$.each(info.vacancies, function (_, vac) {
					const $a = $('<a>')
						.attr('href', vac.url)
						.attr('target', '_blank')
						.text(`${vac.name} (${vac.city})`);

					$('<li>').append($a).appendTo($ul);
				});

				$block.append($ul).appendTo($content);
			});

			console.timeEnd("process");
		})
		.fail(function () {
			console.error("❌ Ошибка при загрузке JSON-файла:", url);
		});
}

// Аналитика

async function renderAnalytics(indexUrl = "/boljam/json/index.json") {
    const $section = $('#analytics').empty().addClass('analytics-container');
    
    // Добавляем лоадер
    $section.append('<div class="chart-loader">Загрузка данных...</div>');
    
    try {
        // Загружаем index.json
        const index = await fetch(indexUrl).then(res => res.json());
        const allFiles = index.all;
        const latestFile = index.latest;
        const latestDate = latestFile.match(/\d{4}-\d{2}/)?.[0];

        // Хранилища
        const specTotals = {};
        const specPerMonth = {};

        // Загружаем все файлы
        for (const file of allFiles) {
            const url = `/boljam/json/${file}`;
            const data = await fetch(url).then(res => res.json());

            const dateMatch = file.match(/\d{4}-\d{2}-\d{2}/);
            const month = dateMatch ? dateMatch[0].slice(0, 7) : "unknown";

            for (const [spec, info] of Object.entries(data)) {
                // Общая сумма
                specTotals[spec] = (specTotals[spec] || 0) + info.count;

                // По месяцам
                if (!specPerMonth[spec]) specPerMonth[spec] = {};
                specPerMonth[spec][month] = (specPerMonth[spec][month] || 0) + info.count;
            }
        }

        // Топ-10 специальностей за последний месяц
        const topThisMonth = Object.entries(specPerMonth)
            .map(([spec, monthCounts]) => [spec, monthCounts[latestDate] || 0])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .filter(([_, count]) => count > 0);

        // 🔟 Создаём список
        const $topBlock = $(`
            <div class="top-specs card">
                <h2 class="card-header">Топ-10 специальностей за ${latestDate}</h2>
                <ul class="list-group list-group-flush"></ul>
            </div>
        `);
        
        topThisMonth.forEach(([spec, count]) => {
            $topBlock.find('ul').append(`
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${spec}
                    <span class="badge bg-primary rounded-pill">${count}</span>
                </li>
            `);
        });
        $section.append($topBlock);

        // 📈 Подготовка графика
        const months = [...new Set(
            Object.values(specPerMonth).flatMap(obj => Object.keys(obj))
        )].sort();

        // Генерация цветов для графиков
        const generateColors = () => {
            const colors = [
                '#D1495B', '#00798C', '#EDAE49', '#30638E', '#003D5B',
                '#5F4BB6', '#86A873', '#F45B69', '#6B4D57', '#7FC8F8'
            ];
            return colors.concat(...Array(10).fill().map(() => 
                `#${Math.floor(Math.random()*16777215).toString(16)}`
            ));
        };

        const datasets = topThisMonth.map(([spec], i) => ({
            label: spec,
            data: months.map(m => specPerMonth[spec]?.[m] || 0),
            borderColor: generateColors()[i],
            backgroundColor: generateColors()[i] + '40', // Добавляем прозрачность
            tension: 0.3,
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true
        }));

        // 🎨 Вставка canvas с контейнером для адаптивности
        const $chartContainer = $(`
            <div class="chart-container card">
                <h2 class="card-header">Динамика вакансий по месяцам</h2>
                <div class="chart-wrapper">
                    <canvas id="vacancyChart"></canvas>
                </div>
            </div>
        `);
        $section.append($chartContainer);

        // Удаляем лоадер
        $section.find('.chart-loader').remove();

        // 📊 Рендер графика с задержкой для корректного расчета размеров
        setTimeout(() => {
            const ctx = $chartContainer.find('canvas')[0].getContext('2d');
            
            // Устанавливаем плотность пикселей для мобильных устройств
            const dpr = window.devicePixelRatio || 1;
            const canvas = ctx.canvas;
            const rect = canvas.getBoundingClientRect();
            
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
            
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            position: 'bottom',
                            labels: {
                                boxWidth: 12,
                                padding: 20,
                                font: {
                                    size: window.innerWidth < 768 ? 10 : 12
                                }
                            }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            bodyFont: {
                                size: window.innerWidth < 768 ? 10 : 12
                            }
                        }
                    },
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                maxRotation: window.innerWidth < 768 ? 45 : 0,
                                font: {
                                    size: window.innerWidth < 768 ? 10 : 12
                                }
                            }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 100,
                                font: {
                                    size: window.innerWidth < 768 ? 10 : 12
                                }
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        }
                    }
                }
            });
        }, 100);
        
    } catch (error) {
        $section.find('.chart-loader').remove();
        $section.append(`
            <div class="alert alert-danger">
                Ошибка загрузки данных: ${error.message}
            </div>
        `);
        console.error('Analytics error:', error);
    }
}

// Ожидание CV

function waitForCV(callback) {
	const check = setInterval(() => {
		if (typeof cv !== 'undefined' && cv.Mat) {
			clearInterval(check);
			callback();
		}
	}, 100);
}

// Начало сканирования

function startScannerLoop() {
	setInterval(() => {
		const video = $('#video')[0];
		if (!video || video.readyState !== 4) return;

		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

		const src = cv.imread(canvas);
		const gray = new cv.Mat();
		const blurred = new cv.Mat();
		const edged = new cv.Mat();
		const contours = new cv.MatVector();
		const hierarchy = new cv.Mat();

		cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
		cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
		cv.Canny(blurred, edged, 75, 200);
		cv.findContours(edged, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

		let found = false;

		for (let i = 0; i < contours.size(); i++) {
			const cnt = contours.get(i);
			const approx = new cv.Mat();
			cv.approxPolyDP(cnt, approx, 0.02 * cv.arcLength(cnt, true), true);

			if (approx.rows === 4 && cv.contourArea(cnt) > 10000) {
				found = true;
				approx.delete();
				break;
			}
			approx.delete();
		}

		src.delete(); gray.delete(); blurred.delete(); edged.delete();
		contours.delete(); hierarchy.delete();

		if (found && !ocrInProgress) {
			alert('Обнаружен прямоугольник — выполняем OCR');
			runTesseractOCR(canvas);
		}
	}, 3000);
}

// Распознование текста

function runTesseractOCR(canvas) {
	ocrInProgress = true;

	Tesseract.recognize(canvas, 'rus', {
		langPath: 'https://tessdata.projectnaptha.com/4.0.0/'
	})
	.then(({ data: { text } }) => {
		if (text && text.trim().length > 10) {
			alert('Обнаружен русский текст:\n\n' + text.trim());
		} else {
			alert('Текст не найден или слишком короткий');
		}
	})
	.catch(err => {
		alert('Ошибка OCR:', err);
	})
	.finally(() => {
		ocrInProgress = false;
	});
}