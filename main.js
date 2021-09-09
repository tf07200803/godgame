var cols, rows;
var w=80
var grid=[]//底盤
var gridContainer
var types=[]//面盤
var typesContainer
var colorArray=[0x008000,0xFFD700,0xDC143C,0x0000FF]
var picArray=[0,1,2,3]
var greenGroup//層級
var dragGroup//拖曳變換層級
var targetMC=new Object()
var score=0
var combo=0

//綠0  黃1  紅2   藍3
var app

$().ready(function(){
    init()
})

function init(){
    app = new PIXI.Application(400, 400, {backgroundColor : 0x000000});
    document.getElementById("container").appendChild(app.view);
    app.stage = new PIXI.display.Stage();
    app.stage.group.enableSort = true;
    cols=Math.floor(app.screen.width/w)
    rows=Math.floor(app.screen.height/w)
    gridContainer = new PIXI.Container();
    typesContainer = new PIXI.Container();
    app.stage.addChild(gridContainer);
    app.stage.addChild(typesContainer);
    greenGroup = new PIXI.display.Group(0, true);
    dragGroup = new PIXI.display.Group(2, false);

    for(var j=0;j<rows;j++){//製作底盤
        for(var i=0;i<cols;i++){
            var cell=new Cell(i,j)
            gridContainer.addChild(cell);
            grid.push(cell)
        }
    }

    app.ticker.add(function(delta) {
        for(var j=0;j<rows;j++){



        }
    });
    createBox()//製作面盤
    //specify display list component

    //sorry, group cant exist without layer yet :(
    app.stage.addChild(new PIXI.display.Layer(greenGroup));
    app.stage.addChild(new PIXI.display.Layer(dragGroup));
    //console.log(types)
}


function createBox(){
    types=[]
    for(var j=0;j<rows;j++){
        for(var i=0;i<cols;i++){
            var box=new Box(i,j)
            typesContainer.addChild(box);
            types.push(box)
        }
    }

    //checkScreen()
    //checkAll()
    //reCheck()
}



function Cell(i,j){
    var container = new PIXI.Container();
    container.i=i
    container.j=j
    container.id=index(i,j)
    container.type=Math.floor(Math.random()*4)
    var graphics = new PIXI.Graphics();
    graphics.beginFill(0xd9d9d9, 1);
    graphics.drawRect(0, 0, w, w);
    container.addChild(graphics)
    var richText = new PIXI.Text(index(i,j)+","+container.type);
    richText.x = 0;
    richText.y = 0;
    //container.addChild(richText)
    var x=container.i*w
    container.x=x
    var y=container.j*w
    container.y=y
    return container;
}
function Box(i,j){
    var container = new PIXI.Container();
    container.i=i
    container.j=j
    container.id=index(i,j)
    container.type=grid[index(i,j)].type
    /*var graphics = new PIXI.Graphics();
    graphics.beginFill(colorArray[container.type], 1);
    graphics.drawRect(0, 0, w, w);
    container.addChild(graphics)*/

    const texture = PIXI.Texture.from('p'+picArray[container.type]+'.png');
    const bunny = new PIXI.Sprite(texture);
    container.addChild(bunny)
    //bunny.alpha=0.5

    var target=grid[index(i,j)]
    container.x=target.x
    container.y=target.y
    container.interactive = true;
    container.buttonMode = true;
    container.parentGroup = greenGroup;
    container
        .on('pointerdown', onDragStart)
        .on('pointerup', onDragEnd)
        .on('pointerupoutside', onDragEnd)
        .on('pointermove', onDragMove)
    //.on('pointerover', onButtonOver)
    //.on('pointerout', onButtonOut)
    container.on('mousedown', onDragStart)

    container.checkNeighbors=function(){

        var rowsArray=[]//直式偵測
        var colsArray=[]//橫式偵測
        var current=this.type
        var top=types[index(i,j-1)]
        var right=types[index(i+1,j)]
        var bottom=types[index(i,j+1)]
        var left=types[index(i-1,j)]
        var cc=false

        if(top && top.type==current){
            rowsArray.push(top)

        }
        if(right && right.type==current){
            colsArray.push(right)

        }
        if(bottom && bottom.type==current){
            rowsArray.push(bottom)

        }
        if(left && left.type==current){
            colsArray.push(left)

        }

        if(rowsArray.length>1){

            score++
            top.alpha=0
            bottom.alpha=0
            this.alpha=0
            cc=true
        }
        if(colsArray.length>1){

            score++
            left.alpha=0
            right.alpha=0
            this.alpha=0
            cc=true
        }

        return cc;

    }


    return container;
}



function index(i,j){
    if(i<0 || j<0 || i>cols-1 || j>rows-1){
        return -1
    }
    //console.log(i+j*cols)
    return i+j*cols;
}

function onClick () {
    this.alpha=0
}

function onDragStart(event) {

    this.data = event.data;
    this.parentGroup = dragGroup;
    this.dragging = true;
    dragMC(this)
}

function onDragEnd() {
    this.dragging = false;
    this.data = null;
    combo=0
    $("#mask").show()
    //console.log(grid)
    deleteAll("drag")

    reCheck()

}

function reCheck(){
    if(checkScreen()){
        checkAll()
        combo++
    }else{
        $("#mask").hide()
    }

    $("#score").text(score)
    $("#combo").text(combo)
}

function onDragMove() {
    if (this.dragging) {
        var newPosition = this.data.getLocalPosition(this.parent);
        this.x = newPosition.x-w/2;
        this.y = newPosition.y-w/2;
        if(this.y>targetMC.y+w/2){

            if(targetMC.bottom!=null){
                replaceMC(targetMC,targetMC.bottom)
            }
        }else if(this.y<targetMC.y-w/2){
            if(targetMC.top!=null){
                replaceMC(targetMC,targetMC.top)
            }
        }else if(this.x>targetMC.x+w/2){
            if(targetMC.right!=null){
                replaceMC(targetMC,targetMC.right)
            }
        }else if(this.x<targetMC.x-w/2){
            if(targetMC.left!=null){
                replaceMC(targetMC,targetMC.left)
            }
        }
    }
}

function replaceMC(a,b){
    TweenLite.to(b,.1,{x:a.x,y:a.y})

    savei=b.i
    savej=b.j
    var _id=types[index(a.i,a.j)].id
    types[index(a.i,a.j)].id=types[index(b.i,b.j)].id
    types[index(b.i,b.j)].id=_id
    types.sort(function(a, b) {
        return a.id - b.id
    });
    for(var j=0;j<rows;j++){
        for(var i=0;i<cols;i++){
            types[index(i,j)].i=i
            types[index(i,j)].j=j
            grid[index(i,j)].type=types[index(i,j)].type
        }
    }



    dragMC(types[index(savei,savej)])
    //綠0  黃1  紅2   藍3

}

function dragMC(mc){
    var i=mc.i
    var j=mc.j
    //console.log(i)
    var top=types[index(i,j-1)]
    var right=types[index(i+1,j)]
    var bottom=types[index(i,j+1)]
    var left=types[index(i-1,j)]

    if(top){
        targetMC.top=top
    }else{
        targetMC.top=null
    }
    if(right){
        targetMC.right=right
    }else{
        targetMC.right=null
    }
    if(bottom){
        targetMC.bottom=bottom
    }else{
        targetMC.bottom=null
    }
    if(left){
        targetMC.left=left
    }else{
        targetMC.left=null
    }
    targetMC.type=mc.type
    targetMC.x=i*w
    targetMC.y=j*w
    targetMC.i=i
    targetMC.j=j


}

function checkScreen(){//開始偵測移除
    var cc=false
    for(i=0;i<types.length;i++){
        //types[i].checkNeighbors()
        if(types[i].checkNeighbors()){
            cc=true
        }
    }
    return cc;
}

function checkAll(){
    for(var i=0;i<cols;i++){
        var combine=[]//結合起來的陣列
        for(var j=0;j<rows;j++){

            var target=types[index(i,j)]

            if(target.alpha==0){
                combine.unshift(target)//因為是從上面掉下來
            }else{
                combine.push(target)
            }

        }
        newplace(combine,i)

    }

    var obj = {myProp:0};
    TweenLite.to(obj, 1.5, {myProp:100,onComplete:deleteAll,onCompleteParams:["recheck"]});
}

function newplace(array,num){

    for(i=0;i<array.length;i++){
        var target =array[i]
        if(target.alpha==0){
            target.y=((rows-i)*-w)-w
            target.alpha=1
            var type=Math.floor(Math.random()*4)
            /*var graphics = new PIXI.Graphics();
            graphics.beginFill(colorArray[type], 1);
            graphics.drawRect(0, 0, w, w);*/

            target.removeChild(target.children[0]);
            const texture = PIXI.Texture.from('p'+picArray[type]+'.png');
            const bunny = new PIXI.Sprite(texture);
            target.type=type
            target.addChild(bunny)
        }else{

        }
        console.log(i)
        grid[index(num,i)].type=target.type
        TweenLite.to(target,.5,{y:w*i,delay:.5})

    }


}

function deleteAll(type){


    for(i=0;i<cols*rows;i++){
        typesContainer.removeChild(typesContainer.children[0]);

    }
    createBox()
    if(type=="recheck"){
        reCheck()
    }


}
