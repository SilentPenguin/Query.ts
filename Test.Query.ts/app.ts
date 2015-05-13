/// <reference path="../query.ts/query.ts" />
class Greeter {
    element: HTMLElement;
    span: HTMLElement;
    timerToken: number;

    constructor(element: HTMLElement) {
        this.element = element;
        this.element.innerHTML += "The time is: ";
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this.span.innerText = new Date().toUTCString();
    }

    start() {
        this.timerToken = setInterval(() => this.span.innerHTML = new Date().toUTCString(), 500);
    }

    stop() {
        clearTimeout(this.timerToken);
    }

}

window.onload = () => {
    var el = document.getElementById('content');
    var greeter = new Greeter(el);
    greeter.start();

    var array: number[] = [2, 1, 4, 3, 6, 5];
    Query.from(array).take.if(item => item < 2);
    Query.from(array).take.if.not(item => item < 2);
    Query.from(array).as(item => item);
    Query.from(array).as.array();
};