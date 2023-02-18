
const root = document.getElementById('root');

const grid = document.createElement('div');

const M = 15
const N = 40
const TIME_DELAY = 1 // in milliseconds
const HEURISTIC_INTENSITY = 2

grid.style.display = 'grid'
grid.style.gridTemplateColumns = `repeat(${N},1fr)`
root.appendChild(grid)

class Cell{
    constructor(i,j){
        this.element = document.createElement('div');
        this.element.classList.add('cell')
        this.pos = {x:i,y:j}
        
        this.element.addEventListener('click',(e)=>{
            if(startNode == undefined){
                startNode = this
                this.element.classList.add('startNode')
                return;
            }
            if(endNode == undefined && startNode.pos != this.pos){
                endNode = this
                this.element.classList.add('endNode')
                return;
            }
            if(startNode && endNode && this.pos != startNode.pos && this.pos != endNode.pos){
                if (!this.isWall)this.element.classList.add('wall')
                else this.element.classList.remove('wall')
                this.isWall = !this.isWall
                return
            }
            // After this add walls.
        })
        
        clicked = false

        this.element.addEventListener('mousedown',(ev)=>{
            clicked = true
        })
        this.element.addEventListener('mouseenter',(ev)=>{
            if(!clicked) return;
            if(startNode && endNode && this.pos != startNode.pos && this.pos != endNode.pos){
                if (!this.isWall)this.element.classList.add('wall')
                else this.element.classList.remove('wall')
                this.isWall = !this.isWall
                return
            }
        })
        this.element.addEventListener('mouseup',(ev)=>{
            clicked = false
        })
        this.gcost = Infinity
        this.fcost = Infinity
        this.isWall = false
        this.visited = false
        this.parent = undefined
    }
}

function initalizeGrid(m,n){
    grid.innerHTML = ``
    for(let i=0;i<m;i++){
        for(let j=0;j<n;j++){
            let cell =new Cell(i,j)
            grid.appendChild(cell.element)
        }
    }
}

class Grid{
    constructor(m,n){
        this.m = m
        this.n = n
        this.grid = [];
        for(let i=0;i<this.m;i++){
            let temp = []
            for(let j=0;j<this.n;j++){
                temp.push(new Cell(i,j))
            }
            this.grid.push(temp)
        }
        this.displayGrid()
    }
    displayGrid(){
        grid.innerHTML = ``
        for(let i=0;i<this.m;i++){
            for(let j=0;j<this.n;j++){
                grid.appendChild(this.grid[i][j].element)
            }
        }
    }
    getNeighbors(i,j){
        // Top down left right
        let neighbors = []
        if(this.valid(i-1,j)) neighbors.push(this.grid[i-1][j])
        if(this.valid(i+1,j)) neighbors.push(this.grid[i+1][j])
        if(this.valid(i,j-1)) neighbors.push(this.grid[i][j-1])
        if(this.valid(i,j+1)) neighbors.push(this.grid[i][j+1])
        return neighbors
        
    }
    valid(r,c){
        return (0<=r && r<this.m && 0<=c && c<this.n)
    }
}
let startNode = undefined
let endNode = undefined
let my_grid = undefined
let clicked = false

function Initialize(){
    startNode = undefined
    endNode = undefined
    my_grid = new Grid(M,N)

}
Initialize()
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function Djkstra(){
    let Queue = [startNode]
    startNode.gcost = 0
    while(Queue.length > 0){
        // Sort by distance
        Queue.sort((a,b)=>{return b.gcost - a.gcost})
        let currNode = Queue.pop()
        if(currNode == endNode){
            console.log("Found end node! Retracing path...")

            let node = currNode
            while(node != startNode){
                node.element.classList.add('path')
                node = node.parent
            }
            return;
        }
        currNode.element.classList.add('visited')
        currNode.visited = true
        let neighbors = my_grid.getNeighbors(currNode.pos.x,currNode.pos.y)
        for(let neighbor of neighbors){
            if(neighbor.visited || neighbor.isWall) continue;
            // Update distance (distance(u,v) => distance(u,o) + distance(o,v))
            let tentativeDistance = currNode.gcost + 1
            neighbor.element.classList.add('neighbor')
            await sleep(TIME_DELAY)
            if(tentativeDistance < neighbor.gcost){
                neighbor.gcost = tentativeDistance
                neighbor.parent = currNode
                Queue.push(neighbor)
            }
        }

    }

}
function HCost(a,b){
    // Closer distance = lower score
    let Manhattandist = Math.abs(a.pos.x - b.pos.x) + Math.abs(a.pos.y - b.pos.y)
    return Manhattandist*HEURISTIC_INTENSITY // Give better weightage for better results!
}
async function Astar(){
    let Queue = [startNode]
    startNode.gcost = 0
    startNode.fcost = 0
    while(Queue.length > 0){
        // Sort by distance
        Queue.sort((a,b)=>{return b.fcost - a.fcost})

        let currNode = Queue.pop()
        if(currNode == endNode){
            console.log("Found end node! Retracing path...")

            let node = currNode
            while(node != startNode){
                node.element.classList.add('path')
                node = node.parent
            }
            return;
        }
        currNode.element.classList.add('visited')
        currNode.visited = true
        let neighbors = my_grid.getNeighbors(currNode.pos.x,currNode.pos.y)
        for(let neighbor of neighbors){
            if(neighbor.visited || neighbor.isWall) continue;
            // Update distance (distance(u,v) => distance(u,o) + distance(o,v) + heuristic(o,v)!)
            let tentativeDistance = currNode.gcost + 1 + HCost(neighbor,endNode)
            neighbor.element.classList.add('neighbor')
            await sleep(TIME_DELAY)
            if(tentativeDistance < neighbor.fcost){
                neighbor.gcost = currNode.gcost + 1
                neighbor.fcost = tentativeDistance
                neighbor.parent = currNode
                // neighbor.element.innerText = tentativeDistance
                Queue.push(neighbor)
            }
        }

    }

}


function Maze(){
    recursiveDivisionMaze(0,M-1,0,N-1,'horizontal',false)
}


function recursiveDivisionMaze(rowStart, rowEnd, colStart, colEnd, orientation, surroundingWalls) {
    if (rowEnd < rowStart || colEnd < colStart) {
      return;
    }
    if (!surroundingWalls) {
        // Add surrounding Walls
        for(let i = 0 ; i < M;i++){
            for(let j = 0 ; j < N;j++){
                if(i==0 || j == 0|| i == M-1 || j == N-1){
                    // set this to a wall
                    my_grid.grid[i][j].element.classList.add('wall')
                    my_grid.grid[i][j].isWall = true
                }
            }
        }
    };
    surroundingWalls = true;
    
    if (orientation === "horizontal") {
      let possibleRows = [];
      for (let number = rowStart; number <= rowEnd; number += 2) {
        possibleRows.push(number);
      }
      let possibleCols = [];
      for (let number = colStart - 1; number <= colEnd + 1; number += 2) {
        possibleCols.push(number);
      }
      let randomRowIndex = Math.floor(Math.random() * possibleRows.length);
      let randomColIndex = Math.floor(Math.random() * possibleCols.length);
      let currentRow = possibleRows[randomRowIndex];
      let colRandom = possibleCols[randomColIndex];
      for(let r = 0 ; r < M;r++){
        for(let c = 0 ; c < N;c++){
            if (r === currentRow && c !== colRandom && c >= colStart - 1 && c <= colEnd + 1) {
                let type = my_grid.grid[r][c].element.className
                if(type !== 'cell startNode' && type !== 'cell endNode'){
                my_grid.grid[r][c].element.classList.add('wall')
                my_grid.grid[r][c].isWall = true
            }
            }
        }
    }
      if (currentRow - 2 - rowStart > colEnd - colStart) {
        recursiveDivisionMaze(rowStart, currentRow - 2, colStart, colEnd, orientation, surroundingWalls);
      } else {
        recursiveDivisionMaze(rowStart, currentRow - 2, colStart, colEnd, "vertical", surroundingWalls);
      }
      if (rowEnd - (currentRow + 2) > colEnd - colStart) {
        recursiveDivisionMaze(currentRow + 2, rowEnd, colStart, colEnd, orientation, surroundingWalls);
      } else {
        recursiveDivisionMaze(currentRow + 2, rowEnd, colStart, colEnd, "vertical", surroundingWalls);
      }
    } 
    else {
      let possibleCols = [];
      for (let number = colStart; number <= colEnd; number += 2) {
        possibleCols.push(number);
      }
      let possibleRows = [];
      for (let number = rowStart - 1; number <= rowEnd + 1; number += 2) {
        possibleRows.push(number);
      }
      let randomColIndex = Math.floor(Math.random() * possibleCols.length);
      let randomRowIndex = Math.floor(Math.random() * possibleRows.length);
      let currentCol = possibleCols[randomColIndex];
      let rowRandom = possibleRows[randomRowIndex];
      
        for(let r = 0 ; r < M;r++){
            for(let c = 0 ; c < N;c++){
                if (c === currentCol && r !== rowRandom && r >= rowStart - 1 && r <= rowEnd + 1) {
                    let type = my_grid.grid[r][c].element.className
                    if(type !== 'cell startNode' && type !== 'cell endNode'){
                        my_grid.grid[r][c].element.classList.add('wall')
                        my_grid.grid[r][c].isWall = true
                    }
                    }
                }
            }
      if (rowEnd - rowStart > currentCol - 2 - colStart) {
        recursiveDivisionMaze(rowStart, rowEnd, colStart, currentCol - 2, "horizontal", surroundingWalls);
      } else {
        recursiveDivisionMaze(rowStart, rowEnd, colStart, currentCol - 2, orientation, surroundingWalls);
      }
      if (rowEnd - rowStart > colEnd - (currentCol + 2)) {
        recursiveDivisionMaze(rowStart, rowEnd, currentCol + 2, colEnd, "horizontal", surroundingWalls);
      } else {
        recursiveDivisionMaze(rowStart, rowEnd, currentCol + 2, colEnd, orientation, surroundingWalls);
      }
    }
  };
  