import React, { useState } from "react";
import axios from 'axios';
import '../styles/contacts.css';
import defaultAvatar from '../images/default_avatar.png';


function Contacts() {
    
    const [data, setData] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [incomingData, setIncomingData] = useState([]);
    const [outgoingData, setOutgoingData] = useState([]);
    const [blockedData, setBlockedData] = useState([]);


    const api = axios.create({
      baseURL: "https://parlons-2977b2cfefba.herokuapp.com/api",
      withCredentials: true,
    });

    const handleChangeSearch = (e) => {
      e.preventDefault();
      setSearchInput(e.target.value);
    };


    function fetchData() {

      api.get('/contacts/all?type=friends')
        .then((response) => {
          setData(response.data.users.length !== 0 ? response.data.users : []);
        })
        .catch((error) => {
          console.log(error);
          alert("Error. " +error.response.data.message);
        });

        api.get('/contacts/all?type=incoming')
        .then((response) => {
          setIncomingData(response.data.users.length !== 0 ? response.data.users : []);
        })
        .catch((error) => {
          console.log(error);
          alert("Error. " + error.response.data.message);
        });

        api.get('/contacts/all?type=outgoing')
        .then((response) => {
          setOutgoingData(response.data.users.length !== 0 ? response.data.users : []);
        })
        .catch((error) => {
          console.log(error);
          alert("Error. " + error.response.data.message);
        });

        api.get('/contacts/all?type=blocked')
        .then((response) => {
          setBlockedData(response.data.users.length !== 0 ? response.data.users : []);
        })
        .catch((error) => {
          console.log(error);
          alert("Error. " + error.response.data.message);
        });
      }

    React.useEffect(() => 
    {
      fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    function searchForUsers() {
      api.get('/contacts/search/' + searchInput)
        .then((response) => {
          setSearchResults(response.data.users.length !== 0 ? response.data.users : []);
          console.log(searchResults);
        })
        .catch((error) => {
          console.log(error);
          alert("Error. " + error.response.data.message);
        });
    }

    function sendRequest(username) {
      const userData = {
        friendUsername: username,
      };
      api.post('/contacts/friend', userData)
        .then((response) => {
          if (Object.keys(response.data).length !== 0) {
            const updatedSearchResults = searchResults.filter(user => user.username !== username);
            setSearchResults(updatedSearchResults);
            fetchData();
          } else {
            console.log("Send did not work");
          }
        })
        .catch((error) => {
          console.log(error);
          alert("Error. " + error.response.data.message);
        });
    }
    
    async function rescindRequest(username) {
      api.delete(`/contacts/friend/${username}?type=outgoing`)
        .then((response) => {
          fetchData();
          console.log("Request rescinded successfully");
        })
        .catch((error) => {
          console.log(error);
          alert("Error. " + error.response.data.message);
        });
    }
    
    async function acceptRequest(username) {
      api.patch(`/contacts/friend/${username}?action=accept`)
      .then((response) => {
        Object.keys(response.data).length !== 0 ? fetchData(): console.log("accept didnt worked");
      })
      .catch((error) => {
        console.log(error);
        alert("Error. " +error.response.data.message);
      });
    }

    async function declineRequest(username) {
      api.delete(`/contacts/friend/${username}?type=incoming`)
      .then((response) => {
        Object.keys(response.data).length !== 0 ? fetchData(): console.log("decline didnt worked");
      })
      .catch((error) => {
        console.log(error);
        alert("Error. " +error.response.data.message);
      });
    }

    async function removeFromContacts(username) {
      api.delete(`/contacts/friend/${username}?type=friends`)
        .then((response) => {
          Object.keys(response.data).length !== 0 ? fetchData() : console.log("Remove didn't work");
        })
        .catch((error) => {
          console.log(error);
          alert("Error. " + error.response.data.message);
        });
    }
    
    async function block(username) {
      api.put(`/contacts/friend/${username}`)
        .then((response) => {
          Object.keys(response.data).length !== 0 ? fetchData() : console.log("Block didn't work");
        })
        .catch((error) => {
          console.log(error);
          alert("Error. " + error.response.data.message);
        });
    }

    async function unblock(username) {
      api.delete(`/contacts/friend/${username}?type=blocked`)
      .then((response) => {
        Object.keys(response.data).length !== 0 ? fetchData(): console.log("unblock didnt worked");
      })
      .catch((error) => {
        console.log(error);
        alert("Error. " +error.response.data.message);
      });
    }

    return (
      <div className="App">
        <h1>Contacts Page</h1>
        <div className="section">
          <input type="search" placeholder="search for user" onChange={handleChangeSearch} value={searchInput} />
          <button className="searchButton" type="button" onClick={searchForUsers}>Search</button>
          {searchResults.length === 0 ? (
            <p>No Search Results</p>
          ) : (
            <ul>
              {searchResults.map((user) => (
                <li key={user.id}>
                  <img className="profile-image"
                    src={defaultAvatar} 
                    alt={`${user.name}'s profile`} 
                  />
                  {user.name} &nbsp;
                  <button onClick={() => sendRequest(user.username)}>Add Friend</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="section">
        <p>Contacts</p>
          {data.length === 0 ? (
            <p>No contacts</p>
          ) : (
            <ul>
              {data.map((user) => (
                <li key={user.id}>
                    <img className="profile-image"
                      src={defaultAvatar} 
                      alt={`${user.name}'s profile`} 
                    />
                    {user.name} &nbsp;
                    <button onClick={() => removeFromContacts(user.username)}>Remove Friend</button>
                    <button onClick={() => block(user.username)}>Block</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="section">
        <p>Incoming Requests</p>
          {incomingData.length === 0 ? (
            <p>No incoming friend requests</p>
          ) : (
            <ul>
              {incomingData.map((user) => (
                <li key={user.id}>
                  <img className="profile-image"
                    src={defaultAvatar} 
                    alt={`${user.name}'s profile`} 
                  />
                  {user.name} &nbsp;
                  <button onClick={() => acceptRequest(user.username)}>Accept</button>
                  <button onClick={() => declineRequest(user.username)}>Decline</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="section">
        <p>Outgoing Requests</p>
          {outgoingData.length === 0 ? (
            <p>No outgoing friend requests</p>
          ) : (
            <ul>
              {outgoingData.map((user) => (
                <li key={user.id}>
                  <img className="profile-image"
                    src={defaultAvatar} 
                    alt={`${user.name}'s profile`} 
                  />
                  {user.name} &nbsp;
                  <button onClick={() => rescindRequest(user.username)}>Cancel</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="section">
        <p>Blocked Contacts</p>
          {blockedData.length === 0 ? (
            <p>No blocked contacts</p>
          ) : (
            <ul>
              {blockedData.map((user) => (
                <li key={user.id}>
                  <img className="profile-image"
                    src={defaultAvatar} 
                    alt={`${user.name}'s profile`} 
                  />
                  {user.name} &nbsp;
                  <button onClick={() => unblock(user.username)}>Unblock</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  };
  
  export default Contacts