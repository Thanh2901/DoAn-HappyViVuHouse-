import { useLocation, Navigate } from 'react-router-dom';
import { ACCESS_TOKEN } from '../constants/Connect';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

function OAuth2RedirectHandler() {
  const location = useLocation();

  useEffect(() => {
    const token = getUrlParameter('token');

    if (token) {
      localStorage.setItem(ACCESS_TOKEN, token);
      toast.success("Đăng nhập thành công.")
      setTimeout(() => {
        window.location.reload();
    }, 4000);
    }
  }, []);

  const getUrlParameter = (name) => {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');

    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };

  const token = getUrlParameter('token');
  const error = getUrlParameter('error');

  if (token) {
    localStorage.setItem(ACCESS_TOKEN, token);
    return <Navigate
      to={{
        pathname: "/",
        state: { from: location }
      }} />;
    
  } else {
    return <Navigate
      to={{
        pathname: "/login",
        state: { from: location },
        error: error
      }} />;
  }
}

export default OAuth2RedirectHandler;