
import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { select } from 'three/webgpu';



let camera, controls, scene, renderer, raycaster, mouse, prevSelect=null;

init();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);
    scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(-70, 70, -400);

    // Controls
    controls = new MapControls(camera, renderer.domElement);
    controls.enableDamping = true; // Enable damping (inertia)
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 100;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI / 2;

    const loader = new GLTFLoader();
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();


    loader.load(
        './assets/models/louvre2.gltf',
        function (gltf) {
          const model = gltf.scene;

          scene.add(model);
          console.log('LOUVRE LOADING');

          printObjects(model);

        },
        undefined,
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        function (error) {
          console.error('An error occurred while loading the model:', error);
        }
      );


  // Lights
  const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
  dirLight1.position.set(1, 1, 1);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x002288, 3);
  dirLight2.position.set(-1, -1, -1);
  scene.add(dirLight2);

  const ambientLight = new THREE.AmbientLight(0x555555);
  scene.add(ambientLight);

  // GUI
  const gui = new GUI();
  gui.add(controls, 'zoomToCursor');
  gui.add(controls, 'screenSpacePanning');

  // Event Listeners
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('click', onMouseClick, false);
}

function printObjects(model) {
  // Traverse through each child in the model
  model.traverse((child) => {
    // Log the type and name of the object
    console.log(`Type: ${child.type}, Name: ${child.name}`);

    // If the child is a mesh, log its geometry and material
    if (child.isMesh) {
      // console.log('Geometry:', child.geometry);
      // console.log('Material:', child.material);

      if (child.name === "Pyramid"){
        child.name ="pyramid";
      }

      // If the material is an array (multi-material), log each material
      // if (Array.isArray(child.material)) {
      //   child.material.forEach((material, index) => {
      //     console.log(`Material ${index}:`, material);
      //   });
      // }
    }
  });
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseClick(event) {
  // Calculate mouse position in normalized device coordinates (-1 to +1) for both axes
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(scene.children, true); // 'true' means to check all descendants

  if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;

      if (intersectedObject.name === "pyramid") {
          console.log("Door clicked! Transition to the next scene.");
          loadRoomScene(); // Function to load the room scene
      }
  }
}
function onMouseMove(event) {
  // Update mouse position in normalized device coordinates (-1 to +1 range)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Use the raycaster to find intersects
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  
  if (intersects.length > 0) {
      const object = intersects[0].object;
      console.log(object.name);
      
      if (object !== prevSelect){
        if (prevSelect!==null){
          prevSelect.material.emissive = new THREE.Color(0x000000);
          }
      }
      if (object.name.includes('Object_')){
        object.material.emissive = new THREE.Color(0xff0000);
        prevSelect = object;
      }
      

  //     // If hovering over a new painting, highlight it
  //     if (object !== selectedPainting) {
  //         if (selectedPainting) {
  //             // Reset the color of the previously selected painting
  //             selectedPainting.material.emissive.set(0x000000);
  //         }

  //         if (object.isMesh) {
  //             // Highlight the currently intersected painting
  //             object.material.emissive = new THREE.Color(0xff0000); // Set emissive highlight color
  //             selectedPainting = object;
  //         }
  //     }
  // } else {
  //     // If no object is intersected, reset the previously highlighted painting
  //     if (selectedPainting) {
  //         selectedPainting.material.emissive.set(0x000000);
  //         selectedPainting = null;
  //     }
  } 
}
function loadRoomScene() {
  // Clear the current scene
  while(scene.children.length > 0){ 
      scene.remove(scene.children[0]); 
  }
  
  const loader = new GLTFLoader();
  loader.load(
      './assets/models/scene.glb',
      function (gltf) {
          const model = gltf.scene;
          model.scale.setScalar(16);
          printObjects(model);

          // Add model to the scene
          scene.add(model);
          console.log('ROOM LOADING');
      },
      undefined,
      function (xhr) {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      function (error) {
          console.error('An error occurred while loading the model:', error);
      }
  );

    // Ambient Light
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // Increase the intensity to 1.5
  scene.add(ambientLight);

  // Point Light (Simulating a lamp or light fixture in the room)
  const pointLight = new THREE.PointLight(0xffffff, 1, 100);
  pointLight.position.set(2, 3, 2); // Place the point light somewhere within the room
  scene.add(pointLight);
  
  // Raycaster setup
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Event listeners
  window.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('click', onMouseClick, false);
  window.addEventListener('resize', onWindowResize, false);

  // Adjust the camera position to suit the new scene
  camera.position.set(10, 0, 10);  // Camera inside the room, at eye level
  camera.lookAt(0, 0, 0);  // Make the camera look towards the center
  controls.update();
}


function animate() {
  controls.update(); // Only required if controls.enableDamping = true, or if controls.autoRotate = true
  renderer.render(scene, camera);
}

