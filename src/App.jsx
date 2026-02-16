import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Phone, Mail, MapPin, ArrowRight, Star, Truck, Menu, X, Heart, Shield, FileCheck, MessageCircle, ChevronLeft, ChevronRight, ExternalLink, Play, Globe, Clock, Anchor } from "lucide-react";

/*
  DESTINO — Export Car Directory Homepage
  Design philosophy: Clean white backgrounds, deep navy accents,
  cars are the heroes, minimal decoration, subtle transitions only.
  "Refined concierge, not race team."
*/

const C = {
  primary: "#232287",
  primaryLight: "#32488f",
  deep: "#0d0d3b",
  muted: "#a3adc1",
  cyan: "#1892c2",
  black: "#333",
  white: "#fff",
  light: "#f5f5f5",
  border: "#e0e0e0",
  inputBg: "#f3f3f3",
};

const CARS = [
  { id:1, make:"Toyota", model:"Land Cruiser 300", year:2024, price:58500, km:"12,000", fuel:"Diesel", trans:"Automatic", img:"https://images.unsplash.com/photo-1625231334168-40f4ae642985?w=600&h=400&fit=crop", badge:"Featured" },
  { id:2, make:"Mercedes-Benz", model:"G63 AMG", year:2023, price:142000, km:"8,500", fuel:"Petrol", trans:"Automatic", img:"https://images.unsplash.com/photo-1520031441872-265e4ff70366?w=600&h=400&fit=crop", badge:"Premium" },
  { id:3, make:"Toyota", model:"Hilux Revo", year:2024, price:32800, km:"5,200", fuel:"Diesel", trans:"Automatic", img:"https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=600&h=400&fit=crop", badge:"New" },
  { id:4, make:"BMW", model:"X5 xDrive40d", year:2023, price:67500, km:"15,300", fuel:"Diesel", trans:"Automatic", img:"https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=400&fit=crop", badge:null },
  { id:5, make:"Nissan", model:"Patrol Y62", year:2024, price:52000, km:"3,800", fuel:"Petrol", trans:"Automatic", img:"https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&h=400&fit=crop", badge:null },
  { id:6, make:"Porsche", model:"Cayenne Turbo", year:2023, price:98000, km:"11,200", fuel:"Petrol", trans:"Automatic", img:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop", badge:"Premium" },
];

const RECENT = [
  { id:7, make:"Honda", model:"Civic Type R", year:2024, price:38900, km:"1,200", fuel:"Petrol", trans:"Manual", img:"https://images.unsplash.com/photo-1679239872589-ca7e6abe5663?w=600&h=400&fit=crop" },
  { id:8, make:"Subaru", model:"WRX STI", year:2023, price:34500, km:"9,800", fuel:"Petrol", trans:"Manual", img:"https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=600&h=400&fit=crop" },
  { id:9, make:"Toyota", model:"GR Supra", year:2024, price:55200, km:"4,100", fuel:"Petrol", trans:"Automatic", img:"https://images.unsplash.com/photo-1611859266726-04865071dfdb?w=600&h=400&fit=crop" },
  { id:10, make:"Lexus", model:"LX 600", year:2024, price:88000, km:"2,500", fuel:"Petrol", trans:"Automatic", img:"https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=400&fit=crop" },
];

const REVIEWS = [
  { name:"James K.", from:"South Africa", text:"The Land Cruiser arrived in perfect condition. Destino handled everything — inspection, shipping, documentation. Seamless experience.", stars:5 },
  { name:"Ahmed M.", from:"UAE", text:"Third purchase through Destino. Their reports are honest, communication is fast, and the cars always match the listing.", stars:5 },
  { name:"Patrick O.", from:"Kenya", text:"They walked me through import regulations and handled all the paperwork. The Hilux was exactly as described.", stars:5 },
];

/* ─── CARD ─── */
function Card({ car }) {
  const [hov, setHov] = useState(false);
  const [fav, setFav] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ background:C.white, cursor:"pointer", transition:"box-shadow .3s ease-out" ,
        boxShadow: hov ? "0 8px 30px rgba(0,0,0,.08)" : "0 1px 3px rgba(0,0,0,.04)",
      }}
    >
      {/* Image container — 3:2 ratio */}
      <div style={{ position:"relative", paddingTop:"66.66%", overflow:"hidden", background:"#eee" }}>
        <img src={car.img} alt={`${car.make} ${car.model}`}
          style={{
            position:"absolute", top:0, left:0, width:"100%", height:"100%",
            objectFit:"cover", display:"block",
            transition:"opacity .3s ease-out",
            opacity: hov ? 0.88 : 1,
          }}
        />
        {car.badge && (
          <span style={{
            position:"absolute", top:12, left:12,
            background: car.badge==="Premium" ? C.primary : car.badge==="New" ? "#2d8a4e" : C.primaryLight,
            color:C.white, padding:"4px 12px",
            fontSize:11, fontWeight:600, letterSpacing:".5px",
          }}>{car.badge}</span>
        )}
        <button onClick={e=>{e.stopPropagation();setFav(!fav)}} style={{
          position:"absolute", top:12, right:12, width:32, height:32,
          borderRadius:"50%", border:"none", cursor:"pointer",
          background: fav ? "rgba(255,255,255,.95)" : "rgba(0,0,0,.25)",
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"background .3s ease-out",
        }}>
          <Heart size={14} color={fav?"#c00":"#fff"} fill={fav?"#c00":"none"} strokeWidth={2} />
        </button>
      </div>
      {/* Content */}
      <div style={{ padding:"16px 18px 18px" }}>
        <p style={{ fontSize:11, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", margin:"0 0 4px" }}>
          {car.make} · {car.year}
        </p>
        <h3 style={{ fontSize:16, fontWeight:600, color:C.black, margin:"0 0 8px", lineHeight:1.3 }}>
          {car.model}
        </h3>
        <div style={{ display:"flex", gap:12, fontSize:12, color:"#777", marginBottom:14 }}>
          <span>{car.km} km</span>
          <span style={{ color:"#ddd" }}>|</span>
          <span>{car.fuel}</span>
          <span style={{ color:"#ddd" }}>|</span>
          <span>{car.trans}</span>
        </div>
        <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <span style={{ fontSize:10, color:C.muted, letterSpacing:".5px", textTransform:"uppercase", display:"block", marginBottom:1 }}>FOB Japan</span>
            <span style={{ fontSize:20, fontWeight:700, color:C.primary }}>${car.price.toLocaleString()}</span>
          </div>
          <span style={{
            fontSize:12, fontWeight:600, color:C.primary,
            display:"flex", alignItems:"center", gap:4,
            transition:"gap .3s ease-out",
            ...(hov && { gap:8 }),
          }}>View Details <ArrowRight size={14}/></span>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ─── */
export default function Destino() {
  const [scrolled, setScrolled] = useState(false);
  const [mob, setMob] = useState(false);
  const [aT, setAT] = useState(0);
  const [heroSlide, setHeroSlide] = useState(0);

  const heroImages = [
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80",
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1920&q=80",
    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1920&q=80",
  ];

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setHeroSlide(p => (p+1) % heroImages.length), 5000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setAT(p => (p+1) % REVIEWS.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ fontFamily:"'Poppins',sans-serif", color:C.black, background:C.white, overflowX:"hidden", fontSize:14, letterSpacing:".3px", WebkitFontSmoothing:"antialiased" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        ::selection{background:${C.primary};color:#fff}
        a{text-decoration:none}
        img{display:block}
        .wrap{max-width:1400px;margin:0 auto;padding:0 5%}
        @media(max-width:768px){
          .dk{display:none!important}
          .mob-show{display:flex!important}
          .g4{grid-template-columns:repeat(2,1fr)!important}
          .g3{grid-template-columns:1fr!important}
          .g2{grid-template-columns:1fr!important}
          .fg{grid-template-columns:1fr!important}
          .hero-inner{padding:60px 5% 40px!important}
          .hero-h1{font-size:28px!important}
          .search-row{flex-direction:column!important}
          .stat-grid{grid-template-columns:repeat(2,1fr)!important;gap:16px!important}
          .cta-inner{flex-direction:column!important;text-align:center}
          .process-grid{grid-template-columns:1fr!important}
        }
        @media(min-width:769px){.mob-show{display:none!important}}
        @media(min-width:769px) and (max-width:1024px){
          .g4{grid-template-columns:repeat(2,1fr)!important}
          .g3{grid-template-columns:repeat(2,1fr)!important}
        }
      `}</style>

      {/* ═══ HEADER ═══ */}
      <header style={{
        position:"fixed", top:0, left:0, right:0, zIndex:18000,
        background: scrolled ? C.primary : C.primary,
        height: scrolled ? 56 : 64,
        transition:"all .3s ease-out",
        boxShadow: scrolled ? "0 2px 12px rgba(0,0,0,.12)" : "none",
      }}>
        <div className="wrap" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", height:"100%" }}>
          {/* Logo */}
          <a href="#" style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize: scrolled ? 18 : 20, fontWeight:700, color:C.white, letterSpacing:"2px", transition:"font-size .3s ease-out" }}>DESTINO</span>
          </a>

          {/* Nav */}
          <nav className="dk" style={{ display:"flex", gap:0, alignItems:"center", height:"100%" }}>
            {["Home","Stock List","About","Delivered","Contact"].map((l,i)=>(
              <a key={i} href="#" style={{
                color:"rgba(255,255,255,.8)", fontSize:13, fontWeight:500,
                padding:"0 20px", height:"100%", display:"flex", alignItems:"center",
                position:"relative", transition:"color .3s ease-out",
                letterSpacing:".5px",
              }}
                onMouseEnter={e=>{
                  e.currentTarget.style.color="#fff";
                  e.currentTarget.querySelector('.ul').style.width="100%";
                }}
                onMouseLeave={e=>{
                  e.currentTarget.style.color="rgba(255,255,255,.8)";
                  e.currentTarget.querySelector('.ul').style.width="0";
                }}
              >
                {l}
                <span className="ul" style={{
                  position:"absolute", bottom:0, left:20, right:20,
                  height:2, background:C.cyan, width:0,
                  transition:"width .3s ease-out",
                }}/>
              </a>
            ))}
          </nav>

          {/* Right side */}
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div className="dk" style={{ display:"flex", alignItems:"center", gap:14, marginRight:8 }}>
              <a href="#" style={{ color:"rgba(255,255,255,.6)", display:"flex", alignItems:"center", gap:5, fontSize:12, transition:"color .3s ease-out" }}
                onMouseEnter={e=>e.currentTarget.style.color="#fff"}
                onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.6)"}
              ><Phone size={13}/> +81-45-949-6777</a>
            </div>
            <select className="dk" style={{
              background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.15)",
              color:"rgba(255,255,255,.75)", fontSize:11, padding:"5px 8px",
              outline:"none", cursor:"pointer", fontFamily:"'Poppins',sans-serif",
            }}>
              <option>USD</option><option>JPY</option><option>ZAR</option><option>GBP</option><option>EUR</option>
            </select>
            <button onClick={()=>setMob(!mob)} className="mob-show"
              style={{ background:"none", border:"none", color:"#fff", cursor:"pointer", display:"none" }}>
              {mob ? <X size={22}/> : <Menu size={22}/>}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mob && (
          <div className="mob-show" style={{
            position:"absolute", top:"100%", left:0, right:0,
            background:"rgba(240,245,245,.97)", padding:"16px 5% 24px",
            flexDirection:"column", gap:0, display:"none",
            boxShadow:"0 8px 24px rgba(0,0,0,.08)",
          }}>
            {["Home","Stock List","About","Delivered","Contact"].map((l,i)=>(
              <a key={i} href="#" style={{
                color:C.black, fontSize:15, fontWeight:500, padding:"14px 0",
                borderBottom:`1px solid ${C.border}`, display:"block",
              }}>{l}</a>
            ))}
          </div>
        )}
      </header>

      {/* ═══ HERO ═══ */}
      <section style={{ position:"relative", paddingTop:"56.25%", overflow:"hidden", marginTop: scrolled ? 56 : 64, transition:"margin-top .3s ease-out" }}>
        {/* Slides */}
        {heroImages.map((src,i)=>(
          <img key={i} src={src} alt=""
            style={{
              position:"absolute", top:0, left:0, width:"100%", height:"100%",
              objectFit:"cover",
              opacity: i===heroSlide ? 1 : 0,
              transition:"opacity 1s ease",
            }}
          />
        ))}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg, rgba(13,13,59,.75) 0%, rgba(13,13,59,.3) 50%, transparent 100%)" }}/>

        {/* Content overlay — left side */}
        <div className="hero-inner" style={{ position:"absolute", top:0, bottom:0, left:0, width:"100%", display:"flex", alignItems:"center", padding:"0 7%" }}>
          <div style={{ maxWidth:560 }}>
            <h1 className="hero-h1" style={{
              fontSize:40, fontWeight:700, color:C.white,
              lineHeight:1.25, marginBottom:16, letterSpacing:".5px",
            }}>
              For Those Who Love<br/>Import Cars.
            </h1>
            <p style={{
              fontSize:15, color:"rgba(255,255,255,.6)",
              lineHeight:1.8, marginBottom:32, fontWeight:300, maxWidth:440,
            }}>
              DESTINO Corporation handles the import, sales and export of
              premium vehicles from Japan to over 50 countries worldwide.
            </p>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              <a href="#" style={{
                background:C.cyan, color:C.white,
                padding:"12px 28px", fontSize:13, fontWeight:600,
                display:"inline-flex", alignItems:"center", gap:8,
                transition:"background .3s ease-out", letterSpacing:".5px",
              }}
                onMouseEnter={e=>e.currentTarget.style.background="#1480aa"}
                onMouseLeave={e=>e.currentTarget.style.background=C.cyan}
              >
                <Search size={15}/> Browse Stock
              </a>
              <a href="#" style={{
                background:"rgba(255,255,255,.1)", color:C.white,
                padding:"12px 28px", fontSize:13, fontWeight:500,
                border:"1px solid rgba(255,255,255,.25)",
                display:"inline-flex", alignItems:"center", gap:8,
                transition:"all .3s ease-out", letterSpacing:".5px",
              }}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.18)"}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.1)"}}
              >
                <MessageCircle size={15}/> Contact Us
              </a>
            </div>
            {/* Slide dots */}
            <div style={{ display:"flex", gap:8, marginTop:32 }}>
              {heroImages.map((_,i)=>(
                <button key={i} onClick={()=>setHeroSlide(i)} style={{
                  width: i===heroSlide ? 24 : 8, height:8, border:"none",
                  background: i===heroSlide ? C.cyan : "rgba(255,255,255,.3)",
                  cursor:"pointer", transition:"all .3s ease-out",
                }}/>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SEARCH BAR ═══ */}
      <section style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"24px 0" }}>
        <div className="wrap">
          <div className="search-row" style={{ display:"flex", gap:12, alignItems:"flex-end", flexWrap:"wrap" }}>
            {[
              {l:"Make", opts:["All Makes","Toyota","Honda","Nissan","BMW","Mercedes-Benz","Audi","Porsche","Lexus","Subaru"]},
              {l:"Body Type", opts:["All Types","Sedan","SUV","Hatchback","Pickup","Coupe","Wagon","Van"]},
              {l:"Year", opts:["Any Year","2024","2023","2022","2021","2020","2019","2018 & Older"]},
              {l:"Price Range", opts:["Any Price","Under $10,000","$10,000–$25,000","$25,000–$50,000","$50,000–$100,000","Over $100,000"]},
              {l:"Transmission", opts:["Any","Automatic","Manual"]},
            ].map((f,i)=>(
              <div key={i} style={{ flex:1, minWidth:140 }}>
                <label style={{ fontSize:11, color:"#888", letterSpacing:".5px", display:"block", marginBottom:5, fontWeight:500 }}>{f.l}</label>
                <div style={{ position:"relative" }}>
                  <select style={{
                    width:"100%", padding:"10px 32px 10px 12px",
                    border:`1px solid ${C.border}`, background:C.inputBg,
                    fontSize:13, color:C.black, appearance:"none",
                    cursor:"pointer", outline:"none", fontFamily:"'Poppins',sans-serif",
                  }}>
                    {f.opts.map((o,j)=><option key={j}>{o}</option>)}
                  </select>
                  <ChevronDown size={14} color="#999" style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
                </div>
              </div>
            ))}
            <button style={{
              background:C.primary, color:C.white, border:"none",
              padding:"10px 32px", fontSize:13, fontWeight:600,
              cursor:"pointer", display:"flex", alignItems:"center", gap:8,
              whiteSpace:"nowrap", fontFamily:"'Poppins',sans-serif",
              letterSpacing:".5px", transition:"background .3s ease-out",
              height:42,
            }}
              onMouseEnter={e=>e.currentTarget.style.background=C.deep}
              onMouseLeave={e=>e.currentTarget.style.background=C.primary}
            >
              <Search size={15}/> Search
            </button>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section style={{ background:C.light, padding:"40px 0" }}>
        <div className="wrap">
          <div className="stat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0 }}>
            {[
              {n:"2,400+", l:"Vehicles in Stock", ic:Globe },
              {n:"50+", l:"Countries Served", ic:Truck },
              {n:"29", l:"Years of Experience", ic:Shield },
              {n:"15,000+", l:"Cars Exported", ic:FileCheck },
            ].map(({n,l,ic:Ic},i)=>(
              <div key={i} style={{ textAlign:"center", padding:"20px 16px", borderRight: i<3 ? `1px solid ${C.border}` : "none" }}>
                <Ic size={22} color={C.primary} strokeWidth={1.5} style={{ marginBottom:10 }}/>
                <div style={{ fontSize:28, fontWeight:700, color:C.primary, lineHeight:1, marginBottom:4 }}>{n}</div>
                <div style={{ fontSize:12, color:"#888", fontWeight:400 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURED ═══ */}
      <section style={{ background:C.white, padding:"60px 0 70px" }}>
        <div className="wrap">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:32 }}>
            <h2 style={{ fontSize:22, fontWeight:700, color:C.black, letterSpacing:".5px" }}>Featured Vehicles</h2>
            <a href="#" style={{ color:C.primary, fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:6, transition:"gap .3s ease-out" }}
              onMouseEnter={e=>e.currentTarget.style.gap="10px"}
              onMouseLeave={e=>e.currentTarget.style.gap="6px"}
            >View All <ArrowRight size={14}/></a>
          </div>
          <div className="g3" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
            {CARS.map(c=><Card key={c.id} car={c}/>)}
          </div>
        </div>
      </section>

      {/* ═══ WHY DESTINO ═══ */}
      <section style={{ background:C.light, padding:"60px 0 70px" }}>
        <div className="wrap">
          <div className="g2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"center" }}>
            {/* Image */}
            <div style={{ position:"relative" }}>
              <img src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=700&h=500&fit=crop" alt="Destino Showroom"
                style={{ width:"100%", display:"block" }}
              />
            </div>
            {/* Content */}
            <div>
              <h2 style={{ fontSize:22, fontWeight:700, color:C.black, marginBottom:12, letterSpacing:".5px" }}>Why Choose Destino</h2>
              <p style={{ fontSize:14, color:"#666", lineHeight:2, marginBottom:36, fontWeight:300 }}>
                With nearly three decades in Japan's automotive industry,
                we bring unmatched expertise to international vehicle sourcing.
                Every vehicle undergoes rigorous multi-point inspection.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
                {[
                  {ic:FileCheck, t:"Certified Inspection", d:"Multi-point quality check with graded report and auction verification"},
                  {ic:Anchor, t:"Worldwide Shipping", d:"RoRo and container shipping to ports across Africa, Pacific, Middle East"},
                  {ic:Shield, t:"Transparent Pricing", d:"FOB pricing with no hidden fees — the listed price is final"},
                  {ic:MessageCircle, t:"Dedicated Advisor", d:"Personal export advisor from first inquiry to port delivery"},
                ].map(({ic:Ic,t,d},i)=>(
                  <div key={i} style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
                    <div style={{
                      width:42, height:42, minWidth:42, background:C.white,
                      border:`1px solid ${C.border}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>
                      <Ic size={18} color={C.primary} strokeWidth={1.5}/>
                    </div>
                    <div>
                      <h4 style={{ fontSize:14, fontWeight:600, color:C.black, marginBottom:3 }}>{t}</h4>
                      <p style={{ fontSize:13, color:"#777", lineHeight:1.6, margin:0, fontWeight:300 }}>{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section style={{ background:C.white, padding:"60px 0 70px" }}>
        <div className="wrap">
          <h2 style={{ fontSize:22, fontWeight:700, color:C.black, marginBottom:8, textAlign:"center", letterSpacing:".5px" }}>How It Works</h2>
          <p style={{ fontSize:14, color:"#888", textAlign:"center", marginBottom:40, fontWeight:300 }}>From Japan to your doorstep in four simple steps</p>
          <div className="process-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0 }}>
            {[
              {n:"01", t:"Browse & Select", d:"Search our inventory with filters for make, model, year, and budget.", ic:Search},
              {n:"02", t:"Inquire & Confirm", d:"Get full inspection report, photos, and FOB quote from your advisor.", ic:FileCheck},
              {n:"03", t:"Pay & Ship", d:"Complete payment via bank transfer. We handle export paperwork and freight.", ic:Anchor},
              {n:"04", t:"Receive at Port", d:"Track your shipment. Collect your vehicle at the destination port.", ic:Truck},
            ].map(({n,t,d,ic:Ic},i)=>(
              <div key={i} style={{
                padding:"32px 28px",
                borderRight: i<3 ? `1px solid ${C.border}` : "none",
                position:"relative",
              }}>
                <span style={{ fontSize:11, fontWeight:600, color:C.cyan, letterSpacing:"1px", display:"block", marginBottom:14 }}>STEP {n}</span>
                <div style={{
                  width:42, height:42, background:C.light,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  marginBottom:16,
                }}>
                  <Ic size={18} color={C.primary} strokeWidth={1.5}/>
                </div>
                <h3 style={{ fontSize:15, fontWeight:600, color:C.black, marginBottom:8 }}>{t}</h3>
                <p style={{ fontSize:13, color:"#777", lineHeight:1.65, margin:0, fontWeight:300 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ RECENTLY ADDED ═══ */}
      <section style={{ background:C.light, padding:"60px 0 70px" }}>
        <div className="wrap">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:32 }}>
            <h2 style={{ fontSize:22, fontWeight:700, color:C.black, letterSpacing:".5px" }}>Recently Added</h2>
            <a href="#" style={{ color:C.primary, fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:6 }}>
              Browse All <ArrowRight size={14}/>
            </a>
          </div>
          <div className="g4" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18 }}>
            {RECENT.map(c=><Card key={c.id} car={c}/>)}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section style={{ background:C.primary, padding:"60px 0 70px" }}>
        <div className="wrap" style={{ maxWidth:700, textAlign:"center" }}>
          <h2 style={{ fontSize:22, fontWeight:700, color:C.white, marginBottom:40, letterSpacing:".5px" }}>What Our Clients Say</h2>
          <div style={{ position:"relative", minHeight:180 }}>
            {REVIEWS.map((r,i)=>(
              <div key={i} style={{
                position: i===aT ? "relative" : "absolute",
                top:0, left:0, right:0,
                opacity: i===aT ? 1 : 0,
                transition:"opacity .6s ease",
                pointerEvents: i===aT ? "auto" : "none",
              }}>
                <div style={{ display:"flex", justifyContent:"center", gap:3, marginBottom:20 }}>
                  {[...Array(r.stars)].map((_,j)=><Star key={j} size={16} color="#f0c040" fill="#f0c040"/>)}
                </div>
                <p style={{
                  fontSize:16, fontWeight:300, fontStyle:"italic",
                  color:"rgba(255,255,255,.85)", lineHeight:1.8,
                  maxWidth:500, margin:"0 auto 24px",
                }}>"{r.text}"</p>
                <div style={{ fontSize:14, fontWeight:600, color:C.white }}>{r.name}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,.4)", fontWeight:400, marginTop:2 }}>{r.from}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:28 }}>
            {REVIEWS.map((_,i)=>(
              <button key={i} onClick={()=>setAT(i)} style={{
                width: i===aT ? 20 : 8, height:8, border:"none",
                background: i===aT ? C.cyan : "rgba(255,255,255,.2)",
                cursor:"pointer", transition:"all .3s ease-out",
              }}/>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{ background:C.white, padding:"60px 0" }}>
        <div className="wrap">
          <div className="cta-inner" style={{
            background:C.light, padding:"40px 48px",
            display:"flex", justifyContent:"space-between", alignItems:"center",
            gap:24, flexWrap:"wrap",
            borderLeft:`4px solid ${C.primary}`,
          }}>
            <div>
              <h2 style={{ fontSize:20, fontWeight:700, color:C.black, marginBottom:6 }}>Can't find what you're looking for?</h2>
              <p style={{ fontSize:14, color:"#777", margin:0, fontWeight:300 }}>We source vehicles directly from Japanese auctions on your behalf.</p>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <a href="#" style={{
                background:C.primary, color:C.white, padding:"12px 28px",
                fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:8,
                letterSpacing:".5px", transition:"background .3s ease-out",
              }}
                onMouseEnter={e=>e.currentTarget.style.background=C.deep}
                onMouseLeave={e=>e.currentTarget.style.background=C.primary}
              ><MessageCircle size={15}/> Contact Us</a>
              <a href="#" style={{
                background:C.white, color:C.primary, padding:"12px 28px",
                fontSize:13, fontWeight:600, border:`1px solid ${C.border}`,
                letterSpacing:".5px", transition:"border-color .3s ease-out",
              }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.primary}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}
              >WhatsApp</a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background:C.deep, padding:"50px 0 0", color:"rgba(255,255,255,.5)", fontSize:13 }}>
        <div className="wrap">
          <div className="fg" style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1.5fr", gap:40, paddingBottom:40, borderBottom:"1px solid rgba(255,255,255,.06)" }}>
            <div>
              <div style={{ fontSize:18, fontWeight:700, color:C.white, letterSpacing:"2px", marginBottom:16 }}>DESTINO</div>
              <p style={{ lineHeight:1.8, marginBottom:20, fontWeight:300, maxWidth:280 }}>
                Premium Japanese vehicle export since 1995.
                Quality inspected and delivered worldwide.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:8, fontSize:12 }}>
                <span style={{ display:"flex", alignItems:"center", gap:8 }}><MapPin size={13} color={C.muted}/> Tsuzuki-ku, Yokohama, Kanagawa</span>
                <span style={{ display:"flex", alignItems:"center", gap:8 }}><Phone size={13} color={C.muted}/> +81-45-949-6777</span>
                <span style={{ display:"flex", alignItems:"center", gap:8 }}><Mail size={13} color={C.muted}/> export@destino.jp</span>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize:12, color:C.white, letterSpacing:"1px", textTransform:"uppercase", fontWeight:600, marginBottom:18, background:"rgba(255,255,255,.06)", padding:"6px 10px", display:"inline-block" }}>Navigate</h4>
              {["Home","Stock List","About Us","Delivered Cars","Contact"].map((l,i)=>(
                <a key={i} href="#" style={{ display:"block", color:"rgba(255,255,255,.4)", fontSize:13, padding:"4px 0", fontWeight:300, transition:"color .3s ease-out" }}
                  onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,.75)"}
                  onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.4)"}
                >{l}</a>
              ))}
            </div>
            <div>
              <h4 style={{ fontSize:12, color:C.white, letterSpacing:"1px", textTransform:"uppercase", fontWeight:600, marginBottom:18, background:"rgba(255,255,255,.06)", padding:"6px 10px", display:"inline-block" }}>Popular</h4>
              {["Toyota","Honda","Nissan","BMW","Mercedes-Benz","Lexus"].map((m,i)=>(
                <a key={i} href="#" style={{ display:"block", color:"rgba(255,255,255,.4)", fontSize:13, padding:"4px 0", fontWeight:300, transition:"color .3s ease-out" }}
                  onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,.75)"}
                  onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.4)"}
                >{m}</a>
              ))}
            </div>
            <div>
              <h4 style={{ fontSize:12, color:C.white, letterSpacing:"1px", textTransform:"uppercase", fontWeight:600, marginBottom:18, background:"rgba(255,255,255,.06)", padding:"6px 10px", display:"inline-block" }}>Hours</h4>
              <div style={{ lineHeight:2.2, fontWeight:300 }}>
                <div style={{ display:"flex", justifyContent:"space-between", maxWidth:220 }}>
                  <span>Tue – Sat</span><span style={{ color:"rgba(255,255,255,.6)" }}>10:00 – 19:00</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", maxWidth:220 }}>
                  <span>Sun & Holidays</span><span style={{ color:"rgba(255,255,255,.6)" }}>10:00 – 18:00</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", maxWidth:220 }}>
                  <span>Monday</span><span style={{ color:"rgba(255,255,255,.3)" }}>Closed</span>
                </div>
              </div>
              <div style={{ marginTop:20, display:"flex", gap:8 }}>
                {["YouTube","Instagram","Facebook"].map((s,i)=>(
                  <a key={i} href="#" style={{
                    padding:"6px 12px", border:"1px solid rgba(255,255,255,.08)",
                    color:"rgba(255,255,255,.35)", fontSize:11, fontWeight:400,
                    transition:"all .3s ease-out",
                  }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.2)";e.currentTarget.style.color="rgba(255,255,255,.6)"}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.08)";e.currentTarget.style.color="rgba(255,255,255,.35)"}}
                  >{s}</a>
                ))}
              </div>
            </div>
          </div>
          <div style={{ padding:"20px 0", textAlign:"center", fontSize:11, color:"rgba(255,255,255,.2)", fontWeight:300 }}>
            © {new Date().getFullYear()} DESTINO Corporation. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
