const passport = require("passport");
const { User } = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { validateUserCredentials } = require("../../../utils/validations");
const cloudinary = require("cloudinary").v2;

const userData = async (req, res) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token found" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("Decoded Token:", decoded); // Log decoded data

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("JWT Error:", error.message); // Log JWT error
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};


const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide email and password"
        });
      }
  
      const user = await User.findOne({ email }).select('+password');
  
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }
  
      const isPasswordMatch = await user.matchPassword(password);
  
      if (!isPasswordMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }
  
      const token = await user.generateToken();
  
      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      };
      const { password: _, ...userWithOutPassword } = user.toObject();

      res.status(200).cookie("token", token, options).json({
        success: true,
        message: "Logged in successfully",
        token,
        user: userWithOutPassword,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

const logoutUser = async (req, res) => {
    try {
      const { token } = req.cookies;
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Not logged in",
        });
      }

      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      };

      res.clearCookie("token", options);
      res.status(200).json({
        success: true,
        message: "Founder logged out successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        
        // Validate user input
        const validation = validateUserCredentials({ name, email, password });
        if (!validation.isValid) {
          return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: validation.errors
          });
        }
        
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
          return res.status(404).json({
            success: false,
            message: "Email already in use for a founder or an investor",
          });
        }
        
        // Create user with validated data
        user = await User.create({
          name,
          email,
          password,
          role : "enthusiast"
        });
        await user.save();

        const token = await user.generateToken();
    
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        };
        const userResponse = user.toObject();
        delete userResponse.password;
    
        res.status(201).cookie("token", token, options).json({
          success: true,
          message: "User registered successfully",
          token,
          user: userResponse
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
    }
}   

// Google OAuth Routes
// Route - /api/auth/google?redirect=/xyz

/*

for frontend 
const loginWithGoogle = () => {
  const currentURL = window.location.pathname;
  window.location.href = `/api/auth/google/login?redirect=${encodeURIComponent(currentURL)}`;
};

*/

const googleOAuthLogin = async (req, res, next) => {
  const redirectTo = req.query.redirect || "/"; // Default to home page if no redirect is provided

  // Store the redirect URL in the session
  req.session.redirectTo = redirectTo;
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
};

const googleOAuthCallback = async (req, res, next) => {
  passport.authenticate(
    "google",
    { failureRedirect: "/login", session: false },
    async (err, user) => {
      try {
        if (err || !user) {
          return res.status(401).json({
            success: false,
            message: "Authentication failed",
          });
        }

        const token = await user.generateToken();
        const options = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        };

        const { password: _, ...userWithoutPassword } = user.toObject();
        
        // Get redirect URL from session
        const redirectTo = req.session.redirectTo || "/";

        // Clear session variable
        delete req.session.redirectTo;
        res
          .status(200)
          .cookie("token", token, options)
          .redirect(process.env.FRONTEND_URL + redirectTo);
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    }
  )(req, res, next);
};



const editData = async (req, res) => {
  try {
    const userId = req.user.id;
    let updates = { ...req.body };

    // Prevent updating email or password directly
    delete updates.email;
    delete updates.password;

  
    if (req.files?.profileImage) {
      updates.profileImg = req.files.profileImage[0].path;
    }

    if (req.files?.coverImage) {
      updates.coverImg = req.files.coverImage[0].path;
    }
  
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  userData,
  loginUser,
  logoutUser,
  registerUser,
  googleOAuthLogin,
  googleOAuthCallback,
  editData,
};