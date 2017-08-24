module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.DataTypes.INTEGER,
      },
      walletId: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
      },
      deltaCoin: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
      },
      description: {
        type: Sequelize.DataTypes.TEXT,
      },
      type: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      targetId: {
        type: Sequelize.DataTypes.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE,
      },
    });
    await queryInterface.addIndex('transactions', ['walletId']);
    await queryInterface.addIndex('transactions', ['type']);
    await queryInterface.addIndex('transactions', ['targetId']);
    await queryInterface.addIndex('transactions', ['createdAt']);
    await queryInterface.addIndex('transactions', ['updatedAt']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('transactions', ['targetId']);
    await queryInterface.removeIndex('transactions', ['type']);
    await queryInterface.removeIndex('transactions', ['walletId']);
    await queryInterface.removeIndex('transactions', ['updatedAt']);
    await queryInterface.removeIndex('transactions', ['createdAt']);
    await queryInterface.dropTable('transactions');
  },
};
