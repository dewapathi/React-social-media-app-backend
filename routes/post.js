const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

//Create a post
router.post("/", async (req, res) => {
    const newPost = new Post(req.body);
    try {
        const savePost = await newPost.save();
        res.status(200).json(savePost);
    } catch (e) {
        res.status(500).json(e);
    }
});

//Update a post
router.put("/:id", async (req, res) => {
    const post = await Post.findById(req.params.id);
    try {
        if (post.userId === req.body.userId) {
            await post.updateOne({ $set: req.body });
            res.status(200).json("You can update only your post");
        } else {
            res.status(403).json("You can update only your post");
        }
    } catch (e) {
        res.status(500).json(e);
    }
});

//Delete a post
router.delete("/:id", async (req, res) => {
    const post = await Post.findById(req.params.id);
    try {
        if (post.userId === req.body.userId) {
            await post.deleteOne();
            res.status(200).json("The post has been deleted");
        } else {
            res.status(403).json("You can delete only your posts");
        }
    } catch (e) {
        res.status(500).json(e);
    }
});

//Like amd dislike a post
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.like.includes(req.body.userId)) {
            await post.updateOne({ $push: { like: req.body.userId } });
            res.status(200).json("The post has been liked!");
        } else {
            await post.updateOne({ $pull: { like: req.body.userId } });
            res.status(200).json("The post has been disliked!");
        }
    } catch (e) {
        res.status(500).json(e);
    }
});

//Get a post
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            res.status(404).json({ message: "No post found" });
        }
        res.status(200).json(post);
    } catch (e) {
        res.status(500).json(e);
    }
});

//Get timeline posts
router.get("/timeline/:userId", async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }
        const userPosts = await Post.find({ userId: currentUser._id });
        if (!userPosts) {
            return res.status(404).json({ message: "No posts for this user" })
        }
        const friendPosts = await Promise.all(
            currentUser.followings.map((freindId) => {
                return Post.find({ userId: freindId });
            })
        );
        res.status(200).json(userPosts.concat(...friendPosts));
    } catch (e) {
        res.status(500).json({ message: "Internal server error" });
    }
});

//get user's all posts
router.get("/profile/:username", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            res.status(400).json({ message: "User not found!" });
        }

        const posts = await Post.find({ userId: user._id });
        if (!posts) {
            res.status(400).json({ message: "User post not found" });
        }

        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;