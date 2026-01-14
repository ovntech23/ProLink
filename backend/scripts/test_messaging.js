
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { sendMessage } = require('../controllers/messageController');
const { createGroupConversation } = require('../controllers/conversationController');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

const mockReq = (user, body, params = {}) => ({
    user,
    body,
    params,
    app: {
        get: (key) => {
            if (key === 'io') return { to: () => ({ emit: () => { } }), emit: () => { } }; // Mock io
        }
    }
});

const runTests = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // Cleanup previous test data if needed (optional, be careful)
        // await User.deleteMany({ email: /@test.com/ }); 

        // 1. Get or Create Users
        const getOrCreateUser = async (role) => {
            let user = await User.findOne({ email: `test_${role}@test.com` });
            if (!user) {
                user = await User.create({
                    name: `Test ${role}`,
                    email: `test_${role}@test.com`,
                    password: 'password123',
                    role
                });
            }
            return user;
        };

        const driver = await getOrCreateUser('driver');
        const owner = await getOrCreateUser('owner');
        const admin = await getOrCreateUser('admin');

        console.log(`Users ready: Driver(${driver._id}), Owner(${owner._id}), Admin(${admin._id})`);

        // 2. Test: Driver -> Owner (Should Fail)
        console.log('\n--- Test 1: Driver -> Owner (Direct) ---');
        let req = mockReq(driver, { recipientId: owner._id, content: 'Hello Owner' });
        let res = mockRes();
        await sendMessage(req, res);
        console.log(`Result: ${res.statusCode} ${res.statusCode === 403 ? '✅ PASS' : '❌ FAIL'}`);
        if (res.statusCode !== 403) console.log(res.data);


        // 3. Test: Driver -> Admin (Should Pass)
        console.log('\n--- Test 2: Driver -> Admin (Direct) ---');
        req = mockReq(driver, { recipientId: admin._id, content: 'Hello Admin' });
        res = mockRes();
        await sendMessage(req, res);
        console.log(`Result: ${res.statusCode} ${res.statusCode === 201 ? '✅ PASS' : '❌ FAIL'}`);
        if (res.statusCode !== 201) console.log(res.data);


        // 4. Test: Admin creates Group
        console.log('\n--- Test 3: Admin creates Group ---');
        req = mockReq(admin, {
            name: 'Test Group',
            participants: [driver._id, owner._id]
        });
        res = mockRes();
        await createGroupConversation(req, res);
        console.log(`Result: ${res.statusCode} ${res.statusCode === 201 ? '✅ PASS' : '❌ FAIL'}`);

        let groupConvId;
        if (res.statusCode === 201) {
            groupConvId = res.data.conversation._id;
            console.log('Group Created:', groupConvId);
        } else {
            console.log(res.data);
        }

        // 5. Test: Driver -> Group (Should Pass)
        if (groupConvId) {
            console.log('\n--- Test 4: Driver -> Group ---');
            req = mockReq(driver, { conversationId: groupConvId, content: 'Hello Group' });
            res = mockRes();
            await sendMessage(req, res);
            console.log(`Result: ${res.statusCode} ${res.statusCode === 201 ? '✅ PASS' : '❌ FAIL'}`);
            if (res.statusCode !== 201) console.log(res.data);
        }

        console.log('\nTests Completed.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

runTests();
