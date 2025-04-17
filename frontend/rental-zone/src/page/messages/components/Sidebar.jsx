import React from "react";
import Navbar from "./Navbar"
import Search from "./Search"
import Chats from "./Chats"
import '../style.css'

const Sidebar = (props) => {
  return (
    <>
      <div className="col-12 col-lg-5 col-xl-3 border-end list-group">

        {/* <Navbar {...props}/> */}
        <Search {...props} />

        <Chats {...props} />
      </div>
  
    </>
  );
};

export default Sidebar;
