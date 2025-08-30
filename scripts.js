docReady(function () {

	//-- Notifier
	var notifierContainer = null;
	function showNotifier(message, type, duration) {
		if (!notifierContainer) {
			notifierContainer = document.createElement('div');
			notifierContainer.className = 'notifier-container';
			document.body.appendChild(notifierContainer);
		}

		// SVG Icons for success and error states
		var icons = {
			success: '<svg class="notifier-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
			error: '<svg class="notifier-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
		};

		var notifier = document.createElement('div');
		var notifierType = (type === 'success' || type === 'error') ? type : 'success';
		
		notifier.className = 'notifier ' + notifierType;
		notifier.innerHTML = icons[notifierType] + '<span>' + message + '</span>';

		notifierContainer.appendChild(notifier);

		// Trigger the show animation
		setTimeout(function() {
			notifier.classList.add('show');
		}, 10); // Small delay to allow CSS transition

		// Set timeout to hide and remove the notifier
		var hideTimeout = duration || 3000;
		setTimeout(function() {
			notifier.classList.remove('show');
			notifier.classList.add('hide');
			
			// Remove the element from DOM after transition ends
			setTimeout(function() {
				if (notifier.parentNode) {
					notifier.parentNode.removeChild(notifier);
				}
			}, 500); // Should match CSS transition duration
		}, hideTimeout);
	}

	// --- Basic Setup ---
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
	const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg'), antialias: true });

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.position.set(0, 80, 250);

	// --- State ---
	let isPaused = false;
	let animationSpeed = 1.5;

	// --- Lighting ---
	const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
	scene.add(ambientLight);
	const pointLight = new THREE.PointLight(0xffffff, 2, 600);
	scene.add(pointLight);

	// --- Controls ---
	const controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 0.05;
	controls.screenSpacePanning = false;
	controls.minDistance = 10;
	controls.maxDistance = 800;

	// --- Data ---
	const planetData = {
		sun: { name: 'Sun', radius: 12, color: 0xffff00, description: 'The Sun is the star at the center of the Solar System. It is a nearly perfect ball of hot plasma, heated to incandescence by nuclear fusion reactions in its core.', facts: [{ label: 'Diameter', value: '1,392,700 km' }, { label: 'Surface Temperature', value: '5,505 °C' }, { label: 'Age', value: '4.6 Billion Years' }] },
		mercury: { name: 'Mercury', radius: 1, distance: 30, speed: 0.047, color: 0xaaaaaa, tilt: 0.03, description: 'Mercury is the smallest planet in our solar system and nearest to the Sun. Its orbit is the fastest, taking only 88 Earth days.', facts: [{ label: 'Diameter', value: '4,879 km' }, { label: 'Day Length', value: '59 Earth days' }, { label: 'Orbital Period', value: '88 Earth days' }] },
		venus: { name: 'Venus', radius: 2.5, distance: 50, speed: 0.035, color: 0xffa500, tilt: 177, description: 'Venus is the second planet from the Sun, known for its thick, toxic atmosphere that traps heat, making it the hottest planet in our solar system.', facts: [{ label: 'Diameter', value: '12,104 km' }, { label: 'Day Length', value: '243 Earth days' }, { label: 'Orbital Period', value: '225 Earth days' }] },
		earth: { name: 'Earth', radius: 2.6, distance: 70, speed: 0.029, color: 0x0077ff, tilt: 23.5, description: 'Our home, Earth is the third planet from the Sun and the only place we know of so far that’s inhabited by living things.', facts: [{ label: 'Diameter', value: '12,742 km' }, { label: 'Day Length', value: '24 hours' }, { label: 'Orbital Period', value: '365.25 days' }], moons: [{ name: 'Moon', radius: 0.5, distance: 5, speed: 0.05, color: 0xdddddd }] },
		mars: { name: 'Mars', radius: 1.5, distance: 90, speed: 0.024, color: 0xff4500, tilt: 25.2, description: 'Mars is the fourth planet from the Sun – a dusty, cold, desert world with a very thin atmosphere. Mars is also a dynamic planet with seasons, polar ice caps, canyons, and extinct volcanoes.', facts: [{ label: 'Diameter', value: '6,779 km' }, { label: 'Day Length', value: '24.6 hours' }, { label: 'Orbital Period', value: '687 Earth days' }], moons: [{ name: 'Phobos', radius: 0.2, distance: 2, speed: 0.08, color: 0xaaaaaa }, { name: 'Deimos', radius: 0.15, distance: 3, speed: 0.04, color: 0xbbbbbb }] },
		ceres: { name: 'Ceres', radius: 0.5, distance: 110, speed: 0.021, color: 0x964B00, tilt: 4, description: 'Ceres is the largest object in the asteroid belt between Mars and Jupiter and the only dwarf planet located in the inner solar system.', facts: [{ label: 'Diameter', value: '940 km' }, { label: 'Category', value: 'Dwarf Planet' }, { label: 'Orbital Period', value: '4.6 Earth years' }] },
		jupiter: { name: 'Jupiter', radius: 8, distance: 140, speed: 0.013, color: 0xffd700, tilt: 3.1, description: 'Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass more than two and a half times that of all the other planets combined.', facts: [{ label: 'Diameter', value: '139,820 km' }, { label: 'Day Length', value: '9.9 Earth hours' }, { label: 'Orbital Period', value: '11.9 Earth years' }], moons: [{ name: 'Io', radius: 0.8, distance: 12, speed: 0.06, color: 0xffff00 }, { name: 'Europa', radius: 0.7, distance: 15, speed: 0.05, color: 0xfff4c1 }, { name: 'Ganymede', radius: 1.1, distance: 18, speed: 0.04, color: 0x8b4513 }, { name: 'Callisto', radius: 1.0, distance: 21, speed: 0.03, color: 0x4d4d4d }] },
		saturn: { name: 'Saturn', radius: 7, distance: 180, speed: 0.009, color: 0xf0e68c, tilt: 26.7, description: 'Saturn is the sixth planet from the Sun and the second-largest, after Jupiter. It is a gas giant known for its stunning ring system.', facts: [{ label: 'Diameter', value: '116,460 km' }, { label: 'Day Length', value: '10.7 Earth hours' }, { label: 'Orbital Period', value: '29.5 Earth years' }], moons: [{ name: 'Titan', radius: 1.0, distance: 12, speed: 0.03, color: 0xffa500 }] },
		uranus: { name: 'Uranus', radius: 5, distance: 220, speed: 0.006, color: 0xadd8e6, tilt: 97.8, description: 'Uranus is the seventh planet from the Sun. It has the third-largest planetary radius and is unique because it rotates on its side.', facts: [{ label: 'Diameter', value: '50,724 km' }, { label: 'Day Length', value: '17.2 Earth hours' }, { label: 'Orbital Period', value: '84 Earth years' }] },
		neptune: { name: 'Neptune', radius: 4.8, distance: 260, speed: 0.005, color: 0x00008b, tilt: 28.3, description: 'Neptune is the eighth and most distant major planet orbiting our Sun. It\'s a dark, cold, and windy world.', facts: [{ label: 'Diameter', value: '49,244 km' }, { label: 'Day Length', value: '16.1 Earth hours' }, { label: 'Orbital Period', value: '164.8 Earth years' }] },
		pluto: { name: 'Pluto', radius: 0.8, distance: 300, speed: 0.004, color: 0xcccccc, tilt: 122.5, description: 'Pluto is a dwarf planet in the Kuiper Belt, a donut-shaped region of icy bodies beyond the orbit of Neptune.', facts: [{ label: 'Diameter', value: '2,377 km' }, { label: 'Category', value: 'Dwarf Planet' }, { label: 'Orbital Period', value: '248 Earth years' }] },
		haumea: { name: 'Haumea', radius: 0.6, distance: 330, speed: 0.0038, color: 0xd8c2a9, tilt: 28.2, description: 'Haumea is a dwarf planet located beyond Neptune\'s orbit that is shaped like a flattened egg and spins very rapidly.', facts: [{ label: 'Diameter', value: '1,632 km' }, { label: 'Category', value: 'Dwarf Planet' }, { label: 'Orbital Period', value: '284 Earth years' }] },
		makemake: { name: 'Makemake', radius: 0.7, distance: 360, speed: 0.0036, color: 0xff6347, tilt: 29, description: 'Makemake is a dwarf planet in the Kuiper Belt. It is the second brightest object in the Kuiper Belt as seen from Earth.', facts: [{ label: 'Diameter', value: '1,434 km' }, { label: 'Category', value: 'Dwarf Planet' }, { label: 'Orbital Period', value: '305 Earth years' }] },
		eris: { name: 'Eris', radius: 0.8, distance: 400, speed: 0.003, color: 0xeeeeee, tilt: 44.2, description: 'Eris is one of the largest known dwarf planets in our solar system. It\'s about the same size as Pluto but is three times farther from the Sun.', facts: [{ label: 'Diameter', value: '2,326 km' }, { label: 'Category', value: 'Dwarf Planet' }, { label: 'Orbital Period', value: '557 Earth years' }] }
	};

	// --- Object Creation ---
	const planets = new THREE.Group();
	scene.add(planets);

	const sunGeometry = new THREE.SphereGeometry(planetData.sun.radius, 32, 32);
	const sunMaterial = new THREE.MeshBasicMaterial({ color: planetData.sun.color, emissive: planetData.sun.color, emissiveIntensity: 1 });
	const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
	sunMesh.userData = planetData.sun;
	scene.add(sunMesh);

	Object.keys(planetData).forEach(key => {
		if (key === 'sun') return;
		const data = planetData[key];
		const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
		const material = new THREE.MeshStandardMaterial({ color: data.color });
		const planet = new THREE.Mesh(geometry, material);
		planet.userData = data;

		planet.rotation.z = (data.tilt || 0) * Math.PI / 180;

		const orbit = new THREE.Object3D();
		orbit.add(planet);
		planets.add(orbit);
		planet.position.x = data.distance;

		// Moons
		if (data.moons) {
			data.moons.forEach(moonData => {
				const moonGeom = new THREE.SphereGeometry(moonData.radius, 16, 16);
				const moonMat = new THREE.MeshStandardMaterial({ color: moonData.color });
				const moonMesh = new THREE.Mesh(moonGeom, moonMat);
				moonMesh.userData = { name: moonData.name, ...moonData, description: `A moon of ${data.name}.`, facts: [{ label: 'Diameter', value: `${moonData.radius * 2 * 1000} km (approx)` }] }; // Simplified facts for moons

				const moonOrbit = new THREE.Object3D();
				moonOrbit.add(moonMesh);
				moonMesh.position.x = moonData.distance;
				moonOrbit.userData.speed = moonData.speed; // Store speed for animation
				planet.add(moonOrbit); // Add moon orbit to the planet
			});
		}

		if (data.name === 'Saturn') {
			const ringGeometry = new THREE.RingGeometry(data.radius + 2, data.radius + 6, 64);
			const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
			const ring = new THREE.Mesh(ringGeometry, ringMaterial);
			ring.rotation.x = -Math.PI * 0.5;
			planet.add(ring);
		}

		const orbitPathGeometry = new THREE.RingGeometry(data.distance - 0.1, data.distance + 0.1, 256);
		const orbitPathMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.15 });
		const orbitPath = new THREE.Mesh(orbitPathGeometry, orbitPathMaterial);
		orbitPath.rotation.x = -Math.PI * 0.5;
		scene.add(orbitPath);
	});

	// --- Stars ---
	function addStar() {
		const geometry = new THREE.SphereGeometry(0.3, 24, 24);
		const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
		const star = new THREE.Mesh(geometry, material);
		const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(1800));
		star.position.set(x, y, z);
		scene.add(star);
	}
	Array(600).fill().forEach(addStar);

	// --- Interaction ---
	const raycaster = new THREE.Raycaster();
	const mouse = new THREE.Vector2();
	let initialPinchDistance = 0;

	function onPointerClick(event) {
		if (event.target.closest('.control-btn')) return;

		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
		raycaster.setFromCamera(mouse, camera);
		const intersects = raycaster.intersectObjects(scene.children, true);
		if (intersects.length > 0) {
			const clickedObject = intersects[0].object;
			if (clickedObject.userData && clickedObject.userData.name) {
				showInfoPanel(clickedObject.userData);
			}
		}
	}
	window.addEventListener('click', onPointerClick);

	function handleZoom(scale) {
		const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
		offset.multiplyScalar(scale);
		const newPos = new THREE.Vector3().copy(controls.target).add(offset);
		if (newPos.length() > controls.minDistance && newPos.length() < controls.maxDistance) {
			camera.position.copy(newPos);
		}
	}

	// --- UI & Controls ---
	const infoPanel = document.getElementById('info-panel');
	document.getElementById('close-btn').addEventListener('click', () => infoPanel.classList.add('info-panel-hidden'));

	document.getElementById('zoom-in-btn').addEventListener('click', () => handleZoom(0.9));
	document.getElementById('zoom-out-btn').addEventListener('click', () => handleZoom(1.1));

	const playIcon = document.getElementById('play-icon');
	const pauseIcon = document.getElementById('pause-icon');
	document.getElementById('play-pause-btn').addEventListener('click', () => {
		isPaused = !isPaused;
		playIcon.classList.toggle('hidden');
		pauseIcon.classList.toggle('hidden');
	});

	document.getElementById('speed-up-btn').addEventListener('click', () => { animationSpeed *= 1.5; });
	document.getElementById('speed-down-btn').addEventListener('click', () => { animationSpeed /= 1.5; });

	function showInfoPanel(data) {
		document.getElementById('planet-name').textContent = data.name;
		document.getElementById('planet-description').textContent = data.description || 'No description available.';
		const factsContainer = document.getElementById('planet-facts');
		factsContainer.innerHTML = '';
		(data.facts || []).forEach(fact => {
			const factEl = document.createElement('div');
			factEl.classList.add('flex', 'justify-between', 'border-b', 'border-gray-700', 'py-2');
			factEl.innerHTML = `<span class="font-semibold text-gray-200">${fact.label}</span><span class="text-gray-400">${fact.value}</span>`;
			factsContainer.appendChild(factEl);
		});
		infoPanel.classList.remove('info-panel-hidden');
	}

	// --- Touch Controls for Zoom ---
	function getDistance(touches) {
		return Math.hypot(touches[0].pageX - touches[1].pageX, touches[0].pageY - touches[1].pageY);
	}

	renderer.domElement.addEventListener('touchstart', (event) => {
		if (event.touches.length === 2) {
			initialPinchDistance = getDistance(event.touches);
		}
	});

	renderer.domElement.addEventListener('touchmove', (event) => {
		if (event.touches.length === 2) {
			event.preventDefault();
			const newDist = getDistance(event.touches);
			const scale = initialPinchDistance / newDist;
			handleZoom(scale);
			initialPinchDistance = newDist;
		}
	}, { passive: false });

	// --- Animation Loop ---
	function animate() {
		requestAnimationFrame(animate);
		if (!isPaused) {
			const speedFactor = animationSpeed * 0.05;
			planets.children.forEach(orbit => {
				const planetMesh = orbit.children[0];
				orbit.rotation.y += (planetMesh.userData.speed || 0) * speedFactor;
				planetMesh.rotation.y += 0.05 * speedFactor;

				// Animate moons
				planetMesh.children.forEach(child => {
					if (child instanceof THREE.Object3D && child.userData.speed) {
						child.rotation.y += child.userData.speed * speedFactor * 5; // Moons orbit faster
					}
				});
			});
			sunMesh.rotation.y += 0.001 * speedFactor;
		}
		controls.update();
		renderer.render(scene, camera);
	}

	// --- Resize Handler ---
	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}
	window.addEventListener('resize', onWindowResize);

	animate();

	if ('serviceWorker' in navigator) {
		window.addEventListener('load', () => {
			navigator.serviceWorker.register('./sw.js').then(registration => {
				console.log('ServiceWorker registration successful with scope: ', registration.scope);
			}, err => {
				console.log('ServiceWorker registration failed: ', err);
			});
		});
	}

});