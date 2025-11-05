import React from "react";
import Cta from "../components/Cta";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Intro from "../components/Intro";
import Services from "../components/Services";
import TechStack from "../components/TechStack";
import Gallery from "../components/Gallery";
import CareerSection from "../components/CareerSection";

const Home = () => {
  return (
    <>
      <Hero />
      <Intro />
      <Services />
      <TechStack />
      <Gallery />
      <CareerSection />
      <Cta />
      <Footer />
    </>
  );
};

export default Home;
