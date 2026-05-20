export const pantrySeed = [
    {
        id: 1,
        name: "Eggs",
        quantity: 6,
        unit: "pcs",
        category: "Dairy",
        expirationDate: "2026-05-02",
        isEssential: true,
        lowStockThreshold: 2,
    },
    {
        id: 2,
        name: "Spaghetti",
        quantity: 400,
        unit: "g",
        category: "Pasta",
        expirationDate: "2028-02-09",
        isEssential: true,
        lowStockThreshold: 100,
    },
    {
        id: 3,
        name: "Guanciale",
        quantity: 300,
        unit: "g",
        category: "Meat",
        expirationDate: "2026-12-27",
        isEssential: false,
        lowStockThreshold: 80,
    },
    {
        id: 4,
        name: "Potatoes",
        quantity: 0.5,
        unit: "kg",
        category: "Produce",
        expirationDate: "2026-06-03",
        isEssential: true,
        lowStockThreshold: 0.3,
    },
    {
        id: 5,
        name: "Onion",
        quantity: 0.3,
        unit: "kg",
        category: "Produce",
        expirationDate: "2026-06-28",
        isEssential: true,
        lowStockThreshold: 0.4,
    },
    {
        id: 6,
        name: "Flour",
        quantity: 1,
        unit: "kg",
        category: "Baking",
        expirationDate: "2027-01-20",
        isEssential: true,
        lowStockThreshold: 0.5,
    },
    {
        id: 7,
        name: "Salt",
        quantity: 100,
        unit: "g",
        category: "Condiments",
        expirationDate: "",
        isEssential: true,
        lowStockThreshold: 50,
    },
    {
        id: 8,
        name: "Pepper",
        quantity: 100,
        unit: "g",
        category: "Condiments",
        expirationDate: "2028-12-30",
        isEssential: true,
        lowStockThreshold: 30,
    },
    {
        id: 9,
        name: "Oil",
        quantity: 1,
        unit: "l",
        category: "Condiments",
        expirationDate: "2027-08-14",
        isEssential: true,
        lowStockThreshold: 0.2,
    },
];

export const recipeSeed = [
    {
        id: 1,
        name: "Pasta Carbonara",
        caloriesPerPortion: 750,
        basePortions: 3,
        diet: "None",
        allergens: "Eggs, Dairy, Gluten",
        ingredients: [
            { id: 1, name: "Spaghetti", quantity: 100, unit: "g" },
            { id: 2, name: "Eggs", quantity: 2, unit: "pcs" },
            { id: 3, name: "Parmigiano Reggiano", quantity: 40, unit: "g" },
            { id: 4, name: "Guanciale", quantity: 60, unit: "g" },
            { id: 5, name: "Pepper", quantity: 4, unit: "g" },
            { id: 6, name: "Salt", quantity: 4, unit: "g" },
        ],
        instructions:
            "Boil salted water. Cook the spaghetti until al dente. Fry the guanciale on low heat until crispy. In a bowl, mix egg yolks with Parmigiano Reggiano, pepper, and a little salt. Add the pasta to the pan, then mix with the egg and cheese sauce off the heat.",
    },
    {
        id: 2,
        name: "Hashbrowns",
        caloriesPerPortion: 326,
        basePortions: 2,
        diet: "Vegetarian",
        allergens: "",
        ingredients: [
            { id: 1, name: "Potatoes", quantity: 0.4, unit: "kg" },
            { id: 2, name: "Onion", quantity: 0.2, unit: "kg" },
            { id: 3, name: "Oil", quantity: 0.05, unit: "l" },
            { id: 4, name: "Salt", quantity: 3, unit: "g" },
            { id: 5, name: "Pepper", quantity: 2, unit: "g" },
        ],
        instructions:
            "Grate the potatoes and onion. Squeeze out extra liquid. Heat oil in a pan. Add the mixture and press it flat. Cook until golden and crispy on both sides.",
    },
];

export const shoppingSeed = [
    {
        id: 1,
        ingredientName: "Parmigiano Reggiano",
        quantityNeeded: 40,
        unit: "g",
        isBought: false,
    },
];

export const units = ["pcs", "g", "kg", "mg", "ml", "l"];
export const categories = ["Dairy", "Pasta", "Meat", "Produce", "Baking", "Condiments", "Other"];
export const diets = ["None", "Vegetarian", "Vegan"];