import {
  Search, ClipboardCheck, Ship, ThumbsUp, ShoppingCart, FileText, Headphones,
  Award, Car, Shield, ShieldCheck, Globe, DollarSign, UserCheck, Users,
  Package, Truck, Wrench, Compass, MapPin, Phone, Mail, Calendar,
  TrendingUp, Star, Settings, Cog, Fuel, Gauge, Zap, Battery, Clock,
  Circle,
} from 'lucide-react';

/**
 * Curated icon registry for admin-driven content (services, process steps).
 * Lucide ships ~1500 icons; importing them all blows the bundle to >2MB.
 * The Filament admin can pick any name from this map; unknown names fall
 * back to `Circle`.
 */
const REGISTRY = {
  Search, ClipboardCheck, Ship, ThumbsUp, ShoppingCart, FileText, Headphones,
  Award, Car, Shield, ShieldCheck, Globe, DollarSign, UserCheck, Users,
  Package, Truck, Wrench, Compass, MapPin, Phone, Mail, Calendar,
  TrendingUp, Star, Settings, Cog, Fuel, Gauge, Zap, Battery, Clock,
};

export function resolveIcon(name, fallbackName) {
  if (name && REGISTRY[name]) return REGISTRY[name];
  if (fallbackName && REGISTRY[fallbackName]) return REGISTRY[fallbackName];
  return Circle;
}

export const AVAILABLE_ICON_NAMES = Object.keys(REGISTRY);
