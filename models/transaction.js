module.exports = (sequelize, DataTypes) => {
  const transaction = sequelize.define('transaction', {
    id: {
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
    },
    walletId: {
      type: DataTypes.INTEGER,
    },
    deltaCoin: {
      type: DataTypes.INTEGER,
    },
    description: {
      type: DataTypes.TEXT,
    },
    type: {
      type: DataTypes.STRING,
    },
    targetId: {
      type: DataTypes.INTEGER,
    },
  }, {
    getterMethods: {},
  });
  transaction.associate = (models) => {
    transaction.belongsTo(models.user, { foreignKey: 'walletId', targetKey: 'walletId' });
  };
  return transaction;
};
