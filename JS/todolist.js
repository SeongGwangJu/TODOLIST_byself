// 엔터누를 때 이벤트
const addTodoOnKeyUpHandle = (event) => {
    if (event.keyCode === 13) { //13 :ENTER
        generateTodoObj();
    }
}

//완료버튼 누를 때 이벤트
const checkedOnChangeHandle = (target) => {
    const icon = target.parentElement.querySelector("i.fa-regular.fa-square");
    console.log("target : " + target);
    TodoListService.getInstance().setCompletStatus(target.value, target.checked);
    
    if (icon) {
        if (target.checked) {
            icon.classList.remove("fa-square");
            icon.classList.add("fa-square-check");
        } else {
            icon.classList.remove("fa-square-check");
            icon.classList.add("fa-square");
        }
    }
}

const removeTodoOnClickHandle = (target) => {
    // 아이콘을 클릭하면 id(부모요소의 value)를 받아와 삭제
    console.log("value : " + target.parentElement.getAttribute("value"));
    TodoListService.getInstance().removeTodo(target.parentElement.getAttribute("value"));
}

//todo 객체 생성, addTodo()로 패스(addTodo: ArrayList에 넣음)
const generateTodoObj = () => {
    const todoContent = document.querySelector(".todolist-header-items .text-input").value;

    const todoObj = {
        id: 0,
        todoContent: todoContent,
        createDate: DateUtils.toStringByFormatting(new Date()),
        completStatus: false
    };
    TodoListService.getInstance().addTodo(todoObj);
}


/////   TodoList 관련된 메서드 모음   /////
class TodoListService {
    //싱글톤
    static #instance = null;
    static getInstance() {
        if(this.#instance === null) {
            this.#instance = new TodoListService();
        }
        return this.#instance;
    }

    todoList = new Array();
    trashList = new Array();
    todoIndex = 1;
    
    //////// 생성자 + loadTodoList() ////////
    //Service.getInstance할때마다 나와서 todoList불러옴
    constructor() {
        this.loadTodoList();
    }

    loadTodoList() {
        /* 참고
        JSON.parse(Json문자열) : JSON'문자열' => 객체로 변환
        JSON.stringify(객체명) : 객체 -> 'JSON문자열' */

        //원리 확실히 알 것!
        //이중부정: 가져올 데이터가 있으면? (true)가지고 오고 / (false) 새 배열로 만듬
        this.todoList = !!localStorage.getItem("todoList") ? JSON.parse(localStorage.getItem("todoList")) : new Array();
       
        //this.todoList[this.todoList.length - 1]?.id : 배열의 마지막 id값.
        //!!을 붙임으로써, 해당 요소가 존재하지 않을 경우에도 에러를 발생시키지 않고 undefined를 반환
        //배열의 마지막 값이 있으면 (true): id값을 todoIndex에 대입,
        //(false = 아무 값도 없다 = 아무 todo가 없다): todoIndex에 1넣음
        this.todoIndex = !!this.todoList[this.todoList.length - 1]?.id ? this.todoList[this.todoList.length - 1].id + 1 : 1;

    }
    //////// 생성자 + loadTodoList() ////////


    //////// add, update 시작 ////////

    //todoObj받아와서 todoList에 추가함
    addTodo(todoObj) {
        //'todo'객체 만듬
        const todo = {
            ...todoObj, //깊은복사. todoObj의 함수 선언문 자체를 갖고온거랑 같음
            id: this.todoIndex
        }

        console.log(todo)
        this.todoList.push(todo);
        this.saveLocalStorage();
        this.updateTodoList();
        this.todoIndex++;
    }

    //todoList값을 문자열로 변환해 로컬에 저장함(로컬은 문자열밖에 못받아서)
    saveLocalStorage() {
        localStorage.setItem("todoList", JSON.stringify(this.todoList));
        // 형태 : localStorage.setItem(Key, Value)
    }

    //todoList의 List를 innerHTML로 화면에 뿌림.
    updateTodoList() {
        console.log("updateTodoList 실행");
        const todoListMainContainer = document.querySelector(".todolist-main-container");
        
        todoListMainContainer.innerHTML = this.todoList.map(todo => {
            return `
                <li class="todolist-items">
							<div class="item-left">
								<input type="checkbox" id="complet-chkbox${todo.id}" class="complet-chkboxs"
                                ${todo.completStatus ? "checked" : ""} value="${todo.id}" onchange="checkedOnChangeHandle(this);">
								<label for="complet-chkbox${todo.id}" class="checkbox-label">
                                    <i class="fa-regular fa-square" > </i>
                                </label>
							</div>
							<div class="item-center">
								<pre class="todolist-content">${todo.todoContent}</pre>
                                <p class="todolist-date">${todo.createDate}</p>
                                <div class="edit-button" value="${todo.id}">
                                <i class="fa-solid fa-pen" onclick="modifyTodoOnClickHandle(this);"> </i> </div>
							</div>
							<div class="item-right">
								<div class="todolist-item-buttons">
									<div class="remove-button" value="${todo.id}">
                                    <i class="fa-solid fa-xmark" onclick="removeTodoOnClickHandle(this);"> </i> </div>
								</div>
							</div>
						</li>
                `;
        }).join("");

        // 할 일이 몇개 남았는지 표시 ///
        document.querySelector(".remaining-todo").innerHTML = `
        <span class = remaining-todo-number>${this.todoList.filter(todo => !todo.completStatus).length}</span>
        <span> items lefts </span>`

    }
    //////// add, update 끝 ////////

    //List 체크박스 * 미완
    setCompletStatus(id, status) {
        console.log("setCompletStatus ▼");
        this.todoList.forEach((todo, index) => {
            if(todo.id === parseInt(id)) { //id = 문자열이라, int로 변환 후 비교
                this.todoList[index].completStatus = status;
                console.log(this.todoList[index]);
            }
        });
        this.saveLocalStorage();
    }

    //삭제하면 * 휴지통 이동 needed.
    removeTodo(id) {
        this.todoList = this.todoList.filter(todo => {
            return todo.id !== parseInt(id); //'아이디랑 같지 않은것'만 배열에 담는다(같은건 지워야겠지?)
        });

        this.saveLocalStorage(); //저장
        this.updateTodoList(); //불러오기
    }

    //해당 아이디를 가진 todo객체 리턴
    getTodoById(id) {
        //필터 : 괄호 안의 조건에 맞는 녀석만 배열에 넣어줌, 조건에 맞는 놈이 하나니까 0번 인덱스를 참조.)

        console.log("gettodobyid" + this.todoList.filter(todo => todo.id === parseInt(id))[0]);
        
        return this.todoList.filter(todo => todo.id === parseInt(id))[0];
        
    }

    //기존 List의 값을 변경 후 저장/업뎃
    setTodo(todoObj) {
        for(let i = 0; i < this.todoList.length; i++) {
            if(this.todoList[i].id === todoObj.id) {
                this.todoList[i] = todoObj;
                break;
            }
        }
        this.saveLocalStorage();
        this.updateTodoList();
    }
}