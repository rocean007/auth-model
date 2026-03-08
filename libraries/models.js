import mongoose from 'mongoose';

// Job Schema - tracks each video generation attempt
const JobSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, enum: ['storytelling', 'dance', 'top5'], required: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  character: { type: String, default: '' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  youtubeUrl: { type: String, default: '' },
  youtubeId: { type: String, default: '' },
  error: { type: String, default: '' },
  scheduledFor: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

// Config Schema - stores dashboard settings
const ConfigSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now },
});

ConfigSchema.index({ userEmail: 1, key: 1 }, { unique: true });

// Analytics Schema - daily stats
const AnalyticsSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  videosGenerated: { type: Number, default: 0 },
  videosUploaded: { type: Number, default: 0 },
  failures: { type: Number, default: 0 },
  totalViews: { type: Number, default: 0 },
});

export const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);
export const Config = mongoose.models.Config || mongoose.model('Config', ConfigSchema);
export const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema);

