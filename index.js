const express = require("express");
const mongoose = require('mongoose');
const User = require("./user"); // Assuming `user.js` exports a Mongoose model named `User`
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const app = express();
const jwt =require("jsonwebtoken");


app.use(express.json());
app.use(cookieParser())

app.listen(3000, () => {
    console.log("Server is running fine at 3000");
    mongoose.connect('mongodb://127.0.0.1:27017/t', {
    
    }).then(() => {
        console.log("Connected to MongoDB successfully");
    }).catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });
});

app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Await the hashing process
        console.log(hashedPassword);
        const newUser = new User({ name, email, password: hashedPassword }); // Assign hashed password correctly
        await newUser.save(); // Await the save operation

        return res.send("New user created");
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).send("An error occurred while creating the user");
    }
});
 // Adjust the path as needed

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).send("No user found with this email");
        }

        // Verify the password
        const isPasswordMatch = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordMatch) {
            return res.status(401).send("Password is incorrect");
        }

        // Generate a JWT token with the user's _id in the payload
        const token = jwt.sign(
            { _id: existingUser._id }, // Include user ID in payload
            "hbghhgdghdvcvcdvvd",       // Replace with your actual secret key
            { expiresIn: '1h' }         // Token expires in 1 hour
        );

        // Set the JWT as an HttpOnly cookie
        res.cookie("token", token, {
            httpOnly: true,     // Prevents access via JavaScript
            secure: true,       // Ensures cookies are sent over HTTPS
            maxAge: 3600000     // Sets expiry to 1 hour
        });

        return res.send("User logged in successfully");
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).send("Something went wrong");
    }
});

  app.get('/profile',async(req,res)=>{
    try
    {
     const cookie= await req.cookies;
     const {token}=cookie;

    
     const decoded=await jwt.verify(token,"hbghhgdghdvcvcdvvd");
     const {_id}=decoded;
     console.log(_id)
     console.log( await User.findById(_id));
    
     return res.send(`results 
        ${await User.findById(_id)}`)
    }catch(e)
    {
        return res.send("something went wrong");
    }
  })