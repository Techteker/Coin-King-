import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/withdraw", (req, res) => {
    const { email, amount, method, account } = req.body;
    console.log("==========================================");
    console.log("NEW WITHDRAWAL REQUEST RECEIVED!");
    console.log(`User: ${email}`);
    console.log(`Amount: ${amount} Coins ($${(amount/10000).toFixed(2)})`);
    console.log(`Method: ${method}`);
    console.log(`Account: ${account}`);
    console.log("==========================================");
    
    // In a production environment, you would use nodemailer or a service like Resend here
    // to send an actual email to rajendarrana732@gmail.com
    
    res.json({ success: true, message: "Request received by admin" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
