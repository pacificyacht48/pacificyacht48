export const boatTypes = [
  "Motor Yacht",
  "Gulet",
  "Catamaran",
  "Sailboat",
  "Trawler"
];

export const serviceTypes = [
  "Weekly Accommodation Tours",
  "Daily Sightseeing Tours",
  "Water Sports",
  "Fishing Tours",
  "Evening Moonlight Dinner Tours",
  "Party / Birthday / Engagement Tours"
];

export const durations = [
  "1 Day",
  "3 Days",
  "1 Week",
  "2 Weeks"
];

export interface Yacht {
  id: string;
  name: string;
  type: string;
  guests: number;
  cabins: number;
  length: number;
  pricePerDay: number;
  image: string;
  description: string;
}

export const featuredYachts: Yacht[] = [
  {
    id: "y1",
    name: "Ocean Majesty",
    type: "Motor Yacht",
    guests: 12,
    cabins: 6,
    length: 45,
    pricePerDay: 5500,
    image: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    description: "Experience unparalleled luxury aboard the Ocean Majesty. Featuring a jacuzzi, expansive sun decks, and a dedicated crew of 8."
  },
  {
    id: "y2",
    name: "Aegean Dream",
    type: "Gulet",
    guests: 16,
    cabins: 8,
    length: 38,
    pricePerDay: 3200,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    description: "A classic wooden gulet combining traditional charm with modern amenities. Perfect for large family gatherings."
  },
  {
    id: "y3",
    name: "Azure Voyager",
    type: "Catamaran",
    guests: 8,
    cabins: 4,
    length: 22,
    pricePerDay: 2100,
    image: "https://images.unsplash.com/photo-1540946485063-a40da27545f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    description: "Sleek, stable, and spacious. The Azure Voyager offers panoramic views and shallow draft for exploring hidden coves."
  },
  {
    id: "y4",
    name: "Serenity Now",
    type: "Trawler",
    guests: 10,
    cabins: 5,
    length: 28,
    pricePerDay: 2800,
    image: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    description: "Long-range luxury trawler with exceptional fuel efficiency and comfort. Ideal for extended exploratory voyages."
  }
];
