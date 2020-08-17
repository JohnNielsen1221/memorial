const router = require('express').Router();
const sequelize = require('../../config/connection');
const withAuth = require('../../utils/auth');
const { Post, User, Comment } = require("../../models");
const upload = require('../../utils/upload');
// get all posts
router.get('/', (req, res) => {
    Post.findAll({
      attributes: [
        'id',
        'title',
        'birthDate',
        'passingDate',
        'content',
        'avatar',
        'created_at',
      ],
      order: [['created_at', 'DESC']], 
      include: [
        {
          model: Comment,
          attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
          include: {
            model: User,
            attributes: ['username']
          }
        },
        {
          model: User,
          attributes: ['username']
      }]
    })
    .then(dbPostData => res.json(dbPostData))
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

// get one post
router.get('/:id', (req, res) => {
    Post.findOne({
      where: {
        id: req.params.id
      },
      attributes: [
        'id',
        'title',
        'birthDate',
        'passingDate',
        'content',
        'avatar',
        'created_at',
      ],
      include: [
        {
          model: Comment,
          attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
          include: {
            model: User,
            attributes: ['username']
          }
        },
        {
          model: User,
          attributes: ['username']
        }
      ]
    })
      .then(dbPostData => {
        if (!dbPostData) {
          res.status(404).json({ message: 'No post found with this id' });
          return;
        }
        res.json(dbPostData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
});

//create a post
router.post('/', withAuth, (req, res) => {
    Post.create({
      title: req.body.title,
      birthDate: req.body.birthDate,
      passingDate: req.body.passingDate,
      avatar: `https://inmemoriamphotos.s3.us-west-2.amazonaws.com/${req.file.key}`,
      content: req.body.content,  
      user_id: req.session.user_id
    })
      .then(dbPostData => {

        res.json(dbPostData)
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});
 
//new route for avatar http://s3.amazonaws.com/bucketname/filename
//update a post
router.put('/:id', withAuth, (req, res) => {
    Post.update(
      {
        title: req.body.title,
        birthDate: req.body.birthDate,
        passingDate: req.body.passingDate,
        avatar: `https://inmemoriamphotos.s3.us-west-2.amazonaws.com/${req.file.key}`,
        content: req.body.content,  
        user_id: req.session.user_id
      },
      {
        where: {
          id: req.params.id
        }
      }
    )
      .then(dbPostData => {
        if (!dbPostData) {
          res.status(404).json({ message: 'No post found with this id' });
          return;
        }
        res.json(dbPostData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

//delete a post
router.delete('/:id', withAuth, (req, res) => {
    Post.destroy({
      where: {
        id: req.params.id
      }
    })
      .then(dbPostData => {
        if (!dbPostData) {
          res.status(404).json({ message: 'No post found with this id' });
          return;
        }
        res.json(dbPostData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

module.exports = router;