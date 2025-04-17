import React from "react";
import Header from "../../common/Header";
import IntroCarosel from "../../common/IntroCarousel";
import Home from "../../common/Home";
import Footer from "../../common/Footer";
import { useLocation } from 'react-router-dom';

function Main(props) {
    const location = useLocation();
    
    if (location.state) {
      window.location.reload();
    }
  return (
    <>
      <Header authenticated={props.authenticated} currentUser={props.currentUser} onLogout={props.onLogout}/>
      <IntroCarosel />
      <Home />
      <Footer />
    </>
  );
}

export default Main;