import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import '../styles/Profile.css';
import defaultAvatar from "../images/default_avatar.png";

function Profile() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState('');
    const [username, setUsername] = useState('')
    const [passwordType, setPasswordType] = useState("password");
    const [profileImage, setProfileImage] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [formData, setFormData] = useState({userId: userId, password: password, newPassword: newPassword});
    const [file, setFile] = useState();
    const [open, setOpen] = useState(false);
    const [imageOpen, setImageOpen] = useState(false);

    const api = axios.create({
        baseURL: "http://localhost:5000/api",
        withCredentials: true,  
    });
      
    useEffect(() => {
        getUser();
    }, [userId, username, password, profileImage]);

    const getUser = async () => {
        try {
            const api = await axios.get("http://localhost:5000/api/profile/details", {withCredentials: true}  );
            setUserId(api.data.userId);
            setUsername(api.data.username);
            setPassword(api.data.password);
            if (api?.data?.picture !== "/path/pic1") {
                setProfileImage(`http://localhost:5000/profileUploads/${api.data.picture}`);
            } else {
                setProfileImage(defaultAvatar);
            }
        } catch (error){
            console.error("Error: Cannot fetch user details: ", error);
        }
    };

    function showPassword() {
        if (passwordType === "password") {
          setPasswordType("text")
        } else {
          setPasswordType("password")
        }
    }
    function isPlaintextPasswordInvalid(password){
        if((password.length >= 8) && (/[A-Z]/.test(password)) && (/[a-z]/.test(password)) && (/[0-9]/.test(password)) 
            && (/[!@#$%^&*()\-+={}[\]:;"'<>,.?|\\]/.test(password))){
            return false; 
        }
        else{
            return true;
        } 
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const p = document.getElementById("new-password").value;
        setNewPassword(p);
        const o = document.getElementById("old-password").value;
        if (!isPlaintextPasswordInvalid(p)){
            setFormData({userId: userId, password: o, newPassword: p});
            api.put('/profile/updatePassword', formData)
            .then((response) => {
                console.log(formData);
                alert("Password updated! Please login again...");
                navigate('../login');
            })
            .catch((error) => {
                alert(error.response.data.error);
                document.getElementById("old-password").value = "";
                document.getElementById("new-password").value = "";
                console.log(error);
            });
        }
        else {
            alert("Password must be at least 8 characters and must include at least one upper-case letter, one lower-case letter, one numerical digit and one special character.");
            document.getElementById("old-password").value = "";
            document.getElementById("new-password").value = "";
        }
    };

    const handleChange = (event) => {
        const old = document.getElementById("old-password").value;
        setFormData({userId: userId, password: old, newPassword: event.target.value});
    };

    const handleFile = (e) => {
        setFile(e.target.files[0]);
    }

    const handleUpload = (e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append('file', file);
        console.log(fd.getAll('file'));
        if (file.type.split('/')[0] === 'image'){
            console.log("About to send...");
            api.post('/profile/updateImage', fd)
            .then((response) => {
                alert("Profile Image updated!");
            })
            .catch((error) => {
                console.log(error);
            });
        }
        else {
            alert("Not an image type, please try again")
        }
        
    }
    
    return <div className="profile-container">
        <div className="image-container">
            <img className="profile-pic" src={profileImage} alt="Profile Avatar"/>
            <p>Username: {username}</p>
            <br/>
            <button onClick={() => setImageOpen(!imageOpen)}>Change Profile Avatar</button>
            {imageOpen && <form>
                <label for="myfile">Select a file:</label>
                <input className='file' type="file" id="myfile" name="myfile" onChange={handleFile}></input>
                <input className='handle-submit' type="submit" value="Save Avatar" onClick = {handleUpload}/>
            </form>}
        </div>
        <div className='password-container'>
            <button onClick={() => setOpen(!open)}>Change Password</button>
            {open && <form onSubmit={handleSubmit}>
                <label for="old-password">Enter Old Password: </label>
                <input type={passwordType} id="old-password" name="old-password" placeholder="Password"/><br/> 
                <br/>
                <label for="old-password">Enter New Password: </label>
                <input type={passwordType} id="new-password" name="new-password" placeholder="Password"  onChange={handleChange} required/><br/> 
                <br/>
                <input type="checkbox" onChange={() => showPassword()} id="checkbox" name="checkbox" value="showPassword"/>
                <label htmlFor="showPassword"> Show Password</label> <br/>
                <br/>
                <input className='handle-submit' type="submit" value="Save New Password"/>
            </form>}
        </div>
    </div>
}
export default Profile;