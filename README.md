若要使用Cube_3D.js，請在html的<head>裡先加入以下內容:
```
    <script type="importmap">{
        "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js"
        }
    }
    </script>
```

並將Cube_3D.js import 至JS裡，例如:
```
import Cube_3D from '../Cube_3D.js';
```


**使用範例:**\n
建立3D魔方,
viewer是渲染3D畫面的畫布，可以使用document.body或是其他div等元素,
size是要建立的魔方的階數，範圍2~7
```
var cube = new Cube_3D(viewer, size);
```


建立完後使用start()來啟動
```
cube.start();
```


操作魔方可使用move(symbol),
symbol為字串，請填入轉動代號(R、U'、B2...):
```
cube.move("U");
```


更換畫面刷新率可使用setFPS(FPS),
FPS為幀數(每秒刷新的次數)
受限於瀏覽器及螢幕的刷新率
```
cube.setFPS(240);
```


更換動畫的速度，預設為180
```
cube.setAnimationSpeed(180);
```


設置鏡頭垂直視野(角度)，最大180度
```
cube.setFov(80);
```


結束時可用end(),
此函式會刪掉模型以及畫布上的所有內容並停止動畫,
若要建立新的魔方請先使用end()後再使用new Cube_3D(viewer, size)
```
cube.end();
```
