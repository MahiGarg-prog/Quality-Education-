import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'



let closeBook =  {}
let bookCords = new THREE.Vector3(3.13468872319038,-1.9478440352349888,1.4303376240006294);
const divBook = document.querySelector('.book')

//#region Scene Setup
const scene = new THREE.Scene();
scene.background = null;
//#endregion

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

//#region Size Specification
const size = {
    width: window.innerWidth,
    height: window.innerHeight
};
//#endregion

//#region Lighting Setup
const light = new THREE.PointLight(0xffffff, 100, 100);
light.position.set(-9,6,14);
scene.add(light);
//#endregion

const light1 = new THREE.PointLight(0xffffff, 100, 100);
light1.position.set(1, 4, 17);
scene.add(light1);

const light2 = new THREE.PointLight(0xffffff, 60, 100);
light2.position.set(0, 2, 0);
scene.add(light2);

//#region Camera Setup

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 10000 );
camera.position.z = 14.055122525941586
camera.position.y = 6.0700667313100265
camera.position.x = -9.156305200376599

scene.add(camera);
//#endregion

//#region Renderer Setup
const canvas = document.querySelector('.webgl');
var renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	antialias: true,
	alpha: true 
});
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.setSize(size.width, size.height);
renderer.render(scene, camera);
//#endregion

//#region Controls Setup
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target = bookCords;
controls.enableRotate = false



let centerX = window.innerWidth / 2;
let centerY = window.innerHeight / 2;

window.addEventListener('mousemove', onMouseMove, false);


const maxDisplacementX = 10; 
const maxDisplacementY = 20; 

function onMouseMove(event) {
    if(overBook == false){
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;

    
    const moveSpeed = 0.00035; 
    camera.position.x = THREE.MathUtils.clamp(camera.position.x + deltaX * moveSpeed, -maxDisplacementX, maxDisplacementX);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y - deltaY * moveSpeed, -maxDisplacementY, maxDisplacementY); 
    }
}


window.addEventListener('resize', () => {
    centerX = window.innerWidth / 2;
    centerY = window.innerHeight / 2;
});

// Disable context menu on right-click to prevent interference with camera control
document.addEventListener('contextmenu', event => event.preventDefault());

window.addEventListener('resize', ()=>{
    size.width = window.innerWidth;
    size.height = window.innerHeight;

    camera.aspect = size.width/size.height;
    camera.updateProjectionMatrix();
    renderer.setSize(size.width, size.height)
})



const loader = new GLTFLoader();

loader.load( 'book1.glb', function ( gltf ) {
    const model =  gltf.scene
    model.position.x = bookCords.x
    model.position.y = bookCords.y
    model.position.z = bookCords.z
    model.scale.set(0.5, 0.5, 0.5);

    model.rotation.y = -1.58

	scene.add(model);
    closeBook = {
       model: function() {
            return model
        }
    }

});

let house ={}

loader.load( 'scene1.glb', function ( gltf ) {
    const model =  gltf.scene

    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());

    
   model.position.x -= center.x;
   model.position.y -= center.y;
   model.position.z -= center.z;

   model.position.x += 1
   model.position.y -= 1
   model.position.z += 1
    
	scene.add(model);
    house = {
        model: ()=>{
          return model
        }
    }
   

});

let bookVisible = false;
let startX;
const pages = document.querySelectorAll('.page');
let index = 1


 pages.forEach(function(elem) {
    let mousePressed = false
    let rotateDeg = 0;
    let element = {}

    elem.addEventListener("mousedown", (e)=> {
        if(coverStyle.zIndex == '0'){
        if(mousePressed == false){
        element = {
            page: ()=>{
               return elem
            }
        }
    }
    
    for(let i =0; i<pages.length; i++){
        if(pages[i] != elem){
           pages[i].style.pointerEvents = 'none'
    }
    }
        startX = e.offsetX;
        divBook.style.cursor =  'grabbing';
        mousePressed = true;
        rotateDeg = 0

        
    }});

    elem.addEventListener("mousemove", (e)=> {
        if(mousePressed){
        let flipRate = 3;
        rotateDeg = (e.offsetX - startX)/180 * 100 * flipRate;
        element.page().style.transform = `rotateX(10deg) rotateY(${rotateDeg}deg)`
        document.querySelectorAll('img').forEach(function(img){
            img.style.transition = 'transform 0.5s'
            img.style.transform = `translateX(${rotateDeg/4.5}px)`
        })
        
        if(rotateDeg < -90){
            element.page().style.transitionDelay = "0s";
                element.page().style.zIndex = index;
                index++;
        }else if(startX - e.offsetX < 0 && rotateDeg > -90){
            setTimeout(()=>{element.page().style.zIndex = 1}, 1000);
            
        }
    
     }
    })

    window.addEventListener("mouseup", ()=> {
    if(mousePressed){
        if(rotateDeg < -90){
            element.page().style.transform = `rotateX(10deg) rotateY(-180deg) `;
            
        } else if (rotateDeg > -90 && (rotateDeg * 180/100/3) > 0 ){
            elem.style.transform = `rotateX(10deg) rotateY(0deg)`;
            
        }
        mousePressed = false;
        

        setTimeout(()=>{
            pages.forEach(function(page){
                page.style.pointerEvents = "auto"
        })
        },1000)
        

        document.querySelectorAll('img').forEach(function(img){
            img.style.transition = 'transform 2s'
            img.style.transform = `translateX(0px)`
        })
        
}});
})


let overBook = false;
let infoSeen = false;

const coverStyle =  document.querySelector(".cover").style;
const backCoverStyle = document.querySelector(".backCover").style;
window.addEventListener("mouseup", (event) => {
    mouse.x = (event.clientX / size.width) * 2 - 1;
    mouse.y = -(event.clientY / size.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([closeBook.model()], true);
    const houseIntersects = raycaster.intersectObjects([house.model()], true);
    
    if (intersects.length > 0) {
        async function OpenBook(){
            controls.autoRotate = false
            controls.enableRotate = false
            await gsap.to(camera.position, {z:1.4292012585413978, y:0.04705736198446164, x:2.9961893465405627, duration: 3});
            await gsap.to(closeBook.model().position, {x: 3.1421777189863764, z:1.795, duration: 2});
 
            
           divBook.style.visibility = "visible"
            bookVisible = true
           if(infoSeen == false){
           coverStyle.transform = "rotateX(10deg) rotateY(-180deg)"
           setTimeout(()=>{
            scene.remove(closeBook.model());
            coverStyle.zIndex = 0;
           },500)
   
        }
           

           setTimeout(()=>{
            document.querySelector('.info').style.top = '25%'
            document.querySelector('.info').style.right = '-10%'
            document.querySelector('.iText').textContent = 'Flip the pages'
            if(infoSeen == false){
            document.querySelector('.info').style.visibility = 'visible'
            }
            setTimeout(()=>{
                document.querySelector('.info').style.visibility = 'hidden';
                infoSeen = true;
            },4000)
           },4000)
        }
        if(overBook){
        OpenBook()
        }
    }
    
    if(houseIntersects.length > 0){
        if(overBook == false){
           moveToBook()
           overBook = true    
        }

    }

    if(bookVisible){
      divBook.style.cursor =  'grab';
    }
});


function moveToBook(){
    let h1 = document.querySelectorAll('h1');
    h1.forEach(element => {
       element.textContent = ""
    });
      gsap.to(camera.position, {x:1.7646984053122199,y: 0.23614540642467852,z:1.609414118823052, duration:3})    
      document.querySelector('.info').style.visibility = 'hidden'
    }
 
//#region Animation Loop
const loop = () => {
    controls.update()
    renderer.render(scene, camera);
    window.requestAnimationFrame(loop);
};
loop();
//#endregion


setTimeout(()=>{
    if(overBook == false){
        document.querySelector('.iText').textContent = 'Click On the Book'
        document.querySelector('.info').style.visibility = 'visible'
    }
},5000)

document.querySelector('.goToStart').addEventListener('click',()=>{
      pages.forEach(function(page){
        page.style.zIndex = 1;
        page.style.transform = 'rotateX(10deg) rotateY(0deg)';
        coverStyle.zIndex = 2;
        coverStyle.transform = 'rotateX(10deg) rotateY(0deg)';
        document.querySelector('.readAgain').style.visibility = 'visible'
      })
})

document.querySelector('.readAgain').addEventListener('click',()=>{
        coverStyle.zIndex = 0;
        coverStyle.transform = 'rotateX(10deg) rotateY(-180deg)';
        document.querySelector('.readAgain').style.visibility = 'hidden'
})

