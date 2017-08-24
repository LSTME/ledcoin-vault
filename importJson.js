const _ = require('lodash');
const fs = require('fs');
const { sequelize: db } = require('./models');

const filePath = process.argv[2];
if (!filePath || !fs.existsSync(filePath)) {
  throw new Error('Please specify import file path!');
}

const fileData = fs.readFileSync(filePath, 'utf8');
const { users, transactions } = JSON.parse(fileData.toString());

(async () => {
  console.log('Start');
  const t = await db.transaction();

  await db.models.bounty.destroy({ truncate: true, transaction: t });
  await db.models.transaction.destroy({ truncate: true, transaction: t });
  await db.models.user.destroy({ truncate: true, transaction: t });

  const importUsers = _.map(users, user => ({
    photo: user.photo,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    admin: user.admin,
    password: user.password,
    walletId: user.walletId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));

  await db.models.user.bulkCreate(importUsers, { transaction: t });

  const importTransactions = _.map(transactions, transaction => ({
    walletId: transaction.walletId,
    deltaCoin: transaction.deltaCoin,
    description: transaction.description,
    type: transaction.type,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  }));

  await db.models.transaction.bulkCreate(importTransactions, { transaction: t });

  console.log('Done');
  return t.commit();
})();
