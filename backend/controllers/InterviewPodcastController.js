// Interview Podcast Controller
const InterviewPodcast = require('../models/InterviewPodcast');
const Activity = require('../models/Activity');

class InterviewPodcastController {
    constructor(pool) {
        this.podcastModel = new InterviewPodcast(pool);
        this.activityModel = new Activity(pool);
    }

    async createPodcast(req, res) {
        try {
            const userId = req.user.id;
            const podcast = await this.podcastModel.create(userId, req.body);

            await this.activityModel.create(userId, 'interview_podcast_created', {
                podcast_id: podcast.id,
                podcast_title: podcast.title
            });

            res.status(201).json(podcast);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getPodcast(req, res) {
        try {
            const podcast = await this.podcastModel.findById(req.params.id);

            if (!podcast) {
                return res.status(404).json({ error: 'Interview podcast not found' });
            }

            // Only return unpublished podcasts to the owner
            if (!podcast.is_published) {
                const userId = req.user && req.user.id;
                if (!userId || podcast.user_id !== userId) {
                    return res.status(404).json({ error: 'Interview podcast not found' });
                }
            }

            await this.podcastModel.incrementViewCount(podcast.id);

            res.json(podcast);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAllPodcasts(req, res) {
        try {
            const filters = {
                category: req.query.category,
                host: req.query.host,
                guest: req.query.guest
            };
            const podcasts = await this.podcastModel.findAll(filters);
            res.json(podcasts);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getUserPodcasts(req, res) {
        try {
            const userId = req.params.userId || req.user.id;
            const podcasts = await this.podcastModel.findByUserId(userId);
            res.json(podcasts);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updatePodcast(req, res) {
        try {
            const podcast = await this.podcastModel.findById(req.params.id);

            if (!podcast) {
                return res.status(404).json({ error: 'Interview podcast not found' });
            }

            if (podcast.user_id !== req.user.id) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const updated = await this.podcastModel.update(req.params.id, req.body);
            res.json(updated);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deletePodcast(req, res) {
        try {
            const podcast = await this.podcastModel.findById(req.params.id);

            if (!podcast) {
                return res.status(404).json({ error: 'Interview podcast not found' });
            }

            if (podcast.user_id !== req.user.id) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            await this.podcastModel.delete(req.params.id);
            res.json({ message: 'Interview podcast deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = InterviewPodcastController;
