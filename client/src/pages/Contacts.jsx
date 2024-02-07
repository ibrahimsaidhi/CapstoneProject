import React, { useState } from "react";
import axios from 'axios';
import '../styles/contacts.css';


//Page that will display the user contacts. Temp code added for now just to test contacts backend, will be replaced soon
function Contacts() {
    
    const [data, setData] = useState(null);
    const [searchResults, setSearchResults] = useState(null);
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
          Object.keys(response.data.users).length !== 0 ? setData(JSON.stringify(response.data.users)) : setData("No contacts");
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
      api.get('/contacts/search/'+searchInput)
      .then((response) => {
        Object.keys(response.data.users).length !== 0 ? setSearchResults(JSON.stringify(response.data.users)) : setSearchResults("No user with that name");
      })
      .catch((error) => {
        console.log(error);
        alert("Error. " +error.response.data.message);
      });
    }

    function sendRequest() {
      const userData = {
        friendUsername: contactUsername,
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


    async function rescindRequest() {
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

    async function removeFromContacts() {
      api.delete('/contacts/friend/'+contactUsername+'?type=friends')
      .then((response) => {
        Object.keys(response.data).length !== 0 ? fetchData(): console.log("Remove didnt worked");
      })
      .catch((error) => {
        console.log(error);
        alert("Error. " +error.response.data.message);
      });
    }

    async function block() {
      api.put('/contacts/friend/'+contactUsername)
      .then((response) => {
        Object.keys(response.data).length !== 0 ? fetchData(): console.log("block didnt worked");
      })
      .catch((error) => {
        console.log(error);
        alert("Error. " +error.response.data.message);
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


    return  <div className="App">
              <h1>Contacts Page</h1>
              <input type="search" placeholder="search for user" onChange={handleChangeSearch} value={searchInput} />
              <button class="searchButton" type="button" onClick={searchForUsers}>Search</button>
              {!searchResults ? <p> No Search </p> : <div> <p> search results: </p> <ul>{searchResults}</ul> </div>} 
              <input type="search" placeholder="box to enter username for all non search operations" onChange={handleChangeContactUsername} value={contactUsername} />
              <button  type="button" onClick={sendRequest}>send request</button>
              <button  type="button" onClick={rescindRequest}>rescind request</button>
              <button  type="button" onClick={acceptRequest}>accept request</button>
              <button  type="button" onClick={declineRequest}>decline request</button>
              <button  type="button" onClick={removeFromContacts}>remove friend</button>
              <button  type="button" onClick={block}>block</button>
              <button  type="button" onClick={unblock}>unblock</button>
              {!data ? <p> loading all contacts </p> : <div> <p> Contact: </p> <ul>{data}</ul> </div>} 
              {!data ? <p> loading all incoming request </p> : <div> <p> incoming: </p> <ul>{incomingData}</ul> </div>} 
              {!data ? <p> loading all outgoing request </p> : <div> <p> outgoing: </p> <ul>{outgoingData}</ul> </div>} 
              {!data ? <p> loading all blocked contacts </p> : <div> <p> blocked: </p> <ul>{blockedData}</ul> </div>} 
            </div>;
  };
  
  export default Contacts