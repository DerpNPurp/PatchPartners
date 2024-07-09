class TitleScreen{
    constructor((progress)){
        this.progress = progress;
    }

    getOptions(resolve){
        return [
            {
                label: "New Game",
                description: "Start a new game",
                handler: () => {
                    this.close();
                    resolve();
                }
            }
        ]
    }

    createElement(){
        this.element = document.createElement("div");
        this.element.classList.add("TitleScreen");
        this.element.innerHTML=('')
    }

    close(){
        this.keyboardMenu.end();
        this.createElement.remove();
    }



    init(container){
        return new Promise(resolve =>{
            this.createElement();
            container.appendChild(this.element);
            this.keyboardMenu = new keyboardMenu;
            this.keyboardMenu.init(this.element);
            this.keyboardMenu.setOptions(this.getOptions(resolve))
        })
    }
}