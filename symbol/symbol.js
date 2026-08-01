import * as THREE from 'three';
import { ArcballControls } from 'ArcballControls';
import Stats from 'Stats';

const viewer = document.getElementById("viewer");  //畫布
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    80,
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
    // console.log(viewer.clientWidth + "，" + viewer.clientHeight);
}

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

const FPS = 1000;  //幀數(每秒畫面刷新次數)

var size = 3;
var now_cube = null;
var cube_data = null;
var cube_mesh = {};
const c_li = ['U', 'D', 'L', 'F', 'R', 'B'];
const colors = ['yellow', 'white', '#D43308', 'ForestGreen', 'DarkOrange', 'RoyalBlue', '#444444'];
var grids = null;
var grid_xy = null;

//建立3D魔方模型
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

function rotate180(matrix) {
    const n = matrix.length;
    return Array.from({ length: n }, (_, y) =>
        Array.from({ length: n }, (_, x) =>
            matrix[n - 1 - y][n - 1 - x]
        )
    );
}

var rotate_list = [rotateCW, rotateCCW, rotate180];

function symbol_btn_clk(s) {
    if (is_moving) return;
    is_moving = true;
    var l = 1;  //轉動層數
    if (s.includes('w')) l = 2;
    if (s.includes('3')) l = 3;
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

    var lists = new Array(l);
    for (var i = 0; i < l; i++) {
        lists[i] = rotate_list[rot](list_value[i]);
    }
    var m = size - 1;
    for (var i = 0; i < l; i++) {
        for (var x = 0; x < size; x++) {
            for (var y = 0; y < size; y++) {
                if (i != 0 && i != m && x != 0 && x != m && y != 0 && y != m) continue;
                cube_mesh[list_key[i][x][y]] = lists[i][x][y];
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

    change_grid();
}

//模方轉動動畫
var is_moving = false;
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
    else setTimeout(cube_animation, 1000 / 120, group, ax, i, r, pn);
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

function init() {
    loadSymbol("333");
    now_cube = new CUBE();
    createGrid();
    change_grid();
    setInterval(() => {
        render();
    }, 1000 / FPS);
}

let cubeData;
//讀JSON
fetch("symbol.json")
    .then(res => res.json())
    .then(data => {

        cubeData = data;
        init();

    });

//建立按鈕
function loadSymbol(size) {

    const area = document.getElementById("symbolArea");

    area.innerHTML = "";

    cubeData[size].symbol.forEach(symbol => {

        const btn = document.createElement("button");

        btn.className = "symbolBtn";

        btn.innerText = symbol;

        btn.onclick = () => {

            symbol_btn_clk(symbol);

        }

        area.appendChild(btn);

    });
}

//切換階數
document.querySelectorAll(".cubeBtn").forEach(btn => {

    btn.onclick = () => {

        document.querySelector(".active").classList.remove("active");

        btn.classList.add("active");

        loadSymbol(btn.dataset.size);
        size = Number(btn.dataset.size[0]);

        Object.values(cube_mesh).forEach(disposeObject);
        cube_data = null;
        cube_mesh = {};
        now_cube = new CUBE(btn.dataset.size);
        createGrid();
        change_grid();
        arcballcontrols.reset();
    }

});

function createGrid() {

    grids = {};
    const grid = document.getElementById("cubeGrid");

    grid.innerHTML = "";

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

            cell.className = "cubeCell";
            cell.style.width = cell.style.height = `${WH[size - 2]}px`;

            var face = isCubeFace(y, x, size);
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

    function isCubeFace(y, x, size) {

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

document.getElementById("reversion").onclick = () => {

    arcballcontrols.reset();

}