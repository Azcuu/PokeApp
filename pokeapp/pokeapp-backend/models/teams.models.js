import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorName: String,
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

teamSchema.index({ name: 'text', description: 'text', tags: 'text' });
teamSchema.index({ createdAt: -1 });

export const TeamModel = mongoose.model('Team', teamSchema);