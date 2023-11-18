class DictPrompt {
    constructor(id, text, transText, category, dir) {
        this.id = id;
        this.text = text;
        this.transText = transText;
        this.category = category;
        this.dir = dir;
    }
}

class PromptCategory {
    constructor(id, name, parent, children) {
        this.id = id;
        this.name = name;
        this.parent = parent;
        this.children = children
    }

}

export {PromptCategory,DictPrompt}