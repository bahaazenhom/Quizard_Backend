// services/googleAuth.service.js
import { OAuth2Client } from "google-auth-library";
import User from "../../models/user.model.js";
import { generateAccessToken } from "../../utils/jwt.util.js";

/**
 * Google Authentication Service
 * Handles Google OAuth token verification and user management
 */
class GoogleAuthService {
  client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  /**
   * Verify Google ID token and extract user information
   * @param {string} token - Google ID token from client
   * @returns {Object} Verified user payload
   * @throws {Error} If token verification fails
   */
  async verifyGoogleToken(token) {
    try {
      // Check if token is an access token (has different segment count)
      const segments = token.split(".").length;
      if (segments !== 3) {
        throw new Error(
          "Invalid token format. Expected Google ID Token (from id_token), not access token. " +
            "Ensure frontend uses 'id_token' from Google OAuth response, not 'access_token'."
        );
      }

      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      return {
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        photoURL: payload.picture,
        isConfirmed: payload.email_verified,
        googleId: payload.sub,
      };
    } catch (error) {
      throw new Error("Invalid Google token: " + error.message);
    }
  }

  /**
   * Find or create user from Google authentication
   * @param {Object} googleUserData - User data from Google
   * @returns {Object} User document and isNewUser flag
   */
  async findOrCreateUser(googleUserData) {
    let user = await User.findOne({ email: googleUserData.email });
    let isNewUser = false;

    if (!user) {
      // Create new user with random password (won't be used for Google login)
      const randomPassword =
        Math.random().toString(36).slice(-12) +
        Math.random().toString(36).slice(-12);

      user = await User.create({
        firstName: googleUserData.firstName,
        lastName: googleUserData.lastName,
        email: googleUserData.email,
        password: randomPassword,
        photoURL: googleUserData.photoURL,
        isConfirmed: googleUserData.isConfirmed,
        isActive: true,
        role: "user",
      });

      isNewUser = true;
    } else {
      // Update existing user's photo if needed
      if (googleUserData.photoURL && !user.photoURL) {
        user.photoURL = googleUserData.photoURL;
        await user.save();
      }

      // Activate account if not active
      if (!user.isActive) {
        user.isActive = true;
        await user.save();
      }
    }

    return { user, isNewUser };
  }

  /**
   * Generate JWT token for authenticated user
   * @param {Object} user - User document
   * @returns {string} JWT token
   */

  /**
   * Complete Google authentication process
   * @param {string} googleToken - Google ID token
   * @returns {Object} Authentication result with user and token
   */
  async authenticateWithGoogle(googleToken) {
    // Verify Google token
    const googleUserData = await this.verifyGoogleToken(googleToken);

    // Find or create user
    const { user, isNewUser } = await this.findOrCreateUser(googleUserData);

    // Generate JWT token
    const token = generateAccessToken({ userId: user._id });

    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;

    return {
      user: userObject,
      token,
      isNewUser,
      message: isNewUser ? "Account created successfully" : "Login successful",
    };
  }
}

export default new GoogleAuthService();
