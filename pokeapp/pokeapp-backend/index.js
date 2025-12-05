import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import pokemonsRouter from './routes/pokemons.routes.js';
import teamsRouter from './routes/teams.routes.js';
import { connectToDatabase } from './infraestructure/mongodb-connection.js';

await connectToDatabase();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

app.use('/pokemons', pokemonsRouter);
app.use('/teams', teamsRouter);
    
app.listen(port, () => {
  console.log(`PokeApp backend running at http://localhost:${port}`);
});