import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {VRMLoaderPlugin,VRMUtils} from '@pixiv/three-vrm';
const r=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});r.setPixelRatio(Math.min(devicePixelRatio,2));r.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(26,1,.1,30);cam.position.set(0,1,5);cam.lookAt(0,.8,0);
scene.add(new THREE.AmbientLight(0xffffff,.55));const key=new THREE.DirectionalLight(0xffffff,1.1);key.position.set(1,2,3);scene.add(key);
const rim=new THREE.DirectionalLight(0xffd87a,1);rim.position.set(-2,1.5,-2);scene.add(rim);
const ring=new THREE.Mesh(new THREE.TorusGeometry(.62,.02,12,64),new THREE.MeshBasicMaterial({color:0xffd87a}));ring.rotation.x=Math.PI/2;ring.position.y=.01;scene.add(ring);
const disc=new THREE.Mesh(new THREE.CircleGeometry(.62,48),new THREE.MeshBasicMaterial({color:0xffd87a,transparent:true,opacity:.18}));disc.rotation.x=-Math.PI/2;scene.add(disc);
const N=90,pg=new THREE.BufferGeometry(),pp=new Float32Array(N*3);for(let i=0;i<N;i++){const a=Math.random()*6.28,d=.4+Math.random()*.7;pp[i*3]=Math.cos(a)*d;pp[i*3+1]=Math.random()*2;pp[i*3+2]=Math.sin(a)*d}pg.setAttribute('position',new THREE.BufferAttribute(pp,3));const pts=new THREE.Points(pg,new THREE.PointsMaterial({color:0xffe9b0,size:.02,transparent:true,opacity:.9}));scene.add(pts);
let vrm=null,on=false,last=0,t0=0;
const gl=new GLTFLoader();gl.register(p=>new VRMLoaderPlugin(p));
gl.loadAsync('models/hero.vrm').then(g=>{vrm=g.userData.vrm;VRMUtils.rotateVRM0(vrm);scene.add(vrm.scene);vrm.scene.traverse(o=>{o.frustumCulled=false});
 const H=n=>vrm.humanoid.getNormalizedBoneNode(n);H('leftUpperArm').rotation.z=-1.2;H('rightUpperArm').rotation.z=1.2;H('leftLowerArm').rotation.z=-.15;H('rightLowerArm').rotation.z=.15;
 window.__vrm=vrm;window.Stage3D=api;window.dispatchEvent(new Event('stage-ready'))}).catch(e=>console.error(e));
function tint(h){vrm.scene.traverse(o=>{if(!o.isMesh)return;for(const m of [].concat(o.material)){const n=m.name||'',c=/HAIR/.test(n)?h.hair:/Tops/.test(n)?h.top:/Bottoms|Shoes/.test(n)?h.low:null;if(c!=null&&m.color){m.color.set(c);if(m.shadeColorFactor)m.shadeColorFactor.set(c).multiplyScalar(.65)}}});ring.material.color.set(h.r===5?0xffd87a:0xc79bff);disc.material.color.copy(ring.material.color)}
function frame(ts){if(!on)return;requestAnimationFrame(frame);const dt=Math.min(.05,(ts-last)/1000||0);last=ts;const t=(ts-t0)/1000,e=Math.min(1,t/.9),ez=1-(1-e)**3;
 vrm.scene.rotation.y=(1-ez)*4;vrm.scene.position.y=(1-ez)*-.25;const H=n=>vrm.humanoid.getNormalizedBoneNode(n);H('spine').rotation.x=Math.sin(t*1.6)*.015;H('head').rotation.y=Math.sin(t*.7)*.08;H('head').rotation.x=Math.sin(t*1.1)*.025;
 const em=vrm.expressionManager;em?.setValue('happy',.65);em?.setValue('blink',(t%3.4)<.12?1:0);vrm.update(dt);pts.rotation.y=t*.25;r.render(scene,cam)}
const api={show(el,h){tint(h);const b=el.getBoundingClientRect();r.setSize(b.width,b.height,false);cam.aspect=b.width/b.height;cam.updateProjectionMatrix();el.append(r.domElement);on=true;last=t0=performance.now();requestAnimationFrame(frame)},
 hide(){r.render(scene,cam);const s=document.createElement('canvas');s.width=88;s.height=120;const c=s.getContext('2d'),d=r.domElement,sw=d.width*.3,sh=sw*120/88;c.drawImage(d,d.width/2-sw/2,d.height*.04,sw,sh,0,0,88,120);on=false;r.domElement.remove();return s.toDataURL('image/png')}};
