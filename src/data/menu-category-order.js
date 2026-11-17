const CATEGORY_PRIORITY = [
    'cold-rolls',
    'baked-rolls',
    'hot-rolls',
    'business-lunch',
    'sets',
    'poke',
    'pizza',
    'wok-noodle',
    'hot-dishes',
    'salads',
    'soups',
    'snacks',
    'sashimi',
    'chef',
    'sides',
    'sweet-rolls',
    'lemonade',
    'tea',
];

export function orderMenuCategories(categories) {
    const priority = new Map(CATEGORY_PRIORITY.map((id, index) => [id, index]));

    return [...categories].sort(
        (a, b) => (priority.get(a.id) ?? CATEGORY_PRIORITY.length) -
            (priority.get(b.id) ?? CATEGORY_PRIORITY.length)
    );
}
