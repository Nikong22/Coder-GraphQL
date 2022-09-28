const {faker} = require('@faker-js/faker');

faker.locale = 'es';

const get = () => ({
    name: faker.commerce.productName(),
    price: faker.commerce.price(),
    thumbnail: faker.internet.url(),
});

module.exports = {
    get
}