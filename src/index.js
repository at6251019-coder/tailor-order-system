const request = require('supertest');
const app = require('../server');  // Assuming you export app from server.js
const { sequelize } = require('../server');  // Import your Sequelize instance

beforeAll(async () => {
    await sequelize.sync({ force: true });  // Reset DB for tests
});

afterAll(async () => {
    await sequelize.close();
});

describe('Product API', () => {
    test('GET /api/products returns products', async () => {
        const res = await request(app).get('/api/products');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('POST /api/products creates product (authenticated)', async () => {
        const token = 'fake-jwt-token';  // Mock token; in real tests, generate via login
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .field('name', 'Test Dress')
            .field('basePrice', '50.00');
        expect(res.statusCode).toBe(200);  // Should pass if auth is mocked
    });
});

describe('Order API', () => {
    test('POST /api/orders blocks if capacity full', async () => {
        // First, set capacity to 0 for a date
        await request(app).put('/api/capacity/2023-10-01').set('Authorization', 'Bearer fake-token').send({ maxCapacity: 0 });
        const res = await request(app).post('/api/orders').send({
            productId: 1,
            deliveryDate: '2023-10-01',
            totalAmount: 50
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('No available slots for this date');
    });
});
