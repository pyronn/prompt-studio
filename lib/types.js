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

class MemoryCache {
    constructor() {
        this.cache = {};
        this.timeout = {};
    }

    // 设置缓存
    set(key, value, ttl) {
        this.cache[key] = value;
        if (ttl) {
            if (this.timeout[key]) {
                clearTimeout(this.timeout[key]);
            }
            this.timeout[key] = setTimeout(() => {
                delete this.cache[key];
                delete this.timeout[key];
            }, ttl);
        }
    }

    // 获取缓存
    get(key) {
        return this.cache[key];
    }

    // 检查是否含有某个键
    has(key) {
        return this.cache.hasOwnProperty(key);
    }

    // 删除缓存
    delete(key) {
        delete this.cache[key];
        if (this.timeout[key]) {
            clearTimeout(this.timeout[key]);
            delete this.timeout[key];
        }
    }

    // 清除所有缓存
    clear() {
        this.cache = {};
        Object.values(this.timeout).forEach(timeout => clearTimeout(timeout));
        this.timeout = {};
    }
}

export {PromptCategory,DictPrompt,MemoryCache}