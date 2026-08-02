import Cube_3D from '../Cube_3D.js';

const viewer = document.getElementById("viewer");
var now_cube = null;
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

            now_cube.move(symbol);

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
        var size = Number(btn.dataset.size[0]);

        now_cube.end();
        now_cube = new Cube_3D(viewer, size);
        now_cube.start();
    }

});

function init() {
    loadSymbol("333");
    now_cube = new Cube_3D(viewer, 3);
    now_cube.start();
}