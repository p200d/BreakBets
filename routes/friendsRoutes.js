const express = require('express');
const FriendsController = require('../controllers/FriendsController');

const router = express.Router();
const friends_controller = new FriendsController();

router.get('/', friends_controller.index.bind(friends_controller));
router.post('/', friends_controller.createPending.bind(friends_controller));
router.delete('/pending/delete/:username', friends_controller.deletePending.bind(friends_controller));
router.post('/pending/add/:username', friends_controller.addPending.bind(friends_controller));
router.delete('/delete/:username', friends_controller.deleteFriend.bind(friends_controller));
router.get('/messages/:username', friends_controller.getMessages.bind(friends_controller));
router.post('/messages/:username/:message', friends_controller.sendMessage.bind(friends_controller));
router.get('/user/:username/', friends_controller.userExists.bind(friends_controller));
router.get('/unreadPMs/', friends_controller.getUnreadPMs.bind(friends_controller));
router.get('/user/info/:username/', friends_controller.getUserInfo.bind(friends_controller));
router.post('/addUnread/:username/', friends_controller.addUnread.bind(friends_controller));
router.put('/markRead/:username/', friends_controller.deleteUnread.bind(friends_controller));

module.exports = router;