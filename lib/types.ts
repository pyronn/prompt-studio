export interface BasicModalProps {
    isOpen: boolean;
    onClose?: () => void;
    onOpen: () => void;
    onOpenChange: (isOpen: boolean) => void;
    title?: string;
}


export interface DictTextPrompt {
    id: string;
    text: string;
    translation: string;
    category: string;
}

export class MemoryCache {
    private cache: { [key: string]: any };
    private timeout: { [key: string]: NodeJS.Timeout };

    constructor() {
        this.cache = {};
        this.timeout = {};
    }

    // 设置缓存
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

    // 获取缓存
    get(key: string): any {
        return this.cache[key];
    }

    // 检查是否含有某个键
    has(key: string): boolean {
        return this.cache.hasOwnProperty(key);
    }

    // 删除缓存
    delete(key: string): void {
        delete this.cache[key];
        if (this.timeout[key]) {
            clearTimeout(this.timeout[key]);
            delete this.timeout[key];
        }
    }

    // 清除所有缓存
    clear(): void {
        this.cache = {};
        Object.values(this.timeout).forEach(timeout => clearTimeout(timeout));
        this.timeout = {};
    }
}
