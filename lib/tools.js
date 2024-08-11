import Sha1 from 'crypto-js/sha1';

export function parseCategoryObjects(categoryObjects) {
    // 建立一个空的根分类对象的数组
    const rootCategories = [];

    // 遍历每个对象
    categoryObjects.map((categoryObject, index) => {
        const {text, dir} = categoryObject;
        const categories = dir.split('/');

        // 在根分类对象数组中查找或创建匹配的分类树
        let currentCategory = null;
        let parentCategory = null;

        for (let i = 0; i < categories.length; i++) {
            const categoryName = categories[i];

            // 在当前分类的子分类中查找匹配的分类
            const matchingCategory = currentCategory
                ? currentCategory.children.find((child) => child.name === categoryName)
                : rootCategories.find((rootCategory) => rootCategory.name === categoryName);

            if (matchingCategory) {
                // 如果分类已存在，将其设置为当前分类，并继续到下一个子分类
                currentCategory = matchingCategory;
            } else {
                // 如果分类不存在，创建一个新的分类，将其添加到当前分类的子分类列表中，并设置为当前分类
                const newCategory = {
                    name: categoryName,
                    children: [],
                    texts: [],
                };

                if (currentCategory) {
                    currentCategory.children.push(newCategory);
                } else {
                    rootCategories.push(newCategory);
                }

                currentCategory = newCategory;
            }

            parentCategory = currentCategory;
        }

        // 将文本添加到叶子分类节点的文本列表中
        if (parentCategory) {
            const key = `${categoryObject.text}-${categoryObject.transText}-${Date.now()}-${index}`;
            categoryObject.id = categoryObject.id ? categoryObject.id : Sha1(key).toString()
            parentCategory.texts.push(categoryObject);
        }
    });

    return rootCategories;
}

// 辅助函数：用于移动数组中的元素
export function arrayMove(array, from, to) {
    const startIndex = to < 0 ? array.length + to : to;
    const item = array.splice(from, 1)[0];
    array.splice(startIndex, 0, item);
    return array;
}
