const hbs = require('nodemailer-express-handlebars')
const nodemailer = require('nodemailer')
const path = require('path')
require("dotenv").config();

// initialize nodemailer
var transporter = nodemailer.createTransport(
    {
        service: 'hotmail',
        auth:{
            user: process.env.MAIL_ADDRESS,
            pass: process.env.MAIL_PASSWORD
        }
    }
);

// point to the template folder
const handlebarOptions = {
    viewEngine: {
        partialsDir: path.resolve('./email_templates/'),
        defaultLayout: false,
    },
    viewPath: path.resolve('./email_templates/'),
};

// use a template file with nodemailer
transporter.use('compile', hbs(handlebarOptions));

module.exports = transporter;