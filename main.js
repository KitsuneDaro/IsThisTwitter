import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

window.addEventListener('load', init);

function onResize(renderer, camera) {
    // サイズを取得
    const width = window.innerWidth;
    const height = window.innerHeight;

    // レンダラーのサイズを調整する
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    // カメラのアスペクト比を正す
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function init() {
    // CSVファイルを取得
    let csv = new XMLHttpRequest();
    
    // CSVファイルへのパス
    csv.open("GET", "twitter.csv", false);
    
    // csvファイル読み込み失敗時のエラー対応
    try {
        csv.send(null);
    } catch (err) {
        console.log(err);
    }
    
    // 配列を定義
    let firstPosArray = [];
    
    // 改行ごとに配列化
    let lines = csv.responseText.split(/\r\n|\n/);
    
    // 1行ごとに処理
    for (let i = 0; i < lines.length; ++i) {
        const cells = lines[i].split(",").map(Number);
        if (cells.length != 1) {
            firstPosArray.push(cells);
        }
    }
    
    // コンソールに配列を出力
    console.log(firstPosArray);

    const width = window.innerWidth;
    const height = window.innerHeight;

    // レンダラーを作成
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#MainCanvas')
    });

    // カメラを作成
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    // カメラの初期座標を設定（X座標:0, Y座標:0, Z座標:0）
    camera.position.set(200, -1000, 1000);

    // 初期化のために実行
    onResize(renderer, camera);
    // リサイズイベント発生時に実行
    window.addEventListener('resize', () => {onResize(renderer, camera)});

    // シーンを作成
    const scene = new THREE.Scene();

    // 球を作成
    const geometry = new THREE.SphereGeometry( 4, 32, 16 );
    let spheres = [];
    const size = 640;

    for(const firstPos of firstPosArray){
        const h = Math.round(mod(295 + (firstPos[1] + 1) * 55, 360));
        const s = 100;
        const l = 50 - Math.random() * 30;
        
        const color = new THREE.Color(`hsl(${h}, ${s}%, ${l}%)`);
        const material = new THREE.MeshPhongMaterial({color: color});
        const shpere = new THREE.Mesh(geometry, material);
        
        const scale = Math.max(1.2 - Math.abs(firstPos[2]), 0)
        shpere.scale.set(scale, scale, scale);
        shpere.position.x = firstPos[0] * size;
        shpere.position.y = firstPos[1] * -size;
        shpere.position.z = firstPos[2] * size / 4;
        scene.add(shpere);

        spheres.push(shpere);
    }

    // 平行光源
    const light = new THREE.DirectionalLight(0xFFFFFF);
    light.intensity = 2; // 光の強さを倍に
    light.position.set(-0.5, 0.2, 1); // ライトの方向
    // シーンに追加
    scene.add(light);

    const controls = new OrbitControls(camera, document.body);

    // 初回実行
    const clock = new THREE.Clock();
    tick();
    camera.rotation.order = "XYZ"

    function tick() {
        requestAnimationFrame(tick);
        
        const delta = Math.min(clock.getDelta(), 0.018);
        const angle = -0.025 * delta;

        // 球を回転させる
        for(const shpere of spheres){
            const prePos = shpere.position;
            shpere.position.x = prePos.x * Math.cos(angle) - prePos.y * Math.sin(angle)
            shpere.position.y = prePos.x * Math.sin(angle) + prePos.y * Math.cos(angle)
        }

        // 原点方向を見つめる
        camera.lookAt(new THREE.Vector3(0, -100, 0));
        // レンダリング
        renderer.render(scene, camera);
    }
}

function mod(a, n){
    return ((a % n) + n) % n
}