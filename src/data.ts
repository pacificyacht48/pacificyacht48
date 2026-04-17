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
