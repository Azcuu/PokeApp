import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'pokemon-secret-key';

export function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.username = decoded.username;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
}