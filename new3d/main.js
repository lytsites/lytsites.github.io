let launchCount = 0;
let collideCountP1 = 0;
let collideCountP2 = 0;
let rotated = true;
let angle = 0;
let step = 0.02;
let speed = 35;
let debY = 0.55;
let activePlayer = null;
let notActivePlayer = null;
let pci = true;

const targets = {
		1: {
				't1': { 'x': -5, 'y': debY, 'z': 18, collidedP1: false, collidedP2: false },
				't2': { 'x': 0, 'y': debY, 'z': 18, collidedP1: false, collidedP2: false },
				't3': { 'x': 5, 'y': debY, 'z': 18, collidedP1: false, collidedP2: false }
		},
		2: {
				't1': { 'x': -8, 'y': debY, 'z': 21, collidedP1: false, collidedP2: false },
				't2': { 'x': 0, 'y': debY, 'z': 21, collidedP1: false, collidedP2: false },
				't3': { 'x': 8, 'y': debY, 'z': 21, collidedP1: false, collidedP2: false }
		},
		3: {
				't1': { 'x': -13, 'y': debY, 'z': 25, collidedP1: false, collidedP2: false },
				't2': { 'x': 0, 'y': debY, 'z': 25, collidedP1: false, collidedP2: false },
				't3': { 'x': 13, 'y': debY, 'z': 25, collidedP1: false, collidedP2: false }
		}
}

// Загрузка моделей
function loadModel(world, path, position, scale, mass, type) {
		const loader = new THREE.GLTFLoader();

		return new Promise((resolve, reject) => {
				loader.load(path, (gltf) => {
						const mesh = gltf.scene;
						mesh.scale.set(scale, scale, scale);

						mesh.traverse(child => {
								if (child.isMesh) {
										if (type === 'player-1') child.material.color.setHex(0xffff00);
										else if (type === 'player-2') child.material.color.setHex(0xff00ff);
										else child.material.color.setHex(0x00ffff);
								}
						});

						const boundingBox = new THREE.Box3().setFromObject(mesh);
						const width = boundingBox.max.x - boundingBox.min.x;
						const height = boundingBox.max.y - boundingBox.min.y;
						const length = boundingBox.max.z - boundingBox.min.z;
						const shape = new CANNON.Box(new CANNON.Vec3(width / 1.5, height / 1.5, length / 1.5));

						const body = new CANNON.Body({ mass: mass });
						body.addShape(shape);
						body.position.copy(position);
						world.addBody(body);

						mesh.position.copy(body.position);
						mesh.quaternion.copy(body.quaternion);

						body.velocity.set(0, 0, 0)

						resolve({ mesh, body, type });
				}, (xhr) => {
						console.log((xhr.loaded / xhr.total * 100) + '% loaded');
				}, (error) => {
						reject(error);
				});
		});
}

// Функция для запуска игры
function startGame(level) {

		if (level == 1) {
			speed = 30;
		}

		$('.main').css('display', 'none');
		$('.modal').fadeOut();

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		const renderer = new THREE.WebGLRenderer();
		camera.position.set(0, 5, 0);
		camera.lookAt(0, 0, 25);
		renderer.setClearColor(0x000000, 1);
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);

		const world = new CANNON.World();
		world.gravity.set(0, -9.82, 0);

		const groundTexture = new THREE.TextureLoader().load('images/level-' + (level == 1 || level == 2 ? level : 1) + '.png');
		groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
		groundTexture.repeat.set(40 + 5, 40 + 5);
		const groundMaterial = new THREE.MeshBasicMaterial({ map: groundTexture });
		const groundGeometry = new THREE.BoxGeometry(800, 0, 800);
		const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
		scene.add(groundMesh);

		const groundShape = new CANNON.Plane();
		const groundBody = new CANNON.Body({ mass: 0 });
		groundBody.addShape(groundShape);
		groundBody.position.copy(groundMesh.position);
		groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI / 2);
		world.addBody(groundBody);

		// Создание сферы для неба
		let sphereGeometry = new THREE.SphereBufferGeometry(900, 32, 32);
		let textureLoader = new THREE.TextureLoader();
		let texture = textureLoader.load('images/sky.jpg'); // Загрузка текстуры неба

		// Создание материала с использованием текстуры
		let skyMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });

		// Создание объекта для неба с применением материала
		let sky = new THREE.Mesh(sphereGeometry, skyMaterial);

		// Добавление неба в сцену
		scene.add(sky);

		if (level == 3) {
				const circleTexture = new THREE.TextureLoader().load('images/level-3.png');
				const circleMaterial = new THREE.MeshBasicMaterial({ map: circleTexture });
				const circleGeometry = new THREE.CircleGeometry(15, 32);
				circleGeometry.rotateX(-Math.PI / 2);
				const circleMesh = new THREE.Mesh(circleGeometry, circleMaterial);
				circleMesh.position.set(0, 0.1, 25);
				scene.add(circleMesh);
		}

		const sunLight = new THREE.PointLight(0xffffff, 0.7);
		sunLight.position.set(450, 100, 800);
		scene.add(sunLight);

		const sunGeometry = new THREE.SphereGeometry(70, 32, 32);
		const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.9 });
		const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
		sunMesh.position.copy(sunLight.position);
		scene.add(sunMesh);

		const lightHaloGeometry = new THREE.SphereGeometry(130, 32, 32);
		const lightHaloMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.15 });
		const lightHaloMesh = new THREE.Mesh(lightHaloGeometry, lightHaloMaterial);
		lightHaloMesh.position.copy(sunLight.position);
		scene.add(lightHaloMesh);

		const backLight = new THREE.PointLight(0xffffff, 0.3);
		backLight.position.set(0, 10, -20);
		scene.add(backLight);

		const playersPromises = [];
		const targetsPromises = [];

		for (let i = 1; i <= 2; i++) {
				const playerPromise = loadModel(world, 'models/object.gltf', new CANNON.Vec3(2 * i, debY, 5), 0.02, 1, `player-${i}`);
				playersPromises.push(playerPromise);
		}

		for (let i = 1; i <= 3; i++) {
				const targetPromise = loadModel(world, 'models/object.gltf', new CANNON.Vec3(targets[level]['t' + i]['x'], targets[level]['t' + i]['y'], targets[level]['t' + i]['z']), 0.02, 1, 'target');
				targetsPromises.push(targetPromise);
		}

		Promise.all([...playersPromises, ...targetsPromises]).then((results) => {
				const players = results.slice(0, 2);
				const targets = results.slice(2);

				players.forEach((player) => scene.add(player.mesh));
				targets.forEach((target) => scene.add(target.mesh));

				activePlayer = players[0];
				notActivePlayer = players[1];

				activePlayer.body.position.set(0, debY, 5)
				notActivePlayer.body.position.set(0, debY, -5)
				activePlayer.mesh.visible = true;
				notActivePlayer.mesh.visible = false;


				let audioPath = 'musics/level-' + level + '.mp3';
				$('audio').attr('src', audioPath);
				$('audio').trigger('play');

				$('.leftCount').css('visibility', 'visible');
				$('.rightCount').css('visibility', 'visible');

				$('.leftCount span').text(collideCountP1);
				$('.rightCount span').text(collideCountP2);

				$('.toMenu').css('display', 'block');

				function animate() {
						requestAnimationFrame(animate);
						world.step(1 / 40);

						players.forEach((player) => {
								player.mesh.position.copy(player.body.position);
								player.mesh.quaternion.copy(player.body.quaternion);
						});

						targets.forEach((target) => {
								target.mesh.position.copy(target.body.position);
								target.mesh.quaternion.copy(target.body.quaternion);
						});

						if (activePlayer && rotated) {
								angle += step;
								if (angle >= 0.8 || angle <= -0.8) step *= -1;
								activePlayer.mesh.rotation.y += angle;
						}

						targets.forEach((target) => {
								target.body.addEventListener('collide', (event) => {
										const thisBody = event.target;
										const otherBody = event.body;
										if (otherBody.id === 1) {
												if (!target.collidedP1) {
														collideCountP1 += 1;
														target.collidedP1 = true;
												}
										}
										if (otherBody.id === 2) {
												if (!target.collidedP2) {
														collideCountP2 += 1;
														target.collidedP2 = true;
												}
										}
								});
						});

						renderer.render(scene, camera);
				}

				animate();

				document.addEventListener('keydown', (event) => {
					if (event.keyCode === 32) {
						if (pci) {
							launchCount += 1;
							rotated = false;
							const playerDirection = new THREE.Vector3();
							activePlayer.mesh.getWorldDirection(playerDirection);
							playerDirection.y = 0;
							playerDirection.normalize();
							const velocity = playerDirection.multiplyScalar(speed);
							activePlayer.body.velocity.copy(velocity);

							setTimeout(function() {
									activePlayer.body.velocity.set(0, 0, 0);
									activePlayer.body.angularVelocity.set(0, 0, 0);
									activePlayer.body.quaternion.set(0, 0, 0, 1);

											activePlayer.body.position.set(0, debY, 5);
											rotated = true;
											if (launchCount == 3) {
												activePlayer = players[1];
												notActivePlayer = players[0];
												activePlayer.body.position.set(0, debY, 5)
												notActivePlayer.body.position.set(0, debY, -5)
												activePlayer.mesh.visible = true;
												notActivePlayer.mesh.visible = false;
											}
											if (launchCount == 6) {
												rotated = false;

												activePlayer.mesh.visible = true;
												notActivePlayer.mesh.visible = true;

												activePlayer.body.position.set(-1, debY, 5);
												activePlayer.body.velocity.set(0, 0, 0);
												activePlayer.body.angularVelocity.set(0, 0, 0);
												activePlayer.body.quaternion.set(0, 0, 0, 1);

												notActivePlayer.body.position.set(1, debY, 5);
												notActivePlayer.body.velocity.set(0, 0, 0);
												notActivePlayer.body.angularVelocity.set(0, 0, 0);
												notActivePlayer.body.quaternion.set(0, 0, 0, 1);
												pci = false;
											}

							}, 4000)
						}
					}
				});

		});

}

$(document).ready(() => {
		$(".startButton").click(function() {
				$(".level-modal").fadeIn();
		});

		$(".historyButton").click(function() {
				window.location.href = 'history.html'
		});

		$(".close").click(function() {
				$(".modal").fadeOut();
		});

		$(window).click(function(event) {
				if ($(event.target).is(".modal")) {
						$(".modal").fadeOut();
				}
		});

		$('.level').click(function() {
				const level = $(this).attr('data-level');
				startGame(level)
		});

		$('.toMenu').click(function() {
			if ($(this).attr('data-to') !== 'main') {
				$('.main').css('display', 'block');
				$('canvas').remove();
				$('audio').trigger('pause').prop('currentTime', 0);

				$('.leftCount').css('visibility', 'hidden');
				$('.rightCount').css('visibility', 'hidden');
				$('.leftCount span').text('0');
				$('.rightCount span').text('0');

				$('.toMenu').css('display', 'none')
			}
			else {
				window.history.back();
			}
		})

		$('.difficulty-slider').on('input', function() {
			var value = parseInt($(this).val());
			var labelText = '';

			switch (value) {
				case 1:
					labelText = 'Новичок';
					break;
				case 2:
					labelText = 'Средний игрок';
					break;
				case 3:
					labelText = 'Про';
					break;
				default:
					labelText = 'Новичок';
			}

			$('.difficulty-settings h3').text(labelText);
		})

		$('.collectionButton').click(function() {
			window.location.href = 'collection.html'
		})
});
