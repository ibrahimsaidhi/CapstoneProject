import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import axios from 'axios';
import '../styles/Profile.css';

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
    const [uploadedFilePath, setUploadedFilePath] = useState(null);
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
            setProfileImage(api.data.picture);
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

    const handleSubmit = (event) => {
        event.preventDefault();
        const p = document.getElementById("new-password").value;
        setFormData({userId: userId, password: password, newPassword: p});
        api.put('/profile/updatePassword', formData)
            .then((response) => {
                console.log(formData);
                alert("Password updated! Please login again...");
                navigate('../login');
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({userId: userId, password: password, newPassword: value});
    };

    const handleFile = (e) => {
        setFile(e.target.files[0]);
    }

    const handleUpload = (e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append('file', file);
        console.log(fd.getAll('file'));
        if (file.type.split('/')[0] == 'image'){
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
            <img className="profile-pic" src={`http://localhost:5000/profileUploads/` + profileImage} alt="Profile Picture"/>
            <p>Change Profile Picture?</p>
            <button onClick={() => setImageOpen(!imageOpen)}>Change</button>
            {imageOpen && <form>
                <label for="myfile">Select a file:</label>
                <input type="file" id="myfile" name="myfile" onChange={handleFile}></input>
                <input type="submit" value="Change Profile Picture" onClick = {handleUpload}/>
            </form>}
        </div>
        <div>
            <p>Username: {username}</p>
            <p>Change Password?</p>
            <button onClick={() => setOpen(!open)}>Change</button>
            {open && <form onSubmit={handleSubmit}>
                <label for="old-password">Enter Old Password: </label>
                <input type={passwordType} id="old-password" name="old-password" placeholder="Password"/><br/> 
                <label for="old-password">Enter New Password: </label>
                <input type={passwordType} id="new-password" name="new-password" placeholder="Password"  onChange={handleChange} required/><br/> 
                <input type="checkbox" onChange={() => showPassword()} id="checkbox" name="checkbox" value="showPassword"/>
                <label htmlFor="showPassword"> Show Password</label> <br/>
                <input type="submit" value="Change Password"/>
            </form>}
        </div>
    </div>
}
export default Profile;