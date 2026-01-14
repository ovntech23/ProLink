
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { getUsers } = require('../controllers/userController');
const User = require('../models/User');

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

const mockReq = (user) => ({
    user
});

const runTests = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // 1. Get or Create Users for Testing
        const getOrCreateUser = async (role) => {
            let user = await User.findOne({ email: `test_${role}_list@test.com` });
            if (!user) {
                user = await User.create({
                    name: `Test List ${role}`,
                    email: `test_${role}_list@test.com`,
                    password: 'password123',
                    role
                });
            }
            return user;
        };

        const driver = await getOrCreateUser('driver');
        const admin = await getOrCreateUser('admin');
        const broker = await getOrCreateUser('broker');
        const owner = await getOrCreateUser('owner'); // Just to ensure one exists

        console.log(`Test Users Ready.`);

        // 2. Test: Driver requests User List
        console.log('\n--- Test 1: Driver requests User List ---');
        let req = mockReq(driver);
        let res = mockRes();

        await getUsers(req, res);

        if (res.data && Array.isArray(res.data)) {
            const users = res.data;
            const disallowed = users.filter(u => ['driver', 'owner'].includes(u.role));
            const allowed = users.filter(u => ['admin', 'broker'].includes(u.role));

            console.log(`Total Users Returned: ${users.length}`);
            console.log(`Allowed (Admin/Broker): ${allowed.length}`);
            console.log(`Disallowed (Driver/Owner): ${disallowed.length}`);

            if (disallowed.length === 0 && allowed.length > 0) {
                console.log('✅ PASS: Only Admins/Brokers returned.');
            } else {
                console.log('❌ FAIL: List contains restricted roles or is empty.');
            }
        } else {
            console.log('❌ FAIL: Did not return an array.', res.data);
        }

        // 3. Test: Admin requests User List
        console.log('\n--- Test 2: Admin requests User List ---');
        req = mockReq(admin);
        res = mockRes();

        await getUsers(req, res);

        if (res.data && Array.isArray(res.data)) {
            const users = res.data;
            const drivers = users.filter(u => u.role === 'driver');
            const owners = users.filter(u => u.role === 'owner');

            console.log(`Total Users Returned: ${users.length}`);

            if (drivers.length > 0 && owners.length > 0) {
                console.log('✅ PASS: Admin sees Drivers and Owners.');
            } else {
                console.log('⚠️ WARNING: Admin did not see Drivers/Owners (maybe DB is empty of them besides test user?)');
                // In our case, we just created them, so they should be there.
                console.log(`Drivers found: ${drivers.length}, Owners found: ${owners.length}`);
            }
        } else {
            console.log('❌ FAIL: Did not return an array.', res.data);
        }

        console.log('\nTests Completed.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

runTests();
