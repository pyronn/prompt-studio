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

class Prompt {
    constructor(id, title, desc, category, rawPrompt, sampleImgLink) {
        this.id = id;
        this.title = title;
        this.desc = desc;
        this.category = category;
        this.rawPrompt = rawPrompt;
        this.sampleImgLink = sampleImgLink;
    }
}

export {PromptCategory,DictPrompt}