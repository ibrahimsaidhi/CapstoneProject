import React, { useState } from "react";
import axios from 'axios';
import '../styles/contacts.css';
import { FaUser } from 'react-icons/fa';


//Page that will display the user contacts. Temp code added for now just to test contacts backend, will be replaced soon
function Contacts() {
    
    const [data, setData] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [contactUsername, setContactUsername] = useState("");
    const [incomingData, setIncomingData] = useState(null);
    const [outgoingData, setOutgoingData] = useState(null);
    const [blockedData, setBlockedData] = useState(null);


    const api = axios.create({
      baseURL: "http://localhost:5000/api",
      withCredentials: true,
    });

    const handleChangeSearch = (e) => {
      e.preventDefault();
      setSearchInput(e.target.value);
    };

    const handleChangeContactUsername = (e) => {
      e.preventDefault();
      setContactUsername(e.target.value);
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
          Object.keys(response.data.users).length !== 0 ? setIncomingData(JSON.stringify(response.data.users)) : setIncomingData("No incoming request");
        })
        .catch((error) => {
          console.log(error);
          alert("Error. " +error.response.data.message);
        });


        api.get('/contacts/all?type=outgoing')
        .then((response) => {
          Object.keys(response.data.users).length !== 0 ? setOutgoingData(JSON.stringify(response.data.users)) : setOutgoingData("No outgoing friend requests");
        })
        .catch((error) => {
          console.log(error);
          alert("Error. " +error.response.data.message);
        });


        api.get('/contacts/all?type=blocked')
        .then((response) => {
          Object.keys(response.data.users).length !== 0 ? setBlockedData(JSON.stringify(response.data.users)) : setBlockedData("No blocked contacts");
        })
        .catch((error) => {
          console.log(error);
          alert("Error. " +error.response.data.message);
        });
      }

    React.useEffect(() => 
    {
      fetchData();
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
        Object.keys(response.data).length !== 0 ? fetchData() : console.log("send didnt worked");
      })
      .catch((error) => {
        console.log(error);
        alert("Error. " +error.response.data.message);
      });
    }


    async function resendRequest() {
      api.delete('/contacts/friend/'+contactUsername+'?type=outgoing')
      .then((response) => {
        Object.keys(response.data).length !== 0 ? fetchData(): console.log("Rescind didnt worked");
      })
      .catch((error) => {
        console.log(error);
        alert("Error. " +error.response.data.message);
      });
    }

    async function acceptRequest() {
      api.patch('/contacts/friend/'+contactUsername+'?action=accept')
      .then((response) => {
        Object.keys(response.data).length !== 0 ? fetchData(): console.log("accept didnt worked");
      })
      .catch((error) => {
        console.log(error);
        alert("Error. " +error.response.data.message);
      });
    }

    async function declineRequest() {
      api.delete('/contacts/friend/'+contactUsername+'?type=incoming')
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

    async function unblock() {
      api.delete('/contacts/friend/'+contactUsername+'?type=blocked')
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
          {!searchResults ? (
            <p>No Search Results</p>
          ) : (
            <ul>
              {searchResults.map((user) => (
                <li key={user.id}>
                  <FaUser /> {user.name}
                  <button onClick={() => sendRequest(user.name)}>Add Friend</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="section">
          <input type="search" placeholder="box to enter username for all non search operations" onChange={handleChangeContactUsername} value={contactUsername} />
          <button type="button" onClick={sendRequest}>send request</button>
          <button type="button" onClick={resendRequest}>resend request</button>
          <button type="button" onClick={acceptRequest}>accept request</button>
          <button type="button" onClick={declineRequest}>decline request</button>
          <button type="button" onClick={removeFromContacts}>remove friend</button>
          <button type="button" onClick={block}>block</button>
          <button type="button" onClick={unblock}>unblock</button>
        </div>
        <div className="section">
        <p>Contacts</p>
          {data.length === 0 ? (
            <p>No contacts</p>
          ) : (
            <ul>
              {data.map((user) => (
                <li key={user.id}>
                  <FaUser /> {user.name}
                  <button onClick={() => removeFromContacts(user.username)}>Remove Friend</button>
                  <button onClick={() => block(user.username)}>Block</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="section">
          {!incomingData ? <p> loading all incoming requests </p> : <div> <p> Incoming: </p> <ul>{incomingData}</ul> </div>}
        </div>
        <div className="section">
          {!outgoingData ? <p> loading all outgoing requests </p> : <div> <p> Outgoing: </p> <ul>{outgoingData}</ul> </div>}
        </div>
        <div className="section">
          {!blockedData ? <p> loading all blocked contacts </p> : <div> <p> Blocked: </p> <ul>{blockedData}</ul> </div>}
        </div>
      </div>
    );
  };
  
  export default Contacts