// This file contains functions to generate mock data for the travel booking app

// Generate transportation options based on origin, destination, and dates
export function generateTransportationOptions(
  origin: string,
  destination: string,
  isInternational: boolean,
  startDate: Date,
  endDate: Date,
) {
  const outboundOptions = generateFlightOptions(origin, destination, startDate, "outbound")
  const returnOptions = generateFlightOptions(destination, origin, endDate, "return")

  if (!isInternational) {
    const outboundTrainOptions = generateTrainOptions(origin, destination, startDate, "outbound")
    const returnTrainOptions = generateTrainOptions(destination, origin, endDate, "return")
    return [...outboundOptions, ...outboundTrainOptions, ...returnOptions, ...returnTrainOptions]
  }

  return [...outboundOptions, ...returnOptions]
}

function generateFlightOptions(from: string, to: string, date: Date, type: "outbound" | "return") {
  const airlines = [
    {
      name: "AirPod Airlines",
      image:
        "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
    },
    {
      name: "SkyWings",
      image:
        "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
    },
    {
      name: "Global Express",
      image:
        "https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
    },
  ]

  return airlines.map((airline, index) => ({
    id: `flight-${type}-${index + 1}`,
    type,
    company: airline.name,
    departureTime: `${8 + index * 4}:00`,
    arrivalTime: `${10 + index * 4}:30`,
    price: 15000 + index * 5000,
    selected: false,
    from,
    to,
    date: date.toISOString().split("T")[0],
    image: airline.image,
  }))
}

function generateTrainOptions(from: string, to: string, date: Date, type: "outbound" | "return") {
  const trainCompanies = [
    {
      name: "Express Rail",
      image:
        "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
    },
    {
      name: "Coastal Line",
      image:
        "https://images.unsplash.com/photo-1552413544-30fcc8e15d56?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
    },
  ]

  return trainCompanies.map((company, index) => ({
    id: `train-${type}-${index + 1}`,
    type,
    company: company.name,
    departureTime: `${7 + index * 6}:00`,
    arrivalTime: `${11 + index * 6}:00`,
    price: 8000 + index * 3000,
    selected: false,
    from,
    to,
    date: date.toISOString().split("T")[0],
    image: company.image,
  }))
}

// Generate accommodation options based on destination
export function generateAccommodationOptions(destination: string) {
  // Generate mock accommodation options
  const options = [
    {
      id: "hotel-1",
      name: "Grand Plaza Hotel",
      location: `Downtown ${destination}`,
      price: 18900,
      rating: 4,
      amenities: ["wifi", "pool", "restaurant", "gym"],
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
      selected: false,
    },
    {
      id: "hotel-2",
      name: "Seaside Resort & Spa",
      location: `${destination} Beach`,
      price: 24900,
      rating: 5,
      amenities: ["wifi", "pool", "restaurant", "gym"],
      image:
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
      selected: false,
    },
    {
      id: "hotel-3",
      name: "City Center Inn",
      location: `Central ${destination}`,
      price: 12900,
      rating: 3,
      amenities: ["wifi", "restaurant"],
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
      selected: false,
    },
    {
      id: "hotel-4",
      name: "Mountain View Lodge",
      location: `${destination} Hills`,
      price: 15900,
      rating: 4,
      amenities: ["wifi", "pool"],
      image:
        "https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
      selected: false,
    },
    {
      id: "hotel-5",
      name: "Luxury Suites",
      location: `${destination} Financial District`,
      price: 29900,
      rating: 5,
      amenities: ["wifi", "pool", "restaurant", "gym"],
      image:
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
      selected: false,
    },
  ]

  return options
}

// Generate attraction options based on destination
export function generateAttractionOptions(destination: string) {
  // Generate mock attraction options based on destination
  let options = []

  // Different attractions for different destinations
  if (destination.toLowerCase().includes("paris")) {
    options = [
      {
        id: "attraction-1",
        name: "Eiffel Tower",
        location: "Champ de Mars, Paris",
        price: 2500,
        description: "Iconic iron tower with panoramic city views.",
        image:
          "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
        selected: false,
      },
      {
        id: "attraction-2",
        name: "Louvre Museum",
        location: "Rue de Rivoli, Paris",
        price: 1700,
        description: "World's largest art museum & historic monument.",
        image:
          "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
        selected: false,
      },
      {
        id: "attraction-3",
        name: "Notre-Dame Cathedral",
        location: "Île de la Cité, Paris",
        price: 0,
        description: "Medieval Catholic cathedral with Gothic architecture.",
        image:
          "https://images.unsplash.com/photo-1478391679764-b2d8b3cd1e94?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
        selected: false,
      },
      {
        id: "attraction-4",
        name: "Seine River Cruise",
        location: "Various departure points, Paris",
        price: 1500,
        description: "Scenic boat tour along the Seine River.",
        image:
          "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
        selected: false,
      },
      {
        id: "attraction-5",
        name: "Montmartre & Sacré-Cœur",
        location: "Montmartre, Paris",
        price: 0,
        description: "Historic district with stunning basilica.",
        image:
          "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
        selected: false,
      },
    ]
  } else {
    // Generic attractions for any destination
    options = [
      {
        id: "attraction-1",
        name: `${destination} Museum of Art`,
        location: `Downtown ${destination}`,
        price: 1500,
        description: "Extensive collection of local and international art.",
        image:
          "https://images.unsplash.com/photo-1566127992631-137a642a90f4?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
        selected: false,
      },
      {
        id: "attraction-2",
        name: `${destination} Historical Tour`,
        location: `Old Town, ${destination}`,
        price: 2500,
        description: "Guided walking tour of historical landmarks.",
        image:
          "https://images.unsplash.com/photo-1569880153113-76e33fc52d5f?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
        selected: false,
      },
      {
        id: "attraction-3",
        name: `${destination} Botanical Gardens`,
        location: `${destination} Park District`,
        price: 1000,
        description: "Beautiful gardens featuring local and exotic plants.",
        image:
          "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
        selected: false,
      },
      {
        id: "attraction-4",
        name: `${destination} Adventure Park`,
        location: `${destination} Outskirts`,
        price: 3500,
        description: "Outdoor activities including zip-lining and hiking.",
        image:
          "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
        selected: false,
      },
      {
        id: "attraction-5",
        name: `${destination} Culinary Experience`,
        location: `${destination} Food District`,
        price: 4500,
        description: "Food tour featuring local cuisine and delicacies.",
        image:
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
        selected: false,
      },
    ]
  }

  return options
}

// Add this function to generate local transportation options
export function generateLocalTransportationOptions() {
  const options = [
    {
      id: "transport-1",
      type: "cab",
      name: "Premium Taxi Service",
      description: "24/7 on-call taxi service with professional drivers and comfortable vehicles.",
      pricePerDay: 3500,
      image:
        "https://images.unsplash.com/photo-1511527844527-dbb5a8798024?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3", // Yellow taxi cab
      selected: false,
    },
    {
      id: "transport-2",
      type: "van",
      name: "Family Van Rental",
      description: "Spacious van ideal for families or groups, with driver included.",
      pricePerDay: 5500,
      image:
        "https://images.unsplash.com/photo-1609520505218-7421df82c7f8?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3", // Passenger van
      selected: false,
    },
    {
      id: "transport-3",
      type: "bike",
      name: "Scooter/Bike Rental",
      description: "Freedom to explore at your own pace with our reliable scooters and bikes.",
      pricePerDay: 1200,
      image:
        "https://images.unsplash.com/photo-1591638246754-77e0a1a81e80?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3", // Rental bikes
      selected: false,
    },
    {
      id: "transport-4",
      type: "self-drive",
      name: "Self-Drive Car Rental",
      description: "Explore with privacy and convenience in our well-maintained rental cars.",
      pricePerDay: 2800,
      image:
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3", // Car rental
      selected: false,
    },
    {
      id: "transport-5",
      type: "luxury",
      name: "Luxury Car with Chauffeur",
      description: "Travel in style with our premium vehicles and professional chauffeurs.",
      pricePerDay: 7500,
      image:
        "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3", // Luxury car
      selected: false,
    },
  ]

  return options
}
