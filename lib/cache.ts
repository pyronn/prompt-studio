export class DictPrompt {
    id: string;
    text: string;
    transText: string;
    category: string;
    dir: string;

    constructor(id: string, text: string, transText: string, category: string, dir: string) {
        this.id = id;
        this.text = text;
        this.transText = transText;
        this.category = category;
        this.dir = dir;
    }
}

export class PromptCategory {
    id: string;
    name: string;
    parent: string | null;
    children: string[];

    constructor(id: string, name: string, parent: string | null, children: string[]) {
        this.id = id;
        this.name = name;
        this.parent = parent;
        this.children = children;
    }
}

export class Prompt {
    id: string;
    title: string;
    desc: string;
    category: string;
    rawPrompt: string;
    sampleImgLink: string;

    constructor(id: string, title: string, desc: string, category: string, rawPrompt: string, sampleImgLink: string) {
        this.id = id;
        this.title = title;
        this.desc = desc;
        this.category = category;
        this.rawPrompt = rawPrompt;
        this.sampleImgLink = sampleImgLink;
    }
}

export class MemoryCache {
    private cache: { [key: string]: any };
    private timeout: { [key: string]: NodeJS.Timeout };

    constructor() {
        this.cache = {};
        this.timeout = {};
    }

    set(key: string, value: any, ttl?: number): void {
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

    get(key: string): any | undefined {
        return this.cache[key];
    }

    has(key: string): boolean {
        return Object.prototype.hasOwnProperty.call(this.cache, key);
    }

    delete(key: string): void {
        delete this.cache[key];
        if (this.timeout[key]) {
            clearTimeout(this.timeout[key]);
            delete this.timeout[key];
        }
    }

    clear(): void {
        this.cache = {};
        Object.values(this.timeout).forEach(timeout => clearTimeout(timeout));
        this.timeout = {};
    }
}
