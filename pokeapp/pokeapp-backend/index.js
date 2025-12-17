import express from 'express';
import cors from 'cors';
import pokemonsRouter from './routes/pokemons.routes.js';
import teamsRouter from './routes/teams.routes.js';
import userRouter from './routes/user.routes.js';
import { connectToDatabase } from './infraestructure/mongodb-connection.js';

await connectToDatabase();

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.use('/pokemons', pokemonsRouter);
app.use('/teams', teamsRouter);
app.use('/user', userRouter);

app.listen(port, () => {
  console.log(`PokeApp backend running at http://localhost:${port}`);
});
