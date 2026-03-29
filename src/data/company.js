export const company = {
  name: "DESTINO Corporation",
  shortName: "DESTINO",
  website: "https://destino-v.com",
  tagline: "For Those Who Love Import Cars.",
  established: 1995,
  yearsExperience: 29,
  vehiclesInStock: "2,400+",
  countriesServed: "50+",
  carsExported: "15,000+",
  address: {
    full: "5-20-25 Chigasaki-Minami, Tsuzuki-ku, Yokohama, Kanagawa 224-0037, Japan",
    street: "5-20-25 Chigasaki-Minami",
    ward: "Tsuzuki-ku",
    city: "Yokohama",
    prefecture: "Kanagawa",
    postalCode: "224-0037",
    country: "Japan"
  },
  phone: "+81-45-949-6777",
  fax: "+81-45-482-6444",
  email: "export@destino.jp",
  hours: {
    weekday: { days: "Tuesday – Saturday", time: "10:00 – 19:00" },
    weekend: { days: "Sunday & Holidays", time: "10:00 – 18:00" },
    closed: "Monday"
  },
  social: {
    youtube: "#",
    instagram: "#",
    facebook: "#",
    whatsapp: "#"
  },
  locations: [
    {
      name: "Yokohama Head Office & Showroom",
      address: "5-20-25 Chigasaki-Minami, Tsuzuki-ku, Yokohama, Kanagawa 224-0037, Japan",
      phone: "+81-45-949-6777",
      fax: "+81-45-482-6444",
      hours: "Tue–Sat 10:00–19:00 / Sun & Holidays 10:00–18:00 / Monday Closed",
      isPrimary: true
    }
  ],
  companyInfo: {
    representative: "Takeshi Yamamoto",
    businessActivities: "Export of used and new vehicles, vehicle sourcing from Japanese auctions, inspection and quality assurance, international shipping and logistics, customs documentation support",
    memberships: "Japan Used Motor Vehicle Exporters Association (JUMVEA)"
  }
};

export const deliveredCars = [
  {
    id: "del-001",
    make: "Toyota",
    model: "Land Cruiser 300",
    year: 2023,
    destination: "South Africa",
    deliveryDate: "2024-11-15",
    image: "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800&h=533&fit=crop",
    customerName: "James K.",
    testimonial: "Arrived in perfect condition. The entire process was handled professionally."
  },
  {
    id: "del-002",
    make: "Mercedes-Benz",
    model: "G63 AMG",
    year: 2024,
    destination: "United Arab Emirates",
    deliveryDate: "2024-10-28",
    image: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?w=800&h=533&fit=crop",
    customerName: "Ahmed R.",
    testimonial: "My third purchase through Destino. Consistently excellent service."
  },
  {
    id: "del-003",
    make: "Toyota",
    model: "Hilux Revo",
    year: 2023,
    destination: "Kenya",
    deliveryDate: "2024-10-10",
    image: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&h=533&fit=crop",
    customerName: "David M.",
    testimonial: "Exactly what I needed for business. Transparent pricing throughout."
  },
  {
    id: "del-004",
    make: "BMW",
    model: "X5 xDrive40i",
    year: 2023,
    destination: "New Zealand",
    deliveryDate: "2024-09-22",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=533&fit=crop",
    customerName: "Tomoko S.",
    testimonial: "Passed local compliance on the first attempt. Great communication."
  },
  {
    id: "del-005",
    make: "Nissan",
    model: "Patrol Y62",
    year: 2022,
    destination: "Jamaica",
    deliveryDate: "2024-09-05",
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=533&fit=crop",
    customerName: "Robert T.",
    testimonial: null
  },
  {
    id: "del-006",
    make: "Toyota",
    model: "Land Cruiser Prado",
    year: 2023,
    destination: "Tanzania",
    deliveryDate: "2024-08-18",
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=533&fit=crop",
    customerName: "Patrick O.",
    testimonial: "High inspection standards and thorough documentation."
  },
  {
    id: "del-007",
    make: "Porsche",
    model: "Cayenne S",
    year: 2023,
    destination: "Fiji",
    deliveryDate: "2024-08-02",
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=533&fit=crop",
    customerName: null,
    testimonial: null
  },
  {
    id: "del-008",
    make: "Toyota",
    model: "GR Supra",
    year: 2023,
    destination: "Trinidad and Tobago",
    deliveryDate: "2024-07-20",
    image: "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800&h=533&fit=crop",
    customerName: "Marcus W.",
    testimonial: null
  },
  {
    id: "del-009",
    make: "Lexus",
    model: "LX 600",
    year: 2024,
    destination: "Mozambique",
    deliveryDate: "2024-07-08",
    image: "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800&h=533&fit=crop",
    customerName: "Carlos F.",
    testimonial: "Premium vehicle delivered in showroom condition. Highly recommended."
  },
  {
    id: "del-010",
    make: "Mercedes-Benz",
    model: "C300 AMG Line",
    year: 2022,
    destination: "Papua New Guinea",
    deliveryDate: "2024-06-25",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=533&fit=crop",
    customerName: null,
    testimonial: null
  },
  {
    id: "del-011",
    make: "Honda",
    model: "Civic Type R",
    year: 2024,
    destination: "Barbados",
    deliveryDate: "2024-06-10",
    image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=533&fit=crop",
    customerName: "Ryan B.",
    testimonial: "Sourced exactly the spec I wanted. Great communication throughout."
  },
  {
    id: "del-012",
    make: "Toyota",
    model: "Alphard",
    year: 2024,
    destination: "Singapore",
    deliveryDate: "2024-05-28",
    image: "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&h=533&fit=crop",
    customerName: "Wei L.",
    testimonial: null
  }
];
