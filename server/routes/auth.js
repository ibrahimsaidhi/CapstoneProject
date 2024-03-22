const express = require("express");
const {login, registration, logout, refreshAccessToken, activation, resendActivation, forgotPassword, changeForgottenPassword} = require("../controller/authController");


  // Add routes for register and logout
    
const router = express.Router();

router.post("/login", login);
router.post("/registration", registration);
router.post("/logout", logout);
router.post("/refreshAccessToken", refreshAccessToken);
router.patch("/activation", activation);
router.post("/resend-activation", resendActivation);
router.post("/forgot-password", forgotPassword);
router.post("/change-forgotten-password", changeForgottenPassword);

module.exports = router;