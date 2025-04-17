import React from 'react'
import Sidebar from '../components/Sidebar'
import Chat from '../components/Chat'
import '../style.css'
import { UserProvider } from "../context/UserContext";
import { Navigate } from 'react-router-dom';

const Home = (props) => {
  const [messages, setMessages] = React.useState([]);
  if (!props.authenticated) {
    return <Navigate
        to={{
            pathname: "/login",
            state: { from: props.location }
        }} />;
}
  return (
    <UserProvider>
      <div className="mb-3">
        <h1 className="h3 d-inline align-middle">Tin nhắn</h1>
      </div>
      <div className="card">
        <div className="row g-0">

          <Sidebar {...props} />
          <div className="col-12 col-lg-7 col-xl-9">
          <Chat messages={messages} setMessages={setMessages} {...props} />
          </div>
        </div>
      </div>
    </UserProvider >
  )
}

export default Home