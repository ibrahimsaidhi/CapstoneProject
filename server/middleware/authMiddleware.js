const jwt = require('jsonwebtoken');

//Todo Need to be refactored into env file, with a proper hexadecimal key
const SECRET_KEY = "secretkey";

/**
 * Middleware that checks if an appropiate access token was sent during call. Also passes userId of token is passed to req
 * @param {*} req       Information about the HTTP request
 * @param {*} res       Response to the HTTP request
 * @param {*} next      next middleware after this
 */
const authenticateRoute = (req, res, next) => {
    
    //potential acessToken from client
    const token = req.cookies.accessToken;

    //Check if the accessToken was passed during the request
    if (token)
    {
        try {
            //Verifiy acessToken from client is same as one sent from server
            const data = jwt.verify(token, SECRET_KEY);

            //ensures request api will only use userId from token. Provides extra security such that havin access to token can allow for making calls for any other user
            req.userId = data.id
            next();
        } 
        catch (error) 
        {
            res.status(400).json({
                message: "Token is unauthorized",
            });
        }
    }
    else
    {
        //No accessToken was passed during api request
        res.status(401).json({
            message: "No token, you need to login again",
        });
    }

}

module.exports = authenticateRoute;