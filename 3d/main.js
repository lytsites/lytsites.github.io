let scene = new THREE.Scene();
const world = new CANNON.World();
let camera, renderer, controls;
let redAsykBody, yellowAsykBody, bitka1Body, bitka2Body, bitka3Body, floorBody;
let redAsykShape, yellowAsykShape, bitka1Shape, bitka2Shape, bitka3Shape, floorShape;
let redAsyk, yellowAsyk;
let bitka1, bitka2, bitka3;

let isRedAsykLoaded = false;
let isYellowAsykLoaded = false;
let currentAsyk = null;
let isStoped = false;
let allModelsLoaded = false;


let redAsykThrows = 0;
let yellowAsykThrows = 0;
const maxThrows = 3;

const collisionMap = new Map();
isCollisionDetected = false;
let dampingFactor = 0.95;

const bitkasExitedCircle = new Set();
let redExitedCount = 0;
let yellowExitedCount = 0;
let circleRadius = 20;

currentLanguage = localStorage.getItem('selectedLanguage') || 'ru';

translations = {
	'.start-button': {
		'ru': 'Начать игру',
		'kk': 'Ойынды бастаңыз'
	},
	'.server-button': {
		'ru': 'Игра по сети',
		'kk': 'Желі бойынша ойын'
	},
	'.history-button': {
		'ru': 'История',
		'kk': 'Тарих'
	},
	'.language-button': {
		'ru': 'Язык: Русский',
		'kk': 'Тілі: Қазақ Тілі'
	},
	'.loading-screen h1': {
		'ru': 'Загрузка...',
		'kk': 'Жүктеу...'
	},
	'.end-game .title h3': {
		'ru': 'Игра окончена!',
		'kk': 'Ойын аяқталды!'
	},
	'.history .content': {
		'ru': 'Асык ату – одна из древнейших игр кочевников. По мнению ученых-этнографов, она появилась на территории Казахстана еще в первом тысячелетии до нашей эры и связана с животноводством и охотой. Возрастного ценза для участия в игре нет: соревноваться на меткость могут и школьники, и пенсионеры. Два года назад национальная игра асык ату была включена в репрезентативный список нематериального культурного наследия человечества ЮНЕСКО.\nПравила игры в асыки несложные. Косточки выставляются в ряд (на кон), задача игроков – с определенного расстояния выбить один или сразу несколько из них своим асыком (сака). Те косточки, которые удастся выбить, становятся добычей игрока.\nСака имеется у каждого, кто играет в асык ату. Обычно для него выбирается самый крупный и, соответственно, самый тяжелый асык из имеющихся в коллекции. Для большего утяжеления в биток заливают свинец и обматывают медной или алюминиевой проволокой. В древности у привилегированных ханских и султанских детей сака заливался даже золотом. В казахской народной сказке «Алтын сака» («золотой сака») хорошо передана ценность этого асыка. Ради нее мальчик чуть не погибает от рук злой колдуньи.',
		'kk': 'Асық ату-көшпенділердің ең көне ойындарының бірі. Ғалым-этнографтардың пікірінше, ол біздің дәуірімізге дейінгі бірінші мыңжылдықта Қазақстан аумағында пайда болған және мал шаруашылығымен және аңшылықпен байланысты. Ойынға қатысу үшін жас шегі жоқ: мектеп оқушылары да, зейнеткерлер де дәлме-дәл бәсекеге түсе алады. Екі жыл бұрын асық ату ұлттық ойыны ЮНЕСКО-ның Адамзаттың материалдық емес мәдени мұрасының өкілдік тізіміне енгізілді.\nАсық ойнау ережесі күрделі емес. Сүйектер қатарға қойылады (кон), ойыншылардың міндеті-белгілі бір қашықтықтан олардың біреуін немесе бірнешеуін бірден асықпен (сақ) қағу. Нокаутқа түсетін сүйектер ойыншының олжасына айналады.\nАсық ату ойынын ойнайтындардың барлығында сақа бар. Әдетте ол үшін коллекциядағы ең үлкен және сәйкесінше ең ауыр асық таңдалады. Үлкен салмақ үшін қорғасын допқа құйылады және мыс немесе алюминий сыммен оралады. Ежелгі уақытта артықшылықты хан және Сұлтан балаларының арасында сақа тіпті алтынға толған. Қазақ халық ертегісінде" Алтын сақа "("Алтын сақа") осы асықтың құндылығын жақсы жеткізген. Ол үшін бала зұлым сиқыршының қолынан өле жаздайды.'
	},
}


const modelsToLoad = [
	{ name: 'red_asyk', objPath: 'models/red_asyk/red_asyk.obj', mtlPath: 'models/red_asyk/red_asyk.mtl', position: new THREE.Vector3(0, 0, 25) },
	{ name: 'yellow_asyk', objPath: 'models/yellow_asyk/yellow_asyk.obj', mtlPath: 'models/yellow_asyk/yellow_asyk.mtl', position: new THREE.Vector3(0, 100, 25) },
	{ name: 'bitka1', objPath: 'models/bitka/bitka.obj', mtlPath: 'models/bitka/bitka.mtl', position: new THREE.Vector3(-10, 0, 0) },
	{ name: 'bitka2', objPath: 'models/bitka/bitka.obj', mtlPath: 'models/bitka/bitka.mtl', position: new THREE.Vector3(0, 0, 0) },
	{ name: 'bitka3', objPath: 'models/bitka/bitka.obj', mtlPath: 'models/bitka/bitka.mtl', position: new THREE.Vector3(10, 0, 0) },
];

function init() {
	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0xb3e8ff, 0.003);
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.set(0, 12, 38);
	camera.lookAt(scene.position);
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	world.gravity.set(0, -9.82, 0);


	createLights();

	createSky();
	createFloor();
	addCircleTexture();

	loadModels(modelsToLoad);

	animate();
}

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);

	world.step(1 / 120);

	if (currentAsyk) {
		currentAsyk.position.copy(currentAsyk.userData.physicsBody.position);
		currentAsyk.quaternion.copy(currentAsyk.userData.physicsBody.quaternion);
		if (currentAsyk.userData.physicsBody.position.y >= 1) {
			currentAsyk.userData.physicsBody.position.y -= 0.1
		}
	}

	if (bitka1) {
		bitka1.position.copy(bitka1.userData.physicsBody.position);
		bitka1.quaternion.copy(bitka1.userData.physicsBody.quaternion);
		if (bitka1.userData.physicsBody.position.y >= 1) {
			bitka1.userData.physicsBody.position.y -= 0.1
		}
	}

	if (bitka2) {
		bitka2.position.copy(bitka2.userData.physicsBody.position);
		bitka2.quaternion.copy(bitka2.userData.physicsBody.quaternion);
		if (bitka2.userData.physicsBody.position.y >= 1) {
			bitka2.userData.physicsBody.position.y -= 0.1
		}
	}

	if (bitka3) {
		bitka3.position.copy(bitka3.userData.physicsBody.position);
		bitka3.quaternion.copy(bitka3.userData.physicsBody.quaternion);
		if (bitka3.userData.physicsBody.position.y >= 1) {
			bitka3.userData.physicsBody.position.y -= 0.1
		}
	}

	const checkCollision = (bodyA, bodyB) => {
		const contacts = world.contacts.filter(contact =>
			(
				(contact.bi === bodyA && contact.bj === bodyB) ||
				(contact.bi === bodyB && contact.bj === bodyA)
			)
		);

		if (contacts.length > 0 && !isCollisionDetected) {
			isCollisionDetected = true;

			const collidedBitka = determineCollidedBitka(bodyA, bodyB);
			if (collidedBitka && collidedBitka.userData && collidedBitka.userData.physicsBody) {
				const halfVelocity = new CANNON.Vec3().copy(currentAsyk.userData.physicsBody.velocity).scale(0.4);
				collidedBitka.userData.physicsBody.velocity.copy(halfVelocity);
				currentAsyk.userData.physicsBody.velocity.set(0, 0, 0);

				setTimeout(function () {
					currentAsyk.userData.physicsBody.velocity.set(0, 0, 0);
					currentAsyk.userData.physicsBody.angularVelocity.set(0, 0, 0);
					currentAsyk.userData.physicsBody.quaternion.set(0, 0, 0, 1);
					currentAsyk.userData.physicsBody.position.set(0, 0, 20)
				}, 1000)
			}
		}
	};


	if (currentAsyk && currentAsyk.userData && currentAsyk.userData.physicsBody) {
		checkCollision(currentAsyk.userData.physicsBody, bitka1Body);
		checkCollision(currentAsyk.userData.physicsBody, bitka2Body);
		checkCollision(currentAsyk.userData.physicsBody, bitka3Body);
	}

    checkBitkaPosition(bitka1);
    checkBitkaPosition(bitka2);
    checkBitkaPosition(bitka3);
	
}

function checkBitkaPosition(bitka) {
    if (bitka && bitka.userData && bitka.userData.physicsBody && !bitkasExitedCircle.has(bitka)) {
        const bitkaPos = bitka.userData.physicsBody.position;
        const distance = Math.sqrt(bitkaPos.x ** 2 + bitkaPos.z ** 2);

        if (distance > circleRadius) {
            bitkasExitedCircle.add(bitka);
            if (currentAsyk == redAsyk) {
            	redExitedCount += 1;
            	$('.redCount').text(redExitedCount)
            }
            else {
            	yellowExitedCount += 1;
            	$('.yellowCount').text(yellowExitedCount)	
            }
        }
    }
}

const determineCollidedBitka = (bodyA, bodyB) => {
	if (bodyA === currentAsyk.userData.physicsBody) {
		return getBitkaFromBody(bodyB);
	} else if (bodyB === currentAsyk.userData.physicsBody) {
		return getBitkaFromBody(bodyA);
	}
	return null;
};

const getBitkaFromBody = (body) => {
	if (body === bitka1Body) {
		return bitka1;
	} else if (body === bitka2Body) {
		return bitka2;
	} else if (body === bitka3Body) {
		return bitka3;
	}
	return null;
};

function loadModels(models) {

	let loadedCount = 0;

	models.forEach(model => {
		let mtlLoader = new THREE.MTLLoader();
		mtlLoader.load(model.mtlPath, function(materials) {
			materials.preload();
			let objLoader = new THREE.OBJLoader();
			objLoader.setMaterials(materials);
			objLoader.load(model.objPath, function(object) {
				object.position.copy(model.position);
				
				if (model.name === 'red_asyk') {
					redAsyk = object;
					redAsyk.scale.set(0.05, 0.05, 0.05);
					scene.add(redAsyk);
					isRedAsykLoaded = true;

		
					const redAsykBoundingBox = new THREE.Box3().setFromObject(redAsyk);
					const redAsykSize = new CANNON.Vec3(
						redAsykBoundingBox.max.x - redAsykBoundingBox.min.x,
						redAsykBoundingBox.max.y - redAsykBoundingBox.min.y,
						redAsykBoundingBox.max.z - redAsykBoundingBox.min.z
					);

		
					redAsykShape = new CANNON.Box(redAsykSize.scale(0.5));
					redAsykBody = new CANNON.Body({ mass: 5, shape: redAsykShape });
					world.addBody(redAsykBody);

		
					redAsyk.userData.physicsBody = redAsykBody;
					redAsykBody.threeObject = redAsyk;

		
					redAsykBody.position.copy(redAsyk.position);
					redAsykBody.quaternion.copy(redAsyk.quaternion);

					currentAsyk = redAsyk;

				} else if (model.name === 'yellow_asyk') {
					yellowAsyk = object;
					yellowAsyk.scale.set(0.05, 0.05, 0.05);
					yellowAsyk.visible = false;
					scene.add(yellowAsyk);
					isYellowAsykLoaded = true;

		
					const yellowAsykBoundingBox = new THREE.Box3().setFromObject(yellowAsyk);
					const yellowAsykSize = new CANNON.Vec3(
						yellowAsykBoundingBox.max.x - yellowAsykBoundingBox.min.x,
						yellowAsykBoundingBox.max.y - yellowAsykBoundingBox.min.y,
						yellowAsykBoundingBox.max.z - yellowAsykBoundingBox.min.z
					);

		
					yellowAsykShape = new CANNON.Box(yellowAsykSize.scale(0.5));
					yellowAsykBody = new CANNON.Body({ mass: 5, shape: yellowAsykShape });
					world.addBody(yellowAsykBody)
		
					yellowAsyk.userData.physicsBody = yellowAsykBody;
					yellowAsykBody.threeObject = yellowAsyk;

		
					yellowAsykBody.position.copy(yellowAsyk.position);
					yellowAsykBody.quaternion.copy(yellowAsyk.quaternion);

				} else if (model.name === 'bitka1') {
					bitka1 = object;
					bitka1.scale.set(0.05, 0.05, 0.05);
					scene.add(bitka1);

					const bitka1BoundingBox = new THREE.Box3().setFromObject(bitka1);
					const bitka1Size = new CANNON.Vec3(
						bitka1BoundingBox.max.x - bitka1BoundingBox.min.x,
						bitka1BoundingBox.max.y - bitka1BoundingBox.min.y,
						bitka1BoundingBox.max.z - bitka1BoundingBox.min.z
					);

					bitka1Shape = new CANNON.Box(bitka1Size.scale(0.5));

					bitka1Body = new CANNON.Body({ mass: 5, shape: bitka1Shape });
					bitka1Body.position.copy(bitka1.position);
					bitka1Body.quaternion.copy(bitka1.quaternion);
					world.addBody(bitka1Body);

					bitka1.userData.physicsBody = bitka1Body;
					bitka1Body.threeObject = bitka1;

				} else if (model.name === 'bitka2') {
					bitka2 = object;
					bitka2.scale.set(0.05, 0.05, 0.05);
					scene.add(bitka2);

					const bitka2BoundingBox = new THREE.Box3().setFromObject(bitka2);
					const bitka2Size = new CANNON.Vec3(
						bitka2BoundingBox.max.x - bitka2BoundingBox.min.x,
						bitka2BoundingBox.max.y - bitka2BoundingBox.min.y,
						bitka2BoundingBox.max.z - bitka2BoundingBox.min.z
					);

					bitka2Shape = new CANNON.Box(bitka2Size.scale(0.5));

					bitka2Body = new CANNON.Body({ mass: 5, shape: bitka2Shape });
					bitka2Body.position.copy(bitka2.position);
					bitka2Body.quaternion.copy(bitka2.quaternion);
					world.addBody(bitka2Body);

					bitka2.userData.physicsBody = bitka2Body;
					bitka2Body.threeObject = bitka2;
				} else if (model.name === 'bitka3') {
					bitka3 = object;
					bitka3.scale.set(0.05, 0.05, 0.05);
					scene.add(bitka3);

					const bitka3BoundingBox = new THREE.Box3().setFromObject(bitka3);
					const bitka3Size = new CANNON.Vec3(
						bitka3BoundingBox.max.x - bitka3BoundingBox.min.x,
						bitka3BoundingBox.max.y - bitka3BoundingBox.min.y,
						bitka3BoundingBox.max.z - bitka3BoundingBox.min.z
					);

					bitka3Shape = new CANNON.Box(bitka3Size.scale(0.5));

					bitka3Body = new CANNON.Body({ mass: 5, shape: bitka3Shape });
					bitka3Body.position.copy(bitka3.position);
					bitka3Body.quaternion.copy(bitka3.quaternion);
					world.addBody(bitka3Body);

					bitka3.userData.physicsBody = bitka3Body;
					bitka3Body.threeObject = bitka3;
				}
				loadedCount++;
				if (loadedCount === models.length) {

					$('canvas').css('display', 'block');
					$('.loading-screen').css('display', 'none');
					$('.redCount').css('display', 'block');
					$('.yellowCount').css('display', 'block');
				}
			});
		});
	});
}

function createLights() {
	const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
	directionalLight.position.set(0, 100, 50);
	scene.add(directionalLight);

	const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
	scene.add(ambientLight);
}

function createSky() {
	let sphereGeometry = new THREE.SphereBufferGeometry(1000, 32, 32);
	
	let texture = new THREE.TextureLoader().load('images/sky.jpg');
	let skyMaterial = new THREE.MeshStandardMaterial({ map: texture, side: THREE.BackSide });
	
	let sky = new THREE.Mesh(sphereGeometry, skyMaterial);
	scene.add(sky);
}

function createFloor() {
	const textureLoader = new THREE.TextureLoader();
	const floorTexture = textureLoader.load('images/floor.jpg');
	floorTexture.wrapS = THREE.RepeatWrapping;
	floorTexture.wrapT = THREE.RepeatWrapping;
	floorTexture.repeat.set(25, 25);

	const floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
	const floorGeometry = new THREE.PlaneGeometry(1000, 1000);

	const floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.rotation.x = -Math.PI / 2;
	floor.position.y = -1.1;
	scene.add(floor);

	const floorShape = new CANNON.Plane();
	const floorBody = new CANNON.Body({ mass: 0, shape: floorShape });
	floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI / 2);
	floorBody.position.set(0, -1.1, 0);
	world.addBody(floorBody);
}

function addCircleTexture() {
	let circleTexture = new THREE.TextureLoader().load('images/arena_background.png');
	let circleMaterial = new THREE.MeshBasicMaterial({ map: circleTexture, transparent: true });

	let circleGeometry = new THREE.PlaneGeometry(40, 40);

	let circle = new THREE.Mesh(circleGeometry, circleMaterial);
	circle.rotation.x = -Math.PI / 2;
	circle.position.set(0, -1, 0);
	scene.add(circle);
}

function switchAsyk() {
	if (currentAsyk === redAsyk) {
		redAsyk.visible = false;
		yellowAsyk.visible = true;
		world.removeBody(redAsykBody)
		world.addBody(yellowAsykBody)
		currentAsyk = yellowAsyk;
	} else if (currentAsyk === yellowAsyk) {
		yellowAsyk.visible = false;
		redAsyk.visible = true;
		world.removeBody(yellowAsykBody)
		world.addBody(redAsykBody)
		currentAsyk = redAsyk;
	}
	resetAsykThrow();
}

function initControls() {
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 0.25;
	controls.enableZoom = true;
}

window.addEventListener('keydown', function (event) {
	if (event.key === 'Enter') {
		switchAsyk();
	}
});

window.addEventListener('mousedown', function(event) {
	if (currentAsyk === redAsyk) {
		if (redAsykThrows < maxThrows) {
			isCollisionDetected = false;
			const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
			const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

			const raycaster = new THREE.Raycaster();
			raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera);

			const plane = new THREE.Plane(new THREE.Vector3(0, 0.5, 0), 0);
			const intersection = new THREE.Vector3();
			raycaster.ray.intersectPlane(plane, intersection);
			const direction = intersection.clone().sub(currentAsyk.position).normalize();
			direction.y = 0;
			const speed = 150;
			const force = direction.multiplyScalar(speed);
			currentAsyk.userData.physicsBody.velocity.copy(force);
			redAsykThrows++;
		} else {
			bitkasExitedCircle.clear();
			currentAsyk = yellowAsyk;
			yellowAsyk.visible = true;
			yellowAsykBody.position.set(0, 0, 25)
			redAsyk.visible = false;
			redAsykBody.position.set(0, 100, 25)

			bitka1Body.velocity.set(0, 0, 0);
			bitka2Body.velocity.set(0, 0, 0);
			bitka3Body.velocity.set(0, 0, 0);

			bitka1Body.angularVelocity.set(0, 0, 0);
			bitka2Body.angularVelocity.set(0, 0, 0);
			bitka3Body.angularVelocity.set(0, 0, 0);

			bitka1Body.quaternion.set(0, 0, 0, 1);
			bitka2Body.quaternion.set(0, 0, 0, 1);
			bitka3Body.quaternion.set(0, 0, 0, 1);

			bitka1Body.position.set(-10, 0, 0)
			bitka2Body.position.set(0, 0, 0)
			bitka3Body.position.set(10, 0, 0)
		}
	} else if (currentAsyk === yellowAsyk) {
		if (yellowAsykThrows < maxThrows) {
			isCollisionDetected = false;
			const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
			const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

			const raycaster = new THREE.Raycaster();
			raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera);

			const plane = new THREE.Plane(new THREE.Vector3(0, 0.5, 0), 0);
			const intersection = new THREE.Vector3();
			raycaster.ray.intersectPlane(plane, intersection);
			const direction = intersection.clone().sub(currentAsyk.position).normalize();
			direction.y = 0;
			const speed = 150;
			const force = direction.multiplyScalar(speed);
			currentAsyk.userData.physicsBody.velocity.copy(force);
			yellowAsykThrows++;
		} else {
			$('.end-game').css('display', 'block')
		}
	}
});

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
	const elementsToUpdate = ['.start-button', '.server-button', '.history-button', '.language-button', '.loading-screen h1', '.end-game .title h3', '.history .content'];

	elementsToUpdate.forEach(function(element) {
		$(element).text(translate(element, currentLanguage));
	});
}

$(document).ready(function () {

	currentLanguage = localStorage.getItem('selectedLanguage') || 'ru';
	if (currentLanguage !== 'ru') {
		updateText();
	}

	$('.start-button').on('click', function () {
		$('.loading-screen').css('display', 'flex');
		$('.menu').css('display', 'none');
		init();
		// initControls();
	})

	$('.server-button').on('click', function () {
		$('.server').css('display', 'block');
	})
	$('.history-button').on('click', function () {
		$('.history').css('display', 'flex');
	})

	$('.language-button').on('click', function () {
		changeLanguage()
	})

	$('.close').on('click', function () {
		$(this).parent('.modal').css('display', 'none')
	})
})