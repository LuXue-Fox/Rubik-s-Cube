import * as THREE from 'three';
import { ArcballControls } from 'https://cdn.jsdelivr.net/npm/three@0.185.1/examples/jsm/controls/ArcballControls.js';
import Stats from 'https://cdn.jsdelivr.net/npm/three@0.185.1/examples/jsm/libs/stats.module.js';

var Cube_3D = function (viewer, size) {

    viewer.style.background = "url('https://github.com/LuXue-Fox/Rubik-s-Cube/blob/main/img/transparentBG.png?raw=true')";

    size = Number(size);
    if (!Number.isFinite(size) || (size < 2 || size > 7)) {
        size = 3;
    }

    var FPS = 1000;  //幀數(每秒畫面刷新次數)
    var AnimationSpeed = 180;
    var intervalId = null;

    var now_cube = null;
    var cube_data = null;
    var cube_mesh = {};
    const c_li = ['U', 'D', 'L', 'F', 'R', 'B'];
    const colors = ['yellow', 'white', '#D43308', 'ForestGreen', 'DarkOrange', 'RoyalBlue', '#444444'];
    var grids = null;
    var grid_xy = null;
    var is_moving = false;
    var infoBox = null;

    var rotate_list = [rotateCW, rotateCCW, rotate180];

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        Math.min(viewer.clientWidth, viewer.clientHeight) > 700 ? 70 : 90,
        viewer.clientWidth / viewer.clientHeight,
        0.1,
        500
    );
    camera.position.set(110, 110, 155);
    camera.lookAt(new THREE.Vector3(0, 20, 0));
    camera.updateProjectionMatrix();

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        viewer,
        alpha: true,
    });
    renderer.setSize(viewer.clientWidth, viewer.clientHeight);
    viewer.appendChild(renderer.domElement);

    const arcballcontrols = new ArcballControls(camera, viewer);
    arcballcontrols.enableFocus = false;
    arcballcontrols.rotateSpeed = 0.8;
    arcballcontrols.maxDistance = 400;
    arcballcontrols.minDistance = 150;
    arcballcontrols.update();

    const ambientlight = new THREE.AmbientLight(0x404040, 50); // 環境光
    scene.add(ambientlight);

    //瀏覽器縮放時畫面自動調整
    window.addEventListener("resize", () => {
        resize();
    });

    new ResizeObserver(() => {
        resize();
    }).observe(viewer);

    function resize() {
        camera.aspect = viewer.clientWidth / viewer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(viewer.clientWidth, viewer.clientHeight);

        if (Math.min(viewer.clientWidth, viewer.clientHeight) < 700 ) {
            setFov(90);
        }
        else {
            setFov(70);
        }
    }

    // 左上顯示6面顏色區塊的RWD設置
    const mediaQuery = window.matchMedia("(max-width: 700px)");
    mediaQuery.addEventListener("change", (e) => {
        if (e.matches) {
            // console.log("進入 700px 以下");
            infoBox.style.cssText = 'position: absolute;top: 3px;left: 3px;padding: 4px;border-radius: 6px;';
        } else {
            // console.log("超過 700px");
            infoBox.style.cssText = 'position: absolute;top: 10px;left: 10px;padding: 8px;border-radius: 10px;';
        }
    });

    //右上角顯示幀數的
    const stats = Stats();
    viewer.appendChild(stats.dom);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '';
    stats.domElement.style.right = '0px';
    stats.domElement.style.top = '0px';

    //動畫
    function render() {
        renderer.render(scene, camera);
        stats.update();
    }

    function rotateCW(matrix) {  //矩陣順時針旋轉
        const n = matrix.length;
        return Array.from({ length: n }, (_, y) =>
            Array.from({ length: n }, (_, x) =>
                matrix[n - 1 - x][y]
            )
        );
    }

    function rotateCCW(matrix) {  //矩陣逆時針旋轉
        const n = matrix.length;
        return Array.from({ length: n }, (_, y) =>
            Array.from({ length: n }, (_, x) =>
                matrix[x][n - 1 - y]
            )
        );
    }

    function rotate180(matrix) {  //矩陣180度旋轉
        const n = matrix.length;
        return Array.from({ length: n }, (_, y) =>
            Array.from({ length: n }, (_, x) =>
                matrix[n - 1 - y][n - 1 - x]
            )
        );
    }

    //start
    function start() {
        now_cube = new CUBE();
        createGrid();
        change_grid();
        create_reversion_btn();
        resize();
        intervalId = setInterval(() => {
            render();
        }, 1000 / FPS);
    }

    //設置畫面刷新率
    function setFPS(fps) {
        if (typeof fps === 'number') FPS = fps;
        else return;
        clearInterval(intervalId);
        intervalId = setInterval(() => {
            render();
        }, 1000 / FPS);
    }

    //設置鏡頭垂直視野(角度)，最大180
    function setFov(fov) {
        camera.fov = fov;
    }

    //設置動畫速度
    function setAnimationSpeed(speed) {
        AnimationSpeed = speed;
    }

    class CUBE {
        constructor() {
            const cube_LWH = 100;
            var LWH = cube_LWH / size;
            var cube_geometry = new THREE.BoxGeometry(LWH * 0.999, LWH * 0.999, LWH * 0.999);
            var cube_material = new THREE.MeshLambertMaterial({ color: colors[6] });

            var m = size - 1;
            for (var x = 0; x < size; x++) {
                for (var y = 0; y < size; y++) {
                    for (var z = 0; z < size; z++) {
                        if (x != 0 && x != m && y != 0 && y != m && z != 0 && z != m) continue;
                        var group = new THREE.Group();
                        var cube = new THREE.Mesh(cube_geometry.clone(), cube_material.clone());
                        cube.position.set(0, 0, 0);
                        group.add(cube);
                        if (y == 0) {  //D面 白色
                            var sticker_geometry = new THREE.BoxGeometry(LWH * 0.9, 0.2, LWH * 0.9);
                            var sticker_material = new THREE.MeshLambertMaterial({ color: colors[1] });
                            var sticker = new THREE.Mesh(sticker_geometry, sticker_material);
                            sticker.position.set(0, -(cube_LWH / size / 2), 0);
                            group.add(sticker);
                        }
                        if (y == m) {  //U面 黃色
                            var sticker_geometry = new THREE.BoxGeometry(LWH * 0.9, 0.2, LWH * 0.9);
                            var sticker_material = new THREE.MeshLambertMaterial({ color: colors[0] });
                            var sticker = new THREE.Mesh(sticker_geometry, sticker_material);
                            sticker.position.set(0, (cube_LWH / size / 2), 0);
                            group.add(sticker);
                        }
                        if (x == 0) {  //L面 紅色
                            var sticker_geometry = new THREE.BoxGeometry(0.2, LWH * 0.9, LWH * 0.9);
                            var sticker_material = new THREE.MeshLambertMaterial({ color: colors[2] });
                            var sticker = new THREE.Mesh(sticker_geometry, sticker_material);
                            sticker.position.set(-(cube_LWH / size / 2), 0, 0);
                            group.add(sticker);
                        }
                        if (x == m) {  //R面 橘色
                            var sticker_geometry = new THREE.BoxGeometry(0.2, LWH * 0.9, LWH * 0.9);
                            var sticker_material = new THREE.MeshLambertMaterial({ color: colors[4] });
                            var sticker = new THREE.Mesh(sticker_geometry, sticker_material);
                            sticker.position.set((cube_LWH / size / 2), 0, 0);
                            group.add(sticker);
                        }
                        if (z == 0) {  //B面 藍色
                            var sticker_geometry = new THREE.BoxGeometry(LWH * 0.9, LWH * 0.9, 0.2);
                            var sticker_material = new THREE.MeshLambertMaterial({ color: colors[5] });
                            var sticker = new THREE.Mesh(sticker_geometry, sticker_material);
                            sticker.position.set(0, 0, -(cube_LWH / size / 2));
                            group.add(sticker);
                        }
                        if (z == m) {  //F面 綠色
                            var sticker_geometry = new THREE.BoxGeometry(LWH * 0.9, LWH * 0.9, 0.2);
                            var sticker_material = new THREE.MeshLambertMaterial({ color: colors[3] });
                            var sticker = new THREE.Mesh(sticker_geometry, sticker_material);
                            sticker.position.set(0, 0, (cube_LWH / size / 2));
                            group.add(sticker);
                        }
                        group.position.set(
                            (-(cube_LWH / 2) + (cube_LWH / (size * 2) * (x * 2 + 1))),
                            (-(cube_LWH / 2) + (cube_LWH / (size * 2) * (y * 2 + 1))),
                            (-(cube_LWH / 2) + (cube_LWH / (size * 2) * (z * 2 + 1)))
                        );
                        scene.add(group);
                        var t = `${x}${y}${z}`;
                        cube_mesh[t] = group;
                    }
                }
            }
            cube_data = {
                'U': new Array(size),
                'D': new Array(size),
                'L': new Array(size),
                'F': new Array(size),
                'R': new Array(size),
                'B': new Array(size)
            };
            c_li.forEach((c, index) => {
                for (var i = 0; i < size; i++) {
                    cube_data[c][i] = new Array(size);
                    for (var j = 0; j < size; j++) {
                        cube_data[c][i][j] = colors[index];
                    }
                }
            });
        }
    }

    function move(s) {
        if (is_moving) return;
        is_moving = true;
        var l = 1;  //轉動層數
        if (s.includes('w')) l = 2;
        if (s.includes('3')) l = 3;
        if (s.includes('x') || s.includes('y') || s.includes('z')) l = size;
        var two_laps = s.includes('2');
        var group = new THREE.Group();
        scene.add(group);
        var rot = null;
        var list_key = Array.from({ length: l }, () =>
            Array.from({ length: size }, () =>
                new Array(size)
            )
        );
        var list_value = Array.from({ length: l }, () =>
            Array.from({ length: size }, () =>
                new Array(size)
            )
        );
        if (s.includes('U')) {
            for (var i = 0; i < l; i++) {
                for (let key in cube_mesh) {
                    var str = removeChar(key, 1);
                    if (Number(key[1]) == (size - 1 - i)) {
                        group.add(cube_mesh[key]);
                        list_key[i][Number(str[0])][Number(str[1])] = key;
                        list_value[i][Number(str[0])][Number(str[1])] = cube_mesh[key];
                    }
                };
            }
            if (!s.includes("'")) {
                if (!two_laps) {  //U
                    rot = 1;
                    cube_data.U = rotateCW(cube_data.U);
                    change_cube_data("U", l);
                    cube_animation(group, "y", 0, 90, -1);
                }
                else {  //U2
                    rot = 2;
                    cube_data.U = rotate180(cube_data.U);
                    change_cube_data("U", l);
                    change_cube_data("U", l);
                    cube_animation(group, "y", 0, 180, -1);
                }
            } else {  //U'
                rot = 0;
                cube_data.U = rotateCCW(cube_data.U);
                change_cube_data("U'", l);
                cube_animation(group, "y", 0, 90, 1);
            }
        }
        else if (s.includes('D')) {
            for (var i = 0; i < l; i++) {
                for (let key in cube_mesh) {
                    var str = removeChar(key, 1);
                    if (Number(key[1]) == i) {
                        group.add(cube_mesh[key]);
                        list_key[i][Number(str[0])][Number(str[1])] = key;
                        list_value[i][Number(str[0])][Number(str[1])] = cube_mesh[key];
                    }
                };
            }
            if (!s.includes("'")) {
                if (!two_laps) {  //D
                    rot = 0;
                    cube_data.D = rotateCW(cube_data.D);
                    change_cube_data("D", l);
                    cube_animation(group, "y", 0, 90, 1);
                }
                else {  //D2
                    rot = 2;
                    cube_data.D = rotate180(cube_data.D);
                    change_cube_data("D", l);
                    change_cube_data("D", l);
                    cube_animation(group, "y", 0, 180, 1);
                }

            } else {  //D'
                rot = 1;
                cube_data.D = rotateCCW(cube_data.D);
                change_cube_data("D'", l);
                cube_animation(group, "y", 0, 90, -1);
            }
        }
        else if (s.includes('L')) {
            for (var i = 0; i < l; i++) {
                for (let key in cube_mesh) {
                    var str = removeChar(key, 0);
                    if (Number(key[0]) == i) {
                        group.add(cube_mesh[key]);
                        list_key[i][Number(str[0])][Number(str[1])] = key;
                        list_value[i][Number(str[0])][Number(str[1])] = cube_mesh[key];
                    }
                };
            }
            if (!s.includes("'")) {
                if (!two_laps) {  //L
                    rot = 1;
                    cube_data.L = rotateCW(cube_data.L);
                    change_cube_data("L", l);
                    cube_animation(group, "x", 0, 90, 1);
                }
                else {  //L2
                    rot = 2;
                    cube_data.L = rotate180(cube_data.L);
                    change_cube_data("L", l);
                    change_cube_data("L", l);
                    cube_animation(group, "x", 0, 180, 1);
                }
            } else {  //L'
                rot = 0;
                cube_data.L = rotateCCW(cube_data.L);
                change_cube_data("L'", l);
                cube_animation(group, "x", 0, 90, -1);
            }
        }
        else if (s.includes('R')) {
            for (var i = 0; i < l; i++) {
                for (let key in cube_mesh) {
                    var str = removeChar(key, 0);
                    if (Number(key[0]) == (size - 1 - i)) {
                        group.add(cube_mesh[key]);
                        list_key[i][Number(str[0])][Number(str[1])] = key;
                        list_value[i][Number(str[0])][Number(str[1])] = cube_mesh[key];
                    }
                };
            }
            if (!s.includes("'")) {
                if (!two_laps) {  //R
                    rot = 0;
                    cube_data.R = rotateCW(cube_data.R);
                    change_cube_data("R", l);
                    cube_animation(group, "x", 0, 90, -1);
                }
                else {  //R2
                    rot = 2;
                    cube_data.R = rotate180(cube_data.R);
                    change_cube_data("R", l);
                    change_cube_data("R", l);
                    cube_animation(group, "x", 0, 180, -1);
                }
            } else {  //R'
                rot = 1;
                cube_data.R = rotateCCW(cube_data.R);
                change_cube_data("R'", l);
                cube_animation(group, "x", 0, 90, 1);
            }
        }
        else if (s.includes('F')) {
            for (var i = 0; i < l; i++) {
                for (let key in cube_mesh) {
                    var str = removeChar(key, 2);
                    if (Number(key[2]) == (size - 1 - i)) {
                        group.add(cube_mesh[key]);
                        list_key[i][Number(str[0])][Number(str[1])] = key;
                        list_value[i][Number(str[0])][Number(str[1])] = cube_mesh[key];
                    }
                };
            }
            if (!s.includes("'")) {
                if (!two_laps) {  //F
                    rot = 0;
                    cube_data.F = rotateCW(cube_data.F);
                    change_cube_data("F", l);
                    cube_animation(group, "z", 0, 90, -1);
                }
                else {  //F2
                    rot = 2;
                    cube_data.F = rotate180(cube_data.F);
                    change_cube_data("F", l);
                    change_cube_data("F", l);
                    cube_animation(group, "z", 0, 180, -1);
                }
            } else {  //F'
                rot = 1;
                cube_data.F = rotateCCW(cube_data.F);
                change_cube_data("F'", l);
                cube_animation(group, "z", 0, 90, 1);
            }
        }
        else if (s.includes('B')) {
            for (var i = 0; i < l; i++) {
                for (let key in cube_mesh) {
                    var str = removeChar(key, 2);
                    if (Number(key[2]) == i) {
                        group.add(cube_mesh[key]);
                        list_key[i][Number(str[0])][Number(str[1])] = key;
                        list_value[i][Number(str[0])][Number(str[1])] = cube_mesh[key];
                    }
                };
            }
            if (!s.includes("'")) {
                if (!two_laps) {  //B
                    rot = 1;
                    cube_data.B = rotateCW(cube_data.B);
                    change_cube_data("B", l);
                    cube_animation(group, "z", 0, 90, 1);
                }
                else {  //B2
                    rot = 2;
                    cube_data.B = rotate180(cube_data.B);
                    change_cube_data("B", l);
                    change_cube_data("B", l);
                    cube_animation(group, "z", 0, 180, 1);
                }
            } else {  //B'
                rot = 0;
                cube_data.B = rotateCCW(cube_data.B);
                change_cube_data("B'", l);
                cube_animation(group, "z", 0, 90, -1);
            }
        }
        else if (s.includes('M')) {
            for (let key in cube_mesh) {
                var str = removeChar(key, 0);
                if (Number(key[0]) == 1) {
                    group.add(cube_mesh[key]);
                    list_key[0][Number(str[0])][Number(str[1])] = key;
                    list_value[0][Number(str[0])][Number(str[1])] = cube_mesh[key];
                }
            };
            if (!s.includes("'")) {
                if (!two_laps) {  //M
                    rot = 1;
                    change_cube_data("M", 1);
                    cube_animation(group, "x", 0, 90, 1);
                }
                else {  //M2
                    rot = 2;
                    change_cube_data("M", 1);
                    change_cube_data("M", 1);
                    cube_animation(group, "x", 0, 180, 1);
                }
            } else {  //M'
                rot = 0;
                change_cube_data("M'", 1);
                cube_animation(group, "x", 0, 90, -1);
            }
        }
        else if (s.includes('S')) {
            for (let key in cube_mesh) {
                var str = removeChar(key, 2);
                if (Number(key[2]) == 1) {
                    group.add(cube_mesh[key]);
                    list_key[0][Number(str[0])][Number(str[1])] = key;
                    list_value[0][Number(str[0])][Number(str[1])] = cube_mesh[key];
                }
            };
            if (!s.includes("'")) {
                if (!two_laps) {  //S
                    rot = 0;
                    change_cube_data("S", 1);
                    cube_animation(group, "z", 0, 90, -1);
                }
                else {  //S2
                    rot = 2;
                    change_cube_data("S", 1);
                    change_cube_data("S", 1);
                    cube_animation(group, "z", 0, 180, -1);
                }
            } else {  //S'
                rot = 1;
                change_cube_data("S'", 1);
                cube_animation(group, "z", 0, 90, 1);
            }
        }
        else if (s.includes('E')) {
            for (let key in cube_mesh) {
                var str = removeChar(key, 1);
                if (Number(key[1]) == 1) {
                    group.add(cube_mesh[key]);
                    list_key[0][Number(str[0])][Number(str[1])] = key;
                    list_value[0][Number(str[0])][Number(str[1])] = cube_mesh[key];
                }
            };
            if (!s.includes("'")) {
                if (!two_laps) {  //E
                    rot = 0;
                    change_cube_data("E", 1);
                    cube_animation(group, "y", 0, 90, 1);
                }
                else {  //E2
                    rot = 2;
                    change_cube_data("E", 1);
                    change_cube_data("E", 1);
                    cube_animation(group, "y", 0, 180, 1);
                }
            } else {  //E'
                rot = 1;
                change_cube_data("E'", 1);
                cube_animation(group, "y", 0, 90, -1);
            }
        }
        else if (s.includes('x')) {
            for (var i = 0; i < l; i++) {
                for (let key in cube_mesh) {
                    var str = removeChar(key, 0);
                    if (Number(key[0]) == (size - 1 - i)) {
                        group.add(cube_mesh[key]);
                        list_key[i][Number(str[0])][Number(str[1])] = key;
                        list_value[i][Number(str[0])][Number(str[1])] = cube_mesh[key];
                    }
                };
            }
            if (!s.includes("'")) {
                if (!two_laps) {  //x
                    rot = 0;
                    cube_data.R = rotateCW(cube_data.R);
                    cube_data.L = rotateCCW(cube_data.L);
                    change_cube_data("R", l);
                    cube_animation(group, "x", 0, 90, -1);
                }
                else {  //x2
                    rot = 2;
                    cube_data.R = rotate180(cube_data.R);
                    cube_data.L = rotate180(cube_data.L);
                    change_cube_data("R", l);
                    change_cube_data("R", l);
                    cube_animation(group, "x", 0, 180, -1);
                }
            } else {  //x'
                rot = 1;
                cube_data.R = rotateCCW(cube_data.R);
                cube_data.L = rotateCW(cube_data.L);
                change_cube_data("R'", l);
                cube_animation(group, "x", 0, 90, 1);
            }
        }
        else if (s.includes('y')) {
            for (var i = 0; i < l; i++) {
                for (let key in cube_mesh) {
                    var str = removeChar(key, 1);
                    if (Number(key[1]) == (size - 1 - i)) {
                        group.add(cube_mesh[key]);
                        list_key[i][Number(str[0])][Number(str[1])] = key;
                        list_value[i][Number(str[0])][Number(str[1])] = cube_mesh[key];
                    }
                };
            }
            if (!s.includes("'")) {
                if (!two_laps) {  //y
                    rot = 1;
                    cube_data.U = rotateCW(cube_data.U);
                    cube_data.D = rotateCCW(cube_data.D);
                    change_cube_data("U", l);
                    cube_animation(group, "y", 0, 90, -1);
                }
                else {  //y2
                    rot = 2;
                    cube_data.U = rotate180(cube_data.U);
                    cube_data.D = rotate180(cube_data.D);
                    change_cube_data("U", l);
                    change_cube_data("U", l);
                    cube_animation(group, "y", 0, 180, -1);
                }
            } else {  //y'
                rot = 0;
                cube_data.U = rotateCCW(cube_data.U);
                cube_data.D = rotateCW(cube_data.D);
                change_cube_data("U'", l);
                cube_animation(group, "y", 0, 90, 1);
            }
        }
        else if (s.includes('z')) {
            for (var i = 0; i < l; i++) {
                for (let key in cube_mesh) {
                    var str = removeChar(key, 2);
                    if (Number(key[2]) == (size - 1 - i)) {
                        group.add(cube_mesh[key]);
                        list_key[i][Number(str[0])][Number(str[1])] = key;
                        list_value[i][Number(str[0])][Number(str[1])] = cube_mesh[key];
                    }
                };
            }
            if (!s.includes("'")) {
                if (!two_laps) {  //z
                    rot = 0;
                    cube_data.F = rotateCW(cube_data.F);
                    cube_data.B = rotateCCW(cube_data.B);
                    change_cube_data("F", l);
                    cube_animation(group, "z", 0, 90, -1);
                }
                else {  //z2
                    rot = 2;
                    cube_data.F = rotate180(cube_data.F);
                    cube_data.B = rotate180(cube_data.B);
                    change_cube_data("F", l);
                    change_cube_data("F", l);
                    cube_animation(group, "z", 0, 180, -1);
                }
            } else {  //z'
                rot = 1;
                cube_data.F = rotateCCW(cube_data.F);
                cube_data.B = rotateCW(cube_data.B);
                change_cube_data("F'", l);
                cube_animation(group, "z", 0, 90, 1);
            }
        }

        var lists = new Array(l);
        for (var i = 0; i < l; i++) {
            lists[i] = rotate_list[rot](list_value[i]);
        }
        var m = size - 1;
        for (var i = 0; i < l; i++) {
            for (var x = 0; x < size; x++) {
                for (var y = 0; y < size; y++) {
                    // if (x != 0 && x != m && y != 0 && y != m) continue;
                    if (Object.hasOwn(cube_mesh, list_key[i][x][y])) {
                        cube_mesh[list_key[i][x][y]] = lists[i][x][y];
                    }
                }
            }
        }

        function removeChar(str, index) {
            return str.slice(0, index) + str.slice(index + 1);
        }
    }

    function change_cube_data(f, l) {
        var temp = new Array(l);
        if (f == "U") {
            var list = ['L', 'F', 'R', 'B'];
            for (var i = 0; i < l; i++) {
                temp[i] = cube_data['L'][i];
            }
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < l; j++) {
                    cube_data[list[i]][j] = cube_data[list[i + 1]][j];
                }
            }
            for (var i = 0; i < l; i++) {
                cube_data['B'][i] = temp[i];
            }
        }
        else if (f == "U'") {
            var list = ['L', 'B', 'R', 'F'];
            for (var i = 0; i < l; i++) {
                temp[i] = cube_data['L'][i];
            }
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < l; j++) {
                    cube_data[list[i]][j] = cube_data[list[i + 1]][j];
                }
            }
            for (var i = 0; i < l; i++) {
                cube_data['F'][i] = temp[i];
            }
        }
        else if (f == "D") {
            var list = ['L', 'B', 'R', 'F'];
            for (var i = 0; i < l; i++) {
                temp[i] = cube_data['L'][(size - 1) - i];
            }
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < l; j++) {
                    cube_data[list[i]][(size - 1) - j] = cube_data[list[i + 1]][(size - 1) - j];
                }
            }
            for (var i = 0; i < l; i++) {
                cube_data['F'][(size - 1) - i] = temp[i];
            }
        }
        else if (f == "D'") {
            var list = ['L', 'F', 'R', 'B'];
            for (var i = 0; i < l; i++) {
                temp[i] = cube_data['L'][(size - 1) - i];
            }
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < l; j++) {
                    cube_data[list[i]][(size - 1) - j] = cube_data[list[i + 1]][(size - 1) - j];
                }
            }
            for (var i = 0; i < l; i++) {
                cube_data['B'][(size - 1) - i] = temp[i];
            }
        }
        else if (f == "L") {
            var list = ['U', 'B', 'D', 'F'];
            cube_data.U = rotateCW(cube_data.U);
            cube_data.B = rotateCCW(cube_data.B);
            cube_data.D = rotateCW(cube_data.D);
            cube_data.F = rotateCW(cube_data.F);
            for (var i = 0; i < l; i++) {
                temp[i] = cube_data['U'][i];
            }
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < l; j++) {
                    cube_data[list[i]][j] = cube_data[list[i + 1]][j];
                }
            }
            for (var i = 0; i < l; i++) {
                cube_data['F'][i] = temp[i];
            }
            cube_data.U = rotateCCW(cube_data.U);
            cube_data.B = rotateCW(cube_data.B);
            cube_data.D = rotateCCW(cube_data.D);
            cube_data.F = rotateCCW(cube_data.F);
        }
        else if (f == "L'") {
            var list = ['U', 'F', 'D', 'B'];
            cube_data.U = rotateCW(cube_data.U);
            cube_data.F = rotateCW(cube_data.F);
            cube_data.D = rotateCW(cube_data.D);
            cube_data.B = rotateCCW(cube_data.B);
            for (var i = 0; i < l; i++) {
                temp[i] = cube_data['U'][i];
            }
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < l; j++) {
                    cube_data[list[i]][j] = cube_data[list[i + 1]][j];
                }
            }
            for (var i = 0; i < l; i++) {
                cube_data['B'][i] = temp[i];
            }
            cube_data.U = rotateCCW(cube_data.U);
            cube_data.F = rotateCCW(cube_data.F);
            cube_data.D = rotateCCW(cube_data.D);
            cube_data.B = rotateCW(cube_data.B);
        }
        else if (f == "R") {
            var list = ['U', 'F', 'D', 'B'];
            cube_data.U = rotateCCW(cube_data.U);
            cube_data.F = rotateCCW(cube_data.F);
            cube_data.D = rotateCCW(cube_data.D);
            cube_data.B = rotateCW(cube_data.B);
            for (var i = 0; i < l; i++) {
                temp[i] = cube_data['U'][i];
            }
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < l; j++) {
                    cube_data[list[i]][j] = cube_data[list[i + 1]][j];
                }
            }
            for (var i = 0; i < l; i++) {
                cube_data['B'][i] = temp[i];
            }
            cube_data.U = rotateCW(cube_data.U);
            cube_data.F = rotateCW(cube_data.F);
            cube_data.D = rotateCW(cube_data.D);
            cube_data.B = rotateCCW(cube_data.B);
        }
        else if (f == "R'") {
            var list = ['U', 'B', 'D', 'F'];
            cube_data.U = rotateCCW(cube_data.U);
            cube_data.B = rotateCW(cube_data.B);
            cube_data.D = rotateCCW(cube_data.D);
            cube_data.F = rotateCCW(cube_data.F);
            for (var i = 0; i < l; i++) {
                temp[i] = cube_data['U'][i];
            }
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < l; j++) {
                    cube_data[list[i]][j] = cube_data[list[i + 1]][j];
                }
            }
            for (var i = 0; i < l; i++) {
                cube_data['F'][i] = temp[i];
            }
            cube_data.U = rotateCW(cube_data.U);
            cube_data.B = rotateCCW(cube_data.B);
            cube_data.D = rotateCW(cube_data.D);
            cube_data.F = rotateCW(cube_data.F);
        }
        else if (f == "F") {
            var list = ['U', 'L', 'D', 'R'];
            cube_data.U = rotate180(cube_data.U);
            cube_data.L = rotateCCW(cube_data.L);
            cube_data.R = rotateCW(cube_data.R);
            for (var i = 0; i < l; i++) {
                temp[i] = cube_data['U'][i];
            }
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < l; j++) {
                    cube_data[list[i]][j] = cube_data[list[i + 1]][j];
                }
            }
            for (var i = 0; i < l; i++) {
                cube_data['R'][i] = temp[i];
            }
            cube_data.U = rotate180(cube_data.U);
            cube_data.L = rotateCW(cube_data.L);
            cube_data.R = rotateCCW(cube_data.R);
        }
        else if (f == "F'") {
            var list = ['U', 'R', 'D', 'L'];
            cube_data.U = rotate180(cube_data.U);
            cube_data.R = rotateCW(cube_data.R);
            cube_data.L = rotateCCW(cube_data.L);
            for (var i = 0; i < l; i++) {
                temp[i] = cube_data['U'][i];
            }
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < l; j++) {
                    cube_data[list[i]][j] = cube_data[list[i + 1]][j];
                }
            }
            for (var i = 0; i < l; i++) {
                cube_data['L'][i] = temp[i];
            }
            cube_data.U = rotate180(cube_data.U);
            cube_data.R = rotateCCW(cube_data.R);
            cube_data.L = rotateCW(cube_data.L);
        }
        else if (f == "B") {
            var list = ['U', 'R', 'D', 'L'];
            cube_data.R = rotateCCW(cube_data.R);
            cube_data.D = rotate180(cube_data.D);
            cube_data.L = rotateCW(cube_data.L);
            for (var i = 0; i < l; i++) {
                temp[i] = cube_data['U'][i];
            }
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < l; j++) {
                    cube_data[list[i]][j] = cube_data[list[i + 1]][j];
                }
            }
            for (var i = 0; i < l; i++) {
                cube_data['L'][i] = temp[i];
            }
            cube_data.R = rotateCW(cube_data.R);
            cube_data.D = rotate180(cube_data.D);
            cube_data.L = rotateCCW(cube_data.L);
        }
        else if (f == "B'") {
            var list = ['U', 'L', 'D', 'R'];
            cube_data.L = rotateCW(cube_data.L);
            cube_data.D = rotate180(cube_data.D);
            cube_data.R = rotateCCW(cube_data.R);
            for (var i = 0; i < l; i++) {
                temp[i] = cube_data['U'][i];
            }
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < l; j++) {
                    cube_data[list[i]][j] = cube_data[list[i + 1]][j];
                }
            }
            for (var i = 0; i < l; i++) {
                cube_data['R'][i] = temp[i];
            }
            cube_data.L = rotateCCW(cube_data.L);
            cube_data.D = rotate180(cube_data.D);
            cube_data.R = rotateCW(cube_data.R);
        }
        else if (f == "M") {
            var list = ['U', 'B', 'D', 'F'];
            cube_data.U = rotateCW(cube_data.U);
            cube_data.B = rotateCCW(cube_data.B);
            cube_data.D = rotateCW(cube_data.D);
            cube_data.F = rotateCW(cube_data.F);
            for (var i = 0; i < l; i++) {
                temp[i] = cube_data['U'][1];
            }
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < l; j++) {
                    cube_data[list[i]][1] = cube_data[list[i + 1]][1];
                }
            }
            for (var i = 0; i < l; i++) {
                cube_data['F'][1] = temp[i];
            }
            cube_data.U = rotateCCW(cube_data.U);
            cube_data.B = rotateCW(cube_data.B);
            cube_data.D = rotateCCW(cube_data.D);
            cube_data.F = rotateCCW(cube_data.F);
        }
        else if (f == "M'") {
            var list = ['U', 'F', 'D', 'B'];
            cube_data.U = rotateCW(cube_data.U);
            cube_data.F = rotateCW(cube_data.F);
            cube_data.D = rotateCW(cube_data.D);
            cube_data.B = rotateCCW(cube_data.B);
            for (var i = 0; i < l; i++) {
                temp[i] = cube_data['U'][1];
            }
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < l; j++) {
                    cube_data[list[i]][1] = cube_data[list[i + 1]][1];
                }
            }
            for (var i = 0; i < l; i++) {
                cube_data['B'][1] = temp[i];
            }
            cube_data.U = rotateCCW(cube_data.U);
            cube_data.F = rotateCCW(cube_data.F);
            cube_data.D = rotateCCW(cube_data.D);
            cube_data.B = rotateCW(cube_data.B);
        }
        else if (f == "S") {
            var list = ['U', 'L', 'D', 'R'];
            cube_data.L = rotateCW(cube_data.L);
            cube_data.D = rotate180(cube_data.D);
            cube_data.R = rotateCCW(cube_data.R);
            for (var i = 0; i < l; i++) {
                temp[i] = cube_data['U'][1];
            }
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < l; j++) {
                    cube_data[list[i]][1] = cube_data[list[i + 1]][1];
                }
            }
            for (var i = 0; i < l; i++) {
                cube_data['R'][1] = temp[i];
            }
            cube_data.L = rotateCCW(cube_data.L);
            cube_data.D = rotate180(cube_data.D);
            cube_data.R = rotateCW(cube_data.R);
        }
        else if (f == "S'") {
            var list = ['U', 'R', 'D', 'L'];
            cube_data.R = rotateCCW(cube_data.R);
            cube_data.D = rotate180(cube_data.D);
            cube_data.L = rotateCW(cube_data.L);
            for (var i = 0; i < l; i++) {
                temp[i] = cube_data['U'][1];
            }
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < l; j++) {
                    cube_data[list[i]][1] = cube_data[list[i + 1]][1];
                }
            }
            for (var i = 0; i < l; i++) {
                cube_data['L'][1] = temp[i];
            }
            cube_data.R = rotateCW(cube_data.R);
            cube_data.D = rotate180(cube_data.D);
            cube_data.L = rotateCCW(cube_data.L);
        }
        else if (f == "E") {
            var list = ['L', 'B', 'R', 'F'];
            for (var i = 0; i < l; i++) {
                temp[i] = cube_data['L'][1];
            }
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < l; j++) {
                    cube_data[list[i]][1] = cube_data[list[i + 1]][1];
                }
            }
            for (var i = 0; i < l; i++) {
                cube_data['F'][1] = temp[i];
            }
        }
        else if (f == "E'") {
            var list = ['L', 'F', 'R', 'B'];
            for (var i = 0; i < l; i++) {
                temp[i] = cube_data['L'][1];
            }
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < l; j++) {
                    cube_data[list[i]][1] = cube_data[list[i + 1]][1];
                }
            }
            for (var i = 0; i < l; i++) {
                cube_data['B'][1] = temp[i];
            }
        }

        change_grid();
    }

    function change_grid() {
        for (var i = 0; i < size; i++) {
            for (var j = 0; j < size; j++) {
                grids['U'][i][j].style.background = cube_data['U'][i][j];
                grids['L'][i][j].style.background = cube_data['L'][i][j];
                grids['F'][i][j].style.background = cube_data['F'][i][j];
                grids['R'][i][j].style.background = cube_data['R'][i][j];
                grids['B'][i][j].style.background = cube_data['B'][i][j];
                grids['D'][i][j].style.background = cube_data['D'][i][j];
            }
        }
    }

    function cube_animation(group, ax, i, r, pn) {
        i++;
        group.rotation[ax] = pn * i * Math.PI / 180;
        if (i == r) {
            group.updateMatrixWorld(true);

            while (group.children.length > 0) {
                scene.attach(group.children[0]);
            }

            scene.remove(group);
            is_moving = false;
        }
        else setTimeout(cube_animation, 1000 / AnimationSpeed, group, ax, i, r, pn);
    }

    function createGrid() {

        grids = {};

        if (infoBox instanceof Element) infoBox.innerHTML = "";
        infoBox = document.createElement("div");
        infoBox.style.cssText = 'position: absolute;top: 10px;left: 10px;padding: 8px;border-radius: 10px;';
        // const grid = document.getElementById("cubeGrid");
        const grid = document.createElement("div");
        grid.style.cssText = 'display: grid;';
        // grid.innerHTML = "";

        let cols = size * 4;
        let rows = size * 3;

        let WH = [22, 18, 14, 12, 10.2, 8.8];
        var border_w = [2, 2, 2, 2, 1, 1];

        if (viewer.clientWidth < 700) {
            for (var i = 0; i < 7; i++) {
                WH[i] /= 1.4;
            }
        }

        grid_xy = {
            'U': { 'y': 0, 'x': size },
            'L': { 'y': size, 'x': 0 },
            'F': { 'y': size, 'x': size },
            'R': { 'y': size, 'x': size * 2 },
            'B': { 'y': size, 'x': size * 3 },
            'D': { 'y': size * 2, 'x': size }
        }

        grid.style.gridTemplateColumns =
            `repeat(${cols}, ${WH[size - 2]}px)`;

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                let cell = document.createElement("div");

                cell.style.cssText = 'border: 1px solid #555';
                cell.style.width = cell.style.height = `${WH[size - 2]}px`;

                var face = isCubeFace(y, x);
                if (!face) {
                    cell.style.visibility = "hidden";
                }
                else {
                    if (!Array.isArray(grids[face])) {
                        grids[face] = Array.from({ length: size }, () =>
                            new Array(size)
                        );
                    }
                    grids[face][y - grid_xy[face].y][x - grid_xy[face].x] = cell;
                }

                //右側分隔線
                if ((x + 1) % size === 0) {
                    cell.style.borderRight = border_w[size - 2] + "px solid black";
                }

                //左側分隔線
                if (x % size === 0) {
                    cell.style.borderLeft = border_w[size - 2] + "px solid black";
                }

                //下方分隔線
                if ((y + 1) % size === 0) {
                    cell.style.borderBottom = border_w[size - 2] + "px solid black";
                }

                //上方分隔線
                if (y % size === 0) {
                    cell.style.borderTop = border_w[size - 2] + "px solid black";
                }

                grid.appendChild(cell);
            }
        }

        infoBox.appendChild(grid);
        viewer.appendChild(infoBox);

        function isCubeFace(y, x) {
            for (let face in grid_xy) {
                let fx = grid_xy[face].x;
                let fy = grid_xy[face].y;

                //判斷是否在該面 size × size 範圍內
                if (
                    x >= fx &&
                    x < fx + size &&
                    y >= fy &&
                    y < fy + size
                ) {
                    return face;   //回傳 U、L、F、R、B、D
                }
            }
            return false; //不在任何面
        }
    }

    function create_reversion_btn() {
        var reversion = document.createElement('div');
        reversion.style.cssText = 'position: absolute;right: 10px;bottom: 10px;cursor: pointer;border-radius: 10px;';
        reversion.title = '復原角度';
        var reversion_img = document.createElement('img');
        reversion_img.style.cssText = 'width: 50px;height: 50px;';
        reversion_img.src = 'https://github.com/LuXue-Fox/Rubik-s-Cube/blob/main/img/reversion.png?raw=true';

        reversion.addEventListener('click', function (event) {
            arcballcontrols.reset();
        }, false);

        reversion.addEventListener("mouseenter", () => {
            reversion.style.background = 'rgba(0, 0, 0, .3)';
            reversion.style.transition = '.25s';
            reversion.style.transform = 'translateY(-3px)';
        });

        reversion.addEventListener("mouseleave", () => {
            reversion.style.background = '';
            reversion.style.transition = '';
            reversion.style.transform = '';
        });

        reversion.appendChild(reversion_img);
        viewer.appendChild(reversion);
    }

    //移除3D物件
    function disposeObject(obj) {
        obj.traverse(child => {
            if (child.geometry) {
                child.geometry.dispose();
            }

            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });

        obj.removeFromParent();
    }

    function end() {
        Object.values(cube_mesh).forEach(disposeObject);
        cube_data = null;
        cube_mesh = {};
        viewer.innerHTML = "";
        clearInterval(intervalId);
    }

    return {
        scene: scene,
        camera: camera,
        size: size,
        renderer: renderer,
        arcballcontrols: arcballcontrols,
        stats: stats,
        start: start,
        setFPS: setFPS,
        setAnimationSpeed: setAnimationSpeed,
        setFov: setFov,
        move: move,
        end: end
    };

}

export default Cube_3D;