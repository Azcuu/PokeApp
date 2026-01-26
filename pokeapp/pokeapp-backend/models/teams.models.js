import { mongodbInstance } from "../infraestructure/mongodb-connection.js";

const teamSchema = new mongodbInstance.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  pokemons: [{
    pokemonId: {
      type: Number,
      required: true
    },
    name: String,
    sprite: String
  }],
  creator: {
    type: mongodbInstance.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorName: String,
  tags: [String],
  likes: [{ type: mongodbInstance.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongodbInstance.Schema.Types.ObjectId, ref: 'User' }],
  comments: [
    {
      user: {
        type: mongodbInstance.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      text: {
        type: String,
        required: true,
        trim: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, {
  timestamps: true
});

// Índices para búsquedas rápidas
teamSchema.index({ name: 'text', description: 'text', tags: 'text' });
teamSchema.index({ createdAt: -1 });

export const TeamModel = mongodbInstance.model('Teams', teamSchema, 'Teams');
