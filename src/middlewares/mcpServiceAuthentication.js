import { OAuth2Client } from "google-auth-library";
import { ErrorClass } from "../utils/errorClass.util.js";
import dotenv from "dotenv";

dotenv.config();

const client = new OAuth2Client();
const BACKEND_AUDIENCE = process.env.MCP_BACKEND_AUDIENCE;

/**
 * Middleware to authenticate MCP service calls using a Google OIDC identity token.
 * Expects header: "authentication-service: Bearer <token>"
 */
export const mcpServiceAuthentication = async (req, res, next) => {
  try {
    if (!BACKEND_AUDIENCE) {
      throw new ErrorClass(
        "MCP_BACKEND_AUDIENCE is not configured",
        500,
        null,
        "mcpServiceAuthentication"
      );
    }
    const authHeader = req.headers["authentication-service"];
    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Missing or malformed token" });
    }

    const token = authHeader.split(" ")[1];

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: BACKEND_AUDIENCE,
    });

    const payload = ticket.getPayload();
    req.serviceAccountEmail = payload.email;
    req.mcpTokenPayload = payload;
    next();
  } catch (error) {
    console.error("MCP token verification failed:", error.message);
    if (error instanceof ErrorClass && error.status === 500) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};
