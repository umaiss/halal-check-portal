import { Product } from "@/types/product";

export const DUMMY_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Classic Milk Chocolate",
    status: "halal",
    ingredients: "Sugar, Cocoa Butter, Whole Milk Powder, Cocoa Mass, Emulsifier (Soya Lecithin), Natural Vanilla Flavouring.",
    analysis: "All ingredients are plant-based or dairy from certified sources. No animal rennet or alcohol used.",
    images: {
      front: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=800&auto=format&fit=crop",
      back: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=800&auto=format&fit=crop",
      ingredients: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=800&auto=format&fit=crop",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "2",
    name: "Gummy Bears",
    status: "haram",
    ingredients: "Glucose Syrup, Sugar, Gelatine, Dextrose, Fruit Juice from Concentrate, Citric Acid, Fruit and Plant Concentrates, Beeswax, Carnauba Wax.",
    analysis: "Contains Pork-sourced Gelatine. Not suitable for Halal diet.",
    images: {
      front: "https://images.unsplash.com/photo-1582050041567-9cfdd33e3b8a?q=80&w=800&auto=format&fit=crop",
      back: "https://images.unsplash.com/photo-1582050041567-9cfdd33e3b8a?q=80&w=800&auto=format&fit=crop",
      ingredients: "https://images.unsplash.com/photo-1582050041567-9cfdd33e3b8a?q=80&w=800&auto=format&fit=crop",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "3",
    name: "Instant Cup Noodles",
    status: "mushbooh",
    ingredients: "Wheat Flour, Palm Oil, Salt, Sugar, Flavour Enhancers (E621, E635), Spices, Soy Sauce Powder, Yeast Extract, Anticaking Agent (E551).",
    analysis: "Contains E635 (Disodium 5'-ribonucleotides) which can be animal-sourced. Source not specified. Flavor enhancer E621 is also debatable depending on source.",
    images: {
      front: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800&auto=format&fit=crop",
      back: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800&auto=format&fit=crop",
      ingredients: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800&auto=format&fit=crop",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "4",
    name: "Organic Honey Mustard",
    status: "halal",
    ingredients: "Organic Mustard Seeds, Water, Organic Vinegar, Organic Honey, Salt, Organic Turmeric.",
    analysis: "All ingredients are natural and organic. Vinegar is distilled and honey is from certified organic farms.",
    images: {
      front: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?q=80&w=800&auto=format&fit=crop",
      back: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?q=80&w=800&auto=format&fit=crop",
      ingredients: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?q=80&w=800&auto=format&fit=crop",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "5",
    name: "Beef Jerky",
    status: "mushbooh",
    ingredients: "Beef, Brown Sugar, Soy Sauce, Water, Salt, Garlic Powder, Onion Powder, Sodium Nitrite.",
    analysis: "Beef source (Zabiha) is not confirmed on packaging. Requires further verification of the slaughter method.",
    images: {
      front: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=800&auto=format&fit=crop",
      back: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=800&auto=format&fit=crop",
      ingredients: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=800&auto=format&fit=crop",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  }
];

export const DUMMY_STATS = {
  total: 1250,
  halal: 850,
  haram: 250,
  mushbooh: 150,
};
