export function parseCategoryObjects(categoryObjects) {
    // 建立一个空的根分类对象的数组
    const rootCategories = [];

    // 遍历每个对象
    categoryObjects.forEach((categoryObject) => {
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
            parentCategory.texts.push(categoryObject);
        }
    });

    return rootCategories;
}