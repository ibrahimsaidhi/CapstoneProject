import React, { useState } from "react";
import axios from 'axios';
import '../styles/contacts.css';


//Page that will display the user contacts. Temp code added for now just to test contacts backend, will be replaced soon
function Contacts() {
    
    const [data, setData] = useState(null);
    const [searchResults, setSearchResults] = useState(null);
    const [searchInput, setSearchInput] = useState("");
    const [userAdd, setUserAdd] = useState("");
    const [userRemove, setUserRemove] = useState("");

    const api = axios.create({
      baseURL: "http://localhost:5000/api",
      withCredentials: true,
    });

    const handleChangeSearch = (e) => {
      e.preventDefault();
      setSearchInput(e.target.value);
    };

    const handleChangeAdd = (e) => {
      e.preventDefault();
      setUserAdd(e.target.value);
    };

    const handleChangeRemove = (e) => {
      e.preventDefault();
      setUserRemove(e.target.value);
    };


    function fetchData() {
        api.get('/contacts/all')
        .then((response) => {
          console.log(response.data);
          Object.keys(response.data.users).length !== 0 ? setData(JSON.stringify(response.data.users)) : setData("No contacts");
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
        console.log(response.data);
        Object.keys(response.data.users).length !== 0 ? setSearchResults(JSON.stringify(response.data.users)) : setSearchResults("No user with that name");
      })
      .catch((error) => {
        console.log(error);
        alert("Error. " +error.response.data.message);
      });
      }
    
    function addToContacts() {
      const userData = {
        friendId: userAdd,
      };
      api.post('/contacts/add', userData)
      .then((response) => {
        console.log(response.data);
        Object.keys(response.data).length !== 0 ? fetchData() : console.log("Add didnt worked");
      })
      .catch((error) => {
        console.log(error);
        alert("Error. " +error.response.data.message);
      });
      }
    async function removeFromContacts() {
      const userData = {
        friendId: userRemove,
      };
      api.post('/contacts/remove', userData)
      .then((response) => {
        console.log(response.data);
        Object.keys(response.data).length !== 0 ? fetchData(): console.log("Remove didnt worked");
      })
      .catch((error) => {
        console.log(error);
        alert("Error. " +error.response.data.message);
      });
      }


    return  <div className="App">
              <h1>Contacts Page</h1>
              <input
              type="search"
              placeholder="search for user"
              onChange={handleChangeSearch}
              value={searchInput} />
              <button class="searchButton" type="button" onClick={searchForUsers}>Search</button>
              {!searchResults ? <p> No Search </p> : <div> <p> search results: </p> <ul>{searchResults}</ul> </div>} 
              <input
              type="search"
              placeholder="add contact by id"
              onChange={handleChangeAdd}
              value={userAdd} />
              <button class="addButton" type="button" onClick={addToContacts}>Add</button>
              <input
              type="search"
              placeholder="remove contact by id"
              onChange={handleChangeRemove}
              value={userRemove} />
              <button class="removeButton" type="button" onClick={removeFromContacts}>Remove</button>
              {!data ? <p> loading all contacts </p> : <div> <p> Contact: </p> <ul>{data}</ul> </div>} 
            </div>;
  };
  
  export default Contacts