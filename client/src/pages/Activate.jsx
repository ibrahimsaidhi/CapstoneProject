import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, } from 'react-router-dom';
import logo from "../images/parlons_logo.png";

function Activate() {
  const [queryParameters] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  
  const api = axios.create({
    baseURL: process.env.REACT_APP_PARLONS_URL,
    withCredentials: true,  
  });

  React.useEffect(() => 
    {
        const code = queryParameters.get("code");

        if(code)
        {
          const apiBody = {
            code: code,
          };
      
          api.patch('/auth/activation', apiBody)
            .then((response) => {
              setSuccessMessage("Success:"+response.data.message);
              setTimeout(() => navigate('/login'), 3000);
            })
            .catch((error) => {
              setErrorMessage("fail:"+error.response.data.message);
              setTimeout(() => navigate('/login'), 3000);
            });
        }
        else
        {
          navigate('/login')
        }
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


  return (
    <div className="background">
      <div className="logo">
        <img className="parlons-image"
                        src={logo} 
                        alt={'parlons'} 
        />
      </div>
      <div className="loginSquare">
        <h1>Activate</h1>
        {errorMessage && <p className="errorText">{errorMessage}</p>}
        {successMessage && <p className="successText">{successMessage}</p>}
      </div>
    </div>
  );
}

export default Activate;